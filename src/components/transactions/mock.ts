// Milik Orang 4 — mock operasi tulis SEMENTARA (SRS FR-024).
// Diganti operasi asli Orang 2 (src/lib/transactions) saat sudah tersedia.
// Bentuk input/output disamakan dengan kontrak §8.1: tanpa user_id,
// return { ok, error? }. Tidak menyentuh database.

import type {
  Transaction,
  TransactionFormData,
} from "./types";
import { todayISODate } from "./validation";

const LATENCY_MS = 400;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mock-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function seedMockTransactions(): Transaction[] {
  return [
    {
      id: "mock-seed-1",
      type: "pemasukan",
      amount: 1500000,
      date: todayISODate(),
      category: "Lainnya",
      note: "Uang saku bulan ini",
    },
    {
      id: "mock-seed-2",
      type: "pengeluaran",
      amount: 50000,
      date: todayISODate(),
      category: "Makanan",
      note: "Makan siang",
    },
  ];
}

export async function mockCreateTransaction(
  list: Transaction[],
  data: TransactionFormData,
): Promise<{ ok: true; transaction: Transaction } | { ok: false; error: string }> {
  await wait(LATENCY_MS);
  const transaction: Transaction = { id: newId(), ...data };
  void list;
  return { ok: true, transaction };
}

export async function mockUpdateTransaction(
  id: string,
  data: TransactionFormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await wait(LATENCY_MS);
  void id;
  void data;
  return { ok: true };
}

export async function mockDeleteTransaction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await wait(LATENCY_MS);
  void id;
  return { ok: true };
}
