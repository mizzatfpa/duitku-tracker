"use client";

// Milik Fikri — skeleton loader untuk daftar transaksi (SRS-FR-035).
//
// Dipakai useTransactionAjax / TransactionHistoryList saat `loading` true
// (ganti filter atau load awal). Sengaja memakai blok warna token ungu dengan
// shimmer via CSS animation, bukan spinner penuh, supaya perpindahan antara
// daftar lama dan baru terasa halus dan tidak membuat layout melompat
// (TASK_BREAKDOWN §2 "skeleton loader atau spinner halus").

interface TransactionListSkeletonProps {
  /** Jumlah baris placeholder; default 4 agar tinggi daftar terasa wajar. */
  rows?: number;
  className?: string;
}

/** Shimmer lembut; `motion-reduce` dihormati agar tetap nyaman diakses. */
const SHIMMER = "motion-safe:animate-pulse rounded-lg bg-primary-100 dark:bg-zinc-800";

export default function TransactionListSkeleton({
  rows = 4,
  className = "",
}: TransactionListSkeletonProps) {
  const safeRows = Number.isInteger(rows) && rows > 0 ? Math.min(rows, 12) : 4;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="transaction-list-skeleton"
      className={`overflow-hidden rounded-3xl border border-app-border bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <span className="sr-only">Memuat daftar transaksi…</span>
      <ul className="divide-y divide-app-border dark:divide-zinc-800">
        {Array.from({ length: safeRows }, (_, index) => (
          <li key={index} className="flex items-center gap-3 p-4 sm:px-5">
            <span aria-hidden="true" className={`h-9 w-1.5 shrink-0 rounded-full ${SHIMMER}`} />
            <div className="min-w-0 flex-1 space-y-2">
              <span aria-hidden="true" className={`block h-3.5 w-2/5 ${SHIMMER}`} />
              <span aria-hidden="true" className={`block h-3 w-3/10 ${SHIMMER}`} />
            </div>
            <span aria-hidden="true" className={`h-3.5 w-24 shrink-0 ${SHIMMER}`} />
            <span aria-hidden="true" className={`h-11 w-11 shrink-0 rounded-2xl ${SHIMMER}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
