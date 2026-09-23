"use client";

// Milik Orang 4 — tombol CTA transaksi pertama untuk empty state (design.md).
// Dipasang oleh Orang 3 di area kosong dashboard; klik-nya membuka form
// (Orang 3 mengatur perilaku buka form, misal scroll/modal).

import { Plus } from "lucide-react";

interface AddTransactionCTAProps {
  onClick: () => void;
  label?: string;
}

export default function AddTransactionCTA({
  onClick,
  label = "Add Your First Transaction",
}: AddTransactionCTAProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(139,92,246,0.25)] transition hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
