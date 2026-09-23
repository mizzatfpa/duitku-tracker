// Milik Orang 4 — adapter UI ↔ tipe kanonis Orang 2 (SRS §8.1).
// Form berbicara Bahasa Indonesia (pemasukan/pengeluaran, note opsional);
// lapisan data memakai tipe kanonis INCOME/EXPENSE (src/types, Prisma).

import type {
  CreateTransactionInput,
  TransactionItem,
  TransactionType as CanonicalTransactionType,
  UpdateTransactionInput,
} from "@/types";

import type {
  Transaction,
  TransactionFormData,
  TransactionType,
} from "./types";

/** Kategori default karena kolom category kanonis wajib diisi. */
export const DEFAULT_CATEGORY = "Lainnya";

export function toCanonicalType(type: TransactionType): CanonicalTransactionType {
  return type === "pemasukan" ? "INCOME" : "EXPENSE";
}

export function fromCanonicalType(
  type: CanonicalTransactionType,
): TransactionType {
  return type === "INCOME" ? "pemasukan" : "pengeluaran";
}

export function canonicalTypeLabel(type: CanonicalTransactionType): string {
  return type === "INCOME" ? "Pemasukan" : "Pengeluaran";
}

export function toCreateInput(
  data: TransactionFormData,
): CreateTransactionInput {
  return {
    type: toCanonicalType(data.type),
    amount: data.amount,
    category:
      data.category !== undefined && data.category.trim() !== ""
        ? data.category.trim()
        : DEFAULT_CATEGORY,
    description:
      data.note !== undefined && data.note.trim() !== ""
        ? data.note.trim()
        : null,
    date: new Date(`${data.date}T00:00:00`),
  };
}

export function toUpdateInput(
  id: string,
  data: TransactionFormData,
): UpdateTransactionInput {
  return { id, ...toCreateInput(data) };
}

/** Konversi item kanonis menjadi data awal form (mode ubah). */
export function toFormInitial(item: TransactionItem): Transaction {
  const date =
    item.date instanceof Date
      ? item.date.toISOString().slice(0, 10)
      : String(item.date).slice(0, 10);
  return {
    id: item.id,
    type: fromCanonicalType(item.type),
    amount: item.amount,
    date,
    category: item.category,
    note: item.description,
  };
}
