import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findAccountById, toUserDTO } from "@/lib/auth/account-store";
import type { UserDTO } from "@/lib/auth/types";

/**
 * Lapisan akses data autentikasi: memvalidasi session pada setiap operasi
 * yang membutuhkan identitas pengguna. Dibungkus React cache agar cookie
 * tidak dibaca berkali-kali dalam satu render.
 */
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return { isAuth: true, userId: session.userId } as const;
});

/** Mengambil pengguna yang sedang masuk (tanpa hash kata sandi), atau null. */
export const getCurrentUser = cache(async (): Promise<UserDTO | null> => {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await findAccountById(session.userId);
  return user ? toUserDTO(user) : null;
});

/**
 * Membaca session tanpa mengarahkan ke /login; dipakai oleh halaman publik
 * untuk menyesuaikan tampilan (masuk/belum masuk).
 */
export const requireSession = cache(async () => {
  const session = await getSession();
  return session;
});