import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { createCustomer, findByPhone, getProfile } from "@/lib/customers";
import { logVisit } from "@/lib/visits";
import { topUp } from "@/lib/wallet";
import { overdueReminders, sendReminder } from "@/lib/reminders";
import { ownerDashboard } from "@/lib/dashboard";

const DAY = 24 * 60 * 60 * 1000;

beforeEach(async () => {
  await db.reminderLog.deleteMany();
  await db.walletTransaction.deleteMany();
  await db.visit.deleteMany();
  await db.customer.deleteMany();
});

const visit = (customerId: string, extra: Partial<Parameters<typeof logVisit>[0]> = {}) =>
  logVisit({ customerId, serviceId: "haircut", addOnIds: [], staffId: "s1", walletAmount: 0, paymentMethod: "CASH", ...extra });

describe("customers", () => {
  it("requires consent and a valid phone, and rejects duplicates", async () => {
    await expect(createCustomer({ phone: "9876543210", name: "A", consent: false })).rejects.toThrow("consent");
    await expect(createCustomer({ phone: "123", name: "A", consent: true })).rejects.toThrow("valid");
    await createCustomer({ phone: "9876543210", name: "A", consent: true });
    await expect(createCustomer({ phone: "+91 98765 43210", name: "B", consent: true })).rejects.toThrow("already exists");
  });

  it("lookup distinguishes new from returning", async () => {
    expect((await findByPhone("9876543210")).customer).toBeNull();
    const c = await createCustomer({ phone: "9876543210", name: "Asha", consent: true });
    await visit(c.id);
    const found = await findByPhone("98765 43210");
    expect(found.customer?.id).toBe(c.id);
    expect(found.customer?.visitCount).toBe(1);
  });
});

describe("wallet", () => {
  it("credits tiered bonus on top-up and pays visits from the wallet", async () => {
    const c = await createCustomer({ phone: "9876543210", name: "Asha", consent: true });
    expect(await topUp({ customerId: c.id, amount: 2000, method: "UPI" })).toMatchObject({ bonus: 200, balance: 2200 });

    const r = await visit(c.id, { walletAmount: 300 });
    expect(r.balance).toBe(1900);
    expect(r.visit).toMatchObject({ total: 300, walletPaid: 300, directPaid: 0 });

    const profile = await getProfile(c.id);
    const sum = profile.walletTransactions.reduce((s, t) => s + t.amount, 0);
    expect(sum).toBe(profile.walletBalance);
  });

  it("refuses to overspend or overpay", async () => {
    const c = await createCustomer({ phone: "9876543210", name: "Asha", consent: true });
    await expect(visit(c.id, { walletAmount: 100 })).rejects.toThrow("Not enough wallet balance");
    await topUp({ customerId: c.id, amount: 1000, method: "CASH" });
    await expect(visit(c.id, { walletAmount: 400 })).rejects.toThrow("more than the bill");
    expect((await getProfile(c.id)).visits).toHaveLength(0);
  });
});

describe("referrals", () => {
  it("rewards both sides on the referred customer's first paid visit only — not at sign-up", async () => {
    const referrer = await createCustomer({ phone: "9876543210", name: "Asha", consent: true });
    const friend = await createCustomer({ phone: "9876543211", name: "Bina", consent: true, referralCode: referrer.referralCode });

    expect((await getProfile(referrer.id)).walletBalance).toBe(0);
    expect((await getProfile(friend.id)).walletBalance).toBe(0);

    const first = await visit(friend.id);
    expect(first.referral).toMatchObject({ referrerReward: 100, newCustomerReward: 100 });
    expect(first.balance).toBe(100);
    expect((await getProfile(referrer.id)).walletBalance).toBe(100);

    const second = await visit(friend.id);
    expect(second.referral).toBeNull();
    expect((await getProfile(referrer.id)).walletBalance).toBe(100);
  });

  it("rejects an unknown referral code", async () => {
    await expect(createCustomer({ phone: "9876543211", name: "B", consent: true, referralCode: "NOPE123" })).rejects.toThrow(
      "doesn't exist",
    );
  });
});

describe("reminders", () => {
  it("is computed per service and respects each cycle", async () => {
    const c = await createCustomer({ phone: "9876543210", name: "Asha", consent: true });
    const { visit: beard } = await visit(c.id, { serviceId: "beard" });
    const { visit: colour } = await visit(c.id, { serviceId: "hair-colour" });
    // Beard (14-day cycle) 20 days ago → overdue. Colour (45-day cycle) 20 days ago → not yet.
    await db.visit.update({ where: { id: beard.id }, data: { createdAt: new Date(Date.now() - 20 * DAY) } });
    await db.visit.update({ where: { id: colour.id }, data: { createdAt: new Date(Date.now() - 20 * DAY) } });

    const list = await overdueReminders();
    expect(list.map((r) => r.serviceId)).toEqual(["beard"]);
    expect(list[0].daysOverdue).toBe(6);
    expect(list[0].remindedAt).toBeNull();

    const sent = await sendReminder({ customerId: c.id, serviceId: "beard", message: "Hi!" });
    expect(sent).toMatchObject({ status: "SIMULATED", demoMode: true });
    expect((await overdueReminders())[0].remindedAt).not.toBeNull();
  });
});

describe("dashboard", () => {
  it("splits today's revenue, ranks staff, and totals wallet liability", async () => {
    const a = await createCustomer({ phone: "9876543210", name: "Asha", consent: true });
    const b = await createCustomer({ phone: "9876543211", name: "Bina", consent: true });
    await topUp({ customerId: a.id, amount: 1000, method: "CASH" }); // balance 1050
    await visit(a.id, { walletAmount: 300 }); // wallet 300, by s1
    await visit(b.id, { serviceId: "facial", staffId: "s2", paymentMethod: "UPI" }); // UPI 900

    const d = await ownerDashboard("today");
    expect(d.today).toMatchObject({ visits: 2, total: 1200, wallet: 300, upi: 900, cash: 0 });
    expect(d.byStaff[0]).toMatchObject({ staffId: "s2", revenue: 900 });
    expect(d.topCustomers.map((c) => c.id)).toEqual([b.id, a.id]);
    expect(d.walletLiability).toBe(750);
  });
});
