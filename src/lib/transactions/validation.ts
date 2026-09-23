import { CreateTransactionInput, UpdateTransactionInput } from '../../types';

/**
 * Validasi input untuk penambahan transaksi baru.
 * Sesuai dengan SRS-FR-008 dan SRS-FR-013.
 */
export function validateCreateTransaction(input: CreateTransactionInput) {
  const errors: string[] = [];

  // Validasi Jenis Transaksi (SRS-FR-013)
  if (input.type !== 'INCOME' && input.type !== 'EXPENSE') {
    errors.push('Jenis transaksi tidak dikenal. Harus INCOME atau EXPENSE.');
  }

  // Validasi Nominal (SRS-FR-008 & SRS-FR-013)
  if (typeof input.amount !== 'number' || input.amount <= 0) {
    errors.push('Jumlah transaksi tidak valid. Harus berupa angka lebih besar dari 0.');
  }

  // Validasi Kategori
  if (!input.category || typeof input.category !== 'string' || input.category.trim() === '') {
    errors.push('Kategori transaksi wajib diisi.');
  }

  // Validasi Tanggal (jika diberikan)
  if (input.date) {
    const parsedDate = new Date(input.date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Format tanggal tidak valid.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validasi input untuk perubahan transaksi yang sudah ada.
 * Field bersifat opsional (kecuali id), tetapi jika ada, harus valid.
 */
export function validateUpdateTransaction(input: UpdateTransactionInput) {
  const errors: string[] = [];

  if (!input.id || typeof input.id !== 'string') {
    errors.push('ID transaksi diperlukan untuk diubah.');
  }

  // Validasi Jenis Transaksi jika diubah
  if (input.type !== undefined && input.type !== 'INCOME' && input.type !== 'EXPENSE') {
    errors.push('Jenis transaksi tidak dikenal. Harus INCOME atau EXPENSE.');
  }

  // Validasi Nominal jika diubah
  if (input.amount !== undefined && (typeof input.amount !== 'number' || input.amount <= 0)) {
    errors.push('Jumlah transaksi tidak valid. Harus berupa angka lebih besar dari 0.');
  }

  // Validasi Kategori jika diubah
  if (input.category !== undefined && (typeof input.category !== 'string' || input.category.trim() === '')) {
    errors.push('Kategori transaksi tidak boleh kosong.');
  }

  // Validasi Tanggal jika diubah
  if (input.date) {
    const parsedDate = new Date(input.date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Format tanggal tidak valid.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
