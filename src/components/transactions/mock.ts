// Milik Orang 4 — mock operasi tulis SEMENTARA (SRS FR-024).
// Diganti operasi asli Orang 2 saat tersedia. Tandatangan disamakan dengan
// kontrak kanonis (src/types) agar swap-nya trivial, contoh:
//   import { createTransaction } from "@/lib/transactions";
//   const result = await createTransaction(toCreateInput(formData));
// Tanpa user_id (pemilik dari session server). Tidak menyentuh database.

import type {
  CreateTransactionInput,
  TransactionItem,
  UpdateTransactionInput,
} from "@/types";

export type MockResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const LATENCY_MS = 400;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

const now = new Date();

export function seedMockTransactions(): TransactionItem[] {
  return [
    {
      id: "mock-seed-1",
      userId: "mock-user",
      type: "INCOME",
      amount: 1500000,
      category: "Lainnya",
      description: "Uang saku bulan ini",
      date: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mock-seed-2",
      userId: "mock-user",
      type: "EXPENSE",
      amount: 50000,
      category: "Makanan",
      description: "Makan siang",
      date: now,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export async function mockCreateTransaction(
  input: CreateTransactionInput,
): Promise<MockResult<TransactionItem>> {
  await wait(LATENCY_MS);
  const at = new Date();
  return {
    ok: true,
    data: {
      id: newId("mock"),
      userId: "mock-user",
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description ?? null,
      date: input.date instanceof Date ? input.date : new Date(input.date ?? at),
      createdAt: at,
      updatedAt: at,
    },
  };
}

export async function mockUpdateTransaction(
  input: UpdateTransactionInput,
): Promise<MockResult<null>> {
  await wait(LATENCY_MS);
  void input;
  return { ok: true, data: null };
}

export async function mockDeleteTransaction(
  id: string,
): Promise<MockResult<null>> {
  await wait(LATENCY_MS);
  void id;
  return { ok: true, data: null };
}
