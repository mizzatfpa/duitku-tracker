// Sumber data mock untuk komponen budget (SRS FR-038 s/d FR-044).
// SATU-SATUNYA tempat komponen menyentuh server. Backend Akbar akan
// menyediakan src/lib/budget/actions.ts; setelah itu, ganti isi fungsi di bawah
// dengan pemanggilan server action. Komponen tidak perlu diubah.

import type { ActionResponse, BudgetProgress, SetBudgetInput } from "./types";

// ponytail: penyimpanan di memori modul, hilang saat reload. Cukup untuk UI;
// ganti dengan server action sungguhan saat backend merge.

const mockBudgets = new Map<string, number>();

function key(month: number, year: number): string {
  return `${year}-${month}`;
}

const MOCK_LATENCY_MS = 250;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}

/** Total pengeluaran mock untuk bulan/tahun tertentu. */
function mockExpense(month: number, year: number): number {
  // 4.200.000 untuk September 2026 agar ambang 80% bisa diuji manual.
  if (month === 9 && year === 2026) return 4_200_000;
  return 1_500_000;
}

export async function getBudgetProgress(
  month: number,
  year: number,
): Promise<ActionResponse<BudgetProgress>> {
  await delay();

  const budgetAmount = mockBudgets.get(key(month, year)) ?? 0;
  const totalExpense = budgetAmount === 0 ? 0 : mockExpense(month, year);
  const hasBudget = budgetAmount > 0;
  const percentageUsed =
    hasBudget && budgetAmount > 0 ? (totalExpense / budgetAmount) * 100 : 0;

  return {
    success: true,
    data: {
      month,
      year,
      budgetAmount,
      totalExpense,
      remainingAmount: budgetAmount - totalExpense,
      percentageUsed,
      isOverBudget: hasBudget && totalExpense > budgetAmount,
      hasBudget,
    },
  };
}

export async function saveBudget(
  input: SetBudgetInput,
): Promise<ActionResponse<{ id: string }>> {
  await delay();

  if (!(input.amount > 0)) {
    return { success: false, errors: ["Nominal anggaran harus lebih besar dari nol."] };
  }
  if (input.month < 1 || input.month > 12) {
    return { success: false, errors: ["Bulan tidak valid."] };
  }

  mockBudgets.set(key(input.month, input.year), input.amount);
  return { success: true, data: { id: key(input.month, input.year) } };
}

export async function deleteBudget(
  id: string,
): Promise<ActionResponse<{ id: string }>> {
  await delay();
  mockBudgets.delete(id);
  return { success: true, data: { id } };
}
