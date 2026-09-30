import { prisma } from '@/lib/db/prisma';
import { Budget, BudgetProgress, SetBudgetInput } from '@/types/budget';

/**
 * Mendapatkan rentang tanggal untuk suatu bulan dan tahun
 */
function getMonthDateRange(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

/**
 * Menyimpan atau memperbarui budget bulanan pengguna (Upsert)
 */
export async function setMonthlyBudget(
  userId: string,
  input: SetBudgetInput
): Promise<Budget> {
  const { month, year, amount } = input;

  const budget = await prisma.budget.upsert({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
    update: {
      amount,
    },
    create: {
      userId,
      month,
      year,
      amount,
    },
  });

  return {
    ...budget,
    amount: budget.amount.toNumber(),
  };
}

/**
 * Mengambil budget pengguna untuk bulan dan tahun tertentu
 */
export async function getMonthlyBudget(
  userId: string,
  month: number,
  year: number
): Promise<Budget | null> {
  const budget = await prisma.budget.findUnique({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
  });

  if (!budget) return null;

  return {
    ...budget,
    amount: budget.amount.toNumber(),
  };
}

/**
 * Menghapus budget dengan validasi kepemilikan
 */
export async function deleteMonthlyBudget(
  userId: string,
  budgetId: string
): Promise<boolean> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
  });

  if (!budget || budget.userId !== userId) {
    throw new Error('Budget tidak ditemukan atau Anda tidak memiliki akses');
  }

  await prisma.budget.delete({
    where: { id: budgetId },
  });

  return true;
}

/**
 * Menghitung progress (pemakaian) budget pada bulan dan tahun tertentu
 */
export async function getMonthlyBudgetProgress(
  userId: string,
  month: number,
  year: number
): Promise<BudgetProgress | null> {
  // 1. Ambil budget
  const budget = await getMonthlyBudget(userId, month, year);
  if (!budget) return null;

  // 2. Hitung total pengeluaran
  const { startDate, endDate } = getMonthDateRange(month, year);
  
  const expenses = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const totalExpense = expenses._sum.amount ? expenses._sum.amount.toNumber() : 0;
  const budgetAmount = budget.amount;

  // 3. Hitung progress
  const remainingBudget = budgetAmount - totalExpense;
  const usagePercentage = budgetAmount > 0 ? (totalExpense / budgetAmount) * 100 : 0;
  const isOverBudget = totalExpense > budgetAmount;

  return {
    budgetAmount,
    totalExpense,
    remainingBudget,
    usagePercentage: Math.min(Math.round(usagePercentage * 100) / 100, 1000), // dibulatkan 2 desimal
    isOverBudget,
  };
}
