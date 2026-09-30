import type { TransactionItem } from '@/types';
import { Pencil } from 'lucide-react';
import DeleteTransactionButton from '@/components/transactions/DeleteTransactionButton';
import { formatCurrency } from './formatCurrency';

type TransactionHistoryProps = {
  transactions: TransactionItem[];
  onEdit?: (transaction: TransactionItem) => void;
  onDelete?: (id: string) => Promise<{ ok: boolean; error?: string }>;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function TransactionHistory({
  transactions,
  onEdit,
  onDelete,
}: TransactionHistoryProps) {
  return (
    <section aria-labelledby="history-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Aktivitas terbaru</p>
          <h2 id="history-heading" className="mt-1 text-2xl font-semibold">
            Riwayat transaksi
          </h2>
        </div>
        <span className="text-sm text-[#6B7280]">{transactions.length} transaksi</span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <ul className="divide-y divide-[#E5E7EB]" aria-label="Daftar riwayat transaksi">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'INCOME';

            return (
              <li key={transaction.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    aria-hidden="true"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${
                      isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111827]">{transaction.category}</p>
                    <p className="truncate text-sm text-[#6B7280]">
                      {transaction.description || 'Tidak ada catatan'} · {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className={`shrink-0 font-semibold ${isIncome ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </p>
                  {onEdit ? (
                    <button
                      type="button"
                      onClick={() => onEdit(transaction)}
                      aria-label="Ubah transaksi"
                      title="Ubah transaksi"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-app-border bg-surface text-app-muted shadow-sm transition hover:border-primary-300 hover:text-primary-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                  {onDelete ? (
                    <DeleteTransactionButton
                      id={transaction.id}
                      transactionLabel={`${isIncome ? 'Pemasukan' : 'Pengeluaran'} ${formatCurrency(transaction.amount)}`}
                      onDelete={onDelete}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
