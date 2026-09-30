// Milik Fikri — halaman preview SEMENTARA untuk verifikasi filter + AJAX transaksi
// (SRS-FR-030 s/d FR-034, zero-reload). Dihapus setelah Orang 4 memasang
// TransactionFilter + useTransactionAjax di (dashboard).
//
// Halaman ini tidak butuh data server: useTransactionAjax melakukan fetch awal
// sendiri lewat Server Action, sehingga juga membuktikan alur AJAX berjalan
// penuh tanpa `router.refresh()`.

import PreviewFilterAjaxClient from "./PreviewFilterAjaxClient";

export const metadata = {
  title: "Preview Filter & AJAX — Duitku Tracker",
};

export default function PreviewFilterAjaxPage() {
  return <PreviewFilterAjaxClient />;
}
