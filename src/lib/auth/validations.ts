import { z } from "zod";

/**
 * Skema validasi bersama yang dipakai di DUA sisi:
 *  - Front end: dipakai ulang langsung di komponen form (Zod di browser).
 *  - Back end : dipakai ulang di Server Action (Zod di server/actions).
 */
const passwordSchema = z
  .string()
  .min(8, { error: "Kata sandi minimal 8 karakter." })
  .max(72, { error: "Kata sandi maksimal 72 karakter." })
  .regex(/[a-zA-Z]/, { error: "Kata sandi harus mengandung huruf." })
  .regex(/[0-9]/, { error: "Kata sandi harus mengandung angka." })
  .regex(/[^a-zA-Z0-9]/, {
    error: "Kata sandi harus mengandung karakter khusus.",
  });

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Nama minimal 2 karakter." }),
    email: z.email({ error: "Masukkan alamat email yang valid." }).trim(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { error: "Ulangi kata sandi." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Kata sandi dan ulangan kata sandi tidak cocok.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email({ error: "Masukkan alamat email yang valid." }).trim(),
  password: z.string().min(1, { error: "Masukkan kata sandi." }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;