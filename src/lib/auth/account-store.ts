import "server-only";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { User, UserDTO } from "@/lib/auth/types";

/**
 * PLACEHOLDER repositori akun — boilerplate autentikasi.
 *
 * Skema database PostgreSQL (tabel `users`) belum dibuat. Sesuai SRS Bagian 8,
 * lapisan data akun menjadi milik Orang 2 (`src/lib/users/**`, `src/lib/db/**`).
 * Modul ini hanya menyediakan kontrak serah-terima autentikasi agar alur
 * daftar/masuk dapat diuji; ganti isi implementasinya dengan operasi penyimpanan
 * akun milik Orang 2 tanpa mengubah bentuk kontrak di bawah ini:
 *
 *   createAccount({ name, email, passwordHash }) → Promise<User>
 *   findAccountByEmail(email)                    → Promise<User | null>
 *   findAccountById(id)                          → Promise<User | null>
 */
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export class AccountAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Account with email ${email} already exists.`);
    this.name = "AccountAlreadyExistsError";
  }
}

async function readUsers(): Promise<User[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as User[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    console.error("Gagal membaca penyimpanan akun:", error);
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findAccountByEmail(email: string): Promise<User | null> {
  const users = await readUsers();
  const normalized = normalizeEmail(email);
  return users.find((u) => u.email === normalized) ?? null;
}

export async function findAccountById(id: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function createAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const users = await readUsers();
  const email = normalizeEmail(input.email);

  if (users.some((u) => u.email === email)) {
    throw new AccountAlreadyExistsError(email);
  }

  const user: User = {
    id: randomUUID(),
    name: input.name,
    email,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };

  await writeUsers([...users, user]);
  return user;
}

/** DTO tanpa hash kata sandi; hanya boleh dikirim ke browser. */
export function toUserDTO(user: User): UserDTO {
  return { id: user.id, name: user.name, email: user.email };
}