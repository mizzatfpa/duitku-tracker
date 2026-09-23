import type { Metadata } from "next";
import Link from "next/link";
import { verifySession, getCurrentUser } from "@/lib/auth/dal";
import { LogoutButton } from "@/lib/auth/logout-button";

export const metadata: Metadata = {
  title: "Dashboard | Duitku Tracker",
};

/**
 * Halaman dashboard (placeholder di branch autentikasi). verifySession()
 * mengarahkan pengguna tanpa session ke /login, lalu getCurrentUser()
 * mengambil identitas pengguna masuk tanpa hash kata sandi. Isi dashboard
 * diisi oleh pemilik halaman; pertahankan kedua pemanggilan tersebut.
 */
export default async function DashboardPage() {
  await verifySession();
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Selamat datang, {user?.name}! ({user?.email})
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Ringkasan keuangan dan riwayat transaksi akan tampil di sini.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Beranda
          </Link>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}