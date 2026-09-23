import type { FinancialSummary, TransactionItem } from '@/types';

export function calculateSummary(transactions: TransactionItem[]): FinancialSummary {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
