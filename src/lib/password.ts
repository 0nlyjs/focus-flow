import { randomBytes, pbkdf2Sync } from "crypto";

/**
 * Hashes a plaintext password using PBKDF2 with SHA-512 and 100,000 iterations.
 * Returns a string formatted as "salt:hash"
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored "salt:hash" string.
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  const parts = storedValue.split(":");
  if (parts.length !== 2) return false;
  
  const [salt, originalHash] = parts;
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return hash === originalHash;
}
