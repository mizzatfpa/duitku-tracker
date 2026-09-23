export function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[#C4B5FD] bg-white p-10 text-center shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE9FE] text-2xl text-[#5B21B6]">
        +
      </div>
      <h2 className="mt-5 text-xl font-semibold text-[#111827]">No transactions yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280]">
        Catat pemasukan atau pengeluaran pertama Anda untuk mulai memahami kondisi keuangan.
      </p>
      <p className="mt-5 text-sm font-semibold text-[#5B21B6]">Add Your First Transaction</p>
    </div>
  );
}
