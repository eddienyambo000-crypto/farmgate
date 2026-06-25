"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/admin-auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-medium text-ink-soft"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoFocus
          autoComplete="username"
          placeholder="Ferdinand23"
          className="w-full rounded-[var(--radius)] border border-line bg-surface px-4 py-2.5 text-ink outline-none transition-colors hover:border-forest/30 focus-visible:border-forest"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-ink-soft"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-[var(--radius)] border border-line bg-surface px-4 py-2.5 text-ink outline-none transition-colors hover:border-forest/30 focus-visible:border-forest"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-[var(--radius)] bg-forest font-semibold text-white shadow-[var(--shadow-md)] transition-[background-color,transform] duration-200 hover:bg-forest-deep active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
