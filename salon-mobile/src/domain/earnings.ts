/**
 * The owner's Earnings tab (BUILD-SPEC 6.3). Earnings are paid visit totals (wallet spend
 * included, wallet top-ups not), counted on the IST day they were paid, as ownerDashboard does.
 */
import config from "../config/salon";
import { addDays, addMonths, dayNum, dayOfWeek, isClosed, MONTHS, WEEKDAYS } from "./calendar";
import { istDate, istMinutes } from "./rules";
import type { Data, Visit } from "./types";

export type Period = "day" | "week" | "month";

type Paid = { v: Visit; day: string; min: number };

function paidVisits(data: Data, staffId?: string): Paid[] {
  return data.visits
    .filter((v) => v.status === "PAID" && (!staffId || v.staffId === staffId))
    .map((v) => {
      const when = v.paidAt ?? v.createdAt;
      return { v, day: istDate(when), min: istMinutes(when) };
    });
}

const sum = (list: Paid[]) => list.reduce((s, p) => s + p.v.total, 0);
const between = (list: Paid[], from: string, to: string, upToMin = Infinity) => list.filter((p) => p.day >= from && p.day <= to && (p.day !== to || p.min <= upToMin));
const daysIn = (month: string) => dayNum(addDays(`${addMonths(month, 1)}-01`, -1));
const mon = (month: string) => MONTHS[Number(month.slice(5, 7)) - 1].slice(0, 3);
const wd = (day: string) => WEEKDAYS[dayOfWeek(day)].slice(0, 3);
const clockOf = (min: number) => {
  const h = Math.floor(min / 60);
  return `${((h + 11) % 12) + 1}:${String(min % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/** Short money for chart labels: ₹6.8k, ₹1.06L. */
export function shortInr(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `₹${Math.round(n)}`;
}

/** Whole-number change, or null when there is nothing to compare with. */
export function change(now: number, before: number): number | null {
  return before > 0 ? Math.round(((now - before) / before) * 100) : null;
}

/** The current period and the one it is compared with, as day ranges (the last day cut at `upTo` minutes). */
function ranges(p: Period, now: Date) {
  const today = istDate(now);
  const min = istMinutes(now);
  if (p === "day") {
    const last = addDays(today, -7);
    return { cur: [today, today] as const, prev: [last, last] as const, upTo: min, label: "Today so far", prevLabel: `Last ${wd(last)} by ${clockOf(min)}`, cmpWord: `vs last ${wd(last)}` };
  }
  if (p === "week") return { cur: [addDays(today, -6), today] as const, prev: [addDays(today, -13), addDays(today, -7)] as const, upTo: Infinity, label: "Last 7 days", prevLabel: "Previous 7 days", cmpWord: "vs previous 7 days" };
  const month = today.slice(0, 7);
  const pm = addMonths(month, -1);
  const d = dayNum(today);
  const pd = Math.min(d, daysIn(pm));
  return {
    cur: [`${month}-01`, today] as const,
    prev: [`${pm}-01`, `${pm}-${String(pd).padStart(2, "0")}`] as const,
    upTo: Infinity,
    label: `${MONTHS[Number(month.slice(5)) - 1]} 1–${d}`,
    prevLabel: `${MONTHS[Number(pm.slice(5)) - 1]} 1–${pd}`,
    cmpWord: `vs ${mon(pm)} 1–${pd}`,
  };
}

export type Trend = { labels: string[]; vals: number[]; prevIdx: number | null; note: string; outline: number | null };

function trend(list: Paid[], p: Period, now: Date): Trend {
  const today = istDate(now);
  if (p === "day") {
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
    const vals = days.map((d) => sum(between(list, d, d)));
    const closed = days.filter((d, i) => isClosed(d) && vals[i] === 0).map(wd);
    return { labels: days.map((d) => wd(d).slice(0, 2)), vals, prevIdx: null, note: `Last 7 days${closed.length ? ` · ${closed.join(", ")} closed` : ""}`, outline: null };
  }
  if (p === "week") {
    const starts = Array.from({ length: 8 }, (_, i) => addDays(today, (i - 7) * 7 - 6));
    return { labels: starts.map((s, i) => (i === 7 ? "Now" : `${dayNum(s)} ${mon(s.slice(0, 7))}`)), vals: starts.map((s) => sum(between(list, s, addDays(s, 6)))), prevIdx: 6, note: "Last 8 weeks", outline: null };
  }
  const month = today.slice(0, 7);
  const months = Array.from({ length: 6 }, (_, i) => addMonths(month, i - 5));
  const vals = months.map((m) => sum(between(list, `${m}-01`, `${m}-31`)));
  return { labels: months.map(mon), vals, prevIdx: 4, note: `Last 6 months · ${MONTHS[Number(month.slice(5)) - 1]} so far`, outline: vals[4] };
}

export type StylistRow = { staffId: string; name: string; index: number; customers: number; earned: number; prev: number };
export type PeriodSummary = { period: Period; label: string; prevLabel: string; cmpWord: string; total: number; prev: number; staff: StylistRow[]; trend: Trend };

/** Today / 7 days / Month for the whole salon, each with its stylists and its trend. */
export function earningsOverview(data: Data, now = new Date()): Record<Period, PeriodSummary> {
  const all = paidVisits(data);
  const one = (p: Period): PeriodSummary => {
    const r = ranges(p, now);
    const cur = between(all, r.cur[0], r.cur[1]);
    const prev = between(all, r.prev[0], r.prev[1], r.upTo);
    const staff = data.staff
      .map((s, index) => {
        const mine = cur.filter((x) => x.v.staffId === s.id);
        return { staffId: s.id, name: s.name, index, customers: mine.length, earned: sum(mine), prev: sum(prev.filter((x) => x.v.staffId === s.id)), active: s.active };
      })
      .filter((s) => s.active || s.earned > 0)
      .map(({ active: _a, ...s }) => s)
      .sort((a, b) => b.earned - a.earned);
    return { period: p, label: r.label, prevLabel: r.prevLabel, cmpWord: r.cmpWord, total: sum(cur), prev: sum(prev), staff, trend: trend(all, p, now) };
  };
  return { day: one("day"), week: one("week"), month: one("month") };
}

/** The weeks of a month as the owner reads them: 1–7, 8–14, 15–21, 22–28, 29–end. */
function monthWeeks(month: string) {
  const len = daysIn(month);
  const out: { from: number; to: number }[] = [];
  for (let f = 1; f <= len; f += 7) out.push({ from: f, to: Math.min(f + 6, len) });
  return out;
}
const dayStr = (month: string, d: number) => `${month}-${String(d).padStart(2, "0")}`;

export type LineSeries = {
  title: string;
  unit: "day" | "week" | "month";
  labels: string[];
  /** null = closed day or a week still to come. */
  vals: (number | null)[];
  closed: number[];
  /** Index of the period still running ("so far"). */
  partial: number;
  /** Last month's weeks, dashed behind (Week only). */
  ghost: (number | null)[] | null;
  ghostName: string | null;
  /** Dashed average line (Day and Month). */
  avg: number | null;
  /** Best month, labelled (Month only). */
  best: number | null;
};

/** The stylist page's line graph, following its Day / Week / Month switch. */
export function stylistSeries(data: Data, staffId: string, p: Period, now = new Date()): LineSeries {
  const list = paidVisits(data, staffId);
  const today = istDate(now);
  const staff = data.staff.find((s) => s.id === staffId);
  const off = (d: string) => (staff?.weeklyOff != null ? dayOfWeek(d) === staff.weeklyOff : isClosed(d));
  const avgOf = (xs: (number | null)[], skip: number, drop0 = false) => {
    const full = xs.filter((x, i): x is number => x !== null && i !== skip && (!drop0 || x > 0));
    return full.length ? full.reduce((a, b) => a + b, 0) / full.length : null;
  };
  if (p === "day") {
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
    const vals = days.map((d) => {
      const e = sum(between(list, d, d));
      return off(d) && e === 0 ? null : e;
    });
    const closed = vals.flatMap((v, i) => (v === null ? [i] : []));
    return { title: "Last 7 days", unit: "day", labels: days.map((d, i) => (i === 6 ? "Today" : `${wd(d)} ${dayNum(d)}`)), vals, closed, partial: 6, ghost: null, ghostName: null, avg: avgOf(vals, 6), best: null };
  }
  if (p === "week") {
    const month = today.slice(0, 7);
    const pm = addMonths(month, -1);
    const pl = daysIn(pm);
    const weeks = monthWeeks(month);
    const t = dayNum(today);
    const vals = weeks.map((w) => (w.from > t ? null : sum(between(list, dayStr(month, w.from), dayStr(month, Math.min(w.to, t))))));
    const ghost = weeks.map((w) => (w.from > pl ? null : sum(between(list, dayStr(pm, w.from), dayStr(pm, Math.min(w.to, pl))))));
    return { title: `Weeks of ${MONTHS[Number(month.slice(5)) - 1]}`, unit: "week", labels: weeks.map((w) => `${w.from}–${w.to}`), vals, closed: [], partial: weeks.findIndex((w) => t >= w.from && t <= w.to), ghost, ghostName: MONTHS[Number(pm.slice(5)) - 1], avg: null, best: null };
  }
  const month = today.slice(0, 7);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(month, i - 11));
  const vals = months.map((m) => sum(between(list, `${m}-01`, `${m}-31`)));
  const best = Math.max(...vals);
  return { title: "Last 12 months", unit: "month", labels: months.map((m) => mon(m).slice(0, 1)), vals, closed: [], partial: 11, ghost: null, ghostName: null, avg: avgOf(vals, 11, true), best: best > 0 ? vals.indexOf(best) : null };
}

const serviceName = (id: string) => config.services.find((s) => s.id === id)?.name ?? id;
const addOnName = (id: string) => config.addOns.find((a) => a.id === id)?.name ?? id;

/** How the customer paid, as the owner reads it: Cash, UPI, Card, Wallet, or Wallet + UPI. */
export function paidBy(v: Visit): string {
  const direct = v.paymentMethod === "CASH" ? "Cash" : v.paymentMethod === "CARD" ? "Card" : "UPI";
  if (v.walletPaid > 0 && v.directPaid > 0) return `Wallet + ${direct}`;
  if (v.walletPaid > 0) return "Wallet";
  return direct;
}

export type CustomerLine = { visitId: string; time: string; name: string; services: string; amount: number; method: string };
export type SumLine = { label: string; customers: number; earned: number; closed: boolean };
export type StylistPeriod = {
  label: string;
  total: number;
  prev: number;
  cmpWord: string;
  /** Week only: "This week (8–14 Oct) vs the same week in September (8–14 Sep)". */
  note: string | null;
  customers: number;
  list: { kind: "customers"; rows: CustomerLine[] } | { kind: "sums"; title: string; rows: SumLine[] };
  topServices: string[];
};

/** The stylist page's numbers and list for Day (today), Week (this week of the month) or Month (so far). */
export function stylistPeriod(data: Data, staffId: string, p: Period, now = new Date()): StylistPeriod {
  const list = paidVisits(data, staffId);
  const today = istDate(now);
  const month = today.slice(0, 7);
  const pm = addMonths(month, -1);
  const pl = daysIn(pm);
  const t = dayNum(today);
  const byId = new Map(data.customers.map((c) => [c.id, c.name]));
  const staff = data.staff.find((s) => s.id === staffId);
  const off = (d: string) => (staff?.weeklyOff != null ? dayOfWeek(d) === staff.weeklyOff : isClosed(d));
  const tops = (xs: Paid[]) => {
    const n = new Map<string, number>();
    for (const x of xs) for (const id of x.v.serviceIds) n.set(id, (n.get(id) ?? 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => serviceName(id));
  };
  const dayLine = (d: string): SumLine => {
    const xs = between(list, d, d);
    return { label: `${wd(d)} ${dayNum(d)} ${mon(d.slice(0, 7))}`, customers: xs.length, earned: sum(xs), closed: xs.length === 0 && off(d) };
  };

  if (p === "day") {
    const r = ranges("day", now);
    const cur = between(list, today, today).sort((a, b) => a.min - b.min);
    return {
      label: r.label,
      total: sum(cur),
      prev: sum(between(list, r.prev[0], r.prev[1], r.upTo)),
      cmpWord: r.cmpWord,
      note: null,
      customers: cur.length,
      list: {
        kind: "customers",
        rows: cur.map((x) => ({ visitId: x.v.id, time: clockOf(x.min).replace(/ (AM|PM)$/, ""), name: byId.get(x.v.customerId) ?? "Deleted customer", services: [...x.v.serviceIds.map(serviceName), ...x.v.addOnIds.map(addOnName)].join(" + "), amount: x.v.total, method: paidBy(x.v) })),
      },
      topServices: tops(cur),
    };
  }
  if (p === "week") {
    const w = monthWeeks(month).find((x) => t >= x.from && t <= x.to)!;
    const cur = between(list, dayStr(month, w.from), today);
    const pTo = Math.min(t, pl);
    const prev = w.from > pl ? [] : between(list, dayStr(pm, w.from), dayStr(pm, pTo));
    const pmName = MONTHS[Number(pm.slice(5)) - 1];
    const days = Array.from({ length: t - w.from + 1 }, (_, i) => dayStr(month, t - i));
    return {
      label: `${w.from}–${w.to} ${mon(month)}`,
      total: sum(cur),
      prev: sum(prev),
      cmpWord: `vs ${pmName}`,
      note: `This week (${w.from}–${w.to} ${mon(month)}) vs the same week in ${pmName} (${w.from}–${Math.min(w.to, pl)} ${mon(pm)})`,
      customers: cur.length,
      list: { kind: "sums", title: "Day by day", rows: days.map(dayLine) },
      topServices: tops(cur),
    };
  }
  const r = ranges("month", now);
  const cur = between(list, r.cur[0], r.cur[1]);
  const weeks = monthWeeks(month).filter((w) => w.from <= t).reverse();
  return {
    label: r.label,
    total: sum(cur),
    prev: sum(between(list, r.prev[0], r.prev[1])),
    cmpWord: r.cmpWord,
    note: null,
    customers: cur.length,
    list: {
      kind: "sums",
      title: "Week by week",
      rows: weeks.map((w) => {
        const xs = between(list, dayStr(month, w.from), dayStr(month, Math.min(w.to, t)));
        return { label: `${w.from}–${w.to} ${mon(month)}`, customers: xs.length, earned: sum(xs), closed: false };
      }),
    },
    topServices: tops(cur),
  };
}
