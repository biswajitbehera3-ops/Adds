import { createHash, randomBytes } from "node:crypto";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { checkSecret, makeSecret, type Hasher } from "../src/domain/auth";
import * as E from "../src/domain/engine";
import { buildDemoData } from "../src/domain/seed";
import { emptyData, type Data } from "../src/domain/types";
import { buildXlsx } from "../src/domain/xlsx";

const DAY = 24 * 60 * 60 * 1000;
const hasher: Hasher = {
  sha256: async (t) => createHash("sha256").update(t).digest("hex"),
  randomHex: (n) => randomBytes(n).toString("hex"),
};
const SECRET = { salt: "x", hash: "y" };

function setup() {
  let data: Data = emptyData();
  const run = <T,>(op: { data: Data; result: T }) => ((data = op.data), op.result);
  const stylist = run(E.addStaff(data, { name: "Imran", phone: "9811100001", chair: "Chair 1", secret: SECRET }));
  const add = (phone: string, name: string, referredBy?: string) => run(E.createCustomer(data, { phone, name, consent: true, marketing: true, referredBy }));
  /** Walk in, do the service, pay. */
  const visit = (customerId: string, extra: { serviceIds?: string[]; walletAmount?: number; paymentMethod?: "CASH" | "UPI" | "CARD" } = {}, now?: Date) => {
    const v = run(E.startVisit(data, { customerId, serviceIds: extra.serviceIds ?? ["haircut"], addOnIds: [], staffId: stylist.id }, now));
    return run(E.checkoutVisit(data, { visitId: v.id, walletAmount: extra.walletAmount ?? 0, paymentMethod: extra.paymentMethod ?? "CASH" }, now));
  };
  return { get data() { return data; }, run, add, visit, stylist };
}

describe("customers", () => {
  it("requires consent and a valid phone, and rejects duplicates", () => {
    const s = setup();
    expect(() => E.createCustomer(s.data, { phone: "9876543210", name: "A", consent: false })).toThrow("consent");
    expect(() => E.createCustomer(s.data, { phone: "123", name: "A", consent: true })).toThrow("valid");
    s.add("9876543210", "A");
    expect(() => E.createCustomer(s.data, { phone: "+91 98765 43210", name: "B", consent: true })).toThrow("already exists");
  });

  it("lookup shows new vs returning, last service and any open visit", () => {
    const s = setup();
    expect(E.findByPhone(s.data, "9876543210").customer).toBeNull();
    const c = s.add("9876543210", "Asha");
    s.visit(c.id);
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["beard"], addOnIds: [], staffId: s.stylist.id }));
    const found = E.findByPhone(s.data, "98765 43210").customer!;
    expect(found).toMatchObject({ visitCount: 1, openVisit: { id: v.id } });
    expect(found.lastVisit?.serviceIds).toEqual(["haircut"]);
  });
});

describe("visit lifecycle", () => {
  it("opens on arrival, takes extra services, and is priced and paid after", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha");
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: [], staffId: s.stylist.id }));
    expect(v).toMatchObject({ status: "OPEN", total: 300 });
    expect(() => E.startVisit(s.data, { customerId: c.id, serviceIds: ["beard"], addOnIds: [], staffId: s.stylist.id })).toThrow("already has a visit");
    s.run(E.updateOpenVisit(s.data, { visitId: v.id, serviceIds: ["haircut", "beard"], addOnIds: ["head-massage"], staffId: s.stylist.id }));
    expect(E.openVisits(s.data)).toHaveLength(1);
    const r = s.run(E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 0, paymentMethod: "UPI" }));
    expect(r.visit).toMatchObject({ status: "PAID", total: 300 + 150 + 150, directPaid: 600 });
    expect(E.openVisits(s.data)).toHaveLength(0);
    expect(() => E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 0, paymentMethod: "UPI" })).toThrow("no longer open");
  });

  it("an open visit can be cancelled and never counts as revenue", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha");
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["facial"], addOnIds: [], staffId: s.stylist.id }));
    expect(E.ownerDashboard(s.data).today).toMatchObject({ visits: 0, total: 0 });
    s.run(E.cancelOpenVisit(s.data, v.id));
    expect(s.data.visits).toHaveLength(0);
  });
});

