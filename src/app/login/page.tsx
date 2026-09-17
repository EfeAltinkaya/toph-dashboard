"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth-actions";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/i18n/I18nProvider";
import { errorText } from "@/i18n";

const INPUT =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const { t } = useI18n();
  const l = t.auth.login;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-neutral-900">{l.title}</h1>
          <LanguageToggle />
        </div>
        <p className="mt-1 text-sm text-neutral-500">{l.subtitle}</p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="email">
              {t.fields.email}
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" className={INPUT} />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="password">
              {t.fields.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={INPUT}
            />
          </div>

          {state?.error && <p className="text-sm text-red-600">{errorText(t, state.error)}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-accent py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? l.submitting : l.submit}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          {l.noAccount}{" "}
          <Link href="/signup" className="font-medium text-neutral-900 underline">
            {l.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
