import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as E from "../src/domain/engine";
import { liveFloor } from "../src/domain/live";
import { emptyData, type Data } from "../src/domain/types";

const SECRET = { salt: "x", hash: "y" };
// Wednesday 14 Oct 2026, 10:30 IST.
const NOW = new Date("2026-10-14T05:00:00.000Z");
// Engine defaults use the phone's clock; pin it to the test day so records are saved in time order.
beforeEach(() => vi.useFakeTimers({ now: NOW, toFake: ["Date"] }));
afterEach(() => vi.useRealTimers());
const later = (min: number) => new Date(NOW.getTime() + min * 60000);

describe("live floor", () => {
  it("puts a customer in the chair from start of visit until payment, and shows who is off", () => {
    let data: Data = emptyData();
    const run = <T,>(op: { data: Data; result: T }) => ((data = op.data), op.result);
    const imran = run(E.addStaff(data, { name: "Imran Khan", phone: "9811100001", chair: "Chair 1", secret: SECRET }));
    const sunita = run(E.addStaff(data, { name: "Sunita Rao", phone: "9811100002", chair: "Chair 2", secret: SECRET }));
    const rakesh = run(E.addStaff(data, { name: "Rakesh Kumar", phone: "9811100003", chair: "Chair 3", secret: SECRET }));
    run(E.markAttendance(data, { staffId: imran.id, photoKey: null }, NOW));
    data = { ...data, leaves: [{ id: "l1", staffId: sunita.id, from: "2026-10-14", to: "2026-10-14", type: "SICK", halfDay: false, note: "", status: "APPROVED", reason: null, decidedAt: NOW.toISOString(), bookings: null, seenAt: null, createdAt: NOW.toISOString() }] };
    const karan = run(E.createCustomer(data, { phone: "9876543210", name: "Karan Mehta", consent: true }));

    let f = liveFloor(data, NOW);
    expect(f.chairs.map((c) => c.state)).toEqual(["free", "off", "notIn"]);
    expect(f.chairs[1].offReason).toBe("leave");
    expect(f.working).toBe(2);

    const v = run(E.startVisit(data, { customerId: karan.id, serviceIds: ["haircut", "beard"], addOnIds: [], staffId: imran.id }, NOW));
    f = liveFloor(data, later(18));
    expect(f.chairs[0]).toMatchObject({ state: "busy", customerName: "Karan Mehta", services: "Haircut + Beard trim", amount: 450, minutesTotal: 45 });
    expect(Math.round(f.chairs[0].minutesDone)).toBe(18);
    expect(f.busy).toBe(1);

    run(E.checkoutVisit(data, { visitId: v.id, walletAmount: 0, paymentMethod: "UPI" }, later(40)));
    f = liveFloor(data, later(41));
    expect(f.chairs[0].state).toBe("free");
    expect(f.total).toBe(450);
    expect(rakesh.id).toBeTruthy();
  });

  it("shows the salon closed on its weekly off", () => {
    let data: Data = emptyData();
    data = E.addStaff(data, { name: "Imran Khan", phone: "9811100001", chair: "Chair 1", secret: SECRET }).data;
    expect(liveFloor(data, new Date("2026-10-20T05:00:00.000Z")).closed).toBe(true); // Tuesday
  });
});
