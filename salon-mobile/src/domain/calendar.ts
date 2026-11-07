/**
 * Calendar arithmetic on salon-local day strings ("YYYY-MM-DD"), shared by the Calendar
 * screen and the booking sheet. Pure, so it is tested without a phone.
 */
import config from "../config/salon";
import type { Data } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const utc = (day: string) => Date.parse(`${day}T00:00:00Z`);
export const addDays = (day: string, n: number) => new Date(utc(day) + n * DAY_MS).toISOString().slice(0, 10);
export const dayOfWeek = (day: string) => new Date(utc(day)).getUTCDay();
export const dayNum = (day: string) => Number(day.slice(8, 10));
export const isClosed = (day: string) => config.appointments.closedDays.includes(dayOfWeek(day));

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export const monthName = (month: string) => `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;

/** The month as a Monday-first grid: blank cells before day 1, then every day. */
export function monthGrid(month: string): { lead: number; days: string[]; rows: number } {
  const first = `${month}-01`;
  const lead = (dayOfWeek(first) + 6) % 7;
  const days: string[] = [];
  for (let d = first; d.startsWith(month); d = addDays(d, 1)) days.push(d);
  return { lead, days, rows: Math.ceil((lead + days.length) / 7) };
}

/** Monday to Sunday of the week holding `day`. */
export function weekOf(day: string): string[] {
  const monday = addDays(day, -((dayOfWeek(day) + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** "17:30" → { time: "5:30", ampm: "PM" }. */
export function clock(hhmm: string): { time: string; ampm: string } {
  const [h, m] = hhmm.split(":").map(Number);
  return { time: `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`, ampm: h < 12 ? "AM" : "PM" };
}

export const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Minutes past midnight in the salon's time zone (IST). */
export function salonMinutesNow(now = new Date()): number {
  const local = new Date(now.getTime() + 330 * 60000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

/** "Sat 17 Oct". */
export function shortDay(day: string): string {
  return `${WEEKDAYS[dayOfWeek(day)].slice(0, 3)} ${dayNum(day)} ${MONTHS[Number(day.slice(5, 7)) - 1].slice(0, 3)}`;
}

export type BookingState = "booked" | "late" | "inchair" | "done" | "noshow";

/** What a booking looks like right now: the visit it opened decides "In chair" or "Done". */
export function bookingState(data: Data, a: { status: string; at: string; visitId: string | null }, now = new Date()): BookingState {
  if (a.status === "NO_SHOW") return "noshow";
  if (a.status === "ARRIVED") {
    const visit = a.visitId ? data.visits.find((v) => v.id === a.visitId) : null;
    return visit?.status === "OPEN" ? "inchair" : "done";
  }
  return Date.parse(a.at) <= now.getTime() ? "late" : "booked";
}
