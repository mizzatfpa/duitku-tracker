# Software Requirements Specification

## Expense Tracker Mahasiswa

| Informasi | Nilai |
|---|---|
| Versi | 1.1 |
| Status | Draf kebutuhan |
| Nama aplikasi | Duitku Tracker |
| Tanggal | 23 September 2026 |

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen ini menetapkan kebutuhan fungsional dan nonfungsional untuk aplikasi web Expense Tracker yang membantu mahasiswa mengelola pemasukan dan pengeluaran pribadi. Dokumen ini menjadi acuan implementasi dan pemeriksaan hasil kerja tim.

### 1.2 Ruang Lingkup

Aplikasi memungkinkan pengguna membuat akun, masuk dan keluar, mencatat transaksi pemasukan maupun pengeluaran, melihat riwayat transaksi, serta memantau saldo dan ringkasan keuangan. Setiap transaksi harus dimiliki oleh satu pengguna dan hanya dapat diakses oleh pemiliknya. Status login dipertahankan selama session masih berlaku, dan aplikasi menyimpan setidaknya satu preferensi pengguna menggunakan cookies.

Fitur anggaran, rekening bank, transfer antar pengguna, dan integrasi layanan pembayaran tidak termasuk dalam ruang lingkup versi ini.

### 1.3 Istilah

- **Pengguna:** mahasiswa yang memiliki akun aplikasi.
- **Transaksi:** catatan pemasukan atau pengeluaran milik pengguna.
- **Session:** status autentikasi pengguna yang berlaku selama masa session.
- **Preferensi:** pengaturan tampilan pengguna yang disimpan dalam cookie; preferensi awal yang ditetapkan dokumen ini adalah tema terang/gelap.

## 2. Gambaran Umum

### 2.1 Perspektif Produk

Aplikasi merupakan aplikasi web. Repositori menggunakan Next.js, TypeScript, Tailwind CSS, dan App Router sebagai dasar proyek. Data akun dan transaksi disimpan secara persisten pada PostgreSQL lokal. Mekanisme autentikasi dan session disediakan oleh implementasi aplikasi.

### 2.2 Kelas Pengguna

- **Pengunjung:** belum masuk; hanya dapat membuka halaman daftar akun dan masuk.
- **Pengguna terautentikasi:** dapat mengelola transaksi dan melihat ringkasan keuangan miliknya sendiri.

### 2.3 Lingkungan Operasi

Aplikasi diakses melalui peramban web modern pada komputer maupun perangkat seluler. Antarmuka utama menggunakan Bahasa Indonesia.

### 2.4 Batasan dan Asumsi

- Setiap akun memiliki alamat email unik.
- Setiap transaksi memiliki tepat satu pemilik.
- Nilai transaksi harus lebih besar dari nol.
- Transaksi memiliki jenis pemasukan atau pengeluaran.
- Preferensi cookie versi awal adalah tema terang atau gelap.
- Jumlah keuangan ditampilkan dalam Rupiah (IDR).
- Instance PostgreSQL untuk versi tugas ini berjalan secara lokal dan diakses aplikasi melalui konfigurasi lingkungan.

## 3. Kebutuhan Antarmuka

### 3.1 Antarmuka Pengguna

Aplikasi menyediakan halaman daftar akun, masuk, dan dashboard. Dashboard menampilkan ringkasan keuangan dan riwayat transaksi, serta menyediakan alur untuk menambah, mengubah, dan menghapus transaksi. Form harus menampilkan validasi dan umpan balik yang mudah dipahami.

### 3.2 Antarmuka Sistem

Aplikasi harus menghubungkan antarmuka dengan layanan autentikasi dan penyimpanan transaksi. Database yang digunakan adalah PostgreSQL lokal. Kontrak antarmodul yang wajib dipenuhi dijelaskan pada Bagian 8.

## 4. Kebutuhan Fungsional

Semua kebutuhan berikut berprioritas **Wajib**.

### 4.1 Akun dan Autentikasi — Orang 1

Penanggung jawab: **Muhammad Fikri (24060124130069)**.

