import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Daftar Akun | Duitku Tracker",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Duitku Tracker
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Buat akun untuk mulai mencatat pemasukan dan pengeluaranmu.
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-950 underline dark:text-zinc-50"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}