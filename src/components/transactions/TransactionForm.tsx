"use client";

// Milik Orang 4 — form tambah/ubah transaksi (SRS FR-020, FR-021).
// Murni komponen UI: kirim data via onSubmit TANPA user_id (pemilik dari
// session server, §5.2). Operasi simpan milik Orang 2, ringkasan/riwayat
// milik Orang 3. Dipasang oleh Orang 3 di dashboard.

import { useState } from "react";
import { AlertCircle, Loader2, Pencil, Plus, XCircle } from "lucide-react";

import type { Transaction, TransactionFormData } from "./types";
import {
  CATEGORY_SUGGESTIONS,
  todayISODate,
  validateTransactionForm,
  type RawTransactionForm,
  type TransactionFormErrors,
} from "./validation";

interface TransactionFormProps {
  initialData?: Transaction | null;
  pending?: boolean;
  serverError?: string | null;
  submitLabel?: string;
  onSubmit: (data: TransactionFormData) => void | Promise<void>;
  onCancel?: () => void;
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600";

const inputErrorClass =
  "w-full rounded-lg border border-rose-400 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 dark:border-rose-500 dark:bg-zinc-900 dark:text-zinc-100";

function toRaw(initialData?: Transaction | null): RawTransactionForm {
  if (!initialData) {
    return { type: "", amount: "", date: todayISODate(), category: "", note: "" };
  }
  return {
    type: initialData.type,
    amount: String(initialData.amount),
    date: initialData.date.slice(0, 10),
    category: initialData.category ?? "",
    note: initialData.note ?? "",
  };
}

export default function TransactionForm({
  initialData = null,
  pending = false,
  serverError = null,
  submitLabel,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const isEdit = initialData !== null;
  const [raw, setRaw] = useState<RawTransactionForm>(() => toRaw(initialData));
  const [errors, setErrors] = useState<TransactionFormErrors>({});

  function set<K extends keyof RawTransactionForm>(key: K, value: string) {
    setRaw((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { errors: nextErrors, values } = validateTransactionForm(raw);
    setErrors(nextErrors);
    if (!values) return;
    await onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
      aria-label={isEdit ? "Ubah transaksi" : "Tambah transaksi"}
    >
      {serverError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
        >
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {serverError}
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Jenis transaksi <span aria-hidden="true" className="text-rose-500">*</span>
        </legend>
        <div
          role="radiogroup"
          aria-label="Jenis transaksi"
          className="grid grid-cols-2 gap-2"
        >
          {(
            [
              { value: "pemasukan", label: "Pemasukan" },
              { value: "pengeluaran", label: "Pengeluaran" },
            ] as const
          ).map((option) => {
            const selected = raw.type === option.value;
            return (
              <label
                key={option.value}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium transition focus-within:ring-2 focus-within:ring-emerald-500/30 ${
                  selected
                    ? option.value === "pemasukan"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950 dark:text-rose-300"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={selected}
                  onChange={(e) => set("type", e.target.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
        {errors.type ? (
          <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {errors.type}
          </p>
        ) : null}
      </fieldset>

      <div>
        <label
          htmlFor="tx-amount"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
        >
          Jumlah (Rp) <span aria-hidden="true" className="text-rose-500">*</span>
        </label>
        <input
          id="tx-amount"
          name="amount"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Contoh: 50000"
          value={raw.amount}
          onChange={(e) => set("amount", e.target.value)}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "tx-amount-error" : undefined}
          className={errors.amount ? inputErrorClass : inputClass}
        />
        {errors.amount ? (
          <p id="tx-amount-error" role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {errors.amount}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="tx-date"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
        >
          Tanggal <span aria-hidden="true" className="text-rose-500">*</span>
        </label>
        <input
          id="tx-date"
          name="date"
          type="date"
          value={raw.date}
          onChange={(e) => set("date", e.target.value)}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? "tx-date-error" : undefined}
          className={errors.date ? inputErrorClass : inputClass}
        />
        {errors.date ? (
          <p id="tx-date-error" role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {errors.date}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="tx-category"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
        >
          Kategori <span className="font-normal text-zinc-400">(opsional)</span>
        </label>
        <input
          id="tx-category"
          name="category"
          type="text"
          list="tx-category-suggestions"
          autoComplete="off"
          placeholder="Contoh: Makanan"
          value={raw.category}
          onChange={(e) => set("category", e.target.value)}
          aria-invalid={Boolean(errors.category)}
          className={errors.category ? inputErrorClass : inputClass}
        />
        <datalist id="tx-category-suggestions">
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {errors.category ? (
          <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {errors.category}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="tx-note"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
        >
          Catatan <span className="font-normal text-zinc-400">(opsional)</span>
        </label>
        <textarea
          id="tx-note"
          name="note"
          rows={3}
          maxLength={500}
          placeholder="Contoh: Makan siang bersama teman"
          value={raw.note}
          onChange={(e) => set("note", e.target.value)}
          className={`${errors.note ? inputErrorClass : inputClass} resize-y`}
        />
        {errors.note ? (
          <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {errors.note}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : isEdit ? (
            <Pencil className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {pending
            ? "Menyimpan…"
            : (submitLabel ?? (isEdit ? "Simpan perubahan" : "Tambah transaksi"))}
        </button>
      </div>
    </form>
  );
}
