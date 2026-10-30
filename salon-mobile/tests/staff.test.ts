import { describe, expect, it } from "vitest";
import * as E from "../src/domain/engine";
import { emptyData, type Data } from "../src/domain/types";

const SECRET = { salt: "x", hash: "y" };

describe("owner's staff accounts", () => {
  it("adds a stylist with photo, shift start and weekly off, and validates them", () => {
    let data: Data = emptyData();
    const s = E.addStaff(data, { name: "  Meera   Arora ", phone: "98111 00009", chair: "Chair 4", secret: SECRET, photoKey: "staff-abc", shiftStart: "9:30", weeklyOff: 1 });
    data = s.data;
    expect(s.result).toMatchObject({ name: "Meera Arora", phone: "9811100009", photoKey: "staff-abc", shiftStart: "09:30", weeklyOff: 1, active: true });
    expect(() => E.addStaff(data, { name: "X", phone: "9811100010", chair: "", secret: SECRET, shiftStart: "25:00" })).toThrow("HH:MM");
    expect(() => E.addStaff(data, { name: "X", phone: "9811100010", chair: "", secret: SECRET, weeklyOff: 7 })).toThrow("weekly off");
    // Without the extras a stylist follows the salon's shift and closed days.
    const plain = E.addStaff(data, { name: "Ravi", phone: "9811100011", chair: "", secret: SECRET }).result;
    expect(plain.shiftStart).toBeUndefined();
    expect(plain.weeklyOff).toBeUndefined();
  });

  it("updates mobile, chair, photo and shift, refusing a number another stylist uses", () => {
    let data: Data = emptyData();
    const a = E.addStaff(data, { name: "Imran", phone: "9811100001", chair: "Chair 1", secret: SECRET });
    data = a.data;
    const b = E.addStaff(data, { name: "Sunita", phone: "9811100002", chair: "Chair 2", secret: SECRET });
    data = b.data;
    const up = E.updateStaff(data, a.result.id, { phone: "+91 98111 00005", chair: " Chair 5 ", photoKey: "staff-p", shiftStart: "10:30", weeklyOff: null });
    expect(up.result).toMatchObject({ phone: "9811100005", chair: "Chair 5", photoKey: "staff-p", shiftStart: "10:30", weeklyOff: null });
    expect(() => E.updateStaff(up.data, a.result.id, { phone: "9811100002" })).toThrow("already exists");
    expect(() => E.updateStaff(up.data, a.result.id, { name: "  " })).toThrow("name");
    // A patch that doesn't mention the photo keeps it.
    expect(E.updateStaff(up.data, a.result.id, { active: false }).result).toMatchObject({ active: false, photoKey: "staff-p" });
  });
});

describe("a stylist's own shift and weekly off", () => {
  it("counts late against their shift and their own day off as off, not absent", () => {
    let data: Data = emptyData();
    const s = E.addStaff(data, { name: "Neha Kapoor", phone: "9811100009", chair: "Chair 4", secret: { salt: "x", hash: "y" }, shiftStart: "12:00", weeklyOff: 1 });
    data = s.data;
    // 11:50 IST check-in on Wed 4 Nov: on time for a 12:00 shift, late for the salon's 10:00.
    data = E.markAttendance(data, { staffId: s.result.id, photoKey: null }, new Date("2026-11-04T06:20:00.000Z")).data;
    const a = E.myAttendance(data, s.result.id, "2026-11", new Date("2026-11-04T08:00:00.000Z"));
    expect(a.cells.find((c) => c.date === "2026-11-04")!.kind).toBe("present");
    const past = E.myAttendance(data, s.result.id, "2026-11", new Date("2026-11-17T08:00:00.000Z"));
    expect(past.cells.find((c) => c.date === "2026-11-09")!.kind).toBe("off"); // Monday, her own off
    expect(past.cells.find((c) => c.date === "2026-11-10")!.kind).toBe("off"); // Tuesday, salon closed
    expect(E.leaveWorkingDays("2026-11-09", "2026-11-11", false, s.result)).toBe(1);
  });
});
