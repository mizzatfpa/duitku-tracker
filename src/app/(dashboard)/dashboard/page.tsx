import type { TransactionItem } from '@/types';
import { verifySession } from '@/lib/auth/dal';
import { calculateSummary } from '@/components/dashboard/calculateSummary';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TransactionHistory } from '@/components/dashboard/TransactionHistory';

const previewTransactions: TransactionItem[] = [
  {
    id: 'preview-income',
    userId: 'preview-user',
    type: 'INCOME',
    amount: 2450000,
    category: 'Uang saku',
    description: 'Uang saku bulanan',
    date: new Date('2026-09-01'),
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  },
  {
    id: 'preview-expense',
    userId: 'preview-user',
    type: 'EXPENSE',
    amount: 850000,
    category: 'Kebutuhan kuliah',
    description: 'Buku dan transportasi',
    date: new Date('2026-09-05'),
    createdAt: new Date('2026-09-05'),
    updatedAt: new Date('2026-09-05'),
  },
];

export default async function DashboardPage() {
  // Proteksi FR-006 (dulu di placeholder app/dashboard yang dihapus karena
  // konflik route; permukaan kanonis dashboard milik Orang 3).
  await verifySession();
  const summary = calculateSummary(previewTransactions);

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
