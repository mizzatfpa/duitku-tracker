"use client";

// Modal pengaturan anggaran (SRS FR-042, FR-044). Satu-satunya komponen budget
// yang memanggil server, lewat ./adapters (pola zero-reload INTEGRATION_CONTRACT §6).
// Tidak ada router.refresh() maupun window.location.reload.

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

import { deleteBudget, saveBudget } from "./adapters";
import BudgetForm from "./BudgetForm";
import { MONTH_NAMES, type SetBudgetInput } from "./types";

export interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  currentAmount?: number;
  /** Dipanggil setelah simpan/hapus berhasil agar orchestrator refresh data. */
  onBudgetUpdated: () => void;
}

export default function BudgetModal({
  isOpen,
  onClose,
  month,
  year,
  currentAmount,
  onBudgetUpdated,
}: BudgetModalProps) {
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const isEdit = typeof currentAmount === "number" && currentAmount > 0;

  const handleClose = useCallback(() => {
    if (pending) return;
    setServerError(null);
    setConfirmOpen(false);
    onClose();
  }, [onClose, pending]);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !confirmOpen) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, handleClose, isOpen]);

  if (!isOpen) return null;

  async function handleSave(input: SetBudgetInput) {
    setPending(true);
    setServerError(null);
    try {
      const result = await saveBudget(input);
      if (!result.success) {
        setServerError(result.errors.join(" "));
        return;
      }
      onBudgetUpdated();
      onClose();
    } catch {
      setServerError("Gagal menyimpan anggaran. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    setPending(true);
    try {
      const result = await deleteBudget(month, year);
      if (!result.success) {
        setServerError(result.errors.join(" "));
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      onBudgetUpdated();
      onClose();
    } catch {
      setServerError("Gagal menghapus anggaran. Coba lagi.");
      setConfirmOpen(false);
    } finally {
      setPending(false);
    }
  }

  const monthName = MONTH_NAMES[month - 1] ?? month;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-primary-900/40 p-4 sm:items-center"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
        aria-describedby="budget-modal-desc"
        className="w-full max-w-md rounded-3xl border border-app-border bg-surface p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-6 dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="budget-modal-title"
              className="text-lg font-semibold text-app-text dark:text-zinc-100"
            >
              {isEdit ? "Ubah Anggaran" : "Atur Anggaran"}
            </h2>
            <p id="budget-modal-desc" className="mt-0.5 text-sm text-app-muted dark:text-zinc-400">
              {monthName} {year}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            disabled={pending}
            aria-label="Tutup modal"
            className="rounded-lg p-2 text-app-muted transition hover:bg-primary-100 hover:text-primary-700 disabled:opacity-60 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {confirmOpen ? (
          <div className="space-y-4">
            <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Hapus anggaran {monthName} {year}? Progres akan kembali ke pengeluaran
                aktual tanpa target.
              </span>
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={pending}
                className="h-12 rounded-2xl bg-primary-100 px-4 text-sm font-medium text-primary-700 transition hover:bg-primary-300/50 disabled:opacity-60 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                {pending ? "Menghapus…" : "Ya, hapus"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <BudgetForm
              month={month}
              year={year}
              currentAmount={currentAmount}
              pending={pending}
              serverError={serverError}
              onSubmit={handleSave}
              onCancel={handleClose}
            />

            {isEdit ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={pending}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-60 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Hapus anggaran bulan ini
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
