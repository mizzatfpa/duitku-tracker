"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";

import type { TransactionItem } from "@/types";
import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/lib/transactions/actions";
import DeleteTransactionButton from "@/components/transactions/DeleteTransactionButton";
import TransactionForm from "@/components/transactions/TransactionForm";
import { toCreateInput, toFormInitial, toUpdateInput } from "@/components/transactions/adapters";
import type { TransactionFormData } from "@/components/transactions/types";
import { formatCurrency } from "./formatCurrency";
import { EmptyState } from "./EmptyState";
import { SummaryCards } from "./SummaryCards";
import { TransactionHistory } from "./TransactionHistory";
import { calculateSummary } from "./calculateSummary";

type DashboardClientProps = {
  initialTransactions: TransactionItem[];
  loadError?: string;
};

export function DashboardClient({ initialTransactions, loadError }: DashboardClientProps) {
  const router = useRouter();
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const summary = calculateSummary(initialTransactions);

  function openCreateForm() {
    setOperationError(null);
    setEditingTransaction(null);
    setFormOpen(true);
  }

  function openEditForm(transaction: TransactionItem) {
    setOperationError(null);
    setEditingTransaction(transaction);
    setFormOpen(true);
  }

  async function handleSubmit(data: TransactionFormData) {
    setPending(true);
    setOperationError(null);

    const result = editingTransaction
      ? await updateTransactionAction(toUpdateInput(editingTransaction.id, data))
      : await createTransactionAction(toCreateInput(data));

    setPending(false);
    if (!result.success) {
      setOperationError(result.errors?.join(" ") ?? "Operasi transaksi gagal.");
      return;
    }

    setFormOpen(false);
    setEditingTransaction(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteTransactionAction(id);
    if (!result.success) {
      return { ok: false, error: result.errors?.join(" ") };
    }

    router.refresh();
    return { ok: true };
  }

  return (
    <>
      <section className="flex flex-col gap-4 rounded-3xl border border-[#EDE9FE] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Kelola transaksi</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Tambahkan catatan pemasukan atau pengeluaran Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#8B5CF6] px-4 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(139,92,246,0.15)] transition hover:bg-[#5B21B6]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah transaksi
        </button>
      </section>

      {loadError ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      {formOpen ? (
        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              {editingTransaction ? "Ubah transaksi" : "Tambah transaksi"}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-lg p-2 text-[#6B7280] hover:bg-[#EDE9FE] hover:text-[#5B21B6]"
              aria-label="Tutup formulir transaksi"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <TransactionForm
            initialData={editingTransaction ? toFormInitial(editingTransaction) : null}
            pending={pending}
            serverError={operationError}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </section>
      ) : null}

      <SummaryCards summary={summary} />

      {initialTransactions.length > 0 ? (
        <TransactionHistory
          transactions={initialTransactions}
          renderActions={(transaction) => (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openEditForm(transaction)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5E7EB] text-[#6B7280] hover:border-[#C4B5FD] hover:text-[#5B21B6]"
                aria-label={`Ubah ${transaction.category}`}
                title="Ubah transaksi"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <DeleteTransactionButton
                id={transaction.id}
                transactionLabel={`${transaction.category} ${formatCurrency(transaction.amount)}`}
                onDelete={handleDelete}
              />
            </div>
          )}
        />
      ) : (
        <EmptyState />
      )}
    </>
  );
}
