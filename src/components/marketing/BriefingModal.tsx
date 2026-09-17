"use client";

import { useActionState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Check } from "lucide-react";
import { requestBriefing } from "@/lib/briefing-actions";
import { useI18n } from "@/i18n/I18nProvider";
import { errorText } from "@/i18n";

// Submitted values stay in English (they're what lands in the database);
// only the visible label is translated.
const RESPONSIBILITIES = [
  "Farm Owner / Operator",
  "Compliance / Regulatory",
  "Field Operations Manager",
  "Other",
] as const;

const INPUT =
  "mt-1 w-full rounded-lg border border-soil/15 bg-white px-3 py-2 text-sm text-soil focus:border-crop focus:outline-none";
const LABEL = "font-eyebrow text-[10px] tracking-wider text-soil/60 uppercase";

export function BriefingModal({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState(requestBriefing, undefined);
  const { t } = useI18n();
  const b = t.briefing;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-soil/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-wheat p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {state?.success ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-crop/15 text-crop">
                <Check size={22} />
              </div>
              <h2 className="mt-4 font-display text-2xl text-soil">{b.successTitle}</h2>
              <p className="mt-2 text-sm text-soil/70">{b.successBody}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-full bg-soil px-5 py-2.5 text-sm font-medium text-wheat hover:opacity-90"
              >
                {b.close}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-eyebrow text-[11px] tracking-widest text-crop uppercase">
                    {b.eyebrow}
                  </div>
                  <h2 className="mt-1 font-display text-2xl text-soil">{b.title}</h2>
                  <p className="mt-1 text-sm text-soil/60">{b.body}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={b.close}
                  className="rounded-full p-1.5 text-soil/50 hover:bg-soil/5 hover:text-soil"
                >
                  <X size={18} />
                </button>
              </div>

              <form action={action} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>{b.firstName}</label>
                    <input name="firstName" required className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>{b.lastName}</label>
                    <input name="lastName" required className={INPUT} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>{b.email}</label>
                    <input name="email" type="email" required className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>{b.company}</label>
                    <input name="company" required className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>{b.responsibility}</label>
                  <select name="responsibility" required defaultValue="" className={INPUT}>
                    <option value="" disabled>
                      {b.selectResponsibility}
                    </option>
                    {RESPONSIBILITIES.map((r) => (
                      <option key={r} value={r}>
                        {b.responsibilities[r]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>{b.context}</label>
                  <textarea
                    name="context"
                    required
                    rows={3}
                    maxLength={2000}
                    placeholder={b.contextPlaceholder}
                    className={INPUT}
                  />
                </div>

                {state?.error && <p className="text-sm text-clay">{errorText(t, state.error)}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-full bg-soil py-3 text-sm font-medium text-wheat hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? b.sending : b.submit}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
