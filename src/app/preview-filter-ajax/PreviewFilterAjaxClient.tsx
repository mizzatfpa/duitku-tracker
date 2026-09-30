"use client";

// Milik Fikri — orkestrator SEMENTARA untuk verifikasi filter + AJAX transaksi.
// Pola yang akan disalin Orang 4 ke (dashboard):
//   const ajax = useTransactionAjax({ onTransactionsChange: setList });
//   <TransactionFilter {...} onFilterChange={ajax.handleFilterChange} />
//   <TransactionHistoryList transactions={ajax.transactions} loading={ajax.loading} ... />

import { useState } from "react";
import { Plus } from "lucide-react";

import AddTransactionCTA from "@/components/transactions/AddTransactionCTA";
import DeleteTransactionButton from "@/components/transactions/DeleteTransactionButton";
import OperationFeedback from "@/components/transactions/OperationFeedback";
import TransactionFilter from "@/components/transactions/TransactionFilter";
import TransactionForm from "@/components/transactions/TransactionForm";
import useTransactionAjax from "@/components/transactions/useTransactionAjax";
import { formatIDR } from "@/components/transactions/format";

function formatTanggal(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

export default function PreviewFilterAjaxClient() {
  const [formOpen, setFormOpen] = useState(false);
  // Hanya dipakai untuk membuktikan parent's state ikut berubah tanpa reload.
  const [changeCount, setChangeCount] = useState(0);

  const {
    transactions,
    loading,
    submitting,
    error,
    activeFilter,
    feedback,
    handleFilterChange,
    handleAddTransaction,
    handleDeleteTransaction,
  } = useTransactionAjax({
    onTransactionsChange: () => setChangeCount((count) => count + 1),
  });

  return (
    <main className="min-h-screen bg-app-background px-5 py-8 text-app-text dark:bg-[#141021] dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Preview Filter &amp; AJAX Transaksi</h1>
          <p className="text-sm text-app-muted dark:text-zinc-400">
            Halaman sementara milik Fikri. Coba ganti filter, tambah, dan hapus transaksi —
            tidak boleh ada reload halaman. Daftar diperbarui {changeCount}× lewat server action.
          </p>
        </header>

        <TransactionFilter
          activeType={activeFilter.type ?? "ALL"}
          selectedCategory={activeFilter.category}
          searchQuery={activeFilter.searchQuery}
          onFilterChange={handleFilterChange}
          disabled={loading}
        />

        <OperationFeedback
          status={feedback?.status ?? null}
          message={feedback?.message ?? error}
        />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              Riwayat transaksi
              <span className="ml-2 font-normal text-app-muted dark:text-zinc-400">
                {transactions.length} item
              </span>
            </h2>
            {formOpen ? null : <AddTransactionCTA onClick={() => setFormOpen(true)} label="Tambah transaksi" />}
          </div>

          {formOpen ? (
            <div className="rounded-3xl border border-app-border bg-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <TransactionForm
                pending={submitting}
                onSubmit={async (data) => {
                  const result = await handleAddTransaction(data);
                  if (result.ok) setFormOpen(false);
                }}
                onCancel={() => setFormOpen(false)}
              />
            </div>
          ) : null}

          <ul className="divide-y divide-app-border overflow-hidden rounded-3xl border border-app-border bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {loading ? (
              <li className="p-5 text-sm text-app-muted dark:text-zinc-400">Memuat transaksi…</li>
            ) : transactions.length === 0 ? (
              <li className="p-5 text-sm text-app-muted dark:text-zinc-400">Tidak ada transaksi.</li>
            ) : (
              transactions.map((item) => (
                <li key={item.id} className="flex items-center gap-3 p-4 sm:px-5">
                  <span
                    aria-hidden="true"
                    className={`h-9 w-1.5 shrink-0 rounded-full ${
                      item.type === "pemasukan" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.category}</p>
                    <p className="truncate text-xs text-app-muted dark:text-zinc-400">
                      {formatTanggal(item.date)}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold ${
                      item.type === "pemasukan"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.type === "pemasukan" ? "+" : "-"}
                    {formatIDR(item.amount)}
                  </span>
                  <DeleteTransactionButton
                    id={item.id}
                    transactionLabel={`${item.type === "pemasukan" ? "Pemasukan" : "Pengeluaran"} ${formatIDR(item.amount)}`}
                    onDelete={handleDeleteTransaction}
                  />
                </li>
              ))
            )}
          </ul>
        </section>

        <footer className="flex items-center gap-2 text-xs text-app-muted dark:text-zinc-500">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Tidak ada window.location.reload() maupun router.refresh() pada alur ini.
        </footer>
      </div>
    </main>
  );
}
