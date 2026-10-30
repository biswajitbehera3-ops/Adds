/** SECURITY-LESSONS 8: a stored photo name is never a file path. */
import { describe, expect, it, vi } from "vitest";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: {} }));
vi.mock("expo-file-system/legacy", () => ({ documentDirectory: "file:///docs/" }));
vi.mock("expo-image-picker", () => ({}));
vi.mock("react-native", () => ({ Platform: { OS: "android" } }));

import { isSafePhotoKey } from "../src/platform/photos";

describe("photo names", () => {
  it("accepts the app's own names and refuses anything path-like", () => {
    for (const ok of ["s1_2026-10-14_1728890000000.jpg", "demo-a-12", "abc.jpg"]) expect(isSafePhotoKey(ok)).toBe(true);
    for (const bad of ["../../dummy", "..", "a/b.jpg", "a\\b", ".hidden", "x#y", "x?y", "a..b", "", "x".repeat(101), 5, null]) expect(isSafePhotoKey(bad)).toBe(false);
  });
});
