// Milik Orang 4 — validasi client form transaksi (SRS FR-021).
// Mencerminkan aturan server FR-008/FR-013: jenis dikenal, jumlah positif.

import type { TransactionFormData, TransactionType } from "./types";

export type TransactionFormErrors = Partial<
  Record<"type" | "amount" | "date" | "category" | "note", string>
>;

export interface RawTransactionForm {
  type: string;
  amount: string;
  date: string;
  category: string;
  note: string;
}

/** Saran kategori (SRS §9: kategori bawaan belum ditentukan tim → bebas ketik). */
export const CATEGORY_SUGGESTIONS = [
  "Makanan",
  "Transportasi",
  "Pendidikan",
  "Hiburan",
  "Kesehatan",
  "Belanja",
  "Lainnya",
] as const;

export function todayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateTransactionForm(
  raw: RawTransactionForm,
): { errors: TransactionFormErrors; values: TransactionFormData | null } {
  const errors: TransactionFormErrors = {};

  if (raw.type !== "pemasukan" && raw.type !== "pengeluaran") {
    errors.type = "Pilih jenis transaksi: pemasukan atau pengeluaran.";
  }

  const amountText = raw.amount.trim().replace(/\./g, "").replace(/,/g, ".");
  const amount = Number(amountText);
  if (raw.amount.trim() === "") {
    errors.amount = "Jumlah wajib diisi.";
  } else if (!Number.isFinite(amount)) {
    errors.amount = "Jumlah harus berupa angka.";
  } else if (amount <= 0) {
    errors.amount = "Jumlah harus lebih besar dari nol.";
  } else if (!Number.isInteger(amount)) {
    errors.amount = "Jumlah harus bilangan bulat dalam Rupiah.";
  } else if (amount > 1_000_000_000_000) {
    errors.amount = "Jumlah terlalu besar.";
  }

  if (raw.date.trim() === "") {
    errors.date = "Tanggal wajib diisi.";
  } else if (Number.isNaN(Date.parse(raw.date))) {
    errors.date = "Tanggal tidak valid.";
  }

  if (raw.category.trim().length > 60) {
    errors.category = "Kategori maksimal 60 karakter.";
  }

  if (raw.note.trim().length > 500) {
    errors.note = "Catatan maksimal 500 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values: null };
  }

  const values: TransactionFormData = {
    type: raw.type as TransactionType,
    amount,
    date: raw.date,
  };
  if (raw.category.trim() !== "") values.category = raw.category.trim();
  if (raw.note.trim() !== "") values.note = raw.note.trim();
  return { errors, values };
}
