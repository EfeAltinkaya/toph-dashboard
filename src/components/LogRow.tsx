"use client";

import { useState, useTransition } from "react";
import { Maximize2, Pencil, Trash2, X, Check, Camera, Languages, Loader2 } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TagPicker } from "@/components/TagPicker";
import { FieldMap } from "@/components/FieldMap";
import { ExtractedLogPanel } from "@/components/ExtractedLogPanel";
import { markLogViewed } from "@/app/actions";
import { updateLog, deleteLog, setLogPhoto } from "@/lib/log-actions";
import { translateLog } from "@/lib/translate-actions";
import { ACTIVITIES } from "@/lib/constants";
import { FIELD_NAMES } from "@/lib/fields";
import { resizeImageFile } from "@/lib/image";
import { useI18n } from "@/i18n/I18nProvider";
import { format, errorText, tr } from "@/i18n";
import { localeFor } from "@/i18n/config";
import type { LogWithRelations, TagOption } from "@/lib/types";
import { FARM_TIME_ZONE } from "@/lib/date-utils";

const GRID_COLS = "grid-cols-[24px_1.6fr_1.2fr_1.3fr_0.9fr_1.4fr_1fr]";

const LANGUAGE_FLAGS: Record<string, string> = { es: "🇪🇸", en: "🇺🇸" };

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function LogRow({
  log,
  allTags,
  expanded,
  onToggle,
}: {
  log: LogWithRelations;
  allTags: TagOption[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const { lang, t } = useI18n();
  const dateFormatter = new Intl.DateTimeFormat(localeFor(lang), {
    timeZone: FARM_TIME_ZONE,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const [mapOpen, setMapOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [translated, setTranslated] = useState(log.translated);
  const [showTranslation, setShowTranslation] = useState(!!log.translated);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const sourceLang = log.language.split("-")[0];
  const isForeignLanguage = sourceLang !== "en";

  function handleTranslate() {
    setTranslateError(null);
    setTranslating(true);
    startTransition(async () => {
      const result = await translateLog(log.id);
      setTranslating(false);
      if (result.error) {
        setTranslateError(result.error);
      } else if (result.text) {
        setTranslated(result.text);
        setShowTranslation(true);
      }
    });
  }

  const [form, setForm] = useState(() => ({
    employeeName: log.employee.name,
    activity: log.activity,
    field: log.field,
    date: toDateInputValue(log.date),
    startTime: log.startTime,
    endTime: log.endTime,
  }));

  function handleToggle() {
    if (!expanded && log.isNew) {
      startTransition(() => {
        markLogViewed(log.id);
      });
    }
    onToggle();
  }

  function saveEdit() {
    startTransition(async () => {
      await updateLog(log.id, form);
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(format(t.logs.confirmDelete, { name: log.employee.name }))) {
      return;
    }
    startTransition(() => {
      deleteLog(log.id);
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImageFile(file, 1024, 0.8);
    startTransition(() => {
      setLogPhoto(log.id, dataUrl);
    });
  }

  if (editing) {
    return (
      <div className="grid grid-cols-1 gap-2 border-b border-neutral-100 bg-amber-50/40 px-4 py-3 last:border-b-0 sm:grid-cols-6 sm:items-center sm:gap-3">
        <input
          value={form.employeeName}
          onChange={(e) => setForm((f) => ({ ...f, employeeName: e.target.value }))}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          placeholder={t.logs.employeeName}
        />
        <select
          value={form.activity}
          onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        >
          {ACTIVITIES.map((a) => (
            <option key={a} value={a}>
              {tr(t.vocab.activities, a)}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <select
          value={form.field}
          onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        >
          {FIELD_NAMES.map((f) => (
            <option key={f} value={f}>
              {tr(t.vocab.fields, f)}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <input
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            className="w-full min-w-0 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            placeholder="6:00 AM"
          />
          <span className="text-neutral-400">-</span>
          <input
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            className="w-full min-w-0 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            placeholder="8:00 AM"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isPending}
            onClick={saveEdit}
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            <Check size={12} /> {t.logs.save}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
          >
            <X size={12} /> {t.logs.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <div className={`grid ${GRID_COLS} items-center gap-3 px-4 py-3 text-sm`}>
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex items-center gap-2 font-medium text-neutral-900">
          {log.employee.name}
          {isForeignLanguage && (
            <span title={t.logs.recordedInSpanish}>{LANGUAGE_FLAGS[sourceLang] ?? "🌐"}</span>
          )}
          {log.isNew && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
        </div>
        <div className="text-neutral-600">{tr(t.vocab.activities, log.activity)}</div>
        <div className="text-neutral-600">{dateFormatter.format(log.date)}</div>
        <div className="text-neutral-600 uppercase">{tr(t.vocab.fields, log.field)}</div>
        <div className="text-neutral-600">
          {log.startTime} - {log.endTime}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            title={t.logs.edit}
            className="rounded-full border border-neutral-300 bg-white p-1.5 text-neutral-600 hover:bg-neutral-50"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            title={t.logs.delete}
            className="rounded-full border border-neutral-300 bg-white p-1.5 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={13} />
          </button>
          <button
            type="button"
            onClick={handleToggle}
            className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
          >
            {expanded ? t.logs.close : t.logs.view}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-neutral-100 bg-neutral-50/60 p-4">
          <ExtractedLogPanel log={log} editable />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            {log.audioUrl ? (
              <AudioPlayer audioUrl={log.audioUrl} seed={log.id} />
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-500">
                {t.logs.typedEntry}
              </div>
            )}
            <div className="mt-2">
              <TagPicker
                logId={log.id}
                allTags={allTags}
                activeTagIds={log.tags.map((t) => t.id)}
              />
            </div>
            {log.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {log.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-neutral-500">
                  {t.logs.summary}{" "}
                  {isForeignLanguage && !showTranslation && t.logs.spanishSuffix}
                </div>
                {isForeignLanguage && (
                  <button
                    type="button"
                    disabled={translating}
                    onClick={() => (translated ? setShowTranslation((v) => !v) : handleTranslate())}
                    className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    {translating ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Languages size={11} />
                    )}
                    {translating
                      ? t.logs.translating
                      : translated
                        ? showTranslation
                          ? t.logs.showOriginal
                          : t.logs.showEnglish
                        : t.logs.translateToEnglish}
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                &ldquo;{showTranslation && translated ? translated : log.transcript}&rdquo;
              </p>
              {translateError && (
                <p className="mt-1 text-xs text-red-600">{errorText(t, translateError)}</p>
              )}
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-neutral-500">{t.fields.photo}</div>
              {log.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable remote image
                <img
                  src={log.photoUrl}
                  alt=""
                  className="mt-1 h-64 w-full rounded-lg object-cover sm:h-80"
                />
              )}
              <label className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
                <Camera size={13} />
                {log.photoUrl ? t.logs.replacePhoto : t.logs.addPhoto}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="relative isolate overflow-hidden rounded-xl">
            {!mapOpen && (
              <FieldMap
                lat={log.lat}
                lng={log.lng}
                label={tr(t.vocab.fields, log.field)}
                className="h-48 w-full sm:h-full"
              />
            )}
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="absolute right-3 bottom-3 z-[400] flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
            >
              <Maximize2 size={12} />
              {t.logs.expandMap}
            </button>
          </div>
          </div>
        </div>
      )}

      {mapOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-6"
          onClick={() => setMapOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-neutral-900">
                {tr(t.vocab.fields, log.field)} — {log.employee.name}
              </div>
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
              >
                {t.logs.close}
              </button>
            </div>
            <FieldMap
              lat={log.lat}
              lng={log.lng}
              label={tr(t.vocab.fields, log.field)}
              interactive
              className="h-[60vh] w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { GRID_COLS };
