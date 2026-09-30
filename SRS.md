# Software Requirements Specification

## Expense Tracker Mahasiswa — DUITku Tracker

| Informasi | Nilai |
|---|---|
| Versi | 2.0 |
| Status | Spesifikasi Kebutuhan & Integrasi Fase 2 (AJAX & Budget Bulanan) |
| Nama aplikasi | DUITku Tracker |
| Tanggal | 30 September 2026 |
| Project Manager (PM) | Muhammad Nauval Fadli |

---

## 1. Pendahuluan

### 1.1 Tujuan
Dokumen Software Requirements Specification (SRS) versi 2.0 ini menetapkan kebutuhan fungsional, nonfungsional, arsitektur teknis, dan kontrak integrasi untuk pengembangan lanjutan aplikasi web **DUITku Tracker**. Dokumen ini menjadi acuan kerja resmi bagi tim pengembang yang terdiri dari 4 orang programmer di bawah supervisi Project Manager (PM) untuk menyelesaikan evaluasi implementasi AJAX dan penambahan fitur Budget Bulanan.

### 1.2 Ruang Lingkup Proyek
Aplikasi DUITku Tracker adalah aplikasi manajemen keuangan pribadi berbasis web untuk mahasiswa. Pada Fase 2 ini, ruang lingkup mencakup:
1. **Audit & Implementasi Penuh AJAX (Asynchronous JavaScript and XML/JSON):**
   - Menghilangkan ketergantungan reload halaman penuh (*full page reload*) pada seluruh alur utama.
   - Pembaruan dinamis tanpa muat ulang pada:
     - **Dashboard:** Ringkasan keuangan (*summary cards*), saldo, dan indikator aktivitas.
     - **Manajemen Transaksi:** Penambahan, pengubahan, dan penghapusan transaksi secara asinkron dengan pembaruan data seketika (*reactive UI update*).
     - **Filter Transaksi:** Penyaringan riwayat berdasarkan jenis transaksi (Semua, Pemasukan, Pengeluaran), kategori, dan periode waktu secara instan di sisi klien/server tanpa memuat ulang browser.
2. **Fitur Baru: Budget Bulanan (Monthly Budget):**
   - Pengguna dapat menetapkan alokasi batas anggaran pengeluaran bulanan (nominal IDR) untuk periode bulan dan tahun tertentu.
   - Sistem memantau dan menghitung penggunaan anggaran secara otomatis berdasarkan akumulasi transaksi bertipe pengeluaran (*EXPENSE*) pada bulan bersangkutan.
   - Visualisasi persentase dan sisa anggaran melalui indikator progress bar dan sistem peringatan (*warning/overbudget alert*).
   - Penegakan isolasi data ketat (*multi-tenancy*): pengguna hanya dapat melihat, menetapkan, mengubah, dan menghapus anggaran miliknya sendiri.

*Catatan Ruang Lingkup Luar:* Fitur integrasi payment gateway pihak ketiga, multi-currency selain IDR, dan transfer saldo antar pengguna tetap berada di luar ruang lingkup versi ini.

### 1.3 Definisi dan Istilah
- **AJAX:** Teknik komunikasi asinkron antara antarmuka pengguna (klien) dan server di balik layar tanpa memicu muat ulang halaman web (*zero full-page reload*).
- **Pengguna:** Mahasiswa yang telah mendaftar dan memiliki akun aktif di DUITku Tracker.
- **Transaksi:** Catatan aliran kas masuk (*INCOME*) atau keluar (*EXPENSE*) milik pengguna.
- **Budget Bulanan:** Batas nominal pengeluaran yang ditetapkan pengguna untuk satu siklus bulan kalender (1–12) pada tahun tertentu.
- **Realisasi Pengeluaran (Actual Expense):** Total penjumlahan nilai transaksi pengeluaran pengguna pada bulan dan tahun anggaran terkait.
- **Overbudget:** Kondisi di mana total realisasi pengeluaran melampaui nominal budget yang telah ditetapkan.

---

## 2. Gambaran Umum Sistem

### 2.1 Arsitektur & Tumpukan Teknologi
- **Framework:** Next.js (App Router) & React
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS (DUITku Purple Fintech Design System)
- **Database:** PostgreSQL Lokal dengan Prisma ORM
- **Autentikasi & Session:** Stateful/Encrypted Session Cookie (`HttpOnly`, `SameSite=Lax`, server-side validation)

