// Form pengaturan anggaran (SRS FR-042, FR-043). Presentational: validasi di
// client, pengiriman lewat callback onSubmit. Pola state + validasi mengikuti
// src/components/transactions/TransactionForm.tsx.

import { useState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";

import { formatIDR } from "@/components/transactions/format";

import { MONTH_NAMES, type SetBudgetInput } from "./types";

export type BudgetFormErrors = Partial<Record<"amount" | "period", string>>;

export interface RawBudgetForm {
  amount: string;
  month: string;
  year: string;
}

/** Terima "1.500.000", "1500000", atau "1500000.50". Pecahan ditolak. */
export function parseAmount(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;

  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed.replace(/\./g, "");
  const value = Number(normalized);
  if (!Number.isFinite(value) || !Number.isInteger(value)) return null;
  return value;
}

export function validateBudgetForm(raw: RawBudgetForm): {
  errors: BudgetFormErrors;
  values: SetBudgetInput | null;
} {
  const errors: BudgetFormErrors = {};
  const amount = parseAmount(raw.amount);
  const month = Number(raw.month);
  const year = Number(raw.year);

  if (raw.amount.trim() === "") {
    errors.amount = "Nominal anggaran wajib diisi.";
  } else if (amount === null) {
    errors.amount = "Nominal harus berupa angka bulat rupiah.";
  } else if (amount <= 0) {
    errors.amount = "Nominal anggaran harus lebih besar dari nol.";
  } else if (amount > 1_000_000_000_000) {
    errors.amount = "Nominal terlalu besar.";
  }

  if (!(month >= 1 && month <= 12)) errors.period = "Bulan tidak valid.";
  else if (!Number.isInteger(year) || year < 2000) errors.period = "Tahun tidak valid.";

  if (errors.amount || errors.period || amount === null) return { errors, values: null };
  return { errors, values: { amount, month, year } };
}

const inputClass =
  "h-12 w-full rounded-xl border border-app-border bg-surface px-3.5 text-sm text-app-text shadow-sm transition placeholder:text-app-muted hover:border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600";

const inputErrorClass =
  "h-12 w-full rounded-xl border border-red-400 bg-surface px-3.5 text-sm text-app-text shadow-sm transition placeholder:text-app-muted focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/25 dark:border-red-500 dark:bg-zinc-900 dark:text-zinc-100";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);

export interface BudgetFormProps {
  month: number;
  year: number;
  /** Nominal saat ini; Memo menentukan mode edit. */
  currentAmount?: number;
  pending?: boolean;
  serverError?: string | null;
  onSubmit: (input: SetBudgetInput) => void | Promise<void>;
  onCancel?: () => void;
}

function FieldError({ message, id }: { message: string; id?: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
    >
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function BudgetForm({
  month,
  year,
  currentAmount,
  pending = false,
  serverError = null,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const isEdit = typeof currentAmount === "number" && currentAmount > 0;
  const [raw, setRaw] = useState<RawBudgetForm>({
    amount: isEdit ? String(currentAmount) : "",
    month: String(month),
    year: String(year),
  });
  const [errors, setErrors] = useState<BudgetFormErrors>({});

  function set<K extends keyof RawBudgetForm>(key: K, value: string) {
    setRaw((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const field = key === "amount" ? "amount" : "period";
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { errors: nextErrors, values } = validateBudgetForm(raw);
    setErrors(nextErrors);
    if (!values) return;
    await onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
      aria-label={isEdit ? "Ubah anggaran bulanan" : "Tetapkan anggaran bulanan"}
    >
      {serverError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {serverError}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="budget-amount"
          className="mb-1.5 block text-sm font-medium text-app-text dark:text-zinc-200"
        >
          Nominal Anggaran (Rp){" "}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <input
          id="budget-amount"
          name="amount"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Contoh: 3000000"
          value={raw.amount}
          onChange={(e) => set("amount", e.target.value)}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "budget-amount-error" : "budget-amount-hint"}
          className={errors.amount ? inputErrorClass : inputClass}
        />
        {errors.amount ? (
          <FieldError message={errors.amount} id="budget-amount-error" />
        ) : isEdit ? (
          <p
            id="budget-amount-hint"
            className="mt-1.5 text-xs text-app-muted dark:text-zinc-400"
          >
            Anggaran saat ini {formatIDR(currentAmount as number)}.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="budget-month"
            className="mb-1.5 block text-sm font-medium text-app-text dark:text-zinc-200"
          >
            Bulan
          </label>
          <select
            id="budget-month"
            name="month"
            value={raw.month}
            onChange={(e) => set("month", e.target.value)}
            aria-invalid={Boolean(errors.period)}
            className={errors.period ? inputErrorClass : inputClass}
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="budget-year"
            className="mb-1.5 block text-sm font-medium text-app-text dark:text-zinc-200"
          >
            Tahun
          </label>
          <select
            id="budget-year"
            name="year"
            value={raw.year}
            onChange={(e) => set("year", e.target.value)}
            aria-invalid={Boolean(errors.period)}
            className={errors.period ? inputErrorClass : inputClass}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      {errors.period ? <FieldError message={errors.period} /> : null}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="h-12 rounded-2xl bg-primary-100 px-4 text-sm font-medium text-primary-700 transition hover:bg-primary-300/50 disabled:opacity-60 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Batal
          </button>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 text-sm font-medium text-white shadow-[0_8px_24px_rgba(139,92,246,0.25)] transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          {pending ? "Menyimpan…" : isEdit ? "Simpan perubahan" : "Simpan anggaran"}
        </button>
      </div>
    </form>
  );
}
