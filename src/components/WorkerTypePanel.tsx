"use client";

import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { createLog } from "@/lib/log-actions";
import { ACTIVITIES } from "@/lib/constants";
import { FIELD_NAMES } from "@/lib/fields";
import { APPLICATION_METHODS } from "@/lib/farm";
import { APPROVED_PRODUCTS, TARGET_TERMS } from "@/lib/products";
import { LocationCapture, type CapturedLocation } from "@/components/LocationCapture";
import { extractLogFields } from "@/lib/extract";
import { useI18n } from "@/i18n/I18nProvider";
import { format, tr, type Dictionary } from "@/i18n";

const INPUT = "mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm";
const LABEL = "font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase";

type TypedFields = {
  activity: string;
  field: string;
  product: string;
  target: string;
  rate: string;
  notes: string;
};

/**
 * Builds the transcript for a typed log out of the fields the worker
 * filled in, in the language they're using. Typed entries have no
 * recording, so without this the dashboard's summary column would be empty
 * for them — this keeps every log readable as a sentence regardless of
 * how it was captured.
 */
function describe(fields: TypedFields, t: Dictionary) {
  const w = t.worker;
  const parts = [
    format(w.typedActivity, {
      activity: tr(t.vocab.activities, fields.activity),
      field: tr(t.vocab.fields, fields.field),
    }),
  ];
  if (fields.product) {
    parts.push(
      fields.rate
        ? format(w.typedAppliedAt, { product: fields.product, rate: fields.rate })
        : format(w.typedApplied, { product: fields.product })
    );
  }
  if (fields.target) {
    parts.push(format(w.typedTarget, { target: tr(t.vocab.targets, fields.target) }));
  }
  if (fields.notes) parts.push(fields.notes.trim());
  return parts.join(" ");
}

/** "pulgones", "Aphids"... -> the canonical "aphids" the product
 * labels use, so a target typed in Spanish is checked against the label
 * the same way a spoken one is. Unrecognized text is kept as written. */
function canonicalTarget(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return extractLogFields(trimmed).target ?? trimmed;
}

export function WorkerTypePanel({
  userName,
  onSaved,
}: {
  userName: string;
  onSaved: () => void;
}) {
  const { lang, t } = useI18n();
  const w = t.worker;
  const [form, setForm] = useState<TypedFields>({
    activity: ACTIVITIES[0],
    field: FIELD_NAMES[0],
    product: "",
    target: "",
    rate: "",
    notes: "",
  });
  const [location, setLocation] = useState<CapturedLocation>(null);
  const [method, setMethod] = useState<string>(APPLICATION_METHODS[0]);
  const [isPending, startTransition] = useTransition();
  const needsMethod = form.activity === "Spraying" || form.activity === "Soil work";

  function set<K extends keyof TypedFields>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = canonicalTarget(form.target);
    startTransition(async () => {
      await createLog({
        employeeName: userName,
        activity: form.activity,
        field: form.field,
        transcript: describe({ ...form, target: target ?? "" }, t),
        audioUrl: "",
        language: lang === "es" ? "es-ES" : "en-US",
        // Typed entries aren't transcribed, so there's no recogniser
        // confidence to report — 100 is honest here: the text is exactly
        // what the worker wrote.
        accuracy: 100,
        source: "typed",
        product: form.product.trim() || null,
        target,
        rate: form.rate.trim() || null,
        notes: form.notes.trim() || null,
        method: needsMethod ? method : null,
        location,
      });
      setForm((f) => ({ ...f, product: "", target: "", rate: "", notes: "" }));
      onSaved();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm text-neutral-500">{w.typeIntro}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={LABEL}>{t.fields.activity}</span>
          <select value={form.activity} onChange={(e) => set("activity", e.target.value)} className={INPUT}>
            {ACTIVITIES.map((a) => (
              <option key={a} value={a}>
                {tr(t.vocab.activities, a)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={LABEL}>{t.fields.fieldBlock}</span>
          <select value={form.field} onChange={(e) => set("field", e.target.value)} className={INPUT}>
            {FIELD_NAMES.map((f) => (
              <option key={f} value={f}>
                {tr(t.vocab.fields, f)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={LABEL}>{w.productUsed}</span>
          <input
            list="approved-products"
            value={form.product}
            onChange={(e) => set("product", e.target.value)}
            placeholder={w.productPlaceholder}
            className={INPUT}
          />
          <datalist id="approved-products">
            {APPROVED_PRODUCTS.map((p) => (
              <option key={p.name} value={p.name}>
                {tr(t.vocab.productKinds, p.kind)}
              </option>
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className={LABEL}>{t.fields.target}</span>
          <input
            list="target-terms"
            value={form.target}
            onChange={(e) => set("target", e.target.value)}
            placeholder={w.targetPlaceholder}
            className={INPUT}
          />
          <datalist id="target-terms">
            {Object.keys(TARGET_TERMS).map((target) => (
              <option key={target} value={tr(t.vocab.targets, target)} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className={LABEL}>{t.fields.rate}</span>
          <input
            value={form.rate}
            onChange={(e) => set("rate", e.target.value)}
            placeholder={w.ratePlaceholder}
            className={INPUT}
          />
        </label>

        {needsMethod && (
          <label className="block">
            <span className={LABEL}>{w.method}</span>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={INPUT}>
              {APPLICATION_METHODS.map((m) => (
                <option key={m} value={m}>
                  {tr(t.vocab.methods, m)}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block sm:col-span-2">
          <span className={LABEL}>{t.fields.notes}</span>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder={w.notesPlaceholder}
            className={INPUT}
          />
        </label>
      </div>

      <div className="mt-3">
        <LocationCapture onCapture={setLocation} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        {isPending ? w.sending : w.submit}
      </button>
    </form>
  );
}
