import * as Crypto from "expo-crypto";
import type { Hasher } from "../domain/auth";

export const hasher: Hasher = {
  sha256: (text) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text),
  randomHex: (n) => Array.from(Crypto.getRandomBytes(n), (b) => b.toString(16).padStart(2, "0")).join(""),
};
