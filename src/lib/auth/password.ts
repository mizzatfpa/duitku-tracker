import "server-only";
import { hash, compare } from "bcryptjs";

// COST_FACTOR (work factor) bcrypt. Kelipatan 2^cost iterasi.
const COST_FACTOR = 10;

export function hashPassword(password: string): Promise<string> {
  return hash(password, COST_FACTOR);
}

export function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return compare(password, passwordHash);
}