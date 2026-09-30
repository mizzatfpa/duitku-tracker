'use server';

import type {
  CreateTransactionInput,
  TransactionItem,
  UpdateTransactionInput,
} from '../../types';
import { getSession } from '@/lib/auth/session';
import * as TransactionService from './index';
import { getFilteredTransactions } from './filter-service';
import type { ActionResponse, TransactionFilter } from './filter';
import { serializeTransaction, serializeTransactions } from './filter';

type ActionStatus =
  | { success: true; message?: string }
  | { success: false; errors: string[] };

function readErrors(result: object, fallback = 'Operasi transaksi gagal.'): string[] {
  if ('errors' in result && Array.isArray(result.errors)) {
    const errors = result.errors.filter(
      (error): error is string => typeof error === 'string',
    );
    if (errors.length > 0) return errors;
  }
  return [fallback];
}

async function getAuthUser(): Promise<string> {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Anda belum login.');
  }
  return session.userId;
}

export async function createTransactionAction(
  input: CreateTransactionInput,
): Promise<ActionResponse<TransactionItem>> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.createTransaction(userId, input);
    if (!result.success || !('data' in result) || !result.data) {
      return { success: false, errors: readErrors(result, 'Transaksi gagal disimpan.') };
    }
    return { success: true, data: serializeTransaction(result.data) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

export async function getTransactionsAction(): Promise<
  ActionResponse<TransactionItem[]>
> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.getTransactionsByUserId(userId);
    if (!result.success || !('data' in result) || !result.data) {
      return { success: false, errors: readErrors(result, 'Transaksi gagal dimuat.') };
    }
    return { success: true, data: serializeTransactions(result.data) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

export async function updateTransactionAction(
  input: UpdateTransactionInput,
): Promise<ActionResponse<TransactionItem>> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.updateTransaction(userId, input);
    if (!result.success || !('data' in result) || !result.data) {
      return { success: false, errors: readErrors(result, 'Transaksi gagal diubah.') };
    }
    return { success: true, data: serializeTransaction(result.data) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

export async function deleteTransactionAction(
  transactionId: string,
): Promise<ActionStatus> {
  try {
    const userId = await getAuthUser();
    const result = await TransactionService.deleteTransaction(userId, transactionId);
    if (!result.success || !('message' in result) || !result.message) {
      return { success: false, errors: readErrors(result, 'Transaksi gagal dihapus.') };
    }
    return { success: true, message: result.message };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Operasi transaksi gagal.';
    return { success: false, errors: [message] };
  }
}

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
