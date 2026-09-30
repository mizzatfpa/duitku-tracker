'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BudgetCard from '@/components/budget/BudgetCard';
import BudgetModal from '@/components/budget/BudgetModal';
import { getBudgetProgress } from '@/components/budget/adapters';
import type { BudgetProgress } from '@/components/budget/types';
import { calculateSummary } from '@/components/dashboard/calculateSummary';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import AddTransactionCTA from '@/components/transactions/AddTransactionCTA';
import OperationFeedback from '@/components/transactions/OperationFeedback';
import TransactionFilter from '@/components/transactions/TransactionFilter';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionHistoryList from '@/components/transactions/TransactionHistoryList';
import useTransactionAjax from '@/components/transactions/useTransactionAjax';
import { toFormInitial } from '@/components/transactions/adapters';
import type {
  Transaction,
  TransactionFormData,
} from '@/components/transactions/types';
import type { TransactionItem } from '@/types';
import { getFilteredTransactionsAction } from '@/lib/transactions/actions';

type DashboardClientProps = {
  initialTransactions: TransactionItem[];
  initialLoadError: string | null;
  initialMonth: number;
  initialYear: number;
};

function getPeriodTransactions(
  transactions: TransactionItem[],
  month: number,
  year: number,
): TransactionItem[] {
  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });
}

