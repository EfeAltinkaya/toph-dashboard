"use client";

import { useState, useTransition } from "react";
import { Mic, Square, Loader2, Camera, RotateCcw, Check } from "lucide-react";
import { createLog } from "@/lib/log-actions";
import { ACTIVITIES, LANGUAGES } from "@/lib/constants";
import { APPLICATION_METHODS } from "@/lib/farm";
import { FIELD_NAMES } from "@/lib/fields";
import { LocationCapture, type CapturedLocation } from "@/components/LocationCapture";
import { resizeImageFile } from "@/lib/image";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useI18n } from "@/i18n/I18nProvider";
import { errorText, format, tr } from "@/i18n";

const BAR_COUNT = 24;
const SELECT =
  "mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm disabled:opacity-60";
const LABEL = "font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase";

function Equalizer() {
  return (
    <div className="flex h-10 items-center justify-center gap-[3px]">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-accent"
          style={{
            height: `${14 + (i % 5) * 6}px`,
            animation: "toph-bar 900ms ease-in-out infinite",
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function WorkerVoicePanel({
  userName,
  onSaved,
}: {
  userName: string;
  onSaved: () => void;
}) {
  const { lang: pageLang, t } = useI18n();
  const w = t.worker;
  const [activity, setActivity] = useState<string>(ACTIVITIES[0]);
  const [field, setField] = useState(FIELD_NAMES[0]);
  // A worker who switched the app to Spanish almost certainly speaks it.
  const [language, setLanguage] = useState<string>(pageLang === "es" ? "es-ES" : LANGUAGES[0].code);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<CapturedLocation>(null);
  // Only the activities that put a product out need a method, and the
  // state's report only asks about those.
  const [method, setMethod] = useState<string>(APPLICATION_METHODS[0]);
  const [isPending, startTransition] = useTransition();
  const recorder = useVoiceRecorder();
  const needsMethod = activity === "Spraying" || activity === "Soil work";

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUrl(await resizeImageFile(file, 1024, 0.8));
  }

  function handleSave() {
    if (!recorder.audioUrl) return;
    startTransition(async () => {
      await createLog({
        employeeName: userName,
        activity,
        field,
        transcript: recorder.transcript,
        audioUrl: recorder.audioUrl!,
        photoUrl,
        language,
        accuracy: recorder.accuracy,
        source: "voice",
        method: needsMethod ? method : null,
        location,
      });
      recorder.reset();
      setPhotoUrl(null);
      onSaved();
    });
  }

  const languageName = tr(t.vocab.languages, language);

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={LABEL}>{t.fields.activity}</span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            disabled={recorder.phase === "recording"}
            className={SELECT}
          >
            {ACTIVITIES.map((a) => (
              <option key={a} value={a}>
                {tr(t.vocab.activities, a)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>{t.fields.fieldBlock}</span>
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            disabled={recorder.phase === "recording"}
            className={SELECT}
          >
            {FIELD_NAMES.map((f) => (
              <option key={f} value={f}>
                {tr(t.vocab.fields, f)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>{w.language}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={recorder.phase === "recording"}
            className={SELECT}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {tr(t.vocab.languages, l.code)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {needsMethod && (
        <label className="mt-3 block max-w-xs">
          <span className={LABEL}>{w.method}</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={recorder.phase === "recording"}
            className={SELECT}
          >
            {APPLICATION_METHODS.map((m) => (
              <option key={m} value={m}>
                {tr(t.vocab.methods, m)}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="mt-3">
        <LocationCapture onCapture={setLocation} />
      </div>

      <div className="mt-5 rounded-2xl border border-accent-200 bg-accent-25 p-5">
        {recorder.phase === "idle" && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => recorder.start(language)}
              className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              <Mic size={18} /> {w.startLogging}
            </button>
            <p className="mt-3 text-sm text-neutral-500">
              {format(w.speakHint, { language: languageName.toLowerCase() })}
            </p>
          </div>
        )}

        {recorder.phase === "recording" && (
          <div>
            <Equalizer />
            <p className="mt-3 min-h-12 text-center text-sm text-neutral-700 italic">
              {recorder.transcript || (recorder.speechSupported ? w.listening : w.recording)}
            </p>
            <button
              type="button"
              onClick={recorder.stop}
              className="mx-auto mt-3 flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Square size={15} /> {w.stop}
            </button>
          </div>
        )}

        {recorder.phase === "stopped" && (
          <div>
            {recorder.audioUrl && <audio src={recorder.audioUrl} controls className="w-full" />}
            <label className={`mt-4 block ${LABEL}`}>
              {w.whatYouSaid}
              {!recorder.speechSupported && w.cantTranscribe}
            </label>
            <textarea
              value={recorder.transcript}
              onChange={(e) => recorder.setTranscript(e.target.value)}
              rows={3}
              placeholder={w.voicePlaceholder}
              className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable remote image
                <img src={photoUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
              )}
              <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-accent-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-accent-25">
                <Camera size={13} />
                {photoUrl ? w.retakePhoto : w.addPhoto}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => recorder.reset()}
                className="flex items-center gap-1.5 rounded-full border border-accent-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-accent-25"
              >
                <RotateCcw size={13} /> {w.recordAgain}
              </button>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {isPending ? w.sending : w.submit}
            </button>
          </div>
        )}
      </div>

      {recorder.error && <p className="mt-3 text-sm text-red-600">{errorText(t, recorder.error)}</p>}
      {/* A transcription failure is not a recording failure: the log can
          still be filed, so this is a note rather than an error. */}
      {recorder.transcriptError && (
        <p className="mt-3 rounded-xl bg-accent-25 px-3 py-2 text-sm text-neutral-700">
          {errorText(t, recorder.transcriptError)}
        </p>
      )}
    </div>
  );
}
