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
