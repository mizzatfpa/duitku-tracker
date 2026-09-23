"use client";

// Milik Orang 4 — tombol pilih tema terang/gelap (FR-023).
// Dipasang oleh Orang 3 di dashboard; tidak menghitung ringkasan / render riwayat.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";

import { setThemeCookie } from "@/lib/preferences/actions";
import { oppositeTheme, type Theme } from "@/lib/preferences/theme";

interface ThemeToggleProps {
  initialTheme?: Theme;
}

export default function ThemeToggle({
  initialTheme = "light",
}: ThemeToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const next = oppositeTheme(theme);
  const busy = isPending;

  function handleClick() {
    const target = oppositeTheme(theme);
    setTheme(target);
    startTransition(async () => {
      try {
        await setThemeCookie(target);
      } finally {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={
        theme === "dark"
          ? "Ubah ke tema terang"
          : "Ubah ke tema gelap"
      }
      title={
        theme === "dark" ? "Tema terang" : "Tema gelap"
      }
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-app-border bg-surface text-app-muted shadow-sm transition hover:bg-primary-100 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-primary-300"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="sr-only">
        {next === "dark" ? "Aktifkan tema gelap" : "Aktifkan tema terang"}
      </span>
    </button>
  );
}
