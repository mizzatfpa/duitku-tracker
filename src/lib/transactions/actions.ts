'use server';

import { CreateTransactionInput, UpdateTransactionInput } from '../../types';
import * as TransactionService from './index';

/**
 * ============================================================================
 * PERHATIAN UNTUK ORANG 1 (AUTH):
 * Silakan ganti isi fungsi getAuthUser() ini dengan fungsi cek session buatanmu
 * yang mengembalikan userId dari cookie/session yang sedang aktif.
 * Pastikan melempar error jika pengguna belum login.
 * ============================================================================
 */
async function getAuthUser(): Promise<string> {
  // TODO (Orang 1): Implementasi fungsi verifikasi session di sini.
  // Contoh implementasi jika sudah selesai:
  // const session = await verifySession();
  // if (!session) throw new Error('Anda belum login.');
  // return session.userId;

  // Placeholder agar fungsi ini diketahui belum terhubung dengan Auth
  throw new Error('UNAUTHORIZED: Fungsi verifikasi session belum diimplementasikan oleh Orang 1.');
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
    return { success: false, errors: [error instanceof Error ? error.message : 'Terjadi kesalahan.'] };
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
    return { success: false, errors: [error instanceof Error ? error.message : 'Terjadi kesalahan.'] };
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
    return { success: false, errors: [error instanceof Error ? error.message : 'Terjadi kesalahan.'] };
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
    return { success: false, errors: [error instanceof Error ? error.message : 'Terjadi kesalahan.'] };
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
    return { success: false, errors: [error instanceof Error ? error.message : 'Terjadi kesalahan.'] };
  }
}
