"use client";

import { useActionState, useState } from "react";
import { login } from "@/lib/auth/actions";
import { loginSchema } from "@/lib/auth/validations";
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

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [clientErrors, setClientErrors] = useState<AuthFormState>();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Validasi sisi front end dengan skema Zod yang sama dengan backend.
    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      event.preventDefault();
      setClientErrors({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    setClientErrors(undefined);
  }

  const errors = clientErrors?.errors ?? state?.errors;
  const message = clientErrors?.message ?? state?.message;

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@kampus.ac.id"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
        />
        <FieldError errors={errors?.email} />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Kata sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
        />
        <FieldError errors={errors?.password} />
      </div>
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
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}