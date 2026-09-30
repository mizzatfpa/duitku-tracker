// Cermin kontrak src/types/budget.ts (milik Akbar) — docs/INTEGRATION_CONTRACT.md §3.1.
// Ditulis terpisah karena file itu belum ada saat komponen ini dibuat.
// Setelah backend merge, ganti blok ini dengan re-export dari "@/types/budget".

export interface BudgetProgress {
  month: number;
  year: number;
  /** 0 jika belum ada budget. */
  budgetAmount: number;
  /** Akumulasi pengeluaran aktual bulan tersebut. */
  totalExpense: number;
  /** budgetAmount - totalExpense (negatif = defisit). */
  remainingAmount: number;
  /** (totalExpense / budgetAmount) * 100, 0 jika belum ada budget. */
  percentageUsed: number;
  isOverBudget: boolean;
  hasBudget: boolean;
}

export interface SetBudgetInput {
  month: number;
  year: number;
  amount: number;
}

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; errors: string[] };

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;
