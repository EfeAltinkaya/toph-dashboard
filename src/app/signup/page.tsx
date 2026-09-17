"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/auth-actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-neutral-900">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Every account has full access to the dashboard.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-400">At least 8 characters.</p>
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-accent py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
