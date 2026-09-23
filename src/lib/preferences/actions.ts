"use server";

// Milik Orang 4 — Server Action penyimpan tema via cookie.
// SRS: FR-023 (disimpan cookie, diterapkan setelah reload), NFR-004
// (cookie tema bukan bukti autentikasi → httpOnly false, SameSite lax).

import { cookies } from "next/headers";

import {
  THEME_COOKIE_NAME,
  normalizeTheme,
  type Theme,
} from "@/lib/preferences/theme";

export async function setThemeCookie(theme: Theme): Promise<void> {
  const value = normalizeTheme(theme);
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE_NAME, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
