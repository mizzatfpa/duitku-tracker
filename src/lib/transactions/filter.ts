// Milik Fikri — kontrak & utilitas filter transaksi (SRS-FR-030, §3.2 INTEGRATION_CONTRACT).
//
// Modul ini SENGAJA tanpa import Prisma sehingga bisa dipakai di server (service
// filter) maupun di klien (useTransactionAjax) tanpa menarik kode database.
//
// Catatan integrasi: tipe `FilterType` & `TransactionFilter` di sini mengikuti
// persis kontrak INTEGRATION_CONTRACT §3.2. Ketika Akbar menaruh versi kanonisnya
// di `src/types/index.ts` (PR-1), cukup ganti baris import di `filter-service.ts`,
// `actions.ts`, dan `TransactionFilter.tsx` — tidak ada perubahan kode lain.

// Tipe kanonis transaksi milik Orang 2 (src/types).
import type { TransactionItem, TransactionType } from '../../types';

export type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';

export interface TransactionFilter {
  type?: FilterType;
  category?: string;
  month?: number;
  year?: number;
  searchQuery?: string;
}

/** Bentuk respons seragam seluruh Server Action (INTEGRATION_CONTRACT §3.1). */
export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; errors: string[] };

/** Filter netral: seluruh transaksi, tanpa pembatasan kategori/pencarian/periode. */
export const DEFAULT_TRANSACTION_FILTER: TransactionFilter = { type: 'ALL' };

const FILTER_TYPES: readonly FilterType[] = ['ALL', 'INCOME', 'EXPENSE'];

function normalizeOptionalText(value: string | undefined | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Membersihkan input filter dari klien sebelum dipakai query.
 * Nilai tak dikenal (mis. `type: "foo"` dari request yang dimanipulasi) dibuang,
 * bukan diteruskan ke Prisma, sehingga lapisan database tidak pernah melihat
 * input yang sudah dinormalisasi.
 */
export function normalizeTransactionFilter(
  input?: Partial<TransactionFilter> | null,
): TransactionFilter {
  const source = input ?? {};
  const filter: TransactionFilter = {};

  if (source.type !== undefined && FILTER_TYPES.includes(source.type)) {
    filter.type = source.type;
  } else {
    filter.type = 'ALL';
  }

  const category = normalizeOptionalText(source.category);
  if (category !== undefined) filter.category = category;

  const searchQuery = normalizeOptionalText(source.searchQuery);
  if (searchQuery !== undefined) filter.searchQuery = searchQuery;

  if (typeof source.month === 'number' && Number.isInteger(source.month)) {
    const month = source.month;
    if (month >= 1 && month <= 12) filter.month = month;
  }

  if (typeof source.year === 'number' && Number.isInteger(source.year)) {
    const year = source.year;
    if (year >= 1970 && year <= 9999) filter.year = year;
  }

  return filter;
}

/** Validasi ketat untuk pemanggil yang butuh pesan galat, bukan nilai default. */
export function validateTransactionFilter(input?: Partial<TransactionFilter> | null): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const source = input ?? {};

  if (source.type !== undefined && !FILTER_TYPES.includes(source.type)) {
    errors.push('Jenis filter tidak dikenal. Harus ALL, INCOME, atau EXPENSE.');
  }
  if (source.month !== undefined) {
    if (typeof source.month !== 'number' || !Number.isInteger(source.month) || source.month < 1 || source.month > 12) {
      errors.push('Bulan filter harus berupa bilangan bulat 1 sampai 12.');
    }
  }
  if (source.year !== undefined) {
    if (typeof source.year !== 'number' || !Number.isInteger(source.year)) {
      errors.push('Tahun filter harus berupa bilangan bulat.');
    }
  }
  if (source.searchQuery !== undefined && typeof source.searchQuery !== 'string') {
    errors.push('Kata kunci pencarian harus berupa teks.');
  }
  if (source.category !== undefined && typeof source.category !== 'string') {
    errors.push('Kategori filter harus berupa teks.');
  }

  return { isValid: errors.length === 0, errors };
}

/** Bentuk record Prisma-mentah yang perlu dinormalisasi sebelum crosses ke klien. */
interface RawTransactionRecord {
  id: string;
  userId: string;
  type: TransactionType;
  /** Prisma `Decimal` di runtime meski tipenya `number` di src/types. */
  amount: unknown;
  category: string;
  description: string | null;
  date: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

function toPlainNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value !== null && typeof value === 'object') {
    const decimal = value as { toNumber?: unknown };
    if (typeof decimal.toNumber === 'function') {
      const result = decimal.toNumber();
      if (Number.isFinite(result)) return result;
    }
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPlainDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/**
 * Mengubah record hasil Prisma menjadi objek polos yang aman dikirim ke Client
 * Component. Tanpa ini, `Prisma.Decimal` pada field `amount` tidak dapat
 * diserialisasi oleh React Server Component ("Only plain objects ... can be
 * passed to Client Components") sehingga seluruh alur AJAX transaksi gagal.
 */
export function serializeTransaction(record: RawTransactionRecord): TransactionItem {
  return {
    id: record.id,
    userId: record.userId,
    type: record.type,
    amount: toPlainNumber(record.amount),
    category: record.category,
    description: record.description ?? null,
    date: toPlainDate(record.date),
    createdAt: toPlainDate(record.createdAt),
    updatedAt: toPlainDate(record.updatedAt),
  };
}

export function serializeTransactions(records: RawTransactionRecord[]): TransactionItem[] {
  return records.map(serializeTransaction);
}

function includesInsensitive(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/**
 * Predikat sisi-klien yang mencerminkan query `getFilteredTransactions`.
 * Dipakai `useTransactionAjax` untuk decides apakah transaksi baru/ubah layak
 * disisipkan ke state list atau justru di-refetch, supaya daftar di layar selalu
 * konsisten dengan filter aktif tanpa memanggil server lagi.
 */
export function matchesTransactionFilter(
  item: Pick<TransactionItem, 'type' | 'category' | 'description' | 'date'>,
  filter?: Partial<TransactionFilter> | null,
): boolean {
  const { type, category, searchQuery, month, year } = normalizeTransactionFilter(filter);

  if (type !== 'ALL' && item.type !== type) return false;

  if (category !== undefined && !includesInsensitive(item.category, category)) {
    return false;
  }

  if (searchQuery !== undefined) {
    const description = item.description ?? '';
    const matched =
      includesInsensitive(item.category, searchQuery) || includesInsensitive(description, searchQuery);
    if (!matched) return false;
  }

  if (year !== undefined || month !== undefined) {
    const date = item.date instanceof Date ? item.date : new Date(item.date);
    if (Number.isNaN(date.getTime())) return false;
    if (year !== undefined && date.getFullYear() !== year) return false;
    if (month !== undefined && date.getMonth() + 1 !== month) return false;
  }

  return true;
}