### 2.2 Struktur Tim & Peran
Pengembangan Fase 2 dipimpin oleh Project Manager dengan 4 Programmer yang bekerja secara paralel pada branch terpisah:

| Nama | Peran | Fokus Tanggung Jawab Utama |
|---|---|---|
| **Muhammad Nauval Fadli** | Project Manager (PM) | Menyusun SRS, perencanaan tugas, kontrak integrasi, QA checklist, dan supervisi merge pull request. |
| **Akbar Mukti Wibowo** | Programmer 1 — Database & Backend Core | Skema database Prisma (Model Budget), migrasi database, server service layer, enkapsulasi query transaksi filter & kalkulasi budget, penegakan otorisasi data. |
| **Muhammad Fikri** | Programmer 2 — AJAX Filter & Transaction Management | Logika AJAX filter riwayat transaksi, komponen filter/search, penanganan operasi asinkron transaksi (CRUD AJAX) tanpa reload halaman. |
| **Muhammad Izzat** | Programmer 3 — UI & Form Budget Bulanan | Komponen visual Budget Card, progress bar monitoring penggunaan anggaran, modal & form pengaturan budget (set, edit, delete), feedback & validasi form. |
| **Muhammad Rofad Hamdani** | Programmer 4 — Dashboard Integration & AJAX Orchestration | Integrasi halaman dashboard utama, orkestrasi pembaruan state reaktif antar komponen (Summary, Budget, Filter, History) secara asinkron tanpa reload. |

---

## 3. Kebutuhan Antarmuka Pengguna & Sistem

### 3.1 Antarmuka Pengguna (UI)
1. **Dashboard Reaktif:** Tampilan satu pintu yang mengonsolidasikan Ringkasan Keuangan (Saldo, Pemasukan, Pengeluaran), Widget Monitoring Budget Bulanan, Kontrol Tambah Transaksi, Filter Transaksi, dan Riwayat Transaksi.
2. **Widget Budget Bulanan:** Kartu visual yang menampilkan nominal target budget, pengeluaran aktual, sisa budget, dan progress bar dengan perubahan warna dinamis:
   - Hijau (< 80%): Pengeluaran aman.
   - Kuning/Amber (80% - 100%): Mendekati batas anggaran.
   - Merah (> 100%): Melebihi anggaran (Overbudget) dengan badge peringatan.
3. **Panel Kontrol Filter:** Kontrol dropdown/tombol seleksi jenis transaksi, kategori, dan periode waktu yang merespons seketika.
4. **Modal/Form Anggaran & Transaksi:** Antarmuka input data dengan validasi interaktif, feedback status sukses/gagal, dan indikator loading (*spinner*).

### 3.2 Antarmuka Sistem & Batasan Komunikasi
- Seluruh komunikasi data antara antarmuka klien dan server wajib dilakukan secara asinkron menggunakan Next.js Server Actions / Client API tanpa `window.location.reload()`.
- Pengambilan identitas pengguna mutlak diverifikasi dari session server aktif; input `userId` dari browser tidak pernah dipercaya sebagai parameter otorisasi.

---

## 4. Kebutuhan Fungsional (Functional Requirements)

Semua kebutuhan berikut berstatus **Wajib (Mandatory)**.

### 4.1 Modul Database & Backend Core — Akbar Mukti Wibowo (Branch: `feat/akbar-budget-backend`)

