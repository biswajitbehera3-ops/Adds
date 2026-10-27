import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import config from "../src/config/salon";
import * as K from "../src/domain/checks";
import * as E from "../src/domain/engine";
import { emptyData, type Data } from "../src/domain/types";

const SECRET = { salt: "x", hash: "y" };
// Wednesday 14 Oct 2026, 11:30 IST.
const NOW = new Date("2026-10-14T06:00:00.000Z");
// Engine defaults use the phone's clock; pin it to the test day so records are saved in time order.
beforeEach(() => vi.useFakeTimers({ now: NOW, toFake: ["Date"] }));
afterEach(() => vi.useRealTimers());
const at = (min: number) => new Date(NOW.getTime() + min * 60000);

function setup() {
  let data: Data = { ...emptyData(), owner: { secret: SECRET } };
  const run = <T,>(op: { data: Data; result: T }) => ((data = op.data), op.result);
  const imran = run(E.addStaff(data, { name: "Imran Khan", phone: "9811100001", chair: "Chair 1", secret: SECRET }));
  const add = (phone: string, name: string, extra: { referredBy?: string; referralVerified?: boolean } = {}) =>
    run(E.createCustomer(data, { phone, name, consent: true, marketing: true, takenBy: imran.id, ...extra }, NOW));
  const pay = (customerId: string, min: number, extra: { serviceIds?: string[]; walletAmount?: number; walletCodeOk?: boolean; method?: "CASH" | "UPI" } = {}) => {
    const v = run(E.startVisit(data, { customerId, serviceIds: extra.serviceIds ?? ["haircut"], addOnIds: [], staffId: imran.id }, at(min)));
    return run(E.checkoutVisit(data, { visitId: v.id, walletAmount: extra.walletAmount ?? 0, paymentMethod: extra.method ?? "CASH", walletCodeOk: extra.walletCodeOk }, at(min + 30)));
  };
  return { get data() { return data; }, set data(d: Data) { data = d; }, run, imran, add, pay };
}

afterEach(() => K.applyCatalog(emptyData()));

