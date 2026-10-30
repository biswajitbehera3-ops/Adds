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
  const rakesh = run(E.addStaff(data, { name: "Rakesh Kumar", phone: "9811100003", chair: "Chair 3", secret: SECRET }));
  const aarav = run(E.createCustomer(data, { phone: "9876543210", name: "Aarav Sharma", consent: true }));
  const priya = run(E.createCustomer(data, { phone: "9876543211", name: "Priya Patel", consent: true }));
  const book = (customerId: string, day: string, time: string, staffId: string) =>
    run(E.bookAppointment(data, { customerId, serviceIds: ["haircut"], staffId, day, time, source: "PHONE", by: staffId }, NOW));
  return { get data() { return data; }, run, imran, rakesh, aarav, priya, book };
}

describe("leave", () => {
  it("counts working days without the weekly off and refuses bad requests", () => {
    expect(E.leaveWorkingDays("2026-10-26", "2026-10-27")).toBe(1); // Mon + Tue (closed)
    expect(E.leaveWorkingDays("2026-10-22", "2026-10-22", true)).toBe(0.5);
    const s = setup();
    const ask = (from: string, to: string, extra: object = {}) => E.requestLeave(s.data, { staffId: s.imran.id, from, to, type: "CASUAL", ...extra }, NOW);
    expect(() => ask("2026-10-13", "2026-10-13")).toThrow("past");
    expect(() => ask("2026-10-27", "2026-10-26")).toThrow("before the first");
    expect(() => ask("2026-10-20", "2026-10-20")).toThrow("weekly off");
    expect(() => ask("2026-10-22", "2026-10-23", { halfDay: true })).toThrow("single day");
    s.run(ask("2026-10-26", "2026-10-27", { note: "Family function" }));
    expect(() => s.run(ask("2026-10-27", "2026-10-28"))).toThrow("already asked");
    expect(E.leaveRequestsWaiting(s.data)).toHaveLength(1);
  });

  it("approving moves the stylist's bookings, blocks booking them, notifies them and marks attendance", () => {
    const s = setup();
    const a1 = s.book(s.aarav.id, "2026-10-26", "11:00", s.imran.id);
    const a2 = s.book(s.priya.id, "2026-10-26", "15:00", s.imran.id);
    s.book(s.priya.id, "2026-10-26", "11:00", s.rakesh.id); // Rakesh is busy at 11:00 only
    const l = s.run(E.requestLeave(s.data, { staffId: s.imran.id, from: "2026-10-26", to: "2026-10-27", type: "CASUAL" }, NOW));
    const impact = E.leaveImpact(s.data, l.id);
    expect(impact).toMatchObject({ workingDays: 1, working: ["Rakesh Kumar"], alsoOff: [] });
    expect(impact.bookings.map((b) => b.time)).toEqual(["11:00", "15:00"]);

    const r = s.run(E.approveLeave(s.data, { id: l.id, bookings: "REASSIGN" }, NOW));
    // 15:00 goes to Rakesh; at 11:00 he is busy, so that one is cancelled for rebooking.
    expect(r.moved.map((m) => [m.appointmentId, m.toStylist])).toEqual([[a2.id, "Rakesh Kumar"]]);
    expect(r.moved[0].message).toContain("Imran is on leave on Mon 26 Oct, so Rakesh will do your haircut at 3:00 PM");
    expect(r.cancelled.map((c) => c.appointmentId)).toEqual([a1.id]);
    expect(s.data.appointments.find((a) => a.id === a1.id)?.status).toBe("CANCELLED");

    // Nobody can book Imran that day, and "anyone free" counts only Rakesh.
    expect(() => s.book(s.aarav.id, "2026-10-26", "17:00", s.imran.id)).toThrow("Imran is on leave");
    expect(E.appointmentSlots(s.data, "2026-10-26", { staffId: s.imran.id, minutes: 30 }, NOW).every((x) => !x.free)).toBe(true);

    // The notification waits until Imran has seen it.
    expect(E.leaveUpdates(s.data, s.imran.id).map((x) => x.status)).toEqual(["APPROVED"]);
    s.run(E.markLeaveSeen(s.data, s.imran.id, NOW));
    expect(E.leaveUpdates(s.data, s.imran.id)).toEqual([]);

    // Attendance: leave, not absent; the weekly off is "off".
    const att = E.myAttendance(s.data, s.imran.id, "2026-10", new Date("2026-10-28T08:00:00Z"));
    expect(att.cells.find((c) => c.date === "2026-10-26")?.kind).toBe("leave");
    expect(att.cells.find((c) => c.date === "2026-10-27")?.kind).toBe("off");
    const sheet = E.attendanceSheets(s.data, "2026-10", new Date("2026-10-28T08:00:00Z"));
    expect(sheet[0].rows[0]).toContain("Days on leave");
    expect(sheet.find((x) => x.name === "2026-10-26")!.rows[1][3]).toBe("Leave");
    expect(sheet.find((x) => x.name === "2026-10-27")!.rows[1][3]).toBe("Weekly off");
    expect(E.myLeave(s.data, s.imran.id, NOW)).toMatchObject({ takenThisYear: 1, waiting: 0 });
    expect(E.myLeave(s.data, s.imran.id, NOW).next?.from).toBe("2026-10-26");
  });

  it("declines with a reason, and only waiting requests can be withdrawn or answered", () => {
    const s = setup();
    const l = s.run(E.requestLeave(s.data, { staffId: s.imran.id, from: "2026-10-31", to: "2026-10-31", type: "OTHER" }, NOW));
    expect(() => E.declineLeave(s.data, { id: l.id, reason: " " })).toThrow("reason");
    s.run(E.declineLeave(s.data, { id: l.id, reason: "Saturday is our busiest day" }, NOW));
    expect(() => E.approveLeave(s.data, { id: l.id, bookings: "REBOOK" })).toThrow("already been answered");
    expect(() => E.withdrawLeave(s.data, { id: l.id, staffId: s.imran.id })).toThrow("still waiting");
    expect(E.leaveUpdates(s.data, s.imran.id)[0]).toMatchObject({ status: "DECLINED", reason: "Saturday is our busiest day" });
    const w = s.run(E.requestLeave(s.data, { staffId: s.imran.id, from: "2026-10-30", to: "2026-10-30", type: "CASUAL" }, NOW));
    expect(s.run(E.withdrawLeave(s.data, { id: w.id, staffId: s.imran.id })).status).toBe("WITHDRAWN");
  });
});
