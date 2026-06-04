import { randomBytes, pbkdf2 } from "crypto";
import { promisify } from "util";

const pbkdf2Promise = promisify(pbkdf2);

/**
 * Hashes a plaintext password using PBKDF2 with SHA-512 and 100,000 iterations.
 * Returns a string formatted as "salt:hash"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await pbkdf2Promise(password, salt, 100000, 64, "sha512");
  const hash = derivedKey.toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored "salt:hash" string.
 */
export async function verifyPassword(password: string, storedValue: string): Promise<boolean> {
  const parts = storedValue.split(":");
  if (parts.length !== 2) return false;
  
  const [salt, originalHash] = parts;
  const derivedKey = await pbkdf2Promise(password, salt, 100000, 64, "sha512");
  const hash = derivedKey.toString("hex");
  return hash === originalHash;
}
