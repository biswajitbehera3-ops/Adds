import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as E from "../src/domain/engine";
import { emptyData, type Data } from "../src/domain/types";

const SECRET = { salt: "x", hash: "y" };
// Wednesday 14 Oct 2026, 10:30 IST.
const NOW = new Date("2026-10-14T05:00:00.000Z");
// Engine defaults use the phone's clock; pin it to the test day so records are saved in time order.
beforeEach(() => vi.useFakeTimers({ now: NOW, toFake: ["Date"] }));
afterEach(() => vi.useRealTimers());

function setup() {
  let data: Data = emptyData();
  const run = <T,>(op: { data: Data; result: T }) => ((data = op.data), op.result);
  const imran = run(E.addStaff(data, { name: "Imran Khan", phone: "9811100001", chair: "Chair 1", secret: SECRET }));
  const sunita = run(E.addStaff(data, { name: "Sunita Devi", phone: "9811100002", chair: "Chair 2", secret: SECRET }));
  const aarav = run(E.createCustomer(data, { phone: "9876543210", name: "Aarav Sharma", consent: true }));
  const priya = run(E.createCustomer(data, { phone: "9876543211", name: "Priya Patel", consent: true }));
  const book = (customerId: string, day: string, time: string, staffId: string | null = imran.id, serviceIds = ["haircut"]) =>
    run(E.bookAppointment(data, { customerId, serviceIds, staffId, day, time, source: "WHATSAPP", note: "Yes, Saturday 5 pm", by: imran.id }, NOW));
  return { get data() { return data; }, run, imran, sunita, aarav, priya, book };
}

describe("appointments", () => {
  it("books from a WhatsApp reply and shows on the calendar with a confirmation message", () => {
    const s = setup();
    const a = s.book(s.aarav.id, "2026-10-17", "17:00");
    expect(a).toMatchObject({ status: "BOOKED", minutes: 30, source: "WHATSAPP", note: "Yes, Saturday 5 pm" });
    expect(E.appointmentMonth(s.data, "2026-10")).toEqual({ "2026-10-17": 1 });
    const day = E.appointmentsOn(s.data, "2026-10-17");
    expect(day[0]).toMatchObject({ time: "17:00", customerName: "Aarav Sharma", serviceNames: ["Haircut"], stylistName: "Imran Khan" });
    const msg = E.appointmentMessage(s.data, a.id, "confirm");
    expect(msg.phone).toBe("9876543210");
    expect(msg.message).toContain("Sat 17 Oct");
    expect(msg.message).toContain("5:00 PM");
    expect(msg.message).toContain("with Imran");
  });

  it("refuses closed days, outside hours, the past and taken slots", () => {
    const s = setup();
    expect(() => s.book(s.aarav.id, "2026-10-20", "12:00")).toThrow("closed"); // Tuesday
    expect(() => s.book(s.aarav.id, "2026-10-17", "19:45")).toThrow("between");
    expect(() => s.book(s.aarav.id, "2026-10-14", "10:00")).toThrow("passed");
    s.book(s.aarav.id, "2026-10-17", "17:00");
    expect(() => s.book(s.priya.id, "2026-10-17", "17:15")).toThrow("taken"); // same stylist, overlapping
    s.book(s.priya.id, "2026-10-17", "17:00", s.sunita.id); // another stylist is fine
    expect(() => s.book(s.priya.id, "2026-10-17", "18:00", null, ["hair-colour"])).not.toThrow();
  });

  it("lists free and taken slots for a stylist", () => {
    const s = setup();
    s.book(s.aarav.id, "2026-10-17", "17:00");
    const slots = E.appointmentSlots(s.data, "2026-10-17", { staffId: s.imran.id, minutes: 30 }, NOW);
    expect(slots[0]).toEqual({ time: "10:00", free: true });
    expect(slots.find((x) => x.time === "17:00")?.free).toBe(false);
    expect(slots.at(-1)?.time).toBe("19:30");
    expect(E.appointmentSlots(s.data, "2026-10-20", { staffId: null, minutes: 30 }, NOW)).toEqual([]);
  });

  it("lists today's reminders after the reminder time, once each", () => {
    const s = setup();
    const a = s.book(s.aarav.id, "2026-10-17", "17:00");
    const morning = new Date("2026-10-17T03:00:00.000Z"); // 08:30 IST, before 09:00
    const later = new Date("2026-10-17T04:00:00.000Z"); // 09:30 IST
    expect(E.appointmentRemindersDue(s.data, morning)).toEqual([]);
    expect(E.appointmentRemindersDue(s.data, later).map((x) => x.id)).toEqual([a.id]);
    expect(E.appointmentMessage(s.data, a.id, "reminder").message).toContain("today at 5:00 PM");
    s.run(E.markAppointmentReminded(s.data, { id: a.id, channel: "AUTO" }, later));
    expect(E.appointmentRemindersDue(s.data, later)).toEqual([]);
  });

  it("arrival opens the visit; cancel and no-show work; deletion removes bookings", () => {
    const s = setup();
    const a = s.book(s.aarav.id, "2026-10-17", "17:00");
    const at = new Date("2026-10-17T11:25:00.000Z");
    const r = s.run(E.appointmentArrived(s.data, { id: a.id, staffId: s.imran.id }, at));
    expect(r.visit).toMatchObject({ status: "OPEN", serviceIds: ["haircut"], staffId: s.imran.id });
    expect(r.appointment).toMatchObject({ status: "ARRIVED", visitId: r.visit.id });
    const b = s.book(s.priya.id, "2026-10-18", "12:00");
    expect(() => s.run(E.markNoShow(s.data, b.id, "owner", at))).toThrow("hasn't come");
    s.run(E.cancelAppointment(s.data, b.id, "owner", at));
    expect(E.appointmentMonth(s.data, "2026-10")).toEqual({ "2026-10-17": 1 });
    s.run(E.deleteCustomer(s.data, { customerId: s.priya.id, by: "owner" }));
    expect(s.data.appointments.some((x) => x.customerId === s.priya.id)).toBe(false);
  });

  it("measures how full each day is, for one stylist or the whole salon", () => {
    const s = setup();
    s.book(s.aarav.id, "2026-10-17", "10:00", s.imran.id, ["hair-colour"]); // 90 min
    s.book(s.priya.id, "2026-10-17", "12:00", s.sunita.id);
    const cancelled = s.book(s.priya.id, "2026-10-18", "12:00");
    s.run(E.cancelAppointment(s.data, cancelled.id, "owner", NOW));
    const mine = E.appointmentLoad(s.data, "2026-10", s.imran.id);
    expect(mine).toEqual({ "2026-10-17": { count: 1, minutes: 90, load: 90 / 600 } });
    const salon = E.appointmentLoad(s.data, "2026-10", null);
    expect(salon["2026-10-17"]).toEqual({ count: 2, minutes: 120, load: 120 / 1200 });
    expect(salon["2026-10-18"]).toBeUndefined();
  });
});
