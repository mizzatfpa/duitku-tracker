// Kartu anggaran bulanan (SRS FR-038, FR-040, FR-041).
// Murni presentational: progres datang lewat props, callback buka modal
// diserahkan ke orchestrator dashboard.

import { PiggyBank, Settings2 } from "lucide-react";

import { formatIDR } from "@/components/transactions/format";

import BudgetProgress from "./BudgetProgress";
import { MONTH_NAMES, type BudgetProgress as Progress } from "./types";

export interface BudgetCardProps {
  progress: Progress | null;
  loading?: boolean;
  onOpenSetModal: () => void;
}

function monthLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1] ?? month} ${year}`;
}

export default function BudgetCard({
  progress,
  loading = false,
  onOpenSetModal,
}: BudgetCardProps) {
  const hasBudget = Boolean(progress?.hasBudget);
  const remaining = progress?.remainingAmount ?? 0;
  const isDeficit = hasBudget && remaining < 0;

  if (loading && !progress) {
    return (
      <section
        aria-busy="true"
        aria-label="Memuat anggaran bulanan"
        className="rounded-3xl border border-app-border bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="h-4 w-40 animate-pulse rounded-full bg-app-border dark:bg-zinc-700" />
        <div className="mt-4 h-8 w-56 animate-pulse rounded-full bg-app-border dark:bg-zinc-700" />
        <div className="mt-6 h-3 w-full animate-pulse rounded-full bg-app-border dark:bg-zinc-700" />
      </section>
    );
  }

  return (
    <section
      aria-labelledby="budget-card-title"
      className="rounded-3xl border border-app-border bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:bg-zinc-900"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="budget-card-title"
            className="text-lg font-semibold text-app-text dark:text-zinc-100"
          >
            Anggaran Bulanan
          </h2>
          {progress ? (
            <p className="mt-0.5 text-sm text-app-muted dark:text-zinc-400">
              {monthLabel(progress.month, progress.year)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onOpenSetModal}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-100 px-3.5 text-sm font-medium text-primary-700 transition hover:bg-primary-300/50 disabled:opacity-60 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          <Settings2 className="h-4 w-4" aria-hidden="true" />
          {hasBudget ? "Ubah Anggaran" : "Atur Anggaran"}
        </button>
      </header>

      {!progress || !hasBudget ? (
        <div className="mt-6 rounded-2xl border border-dashed border-app-border px-5 py-8 text-center dark:border-zinc-700">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-zinc-800 dark:text-primary-300">
            <PiggyBank className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-medium text-app-text dark:text-zinc-200">
            Anda belum menetapkan anggaran untuk bulan ini
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-app-muted dark:text-zinc-400">
            Tetapkan nominal agar pengeluaran bisa dipantau setiap saat.
          </p>
          <button
            type="button"
            onClick={onOpenSetModal}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-primary-500 px-4 text-sm font-medium text-white shadow-[0_8px_24px_rgba(139,92,246,0.25)] transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Tetapkan Anggaran Sekarang
          </button>
        </div>
      ) : (
        <>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-app-muted dark:text-zinc-400">
                Nominal Anggaran
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-app-text dark:text-zinc-100">
                {formatIDR(progress.budgetAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-app-muted dark:text-zinc-400">
                Pengeluaran Aktual
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-app-text dark:text-zinc-100">
                {formatIDR(progress.totalExpense)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-app-muted dark:text-zinc-400">
                {isDeficit ? "Defisit" : "Sisa Anggaran"}
              </dt>
              <dd
                className={`mt-1 text-lg font-semibold tabular-nums ${
                  isDeficit
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {formatIDR(Math.abs(remaining))}
              </dd>
            </div>
          </dl>

          <BudgetProgress
            className="mt-6"
            percentageUsed={progress.percentageUsed}
            isOverBudget={progress.isOverBudget}
          />
        </>
      )}
    </section>
  );
}
