import { describe, expect, it } from "vitest";
import * as E from "../src/domain/engine";
import { emptyData, type Data } from "../src/domain/types";

const DAY = 24 * 60 * 60 * 1000;

function setup() {
  let data: Data = emptyData();
  const run = <T,>(op: { data: Data; result: T }) => ((data = op.data), op.result);
  const add = (phone: string, name: string, referralCode?: string) =>
    run(E.createCustomer(data, { phone, name, consent: true, referralCode }));
  const visit = (customerId: string, extra: Partial<Parameters<typeof E.logVisit>[1]> = {}, now?: Date) =>
    run(E.logVisit(data, { customerId, serviceId: "haircut", addOnIds: [], staffId: "s1", walletAmount: 0, paymentMethod: "CASH", ...extra }, now));
  return { get data() { return data; }, run, add, visit };
}

describe("customers", () => {
  it("requires consent and a valid phone, and rejects duplicates", () => {
    const s = setup();
    expect(() => E.createCustomer(s.data, { phone: "9876543210", name: "A", consent: false })).toThrow("consent");
    expect(() => E.createCustomer(s.data, { phone: "123", name: "A", consent: true })).toThrow("valid");
    s.add("9876543210", "A");
    expect(() => E.createCustomer(s.data, { phone: "+91 98765 43210", name: "B", consent: true })).toThrow("already exists");
  });

  it("lookup distinguishes new from returning", () => {
    const s = setup();
    expect(E.findByPhone(s.data, "9876543210").customer).toBeNull();
    const c = s.add("9876543210", "Asha");
    s.visit(c.id);
    expect(E.findByPhone(s.data, "98765 43210").customer).toMatchObject({ id: c.id, visitCount: 1 });
  });
});

describe("wallet", () => {
  it("credits tiered bonus on top-up and pays visits from the wallet", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha");
    expect(s.run(E.topUp(s.data, { customerId: c.id, amount: 2000, method: "UPI" }))).toMatchObject({ bonus: 200, balance: 2200 });
    const r = s.visit(c.id, { walletAmount: 300 });
    expect(r.balance).toBe(1900);
    expect(r.visit).toMatchObject({ total: 300, walletPaid: 300, directPaid: 0 });
    const p = E.getProfile(s.data, c.id);
    expect(p.walletTxs.reduce((sum, t) => sum + t.amount, 0)).toBe(p.walletBalance);
  });

  it("refuses to overspend or overpay", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha");
    expect(() => s.visit(c.id, { walletAmount: 100 })).toThrow("Not enough wallet balance");
    s.run(E.topUp(s.data, { customerId: c.id, amount: 1000, method: "CASH" }));
    expect(() => s.visit(c.id, { walletAmount: 400 })).toThrow("more than the bill");
    expect(s.data.visits).toHaveLength(0);
  });
});

describe("referrals", () => {
  it("rewards both sides on the referred customer's first paid visit only — not at sign-up", () => {
    const s = setup();
    const referrer = s.add("9876543210", "Asha");
    const friend = s.add("9876543211", "Bina", referrer.referralCode.toLowerCase());
    expect(E.getProfile(s.data, referrer.id).walletBalance).toBe(0);
    expect(E.getProfile(s.data, friend.id).walletBalance).toBe(0);

    const first = s.visit(friend.id);
    expect(first.referral).toMatchObject({ referrerName: "Asha", referrerReward: 100, newCustomerReward: 100 });
    expect(first.balance).toBe(100);
    expect(E.getProfile(s.data, referrer.id).walletBalance).toBe(100);

    expect(s.visit(friend.id).referral).toBeNull();
    expect(E.getProfile(s.data, referrer.id).walletBalance).toBe(100);
  });

  it("rejects an unknown referral code", () => {
    const s = setup();
    expect(() => s.add("9876543211", "B", "NOPE123")).toThrow("doesn't exist");
  });
});

describe("reminders", () => {
  it("is computed per service and respects each cycle", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    const past = new Date(Date.now() - 20 * DAY);
    s.visit(c.id, { serviceId: "beard" }, past); // 14-day cycle → overdue
    s.visit(c.id, { serviceId: "hair-colour" }, past); // 45-day cycle → not yet
    const list = E.overdueReminders(s.data);
    expect(list.map((r) => r.serviceId)).toEqual(["beard"]);
    expect(list[0]).toMatchObject({ daysOverdue: 6, remindedAt: null });
    expect(list[0].message).toContain("Hi Asha,");

    s.run(E.logReminder(s.data, { customerId: c.id, serviceId: "beard", message: "Hi!", status: "OPENED" }));
    expect(E.overdueReminders(s.data)[0].remindedAt).not.toBeNull();
  });
});

describe("dashboard", () => {
  it("splits today's revenue, ranks staff, and totals wallet liability", () => {
    const s = setup();
    const a = s.add("9876543210", "Asha");
    const b = s.add("9876543211", "Bina");
    s.run(E.topUp(s.data, { customerId: a.id, amount: 1000, method: "CASH" })); // 1050
    s.visit(a.id, { walletAmount: 300 });
    s.visit(b.id, { serviceId: "facial", staffId: "s2", paymentMethod: "UPI" });
    const d = E.ownerDashboard(s.data, "today");
    expect(d.today).toMatchObject({ visits: 2, total: 1200, wallet: 300, upi: 900, cash: 0 });
    expect(d.byStaff[0]).toMatchObject({ staffId: "s2", revenue: 900 });
    expect(d.topCustomers.map((c) => c.id)).toEqual([b.id, a.id]);
    expect(d.walletLiability).toBe(750);
  });
});

describe("demo data", () => {
  it("keeps every wallet balance equal to its transactions", async () => {
    const { buildDemoData } = await import("../src/domain/seed");
    const d = buildDemoData();
    for (const c of d.customers) {
      const sum = d.walletTxs.filter((t) => t.customerId === c.id).reduce((s, t) => s + t.amount, 0);
      expect(sum, c.name).toBe(c.walletBalance);
      expect(c.walletBalance).toBeGreaterThanOrEqual(0);
    }
    expect(E.overdueReminders(d).length).toBeGreaterThan(3);
    expect(E.ownerDashboard(d).today.visits).toBeGreaterThan(0);
  });
});
