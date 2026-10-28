/** SECURITY-LESSONS R1-1: a read error never swaps in demo data or overwrites the saved salon. */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mem = new Map<string, string>();
let failRead = false;
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (k: string) => {
      if (failRead && k === "salon:data:v1") throw new Error("Row too big to fit into CursorWindow");
      return mem.get(k) ?? null;
    },
    setItem: async (k: string, v: string) => void mem.set(k, v),
    removeItem: async (k: string) => void mem.delete(k),
  },
}));
const deleted: string[] = [];
vi.mock("../src/platform/photos", () => ({ deletePhotos: async (keys: string[]) => void deleted.push(...keys) }));

import { createHash, randomBytes } from "node:crypto";
import { exportBackup } from "../src/domain/checks";
import { emptyData, type Data } from "../src/domain/types";

const hasher = { sha256: async (t: string) => createHash("sha256").update(t).digest("hex"), randomHex: (n: number) => randomBytes(n).toString("hex") };
const ownerSecret = async (pw: string) => ({ salt: "realsalt", hash: await hasher.sha256("realsalt" + pw) });

const REAL = JSON.stringify({ ...emptyData(), owner: { secret: { salt: "realsalt", hash: "realhash" } } });

beforeEach(() => {
  vi.resetModules();
  mem.clear();
  deleted.length = 0;
  failRead = false;
});
afterEach(() => vi.useRealTimers());

