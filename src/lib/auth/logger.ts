import "server-only";

/**
 * Log helpers alur autentikasi agar perilaku daftar/masuk/keluar mudah
 * ditelusuri di log server.
 *
 * Aturan:
 *  - Konfigurasi hanya SATU file `.env` — tidak ada env.dev/env.prod.
 *  - Metadata aman (userId, email) boleh dicatat; NILAI KATA SANDI
 *    tidak pernah ditulis ke log.
 *  - Context membedakan modul (actions | session | account-store).
 */

function formatExtra(extra?: Record<string, unknown>): string {
  return extra && Object.keys(extra).length > 0
    ? ` ${JSON.stringify(extra)}`
    : "";
}

export function authLog(
  context: string,
  message: string,
  extra?: Record<string, unknown>
): void {
  console.info(`[auth] ${context}: ${message}${formatExtra(extra)}`);
}

export function authWarn(
  context: string,
  message: string,
  extra?: Record<string, unknown>
): void {
  console.warn(`[auth] ${context}: ${message}${formatExtra(extra)}`);
}

export function authError(
  context: string,
  message: string,
  error: unknown,
  extra?: Record<string, unknown>
): void {
  console.error(`[auth] ${context}: ${message}${formatExtra(extra)}`, error ?? "");
}