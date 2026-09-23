// Milik Orang 4 — halaman preview SEMENTARA untuk verifikasi FR-020 s/d FR-024.
// Dihapus setelah Orang 3 memasang komponen transaksi di (dashboard).
// Membaca cookie tema di server (cookies() async di Next 16).

import { cookies } from "next/headers";

import { THEME_COOKIE_NAME, normalizeTheme } from "@/lib/preferences/theme";
import PreviewTransaksiClient from "./PreviewTransaksiClient";

export const metadata = {
  title: "Preview Transaksi — Duitku Tracker",
};

export default async function PreviewTransaksiPage() {
  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);

  return <PreviewTransaksiClient initialTheme={theme} />;
}
