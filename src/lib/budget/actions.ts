'use server';

import { getSession } from '@/lib/auth/session';
import type {
  Budget,
  BudgetProgress,
  SetBudgetInput,
} from '@/types/budget';
import * as BudgetService from './index';
import { setBudgetSchema } from './validation';
import { z } from 'zod';

type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; errors: string[] };

const budgetPeriodSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
});

async function getAuthUser(): Promise<string> {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('Anda belum login.');
  }
  return session.userId;
}

export async function setMonthlyBudgetAction(
  input: SetBudgetInput,
): Promise<ActionResponse<Budget>> {
  const validation = setBudgetSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.issues.map((issue) => issue.message),
    };
  }

  try {
    const userId = await getAuthUser();
    const budget = await BudgetService.setMonthlyBudget(userId, validation.data);
    return { success: true, data: budget };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal menyimpan anggaran.';
    return { success: false, errors: [message] };
  }
}

export async function getMonthlyBudgetProgressAction(
  month: number,
  year: number,
): Promise<ActionResponse<BudgetProgress | null>> {
  const period = budgetPeriodSchema.safeParse({ month, year });
  if (!period.success) {
    return { success: false, errors: ['Periode anggaran tidak valid.'] };
  }

  try {
    const userId = await getAuthUser();
    const progress = await BudgetService.getMonthlyBudgetProgress(
      userId,
      period.data.month,
      period.data.year,
    );
    return { success: true, data: progress };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal memuat anggaran.';
    return { success: false, errors: [message] };
  }
}

export async function deleteMonthlyBudgetAction(
  month: number,
  year: number,
): Promise<ActionResponse<{ id: string }>> {
  const period = budgetPeriodSchema.safeParse({ month, year });
  if (!period.success) {
    return { success: false, errors: ['Periode anggaran tidak valid.'] };
  }

  try {
    const userId = await getAuthUser();
    const budget = await BudgetService.getMonthlyBudget(
      userId,
      period.data.month,
      period.data.year,
    );
    if (!budget) {
      return { success: false, errors: ['Anggaran tidak ditemukan.'] };
    }

    await BudgetService.deleteMonthlyBudget(userId, budget.id);
    return { success: true, data: { id: budget.id } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal menghapus anggaran.';
    return { success: false, errors: [message] };
  }
}