describe("loading the saved data", () => {
  it("a damaged session only signs out; the salon's data is kept", async () => {
    mem.set("salon:data:v1", REAL);
    mem.set("salon:session", "{not json");
    const store = await import("../src/domain/store");
    await store.loadStore();
    await new Promise((r) => setTimeout(r, 400));
    expect(store.getSession()).toBeNull();
    expect(store.getData().demo).toBe(false);
    expect(JSON.parse(mem.get("salon:data:v1")!).owner.secret.salt).toBe("realsalt");
  });

  it("a read error shows recovery, keeps the stored data untouched and refuses saves", async () => {
    mem.set("salon:data:v1", REAL);
    failRead = true;
    const store = await import("../src/domain/store");
    await store.loadStore();
    expect(store.getData().demo).toBe(false);
    expect(store.getData().owner).toBeNull();
    expect(() => store.commit((d) => ({ data: d, result: null }))).toThrow("couldn't be read");
    await new Promise((r) => setTimeout(r, 400));
    expect(mem.get("salon:data:v1")).toBe(REAL);
  });

  it("keeps a separate copy of the owner password, and the recovery restore needs it (run 3)", async () => {
    const secret = await ownerSecret("salonpass");
    mem.set("salon:data:v1", JSON.stringify({ ...emptyData(), owner: { secret } }));
    let store = await import("../src/domain/store");
    await store.loadStore();
    await new Promise((r) => setTimeout(r, 400));
    expect(JSON.parse(mem.get("salon:owner")!)).toEqual({ secret });

    // Now the main data can't be read. A crafted backup carries another owner password.
    const crafted = JSON.parse(exportBackup({ ...emptyData(), owner: { secret: await ownerSecret("attacker") } }).text);
    const { readBackup } = await import("../src/domain/checks");
    vi.resetModules();
    failRead = true;
    store = await import("../src/domain/store");
    await store.loadStore();
    expect(store.canRestoreAfterLoadFailure()).toBe(true);
    const file = readBackup(JSON.stringify(crafted));
    await expect(store.restoreAfterLoadFailure(file, "attacker", hasher)).rejects.toThrow("Wrong owner password");
    expect(() => store.commit((d) => ({ data: d, result: null }))).toThrow("couldn't be read");
    await store.restoreAfterLoadFailure(file, "salonpass", hasher);
    expect(store.getData().owner).toEqual({ secret });
    expect(store.getData().demo).toBe(false);
  });

  it("with no saved owner password, the recovery screen can't restore at all", async () => {
    mem.set("salon:data:v1", REAL);
    failRead = true;
    const store = await import("../src/domain/store");
    await store.loadStore();
    expect(store.canRestoreAfterLoadFailure()).toBe(false);
    await expect(store.restoreAfterLoadFailure(emptyData(), "anything", hasher)).rejects.toThrow("no saved owner password");
  });

  it("lost data with a saved owner password goes to recovery, never to demo data (run 3)", async () => {
    mem.set("salon:owner", JSON.stringify({ secret: await ownerSecret("salonpass") }));
    const store = await import("../src/domain/store");
    await store.loadStore();
    expect(store.canRestoreAfterLoadFailure()).toBe(true);
    expect(store.getData().demo).toBe(false);
    expect(() => store.commit((d) => ({ data: d, result: null }))).toThrow("couldn't be read");
  });

  it("a save made with the clock years ahead holds clean-up, and the owner can confirm the date after a long gap (run 3)", async () => {
    const T = new Date("2026-10-14T05:30:00Z");
    vi.useFakeTimers({ now: T, toFake: ["Date"] });
    const E = await import("../src/domain/engine");
    let d: Data = { ...emptyData(), owner: { secret: await ownerSecret("salonpass") } };
    d = E.createCustomer(d, { phone: "9876500001", name: "Asha", consent: true }, T).data;
    d = E.confirmClock(d, T).data;
    mem.set("salon:data:v1", JSON.stringify(d));
    let store = await import("../src/domain/store");
    await store.loadStore();
    vi.setSystemTime(new Date(T.getTime() + 1105 * 86400000));
    store.commit((x) => E.createCustomer(x, { phone: "9876500002", name: "Bina", consent: true }));
    expect(store.getData().clock?.hold).toBeTruthy();
    await new Promise((r) => setTimeout(r, 400));
    vi.resetModules();
    store = await import("../src/domain/store");
    await store.loadStore();
    expect(store.getData().customers.find((c) => c.phone === "9876500001")?.name).toBe("Asha");
    // After any gap, the owner's date confirmation still goes through and clean-up may run again.
    store.commit((x) => E.confirmClock(x));
    expect(store.getData().clock?.hold).toBeNull();
    expect(store.getData().clock?.confirmedAt).toBe(new Date(T.getTime() + 1105 * 86400000).toISOString());
  });

  it("a restore, clear all and demo data delete the selfie files they drop (run 3)", async () => {
    const T = new Date("2026-10-14T05:30:00Z");
    vi.useFakeTimers({ now: T, toFake: ["Date"] });
    const E = await import("../src/domain/engine");
    let d: Data = { ...emptyData(), owner: { secret: await ownerSecret("salonpass") } };
    const s = E.addStaff(d, { name: "Imran", phone: "9811100001", chair: "Chair 1", secret: await ownerSecret("1234") }, T);
    d = s.data;
    const older = d;
    d = E.markAttendance(d, { staffId: s.result.id, photoKey: "selfie-after-backup" }, T).data;
    mem.set("salon:data:v1", JSON.stringify(d));
    const store = await import("../src/domain/store");
    await store.loadStore();
    store.restoreBackup(older);
    await new Promise((r) => setTimeout(r, 50));
    expect(deleted).toContain("selfie-after-backup");
    deleted.length = 0;
    store.restoreBackup(d);
    store.clearAll();
    await new Promise((r) => setTimeout(r, 50));
    expect(deleted).toContain("selfie-after-backup");
  });

  it("a recovery restore of an old backup can be used straight away (run 3)", async () => {
    const T = new Date("2026-10-14T05:30:00Z");
    vi.useFakeTimers({ now: new Date(T.getTime() + 40 * 86400000), toFake: ["Date"] });
    const E = await import("../src/domain/engine");
    const secret = await ownerSecret("salonpass");
    let old: Data = { ...emptyData(), owner: { secret } };
    old = E.createCustomer(old, { phone: "9876500001", name: "Asha", consent: true }, T).data;
    mem.set("salon:owner", JSON.stringify({ secret }));
    failRead = true;
    mem.set("salon:data:v1", "x");
    const store = await import("../src/domain/store");
    await store.loadStore();
    const { readBackup } = await import("../src/domain/checks");
    await store.restoreAfterLoadFailure(readBackup(exportBackup(old, T).text), "salonpass", hasher);
    expect(() => store.commit((d) => E.topUp(d, { customerId: d.customers[0].id, amount: 1000, method: "CASH" }))).not.toThrow();
  });
});

