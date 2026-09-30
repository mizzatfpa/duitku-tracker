# Lembar Verifikasi Kualitas & Pengujian (QA Checklist)

## DUITku Tracker — Fase 2 (Audit AJAX & Fitur Budget Bulanan)

| Informasi | Keterangan |
|---|---|
| Penanggung Jawab QA | Muhammad Nauval Fadli (Project Manager) |
| Target Rilis | Branch `main` v2.0 |
| Tanggal | 30 September 2026 |

---

## 1. Panduan Pengujian untuk Project Manager (PM)
Dokumen ini digunakan oleh PM untuk menguji setiap Pull Request (PR) dari ke-4 programmer (Akbar, Fikri, Izzat, dan Rofad) sebelum disetujui (*approved*) dan digabungkan (*merged*) ke branch `main`.

Setiap item bertanda `[ ]` harus diverifikasi langsung pada peramban web dan console pengembang (*Developer Tools*).

---

## 2. Bagian A: Audit Kepatuhan AJAX (Zero-Reload Verification)

> **Catatan Penguji:** Buka **Developer Tools (F12) -> tab Network**. Pastikan **tidak ada request halaman dokumen baru (`Doc`)** saat melakukan interaksi di bawah ini. Indikator reload peramban tidak boleh berputar.

### A.1 Pengujian Manajemen Transaksi via AJAX
- [ ] **TC-AJAX-01: Tambah Transaksi Pemasukan Baru**
  - Langkah: Isi form transaksi dengan nominal Rp 500.000, tipe Pemasukan, tanggal hari ini, klik "Simpan".
  - Hasil yang Diharapkan:
    - [ ] Halaman **TIDAK** mengalami reload / refresh.
    - [ ] Muncul notifikasi / badge sukses.
    - [ ] Item transaksi langsung muncul di daftar riwayat.
    - [ ] Kartu "Total Pemasukan" dan "Saldo" di Summary Cards bertambah Rp 500.000 secara otomatis.
- [ ] **TC-AJAX-02: Tambah Transaksi Pengeluaran Baru**
  - Langkah: Isi form transaksi dengan nominal Rp 150.000, tipe Pengeluaran, klik "Simpan".
  - Hasil yang Diharapkan:
    - [ ] Halaman **TIDAK** reload.
    - [ ] Item transaksi pengeluaran langsung tampil di riwayat dengan indikator merah (-).
    - [ ] Kartu "Total Pengeluaran" bertambah dan "Saldo" berkurang Rp 150.000.
    - [ ] **Progress Budget Bulanan langsung bertambah** memperhitungkan pengeluaran baru ini secara instan.
- [ ] **TC-AJAX-03: Ubah Transaksi (Edit)**
  - Langkah: Klik tombol edit pada salah satu transaksi, ubah nominal atau catatan, klik "Simpan".
  - Hasil yang Diharapkan:
    - [ ] Halaman **TIDAK** reload.
    - [ ] Data pada baris transaksi ter-update seketika.
    - [ ] Nilai saldo dan progres budget menyesuaikan perubahan nominal secara asinkron.
- [ ] **TC-AJAX-04: Hapus Transaksi (Delete)**
  - Langkah: Klik tombol hapus transaksi, konfirmasi dialog penghapusan.
  - Hasil yang Diharapkan:
    - [ ] Halaman **TIDAK** reload.
    - [ ] Item transaksi langsung lenyap dari daftar riwayat.
    - [ ] Ringkasan saldo dan progres pengeluaran budget berkurang seketika.

### A.2 Pengujian Filter Transaksi via AJAX
- [ ] **TC-AJAX-05: Filter Berdasarkan Jenis (Semua / Pemasukan / Pengeluaran)**
  - Langkah: Klik tab filter "Pemasukan", lalu "Pengeluaran", lalu "Semua".
  - Hasil yang Diharapkan:
    - [ ] Halaman **TIDAK** reload saat tab diklik.
    - [ ] Daftar transaksi tersaring seketika hanya menampilkan jenis yang dipilih.
    - [ ] URL atau state browser tetap stabil tanpa memicu re-render seluruh halaman.
- [ ] **TC-AJAX-06: Loading Feedback saat Filter**
  - Langkah: Amati transisi saat filter diaktifkan.
  - Hasil yang Diharapkan: Terdapat indikator loading halus (skeleton / spinner) jika request memerlukan waktu.

---

## 3. Bagian B: Pengujian Fungsional Budget Bulanan

### B.1 Pengujian Penetapan Anggaran (Set Budget)
- [ ] **TC-BDG-01: Empty State Anggaran**
  - Langkah: Buka dashboard untuk bulan yang belum memiliki budget.
  - Hasil yang Diharapkan: Widget menampilkan pesan *"Belum ada anggaran yang ditetapkan untuk bulan ini"* beserta tombol *"Tetapkan Anggaran"*.