- **SRS-FR-001:** Sistem harus memungkinkan pengunjung membuat akun menggunakan alamat email dan kata sandi.
- **SRS-FR-002:** Sistem harus menolak pendaftaran jika alamat email telah digunakan dan menjelaskan kesalahan tanpa membuat akun duplikat.
- **SRS-FR-003:** Sistem harus memungkinkan pengguna masuk menggunakan kredensial akun yang valid dan menolak kredensial yang tidak valid.
- **SRS-FR-004:** Setelah berhasil masuk, sistem harus mempertahankan status login saat pengguna berpindah halaman atau memuat ulang halaman, selama session masih berlaku.
- **SRS-FR-005:** Sistem harus menyediakan fungsi keluar yang mengakhiri session pengguna.
- **SRS-FR-006:** Sistem harus mencegah pengunjung mengakses dashboard dan mengarahkan mereka ke halaman masuk.

### 4.2 Data dan Operasi Transaksi — Orang 2

Penanggung jawab: **Akbar Mukti Wibowo (24060124130063)**.

Tanggung jawab ini mencakup konfigurasi koneksi PostgreSQL lokal, skema/migrasi tabel, dan lapisan data/server. Tanggung jawab ini tidak mencakup halaman atau form transaksi di browser.

- **SRS-FR-007:** Sistem harus menyimpan transaksi dengan sekurang-kurangnya informasi ID transaksi, pemilik, jenis, jumlah, tanggal, kategori, dan catatan.
- **SRS-FR-008:** Sistem harus memungkinkan pengguna membuat transaksi pemasukan atau pengeluaran dengan jumlah positif dan tanggal transaksi.
- **SRS-FR-009:** Sistem harus memungkinkan pengguna melihat daftar transaksi miliknya.
- **SRS-FR-010:** Sistem harus memungkinkan pengguna mengubah transaksi miliknya.
- **SRS-FR-011:** Sistem harus memungkinkan pengguna menghapus transaksi miliknya.
- **SRS-FR-012:** Pada setiap operasi baca, ubah, dan hapus, sistem harus memeriksa kepemilikan transaksi. Pengguna tidak boleh membaca atau mengubah transaksi pengguna lain, termasuk dengan mengubah ID pada permintaan.
- **SRS-FR-013:** Sistem harus menolak transaksi dengan jenis yang tidak dikenal atau jumlah yang tidak valid.

### 4.3 Dashboard dan Riwayat — Orang 3

Penanggung jawab: **Muhammad Rofad Hamdani (24060124130117)**.

Tanggung jawab ini hanya mencakup tampilan dashboard, ringkasan, dan riwayat baca-saja. Perhitungan ringkasan menggunakan data pengguna yang diberikan oleh lapisan data. Modul ini tidak membuat atau mengubah operasi tulis transaksi.

- **SRS-FR-014:** Dashboard harus menampilkan total pemasukan dan total pengeluaran pengguna yang sedang masuk.
- **SRS-FR-015:** Dashboard harus menampilkan saldo yang dihitung sebagai total pemasukan dikurangi total pengeluaran.
- **SRS-FR-016:** Perhitungan ringkasan hanya boleh menggunakan transaksi milik pengguna yang sedang masuk.
- **SRS-FR-017:** Dashboard harus menampilkan riwayat transaksi beserta jenis, jumlah, tanggal, kategori, dan catatan jika tersedia.
- **SRS-FR-018:** Jika pengguna belum memiliki transaksi, dashboard harus menampilkan keadaan kosong yang menjelaskan bahwa transaksi belum tersedia.
- **SRS-FR-019:** Ringkasan dan riwayat harus mencerminkan hasil setelah transaksi berhasil ditambah, diubah, atau dihapus.

### 4.4 Form, Preferensi, dan Integrasi — Orang 4

Penanggung jawab: **Muhammad Nauval Fadli (24060124120027)**.

Tanggung jawab ini mencakup komponen antarmuka untuk operasi transaksi dan preferensi tema. Operasi simpan/ubah/hapus dipanggil melalui kontrak lapisan data milik Orang 2; modul ini tidak membuat skema database atau menulis langsung ke PostgreSQL. Ringkasan dan daftar riwayat tetap dimiliki Orang 3.