describe("wallet", () => {
  it("credits tiered bonus on top-up and pays visits from the wallet", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha");
    expect(s.run(E.topUp(s.data, { customerId: c.id, amount: 2000, method: "UPI" }))).toMatchObject({ bonus: 200, balance: 2200 });
    const r = s.visit(c.id, { walletAmount: 300 });
    expect(r.balance).toBe(1900);
    const p = E.getProfile(s.data, c.id);
    expect(p.walletTxs.reduce((sum, t) => sum + t.amount, 0)).toBe(p.walletBalance);
  });

  it("refuses to overspend or overpay", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha");
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: [], staffId: s.stylist.id }));
    const pay = (walletAmount: number) => E.checkoutVisit(s.data, { visitId: v.id, walletAmount, paymentMethod: "CASH" });
    expect(() => pay(100)).toThrow("Not enough wallet balance");
    s.run(E.topUp(s.data, { customerId: c.id, amount: 1000, method: "CASH" }));
    expect(() => pay(400)).toThrow("more than the bill");
    // A failed payment leaves the visit open, ready to try again.
    expect(E.openVisits(s.data)).toHaveLength(1);
  });
});

describe("referrals", () => {
  it("rewards both on the first paid visit only — and accepts the friend's phone instead of a code", () => {
    const s = setup();
    const referrer = s.add("9876543210", "Asha");
    const byCode = s.add("9876543211", "Bina", referrer.referralCode.toLowerCase());
    const byPhone = s.add("9876543212", "Chitra", "98765 43210");
    expect(byPhone.referredById).toBe(referrer.id);
    expect(E.getProfile(s.data, referrer.id).walletBalance).toBe(0);

    expect(s.visit(byCode.id).referral).toMatchObject({ referrerName: "Asha", referrerReward: 100 });
    expect(s.visit(byCode.id).referral).toBeNull();
    s.visit(byPhone.id);
    expect(E.getProfile(s.data, referrer.id).walletBalance).toBe(200);
  });

  it("rejects unknown referrers and self-referral", () => {
    const s = setup();
    expect(() => s.add("9876543211", "B", "NOPE123")).toThrow("No customer found");
    s.add("9876543210", "Asha");
    expect(() => E.createCustomer(s.data, { phone: "9876543299", name: "Z", consent: true, referredBy: "9876543299" })).toThrow("No customer found");
  });
});

describe("undo and void", () => {
  it("staff can undo within the window; wallet money comes back", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha");
    s.run(E.topUp(s.data, { customerId: c.id, amount: 1000, method: "CASH" })); // 1050
    const t0 = new Date();
    const { visit } = s.visit(c.id, { walletAmount: 300 }, t0);
    expect(E.getProfile(s.data, c.id).walletBalance).toBe(750);
    expect(() => E.voidVisit(s.data, { visitId: visit.id, by: "staff", reason: "" }, new Date(t0.getTime() + 3 * 60000))).toThrow("Ask the owner");
    const v = s.run(E.voidVisit(s.data, { visitId: visit.id, by: "staff", reason: "" }, new Date(t0.getTime() + 60000)));
    expect(v).toMatchObject({ status: "VOID", voidReason: "Undone by staff" });
    expect(E.getProfile(s.data, c.id).walletBalance).toBe(1050);
    expect(E.ownerDashboard(s.data).today.total).toBe(0);
  });

  it("owner void reverses a referral reward, so the next paid visit earns it again", () => {
    const s = setup();
    const referrer = s.add("9876543210", "Asha");
    const friend = s.add("9876543211", "Bina", referrer.referralCode);
    const { visit } = s.visit(friend.id);
    s.run(E.voidVisit(s.data, { visitId: visit.id, by: "owner", reason: "Wrong customer" }));
    expect(E.getProfile(s.data, referrer.id).walletBalance).toBe(0);
    expect(E.getProfile(s.data, friend.id).walletBalance).toBe(0);
    expect(s.visit(friend.id).referral).not.toBeNull();
    for (const id of [referrer.id, friend.id]) {
      const p = E.getProfile(s.data, id);
      expect(p.walletTxs.reduce((sum, t) => sum + t.amount, 0)).toBe(p.walletBalance);
    }
  });
});

