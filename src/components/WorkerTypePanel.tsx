"use client";

import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { createLog } from "@/lib/log-actions";
import { ACTIVITIES } from "@/lib/constants";
import { FIELD_NAMES } from "@/lib/fields";
import { APPROVED_PRODUCTS, TARGET_TERMS } from "@/lib/products";

/**
 * Builds the transcript for a typed log out of the fields the worker
 * filled in. Typed entries have no recording, so without this the
 * dashboard's summary column would be empty for them — this keeps every
 * log readable as a sentence regardless of how it was captured.
 */
function describe(fields: {
  activity: string;
  field: string;
  product: string;
  target: string;
  rate: string;
  notes: string;
}) {
  const parts = [`${fields.activity} in ${fields.field}.`];
  if (fields.product) {
    parts.push(
      fields.rate
        ? `Applied ${fields.product} at ${fields.rate}.`
        : `Applied ${fields.product}.`
    );
  }
  if (fields.target) parts.push(`Target: ${fields.target}.`);
  if (fields.notes) parts.push(fields.notes.trim());
  return parts.join(" ");
}

export function WorkerTypePanel({
  userName,
  onSaved,
}: {
  userName: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    activity: ACTIVITIES[0] as string,
    field: FIELD_NAMES[0],
    product: "",
    target: "",
    rate: "",
    notes: "",
  });
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createLog({
        employeeName: userName,
        activity: form.activity,
        field: form.field,
        transcript: describe(form),
        audioUrl: "",
        language: "en-US",
        // Typed entries aren't transcribed, so there's no recogniser
        // confidence to report — 100 is honest here: the text is exactly
        // what the worker wrote.
        accuracy: 100,
        source: "typed",
        product: form.product.trim() || null,
        target: form.target.trim() || null,
        rate: form.rate.trim() || null,
        notes: form.notes.trim() || null,
      });
      setForm((f) => ({ ...f, product: "", target: "", rate: "", notes: "" }));
      onSaved();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-neutral-500">
        No signal, or somewhere too loud to talk? Fill it in by hand instead.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
            Activity
          </span>
          <select
            value={form.activity}
            onChange={(e) => set("activity", e.target.value)}
            className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm"
          >
            {ACTIVITIES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
            Field / block
          </span>
          <select
            value={form.field}
            onChange={(e) => set("field", e.target.value)}
            className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm"
          >
            {FIELD_NAMES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
            Product used
          </span>
          <input
            list="approved-products"
            value={form.product}
            onChange={(e) => set("product", e.target.value)}
            placeholder="Leave blank if none"
            className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm"
          />
          <datalist id="approved-products">
            {APPROVED_PRODUCTS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.kind}
              </option>
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
            Target
          </span>
          <input
            list="target-terms"
            value={form.target}
            onChange={(e) => set("target", e.target.value)}
            placeholder="e.g. aphids"
            className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm"
          />
          <datalist id="target-terms">
            {Object.keys(TARGET_TERMS).map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
            Rate
          </span>
          <input
            value={form.rate}
            onChange={(e) => set("rate", e.target.value)}
            placeholder="e.g. 24 oz/acre"
            className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
            Notes
          </span>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Anything else worth recording?"
            className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        {isPending ? "Sending to the office…" : "Submit log"}
      </button>
    </form>
  );
}