- **SRS-FR-020:** Antarmuka harus menyediakan form untuk menambah dan mengubah transaksi, serta aksi untuk menghapus transaksi.
- **SRS-FR-021:** Form harus memvalidasi kolom wajib dan jumlah transaksi sebelum mengirim data, serta menampilkan pesan kesalahan yang dapat dipahami.
- **SRS-FR-022:** Antarmuka harus meminta konfirmasi sebelum menghapus transaksi dan menampilkan umpan balik setelah operasi berhasil atau gagal.
- **SRS-FR-023:** Pengguna harus dapat memilih tema terang atau gelap. Pilihan tema harus disimpan menggunakan cookie dan diterapkan kembali setelah halaman dimuat ulang.
- **SRS-FR-024:** Antarmuka transaksi harus terhubung ke autentikasi, operasi transaksi, dashboard, dan riwayat sesuai kebutuhan di atas.

## 5. Kebutuhan Data dan Aturan Bisnis

### 5.1 Entitas Data

- **Pengguna:** ID pengguna, email unik, kata sandi yang tersimpan dalam bentuk hash, dan waktu pembuatan akun.
- **Transaksi:** ID transaksi, ID pemilik, jenis transaksi, jumlah dalam IDR, tanggal transaksi, kategori, catatan opsional, serta waktu pembuatan dan perubahan.
- **Preferensi:** pilihan tema yang disimpan di cookie pada peramban pengguna.
- **Session:** informasi autentikasi yang memungkinkan sistem mengenali pengguna selama session masih berlaku.

### 5.2 Aturan Bisnis

- Identitas pemilik transaksi ditetapkan berdasarkan pengguna yang sedang terautentikasi; form tidak boleh mengizinkan pengguna memilih atau mengganti pemilik.
- Total pemasukan adalah jumlah seluruh transaksi bertipe pemasukan milik pengguna.
- Total pengeluaran adalah jumlah seluruh transaksi bertipe pengeluaran milik pengguna.
- Saldo adalah total pemasukan dikurangi total pengeluaran dan boleh bernilai negatif.
- Nilai jumlah transaksi disimpan dan ditampilkan dalam Rupiah (IDR).

### 5.3 Penyimpanan PostgreSQL Lokal

- Data akun dan transaksi harus bertahan setelah aplikasi atau PostgreSQL dimulai ulang.
- Tabel pengguna harus memiliki ID unik dan email unik serta menyimpan hash kata sandi.
- Tabel transaksi harus memiliki ID unik dan kolom pemilik yang menjadi foreign key ke tabel pengguna.
- PostgreSQL menjadi sumber data utama untuk akun dan transaksi; data transaksi tidak boleh hanya disimpan di state browser atau cookie.
- Konfigurasi koneksi dan kredensial lokal disimpan di file lingkungan yang tidak di-commit. Repositori boleh menyediakan contoh variabel konfigurasi tanpa nilai rahasia.

## 6. Kebutuhan Nonfungsional

- **SRS-NFR-001 — Keamanan kata sandi:** Kata sandi tidak boleh disimpan sebagai teks biasa; sistem harus menyimpan hash kata sandi.
- **SRS-NFR-002 — Keamanan session:** Cookie session harus memiliki perlindungan yang sesuai untuk produksi, termasuk `HttpOnly`, `Secure` melalui HTTPS, dan `SameSite` yang sesuai. Session harus divalidasi pada operasi yang membutuhkan autentikasi.
- **SRS-NFR-003 — Privasi dan otorisasi:** Pemeriksaan kepemilikan data dilakukan di sisi server untuk setiap operasi transaksi; menyembunyikan data hanya di antarmuka tidak dianggap cukup.
- **SRS-NFR-004 — Preferensi cookie:** Cookie preferensi hanya menyimpan pilihan tema dan tidak boleh digunakan sebagai bukti autentikasi.
- **SRS-NFR-005 — Kemudahan penggunaan:** Halaman dan form harus dapat digunakan pada layar komputer dan ponsel, dengan label yang jelas serta pesan kesalahan yang mudah dimengerti.
- **SRS-NFR-006 — Konsistensi data:** Sistem hanya menampilkan konfirmasi keberhasilan setelah perubahan transaksi berhasil disimpan.
- **SRS-NFR-007 — Persistensi database:** Data akun dan transaksi harus disimpan di PostgreSQL lokal dan tetap tersedia setelah aplikasi dimulai ulang.

