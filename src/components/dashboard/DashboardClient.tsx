'use client';

import { useMemo, useRef, useState } from 'react';

import { calculateSummary } from '@/components/dashboard/calculateSummary';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TransactionHistory } from '@/components/dashboard/TransactionHistory';
import AddTransactionCTA from '@/components/transactions/AddTransactionCTA';
import OperationFeedback from '@/components/transactions/OperationFeedback';
import TransactionForm from '@/components/transactions/TransactionForm';
import { toCreateInput, toFormInitial, toUpdateInput } from '@/components/transactions/adapters';
import type { TransactionFormData } from '@/components/transactions/types';
import type { TransactionItem } from '@/types';
import {
  createTransactionAction,
  deleteTransactionAction,
  getTransactionsAction,
  updateTransactionAction,
} from '@/lib/transactions/actions';

type DashboardClientProps = {
  initialTransactions: TransactionItem[];
  initialLoadError: string | null;
  initialMonth: number;
  initialYear: number;
};

function sortTransactions(transactions: TransactionItem[]): TransactionItem[] {
  return [...transactions].sort(
    (first, second) =>
      new Date(second.date).getTime() - new Date(first.date).getTime(),
  );
}

export function DashboardClient({
  initialTransactions,
  initialLoadError,
  initialMonth,
  initialYear,
}: DashboardClientProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [feedback, setFeedback] = useState<{
    status: 'success' | 'error';
    message: string;
  } | null>(null);
  const formRef = useRef<HTMLElement>(null);

  const periodTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const date = new Date(transaction.date);
        return (
          date.getMonth() + 1 === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      }),
    [transactions, selectedMonth, selectedYear],
  );
  const summary = useMemo(
    () => calculateSummary(periodTransactions),
    [periodTransactions],
  );

  async function refreshTransactions(): Promise<boolean> {
    setRefreshing(true);
    setLoadError(null);
    try {
      const result = await getTransactionsAction();
      if (!result.success) {
        setLoadError(result.errors.join(' '));
        return false;
      }
      setTransactions(sortTransactions(result.data));
      return true;
    } catch {
      setLoadError('Transaksi tidak dapat dimuat. Periksa koneksi lalu coba lagi.');
      return false;
    } finally {
      setRefreshing(false);
    }
  }

  function openForm(transaction: TransactionItem | null = null) {
    setEditing(transaction);
    setFormOpen(true);
    setFeedback(null);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }

  async function handleSubmit(data: TransactionFormData) {
    setPending(true);
    setFeedback(null);
    try {
      const result = editing
        ? await updateTransactionAction(toUpdateInput(editing.id, data))
        : await createTransactionAction(toCreateInput(data));

      if (!result.success) {
        setFeedback({ status: 'error', message: result.errors.join(' ') });
        return;
      }

      setTransactions((current) => {
        const next = editing
          ? current.map((transaction) =>
              transaction.id === editing.id ? result.data : transaction,
            )
          : [result.data, ...current];
        return sortTransactions(next);
      });
      setFormOpen(false);
      setEditing(null);

      const refreshed = await refreshTransactions();
      setFeedback({
        status: 'success',
        message: refreshed
          ? editing
            ? 'Transaksi berhasil diubah.'
            : 'Transaksi berhasil ditambahkan.'
          : 'Transaksi tersimpan. Tampilan sudah diperbarui, tetapi sinkronisasi ulang gagal.',
      });
    } catch {
      setFeedback({
        status: 'error',
        message: 'Transaksi gagal disimpan. Silakan coba lagi.',
      });
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const result = await deleteTransactionAction(id);
      if (!result.success) {
        return { ok: false, error: result.errors.join(' ') };
      }

      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== id),
      );
      if (editing?.id === id) {
        setEditing(null);
        setFormOpen(false);
      }

      const refreshed = await refreshTransactions();
      setFeedback({
        status: 'success',
        message: refreshed
          ? 'Transaksi berhasil dihapus.'
          : 'Transaksi terhapus. Tampilan sudah diperbarui, tetapi sinkronisasi ulang gagal.',
      });
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Transaksi gagal dihapus. Silakan coba lagi.',
      };
    }
  }

  const years = Array.from({ length: 7 }, (_, index) => initialYear - 5 + index);
  if (!years.includes(selectedYear)) years.push(selectedYear);
  years.sort((first, second) => first - second);

  return (
    <main className="min-h-screen bg-app-background px-5 py-8 text-app-text dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-app-muted dark:text-zinc-400">
              Selamat datang kembali
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Dashboard DUITku
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-app-muted dark:text-zinc-400">
              Pantau kondisi keuangan Anda dari satu tempat.
            </p>
          </div>
          <AddTransactionCTA
            label="Tambah transaksi"
            onClick={() => openForm()}
          />
        </header>

        <section
          aria-label="Periode ringkasan"
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label
              htmlFor="dashboard-month"
              className="mb-1.5 block text-sm font-medium"
            >
              Bulan
            </label>
            <select
              id="dashboard-month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              className="h-11 rounded-xl border border-app-border bg-surface px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(
                    new Date(2020, index, 1),
                  )}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="dashboard-year"
              className="mb-1.5 block text-sm font-medium"
            >
              Tahun
            </label>
            <select
              id="dashboard-year"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="h-11 rounded-xl border border-app-border bg-surface px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {refreshing ? (
            <p role="status" className="pb-2 text-sm text-app-muted">
              Memperbarui transaksi…
            </p>
          ) : null}
        </section>

        <OperationFeedback
          status={feedback?.status ?? null}
          message={feedback?.message ?? null}
        />

        {loadError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            <p>{loadError}</p>
            <button
              type="button"
              onClick={() => void refreshTransactions()}
              disabled={refreshing}
              className="h-10 rounded-xl border border-current px-4 font-medium disabled:opacity-60"
            >
              Coba lagi
            </button>
          </div>
        ) : null}

        {formOpen ? (
          <section
            ref={formRef}
            aria-label={editing ? 'Ubah transaksi' : 'Tambah transaksi'}
            className="scroll-mt-6 rounded-3xl border border-app-border bg-surface p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {editing ? 'Ubah transaksi' : 'Tambah transaksi'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
                disabled={pending}
                className="rounded-lg px-3 py-2 text-sm text-app-muted hover:bg-primary-100 disabled:opacity-60 dark:hover:bg-zinc-800"
              >
                Tutup
              </button>
            </div>
            <TransactionForm
              key={editing?.id ?? 'new'}
              initialData={editing ? toFormInitial(editing) : null}
              pending={pending}
              onSubmit={handleSubmit}
              onCancel={
                editing
                  ? () => {
                      setFormOpen(false);
                      setEditing(null);
                    }
                  : undefined
              }
            />
          </section>
        ) : null}

        <SummaryCards summary={summary} />

        {periodTransactions.length > 0 ? (
          <TransactionHistory
            transactions={periodTransactions}
            onEdit={openForm}
            onDelete={handleDelete}
          />
        ) : (
          <div className="space-y-4">
            <EmptyState onAddTransaction={() => openForm()} />
            {transactions.length > 0 ? (
              <p className="text-center text-sm text-app-muted dark:text-zinc-400">
                Tidak ada transaksi pada periode yang dipilih.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
