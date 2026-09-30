"use client";

// Milik Fikri — orkestrator SEMENTARA untuk verifikasi filter + AJAX transaksi.
// Pola yang akan disalin Orang 4 ke (dashboard):
//   const ajax = useTransactionAjax({ onTransactionsChange: syncSummaryAndBudget });
//   <TransactionFilter
//     activeType={ajax.activeFilter.type ?? "ALL"}
//     selectedCategory={ajax.activeFilter.category}
//     searchQuery={ajax.activeFilter.searchQuery}
//     loading={ajax.loading}
//     onFilterChange={ajax.handleFilterChange}
//   />
//   <TransactionHistoryList transactions={ajax.transactions} loading={ajax.loading} onDelete={ajax.handleDeleteTransaction} />

import { useState } from "react";

import AddTransactionCTA from "@/components/transactions/AddTransactionCTA";
import OperationFeedback from "@/components/transactions/OperationFeedback";
import TransactionFilter from "@/components/transactions/TransactionFilter";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionHistoryList from "@/components/transactions/TransactionHistoryList";
import useTransactionAjax from "@/components/transactions/useTransactionAjax";

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
            Halaman sementara milik Fikri. Coba ganti filter, tambah, dan hapus
            transaksi — tidak boleh ada reload halaman. Daftar diperbarui {changeCount}×
            lewat server action.
          </p>
        </header>

        <TransactionFilter
          activeType={activeFilter.type ?? "ALL"}
          selectedCategory={activeFilter.category}
          searchQuery={activeFilter.searchQuery}
          loading={loading}
          onFilterChange={handleFilterChange}
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
            {formOpen ? null : (
              <AddTransactionCTA onClick={() => setFormOpen(true)} label="Tambah transaksi" />
            )}
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

          <TransactionHistoryList
            transactions={transactions}
            loading={loading}
            submitting={submitting}
            onDelete={handleDeleteTransaction}
          />
        </section>

        <footer className="text-xs text-app-muted dark:text-zinc-500">
          Tidak ada <code>window.location.reload()</code> maupun{" "}
          <code>router.refresh()</code> pada alur ini — skeleton loader hanya
          mengganti isi daftar, bukan halamannya.
        </footer>
      </div>
    </main>
  );
}
