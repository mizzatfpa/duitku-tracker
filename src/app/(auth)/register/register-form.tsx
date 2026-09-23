"use client";

import { useActionState, useState } from "react";
import { signup } from "@/lib/auth/actions";
import { signupSchema } from "@/lib/auth/validations";
import type { AuthFormState } from "@/lib/auth/types";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <ul className="mt-1 space-y-0.5 text-xs text-red-600 dark:text-red-400">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  errors?: string[];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
      />
      <FieldError errors={errors} />
    </div>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signup, undefined);
  const [clientErrors, setClientErrors] = useState<AuthFormState>();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Validasi sisi front end dengan skema Zod yang sama dengan backend.
    const formData = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      event.preventDefault();
      setClientErrors({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    setClientErrors(undefined);
  }

  // Prioritas menampilkan error front end (klien) atau backend (server).
  const errors = clientErrors?.errors ?? state?.errors;
  const message = clientErrors?.message ?? state?.message;

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field
        label="Nama"
        name="name"
        autoComplete="name"
        placeholder="Nama lengkap"
        errors={errors?.name}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="nama@kampus.ac.id"
        errors={errors?.email}
      />
      <Field
        label="Kata sandi"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Minimal 8 karakter"
        errors={errors?.password}
      />
      <Field
        label="Ulangi kata sandi"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        errors={errors?.confirmPassword}
      />
      {message ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {pending ? "Mendaftarkan…" : "Daftar Akun"}
      </button>
    </form>
  );
}