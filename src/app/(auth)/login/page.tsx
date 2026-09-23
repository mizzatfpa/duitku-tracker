import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk | Duitku Tracker",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Duitku Tracker
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Masuk untuk melihat pemasukan dan pengeluaranmu.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-950 underline dark:text-zinc-50"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}