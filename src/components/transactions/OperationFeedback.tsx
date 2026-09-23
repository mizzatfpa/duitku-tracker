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
      className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
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
