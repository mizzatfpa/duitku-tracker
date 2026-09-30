// Progress bar anggaran dengan warna adaptif (SRS FR-039) dan banner
// overbudget (SRS FR-041). Murni presentational: semua data masuk lewat props.

export type BudgetTone = "safe" | "warning" | "over";

/** Ambang warna: <80% hijau, 80-100% kuning, >100% merah. */
export function resolveProgressTone(percentage: number): BudgetTone {
  if (percentage > 100) return "over";
  if (percentage >= 80) return "warning";
  return "safe";
}

const TONE_BAR: Record<BudgetTone, string> = {
  safe: "bg-emerald-500",
  warning: "bg-amber-500",
  over: "bg-rose-500",
};

const TONE_TEXT: Record<BudgetTone, string> = {
  safe: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  over: "text-rose-600 dark:text-rose-400",
};

type BudgetProgressProps = {
  percentageUsed: number;
  isOverBudget: boolean;
  /** Kelas tambahan opsional untuk penempatan di layout induk. */
  className?: string;
};

export default function BudgetProgress({
  percentageUsed,
  isOverBudget,
  className = "",
}: BudgetProgressProps) {
  const tone = resolveProgressTone(percentageUsed);
  // Bar dibatasi 100% supaya overbudget tidak terlihat "kosong" di kanan.
  const width = Math.min(Math.max(percentageUsed, 0), 100);
  const rounded = Math.round(percentageUsed);

  return (
    <div className={className}>
      <div
        className="mb-1.5 flex items-baseline justify-between gap-2"
        role="group"
        aria-label="Persentase pemakaian anggaran"
      >
        <span className="text-xs font-medium text-app-muted dark:text-zinc-400">
          Terpakai
        </span>
        <span className={`text-sm font-semibold tabular-nums ${TONE_TEXT[tone]}`}>
          {rounded}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Pemakaian anggaran bulanan"
        className="h-3 w-full overflow-hidden rounded-full bg-app-border dark:bg-zinc-700"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${TONE_BAR[tone]}`}
          style={{ width: `${width}%` }}
        />
      </div>

      {isOverBudget ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
        >
          <span aria-hidden="true">!</span>
          <span>
            Pengeluaran bulan ini melampaui anggaran. Kurangi pengeluaran atau
            naikkan target anggaran.
          </span>
        </p>
      ) : null}
    </div>
  );
}
