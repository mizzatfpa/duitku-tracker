import Link from "next/link";
import { requireSession } from "@/lib/auth/dal";
import { LogoutButton } from "@/lib/auth/logout-button";

export default async function Home() {
  const session = await requireSession();
  const isAuthenticated = Boolean(session?.userId);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Duitku Tracker
          </h1>
          <p className="leading-6 text-zinc-600 dark:text-zinc-400">
            Catat pemasukan dan pengeluaran, pantau saldo, dan tetap tahu kondisi
            keuanganmu setiap hari.
          </p>
        </div>
        {isAuthenticated ? (
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Buka Dashboard
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Daftar Akun
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}