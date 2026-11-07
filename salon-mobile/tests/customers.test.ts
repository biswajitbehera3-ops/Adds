import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { billOf, topSpenders } from "../src/domain/customers";
import * as E from "../src/domain/engine";
import { buildDemoData } from "../src/domain/seed";

const NOW = new Date("2026-10-20T08:00:00Z");
// Engine defaults use the phone's clock; pin it to the test day so records are saved in time order.
beforeEach(() => vi.useFakeTimers({ now: NOW, toFake: ["Date"] }));
afterEach(() => vi.useRealTimers());

describe("Top spenders", () => {
  const data = buildDemoData(NOW.getTime());

  it("ranks customers by money spent, highest first, with share of earnings", () => {
    const t = topSpenders(data, { take: 20, period: "all" }, NOW);
    expect(t.rows.length).toBeGreaterThan(0);
    expect(t.rows.length).toBeLessThanOrEqual(20);
    for (let i = 1; i < t.rows.length; i++) expect(t.rows[i - 1].spent).toBeGreaterThanOrEqual(t.rows[i].spent);
    expect(t.total).toBe(t.rows.reduce((s, r) => s + r.spent, 0));
    const earnings = data.visits.filter((v) => v.status === "PAID").reduce((s, v) => s + v.total, 0);
    expect(t.earnings).toBe(earnings);
    expect(t.share).toBeCloseTo(t.total / earnings);
    expect(t.rows[0].mainStylist).toBeTruthy();
    expect(topSpenders(data, { take: 30 }, NOW).rows.length).toBeGreaterThanOrEqual(t.rows.length);
  });

  it("a shorter period never counts more, and cancelled bills don't count", () => {
    const all = topSpenders(data, { period: "all" }, NOW);
    const q = topSpenders(data, { period: "3m" }, NOW);
    expect(q.earnings).toBeLessThanOrEqual(all.earnings);
    const top = all.rows[0];
    const bill = data.visits.find((v) => v.customerId === top.id && v.status === "PAID")!;
    const { data: after } = E.voidVisit(data, { visitId: bill.id, by: "owner", reason: "Entered twice" }, NOW);
    const row = topSpenders(after, { period: "all" }, NOW).rows.find((r) => r.id === top.id)!;
    expect(row.spent).toBe(top.spent - bill.total);
    expect(row.visits).toBe(top.visits - 1);
  });

  it("lays out a bill with its items and number", () => {
    const v = data.visits.find((x) => x.status === "PAID")!;
    const b = billOf(data, v.id)!;
    expect(b.customer?.id).toBe(v.customerId);
    expect(b.items.length).toBe(v.serviceIds.length + v.addOnIds.length);
    expect(b.number).toBeGreaterThanOrEqual(1001);
    expect(billOf(data, "nope")).toBeNull();
  });
});
