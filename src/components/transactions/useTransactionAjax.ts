"use client";

// Milik Fikri — AJAX controller untuk daftar transaksi (SRS-FR-031..034,
// INTEGRATION_CONTRACT §6). Custom hook ini adalah satu-satunya pemegang state
// transaksi + filter, sehingga dashboard (Orang 4) hanya mengorkestrasi komponen
// tanpa perlu menyentuh server secara langsung.
//
// Aturan keras yang dijaga di file ini:
// 1. TIDAK ADA window.location.reload(), router.refresh(), atau navigasi browser
//    penuh pada operasi mana pun. Semua lewat Server Action + setState lokal.
// 2. `userId` tidak pernah ada di sisi klien; kepemilikan selalu diambil server
//    dari session (lihat src/lib/transactions/actions.ts).
// 3. Tampilan tidak pernah berubah karena tebakan klien: setiap perubahan daftar
//    berasal dari hasil server action.

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createTransactionAction,
  deleteTransactionAction,
  getFilteredTransactionsAction,
  updateTransactionAction,
} from "@/lib/transactions/actions";
import {
  DEFAULT_TRANSACTION_FILTER,
  matchesTransactionFilter,
  normalizeTransactionFilter,
  type ActionResponse,
  type FilterType,
  type TransactionFilter,
} from "@/lib/transactions/filter";
import { toCreateInput, toFormInitial, toUpdateInput } from "./adapters";
import type { Transaction, TransactionFormData } from "./types";

/** Hasil operasi tulis; juga bentuk balik yang diharapkan form TransactionForm. */
export interface TransactionOperationResult {
  ok: boolean;
  error?: string;
  message?: string;
}

export interface TransactionFeedback {
  status: "success" | "error";
  message: string;
}

export interface UseTransactionAjaxOptions {
  /**
   * Data awal yang sudah dirender server component. Kalau diisi, hook tidak
   * melakukan fetch awal sehingga tidak ada flash daftar kosong.
   */
  initialTransactions?: Transaction[];
  /** Filter awal; default "Semua". */
  initialFilter?: Partial<TransactionFilter>;
  /**
   * Dipanggil setiap daftar berubah agar SummaryCards dan BudgetProgress (Orang 4
   * & Izzat) bisa sinkron tanpa refresh browser — lihat INTEGRATION_CONTRACT §6.3.
   */
  onTransactionsChange?: (transactions: Transaction[]) => void;
}

export interface UseTransactionAjaxResult {
  transactions: Transaction[];
  /** True saat daftar sedang di-fetch (load awal atau ganti filter). */
  loading: boolean;
  /** True saat salah satu operasi tulis sedang berjalan. */
  submitting: boolean;
  error: string | null;
  activeFilter: TransactionFilter;
  feedback: TransactionFeedback | null;

  handleFilterChange: (filter: {
    type: FilterType;
    category?: string;
    searchQuery?: string;
  }) => Promise<void>;
  handleAddTransaction: (data: TransactionFormData) => Promise<TransactionOperationResult>;
  handleUpdateTransaction: (
    id: string,
    data: TransactionFormData,
  ) => Promise<TransactionOperationResult>;
  handleDeleteTransaction: (id: string) => Promise<TransactionOperationResult>;
  /** Fetch ulang dengan filter aktif, tanpa mengubah filter. */
  refresh: () => Promise<void>;
  clearFeedback: () => void;
}

/**
 * Pesan galat dari respons Server Action.
 * Bentuk sukses tidak mungkin punya `errors`, jadi aksesnya harus di dalam
 * cabang `!response.success` agar TypeScript boleh menipiskannya.
 */
function failureMessage(response: ActionResponse<unknown>): string {
  if (response.success) return 'Operasi transaksi gagal.';
  return response.errors[0] ?? 'Operasi transaksi gagal.';
}

