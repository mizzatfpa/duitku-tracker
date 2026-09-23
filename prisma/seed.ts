import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database DUITku Tracker...');

  // 1. Bersihkan data lama jika ada (agar seed bersifat idempotent)
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Data lama berhasil dibersihkan.');

  // 2. Buat Pengguna Utama (Demo User)
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@duitku.com',
      name: 'Demo User',
      password: 'password123', // Dummy password untuk dev environment
    },
  });

  // 3. Buat Pengguna Kedua
  const budiUser = await prisma.user.create({
    data: {
      email: 'budi@duitku.com',
      name: 'Budi Santoso',
      password: 'password123',
    },
  });

  console.log(`👤 Pengguna berhasil dibuat: ${demoUser.email}, ${budiUser.email}`);

  // 4. Data Dummy Transaksi untuk Demo User
  const demoTransactions = [
    {
      userId: demoUser.id,
      type: TransactionType.INCOME,
      amount: 6000000,
      category: 'Gaji',
      description: 'Gaji Bulanan September',
      date: new Date('2026-09-01T09:00:00Z'),
    },
    {
      userId: demoUser.id,
      type: TransactionType.INCOME,
      amount: 1500000,
      category: 'Freelance',
      description: 'Project Desain Website',
      date: new Date('2026-09-05T14:30:00Z'),
    },
    {
      userId: demoUser.id,
      type: TransactionType.EXPENSE,
      amount: 450000,
      category: 'Tagihan',
      description: 'Tagihan Listrik & WiFi',
      date: new Date('2026-09-06T10:00:00Z'),
    },
    {
      userId: demoUser.id,
      type: TransactionType.EXPENSE,
      amount: 350000,
      category: 'Belanja',
      description: 'Belanja Kebutuhan Dapur',
      date: new Date('2026-09-10T16:00:00Z'),
    },
    {
      userId: demoUser.id,
      type: TransactionType.EXPENSE,
      amount: 50000,
      category: 'Transportasi',
      description: 'Isi Bensin Pertamax',
      date: new Date('2026-09-12T08:15:00Z'),
    },
    {
      userId: demoUser.id,
      type: TransactionType.EXPENSE,
      amount: 75000,
      category: 'Makanan',
      description: 'Makan Malam di Kafe',
      date: new Date('2026-09-15T19:30:00Z'),
    },
    {
      userId: demoUser.id,
      type: TransactionType.EXPENSE,
      amount: 120000,
      category: 'Hiburan',
      description: 'Tiket Bioskop & Snack',
      date: new Date('2026-09-18T20:00:00Z'),
    },
  ];

  // 5. Data Dummy Transaksi untuk Budi Santoso
  const budiTransactions = [
    {
      userId: budiUser.id,
      type: TransactionType.INCOME,
      amount: 4500000,
      category: 'Gaji',
      description: 'Gaji Pokok',
      date: new Date('2026-09-02T10:00:00Z'),
    },
    {
      userId: budiUser.id,
      type: TransactionType.EXPENSE,
      amount: 85000,
      category: 'Makanan',
      description: 'Makan Siang Tim',
      date: new Date('2026-09-04T12:30:00Z'),
    },
  ];

  // Masukkan semua transaksi ke database
  await prisma.transaction.createMany({
    data: [...demoTransactions, ...budiTransactions],
  });

  console.log(`💳 Berhasil memasukkan ${demoTransactions.length + budiTransactions.length} data transaksi.`);
  console.log('✅ Seeding database selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
