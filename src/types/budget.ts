export interface Budget {
  id: string;
  userId: string;
  month: number;
  year: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetBudgetInput {
  month: number;
  year: number;
  amount: number;
}

export interface BudgetProgress {
  budgetAmount: number;
  totalExpense: number;
  remainingBudget: number;
  usagePercentage: number;
  isOverBudget: boolean;
}

export interface BudgetSummary {
  month: number;
  year: number;
  progress: BudgetProgress;
}
