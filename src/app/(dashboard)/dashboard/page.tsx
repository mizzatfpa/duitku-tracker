import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getTransactionsAction } from '@/lib/transactions/actions';

export default async function DashboardPage() {
  const result = await getTransactionsAction();
  const now = new Date();

  return (
    <DashboardClient
      initialTransactions={result.success ? result.data : []}
      initialLoadError={result.success ? null : result.errors.join(' ')}
      initialMonth={now.getMonth() + 1}
      initialYear={now.getFullYear()}
    />
  );
}
