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
vi.mock("../src/platform/photos", () => ({ deletePhotos: async () => {} }));

import { emptyData } from "../src/domain/types";

const REAL = JSON.stringify({ ...emptyData(), owner: { secret: { salt: "realsalt", hash: "realhash" } } });

beforeEach(() => {
  vi.resetModules();
  mem.clear();
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
});
