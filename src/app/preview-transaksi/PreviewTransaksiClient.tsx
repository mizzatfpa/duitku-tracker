"use client";

// Milik Orang 4 — preview integrasi SEMENTARA (bukan dashboard asli).
// Halaman ini dihapus setelah Orang 3 memasang komponen di (dashboard).
// Pola yang dicopy Orang 3 ke dashboard:
//   <TransactionForm onSubmit={createTransaction /* milik Orang 2 */} />
//   <DeleteTransactionButton id={tx.id} onDelete={deleteTransaction} />
// Ganti mock* di bawah dengan operasi asli Orang 2 (tandatangan sama).

import { useMemo, useState } from "react";
import { Pencil, Wallet } from "lucide-react";

import ThemeToggle from "@/components/preferences/ThemeToggle";
import type { Theme } from "@/lib/preferences/theme";
import DeleteTransactionButton from "@/components/transactions/DeleteTransactionButton";
import OperationFeedback from "@/components/transactions/OperationFeedback";
import TransactionForm from "@/components/transactions/TransactionForm";
import { formatIDR } from "@/components/transactions/format";
import {
  mockCreateTransaction,
  mockDeleteTransaction,
  mockUpdateTransaction,
  seedMockTransactions,
} from "@/components/transactions/mock";
import type { Transaction, TransactionFormData } from "@/components/transactions/types";

export default function PreviewTransaksiClient({
  initialTheme,
}: {
  initialTheme: Theme;
}) {
  const [items, setItems] = useState<Transaction[]>(() =>
    seedMockTransactions(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  const editing = useMemo(
    () => items.find((t) => t.id === editingId) ?? null,
    [items, editingId],
  );

  async function handleSubmit(data: TransactionFormData) {
    setPending(true);
    setFeedback(null);
    try {
      if (editing) {
        const result = await mockUpdateTransaction(editing.id, data);
        if (!result.ok) {
          setFeedback({
            status: "error",
            message: result.error,
          });
          return;
        }
        setItems((prev) =>
          prev.map((t) => (t.id === editing.id ? { ...t, ...data } : t)),
        );
        setFeedback({ status: "success", message: "Transaksi berhasil diubah." });
        setEditingId(null);
      } else {
        const result = await mockCreateTransaction(items, data);
        if (!result.ok) {
          setFeedback({ status: "error", message: result.error });
          return;
        }
        setItems((prev) => [result.transaction, ...prev]);
        setFeedback({
          status: "success",
          message: "Transaksi berhasil ditambah.",
        });
      }
    } catch {
      setFeedback({
        status: "error",
        message: "Terjadi kesalahan. Coba lagi.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Preview Transaksi
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Orang 4 · sementara, pakai mock sampai operasi Orang 2 siap
            </p>
          </div>
        </div>
        <ThemeToggle initialTheme={initialTheme} />
      </header>

      <OperationFeedback
        status={feedback?.status ?? null}
        message={feedback?.message ?? null}
      />

      <section
        aria-label={editing ? "Ubah transaksi" : "Tambah transaksi"}
        className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {editing ? "Ubah transaksi" : "Tambah transaksi"}
        </h2>
        <TransactionForm
          key={editing?.id ?? "new"}
          initialData={editing}
          pending={pending}
          onSubmit={handleSubmit}
          onCancel={editing ? () => setEditingId(null) : undefined}
        />
      </section>

      <section
        aria-label="Daftar transaksi mock"
        className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Daftar transaksi ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Belum ada data mock. Tambahkan lewat form di atas.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {t.type === "pemasukan" ? "+" : "−"}{" "}
                    {formatIDR(t.amount)}
                    {t.category ? (
                      <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {t.category}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {t.date}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(t.id);
                    setFeedback(null);
                  }}
                  aria-label="Ubah transaksi ini"
                  title="Ubah"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-emerald-400"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <DeleteTransactionButton
                  id={t.id}
                  transactionLabel={`${t.type} ${formatIDR(t.amount)}`}
                  onDelete={async (id: string) => {
                    const result = await mockDeleteTransaction(id);
                    if (!result.ok) return result;
                    setItems((prev) => prev.filter((x) => x.id !== id));
                    if (editingId === id) setEditingId(null);
                    setFeedback({
                      status: "success",
                      message: "Transaksi berhasil dihapus.",
                    });
                    return { ok: true };
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
