import "server-only";
import { findUserByEmail, findUserById, createUser } from "@/lib/users";
import type { User, UserDTO } from "@/lib/auth/types";
import { authLog, authWarn, authError } from "@/lib/auth/logger";

/**
 * Repositori akun autentikasi — lapisan tipis di atas modul data akun
 * `src/lib/users` (milik Orang 2). Autentikasi memakai operasi penyimpanan
 * tersebut sesuai serah-terima kontrak, bukan Prisma langsung:
 *
 *   createAccount({ name, email, passwordHash }) → Promise<NewAccount>
 *   findAccountByEmail(email)                    → Promise<User | null>   (termuat hash, untuk login)
 *   findAccountById(id)                          → Promise<UserDTO | null> (tanpa hash, aman ke browser)
 *
 * Duplikat email sudah dideteksi di modul Orang 2 (error P2002 diubah menjadi
 * pesan "Email sudah terdaftar."); di sini diterjemahkan kembali menjadi
 * AccountAlreadyExistsError agar Server Action memberi pesan yang sama.
 */

export class AccountAlreadyExistsError extends Error {
  readonly email: string;

  constructor(email: string) {
    super(`Account with email ${email} already exists.`);
    this.name = "AccountAlreadyExistsError";
    this.email = email;
  }
}

/** Pesan konsisten dari modul Orang 2 saat email sudah terdaftar. */
const DUPLICATE_EMAIL = "Email sudah terdaftar.";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findAccountByEmail(email: string): Promise<User | null> {
  try {
    return await findUserByEmail(normalizeEmail(email));
  } catch (error) {
    authError("account-store", "findAccountByEmail gagal", error);
    throw error;
  }
}

export async function findAccountById(id: string): Promise<UserDTO | null> {
  try {
    return await findUserById(id);
  } catch (error) {
    authError("account-store", "findAccountById gagal", error, { userId: id });
    throw error;
  }
}

export type NewAccount = Pick<User, "id" | "email" | "name" | "createdAt">;

/** Bentuk hasil createUser dari modul Orang 2 yang dipakai repo akun. */
type CreateUserResult =
  | { success: true; user: NewAccount }
  | { success: false; error: string };

export async function createAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<NewAccount> {
  const email = normalizeEmail(input.email);

  const result = (await createUser({
    email,
    passwordHash: input.passwordHash,
    name: input.name,
  })) as unknown as CreateUserResult;

  if (result.success) {
    authLog("account-store", "akun dibuat", { userId: result.user.id, email });
    return result.user;
  }

  if (result.error === DUPLICATE_EMAIL) {
    authWarn("account-store", "pendaftaran ditolak: email sudah terdaftar", {
      email,
    });
    throw new AccountAlreadyExistsError(email);
  }

  authError("account-store", "createAccount gagal", new Error(result.error));
  throw new Error(result.error);
}