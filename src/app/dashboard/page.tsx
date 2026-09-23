import type { Metadata } from "next";
import { verifySession, getCurrentUser } from "@/lib/auth/dal";
import { getTransactionsAction } from "@/lib/transactions/actions";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { LogoutButton } from "@/lib/auth/logout-button";

export const metadata: Metadata = {
  title: "Dashboard | Duitku Tracker",
};

export default async function DashboardPage() {
  await verifySession();
  const user = await getCurrentUser();
  const transactionResult = await getTransactionsAction();
  const transactionData = transactionResult.success
    ? transactionResult.data ?? []
    : [];
  const transactions = transactionData.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
        date: new Date(transaction.date),
        createdAt: new Date(transaction.createdAt),
        updatedAt: new Date(transaction.updatedAt),
      }));
  const loadError = transactionResult.success
    ? undefined
    : transactionResult.errors?.join(" ") ?? "Transaksi gagal dimuat.";

  return (
    <main className="min-h-screen bg-[#FAFAFC] px-5 py-8 text-[#111827]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Selamat datang kembali</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Dashboard DUITku
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              {user?.name || user?.email} dapat memantau kondisi keuangan dari satu tempat.
            </p>
          </div>
          <LogoutButton />
        </header>

        <DashboardClient initialTransactions={transactions} loadError={loadError} />
      </div>
    </main>
  );
}