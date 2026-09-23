// Milik Orang 4 — preferensi tema (cookie `theme`, terpisah dari cookie session Orang 1).
// SRS: FR-023, NFR-004. Tidak ada akses database di sini.

export const THEME_COOKIE_NAME = "theme";

export type Theme = "light" | "dark";

export function normalizeTheme(value: unknown): Theme {
  return value === "dark" ? "dark" : "light";
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}
