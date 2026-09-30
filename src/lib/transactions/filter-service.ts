// Milik Fikri — service query filter transaksi (SRS-FR-030).
//
// CATATAN INTEGRASI (penting): fungsi `getFilteredTransactions` yang resmi
// ditugaskan ke Akbar (TASK_BREAKDOWN §2) BELUM ada di `src/lib/transactions/index.ts`
// saat branch ini dibuat. Demi menjaga branch tetap bisa di-build & diuji tanpa
// menunggu PR-1, implementasi sementara hidup di file TERPISA ini supaya file
// milik Akbar (`index.ts`) tidak tersentuh dan tidak konflik saat merge.
//
// Saat PR-1 Akbar sudah merged: pindahkan logic di bawah ke `index.ts`, lalu di
// `actions.ts` cukup ganti import `getFilteredTransactions` dari './filter-service'
// menjadi `* as TransactionService from './index'`. Nama & tanda tangan sudah
// disamakan dengan kontrak, jadi tidak ada perubahan lain.

import 'server-only';

import type { Prisma } from '@prisma/client';

import prisma from '../db/prisma';
import type { TransactionItem } from '../../types';
import type { TransactionFilter } from './filter';
import {
  normalizeTransactionFilter,
  serializeTransactions,
  validateTransactionFilter,
} from './filter';

/**
 * Rentang tanggal untuk kombinasi bulan/tahun.
 * `date` disimpan sebagai tengah malam waktu lokal server (lihat `adapters.ts`
 * yang memakai `new Date(\`${date}T00:00:00\`)`), jadi batasnya juga lokal —
 * memakai UTC akan menggeser transaksi 1-14 jam dan memotong data.
 */
function buildDateRange(filter: TransactionFilter): Date | undefined {
  const { month, year } = filter;
  if (year === undefined && month === undefined) return undefined;

  if (year !== undefined && month !== undefined) {
    return new Date(year, month - 1, 1);
  }
  if (year !== undefined) {
    return new Date(year, 0, 1);
  }
  // Hanya bulan tanpa tahun: cari tahun berjalan (dipakai widget periode).
  return new Date(new Date().getFullYear(), (month as number) - 1, 1);
}

function buildUpperBound(filter: TransactionFilter): Date | undefined {
  const { month, year } = filter;
  if (year === undefined && month === undefined) return undefined;

  if (year !== undefined && month !== undefined) {
    return new Date(year, month, 1);
  }
  if (year !== undefined) {
    return new Date(year + 1, 0, 1);
  }
  return new Date(new Date().getFullYear() + 1, (month as number) - 1, 1);
}

/**
 * Mengambil transaksi milik `userId` sesuai filter dinamis.
 * Isolasi pengguna dijamin oleh `where: { userId }` — klien tidak pernah boleh
 * menentukan pemilik transaksi.
 */
export async function getFilteredTransactions(
  userId: string,
  filter?: Partial<TransactionFilter> | null,
): Promise<{ success: true; data: TransactionItem[] } | { success: false; errors: string[] }> {
  const validation = validateTransactionFilter(filter);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  const normalized = normalizeTransactionFilter(filter);
  const where: Prisma.TransactionWhereInput = { userId };

  if (normalized.type !== undefined && normalized.type !== 'ALL') {
    where.type = normalized.type;
  }

  if (normalized.category !== undefined) {
    where.category = { contains: normalized.category, mode: 'insensitive' };
  }

  if (normalized.searchQuery !== undefined) {
    where.OR = [
      { category: { contains: normalized.searchQuery, mode: 'insensitive' } },
      { description: { contains: normalized.searchQuery, mode: 'insensitive' } },
    ];
  }

  const start = buildDateRange(normalized);
  const end = buildUpperBound(normalized);
  if (start && end) {
    where.date = { gte: start, lt: end };
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    return { success: true, data: serializeTransactions(transactions) };
  } catch (error) {
    console.error('Failed to get filtered transactions:', error);
    return { success: false, errors: ['Terjadi kesalahan saat mengambil data transaksi.'] };
  }
}
