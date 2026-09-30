'use server';

import { CreateTransactionInput, TransactionItem, UpdateTransactionInput } from '../../types';
import * as TransactionService from './index';
import { getFilteredTransactions } from './filter-service';
import type { ActionResponse, TransactionFilter } from './filter';
import { serializeTransaction, serializeTransactions } from './filter';
import { getSession } from '@/lib/auth/session';

/**
 * Mengambil userId pengguna yang sedang login dari session aktif (Orang 1).
 * Melempar error biasa (bukan redirect) agar catch pada tiap aksi otomatis
 * mengembalikan { success: false, errors } saat pengguna belum masuk.
 */
async function getAuthUser(): Promise<string> {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Anda belum login.');
  }
  return session.userId;
}

/**
 * Membaca pesan galat dari hasil service layer milik Akbar.
 *
 * `src/lib/transactions/index.ts` mengembalikan union yang belum dinormalisasi
 * (`success` ter-widen menjadi `boolean`, sehingga `data`/`errors` tidak bisa
 * di-narrow lewat pemeriksaan `success`). Fungsi ini menjembataninya supaya
 * setiap Server Action tetap punya bentuk `{ success, errors }` yang konsisten
 * dengan INTEGRATION_CONTRACT §3.1, tanpa harus mengubah file milik Akbar.
 */
function readErrors(result: { errors?: string[] }): string[] {
  return result.errors ?? ['Operasi transaksi gagal.'];
}

/**
 * Server Action: Menambah transaksi baru.
 * Dipanggil oleh form komponen Orang 4 dan useTransactionAjax (Fikri).
 *
 * Catatan: record Prisma dinormalisasi lewat `serializeTransaction` sebelum
 * dikembalikan. Tanpa itu field `amount` (Prisma Decimal) tidak bisa diserialisasi
 * React Server Component dan seluruh alur AJAX akan gagal saat pertama kali
 * mengirim data ke klien.
 */
export async function createTransactionAction(
  input: CreateTransactionInput,
): Promise<ActionResponse<TransactionItem>> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.createTransaction(userId, input);
    if (!result.success || !('data' in result) || !result.data) {
      return { success: false, errors: readErrors(result) };
    }
    return { success: true, data: serializeTransaction(result.data) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

/**
 * Server Action: Mengambil daftar riwayat transaksi pengguna yang sedang login.
 * Dipanggil oleh halaman Dashboard Orang 3. Sudah dinormalisasi (lihat catatan
 * pada createTransactionAction).
 */
export async function getTransactionsAction(): Promise<
  ActionResponse<TransactionItem[]>
> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.getTransactionsByUserId(userId);
    if (!result.success || !('data' in result) || !result.data) {
      return { success: false, errors: readErrors(result) };
    }
    return { success: true, data: serializeTransactions(result.data) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

/**
 * Server Action: Mengubah transaksi yang sudah ada.
 * Dipanggil oleh form komponen Orang 4 dan useTransactionAjax (Fikri).
 * Dinormalisasi sebelum dikirim ke klien, sama seperti createTransactionAction.
 */
export async function updateTransactionAction(
  input: UpdateTransactionInput,
): Promise<ActionResponse<TransactionItem>> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.updateTransaction(userId, input);
    if (!result.success || !('data' in result) || !result.data) {
      return { success: false, errors: readErrors(result) };
    }
    return { success: true, data: serializeTransaction(result.data) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

/**
 * Server Action: Menghapus transaksi.
 * Dipanggil oleh tombol Hapus di komponen Orang 4 dan useTransactionAjax (Fikri).
 * Tidak mengembalikan record, jadi tidak ada masalah serialisasi Decimal.
 */
export async function deleteTransactionAction(
  transactionId: string,
): Promise<{ success: true; message: string } | { success: false; errors: string[] }> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.deleteTransaction(userId, transactionId);
    if (!result.success || !('message' in result) || !result.message) {
      return { success: false, errors: readErrors(result) };
    }
    return { success: true, message: result.message };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

/**
 * Server Action: Mengambil transaksi milik pengguna yang sedang login dengan
 * filter dinamis (jenis, kategori, kata kunci, bulan/tahun).
 * Milik Fikri (TASK_BREAKDOWN §2, SRS-FR-030).
 *
 * `userId` SELALU dari session server, tidak pernah dari `filter` — filter hanya
 * boleh mempersempit, tidak pernah mengganti pemilik data.
 */
export async function getFilteredTransactionsAction(
  filter: TransactionFilter = {},
): Promise<ActionResponse<TransactionItem[]>> {
  try {
    const userId = await getAuthUser();
    return await getFilteredTransactions(userId, filter);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

/**
 * Server Action: Menghitung total saldo, pemasukan, dan pengeluaran.
 * Dipanggil oleh halaman Dashboard Orang 3.
 */
export async function getFinancialSummaryAction() {
  try {
    const userId = await getAuthUser();
    return await TransactionService.getFinancialSummary(userId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}
