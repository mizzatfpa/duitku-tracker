// Milik Orang 4 — format Rupiah (SRS §5.2: jumlah disimpan/ditampilkan dalam IDR).

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
