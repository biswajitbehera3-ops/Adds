/**
 * The owner's Live floor (BUILD-SPEC 6.2, 10.8, 10.10): who is in each chair right now,
 * built only from real records. A customer is in the chair from Start visit (or Arrived)
 * until payment; a stylist on leave or on the weekly off shows "Off today".
 */
import config from "../config/salon";
import { isClosed } from "./calendar";
import * as E from "./engine";
import { istDate, startOfIstDay } from "./rules";
import type { Data, Staff, Visit } from "./types";

export type ChairState = "busy" | "free" | "notIn" | "off";

export type Chair = {
  staff: Staff;
  state: ChairState;
  /** Why the chair is off: leave, or the weekly off. */
  offReason: "leave" | "weeklyOff" | null;
  late: boolean;
  visit: Visit | null;
  customerName: string;
  services: string;
  amount: number;
  minutesDone: number;
  minutesTotal: number;
  /** The stylist's next booking today, for a free chair. */
  next: { name: string; time: string } | null;
};

const minutesOf = (ids: string[]) => ids.reduce((s, id) => s + (config.services.find((x) => x.id === id)?.minutes ?? 0), 0);

export function liveFloor(data: Data, now = new Date()) {
  const today = istDate(now);
  const closed = isClosed(today);
  const nowIso = now.toISOString();
  const todayStart = startOfIstDay(now).toISOString();
  const bookings = E.appointmentsOn(data, today).filter((a) => a.status === "BOOKED" && a.at >= nowIso);
  const chairs: Chair[] = data.staff
    .filter((s) => s.active)
    .sort((a, b) => a.chair.localeCompare(b.chair, undefined, { numeric: true }))
    .map((s) => {
      const visit = data.visits.filter((v) => v.staffId === s.id && v.status === "OPEN").sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0] ?? null;
      const rec = data.attendance.find((a) => a.staffId === s.id && a.date === today) ?? null;
      const leave = E.leaveOn(data, s.id, today);
      const weeklyOff = E.staffOff(s, today);
      const offReason = leave ? "leave" : weeklyOff ? "weeklyOff" : null;
      const state: ChairState = visit ? "busy" : offReason ? "off" : rec ? "free" : "notIn";
      const customer = visit ? data.customers.find((c) => c.id === visit.customerId) : null;
      const total = visit ? minutesOf([...visit.serviceIds, ...visit.addOnIds]) || 30 : 0;
      const done = visit ? Math.max(0, (now.getTime() - Date.parse(visit.createdAt)) / 60000) : 0;
      const nb = bookings.find((b) => b.staffId === s.id);
      return {
        staff: s,
        state,
        offReason,
        late: rec ? E.staffLate(s, rec.checkInAt) : false,
        visit,
        customerName: customer?.name ?? "",
        services: visit ? [...visit.serviceIds, ...visit.addOnIds].map((id) => config.services.find((x) => x.id === id)?.name ?? id).join(" + ") : "",
        amount: visit?.total ?? 0,
        minutesDone: Math.min(done, total),
        minutesTotal: total,
        next: nb ? { name: nb.customerName, time: nb.time } : null,
      };
    });
  const paidToday = data.visits.filter((v) => v.status === "PAID" && (v.paidAt ?? v.createdAt) >= todayStart);
  return {
    today,
    closed: closed && chairs.every((c) => c.state === "off"),
    chairs,
    busy: chairs.filter((c) => c.state === "busy").length,
    working: chairs.filter((c) => c.state !== "off").length,
    total: paidToday.reduce((s, v) => s + v.total, 0),
    visits: paidToday.length,
  };
}
