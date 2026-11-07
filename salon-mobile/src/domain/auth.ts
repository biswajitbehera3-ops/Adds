/**
 * Passwords are never stored: only a random salt and SHA-256(salt + password).
 * This protects a shared salon phone from casual snooping; it is not a defence
 * against someone who has rooted the device.
 */
import { UserError } from "./errors";
import type { Secret } from "./types";

export type Hasher = { sha256: (text: string) => Promise<string>; randomHex: (bytes: number) => string };

export const MIN_PASSWORD = 4;

export async function makeSecret(password: string, h: Hasher): Promise<Secret> {
  if (password.length < MIN_PASSWORD) throw new UserError(`Password must be at least ${MIN_PASSWORD} characters`);
  const salt = h.randomHex(16);
  return { salt, hash: await h.sha256(salt + password) };
}

export async function checkSecret(secret: Secret, password: string, h: Hasher): Promise<boolean> {
  return (await h.sha256(secret.salt + password)) === secret.hash;
}
