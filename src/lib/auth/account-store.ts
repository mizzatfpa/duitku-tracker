import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { User, UserDTO } from "@/lib/auth/types";
import { authLog, authWarn, authError } from "@/lib/auth/logger";

/**
 * Repositori akun autentikasi — membaca/menulis tabel PostgreSQL `users`
 * (skema prisma/schema.prisma) lewat klien `src/lib/db/prisma`.
 * Penyimpanan akun dipusatkan di sini dengan kontrak tetap:
 *
 *   createAccount({ name, email, passwordHash }) → Promise<User>
 *   findAccountByEmail(email)                    → Promise<User | null>
 *   findAccountById(id)                          → Promise<User | null>
 *
 * Kolom `password` pada tabel berisi hash bcrypt (bukan teks asli). Duplikat
 * email ditolak oleh unique constraint (error Prisma P2002) lalu diubah
 * menjadi AccountAlreadyExistsError agar Server Action menampilkan pesan
 * "email sudah terdaftar".
 */

export class AccountAlreadyExistsError extends Error {
  readonly email: string;

  constructor(email: string) {
    super(`Account with email ${email} already exists.`);
    this.name = "AccountAlreadyExistsError";
    this.email = email;
  }
}

/** Kolom yang dibutuhkan autentikasi; hash kata sandi tidak pernah keluar server. */
const ACCOUNT_SELECT = {
  id: true,
  email: true,
  password: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { name?: unknown; code?: unknown };
  return (
    candidate.name === "PrismaClientKnownRequestError" &&
    candidate.code === "P2002"
  );
}

export async function findAccountByEmail(email: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: ACCOUNT_SELECT,
    });
  } catch (error) {
    authError("account-store", "findAccountByEmail gagal", error);
    throw error;
  }
}

export async function findAccountById(id: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: ACCOUNT_SELECT,
    });
  } catch (error) {
    authError("account-store", "findAccountById gagal", error, { userId: id });
    throw error;
  }
}

export async function createAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const email = normalizeEmail(input.email);

  try {
    const user = await prisma.user.create({
      data: { email, password: input.passwordHash, name: input.name },
      select: ACCOUNT_SELECT,
    });
    authLog("account-store", "akun dibuat", { userId: user.id, email });
    return user;
  } catch (error) {
    if (isUniqueViolation(error)) {
      authWarn("account-store", "pendaftaran ditolak: email sudah terdaftar", {
        email,
      });
      throw new AccountAlreadyExistsError(email);
    }
    authError("account-store", "createAccount gagal", error);
    throw error;
  }
}

/** DTO tanpa hash kata sandi; hanya boleh dikirim ke browser. */
export function toUserDTO(user: User): UserDTO {
  return { id: user.id, name: user.name, email: user.email };
}