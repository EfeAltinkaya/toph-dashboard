"use client";

import { useActionState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Check } from "lucide-react";
import { requestBriefing } from "@/lib/briefing-actions";

const RESPONSIBILITIES = [
  "Farm Owner / Operator",
  "Compliance / Regulatory",
  "Field Operations Manager",
  "Other",
];

export function BriefingModal({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState(requestBriefing, undefined);

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
              <h2 className="mt-4 font-display text-2xl text-soil">
                Request received.
              </h2>
              <p className="mt-2 text-sm text-soil/70">
                We&apos;ll follow up at the email you gave us. In the meantime,
                feel free to explore the dashboard yourself.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-full bg-soil px-5 py-2.5 text-sm font-medium text-wheat hover:opacity-90"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-eyebrow text-[11px] tracking-widest text-crop uppercase">
                    Secure intake
                  </div>
                  <h2 className="mt-1 font-display text-2xl text-soil">
                    Request a briefing.
                  </h2>
                  <p className="mt-1 text-sm text-soil/60">
                    Tell us where the paperwork is piling up. Required fields are
                    marked with an asterisk.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-soil/50 hover:bg-soil/5 hover:text-soil"
                >
                  <X size={18} />
                </button>
              </div>

              <form action={action} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-eyebrow text-[10px] tracking-wider text-soil/60 uppercase">
                      First name *
                    </label>
                    <input
                      name="firstName"
                      required
                      className="mt-1 w-full rounded-lg border border-soil/15 bg-white px-3 py-2 text-sm text-soil focus:border-crop focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-eyebrow text-[10px] tracking-wider text-soil/60 uppercase">
                      Last name *
                    </label>
                    <input
                      name="lastName"
                      required
                      className="mt-1 w-full rounded-lg border border-soil/15 bg-white px-3 py-2 text-sm text-soil focus:border-crop focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-eyebrow text-[10px] tracking-wider text-soil/60 uppercase">
                      Work email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="mt-1 w-full rounded-lg border border-soil/15 bg-white px-3 py-2 text-sm text-soil focus:border-crop focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-eyebrow text-[10px] tracking-wider text-soil/60 uppercase">
                      Farm / company *
                    </label>
                    <input
                      name="company"
                      required
                      className="mt-1 w-full rounded-lg border border-soil/15 bg-white px-3 py-2 text-sm text-soil focus:border-crop focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-eyebrow text-[10px] tracking-wider text-soil/60 uppercase">
                    Primary responsibility *
                  </label>
                  <select
                    name="responsibility"
                    required
                    defaultValue=""
                    className="mt-1 w-full rounded-lg border border-soil/15 bg-white px-3 py-2 text-sm text-soil focus:border-crop focus:outline-none"
                  >
                    <option value="" disabled>
                      Select a responsibility
                    </option>
                    {RESPONSIBILITIES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-eyebrow text-[10px] tracking-wider text-soil/60 uppercase">
                    What do you want to improve? *
                  </label>
                  <textarea
                    name="context"
                    required
                    rows={3}
                    maxLength={2000}
                    placeholder="Describe the workflow or compliance headache you're trying to fix."
                    className="mt-1 w-full rounded-lg border border-soil/15 bg-white px-3 py-2 text-sm text-soil focus:border-crop focus:outline-none"
                  />
                </div>

                {state?.error && <p className="text-sm text-clay">{state.error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-full bg-soil py-3 text-sm font-medium text-wheat hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? "Sending..." : "Request a Briefing"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