describe("misuse checks", () => {
  it("1. a bill can only be paid once", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: [], staffId: s.imran.id }, NOW));
    s.run(E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 0, paymentMethod: "CASH" }, at(30)));
    expect(() => E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 0, paymentMethod: "CASH" }, at(31))).toThrow("no longer open");
  });

  it("2/3/8. the WhatsApp receipt lists every item, the wallet used and the balance", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    s.run(E.topUp(s.data, { customerId: c.id, amount: 1000, method: "UPI" }, NOW));
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: ["head-massage"], staffId: s.imran.id }, at(1)));
    s.run(E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 450, paymentMethod: "CASH" }, at(30)));
    const m = E.receiptMessage(s.data, v.id).message;
    expect(m).toContain("Haircut ₹300, Head massage ₹150");
    expect(m).toContain("₹450 from your wallet");
    expect(m).toContain("Wallet balance: ₹600");
  });

  it("4. a customer who leaves is kept on record and shows in the owner's checks", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["facial"], addOnIds: [], staffId: s.imran.id }, NOW));
    s.run(E.cancelOpenVisit(s.data, v.id, s.imran.id, at(25)));
    expect(s.data.visits[0].status).toBe("LEFT");
    const item = K.ownerChecks(s.data, at(30)).items.find((i) => i.kind === "left")!;
    expect(item.title).toBe("Asha Rao left without service");
    expect(item.detail).toContain("sat 25 min");
  });

  it("5. a staff undo needs a reason, names the stylist and shows in the owner's checks", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    const { visit } = s.pay(c.id, 0);
    expect(() => E.voidVisit(s.data, { visitId: visit.id, by: "staff", reason: "" }, at(31))).toThrow("Say why");
    s.run(E.voidVisit(s.data, { visitId: visit.id, by: "staff", reason: "Wrong customer", staffId: s.imran.id }, at(31)));
    const item = K.ownerChecks(s.data, at(40)).items.find((i) => i.kind === "undo")!;
    expect(item.title).toBe("Imran undid a ₹300 bill");
    expect(item.detail).toContain("Wrong customer");
  });

  it("6. a booking nobody closed shows in the owner's checks", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    s.run(E.bookAppointment(s.data, { customerId: c.id, serviceIds: ["haircut"], staffId: s.imran.id, day: "2026-10-14", time: "12:00", source: "PHONE", by: s.imran.id }, NOW));
    expect(K.ownerChecks(s.data, at(60)).items.some((i) => i.kind === "booking")).toBe(false);
    expect(K.ownerChecks(s.data, at(75)).items.find((i) => i.kind === "booking")!.title).toBe("Asha Rao's booking not closed");
  });

  it("7. a referral needs the WhatsApp code, and the referrer's rewards stop at the monthly limit", () => {
    const s = setup();
    const priya = s.add("9876543200", "Priya Patel");
    expect(() => s.add("9876543201", "Friend One", { referredBy: priya.referralCode })).toThrow("WhatsApp code");
    s.data = { ...s.data, checks: { walletCodeAbove: 500, referralMonthlyLimit: 2 } };
    for (let i = 1; i <= 3; i++) {
      const f = s.add(`987654321${i}`, `Friend ${i}`, { referredBy: priya.referralCode, referralVerified: true });
      expect(f.referralVerifiedAt).toBeTruthy();
      const r = s.pay(f.id, i * 60);
      expect(r.referral!.newCustomerReward).toBe(100);
      expect(r.referral!.referrerReward).toBe(i <= 2 ? 100 : 0);
    }
    expect(s.data.customers.find((c) => c.id === priya.id)!.walletBalance).toBe(200);
  });

  it("8. a wallet spend above the limit needs the customer's code", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    s.run(E.topUp(s.data, { customerId: c.id, amount: 2000, method: "UPI" }, NOW));
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["hair-colour"], addOnIds: [], staffId: s.imran.id }, at(1)));
    expect(() => E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 1200, paymentMethod: "CASH" }, at(90))).toThrow("code sent to the customer's WhatsApp");
    const r = s.run(E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 1200, paymentMethod: "CASH", walletCodeOk: true }, at(90)));
    expect(r.visit.walletCodeAt).toBeTruthy();
    // At or under the limit no code is needed.
    const v2 = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: [], staffId: s.imran.id }, at(100)));
    expect(s.run(E.checkoutVisit(s.data, { visitId: v2.id, walletAmount: 300, paymentMethod: "CASH" }, at(130))).visit.walletCodeAt).toBeNull();
  });

  it("9. a check-in with the phone clock set back is refused", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    s.pay(c.id, 120); // saved at 14:00 IST
    expect(() => E.markAttendance(s.data, { staffId: s.imran.id, photoKey: null }, at(60))).toThrow("clock is behind");
    expect(E.markAttendance(s.data, { staffId: s.imran.id, photoKey: null }, at(152)).result.staffId).toBe(s.imran.id);
  });

  it("10. an 'Other' service waits for the owner, and the owner's price list is used for new bills", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: [], staffId: s.imran.id }, NOW));
    expect(s.run(E.addVisitExtra(s.data, { visitId: v.id, name: " Keratin  touch-up ", price: 800 })).total).toBe(1100);
    expect(() => E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 0, paymentMethod: "UPI" }, at(30))).toThrow('approve "Keratin touch-up"');
    s.run(E.approveVisitExtras(s.data, v.id, at(29)));
    const paid = s.run(E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 0, paymentMethod: "UPI" }, at(30)));
    expect(paid.visit.total).toBe(1100);
    expect(K.ownerChecks(s.data, at(40)).items.some((i) => i.kind === "other")).toBe(true);

    s.run(K.saveService(s.data, { id: "haircut", name: "Haircut", price: 350, minutes: 30, cycleDays: 30 }));
    s.run(K.saveService(s.data, { name: "Keratin touch-up", price: 800, minutes: 40, cycleDays: 60 }));
    K.applyCatalog(s.data);
    expect(config.services.find((x) => x.id === "keratin-touch-up")).toBeTruthy();
    const v2 = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: [], staffId: s.imran.id }, at(60)));
    expect(v2.total).toBe(350);
    expect(paid.visit.total).toBe(1100); // a paid bill keeps its price
    expect(() => K.setOffered(s.data, { id: "nope", offered: false })).toThrow("Not found");
  });

  it("3. the end-of-day count compares the drawer with cash bills and cash top-ups", () => {
    const s = setup();
    const c = s.add("9876543210", "Asha Rao");
    s.pay(c.id, 0, { method: "CASH" });
    s.pay(c.id, 60, { method: "UPI" });
    s.run(E.topUp(s.data, { customerId: c.id, amount: 1000, method: "CASH" }, at(100)));
    expect(K.expectedCash(s.data, "2026-10-14").total).toBe(1300);
    expect(() => K.closeDay(s.data, { counted: 1200 }, at(600))).toThrow("Add a note");
    s.run(K.closeDay(s.data, { counted: 1200, note: "Gave change from drawer" }, at(600)));
    expect(K.ownerChecks(s.data, at(601)).items.find((i) => i.kind === "cash")!.title).toBe("Cash short by ₹100");
  });

  it("a backup file restores the salon, and anything else is refused", () => {
    const s = setup();
    s.add("9876543210", "Asha Rao");
    const { text, fileName } = K.exportBackup(s.data, NOW);
    expect(fileName).toBe("salon-backup-2026-10-14.json");
    expect(K.readBackup(text).customers[0].name).toBe("Asha Rao");
    expect(() => K.readBackup("{}")).toThrow("isn't a salon backup");
    expect(() => K.readBackup("not json")).toThrow("isn't a salon backup");
  });
});
