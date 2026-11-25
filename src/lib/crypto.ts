import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

const MAX_PASSWORD = 128;

export async function hashPassword(password: string) {
  if (password.length < 10 || password.length > MAX_PASSWORD) throw new Error("CRM:weak_password");
  const salt = randomBytes(16).toString("base64url");
  const key = (await scryptAsync(password, salt, 32)) as Buffer;
  return `scrypt$${salt}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  if (password.length < 1 || password.length > MAX_PASSWORD) return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const key = (await scryptAsync(password, salt, 32)) as Buffer;
  const expected = Buffer.from(hash, "base64url");
  if (key.length !== expected.length) return false;
  return timingSafeEqual(key, expected);
}

let dummyHash: Promise<string> | null = null;

export function dummyPasswordHash() {
  dummyHash ??= hashPassword(randomBytes(24).toString("base64url"));
  return dummyHash;
}