## 7. Kriteria Penerimaan per Penanggung Jawab

### Orang 1 — Muhammad Fikri

- Pengguna dapat mendaftar dengan email yang belum digunakan dan menerima penolakan untuk email duplikat.
- Pengguna dapat masuk dengan kredensial valid, tetap masuk setelah memuat ulang halaman selama session aktif, dan keluar dari aplikasi.
- Pengunjung yang membuka dashboard tanpa session diarahkan ke halaman masuk.

### Orang 2 — Akbar Mukti Wibowo

- Pengguna dapat membuat, melihat, mengubah, dan menghapus transaksi miliknya.
- Transaksi dengan jumlah nol atau negatif dan jenis yang tidak dikenal ditolak.
- Percobaan mengakses transaksi milik pengguna lain ditolak.

### Orang 3 — Muhammad Rofad Hamdani

- Dashboard menampilkan pemasukan, pengeluaran, dan saldo sesuai transaksi milik pengguna.
- Riwayat menampilkan informasi transaksi dan keadaan kosong saat belum ada transaksi.
- Ringkasan dan riwayat berubah setelah operasi transaksi berhasil.

### Orang 4 — Muhammad Nauval Fadli

- Form menambah dan mengubah transaksi terhubung dengan operasi transaksi yang tersedia.
- Penghapusan meminta konfirmasi dan menampilkan hasil operasi.
- Pilihan tema tersimpan di cookie dan tetap diterapkan setelah halaman dimuat ulang.
- Antarmuka tetap dapat digunakan pada layar komputer dan ponsel.

## 8. Pembagian Modul dan Kontrak Integrasi

Pembagian berikut menetapkan pemilik setiap lapisan agar tidak ada dua orang yang mengimplementasikan fungsi yang sama. Setiap orang mengubah modul yang menjadi tanggung jawabnya. Perubahan pada kontrak bersama harus disepakati sebelum diimplementasikan.

| Orang | Pemilik modul dan hasil kerja | Batas tanggung jawab |
|---|---|---|
| **1 — Muhammad Fikri (24060124130069)** | Halaman daftar/masuk/keluar, validasi alur autentikasi, hash kata sandi sebelum penyimpanan, pembuatan dan validasi session, serta proteksi halaman untuk pengguna yang belum masuk. | Menggunakan fungsi penyimpanan akun dari Orang 2. Tidak mengubah skema PostgreSQL atau lapisan data. Session autentikasi berbeda dari cookie tema milik Orang 4. |
| **2 — Akbar Mukti Wibowo (24060124130063)** | Konfigurasi koneksi PostgreSQL lokal, skema/migrasi tabel pengguna dan transaksi, akses data akun untuk autentikasi, serta operasi server untuk membuat, membaca, mengubah, dan menghapus transaksi. | Satu-satunya pemilik skema database dan lapisan data. Tidak membuat halaman dashboard, riwayat, atau form transaksi. Semua query transaksi harus menggunakan identitas dari session server, bukan `user_id` kiriman browser. |
| **3 — Muhammad Rofad Hamdani (24060124130117)** | Halaman/dashboard, kartu ringkasan, perhitungan saldo/pemasukan/pengeluaran, riwayat baca-saja, keadaan kosong, dan pemasangan komponen transaksi yang disediakan Orang 4 pada dashboard. | Mengonsumsi fungsi baca/transaksi dari Orang 2. Tidak menulis ke PostgreSQL dan tidak membuat logika form atau aksi tambah/ubah/hapus. Menjadi pemilik file halaman dashboard agar Orang 4 tidak mengubah file halaman yang sama. |
| **4 — Muhammad Nauval Fadli (24060124120027)** | Komponen form tambah/ubah, kontrol aksi hapus dan konfirmasi, pesan hasil operasi, serta pemilihan dan penyimpanan tema melalui cookie. Menghubungkan komponen form ke operasi tulis milik Orang 2. | Memiliki komponen transaksi dan preferensi, bukan file halaman dashboard. Tidak mengubah skema/lapisan data atau menghitung ringkasan/merender daftar riwayat. Menyerahkan komponen transaksi dengan kontrak props/callback kepada Orang 3 untuk dipasang. |

