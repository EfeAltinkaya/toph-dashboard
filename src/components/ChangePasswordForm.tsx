"use client";

import { useActionState, useRef, useEffect } from "react";
import { changePassword } from "@/lib/auth-actions";
import { useI18n } from "@/i18n/I18nProvider";
import { errorText } from "@/i18n";

export function ChangePasswordForm() {
  const { t } = useI18n();
  const s = t.settings;
  const [state, action, pending] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div className="text-sm font-medium text-neutral-700">{s.passwordTitle}</div>
      <div>
        <label className="text-xs font-medium text-neutral-500" htmlFor="currentPassword">
          {s.currentPassword}
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-neutral-500" htmlFor="newPassword">
          {s.newPassword}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-neutral-500" htmlFor="confirmPassword">
          {s.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{errorText(t, state.error)}</p>}
      {state?.success && <p className="text-sm text-emerald-600">{s.passwordUpdated}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? s.saving : s.updatePassword}
      </button>
    </form>
  );
}