- **SRS-FR-025:** Sistem harus menyediakan model tabel `Budget` pada skema Prisma dengan atribut: `id` (String CUID/UUID), `userId` (FK ke User), `month` (Integer 1-12), `year` (Integer), `amount` (Decimal), `createdAt`, dan `updatedAt`.
- **SRS-FR-026:** Sistem harus menerapkan *unique constraint* kombinasi `[userId, month, year]` pada tabel `Budget` sehingga seorang pengguna hanya dapat memiliki tepat satu entri budget per bulan dan tahun.
- **SRS-FR-027:** Sistem harus menyediakan fungsi backend / Server Action untuk membuat atau memperbarui (*upsert*) budget bulanan pengguna yang sedang login.
- **SRS-FR-028:** Sistem harus menyediakan fungsi backend / Server Action untuk menghapus budget bulanan milik pengguna yang sedang login berdasarkan verifikasi kepemilikan.
- **SRS-FR-029:** Sistem harus menyediakan fungsi kalkulasi progres budget bulanan (`getMonthlyBudgetProgress`) yang mengembalikan: target budget, total pengeluaran aktual bulan tersebut (dihitung dari akumulasi transaksi `EXPENSE` milik pengguna pada rentang tanggal bulan & tahun terkait), sisa anggaran, dan persentase penggunaan.
- **SRS-FR-030:** Sistem harus menyediakan fungsi backend filter transaksi (`getFilteredTransactions`) yang mendukung parameter opsional jenis (`INCOME` / `EXPENSE` / `ALL`), kategori, bulan, tahun, serta memastikan hanya mengembalikan transaksi milik pengguna yang terautentikasi.
- **SRS-FR-031:** Setiap operasi query database untuk transaksi dan budget wajib menyaring data berdasarkan `userId` yang diperoleh dari session server, mencegah manipulasi ID akun lain (*IDOR prevention*).

### 4.2 Modul AJAX Filter & Manajemen Transaksi — Muhammad Fikri (Branch: `feat/fikri-ajax-filter-transactions`)

- **SRS-FR-032:** Sistem harus menyediakan komponen antarmuka Filter Transaksi yang memungkinkan pengguna memilih filter berdasarkan jenis transaksi (Semua / Pemasukan / Pengeluaran), kategori, serta periode bulan/tahun.
- **SRS-FR-033:** Sistem harus mengeksekusi penyaringan riwayat transaksi secara asinkron (AJAX) tanpa memuat ulang halaman (*zero page reload*).
- **SRS-FR-034:** Sistem harus mengimplementasikan alur AJAX penuh pada operasi tambah transaksi: setelah form dikirimkan, data transaksi baru langsung ditambahkan ke daftar riwayat dan ringkasan keuangan diperbarui tanpa me-reload browser.
- **SRS-FR-035:** Sistem harus mengimplementasikan alur AJAX penuh pada operasi ubah transaksi: pembaruan data langsung terefleksi pada item riwayat secara asinkron.
- **SRS-FR-036:** Sistem harus mengimplementasikan alur AJAX penuh pada operasi hapus transaksi: konfirmasi penghapusan dieksekusi secara asinkron dan item segera terhapus dari tampilan tanpa refresh halaman.
- **SRS-FR-037:** Sistem harus menampilkan indikator pemuatan (*loading indicator/skeleton*) saat proses filter atau operasi CRUD transaksi sedang berlangsung di latar belakang.

### 4.3 Modul UI & Form Budget Bulanan — Muhammad Izzat (Branch: `feat/izzat-budget-ui`)

- **SRS-FR-038:** Sistem harus menyediakan komponen antarmuka `BudgetCard` yang menampilkan status anggaran bulan berjalan: target anggaran, total pengeluaran aktual, sisa anggaran (atau nominal defisit), dan persentase penggunaan.
- **SRS-FR-039:** Komponen `BudgetCard` harus memiliki visual progress bar dengan perubahan warna adaptif (Hijau jika <80%, Kuning jika 80%–100%, Merah jika >100%).
- **SRS-FR-040:** Jika pengguna belum menetapkan budget pada bulan tersebut, komponen harus menampilkan kondisi kosong (*empty state*) dengan ajakan aksi (*CTA*) untuk menetapkan anggaran.
- **SRS-FR-041:** Jika pengeluaran telah melebihi target anggaran (>100%), antarmuka harus memunculkan peringatan visual (*Overbudget Alert*).
- **SRS-FR-042:** Sistem harus menyediakan form/modal pengaturan budget yang memungkinkan pengguna memasukkan nominal anggaran, memilih bulan (1-12) dan tahun, serta tombol konfirmasi simpan.
- **SRS-FR-043:** Form budget harus memvalidasi bahwa nominal anggaran bernilai positif (> 0) dan menampilkan pesan kesalahan jika input tidak valid.
- **SRS-FR-044:** Form budget harus menyediakan opsi untuk menghapus/mereset anggaran bulanan dengan dialog konfirmasi.