describe("reminders", () => {
  it("is computed per service, including every service in a multi-service visit", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    const past = new Date(Date.now() - 20 * DAY);
    s.visit(c.id, { serviceIds: ["beard", "hair-colour"] }, past); // beard 14d → overdue; colour 45d → not yet
    const list = E.overdueReminders(s.data);
    expect(list.map((r) => r.serviceId)).toEqual(["beard"]);
    expect(list[0]).toMatchObject({ daysOverdue: 6, remindedAt: null });
    s.run(E.logReminder(s.data, { customerId: c.id, serviceId: "beard", message: "Hi!", status: "OPENED" }));
    expect(E.overdueReminders(s.data)[0].remindedAt).not.toBeNull();
  });

  it("locks a sent reminder for every stylist for 5 days, then lets it go again", () => {
    const s = setup();
    const sunita = s.run(E.addStaff(s.data, { name: "Sunita Devi", phone: "9811100002", chair: "Chair 2", secret: SECRET }));
    const c = s.add("9876543210", "Asha Rao");
    s.visit(c.id, { serviceIds: ["beard"] }, new Date(Date.now() - 20 * DAY));
    const sent = new Date();
    s.run(E.logReminder(s.data, { customerId: c.id, serviceId: "beard", message: "Hi!", status: "OPENED", by: sunita.id }, sent));
    const r = E.overdueReminders(s.data)[0];
    expect(r.remindedBy).toBe("Sunita Devi");
    expect(r.lockedUntil?.getTime()).toBe(sent.getTime() + 5 * DAY);
    // Another stylist can't send the same reminder while it is locked.
    const fourDays = new Date(sent.getTime() + 4 * DAY);
    expect(() => E.logReminder(s.data, { customerId: c.id, serviceId: "beard", message: "Hi!", status: "OPENED", by: s.stylist.id }, fourDays)).toThrow("Already reminded by Sunita");
    // After 5 days it is free again for anyone.
    const sixDays = new Date(sent.getTime() + 6 * DAY);
    expect(E.overdueReminders(s.data, sixDays)[0].lockedUntil).toBeNull();
    expect(s.run(E.logReminder(s.data, { customerId: c.id, serviceId: "beard", message: "Hi!", status: "OPENED", by: s.stylist.id }, sixDays)).sentBy).toBe(s.stylist.id);
  });

  it("builds the thank-you message with the balance and referral code", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    const { visit } = s.visit(c.id);
    const m = E.receiptMessage(s.data, visit.id);
    expect(m.phone).toBe("9876543210");
    expect(m.message).toContain("Asha");
    expect(m.message).toContain(c.referralCode);
    expect(m.message).toContain("₹300");
  });
});

describe("dashboard", () => {
  it("counts only paid visits and splits today's revenue", () => {
    const s = setup();
    const b2 = s.run(E.addStaff(s.data, { name: "Sunita", phone: "9811100002", chair: "Chair 2", secret: SECRET }));
    const a = s.add("9876543210", "Asha");
    const b = s.add("9876543211", "Bina");
    s.run(E.topUp(s.data, { customerId: a.id, amount: 1000, method: "CASH" }));
    s.visit(a.id, { walletAmount: 300 });
    const v = s.run(E.startVisit(s.data, { customerId: b.id, serviceIds: ["facial"], addOnIds: [], staffId: b2.id }));
    s.run(E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 0, paymentMethod: "UPI" }));
    const d = E.ownerDashboard(s.data);
    expect(d.today).toMatchObject({ visits: 2, total: 1200, wallet: 300, upi: 900, cash: 0 });
    expect(d.byStaff[0]).toMatchObject({ staffId: b2.id, revenue: 900 });
    expect(d.walletLiability).toBe(750);
  });
});

