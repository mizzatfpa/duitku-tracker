"use server";

import { redirect } from "next/navigation";
import { signupSchema, loginSchema } from "@/lib/auth/validations";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createAccount,
  findAccountByEmail,
  AccountAlreadyExistsError,
} from "@/lib/auth/account-store";
import { createSession, deleteSession } from "@/lib/auth/session";
import type { AuthFormState, User } from "@/lib/auth/types";
import { authLog, authWarn, authError } from "@/lib/auth/logger";

const DB_ERROR_MESSAGE =
  "Terjadi kesalahan saat menghubungi database. Pastikan DATABASE_URL di .env sudah diisi, lalu coba lagi.";

/**
 * Server Action daftar akun. Validasi backend memakai skema yang sama
 * dengan validasi front end (lihat src/lib/auth/validations.ts). Email
 * duplikat ditolak dua lapis: pengecekan awal lalu constraint unik DB (P2002).
 */
export async function signup(
  state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const result = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    authWarn("actions", "signup: validasi gagal", {
      fields: Object.keys(result.error.flatten().fieldErrors),
    });
    return { errors: result.error.flatten().fieldErrors };
  }

  const { name, email, password } = result.data;

  let existing: User | null = null;
  try {
    existing = await findAccountByEmail(email);
  } catch (error) {
    authError("actions", "signup: pengecekan email gagal (database)", error);
    return { message: DB_ERROR_MESSAGE };
  }

  if (existing) {
    authWarn("actions", "signup ditolak: email sudah terdaftar", { email });
    return { errors: { email: ["Email sudah terdaftar."] } };
  }

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await createAccount({ name, email, passwordHash });
  } catch (error) {
    if (error instanceof AccountAlreadyExistsError) {
      authWarn("actions", "signup ditolak: email sudah terdaftar (race)", {
        email,
      });
      return { errors: { email: ["Email sudah terdaftar."] } };
    }
    authError("actions", "signup: pembuatan akun gagal", error);
    return { message: "Terjadi kesalahan saat membuat akun. Coba lagi." };
  }

  await createSession(user.id);
  authLog("actions", "signup berhasil", { userId: user.id, email });
  redirect("/dashboard");
}

/**
 * Server Action masuk. Validasi backend memakai skema yang sama dengan
 * validasi front end. Pesan error sengaja dikaburkan agar tidak
 * membocorkan alamat email mana yang sudah terdaftar pada sistem.
 */
export async function login(
  state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    authWarn("actions", "login: validasi gagal", {
      fields: Object.keys(result.error.flatten().fieldErrors),
    });
    return { errors: result.error.flatten().fieldErrors };
  }

  const { email, password } = result.data;

  let user: User | null = null;
  try {
    user = await findAccountByEmail(email);
  } catch (error) {
    authError("actions", "login: pengecekan kredensial gagal (database)", error);
    return { message: DB_ERROR_MESSAGE };
  }

  if (!user) {
    authWarn("actions", "login ditolak: kredensial salah", { email });
    return { message: "Email atau kata sandi salah." };
  }

  const passwordValid = await verifyPassword(password, user.password);
  if (!passwordValid) {
    authWarn("actions", "login ditolak: kredensial salah", { email });
    return { message: "Email atau kata sandi salah." };
  }

  await createSession(user.id);
  authLog("actions", "login berhasil", { userId: user.id, email });
  redirect("/dashboard");
}

/**
 * Server Action keluar — menghapus cookie session (deleteSession) lalu
 * mengarahkan pengguna ke halaman masuk.
 */
export async function logout(
  _state: AuthFormState,
  _formData: FormData
): Promise<AuthFormState> {
  await deleteSession();
  authLog("actions", "logout berhasil");
  redirect("/login");
}