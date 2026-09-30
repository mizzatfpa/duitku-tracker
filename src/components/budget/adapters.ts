// Satu-satunya jalur data dari komponen budget ke Server Actions.

import type { ActionResponse, BudgetProgress, SetBudgetInput } from "./types";
import {
  deleteMonthlyBudgetAction,
  getMonthlyBudgetProgressAction,
  setMonthlyBudgetAction,
} from "@/lib/budget/actions";

export async function getBudgetProgress(
  month: number,
  year: number,
): Promise<ActionResponse<BudgetProgress>> {
  const result = await getMonthlyBudgetProgressAction(month, year);
  if (!result.success) return result;

  const progress = result.data;
  return {
    success: true,
    data: progress
      ? {
          month,
          year,
          budgetAmount: progress.budgetAmount,
          totalExpense: progress.totalExpense,
          remainingAmount: progress.remainingBudget,
          percentageUsed: progress.usagePercentage,
          isOverBudget: progress.isOverBudget,
          hasBudget: true,
        }
      : {
          month,
          year,
          budgetAmount: 0,
          totalExpense: 0,
          remainingAmount: 0,
          percentageUsed: 0,
          isOverBudget: false,
          hasBudget: false,
        },
  };
}

export async function saveBudget(
  input: SetBudgetInput,
): Promise<ActionResponse<{ id: string }>> {
  const result = await setMonthlyBudgetAction(input);
  return result.success
    ? { success: true, data: { id: result.data.id } }
    : result;
}

export async function deleteBudget(
  month: number,
  year: number,
): Promise<ActionResponse<{ id: string }>> {
  return deleteMonthlyBudgetAction(month, year);
}