export function DashboardClient({
  initialTransactions,
  initialLoadError,
  initialMonth,
  initialYear,
}: DashboardClientProps) {
  const initialPeriodTransactions = useMemo(
    () => getPeriodTransactions(initialTransactions, initialMonth, initialYear),
    [initialTransactions, initialMonth, initialYear],
  );
  const transactionAjax = useTransactionAjax({
    initialTransactions: initialPeriodTransactions.map(toFormInitial),
    initialFilter: {
      type: 'ALL',
      month: initialMonth,
      year: initialYear,
    },
  });
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [summary, setSummary] = useState(() =>
    calculateSummary(initialPeriodTransactions),
  );
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress | null>(
    null,
  );
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [summaryError, setSummaryError] = useState(initialLoadError);
  const formRef = useRef<HTMLElement>(null);
  const metricsRequestId = useRef(0);

  const refreshPeriodMetrics = useCallback(async (month: number, year: number) => {
    const requestId = metricsRequestId.current + 1;
    metricsRequestId.current = requestId;
    setBudgetLoading(true);
    setBudgetError(null);
    setSummaryError(null);

    try {
      const summaryResult = await getFilteredTransactionsAction({
        type: 'ALL',
        month,
        year,
      });
      if (requestId !== metricsRequestId.current) return;
      if (!summaryResult.success) {
        setSummaryError(summaryResult.errors.join(' '));
      } else {
        setSummary(calculateSummary(summaryResult.data));
      }

      const budgetResult = await getBudgetProgress(month, year);
      if (requestId !== metricsRequestId.current) return;
      if (!budgetResult.success) {
        setBudgetError(budgetResult.errors.join(' '));
      } else {
        setBudgetProgress(budgetResult.data);
      }
    } catch {
      if (requestId === metricsRequestId.current) {
        setSummaryError('Ringkasan periode gagal dimuat. Silakan coba lagi.');
        setBudgetError('Anggaran gagal dimuat. Silakan coba lagi.');
      }
    } finally {
      if (requestId === metricsRequestId.current) setBudgetLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshPeriodMetrics(selectedMonth, selectedYear);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [refreshPeriodMetrics, selectedMonth, selectedYear]);

  function openForm(transaction: Transaction | null = null) {
    setEditing(transaction);
    setFormOpen(true);
    transactionAjax.clearFeedback();
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }

  async function handleSubmit(data: TransactionFormData) {
    const result = editing
      ? await transactionAjax.handleUpdateTransaction(editing.id, data)
      : await transactionAjax.handleAddTransaction(data);

    if (!result.ok) return;
    setFormOpen(false);
    setEditing(null);
    await refreshPeriodMetrics(selectedMonth, selectedYear);
  }

  async function handleDelete(id: string) {
    const result = await transactionAjax.handleDeleteTransaction(id);
    if (result.ok) {
      await refreshPeriodMetrics(selectedMonth, selectedYear);
    }
    return result;
  }

  function handlePeriodChange(month: number, year: number) {
    setSelectedMonth(month);
    setSelectedYear(year);
    void transactionAjax.handleFilterChange({
      ...transactionAjax.activeFilter,
      month,
      year,
    });
  }

  const years = Array.from(
    { length: 7 },
    (_, index) => initialYear - 5 + index,
  );
  if (!years.includes(selectedYear)) years.push(selectedYear);
  years.sort((first, second) => first - second);

  const hasNarrowingFilter =
    transactionAjax.activeFilter.type !== 'ALL' ||
    Boolean(transactionAjax.activeFilter.category) ||
    Boolean(transactionAjax.activeFilter.searchQuery);

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
          aria-label="Periode dashboard"
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
              onChange={(event) =>
                handlePeriodChange(Number(event.target.value), selectedYear)
              }
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
              onChange={(event) =>
                handlePeriodChange(selectedMonth, Number(event.target.value))
              }
              className="h-11 rounded-xl border border-app-border bg-surface px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </section>

        {summaryError ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            <p>{summaryError}</p>
            <button
              type="button"
              onClick={() => void refreshPeriodMetrics(selectedMonth, selectedYear)}
              className="mt-2 font-semibold underline"
            >
              Coba muat ulang
            </button>
          </div>
        ) : null}

        <SummaryCards summary={summary} />

        <BudgetCard
          progress={budgetProgress}
          loading={budgetLoading}
          onOpenSetModal={() => setBudgetModalOpen(true)}
        />
        {budgetError ? (
          <p role="alert" className="-mt-6 text-sm text-red-600 dark:text-red-400">
            {budgetError}{' '}
            <button
              type="button"
              onClick={() => void refreshPeriodMetrics(selectedMonth, selectedYear)}
              className="font-semibold underline"
            >
              Coba lagi
            </button>
          </p>
        ) : null}

        <section aria-labelledby="history-heading" className="space-y-4">
          <div>
            <p className="text-sm font-medium text-app-muted dark:text-zinc-400">
              Aktivitas periode terpilih
            </p>
            <h2 id="history-heading" className="mt-1 text-2xl font-semibold">
              Riwayat transaksi
            </h2>
          </div>
          <TransactionFilter
            activeType={transactionAjax.activeFilter.type ?? 'ALL'}
            selectedCategory={transactionAjax.activeFilter.category}
            searchQuery={transactionAjax.activeFilter.searchQuery}
            onFilterChange={(filter) =>
              void transactionAjax.handleFilterChange(filter)
            }
            loading={transactionAjax.loading}
            disabled={transactionAjax.submitting}
          />
          <OperationFeedback
            status={transactionAjax.feedback?.status ?? null}
            message={transactionAjax.feedback?.message ?? null}
          />
          {transactionAjax.error ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {transactionAjax.error}
            </p>
          ) : null}

          {transactionAjax.transactions.length > 0 || transactionAjax.loading ? (
            <TransactionHistoryList
              transactions={transactionAjax.transactions}
              loading={transactionAjax.loading}
              submitting={transactionAjax.submitting}
              onDelete={handleDelete}
              emptyMessage={
                hasNarrowingFilter
                  ? 'Tidak ada transaksi yang cocok dengan filter ini.'
                  : 'Belum ada transaksi pada periode ini.'
              }
              renderActions={(transaction) => (
                <button
                  type="button"
                  onClick={() => openForm(transaction)}
                  disabled={transactionAjax.submitting}
                  aria-label="Ubah transaksi"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-app-border px-3 text-sm font-medium text-app-muted hover:border-primary-300 hover:text-primary-700 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Ubah
                </button>
              )}
            />
          ) : hasNarrowingFilter ? (
            <TransactionHistoryList
              transactions={[]}
              onDelete={handleDelete}
              emptyMessage="Tidak ada transaksi yang cocok dengan filter ini."
            />
          ) : (
            <EmptyState onAddTransaction={() => openForm()} />
          )}
        </section>

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
                disabled={transactionAjax.submitting}
                className="rounded-lg px-3 py-2 text-sm text-app-muted hover:bg-primary-100 disabled:opacity-60 dark:hover:bg-zinc-800"
              >
                Tutup
              </button>
            </div>
            <TransactionForm
              key={editing?.id ?? 'new'}
              initialData={editing}
              pending={transactionAjax.submitting}
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

        <BudgetModal
          isOpen={budgetModalOpen}
          onClose={() => setBudgetModalOpen(false)}
          month={selectedMonth}
          year={selectedYear}
          currentAmount={
            budgetProgress?.hasBudget ? budgetProgress.budgetAmount : undefined
          }
          onBudgetUpdated={() =>
            void refreshPeriodMetrics(selectedMonth, selectedYear)
          }
        />
      </div>
    </main>
  );
}
