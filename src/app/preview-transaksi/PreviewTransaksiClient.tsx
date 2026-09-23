"use client";

// Milik Orang 4 — preview integrasi SEMENTARA (bukan dashboard asli).
// Halaman ini dihapus setelah Orang 3 memasang komponen di (dashboard).
// Pola yang dicopy Orang 3 ke dashboard (ganti mock* dengan operasi Orang 2):
//   import { toCreateInput, toUpdateInput, toFormInitial } from "@/components/transactions/adapters";
//   <TransactionForm onSubmit={async (d) => { await createTransaction(toCreateInput(d)); }} />
//   <DeleteTransactionButton id={tx.id} onDelete={deleteTransaction} />
//   <AddTransactionCTA onClick={openForm} />  (untuk empty state)

import { useMemo, useRef, useState } from "react";
import { Pencil, Wallet } from "lucide-react";

import ThemeToggle from "@/components/preferences/ThemeToggle";
import type { Theme } from "@/lib/preferences/theme";
import type { TransactionItem } from "@/types";
import AddTransactionCTA from "@/components/transactions/AddTransactionCTA";
import DeleteTransactionButton from "@/components/transactions/DeleteTransactionButton";
import OperationFeedback from "@/components/transactions/OperationFeedback";
import TransactionForm from "@/components/transactions/TransactionForm";
import { formatIDR } from "@/components/transactions/format";
import {
  canonicalTypeLabel,
  toCreateInput,
  toFormInitial,
  toUpdateInput,
} from "@/components/transactions/adapters";
import {
  mockCreateTransaction,
  mockDeleteTransaction,
  mockUpdateTransaction,
  seedMockTransactions,
} from "@/components/transactions/mock";
import type { TransactionFormData } from "@/components/transactions/types";

function formatDate(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PreviewTransaksiClient({
  initialTheme,
}: {
  initialTheme: Theme;
}) {
  const [items, setItems] = useState<TransactionItem[]>(() =>
    seedMockTransactions(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const formRef = useRef<HTMLElement>(null);

  const editing = useMemo(
    () => items.find((t) => t.id === editingId) ?? null,
    [items, editingId],
  );

  function focusForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(data: TransactionFormData) {
    setPending(true);
    setFeedback(null);
    try {
      if (editing) {
        const result = await mockUpdateTransaction(toUpdateInput(editing.id, data));
        if (!result.ok) {
          setFeedback({ status: "error", message: result.error });
          return;
        }
        const input = toCreateInput(data);
        setItems((prev) =>
          prev.map((t) =>
            t.id === editing.id
              ? {
                  ...t,
                  type: input.type,
                  amount: input.amount,
                  category: input.category,
                  description: input.description ?? null,
                  date:
                    input.date instanceof Date
                      ? input.date
                      : new Date(input.date ?? new Date()),
                  updatedAt: new Date(),
                }
              : t,
          ),
        );
        setFeedback({ status: "success", message: "Transaksi berhasil diubah." });
        setEditingId(null);
      } else {
        const result = await mockCreateTransaction(toCreateInput(data));
        if (!result.ok) {
          setFeedback({ status: "error", message: result.error });
          return;
        }
        setItems((prev) => [result.data, ...prev]);
        setFeedback({ status: "success", message: "Transaksi berhasil ditambah." });
      }
    } catch {
      setFeedback({ status: "error", message: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-full bg-app-background">
      <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-5 py-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent text-white">
              <Wallet className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-app-text dark:text-zinc-100">
                Preview Transaksi
              </h1>
              <p className="text-xs text-app-muted dark:text-zinc-400">
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
          ref={formRef}
          aria-label={editing ? "Ubah transaksi" : "Tambah transaksi"}
          className="scroll-mt-6 rounded-3xl border border-app-border bg-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-3 text-base font-semibold text-app-text dark:text-zinc-100">
            {editing ? "Ubah transaksi" : "Tambah transaksi"}
          </h2>
          <TransactionForm
            key={editing?.id ?? "new"}
            initialData={editing ? toFormInitial(editing) : null}
            pending={pending}
            onSubmit={handleSubmit}
            onCancel={editing ? () => setEditingId(null) : undefined}
          />
        </section>

        <section
          aria-label="Daftar transaksi mock"
          className="rounded-3xl border border-app-border bg-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-3 text-base font-semibold text-app-text dark:text-zinc-100">
            Daftar transaksi ({items.length})
          </h2>
          {items.length === 0 ? (
            <div className="space-y-3 py-4 text-center">
              <p className="text-sm text-app-muted dark:text-zinc-400">
                No transactions yet
              </p>
              <AddTransactionCTA
                onClick={() => {
                  setEditingId(null);
                  setFeedback(null);
                  focusForm();
                }}
              />
            </div>
          ) : (
            <ul className="divide-y divide-app-border dark:divide-zinc-800">
              {items.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <span
                    aria-hidden="true"
                    className={`h-9 w-1.5 shrink-0 rounded-full ${
                      t.type === "INCOME" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-app-text dark:text-zinc-100">
                      {t.type === "INCOME" ? "+" : "−"} {formatIDR(t.amount)}
                      <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-normal text-primary-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {t.category}
                      </span>
                    </p>
                    <p className="truncate text-xs text-app-muted dark:text-zinc-400">
                      {canonicalTypeLabel(t.type)} · {formatDate(t.date)}
                      {t.description ? ` · ${t.description}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(t.id);
                      setFeedback(null);
                      focusForm();
                    }}
                    aria-label="Ubah transaksi ini"
                    title="Ubah"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-app-border bg-surface text-app-muted shadow-sm transition hover:border-primary-300 hover:text-primary-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <DeleteTransactionButton
                    id={t.id}
                    transactionLabel={`${canonicalTypeLabel(t.type)} ${formatIDR(t.amount)}`}
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
    </div>
  );
}
