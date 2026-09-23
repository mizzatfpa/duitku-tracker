"use client";

// Milik Orang 4 — aksi hapus transaksi + konfirmasi + feedback (SRS FR-020, FR-022).
// Murni UI: penghapusan via onDelete (operasi Orang 2). Tidak menyentuh database.
// Dipasang oleh Orang 3 di riwayat dashboard.

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

import OperationFeedback from "./OperationFeedback";

interface DeleteTransactionButtonProps {
  id: string;
  /** Label ringkas untuk dialog, misal "Pengeluaran Rp50.000". */
  transactionLabel?: string;
  pending?: boolean;
  onDelete: (id: string) => void | Promise<void | { ok: boolean; error?: string }>;
  onDeleted?: (id: string) => void;
}

export default function DeleteTransactionButton({
  id,
  transactionLabel,
  pending = false,
  onDelete,
  onDeleted,
}: DeleteTransactionButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const busy = pending || working;

  useEffect(() => {
    if (confirmOpen) {
      cancelRef.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setConfirmOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [confirmOpen]);

  async function handleConfirm() {
    setWorking(true);
    setFeedback(null);
    try {
      const result = await onDelete(id);
      if (
        result !== null &&
        typeof result === "object" &&
        "ok" in result &&
        result.ok === false
      ) {
        setFeedback({
          status: "error",
          message: result.error ?? "Gagal menghapus transaksi. Coba lagi.",
        });
        return;
      }
      setFeedback({ status: "success", message: "Transaksi berhasil dihapus." });
      setConfirmOpen(false);
      onDeleted?.(id);
    } catch {
      setFeedback({
        status: "error",
        message: "Gagal menghapus transaksi. Coba lagi.",
      });
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => {
          setFeedback(null);
          setConfirmOpen(true);
        }}
        disabled={busy}
        aria-label="Hapus transaksi"
        title="Hapus transaksi"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-rose-800 dark:hover:text-rose-400"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      {feedback ? (
        <OperationFeedback status={feedback.status} message={feedback.message} />
      ) : null}

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!busy) setConfirmOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-tx-title"
            aria-describedby="delete-tx-desc"
            className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <h2
                  id="delete-tx-title"
                  className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Hapus transaksi?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                aria-label="Tutup dialog"
                className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-60 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p
              id="delete-tx-desc"
              className="mt-3 text-sm text-zinc-600 dark:text-zinc-300"
            >
              {transactionLabel
                ? `“${transactionLabel}” akan dihapus permanen dan tidak bisa dikembalikan.`
                : "Transaksi akan dihapus permanen dan tidak bisa dikembalikan."}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                {busy ? "Menghapus…" : "Ya, hapus"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
