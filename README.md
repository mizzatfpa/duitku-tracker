# DUITku Tracker — Expense Tracker Mahasiswa

Aplikasi web manajemen keuangan pribadi yang dirancang khusus untuk mahasiswa agar dapat mencatat pemasukan dan pengeluaran, memantau saldo harian, menetapkan anggaran bulanan (*monthly budget*), serta menganalisis kebiasaan finansial dengan antarmuka modern yang cepat dan tanpa muat ulang (*full AJAX / zero page reload*).

---

## 👥 Struktur Tim Pengembang

Proyek ini dikembangkan oleh tim yang dipimpin oleh **Project Manager (PM)** dengan 4 programmer spesialis:

| Nama | Peran | Tanggung Jawab Utama | Branch Git |
|---|---|---|---|
| **Muhammad Nauval Fadli** | **Project Manager (PM)** | Perencanaan arsitektur, penyusunan SRS & kontrak integrasi, QA testing, dan koordinasi merge PR. | `main` |
| **Akbar Mukti Wibowo** | **Programmer 1 — Database & Backend** | Skema Prisma (Model Budget), migrasi PostgreSQL, data service, query filter, penegakan otorisasi. | `feat/akbar-budget-backend` |
| **Muhammad Fikri** | **Programmer 2 — AJAX & Filter** | Logika AJAX filter transaksi, komponen filter/search riwayat, penanganan asinkron CRUD transaksi tanpa reload. | `feat/fikri-ajax-filter-transactions` |
| **Muhammad Izzat** | **Programmer 3 — Budget UI** | Komponen Budget Card, visual progress bar adaptif, modal & form pengaturan budget (set, edit, delete). | `feat/izzat-budget-ui` |
| **Muhammad Rofad Hamdani** | **Programmer 4 — Dashboard Integration** | Halaman dashboard dinamis, orkestrasi pembaruan state reaktif antar modul secara AJAX tanpa data mock. | `feat/rofad-dashboard-ajax-integration` |

---

## 📚 Dokumen Proyek & Panduan Pengembang

Seluruh panduan teknis telah disiapkan secara lengkap untuk memastikan pengembangan berjalan secara paralel tanpa konflik kode:

- **[Spesifikasi Kebutuhan Sistem (SRS v2.0)](./SRS.md):** Dokumen spesifikasi kebutuhan fungsional & nonfungsional resmi.
- **[Pembagian Tugas Tim (Task Breakdown)](./docs/TASK_BREAKDOWN.md):** Detail to-do list, batasan file kerja, dan panduan branch per programmer.
- **[Spesifikasi Teknis & Kontrak Integrasi](./docs/INTEGRATION_CONTRACT.md):** Kontrak skema Prisma, tipe TypeScript, Server Actions, props UI, dan arsitektur AJAX.
- **[Lembar Verifikasi Kualitas (QA Checklist)](./docs/QA_CHECKLIST.md):** Skenario pengujian kepatuhan AJAX, fitur budget, dan keamanan isolasi akun.
- **[Sistem Desain UI (Design System)](./design.md):** Pedoman token warna ungu fintech, tipografi Figtree, dan komponen.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions) & [React 19](https://react.dev/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM:** PostgreSQL Lokal & [Prisma ORM](https://www.prisma.io/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Autentikasi:** Session Cookie terenkripsi berbasis JWT (`jose` & `bcryptjs`)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Memulai Pengembangan Lokal (Getting Started)

### 1. Prasyarat Sistem
- Node.js versi 20 atau lebih baru
- PostgreSQL aktif pada komputer lokal

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env` dan sesuaikan URL koneksi PostgreSQL Anda:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/duitku_db?schema=public"
SESSION_SECRET="ganti_dengan_kunci_rahasia_acak_minimal_32_karakter"
```

### 4. Migrasi & Seed Database
```bash
# Menjalankan migrasi database
npx prisma migrate dev

# Generate Prisma Client
npm run prisma:generate

# (Opsional) Mengisi data awal
npx prisma db seed
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada [http://localhost:3000](http://localhost:3000).

---

## 🌿 Panduan Branching & Kontribusi untuk Programmer

1. Pastikan branch `main` Anda paling mutakhir:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Buat branch fitur sesuai nama yang telah ditentukan:
   ```bash
   # Contoh untuk Akbar:
   git checkout -b feat/akbar-budget-backend

   # Contoh untuk Fikri:
   git checkout -b feat/fikri-ajax-filter-transactions

   # Contoh untuk Izzat:
   git checkout -b feat/izzat-budget-ui

   # Contoh untuk Rofad:
   git checkout -b feat/rofad-dashboard-ajax-integration
   ```
3. Kerjakan tugas sesuai file yang dialokasikan pada [docs/TASK_BREAKDOWN.md](./docs/TASK_BREAKDOWN.md). Dilarang mengubah file milik programmer lain tanpa koordinasi.
4. Lakukan pengujian lokal dan pastikan build lolos:
   ```bash
   npm run build
   npm run lint
   ```
5. Buka Pull Request (PR) ke `main` dengan deskripsi jelas mengenai fitur yang telah dibuat.