/** Server mengurutkan tanggal desc; state lokal dijaga dengan urutan sama. */
function sortByDateDesc(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export default function useTransactionAjax(
  options: UseTransactionAjaxOptions = {},
): UseTransactionAjaxResult {
  const { initialTransactions, initialFilter, onTransactionsChange } = options;

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions ?? []);
  const [loading, setLoading] = useState(initialTransactions === undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<TransactionFeedback | null>(null);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>(() =>
    normalizeTransactionFilter(initialFilter ?? DEFAULT_TRANSACTION_FILTER),
  );

  // Cermin state dalam ref: dibaca oleh callback async supaya selalu melihat
  // daftar terbaru meski React belum sempat re-render.
  const listRef = useRef<Transaction[]>(initialTransactions ?? []);

  // Callback parent disimpan lewat effect (bukan langsung saat render) sesuai
  // aturan hooks React 19, sehingga identitasnya tidak memicu effect fetch ulang.
  const changeRef = useRef(onTransactionsChange);
  useEffect(() => {
    changeRef.current = onTransactionsChange;
  }, [onTransactionsChange]);

  // Hanya respons request terakhir yang boleh menulis state, supaya tab yang
  // diklik cepat beruntun tidak menampilkan hasil filter yang sudah basi.
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  const didInitRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /** Satu-satunya jalur memasang daftar ke state dan memberi tahu parent. */
  const commit = useCallback((next: Transaction[]) => {
    const sorted = sortByDateDesc(next);
    listRef.current = sorted;
    setTransactions(sorted);
    changeRef.current?.(sorted);
  }, []);

  /**
   * Satu-satunya jalur ke server untuk membaca daftar.
   * `silent` dipakai untuk sinkronisasi latar (mis. setelah tambah/ubah) supaya
   * skeleton tidak berkedip padahal pengguna tidak sedang mengganti filter.
   */
  const fetchList = useCallback(
    async (filter: TransactionFilter, silent = false): Promise<boolean> => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (!silent) setLoading(true);
      setError(null);

      try {
        const response = await getFilteredTransactionsAction(filter);
        if (requestId !== requestIdRef.current || !mountedRef.current) return false;

        if (!response.success) {
          setError(failureMessage(response));
          return false;
        }

        commit(response.data.map(toFormInitial));
        return true;
      } catch (caught) {
        if (requestId === requestIdRef.current && mountedRef.current) {
          setError(caught instanceof Error ? caught.message : 'Gagal memuat transaksi.');
        }
        return false;
      } finally {
        if (!silent && requestId === requestIdRef.current && mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [commit],
  );

  // Load awal hanya bila server tidak mengirim data (mis. saat dipakai interaktif
  // dari halaman statis). `didInitRef` menjaga agar tidak mengulang saat effect
  // ter-trigger ulang oleh perubahan identitas callback.
  useEffect(() => {
    if (initialTransactions !== undefined || didInitRef.current) return;
    didInitRef.current = true;
    void fetchList(activeFilter);
  }, [activeFilter, fetchList, initialTransactions]);

  /**
   * Menerapkan filter baru lewat server action (AJAX) dan memperbarui daftar di
   * state seketika. Tidak ada reload halaman di jalur ini.
   */
  const handleFilterChange = useCallback(
    async (filter: { type: FilterType; category?: string; searchQuery?: string }) => {
      const next = normalizeTransactionFilter(filter);
      // Terapkan filter seketika supaya pill aktif tidak tampak "lag", walau
      // datanya masih di-fetch (indikator that'll menampilkannya).
      setActiveFilter(next);
      setFeedback(null);
      await fetchList(next);
    },
    [fetchList],
  );

  const refresh = useCallback(async () => {
    await fetchList(activeFilter);
  }, [activeFilter, fetchList]);

  const handleAddTransaction = useCallback(
    async (data: TransactionFormData): Promise<TransactionOperationResult> => {
      setSubmitting(true);
      setError(null);
      setFeedback(null);

      try {
        const response = await createTransactionAction(toCreateInput(data));
        if (!response.success || response.data === undefined) {
          const message = failureMessage(response);
          setError(message);
          setFeedback({ status: "error", message });
          return { ok: false, error: message };
        }

        const created = response.data;
        if (matchesTransactionFilter(created, activeFilter)) {
          // Tambah ke state list seketika — tanpa fetch ulang, tanpa reload.
          commit([toFormInitial(created), ...listRef.current]);
        } else {
          // Tidak cocok dengan filter aktif (mis. sedang menampilkan pengeluaran
          // lalu pengguna menambah pemasukan): refill diam-diam supaya daftar
          // tetap sinkron dengan server tanpa skeleton berkedip.
          await fetchList(activeFilter, true);
        }

        const message = 'Transaksi berhasil ditambahkan.';
        setFeedback({ status: "success", message });
        return { ok: true, message };
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Gagal menambah transaksi.';
        setError(message);
        setFeedback({ status: "error", message });
        return { ok: false, error: message };
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [activeFilter, commit, fetchList],
  );

  const handleUpdateTransaction = useCallback(
    async (id: string, data: TransactionFormData): Promise<TransactionOperationResult> => {
      setSubmitting(true);
      setError(null);
      setFeedback(null);

      try {
        const response = await updateTransactionAction(toUpdateInput(id, data));
        if (!response.success || response.data === undefined) {
          const message = failureMessage(response);
          setError(message);
          setFeedback({ status: "error", message });
          return { ok: false, error: message };
        }

        const updated = toFormInitial(response.data);
        const current = listRef.current;
        const isListed = current.some((item) => item.id === id);

        if (matchesTransactionFilter(response.data, activeFilter)) {
          // Perbarui item di tempat, atau sisipkan bila baru saja masuk filter.
          commit(
            isListed
              ? current.map((item) => (item.id === id ? updated : item))
              : [updated, ...current],
          );
        } else if (isListed) {
          // Transaksi masih ada di database, tapi sudah tidak cocok dengan filter
          // aktif (mis. jenisnya diubah): keluarkan dari daftar di layar.
          commit(current.filter((item) => item.id !== id));
        }

        const message = 'Perubahan transaksi berhasil disimpan.';
        setFeedback({ status: "success", message });
        return { ok: true, message };
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Gagal mengubah transaksi.';
        setError(message);
        setFeedback({ status: "error", message });
        return { ok: false, error: message };
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [activeFilter, commit],
  );

  const handleDeleteTransaction = useCallback(
    async (id: string): Promise<TransactionOperationResult> => {
      setSubmitting(true);
      setError(null);
      setFeedback(null);

      try {
        const response = await deleteTransactionAction(id);
        if (!response.success) {
          const message = failureMessage(response);
          setError(message);
          setFeedback({ status: "error", message });
          return { ok: false, error: message };
        }

        // Hapus dari state list secara langsung — tanpa fetch, tanpa reload.
        commit(listRef.current.filter((item) => item.id !== id));

        const message = response.message ?? 'Transaksi berhasil dihapus.';
        setFeedback({ status: "success", message });
        return { ok: true, message };
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Gagal menghapus transaksi.';
        setError(message);
        setFeedback({ status: "error", message });
        return { ok: false, error: message };
      } finally {
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [commit],
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
    setError(null);
  }, []);

  return {
    transactions,
    loading,
    submitting,
    error,
    activeFilter,
    feedback,
    handleFilterChange,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    refresh,
    clearFeedback,
  };
}
