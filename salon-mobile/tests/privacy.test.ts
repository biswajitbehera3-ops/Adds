import { describe, expect, it } from "vitest";
import config from "../src/config/salon";
import * as E from "../src/domain/engine";
import { emptyData, type Data } from "../src/domain/types";

const DAY = 24 * 60 * 60 * 1000;
const SECRET = { salt: "x", hash: "y" };
const START = new Date("2020-01-01T00:00:00Z");

function setup() {
  let data: Data = emptyData();
  const run = <T,>(op: { data: Data; result: T }) => ((data = op.data), op.result);
  const stylist = run(E.addStaff(data, { name: "Imran", phone: "9811100001", chair: "Chair 1", secret: SECRET }, START));
  const visit = (customerId: string, walletAmount = 0, now?: Date) => {
    const v = run(E.startVisit(data, { customerId, serviceIds: ["haircut"], addOnIds: [], staffId: stylist.id }, now));
    return run(E.checkoutVisit(data, { visitId: v.id, walletAmount, paymentMethod: "CASH" }, now));
  };
  return { get data() { return data; }, run, visit, stylist };
}

describe("consent", () => {
  it("keeps the record consent and the messages consent separate, with proof", () => {
    const s = setup();
    const c = s.run(E.createCustomer(s.data, { phone: "9876543210", name: "Asha", consent: true, takenBy: s.stylist.id }));
    expect(c.consentAt).toBeTruthy();
    expect(c.marketingConsentAt).toBeNull();
    expect(c.consentNotice).toBe(config.legal.noticeVersion);
    expect(s.data.privacyLog.map((e) => e.type)).toEqual(["CONSENT_GIVEN"]);
    expect(s.data.privacyLog[0].by).toBe(s.stylist.id);
  });

  it("sends no reminders or offers without the messages opt-in", () => {
    const s = setup();
    const c = s.run(E.createCustomer(s.data, { phone: "9876543210", name: "Asha", consent: true }, START));
    const v = s.visit(c.id, 0, new Date(Date.now() - 90 * DAY));
    expect(E.overdueReminders(s.data)).toEqual([]);
    expect(() => E.logReminder(s.data, { customerId: c.id, serviceId: "haircut", message: "hi", status: "OPENED" })).toThrow("hasn't agreed");
    const msg = E.receiptMessage(s.data, v.visit.id).message;
    expect(msg).not.toContain(c.referralCode);
    expect(msg).not.toContain("STOP");
  });

  it("STOP turns messages off and is logged", () => {
    const s = setup();
    const c = s.run(E.createCustomer(s.data, { phone: "9876543210", name: "Asha", consent: true, marketing: true }, START));
    s.visit(c.id, 0, new Date(Date.now() - 90 * DAY));
    expect(E.overdueReminders(s.data)).toHaveLength(1);
    expect(E.overdueReminders(s.data)[0].message).toContain("Reply STOP");
    s.run(E.setMarketingConsent(s.data, { customerId: c.id, on: false, by: "owner" }));
    expect(E.overdueReminders(s.data)).toEqual([]);
    expect(s.data.privacyLog.map((e) => e.type)).toEqual(["CONSENT_GIVEN", "MARKETING_ON", "MARKETING_OFF"]);
  });

  it("needs a parent or guardian for a customer under 18", () => {
    const s = setup();
    expect(() => E.createCustomer(s.data, { phone: "9876543210", name: "Kid", consent: true, minor: true })).toThrow("parent or guardian");
    const c = s.run(E.createCustomer(s.data, { phone: "9876543210", name: "Kid", consent: true, minor: true, guardianConsent: true }));
    expect(c.guardianConsent).toBe(true);
  });
});

describe("wallet refunds", () => {
  it("refunds paid money and cancels unused bonus, spending bonus first", () => {
    const s = setup();
    const c = s.run(E.createCustomer(s.data, { phone: "9876543210", name: "Asha", consent: true }));
    s.run(E.topUp(s.data, { customerId: c.id, amount: 2000, method: "UPI" })); // +200 bonus = 2200
    expect(E.refundableBalance(s.data, c.id)).toEqual({ balance: 2200, refundable: 2000, promotional: 200 });
    s.visit(c.id, 300); // bonus used up first
    expect(E.refundableBalance(s.data, c.id)).toEqual({ balance: 1900, refundable: 1900, promotional: 0 });
    const r = s.run(E.closeWallet(s.data, { customerId: c.id, method: "UPI", by: "owner" }));
    expect(r).toEqual({ refunded: 1900, writtenOff: 0 });
    expect(E.getProfile(s.data, c.id).walletBalance).toBe(0);
  });
});

describe("access and deletion", () => {
  it("exports a customer's data as text", () => {
    const s = setup();
    const c = s.run(E.createCustomer(s.data, { phone: "9876543210", name: "Asha", consent: true }));
    s.visit(c.id);
    const text = s.run(E.customerDataExport(s.data, c.id));
    expect(text).toContain("Asha");
    expect(text).toContain("9876543210");
    expect(text).toContain("Haircut");
    expect(s.data.privacyLog.at(-1)?.type).toBe("DATA_SHARED");
  });

  it("erases name and number but keeps the money records, and blocks while money is left", () => {
    const s = setup();
    const c = s.run(E.createCustomer(s.data, { phone: "9876543210", name: "Asha", consent: true }));
    s.run(E.topUp(s.data, { customerId: c.id, amount: 500, method: "CASH" }));
    s.visit(c.id, 0);
    expect(() => E.deleteCustomer(s.data, { customerId: c.id, by: "owner" })).toThrow("Close the wallet");
    s.run(E.closeWallet(s.data, { customerId: c.id, method: "CASH", by: "owner" }));
    s.run(E.deleteCustomer(s.data, { customerId: c.id, by: "owner" }));
    const gone = s.data.customers.find((x) => x.id === c.id)!;
    expect(gone).toMatchObject({ name: "Deleted customer", phone: "", referralCode: "" });
    expect(gone.deletedAt).toBeTruthy();
    expect(E.findByPhone(s.data, "9876543210").customer).toBeNull();
    expect(E.searchCustomers(s.data, "")).toHaveLength(0);
    expect(E.ownerDashboard(s.data).today.total).toBe(300); // takings unchanged
    // The same person can come back later as a new customer.
    s.run(E.createCustomer(s.data, { phone: "9876543210", name: "Asha", consent: true }));
  });

  it("auto-erases long-inactive customers and old selfies", () => {
    const s = setup();
    const old = new Date(Date.now() - (config.retention.inactiveCustomerDays + 10) * DAY);
    const c = s.run(E.createCustomer(s.data, { phone: "9876543210", name: "Old", consent: true }, old));
    s.visit(c.id, 0, old);
    s.run(E.markAttendance(s.data, { staffId: s.stylist.id, photoKey: "p1" }, old));
    const fresh = s.run(E.createCustomer(s.data, { phone: "9876543211", name: "New", consent: true }));
    const r = s.run(E.purgeExpired(s.data));
    expect(r).toEqual({ photoKeys: ["p1"], customersErased: 1 });
    expect(s.data.customers.find((x) => x.id === c.id)?.deletedAt).toBeTruthy();
    expect(s.data.customers.find((x) => x.id === fresh.id)?.deletedAt).toBeNull();
    expect(s.data.attendance[0].photoKey).toBeNull();
  });
});
