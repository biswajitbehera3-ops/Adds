/**
 * One test per security finding (security/run-1 and run-2, SECURITY-LESSONS.md): each reproduces the
 * attack from the report and checks the fix holds.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import config from "../src/config/salon";
import * as K from "../src/domain/checks";
import * as E from "../src/domain/engine";
import { buildDemoData } from "../src/domain/seed";
import { emptyData, type Data } from "../src/domain/types";

const SECRET = { salt: "x", hash: "y" };
const START = new Date("2026-01-01T03:30:00Z");
const NOW = new Date("2026-10-14T05:30:00Z"); // 11:00 IST
const DAY = 86400000;
const MIN = 60000;
const at = (ms: number) => new Date(NOW.getTime() + ms);

beforeEach(() => vi.useFakeTimers({ now: NOW, toFake: ["Date"] }));
afterEach(() => vi.useRealTimers());

function setup() {
  let data: Data = { ...emptyData(), owner: { secret: SECRET } };
  const run = <T,>(op: { data: Data; result: T }) => ((data = op.data), op.result);
  const imran = run(E.addStaff(data, { name: "Imran", phone: "9811100001", chair: "Chair 1", secret: SECRET }, START));
  const sunita = run(E.addStaff(data, { name: "Sunita", phone: "9811100002", chair: "Chair 2", secret: SECRET }, START));
  const add = (phone: string, name: string, extra: { referredBy?: string } = {}) =>
    run(E.createCustomer(data, { phone, name, consent: true, referredBy: extra.referredBy, referralVerified: !!extra.referredBy }, START));
  const bill = (customerId: string, when: Date, opts: { method?: "CASH" | "UPI"; walletAmount?: number; walletCodeOk?: boolean } = {}) => {
    const v = run(E.startVisit(data, { customerId, serviceIds: ["haircut"], addOnIds: [], staffId: imran.id }, when));
    return run(E.checkoutVisit(data, { visitId: v.id, walletAmount: opts.walletAmount ?? 0, paymentMethod: opts.method ?? "CASH", walletCodeOk: opts.walletCodeOk }, when)).visit;
  };
  return { get data() { return data; }, set data(d: Data) { data = d; }, run, imran, sunita, add, bill };
}

describe("run 1 findings", () => {
  it("R1-2: a crafted backup is refused, and a good one keeps this phone's owner password", () => {
    const s = setup();
    const c = s.add("9876500001", "Asha");
    const good = JSON.parse(K.exportBackup(s.data).text);
    expect(K.readBackup(JSON.stringify(good)).customers).toHaveLength(1);
    const bad = (mut: (d: Data) => void) => {
      const copy = JSON.parse(JSON.stringify(good));
      mut(copy.data);
      return () => K.readBackup(JSON.stringify(copy));
    };
    expect(bad((d) => (d.customers[0].walletBalance = -999999))).toThrow("can't be used");
    expect(bad((d) => (d.customers[0].walletBalance = 5000))).toThrow("doesn't match");
    expect(bad((d) => (d.checks = { walletCodeAbove: 99999999, referralMonthlyLimit: 1 }))).toThrow("check limits");
    expect(bad((d) => (d.catalog = { services: [{ id: "haircut", name: "Haircut", price: -5, minutes: 30, cycleDays: 30 }], addOns: [] }))).toThrow("price");
    expect(bad((d) => d.attendance.push({ id: "a1", staffId: s.imran.id, date: "2020-01-01", checkInAt: "2020-01-01T00:00:00.000Z", photoKey: "../../dummy" }))).toThrow("selfie name");
    // The backup's own owner password is ignored: the phone's stays.
    const other = JSON.parse(JSON.stringify(good));
    other.data.owner = { secret: { salt: "attacker", hash: "known" } };
    const restored = K.prepareRestore(s.data, K.readBackup(JSON.stringify(other)), NOW);
    expect(restored.owner).toEqual({ secret: SECRET });
    expect(restored.customers[0].id).toBe(c.id);
  });

  it("R1-3: a stylist can't undo a bill by setting the clock back", () => {
    const s = setup();
    const c = s.add("9876500001", "Asha");
    const v = s.bill(c.id, NOW);
    expect(E.canStaffUndo(v, at(60 * 1000))).toBe(true);
    expect(E.canStaffUndo(v, at(-DAY))).toBe(false);
    expect(() => E.voidVisit(s.data, { visitId: v.id, by: "staff", reason: "x", staffId: s.imran.id }, at(-DAY))).toThrow("clock is behind");
  });

  it("R1-4: closing a wallet refunds deposits only, after a spend-down and a new top-up", () => {
    const s = setup();
    const c = s.add("9876500001", "Asha");
    s.run(E.topUp(s.data, { customerId: c.id, amount: 2000, method: "CASH" }, NOW)); // +200 bonus
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: [], staffId: s.imran.id }, at(MIN))); // ₹300
    s.run(E.addVisitExtra(s.data, { visitId: v.id, name: "Bridal", price: 1900 }));
    s.run(E.approveVisitExtras(s.data, v.id, at(MIN)));
    s.run(E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 2200, paymentMethod: "CASH", walletCodeOk: true }, at(2 * MIN)));
    s.run(E.topUp(s.data, { customerId: c.id, amount: 2000, method: "CASH" }, at(3 * MIN))); // +200 bonus
    expect(E.refundableBalance(s.data, c.id)).toEqual({ balance: 2200, refundable: 2000, promotional: 200 });
    expect(s.run(E.closeWallet(s.data, { customerId: c.id, method: "CASH", by: "owner" }, at(4 * MIN)))).toEqual({ refunded: 2000, writtenOff: 200 });
    s.run(E.topUp(s.data, { customerId: c.id, amount: 1000, method: "CASH" }, at(5 * MIN))); // +50 bonus
    expect(E.refundableBalance(s.data, c.id)).toMatchObject({ refundable: 1000, promotional: 50 });
  });

  it("R1-1: demo data never holds a time in the future (it would block every save)", () => {
    const d = buildDemoData(NOW.getTime());
    expect(E.latestRecordTime(d)).toBeLessThanOrEqual(NOW.getTime());
  });
});

describe("run 2 findings", () => {
  it("1: a phone clock far ahead puts clean-up on hold until the owner confirms", () => {
    const s = setup();
    const c = s.add("9876500001", "Asha");
    s.bill(c.id, NOW);
    s.run(E.markAttendance(s.data, { staffId: s.imran.id, photoKey: "selfie-today" }, NOW));
    const ahead = at(1100 * DAY);
    const r = s.run(E.purgeExpired(s.data, ahead));
    expect(r).toMatchObject({ photoKeys: [], customersErased: 0, held: true });
    expect(s.data.customers[0].deletedAt).toBeNull();
    expect(K.ownerChecks(s.data, NOW).items.map((i) => i.id)).toContain("k-hold");
    // At the real date, after the owner confirms, nothing recent is touched.
    s.run(E.confirmClock(s.data, at(MIN)));
    expect(s.run(E.purgeExpired(s.data, at(2 * MIN)))).toMatchObject({ photoKeys: [], customersErased: 0 });
  });

  it("2: a check-in saved for tomorrow, and a clock set back, both show in the owner's checks", () => {
    const s = setup();
    s.run(E.markAttendance(s.data, { staffId: s.imran.id, photoKey: null }, NOW));
    s.data = E.observeClock(s.data, NOW);
    s.run(E.markAttendance(s.data, { staffId: s.sunita.id, photoKey: null }, at(DAY - 2 * 60 * MIN)));
    s.data = E.observeClock(s.data, at(DAY - 2 * 60 * MIN));
    s.data = E.observeClock(s.data, at(8 * 60 * MIN)); // clock put back that evening
    const items = K.ownerChecks(s.data, at(8 * 60 * MIN)).items;
    expect(items.some((i) => i.kind === "attendance" && i.title.includes("Sunita"))).toBe(true);
    expect(items.some((i) => i.kind === "clock" && i.title.includes("set back"))).toBe(true);
  });

  it("3: a cash bill after the count, or backdated into a counted day, is caught", () => {
    const s = setup();
    const c = s.add("9876500001", "Asha");
    s.bill(c.id, NOW);
    s.run(K.closeDay(s.data, { counted: 300 }, at(60 * MIN)));
    expect(K.ownerChecks(s.data, at(61 * MIN)).items.filter((i) => i.kind === "cash")).toHaveLength(0);
    s.bill(c.id, at(90 * MIN)); // rung up after the count, cash kept
    const cash = K.ownerChecks(s.data, at(120 * MIN)).items.filter((i) => i.kind === "cash");
    expect(cash).toHaveLength(1);
    expect(cash[0].title).toContain("short by ₹300");
    // Backdating a bill into the counted day is refused.
    const v = s.run(E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: [], staffId: s.imran.id }, at(DAY)));
    expect(() => E.checkoutVisit(s.data, { visitId: v.id, walletAmount: 0, paymentMethod: "CASH" }, at(30 * MIN))).toThrow("clock is behind");
  });

  it("4: a stylist's no-show is named in the owner's checks, and they can't cancel after the time", () => {
    const s = setup();
    const c = s.add("9876500001", "Asha");
    const b = s.run(E.bookAppointment(s.data, { customerId: c.id, serviceIds: ["haircut"], staffId: s.imran.id, day: "2026-10-14", time: "12:00", source: "PHONE", by: s.imran.id }, NOW));
    const late = at(105 * MIN); // 12:45 IST
    expect(() => E.cancelAppointment(s.data, b.id, s.imran.id, late)).toThrow("No-show");
    s.run(E.markNoShow(s.data, b.id, s.imran.id, late));
    expect(s.data.appointments[0]).toMatchObject({ status: "NO_SHOW", closedBy: s.imran.id });
    const items = K.ownerChecks(s.data, late).items;
    expect(items.some((i) => i.title.includes("marked no-show") && i.detail.includes("Imran"))).toBe(true);
  });

  it("5: a booking saved this morning stops a check-in with the clock set back", () => {
    const s = setup();
    const c = s.add("9876500001", "Asha");
    s.run(E.bookAppointment(s.data, { customerId: c.id, serviceIds: ["haircut"], staffId: s.imran.id, day: "2026-10-15", time: "12:00", source: "PHONE", by: null }, NOW));
    expect(() => E.markAttendance(s.data, { staffId: s.sunita.id, photoKey: null }, at(-30 * MIN))).toThrow("clock is behind");
  });

  it("6: deleting a referred friend leaves no trace of their name", () => {
    const s = setup();
    const ref = s.add("9876500001", "Ravi");
    const friend = s.add("9876500002", "Zed Erasetest", { referredBy: ref.referralCode });
    s.bill(friend.id, NOW);
    expect(s.data.walletTxs.find((t) => t.customerId === ref.id)?.note).toBe(E.REFERRAL_NOTE);
    // Older data named the friend; erasing them cleans that up too.
    s.data = { ...s.data, walletTxs: s.data.walletTxs.map((t) => (t.customerId === ref.id ? { ...t, note: "Referred Zed Erasetest" } : t)) };
    s.run(E.closeWallet(s.data, { customerId: friend.id, method: "CASH", by: "owner" }, at(MIN)));
    s.run(E.deleteCustomer(s.data, { customerId: friend.id, by: "owner" }, at(2 * MIN)));
    expect(JSON.stringify(s.data)).not.toContain("Erasetest");
  });

  it("7: restoring an older backup keeps deleted customers deleted", () => {
    const s = setup();
    const c = s.add("9876500001", "Zed Erasetest");
    const old = K.readBackup(K.exportBackup(s.data).text);
    s.run(E.deleteCustomer(s.data, { customerId: c.id, by: "owner" }, NOW));
    const restored = K.prepareRestore(s.data, old, at(MIN));
    expect(restored.customers.find((x) => x.id === c.id)?.deletedAt).toBeTruthy();
    expect(JSON.stringify(restored.customers)).not.toContain("Erasetest");
    expect(restored.privacyLog.some((e) => e.type === "DELETED" && e.customerId === c.id)).toBe(true);
  });

  it("cash refunds from closing a wallet come off the expected drawer total", () => {
    const s = setup();
    const c = s.add("9876500001", "Asha");
    s.run(E.topUp(s.data, { customerId: c.id, amount: 500, method: "CASH" }, NOW));
    s.run(E.closeWallet(s.data, { customerId: c.id, method: "CASH", by: "owner" }, at(MIN)));
    expect(K.expectedCash(s.data, "2026-10-14").total).toBe(0);
    expect(config.retention.inactiveCustomerDays).toBeGreaterThan(0);
  });
});

describe("run 3 recon gaps", () => {
  it("a backup with a future timestamp is refused, and a file's clock watch is never taken", () => {
    const s = setup();
    s.add("9876500001", "Asha");
    const good = JSON.parse(K.exportBackup(s.data).text);
    const future = JSON.parse(JSON.stringify(good));
    future.data.customers[0].createdAt = new Date(NOW.getTime() + 400 * DAY).toISOString();
    expect(() => K.readBackup(JSON.stringify(future), NOW)).toThrow();
    const withClock = JSON.parse(JSON.stringify(good));
    withClock.data.clock = { lastSeen: "2020-01-01T00:00:00.000Z", backJumps: [], hold: null };
    withClock.data.demo = true;
    const read = K.readBackup(JSON.stringify(withClock), NOW);
    expect(read.clock).toBeUndefined();
    expect(read.demo).toBe(false);
  });

  it("booking, starting a visit, deleting a customer and leave decisions refuse a clock set back", () => {
    const s = setup();
    const c = s.add("9876500001", "Asha");
    s.bill(c.id, NOW);
    const back = new Date(NOW.getTime() - 2 * DAY);
    expect(() => E.startVisit(s.data, { customerId: c.id, serviceIds: ["haircut"], addOnIds: [], staffId: s.imran.id }, back)).toThrow("clock is behind");
    expect(() => E.deleteCustomer(s.data, { customerId: c.id, by: "owner" }, back)).toThrow("clock is behind");
    expect(() => E.requestLeave(s.data, { staffId: s.imran.id, from: "2026-10-20", to: "2026-10-20", type: "CASUAL" }, back)).toThrow("clock is behind");
  });
});