### 4.4 Modul Integrasi Dashboard & Orkestrasi AJAX — Muhammad Rofad Hamdani (Branch: `feat/rofad-dashboard-ajax-integration`)

- **SRS-FR-045:** Halaman utama dashboard (`/dashboard`) harus bertransformasi menjadi dashboard dinamis yang bebas dari data statis/mock.
- **SRS-FR-046:** Dashboard harus mengintegrasikan kartu ringkasan keuangan, widget budget bulanan, kontrol filter transaksi, dan daftar riwayat transaksi dalam satu tata letak yang harmonis.
- **SRS-FR-047:** Dashboard harus mengorkestrasi pembaruan data antar modul secara reaktif: ketika terjadi penambahan/perubahan/penghapusan transaksi, nilai ringkasan saldo dan progres pengeluaran budget bulanan harus diperbarui seketika secara AJAX tanpa me-reload halaman.
- **SRS-FR-048:** Dashboard harus menyediakan pemilih periode bulan/tahun aktif di bagian atas yang menyelaraskan data budget dan filter transaksi bulan tersebut secara serentak.
- **SRS-FR-049:** Dashboard harus menangani seluruh kondisi tampilan (keadaan memuat/loading, keadaan kosong/empty state saat belum ada data, dan penanganan kesalahan komunikasi data).
- **SRS-FR-050:** Antarmuka dashboard hasil integrasi harus responsif dan adaptif baik pada layar ponsel maupun desktop, serta mendukung tema terang dan gelap.

---

## 5. Kebutuhan Nonfungsional (Non-Functional Requirements)

- **SRS-NFR-008 — Kepatuhan AJAX & UX Mulus:** Seluruh interaksi pengguna di dashboard (penyaringan, tambah, ubah, hapus transaksi, serta set budget) tidak boleh memicu muat ulang penuh peramban (`F5` / `window.location.reload`).
- **SRS-NFR-009 — Keamanan & Isolasi Data (Multi-tenancy):** Semua query database dan eksekusi server wajib memverifikasi `userId` dari session server. Pengguna dilarang keras dapat melihat atau memanipulasi transaksi dan budget milik pengguna lain.
- **SRS-NFR-010 — Performa Respon Asinkron:** Operasi AJAX harus memberikan umpan balik visual (*pending state/spinner*) seketika (< 100ms) dan menyelesaikan pembaruan data dalam waktu wajar (< 1.5 detik pada koneksi normal).
- **SRS-NFR-011 — Validasi Integritas Data:** Validasi form wajib diterapkan di dua sisi (klien untuk UX cepat dan server untuk jaminan keamanan data). Nilai transaksi dan nominal budget harus berupa angka positif.
- **SRS-NFR-012 — Konsistensi Desain:** Seluruh komponen baru wajib mematuhi standar desain DUITku (warna ungu fintech, font Figtree, radius komponen konsisten, dan transisi halus).

---

## 6. Kriteria Penerimaan (Acceptance Criteria per Programmer)

### 6.1 Programmer 1 — Akbar Mukti Wibowo
- [ ] Model `Budget` dan migrasi database PostgreSQL sukses dijalankan tanpa error.
- [ ] Constraint unik `[userId, month, year]` mencegah duplikasi budget pada periode yang sama.
- [ ] Fungsi `setMonthlyBudget`, `getMonthlyBudget`, `deleteMonthlyBudget`, dan `getMonthlyBudgetProgress` berfungsi benar dan teruji.
- [ ] Fungsi `getFilteredTransactions` berhasil menyaring transaksi berdasarkan tipe, kategori, dan tanggal/bulan.
- [ ] Percobaan manipulasi query lintas user ditolak (data tetap terisolasi per akun).

### 6.2 Programmer 2 — Muhammad Fikri
- [ ] Komponen filter transaksi tampil di atas daftar riwayat transaksi.
- [ ] Memilih jenis transaksi (Semua / Pemasukan / Pengeluaran) memfilter riwayat secara instan tanpa reload browser.
- [ ] Operasi tambah transaksi memperbarui daftar transaksi secara AJAX tanpa reload halaman.
- [ ] Operasi ubah transaksi memperbarui item transaksi secara AJAX tanpa reload halaman.
- [ ] Operasi hapus transaksi menghilangkan item seketika secara AJAX tanpa reload halaman.
- [ ] Loading indicator / skeleton muncul saat data transaksi sedang diproses.

