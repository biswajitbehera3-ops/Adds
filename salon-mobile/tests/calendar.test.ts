import { describe, expect, it } from "vitest";
import * as C from "../src/domain/calendar";
import { emptyData } from "../src/domain/types";

describe("calendar arithmetic", () => {
  it("lays October 2026 out Monday-first", () => {
    const g = C.monthGrid("2026-10");
    expect(g.lead).toBe(3); // 1 Oct 2026 is a Thursday
    expect(g.days).toHaveLength(31);
    expect(g.rows).toBe(5);
    expect(C.monthGrid("2026-02").days).toHaveLength(28);
  });

  it("finds the week, steps months and formats times", () => {
    expect(C.weekOf("2026-10-14")).toEqual(["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"]);
    expect(C.addMonths("2026-12", 1)).toBe("2027-01");
    expect(C.addMonths("2026-01", -1)).toBe("2025-12");
    expect(C.clock("17:30")).toEqual({ time: "5:30", ampm: "PM" });
    expect(C.clock("10:00")).toEqual({ time: "10:00", ampm: "AM" });
    expect(C.shortDay("2026-10-17")).toBe("Sat 17 Oct");
    expect(C.isClosed("2026-10-13")).toBe(true); // Tuesday
    expect(C.salonMinutesNow(new Date("2026-10-14T08:40:00Z"))).toBe(14 * 60 + 10);
  });

  it("shows a booking as late, in the chair or done", () => {
    const data = { ...emptyData(), visits: [{ id: "v1", status: "OPEN" }] } as never;
    const now = new Date("2026-10-14T09:00:00Z");
    expect(C.bookingState(data, { status: "BOOKED", at: "2026-10-14T10:00:00Z", visitId: null }, now)).toBe("booked");
    expect(C.bookingState(data, { status: "BOOKED", at: "2026-10-14T08:00:00Z", visitId: null }, now)).toBe("late");
    expect(C.bookingState(data, { status: "ARRIVED", at: "2026-10-14T08:00:00Z", visitId: "v1" }, now)).toBe("inchair");
    expect(C.bookingState(data, { status: "ARRIVED", at: "2026-10-14T08:00:00Z", visitId: null }, now)).toBe("done");
    expect(C.bookingState(data, { status: "NO_SHOW", at: "2026-10-14T08:00:00Z", visitId: null }, now)).toBe("noshow");
  });
});
