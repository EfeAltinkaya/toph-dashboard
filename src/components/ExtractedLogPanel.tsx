"use client";

import { useState, useTransition } from "react";
import { Sparkles, Keyboard, Pencil, Check, X, Loader2, Info } from "lucide-react";
import { updateLogFields } from "@/lib/log-actions";
import { complianceChecks } from "@/lib/compliance";
import { useI18n } from "@/i18n/I18nProvider";
import { describeCheck, tr } from "@/i18n";
import type { LogWithRelations } from "@/lib/types";

const STAGES = ["listen", "transcribe", "extract", "verify", "auditReady"] as const;

function Field({ label, value, empty }: { label: string; value: string | null; empty: string }) {
  return (
    <div className="rounded-xl bg-accent-25 px-3 py-2.5">
      <div className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
        {label}
      </div>
      <div className={`mt-0.5 text-sm ${value ? "font-medium text-neutral-900" : "text-neutral-400 italic"}`}>
        {value ?? empty}
      </div>
    </div>
  );
}

export function ExtractedLogPanel({
  log,
  editable = false,
}: {
  log: LogWithRelations;
  /** Managers can correct the parser's output; workers only read it. */
  editable?: boolean;
}) {
  const { t } = useI18n();
  const e = t.extracted;
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(() => ({
    product: log.product ?? "",
    target: log.target ?? "",
    rate: log.rate ?? "",
    notes: log.notes ?? "",
  }));

  const checks = complianceChecks({
    field: log.field,
    startTime: log.startTime,
    product: log.product,
    target: log.target,
    rate: log.rate,
  });

  // How far this log actually got. A log missing a product or rate is
  // stuck at "verify" until someone fills it in — that's the honest state,
  // and it's what makes the stage rail worth showing at all.
  const verified = !checks.some((c) => c.status === "fail");
  const reachedStage = verified ? STAGES.length - 1 : STAGES.length - 2;

  function save() {
    startTransition(async () => {
      await updateLogFields(log.id, form);
      setEditing(false);
    });
  }

  return (
    <div className="rounded-2xl border border-accent-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
          {log.source === "typed" ? (
            <Keyboard size={15} className="text-accent" />
          ) : (
            <Sparkles size={15} className="text-accent" />
          )}
          {log.source === "typed" ? e.enteredLog : e.extractedLog}
        </div>
        {editable && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <Pencil size={11} /> {e.correctFields}
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isPending}
              onClick={save}
              className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              {e.save}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <X size={11} /> {e.cancel}
            </button>
          </div>
        )}
      </div>

      {/* Stage rail: where this log sits in the pipeline. */}
      <div className="mt-3 flex items-center gap-1.5">
        {STAGES.map((stage, i) => (
          <div key={stage} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className={`h-1 w-full rounded-full ${i <= reachedStage ? "bg-accent" : "bg-accent-100"}`}
            />
            <span
              className={`max-w-full truncate font-eyebrow text-[9px] tracking-widest uppercase ${
                i <= reachedStage ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              {t.stages[stage]}
            </span>
          </div>
        ))}
      </div>

      {editing ? (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              ["product", t.fields.productRecord],
              ["target", t.fields.target],
              ["rate", t.fields.rate],
              ["notes", t.fields.notes],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
                {label}
              </span>
              <input
                value={form[key]}
                onChange={(ev) => setForm((f) => ({ ...f, [key]: ev.target.value }))}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label={t.fields.activity} value={tr(t.vocab.activities, log.activity)} empty={e.notCaptured} />
          <Field label={t.fields.field} value={tr(t.vocab.fields, log.field)} empty={e.notCaptured} />
          <Field label={t.fields.productRecord} value={log.product} empty={e.notCaptured} />
          <Field
            label={t.fields.target}
            value={log.target && tr(t.vocab.targets, log.target)}
            empty={e.notCaptured}
          />
          <Field label={t.fields.timing} value={`${log.startTime} – ${log.endTime}`} empty={e.notCaptured} />
          <Field label={t.fields.rate} value={log.rate} empty={e.notCaptured} />
          {log.notes && (
            <div className="sm:col-span-2">
              <Field label={t.fields.notes} value={log.notes} empty={e.notCaptured} />
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <div className="text-xs font-semibold text-neutral-500">{e.complianceChecks}</div>
        <ul className="mt-2 space-y-1.5">
          {checks.map((check) => {
            const { label, detail } = describeCheck(check, t);
            return (
              <li key={check.id} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    check.status === "pass"
                      ? "bg-emerald-600"
                      : check.status === "fail"
                        ? "bg-red-500"
                        : "bg-neutral-300"
                  }`}
                >
                  {check.status === "pass" ? "✓" : check.status === "fail" ? "!" : "–"}
                </span>
                <span className="text-neutral-700">
                  {label}
                  {detail && <span className="text-neutral-400"> · {detail}</span>}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-neutral-400">
          <Info size={12} className="mt-0.5 shrink-0" />
          {log.source === "typed" ? e.typedNote : e.voiceNote}
        </p>
      </div>
    </div>
  );
}
