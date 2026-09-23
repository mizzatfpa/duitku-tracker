'use server';

import { CreateTransactionInput, UpdateTransactionInput } from '../../types';
import * as TransactionService from './index';
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
 * Server Action: Menambah transaksi baru.
 * Dipanggil oleh form komponen Orang 4.
 */
export async function createTransactionAction(input: CreateTransactionInput) {
  try {
    const userId = await getAuthUser();
    return await TransactionService.createTransaction(userId, input);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

/**
 * Server Action: Mengambil daftar riwayat transaksi pengguna yang sedang login.
 * Dipanggil oleh halaman Dashboard Orang 3.
 */
export async function getTransactionsAction() {
  try {
    const userId = await getAuthUser();
    return await TransactionService.getTransactionsByUserId(userId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

/**
 * Server Action: Mengubah transaksi yang sudah ada.
 * Dipanggil oleh form komponen Orang 4.
 */
export async function updateTransactionAction(input: UpdateTransactionInput) {
  try {
    const userId = await getAuthUser();
    return await TransactionService.updateTransaction(userId, input);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

/**
 * Server Action: Menghapus transaksi.
 * Dipanggil oleh tombol Hapus di komponen Orang 4.
 */
export async function deleteTransactionAction(transactionId: string) {
  try {
    const userId = await getAuthUser();
    return await TransactionService.deleteTransaction(userId, transactionId);
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
