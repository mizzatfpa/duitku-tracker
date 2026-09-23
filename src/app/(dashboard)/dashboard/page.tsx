import type { FinancialSummary } from '@/types';
import { SummaryCards } from '@/components/dashboard/SummaryCards';

const previewSummary: FinancialSummary = {
  totalIncome: 2450000,
  totalExpense: 850000,
  balance: 1600000,
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFC] px-5 py-8 text-[#111827]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
        <header>
          <p className="text-sm font-medium text-[#6B7280]">Selamat datang kembali</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard DUITku</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">
            Pantau kondisi keuangan Anda dari satu tempat.
          </p>
        </header>

        <SummaryCards summary={previewSummary} />
      </div>
    </main>
  );
}
