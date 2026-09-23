"use client";

import { useActionState } from "react";
import { logout } from "@/lib/auth/actions";

/** Tombol keluar — memanggil server action logout untuk menghapus session. */
export function LogoutButton() {
  const [, action, pending] = useActionState(logout, undefined);

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
      >
        {pending ? "Keluar…" : "Keluar"}
      </button>
    </form>
  );
}