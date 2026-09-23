export type TransactionType = 'INCOME' | 'EXPENSE';

export interface UserSummary {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface TransactionItem {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string | null;
  date?: Date | string;
}

export interface UpdateTransactionInput {
  id: string;
  type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string | null;
  date?: Date | string;
}
