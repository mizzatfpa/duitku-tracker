import type { Metadata } from "next";
import { verifySession, getCurrentUser } from "@/lib/auth/dal";
import type { TransactionItem } from "@/types";
import { calculateSummary } from "@/components/dashboard/calculateSummary";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionHistory } from "@/components/dashboard/TransactionHistory";

export const metadata: Metadata = {
  title: "Dashboard | Duitku Tracker",
};

const previewTransactions: TransactionItem[] = [
  {
    id: "preview-income",
    userId: "preview-user",
    type: "INCOME",
    amount: 2450000,
    category: "Uang saku",
    description: "Uang saku bulanan",
    date: new Date("2026-09-01"),
    createdAt: new Date("2026-09-01"),
    updatedAt: new Date("2026-09-01"),
  },
  {
    id: "preview-expense",
    userId: "preview-user",
    type: "EXPENSE",
    amount: 850000,
    category: "Kebutuhan kuliah",
    description: "Buku dan transportasi",
    date: new Date("2026-09-05"),
    createdAt: new Date("2026-09-05"),
    updatedAt: new Date("2026-09-05"),
  },
];

export default async function DashboardPage() {
  await verifySession();
  const user = await getCurrentUser();
  const summary = calculateSummary(previewTransactions);

  return (
    <main className="min-h-screen bg-[#FAFAFC] px-5 py-8 text-[#111827]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
        <header>
          <p className="text-sm font-medium text-[#6B7280]">Selamat datang kembali</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Dashboard DUITku
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            {user?.name || user?.email} dapat memantau kondisi keuangan dari satu tempat.
          </p>
        </header>

        <SummaryCards summary={summary} />

        {previewTransactions.length > 0 ? (
          <TransactionHistory transactions={previewTransactions} />
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  );
}