- [ ] **TC-BDG-02: Modal Form Penetapan Anggaran**
  - Langkah: Klik tombol *"Tetapkan Anggaran"*.
  - Hasil yang Diharapkan: Modal pop-up muncul dengan pilihan bulan, tahun, dan input nominal anggaran.
- [ ] **TC-BDG-03: Validasi Input Anggaran**
  - Langkah: Coba simpan anggaran dengan nominal kosong, angka 0, atau angka negatif.
  - Hasil yang Diharapkan: Form menolak pengiriman dan menampilkan pesan kesalahan: *"Nominal anggaran harus lebih besar dari 0"*.
- [ ] **TC-BDG-04: Simpan Anggaran Berhasil (AJAX)**
  - Langkah: Masukkan nominal valid (misal: Rp 2.000.000) dan klik "Simpan Anggaran".
  - Hasil yang Diharapkan:
    - [ ] Modal tertutup otomatis.
    - [ ] Halaman **TIDAK** reload.
    - [ ] Widget Budget langsung menampilkan Target: Rp 2.000.000.
    - [ ] Sisa anggaran dan persentase dihitung secara akurat.

### B.2 Pengujian Akurasi Perhitungan & Progress Bar
- [ ] **TC-BDG-05: Perhitungan Realisasi Pengeluaran**
  - Skenario: Budget = Rp 1.000.000. Transaksi pengeluaran bulan ini ada 2: Rp 200.000 dan Rp 300.000.
  - Hasil yang Diharapkan:
    - [ ] Total Pengeluaran = Rp 500.000.
    - [ ] Sisa Anggaran = Rp 500.000.
    - [ ] Persentase Terpakai = 50%.
- [ ] **TC-BDG-06: Warna Progress Bar - Aman (< 80%)**
  - Skenario: Pengeluaran 50% dari budget.
  - Hasil yang Diharapkan: Progress bar berwarna **Hijau**.
- [ ] **TC-BDG-07: Warna Progress Bar - Waspada (80% - 100%)**
  - Skenario: Tambah pengeluaran hingga total Rp 850.000 (85%).
  - Hasil yang Diharapkan: Progress bar otomatis berubah warna menjadi **Kuning / Amber**.
- [ ] **TC-BDG-08: Warna Progress Bar - Overbudget (> 100%) & Alert**
  - Skenario: Tambah pengeluaran hingga total Rp 1.200.000 (120%).
  - Hasil yang Diharapkan:
    - [ ] Progress bar berubah warna menjadi **Merah**.
    - [ ] Muncul banner / alert peringatan: *"Pengeluaran telah melebihi anggaran bulanan!"*.
    - [ ] Sisa anggaran menampilkan status defisit (misal: `-Rp 200.000`).

### B.3 Pengujian Modifikasi & Hapus Budget
- [ ] **TC-BDG-09: Ubah Nominal Budget**
  - Langkah: Klik tombol "Ubah Anggaran", ubah dari Rp 1.000.000 menjadi Rp 1.500.000, simpan.
  - Hasil yang Diharapkan: Widget langsung ter-update dengan nominal baru tanpa reload.
- [ ] **TC-BDG-10: Hapus / Reset Budget**
  - Langkah: Klik "Hapus Anggaran" dari modal, setujui konfirmasi.
  - Hasil yang Diharapkan: Budget terhapus dan widget kembali ke *Empty State*.

---

## 4. Bagian C: Pengujian Keamanan & Isolasi Pengguna (Multi-tenancy)

- [ ] **TC-SEC-01: Isolasi Transaksi Antar Akun**
  - Skenario: Buat Akun A (User A) dan Akun B (User B). Tambahkan transaksi di User A. Login ke User B.
  - Hasil yang Diharapkan: User B sama sekali tidak melihat transaksi milik User A.
- [ ] **TC-SEC-02: Isolasi Budget Bulanan Antar Akun**
  - Skenario: Tetapkan budget Rp 5.000.000 pada User A. Login ke User B pada bulan yang sama.
  - Hasil yang Diharapkan: User B melihat status budget kosong (belum ada budget), membuktikan data budget terikat ketat pada `userId` session.
- [ ] **TC-SEC-03: Proteksi Akses Server Action**
  - Skenario: Percobaan memanggil server action tanpa session login aktif.
  - Hasil yang Diharapkan: Server menolak eksekusi dan mengembalikan pesan error otentikasi.

---

## 5. Lembar Rekapitulasi Verifikasi Pull Request

| Programmer | Branch | Status Review | Tanggal Pengujian | Catatan PM |
|---|---|:---:|:---:|---|
| **Akbar** | `feat/akbar-budget-backend` | [ ] Approved | - | Menunggu migrasi & test action |
| **Fikri** | `feat/fikri-ajax-filter-transactions` | [ ] Approved | - | Menunggu uji zero-reload filter |
| **Izzat** | `feat/izzat-budget-ui` | [ ] Approved | - | Menunggu uji visual progress bar |
| **Rofad** | `feat/rofad-dashboard-ajax-integration` | [ ] Approved | - | Integrasi akhir seluruh komponen |