describe("staff, login and attendance", () => {
  it("stores only salted hashes and checks passwords", async () => {
    const secret = await makeSecret("pass1", hasher);
    expect(secret.hash).not.toContain("pass1");
    expect(await checkSecret(secret, "pass1", hasher)).toBe(true);
    expect(await checkSecret(secret, "pass2", hasher)).toBe(false);
    await expect(makeSecret("12", hasher)).rejects.toThrow("at least");
  });

  it("marks attendance once per day and flags late check-ins", () => {
    const s = setup();
    const onTime = new Date("2026-10-12T04:20:00Z"); // 09:50 IST
    s.run(E.markAttendance(s.data, { staffId: s.stylist.id, photoKey: "p1" }, onTime));
    expect(() => E.markAttendance(s.data, { staffId: s.stylist.id, photoKey: "p2" }, onTime)).toThrow("already marked");
    s.run(E.markAttendance(s.data, { staffId: s.stylist.id, photoKey: null }, new Date("2026-10-13T05:00:00Z"))); // 10:30 IST, late
    const m = E.attendanceMonth(s.data, "2026-10");
    expect(m.dates).toHaveLength(31);
    expect(m.rows[0]).toMatchObject({ present: 2, late: 1 });
  });

  it("exports a real .xlsx with a summary plus one sheet per day", () => {
    const s = setup();
    s.run(E.markAttendance(s.data, { staffId: s.stylist.id, photoKey: "p1" }, new Date("2026-10-02T04:20:00Z")));
    const sheets = E.attendanceSheets(s.data, "2026-10", new Date("2026-10-03T08:00:00Z"));
    expect(sheets.map((x) => x.name)).toEqual(["Summary 2026-10", "2026-10-01", "2026-10-02", "2026-10-03"]);
    expect(sheets[2].rows[1]).toEqual(["Imran", "9811100001", "Chair 1", "Present", "09:50", "Saved in app"]);
    const files = unzipSync(buildXlsx(sheets));
    expect(Object.keys(files)).toContain("xl/worksheets/sheet4.xml");
    expect(strFromU8(files["xl/workbook.xml"])).toContain('name="2026-10-02"');
    expect(strFromU8(files["xl/worksheets/sheet3.xml"])).toContain("09:50");
  });
});

describe("migration and demo data", () => {
  it("upgrades v1 data (one service per visit) without losing money", () => {
    const v1 = {
      version: 1,
      customers: [{ id: "c1", phone: "9876543210", name: "A", referralCode: "AAA1111", walletBalance: 0, consentAt: "x", referredById: null, referralRewardedAt: null, createdAt: "x" }],
      visits: [{ id: "v1", customerId: "c1", serviceId: "haircut", staffId: "s1", addOnIds: [], total: 300, walletPaid: 0, directPaid: 300, paymentMethod: "CASH", createdAt: new Date().toISOString() }],
      walletTxs: [],
      reminders: [],
      demo: false,
    };
    const d = E.migrate(v1);
    expect(d.version).toBe(4);
    expect(d.customers[0]).toMatchObject({ marketingConsentAt: "x", guardianConsent: false, deletedAt: null });
    expect(d.visits[0]).toMatchObject({ serviceIds: ["haircut"], status: "PAID" });
    expect(E.ownerDashboard(d).today.total).toBe(300);
    expect(d.owner).toBeNull();
  });

  it("demo data keeps every wallet equal to its transactions and has staff and attendance", async () => {
    const d = buildDemoData();
    for (const c of d.customers) {
      const sum = d.walletTxs.filter((t) => t.customerId === c.id).reduce((s, t) => s + t.amount, 0);
      expect(sum, c.name).toBe(c.walletBalance);
    }
    expect(d.staff).toHaveLength(3);
    expect(d.attendance.length).toBeGreaterThan(40);
    expect(await checkSecret(d.owner!.secret, "owner1234", hasher)).toBe(true);
    expect(await checkSecret(d.staff[0].secret, "1234", hasher)).toBe(true);
    expect(E.overdueReminders(d).length).toBeGreaterThan(3);
  });
});
