import prisma from '../db/prisma';
import { Prisma } from '@prisma/client';

/**
 * Mencari pengguna berdasarkan alamat email.
 * Berguna untuk validasi saat login (Orang 1).
 */
export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Mengambil data pengguna berdasarkan ID (tanpa mengembalikan password).
 * Berguna untuk memuat profil pengguna yang sedang login berdasarkan session (Orang 1).
 */
export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      // Password secara eksplisit tidak di-select demi keamanan
    },
  });
}

/**
 * Membuat akun pengguna baru.
 * Menerima email dan password yang SUDAH DI-HASH oleh Orang 1.
 */
export async function createUser(data: { email: string; passwordHash: string; name?: string }) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.passwordHash,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    return { success: true, user };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 adalah kode error Prisma untuk pelanggaran unique constraint (email sudah terdaftar)
      if (error.code === 'P2002') {
        return { success: false, error: 'Email sudah terdaftar.' };
      }
    }
    return { success: false, error: 'Terjadi kesalahan saat membuat akun.' };
  }
}
