import type { FinancialSummary } from '@/types';
import { formatCurrency } from './formatCurrency';

type SummaryCardsProps = {
  summary: FinancialSummary;
};

const cards = [
  {
    key: 'totalIncome',
    label: 'Total pemasukan',
    description: 'Semua pemasukan Anda',
    className: 'border-emerald-100 bg-emerald-50',
    amountClassName: 'text-emerald-700',
  },
  {
    key: 'totalExpense',
    label: 'Total pengeluaran',
    description: 'Semua pengeluaran Anda',
    className: 'border-red-100 bg-red-50',
    amountClassName: 'text-red-700',
  },
  {
    key: 'balance',
    label: 'Saldo',
    description: 'Pemasukan dikurangi pengeluaran',
    className: 'border-transparent bg-gradient-to-br from-violet-500 to-indigo-500 text-white',
    amountClassName: 'text-white',
  },
] as const;

export function SummaryCards({ summary }: SummaryCardsProps) {
  const amounts: Record<(typeof cards)[number]['key'], number> = {
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
    balance: summary.balance,
  };

  return (
    <section aria-labelledby="summary-heading">
      <h2 id="summary-heading" className="sr-only">
        Ringkasan keuangan
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.key}
            className={`rounded-3xl border p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${card.className}`}
          >
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className={`mt-3 text-2xl font-semibold ${card.amountClassName}`}>
              {formatCurrency(amounts[card.key])}
            </p>
            <p className="mt-2 text-sm opacity-70">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
