"use client";

// Milik Fikri — daftar riwayat transaksi yang consuming state dari
// useTransactionAjax (TASK_BREAKDOWN §2, file `TransactionHistoryList.tsx`).
//
// Komponen ini murni presentational terhadap state hook: ia tidak melakukan fetch
// sendiri dan tidak pernah memicu reload. Saat `loading` true ia menukar daftar
// dengan skeleton supaya pengguna tidak melihat kedipan konten.
//
// `renderActions` disisipkan lewat children agar Orang 4 bisa memasang tombol
// ubah miliknya tanpa komponen ini perlu tahu apa pun soal form.

import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import DeleteTransactionButton from "./DeleteTransactionButton";
import TransactionListSkeleton from "./TransactionListSkeleton";
import { formatIDR } from "./format";
import type { Transaction } from "./types";

interface TransactionHistoryListProps {
  transactions: Transaction[];
  loading?: boolean;
  /** Diskalkan saat satu operasi tulis berjalan, untuk meredam interaksi. */
  submitting?: boolean;
  /**
   * Diteruskan apa adanya ke DeleteTransactionButton, jadi bentuknya dibuat
   * sama dengan kontrak tombol tersebut (hasil opsional `{ ok, error }`).
   */
  onDelete: (id: string) => void | Promise<void | { ok: boolean; error?: string }>;
  /** Slot tambahan per baris, misal tombol ubah milik Orang 4. */
  renderActions?: (transaction: Transaction) => ReactNode;
  emptyMessage?: string;
}

function formatTanggal(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

function typeLabel(item: Transaction): string {
  return item.type === "pemasukan" ? "Pemasukan" : "Pengeluaran";
}

export default function TransactionHistoryList({
  transactions,
  loading = false,
  submitting = false,
  onDelete,
  renderActions,
  emptyMessage = 'Belum ada transaksi. Tambahkan transaksi pertamamu untuk mulai.',
}: TransactionHistoryListProps) {
  if (loading) {
    return <TransactionListSkeleton rows={Math.max(transactions.length, 4)} />;
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-app-border bg-surface px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-zinc-800 dark:text-primary-300">
          <Inbox className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-app-muted dark:text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul
      aria-busy={loading}
      aria-label="Daftar riwayat transaksi"
      data-testid="transaction-history-list"
      className="divide-y divide-app-border overflow-hidden rounded-3xl border border-app-border bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {transactions.map((item) => {
        const isIncome = item.type === "pemasukan";
        return (
          <li
            key={item.id}
            className={`flex items-center gap-3 p-4 transition sm:px-5 ${
              submitting ? "opacity-60" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-9 w-1.5 shrink-0 rounded-full ${
                isIncome ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-app-text dark:text-zinc-100">
                {item.category}
              </p>
              <p className="truncate text-xs text-app-muted dark:text-zinc-400">
                <span className="sr-only">{typeLabel(item)}: </span>
                {formatTanggal(item.date)}
                {item.note ? ` · ${item.note}` : ""}
              </p>
            </div>

            <span
              className={`shrink-0 text-sm font-semibold tabular-nums ${
                isIncome
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              <span aria-hidden="true">{isIncome ? "+" : "-"}</span>
              {formatIDR(item.amount)}
            </span>

            {renderActions ? (
              <span className="flex shrink-0 items-center gap-1">{renderActions(item)}</span>
            ) : null}

            <DeleteTransactionButton
              id={item.id}
              transactionLabel={`${typeLabel(item)} ${formatIDR(item.amount)}`}
              pending={submitting}
              onDelete={onDelete}
            />
          </li>
        );
      })}
    </ul>
  );
}
