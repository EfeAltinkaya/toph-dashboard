"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signup } from "@/lib/auth-actions";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/i18n/I18nProvider";
import { errorText } from "@/i18n";

const INPUT =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [role, setRole] = useState<"manager" | "worker">("manager");
  const { t } = useI18n();
  const s = t.auth.signup;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-neutral-900">{s.title}</h1>
          <LanguageToggle />
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {role === "manager" ? s.managerSubtitle : s.workerSubtitle}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-full bg-neutral-100 p-1 text-sm font-medium">
          {(["manager", "worker"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-full py-1.5 transition-colors ${
                role === r ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              {s[r]}
            </button>
          ))}
        </div>

        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="role" value={role} />
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="name">
              {t.fields.name}
            </label>
            <input id="name" name="name" type="text" required autoComplete="name" className={INPUT} />
          </div>
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
              autoComplete="new-password"
              className={INPUT}
            />
            <p className="mt-1 text-xs text-neutral-400">{s.passwordHint}</p>
          </div>

          {role === "manager" && (
            <div>
              <label className="text-sm font-medium text-neutral-700" htmlFor="farmName">
                {s.farmName}
              </label>
              <input
                id="farmName"
                name="farmName"
                type="text"
                required
                placeholder={s.farmNamePlaceholder}
                className={INPUT}
              />
              <p className="mt-1 text-xs text-neutral-400">{s.farmNameHint}</p>
            </div>
          )}

          {role === "worker" && (
            <div>
              <label className="text-sm font-medium text-neutral-700" htmlFor="joinCode">
                {s.joinCode}
              </label>
              <input
                id="joinCode"
                name="joinCode"
                type="text"
                required
                autoCapitalize="characters"
                placeholder={s.joinCodePlaceholder}
                className={`${INPUT} uppercase`}
              />
              <p className="mt-1 text-xs text-neutral-400">{s.joinCodeHint}</p>
            </div>
          )}

          {state?.error && <p className="text-sm text-red-600">{errorText(t, state.error)}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-accent py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? s.submitting : s.submit}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          {s.haveAccount}{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline">
            {s.logIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
