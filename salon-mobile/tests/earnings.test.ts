import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as E from "../src/domain/engine";
import { change, earningsOverview, paidBy, shortInr, stylistPeriod, stylistSeries } from "../src/domain/earnings";
import { emptyData, type Data, type Visit } from "../src/domain/types";

const SECRET = { salt: "x", hash: "y" };
// Wednesday 14 Oct 2026, 4:00 PM IST.
const NOW = new Date("2026-10-14T10:30:00.000Z");
// Engine defaults use the phone's clock; pin it to the test day so records are saved in time order.
beforeEach(() => vi.useFakeTimers({ now: NOW, toFake: ["Date"] }));
afterEach(() => vi.useRealTimers());

function setup() {
  let data: Data = emptyData();
  const run = <T,>(op: { data: Data; result: T }) => ((data = op.data), op.result);
  const imran = run(E.addStaff(data, { name: "Imran Khan", phone: "9811100001", chair: "Chair 1", secret: SECRET }));
  const sunita = run(E.addStaff(data, { name: "Sunita Devi", phone: "9811100002", chair: "Chair 2", secret: SECRET }));
  const aarav = run(E.createCustomer(data, { phone: "9876543210", name: "Aarav Sharma", consent: true }));
  let n = 0;
  // IST wall-clock "YYYY-MM-DD HH:MM".
  const visit = (staffId: string, ist: string, total: number, extra: Partial<Visit> = {}) => {
    const at = new Date(new Date(`${ist.replace(" ", "T")}:00Z`).getTime() - 330 * 60000).toISOString();
    const v: Visit = { id: `v${++n}`, customerId: aarav.id, serviceIds: ["haircut"], staffId, addOnIds: [], total, walletPaid: 0, directPaid: total, paymentMethod: "UPI", status: "PAID", createdAt: at, paidAt: at, voidedAt: null, voidReason: null, ...extra };
    data = { ...data, visits: [...data.visits, v] };
  };
  return { get data() { return data; }, imran, sunita, visit };
}

describe("earnings", () => {
  it("compares today with the same weekday last week up to the same time, and skips voided bills", () => {
    const s = setup();
    s.visit(s.imran.id, "2026-10-14 11:00", 300);
    s.visit(s.sunita.id, "2026-10-14 12:00", 900);
    s.visit(s.sunita.id, "2026-10-14 13:00", 500, { status: "VOID" });
    s.visit(s.imran.id, "2026-10-07 11:00", 600); // last Wed, before 4 PM: counted
    s.visit(s.imran.id, "2026-10-07 18:00", 900); // last Wed, after 4 PM: not yet
    const o = earningsOverview(s.data, NOW);
    expect(o.day.total).toBe(1200);
    expect(o.day.prev).toBe(600);
    expect(o.day.prevLabel).toBe("Last Wed by 4:00 PM");
    expect(change(o.day.total, o.day.prev)).toBe(100);
    expect(o.day.staff.map((x) => [x.name, x.customers, x.earned])).toEqual([
      ["Sunita Devi", 1, 900],
      ["Imran Khan", 1, 300],
    ]);
    expect(o.day.trend.vals).toHaveLength(7);
    expect(o.day.trend.note).toContain("Tue closed");
  });

  it("counts 7 days, the month so far against the same days last month, and 6 months of bars", () => {
    const s = setup();
    s.visit(s.imran.id, "2026-10-08 11:00", 300); // in last 7 days
    s.visit(s.imran.id, "2026-10-07 11:00", 450); // previous 7 days
    s.visit(s.imran.id, "2026-09-10 11:00", 1000); // September 1–14
    s.visit(s.imran.id, "2026-09-20 11:00", 2000); // September, later
    const o = earningsOverview(s.data, NOW);
    expect([o.week.total, o.week.prev]).toEqual([300, 450]);
    expect([o.month.total, o.month.prev]).toEqual([750, 1000]);
    expect(o.month.label).toBe("October 1–14");
    expect(o.month.trend.labels).toEqual(["May", "Jun", "Jul", "Aug", "Sep", "Oct"]);
    expect(o.month.trend.vals.slice(4)).toEqual([3000, 750]);
    expect(o.month.trend.outline).toBe(3000);
    expect(o.week.trend.labels.at(-1)).toBe("Now");
    expect(change(5, 0)).toBeNull();
    expect(shortInr(106000)).toBe("₹1.06L");
    expect(shortInr(6800)).toBe("₹6.8k");
  });

  it("builds the stylist's line graphs and lists", () => {
    const s = setup();
    s.visit(s.sunita.id, "2026-10-14 10:40", 900, { walletPaid: 900, directPaid: 0, paymentMethod: null });
    s.visit(s.sunita.id, "2026-10-12 12:00", 1100);
    s.visit(s.sunita.id, "2026-10-02 12:00", 400);
    s.visit(s.sunita.id, "2026-09-09 12:00", 700);
    s.visit(s.sunita.id, "2026-09-20 12:00", 800);

    const day = stylistSeries(s.data, s.sunita.id, "day", NOW);
    expect(day.labels).toEqual(["Thu 8", "Fri 9", "Sat 10", "Sun 11", "Mon 12", "Tue 13", "Today"]);
    expect(day.vals).toEqual([0, 0, 0, 0, 1100, null, 900]);
    expect(day.closed).toEqual([5]);

    const week = stylistSeries(s.data, s.sunita.id, "week", NOW);
    expect(week.labels).toEqual(["1–7", "8–14", "15–21", "22–28", "29–31"]);
    expect(week.vals).toEqual([400, 2000, null, null, null]);
    expect(week.ghost).toEqual([0, 700, 800, 0, 0]);
    expect(week.partial).toBe(1);
    expect(week.ghostName).toBe("September");

    const month = stylistSeries(s.data, s.sunita.id, "month", NOW);
    expect(month.vals.slice(-2)).toEqual([1500, 2400]);
    expect(month.best).toBe(11);

    const today = stylistPeriod(s.data, s.sunita.id, "day", NOW);
    expect(today.list.kind).toBe("customers");
    if (today.list.kind === "customers") expect(today.list.rows[0]).toMatchObject({ time: "10:40", amount: 900, method: "Wallet" });
    const wk = stylistPeriod(s.data, s.sunita.id, "week", NOW);
    expect([wk.total, wk.prev, wk.cmpWord]).toEqual([2000, 700, "vs September"]);
    if (wk.list.kind === "sums") expect(wk.list.rows.find((r) => r.label === "Tue 13 Oct")?.closed).toBe(true);
    expect(paidBy({ walletPaid: 100, directPaid: 200, paymentMethod: "CASH" } as Visit)).toBe("Wallet + Cash");
  });
});
