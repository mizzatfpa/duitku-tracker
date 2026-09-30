'use server';

import type {
  CreateTransactionInput,
  TransactionItem,
  UpdateTransactionInput,
} from '../../types';
import * as TransactionService from './index';
import { getSession } from '@/lib/auth/session';

type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; errors: string[] };

type ActionStatus =
  | { success: true; message?: string }
  | { success: false; errors: string[] };

function toSerializableTransaction<T extends { amount: { toNumber(): number } }>(
  transaction: T,
): Omit<T, 'amount'> & { amount: number } {
  return { ...transaction, amount: transaction.amount.toNumber() };
}

function getErrors(result: object, fallback: string[]): string[] {
  if ('errors' in result && Array.isArray(result.errors)) {
    const errors = result.errors.filter(
      (error): error is string => typeof error === 'string',
    );
    if (errors.length > 0) return errors;
  }
  return fallback;
}

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
export async function createTransactionAction(
  input: CreateTransactionInput,
): Promise<ActionResponse<TransactionItem>> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.createTransaction(userId, input);
    if (!result.success || !result.data) {
      return {
        success: false,
        errors: getErrors(result, ['Transaksi gagal disimpan.']),
      };
    }
    return { success: true, data: toSerializableTransaction(result.data) };
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
export async function getTransactionsAction(): Promise<
  ActionResponse<TransactionItem[]>
> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.getTransactionsByUserId(userId);
    if (!result.success || !result.data) {
      return {
        success: false,
        errors: getErrors(result, ['Transaksi gagal dimuat.']),
      };
    }
    return {
      success: true,
      data: result.data.map(toSerializableTransaction),
    };
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
export async function updateTransactionAction(
  input: UpdateTransactionInput,
): Promise<ActionResponse<TransactionItem>> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.updateTransaction(userId, input);
    if (!result.success || !result.data) {
      return {
        success: false,
        errors: getErrors(result, ['Transaksi gagal diubah.']),
      };
    }
    return { success: true, data: toSerializableTransaction(result.data) };
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
export async function deleteTransactionAction(
  transactionId: string,
): Promise<ActionStatus> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.deleteTransaction(userId, transactionId);
    if (!result.success) {
      return {
        success: false,
        errors: getErrors(result, ['Transaksi gagal dihapus.']),
      };
    }
    return {
      success: true,
      message: 'message' in result ? result.message : undefined,
    };
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
