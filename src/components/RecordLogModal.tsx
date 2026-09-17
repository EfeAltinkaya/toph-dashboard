"use client";

import { useState, useTransition } from "react";
import { Mic, Square, X, Loader2, Camera } from "lucide-react";
import { createLog } from "@/lib/log-actions";
import { ACTIVITIES, LANGUAGES } from "@/lib/constants";
import { FIELD_NAMES } from "@/lib/fields";
import { resizeImageFile } from "@/lib/image";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useI18n } from "@/i18n/I18nProvider";
import { errorText, tr } from "@/i18n";

export function RecordLogModal({
  employeeNames,
  onClose,
  lockedEmployeeName,
}: {
  employeeNames: string[];
  onClose: () => void;
  // When set (the worker-only logging flow), the log is always attributed
  // to this name and the employee picker is hidden — a worker can log
  // their own activity, not anyone else's.
  lockedEmployeeName?: string;
}) {
  const { lang: pageLang, t } = useI18n();
  const r = t.recordModal;
  const [employeeName, setEmployeeName] = useState(lockedEmployeeName ?? employeeNames[0] ?? "");
  const [activity, setActivity] = useState<string>(ACTIVITIES[0]);
  const [field, setField] = useState(FIELD_NAMES[0]);
  const [language, setLanguage] = useState<string>(pageLang === "es" ? "es-ES" : LANGUAGES[0].code);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const recorder = useVoiceRecorder();

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUrl(await resizeImageFile(file, 1024, 0.8));
  }

  function handleSave() {
    if (!recorder.audioUrl) return;
    startTransition(async () => {
      await createLog({
        employeeName: employeeName.trim() || "Unassigned",
        activity,
        field,
        transcript: recorder.transcript,
        audioUrl: recorder.audioUrl!,
        photoUrl,
        language,
        accuracy: recorder.accuracy,
        source: "voice",
      });
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            {r.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {!lockedEmployeeName && (
            <div className="col-span-2">
              <label className="text-xs font-medium text-neutral-500">{t.fields.employee}</label>
              <input
                list="employee-options"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                disabled={recorder.phase === "recording"}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-50"
                placeholder={r.employeePlaceholder}
              />
              <datalist id="employee-options">
                {employeeNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-neutral-500">{t.fields.activity}</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              disabled={recorder.phase === "recording"}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-50"
            >
              {ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {tr(t.vocab.activities, a)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500">{t.fields.field}</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              disabled={recorder.phase === "recording"}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-50"
            >
              {FIELD_NAMES.map((f) => (
                <option key={f} value={f}>
                  {tr(t.vocab.fields, f)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-neutral-500">
              {r.spokenLanguage}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={recorder.phase === "recording"}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-50"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {tr(t.vocab.languages, l.code)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-neutral-400">
              {r.languageHint}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          {recorder.phase === "idle" && (
            <button
              type="button"
              onClick={() => recorder.start(language)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              <Mic size={16} /> {r.startRecording}
            </button>
          )}

          {recorder.phase === "recording" && (
            <div>
              <div className="flex items-center justify-center gap-2 text-sm text-red-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                {r.recording}
              </div>
              <p className="mt-2 min-h-10 text-sm text-neutral-600 italic">
                {recorder.transcript || (recorder.speechSupported ? r.listening : "")}
              </p>
              <button
                type="button"
                onClick={recorder.stop}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                <Square size={14} /> {r.stopRecording}
              </button>
            </div>
          )}

          {recorder.phase === "stopped" && (
            <div>
              {recorder.audioUrl && (
                <audio src={recorder.audioUrl} controls className="w-full" />
              )}
              <label className="mt-3 block text-xs font-medium text-neutral-500">
                {r.transcript}{" "}
                {!recorder.speechSupported && r.transcriptUnsupported}
              </label>
              <textarea
                value={recorder.transcript}
                onChange={(e) => recorder.setTranscript(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                placeholder={r.transcriptPlaceholder}
              />

              <label className="mt-3 block text-xs font-medium text-neutral-500">
                {r.photoOptional}
              </label>
              <div className="mt-1 flex items-center gap-3">
                {photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable remote image
                  <img
                    src={photoUrl}
                    alt=""
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                )}
                <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
                  <Camera size={13} />
                  {photoUrl ? r.retake : r.addPhoto}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={handleSave}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                {isPending ? r.saving : r.saveLog}
              </button>
            </div>
          )}
        </div>

        {recorder.error && (
          <p className="mt-3 text-sm text-red-600">{errorText(t, recorder.error)}</p>
        )}
        {/* Transcription can fail while the recording succeeds, so this
            reads as a note about typing the words in, not as an error. */}
        {recorder.transcriptError && (
          <p className="mt-3 rounded-xl bg-accent-25 px-3 py-2 text-sm text-neutral-700">
            {errorText(t, recorder.transcriptError)}
          </p>
        )}
      </div>
    </div>
  );
}
