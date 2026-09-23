"use server";

import { redirect } from "next/navigation";
import { signupSchema } from "@/lib/auth/validations";
import { hashPassword } from "@/lib/auth/password";
import {
  createAccount,
  findAccountByEmail,
  AccountAlreadyExistsError,
} from "@/lib/auth/account-store";
import { createSession } from "@/lib/auth/session";
import type { AuthFormState } from "@/lib/auth/types";

/**
 * Server Action daftar akun. Validasi backend memakai skema yang sama
 * dengan validasi front end (lihat src/lib/auth/validations.ts).
 */
export async function signup(
  state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const result = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { name, email, password } = result.data;

  const existing = await findAccountByEmail(email);
  if (existing) {
    return { errors: { email: ["Email sudah terdaftar."] } };
  }

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await createAccount({ name, email, passwordHash });
  } catch (error) {
    if (error instanceof AccountAlreadyExistsError) {
      return { errors: { email: ["Email sudah terdaftar."] } };
    }
    console.error("Gagal membuat akun:", error);
    return { message: "Terjadi kesalahan saat membuat akun. Coba lagi." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}