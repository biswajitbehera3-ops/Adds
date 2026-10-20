/**
 * Owner-side customer views (BUILD-SPEC 6.7): the Top spenders ranking and a single bill.
 * Pure functions over Data, like the engine.
 */
import config from "../config/salon";
import { istDate } from "./rules";
import type { Data, Visit } from "./types";

export type SpendPeriod = "all" | "year" | "3m";

const paid = (v: Visit) => v.status === "PAID";
const at = (v: Visit) => v.paidAt ?? v.createdAt;

/** Start of the period as an IST day "YYYY-MM-DD", or null for all time. */
function periodStart(period: SpendPeriod, now: Date): string | null {
  if (period === "all") return null;
  const today = istDate(now);
  if (period === "year") return `${today.slice(0, 4)}-01-01`;
  const [y, m, d] = today.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 - 3, d)).toISOString().slice(0, 10);
}

/**
 * The salon's best customers by money spent in the period, highest first: visits, the stylist
 * who served them most, and what share of all earnings in the period the top group brought in.
 * Cancelled bills don't count.
 */
export function topSpenders(data: Data, { take = 20, period = "all" }: { take?: number; period?: SpendPeriod } = {}, now = new Date()) {
  const from = periodStart(period, now);
  const per = new Map<string, { spent: number; visits: number; staff: Map<string, number> }>();
  let earnings = 0;
  for (const v of data.visits) {
    if (!paid(v) || (from && istDate(at(v)) < from)) continue;
    earnings += v.total;
    const p = per.get(v.customerId) ?? { spent: 0, visits: 0, staff: new Map<string, number>() };
    p.spent += v.total;
    p.visits++;
    p.staff.set(v.staffId, (p.staff.get(v.staffId) ?? 0) + 1);
    per.set(v.customerId, p);
  }
  const byId = new Map(data.customers.map((c) => [c.id, c]));
  const staffName = new Map(data.staff.map((s) => [s.id, s.name]));
  const rows = [...per.entries()]
    .flatMap(([id, p]) => {
      const c = byId.get(id);
      if (!c) return [];
      const main = [...p.staff.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      return [{ id, name: c.name, spent: p.spent, visits: p.visits, mainStylist: main ? (staffName.get(main) ?? null) : null }];
    })
    .sort((a, b) => b.spent - a.spent || a.name.localeCompare(b.name))
    .slice(0, take);
  const total = rows.reduce((s, r) => s + r.spent, 0);
  return { rows, total, earnings, share: earnings ? total / earnings : 0 };
}

/** One bill, laid out for the bill screen: items with prices, how it was paid, any referral reward. */
export function billOf(data: Data, visitId: string) {
  const visit = data.visits.find((v) => v.id === visitId);
  if (!visit) return null;
  const items = [
    ...visit.serviceIds.map((id) => {
      const s = config.services.find((x) => x.id === id);
      return { name: s?.name ?? id, price: s?.price ?? 0, addOn: false };
    }),
    ...visit.addOnIds.map((id) => {
      const a = config.addOns.find((x) => x.id === id);
      return { name: a?.name ?? id, price: a?.price ?? 0, addOn: true };
    }),
  ];
  const rewards = data.walletTxs.filter((t) => t.visitId === visit.id && t.type === "REFERRAL_REWARD");
  const reward = rewards.reduce((s, t) => s + t.amount, 0);
  const rewardTo = rewards.length ? (data.customers.find((c) => c.id === rewards[0].customerId)?.name ?? null) : null;
  // Bills are numbered in the order customers walked in, from 1001.
  const order = [...data.visits].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  return {
    visit,
    number: 1001 + order.findIndex((v) => v.id === visit.id),
    customer: data.customers.find((c) => c.id === visit.customerId) ?? null,
    stylist: data.staff.find((s) => s.id === visit.staffId) ?? null,
    items,
    reward,
    rewardTo,
  };
}
