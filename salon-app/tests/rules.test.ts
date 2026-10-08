import { describe, expect, it } from "vitest";
import { dueDate, normalizePhone, priceVisit, startOfIstDay, topUpBonus, upsellsFor } from "@/lib/rules";

describe("normalizePhone", () => {
  it.each([
    ["9876543210", "9876543210"],
    ["+91 98765 43210", "9876543210"],
    ["09876543210", "9876543210"],
    ["98765-43210", "9876543210"],
  ])("%s → %s", (input, out) => expect(normalizePhone(input)).toBe(out));

  it.each(["12345", "5876543210", "98765432101", ""])("rejects %s", (input) =>
    expect(normalizePhone(input)).toBeNull(),
  );
});

describe("topUpBonus", () => {
  const tiers = [
    { minDeposit: 1000, bonusPercent: 5 },
    { minDeposit: 2000, bonusPercent: 10 },
    { minDeposit: 5000, bonusPercent: 15 },
  ];
  it.each([
    [999, 0],
    [1000, 50],
    [1999, 99],
    [2000, 200],
    [4999, 499],
    [5000, 750],
    [10000, 1500],
  ])("deposit %i → bonus %i", (deposit, bonus) => expect(topUpBonus(deposit, tiers)).toBe(bonus));
});

describe("priceVisit", () => {
  it("adds service and add-ons, ignoring duplicate add-ons", () => {
    const { total } = priceVisit({ serviceId: "haircut", addOnIds: ["head-massage", "head-massage"], staffId: "s1" });
    expect(total).toBe(300 + 150);
  });
  it("rejects unknown ids", () => {
    expect(() => priceVisit({ serviceId: "nope", addOnIds: [], staffId: "s1" })).toThrow("Unknown service");
    expect(() => priceVisit({ serviceId: "haircut", addOnIds: [], staffId: "x" })).toThrow("Unknown staff");
  });
});

describe("upsellsFor", () => {
  it("suggests add-ons configured for the service, minus chosen ones", () => {
    const ids = upsellsFor("haircut", ["hair-wash"]).map((a) => a.id);
    expect(ids).toContain("head-massage");
    expect(ids).not.toContain("hair-wash");
    expect(ids).not.toContain("colour-protect");
  });
});

describe("dueDate", () => {
  it("uses each service's own cycle", () => {
    const last = new Date("2026-01-01T00:00:00Z");
    expect(dueDate("beard", last)!.toISOString()).toBe("2026-01-15T00:00:00.000Z");
    expect(dueDate("hair-colour", last)!.toISOString()).toBe("2026-02-15T00:00:00.000Z");
  });
});

describe("startOfIstDay", () => {
  it("returns IST midnight in UTC", () => {
    expect(startOfIstDay(new Date("2026-10-08T20:00:00Z")).toISOString()).toBe("2026-10-08T18:30:00.000Z");
    expect(startOfIstDay(new Date("2026-10-08T17:00:00Z")).toISOString()).toBe("2026-10-07T18:30:00.000Z");
  });
});
