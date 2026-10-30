import config from "@config";
import { db } from "./db";
import { startOfIstDay } from "./rules";

const DAY_MS = 24 * 60 * 60 * 1000;

export type Range = "today" | "7d" | "30d";

export async function ownerDashboard(range: Range = "today", now = new Date()) {
  const todayStart = startOfIstDay(now);
  const rangeStart =
    range === "today" ? todayStart : new Date(todayStart.getTime() - (range === "7d" ? 6 : 29) * DAY_MS);

  const [todayByMethod, todayWallet, byStaff, topSpend, liability] = await Promise.all([
    db.visit.groupBy({
      by: ["paymentMethod"],
      where: { createdAt: { gte: todayStart } },
      _sum: { directPaid: true },
    }),
    db.visit.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { walletPaid: true, total: true },
      _count: true,
    }),
    db.visit.groupBy({
      by: ["staffId"],
      where: { createdAt: { gte: rangeStart } },
      _sum: { total: true },
      _count: true,
    }),
    db.visit.groupBy({
      by: ["customerId"],
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: "desc" } },
      take: 20,
    }),
    db.customer.aggregate({ _sum: { walletBalance: true }, _count: { _all: true } }),
  ]);

  const direct = Object.fromEntries(todayByMethod.map((r) => [r.paymentMethod, r._sum.directPaid ?? 0]));
  const topCustomers = await db.customer.findMany({
    where: { id: { in: topSpend.map((t) => t.customerId) } },
    select: { id: true, name: true, phone: true, walletBalance: true },
  });
  const customerById = new Map(topCustomers.map((c) => [c.id, c]));

  return {
    today: {
      visits: todayWallet._count,
      total: todayWallet._sum.total ?? 0,
      wallet: todayWallet._sum.walletPaid ?? 0,
      cash: direct.CASH ?? 0,
      upi: direct.UPI ?? 0,
      card: direct.CARD ?? 0,
    },
    range,
    // Every configured staff member appears, including those with no visits yet.
    byStaff: config.staff
      .map((s) => {
        const row = byStaff.find((r) => r.staffId === s.id);
        return { staffId: s.id, name: s.name, chair: s.chair, revenue: row?._sum.total ?? 0, visits: row?._count ?? 0 };
      })
      .sort((a, b) => b.revenue - a.revenue),
    topCustomers: topSpend.flatMap((t) => {
      const c = customerById.get(t.customerId);
      return c ? [{ ...c, lifetimeSpend: t._sum.total ?? 0, visits: t._count }] : [];
    }),
    walletLiability: liability._sum.walletBalance ?? 0,
    customerCount: liability._count._all,
  };
}
