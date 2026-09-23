// Milik Orang 4 — kontrak props/callback komponen transaksi (SRS §8.1).
// Catatan: tipe kanonis + operasi simpan milik Orang 2 (src/types, src/lib/transactions).
// File ini hanya kontrak sisi antarmuka agar form bisa dikembangkan paralel
// dengan mock; tanpa menetapkan user_id (pemilik dari session server).

export type TransactionType = "pemasukan" | "pengeluaran";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  category?: string | null;
  note?: string | null;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  date: string;
  category?: string;
  note?: string;
}

/** Bentuk hasil operasi tulis Orang 2 yang ditampilkan form sebagai feedback. */
export interface TransactionOperationResult {
  ok: boolean;
  error?: string;
}
