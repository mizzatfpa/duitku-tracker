import prisma from '../db/prisma';
import { CreateTransactionInput, UpdateTransactionInput, TransactionFilter } from '../../types';
import { validateCreateTransaction, validateUpdateTransaction } from './validation';
import { Prisma } from '@prisma/client';

/**
 * Membuat transaksi baru.
 * Menerima userId dari session untuk menjamin kepemilikan.
 */
export async function createTransaction(userId: string, input: CreateTransactionInput) {
  const validation = validateCreateTransaction(input);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: input.type,
        amount: input.amount,
        category: input.category,
        description: input.description,
        date: input.date ? new Date(input.date) : new Date(),
      },
    });
    return { success: true, data: transaction };
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return { success: false, errors: ['Terjadi kesalahan pada server saat menyimpan transaksi.'] };
  }
}

/**
 * Mengambil daftar seluruh transaksi milik pengguna.
 * Diurutkan dari tanggal paling baru.
 */
export async function getTransactionsByUserId(userId: string) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: transactions };
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return { success: false, errors: ['Terjadi kesalahan saat mengambil data transaksi.'] };
  }
}

/**
 * Mengambil satu transaksi berdasarkan ID.
 * Memastikan bahwa transaksi tersebut benar-benar milik pengguna yang meminta.
 */
export async function getTransactionById(userId: string, transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return { success: false, errors: ['Transaksi tidak ditemukan.'] };
    }

    if (transaction.userId !== userId) {
      return { success: false, errors: ['Akses ditolak. Transaksi ini bukan milik Anda.'] };
    }

    return { success: true, data: transaction };
  } catch (error) {
    console.error('Failed to get transaction:', error);
    return { success: false, errors: ['Terjadi kesalahan saat mengambil detail transaksi.'] };
  }
}

/**
 * Mengubah transaksi.
 * Memvalidasi input dan memeriksa kepemilikan sebelum mengubah.
 */
export async function updateTransaction(userId: string, input: UpdateTransactionInput) {
  const validation = validateUpdateTransaction(input);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  try {
    // 1. Verifikasi kepemilikan transaksi
    const existing = await prisma.transaction.findUnique({
      where: { id: input.id },
      select: { userId: true },
    });

    if (!existing) {
      return { success: false, errors: ['Transaksi tidak ditemukan.'] };
    }

    if (existing.userId !== userId) {
      return { success: false, errors: ['Akses ditolak. Anda tidak berhak mengubah transaksi ini.'] };
    }

    // 2. Persiapkan data update (hanya field yang dikirimkan)
    const dataToUpdate: Prisma.TransactionUpdateInput = {};
    if (input.type !== undefined) dataToUpdate.type = input.type;
    if (input.amount !== undefined) dataToUpdate.amount = input.amount;
    if (input.category !== undefined) dataToUpdate.category = input.category;
    if (input.description !== undefined) dataToUpdate.description = input.description;
    if (input.date !== undefined) dataToUpdate.date = new Date(input.date);

    // 3. Eksekusi update
    const transaction = await prisma.transaction.update({
      where: { id: input.id },
      data: dataToUpdate,
    });

    return { success: true, data: transaction };
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return { success: false, errors: ['Terjadi kesalahan pada server saat mengubah transaksi.'] };
  }
}

/**
 * Menghapus transaksi.
 * Memeriksa kepemilikan sebelum menghapus.
 */
export async function deleteTransaction(userId: string, transactionId: string) {
  try {
    // 1. Verifikasi kepemilikan
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { userId: true },
    });

    if (!existing) {
      return { success: false, errors: ['Transaksi tidak ditemukan.'] };
    }

    if (existing.userId !== userId) {
      return { success: false, errors: ['Akses ditolak. Anda tidak berhak menghapus transaksi ini.'] };
    }

    // 2. Hapus transaksi
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return { success: true, message: 'Transaksi berhasil dihapus.' };
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return { success: false, errors: ['Terjadi kesalahan pada server saat menghapus transaksi.'] };
  }
}

/**
 * Mengambil ringkasan keuangan milik seorang pengguna (Checklist 4).
 * Menghitung Total Pemasukan, Total Pengeluaran, dan Saldo (Balance).
 */
export async function getFinancialSummary(userId: string) {
  try {
    // Menggunakan Prisma groupBy untuk menjumlahkan 'amount' berdasarkan 'type'
    const result = await prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    result.forEach((group) => {
      // Decimal Prisma perlu di-convert ke Number
      const sumAmount = group._sum.amount ? group._sum.amount.toNumber() : 0;
      
      if (group.type === 'INCOME') {
        totalIncome = sumAmount;
      } else if (group.type === 'EXPENSE') {
        totalExpense = sumAmount;
      }
    });

    const balance = totalIncome - totalExpense;

    return {
      success: true,
      data: {
        balance,
        totalIncome,
        totalExpense,
      },
    };
  } catch (error) {
    console.error('Failed to calculate financial summary:', error);
    return { success: false, errors: ['Terjadi kesalahan saat menghitung ringkasan keuangan.'] };
  }
}

/**
 * Mengambil transaksi milik pengguna dengan filter dinamis.
 * Filter yang didukung: tipe (INCOME/EXPENSE), kategori, rentang tanggal (startDate, endDate),
 * atau berdasarkan bulan dan tahun spesifik.
 */
export async function getFilteredTransactions(userId: string, filter: TransactionFilter) {
  try {
    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.category) {
      where.category = {
        contains: filter.category,
        mode: 'insensitive', // Case-insensitive search for category
      };
    }

    // Prioritaskan startDate & endDate jika diberikan,
    // Jika tidak ada, gunakan month & year jika tersedia.
    if (filter.startDate || filter.endDate) {
      where.date = {};
      if (filter.startDate) where.date.gte = new Date(filter.startDate);
      if (filter.endDate) where.date.lte = new Date(filter.endDate);
    } else if (filter.month && filter.year) {
      // month dalam 1-12
      const startDate = new Date(filter.year, filter.month - 1, 1);
      const endDate = new Date(filter.year, filter.month, 0, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error('Failed to get filtered transactions:', error);
    return { success: false, errors: ['Terjadi kesalahan saat mengambil data filter transaksi.'] };
  }
}
