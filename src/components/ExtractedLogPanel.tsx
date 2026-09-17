"use client";

import { useState, useTransition } from "react";
import { Sparkles, Keyboard, Pencil, Check, X, Loader2, Info } from "lucide-react";
import { updateLogFields } from "@/lib/log-actions";
import { complianceChecks } from "@/lib/compliance";
import type { LogWithRelations } from "@/lib/types";

const STAGES = ["Listen", "Transcribe", "Extract", "Verify", "Audit-ready"] as const;

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl bg-accent-25 px-3 py-2.5">
      <div className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
        {label}
      </div>
      <div className={`mt-0.5 text-sm ${value ? "font-medium text-neutral-900" : "text-neutral-400 italic"}`}>
        {value ?? "not captured"}
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
          {log.source === "typed" ? "Entered log" : "Extracted log"}
        </div>
        {editable && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <Pencil size={11} /> Correct fields
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
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <X size={11} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Stage rail: where this log sits in the pipeline. */}
      <div className="mt-3 flex items-center gap-1.5">
        {STAGES.map((stage, i) => (
          <div key={stage} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-1 w-full rounded-full ${i <= reachedStage ? "bg-accent" : "bg-accent-100"}`}
            />
            <span
              className={`font-eyebrow text-[9px] tracking-widest uppercase ${
                i <= reachedStage ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              {stage}
            </span>
          </div>
        ))}
      </div>

      {editing ? (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              ["product", "Product / record"],
              ["target", "Target"],
              ["rate", "Rate"],
              ["notes", "Notes"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
                {label}
              </span>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Activity" value={log.activity} />
          <Field label="Field" value={log.field} />
          <Field label="Product / record" value={log.product} />
          <Field label="Target" value={log.target} />
          <Field label="Timing" value={`${log.startTime} – ${log.endTime}`} />
          <Field label="Rate" value={log.rate} />
          {log.notes && (
            <div className="sm:col-span-2">
              <Field label="Notes" value={log.notes} />
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <div className="text-xs font-semibold text-neutral-500">Compliance checks</div>
        <ul className="mt-2 space-y-1.5">
          {checks.map((check) => (
            <li key={check.label} className="flex items-start gap-2 text-sm">
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
                {check.label}
                {check.detail && (
                  <span className="text-neutral-400"> · {check.detail}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-neutral-400">
          <Info size={12} className="mt-0.5 shrink-0" />
          {log.source === "typed"
            ? "Entered by the worker. Checks run against the farm's approved product list."
            : "Parsed from the transcript against the farm's approved product list, then checked. Correct anything it got wrong."}
        </p>
      </div>
    </div>
  );
}
