import { z } from 'zod';

export const setBudgetSchema = z.object({
  month: z.coerce
    .number()
    .int('Bulan harus berupa bilangan bulat')
    .min(1, 'Bulan minimal bernilai 1 (Januari)')
    .max(12, 'Bulan maksimal bernilai 12 (Desember)'),
    
  year: z.coerce
    .number()
    .int('Tahun harus berupa bilangan bulat')
    .min(2000, 'Tahun tidak valid'),
    
  amount: z.coerce
    .number()
    .positive('Nominal anggaran harus lebih dari 0')
});

export type SetBudgetInputSchema = z.infer<typeof setBudgetSchema>;