### 6.3 Programmer 3 — Muhammad Izzat
- [ ] Komponen `BudgetCard` berhasil menampilkan target budget, pengeluaran aktual, dan sisa budget.
- [ ] Progress bar berubah warna secara akurat sesuai persentase penggunaan (<80% hijau, 80-100% kuning, >100% merah).
- [ ] Alert "Overbudget" muncul saat pengeluaran melebihi anggaran yang ditetapkan.
- [ ] Modal/form budget memungkinkan input nominal, bulan, tahun, dengan validasi angka positif.
- [ ] Form budget mendukung operasi simpan, ubah, dan hapus anggaran dengan feedback status yang jelas.

### 6.4 Programmer 4 — Muhammad Rofad Hamdani
- [ ] Halaman `/dashboard` terbebas 100% dari data dummy/mock statis.
- [ ] Komponen Budget (dari Izzat), Filter & Transaksi AJAX (dari Fikri), dan Summary Cards terpasang rapi di dashboard.
- [ ] Menambah/menghapus transaksi pengeluaran langsung mengupdate Summary Cards DAN progress Budget Bulanan secara reaktif tanpa reload halaman.
- [ ] Mengganti periode bulan/tahun aktif memperbarui tampilan ringkasan, budget, dan riwayat transaksi secara terpadu.
- [ ] Desain tampilan responsif (mobile & desktop) serta konsisten dengan toggle tema.

---

## 7. Batasan File Kerja & Matriks RACI

Untuk mencegah konflik merge git (*merge conflict*), setiap programmer memiliki batas direktori dan file kerja yang ditentukan:

| Programmer | Branch Git | Direktori / File yang Dimiliki & Diubah |
|---|---|---|
| **Akbar Mukti Wibowo** | `feat/akbar-budget-backend` | `prisma/schema.prisma`<br>`prisma/migrations/**`<br>`src/lib/budget/**`<br>`src/lib/transactions/index.ts`<br>`src/types/budget.ts`, `src/types/index.ts` |
| **Muhammad Fikri** | `feat/fikri-ajax-filter-transactions` | `src/components/transactions/TransactionFilter.tsx`<br>`src/components/transactions/useTransactionAjax.ts`<br>`src/components/transactions/TransactionHistoryList.tsx`<br>`src/lib/transactions/actions.ts` (penambahan action filter) |
| **Muhammad Izzat** | `feat/izzat-budget-ui` | `src/components/budget/BudgetCard.tsx`<br>`src/components/budget/BudgetProgress.tsx`<br>`src/components/budget/BudgetForm.tsx`<br>`src/components/budget/BudgetModal.tsx`<br>`src/components/budget/types.ts`<br>`src/components/budget/adapters.ts` |
| **Muhammad Rofad Hamdani** | `feat/rofad-dashboard-ajax-integration` | `src/app/(dashboard)/dashboard/page.tsx`<br>`src/app/(dashboard)/dashboard/DashboardClient.tsx`<br>`src/components/dashboard/**` |

### Matriks RACI Tim
* **R (Responsible):** Programmer yang mengerjakan kode modul.
* **A (Accountable):** Project Manager (Muhammad Nauval Fadli) yang menyetujui hasil dan melakukan merge ke `main`.
* **C (Consulted):** Rekan programmer yang berkepentingan dengan kontrak integrasi antarmuka.
* **I (Informed):** Seluruh anggota tim.

| Aktivitas | Akbar | Fikri | Izzat | Rofad | Nauval (PM) |
|---|:---:|:---:|:---:|:---:|:---:|
| Skema Prisma & Backend Service Budget | **R** | I | C | C | **A** |
| Service Query Filter Transaksi | **R** | C | I | C | **A** |
| Komponen UI & Modal Budget | I | I | **R** | C | **A** |
| Komponen Filter & AJAX Handler Transaksi | I | **R** | I | C | **A** |
| Integrasi Dashboard & Orkestrasi Asinkron | C | C | C | **R** | **A** |
| Code Review, QA Verification & PR Merge | I | I | I | I | **A / R** |