### 8.1 Kontrak Data dan Serah-Terima

- **Pemilik database:** Orang 2 menyediakan PostgreSQL lokal, skema, koneksi, dan tipe data transaksi bersama. Skema minimal mencakup `users` dan `transactions`; kolom transaksi mencakup ID, `user_id`, jenis, jumlah, tanggal, kategori opsional, dan catatan opsional.
- **Serah-terima autentikasi:** Orang 2 menyediakan operasi penyimpanan akun yang menerima email dan hash kata sandi. Orang 1 bertanggung jawab atas alur daftar/masuk, pembuatan hash, session, dan identitas pengguna terautentikasi.
- **Serah-terima baca:** Orang 2 menyediakan operasi untuk mengambil transaksi milik pengguna yang sedang masuk. Orang 3 menggunakan hasil tersebut untuk riwayat dan ringkasan, tanpa menambahkan query atau tabel baru.
- **Serah-terima tulis:** Orang 2 menyediakan operasi tambah/ubah/hapus yang memvalidasi pemilik dari session. Orang 4 mengirim data form tanpa menetapkan `user_id` dan menampilkan hasil operasi tersebut.
- **Penegakan akses:** Semua operasi baca/tulis transaksi memperoleh identitas pengguna dari session terverifikasi. `user_id` tidak diterima sebagai sumber otorisasi dari input klien.
- **Kepemilikan cookie:** Cookie session dikelola Orang 1. Cookie preferensi tema dikelola Orang 4. Keduanya memiliki tujuan dan nama yang berbeda.
- **Kontrak antarmuka:** Sebelum implementasi paralel, tim menyepakati nama operasi, bentuk input/output, dan format kesalahan untuk autentikasi serta transaksi. Jika implementasi menggunakan API, Server Actions, atau layanan lain, pilihan itu tidak mengubah batas tanggung jawab di atas.

### 8.2 Batas File Kerja yang Disarankan

Untuk mengurangi konflik saat bekerja bersamaan, tim dapat menggunakan pembagian direktori berikut. Setiap direktori memiliki satu pemilik; perubahan kontrak lintas direktori dibahas terlebih dahulu.

| Pemilik | Direktori atau file yang dikerjakan |
|---|---|
| Orang 1 | `src/app/(auth)/**`, `src/lib/auth/**`, dan halaman awal `src/app/page.tsx` bila digunakan untuk alur masuk/daftar. |
| Orang 2 | `src/lib/db/**`, `src/lib/users/**`, `src/lib/transactions/**`, dan tipe data bersama di `src/types/**`. |
| Orang 3 | `src/app/(dashboard)/**` dan `src/components/dashboard/**`. Orang 3 memasang komponen Orang 4 di halaman dashboard. |
| Orang 4 | `src/components/transactions/**`, `src/components/preferences/**`, `src/lib/preferences/**`, serta konfigurasi tema global `src/app/layout.tsx` dan `src/app/globals.css`. |

Jika struktur proyek berubah, tim mempertahankan prinsip pemilik tunggal per modul dan tidak mengerjakan file yang sama secara paralel. Integrasi dilakukan setelah pemilik modul menyepakati kontrak; perubahan pada file bersama dikerjakan bergantian.

## 9. Hal yang Belum Ditentukan

Pilihan pustaka/ORM PostgreSQL, masa berlaku session, kategori bawaan, serta mekanisme teknis API atau Server Actions merupakan keputusan desain teknis tim. Keputusan tersebut harus tetap memenuhi seluruh kebutuhan keamanan, kepemilikan data, dan perilaku aplikasi dalam dokumen ini.
