"use client";

// Milik Orang 4 — banner umpan balik hasil operasi (SRS FR-022, NFR-006).
// Menampilkan pesan sukses/gagal dari operasi tulis Orang 2.

import { CheckCircle2, XCircle } from "lucide-react";

interface OperationFeedbackProps {
  status: "success" | "error" | null;
  message?: string | null;
}

export default function OperationFeedback({
  status,
  message,
}: OperationFeedbackProps) {
  if (status === null || !message) return null;

  const isSuccess = status === "success";

  return (
    <p
      role={isSuccess ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
          : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {message}
    </p>
  );
}
