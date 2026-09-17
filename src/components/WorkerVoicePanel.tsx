"use client";

import { useState, useTransition } from "react";
import { Mic, Square, Loader2, Camera, RotateCcw, Check } from "lucide-react";
import { createLog } from "@/lib/log-actions";
import { ACTIVITIES, LANGUAGES } from "@/lib/constants";
import { FIELD_NAMES } from "@/lib/fields";
import { resizeImageFile } from "@/lib/image";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

const BAR_COUNT = 24;

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
  const [activity, setActivity] = useState<string>(ACTIVITIES[0]);
  const [field, setField] = useState(FIELD_NAMES[0]);
  const [language, setLanguage] = useState<string>(LANGUAGES[0].code);
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
        employeeName: userName,
        activity,
        field,
        transcript: recorder.transcript,
        audioUrl: recorder.audioUrl!,
        photoUrl,
        language,
        accuracy: recorder.accuracy,
        source: "voice",
      });
      recorder.reset();
      setPhotoUrl(null);
      onSaved();
    });
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
            Activity
          </span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            disabled={recorder.phase === "recording"}
            className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm disabled:opacity-60"
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
            value={field}
            onChange={(e) => setField(e.target.value)}
            disabled={recorder.phase === "recording"}
            className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm disabled:opacity-60"
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
            Language / idioma
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={recorder.phase === "recording"}
            className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm disabled:opacity-60"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 rounded-2xl border border-accent-200 bg-accent-25 p-5">
        {recorder.phase === "idle" && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => recorder.start(language)}
              className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              <Mic size={18} /> Start logging
            </button>
            <p className="mt-3 text-sm text-neutral-500">
              Just say what you did. You can speak normally, in{" "}
              {language.startsWith("es") ? "Spanish" : "English"}.
            </p>
          </div>
        )}

        {recorder.phase === "recording" && (
          <div>
            <Equalizer />
            <p className="mt-3 min-h-12 text-center text-sm text-neutral-700 italic">
              {recorder.transcript ||
                (recorder.speechSupported ? "Listening…" : "Recording…")}
            </p>
            <button
              type="button"
              onClick={recorder.stop}
              className="mx-auto mt-3 flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Square size={15} /> Stop
            </button>
          </div>
        )}

        {recorder.phase === "stopped" && (
          <div>
            {recorder.audioUrl && (
              <audio src={recorder.audioUrl} controls className="w-full" />
            )}
            <label className="mt-4 block font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
              What you said
              {!recorder.speechSupported && " — type it in, this browser can't transcribe"}
            </label>
            <textarea
              value={recorder.transcript}
              onChange={(e) => recorder.setTranscript(e.target.value)}
              rows={3}
              placeholder="e.g. Sprayed Serenade ASO on Field A for aphids, 24 ounces per acre."
              className="mt-1 w-full rounded-xl border border-accent-200 bg-white px-3 py-2.5 text-sm"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable remote image
                <img src={photoUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
              )}
              <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-accent-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-accent-25">
                <Camera size={13} />
                {photoUrl ? "Retake photo" : "Add photo"}
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
                <RotateCcw size={13} /> Record again
              </button>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {isPending ? "Sending to the office…" : "Submit log"}
            </button>
          </div>
        )}
      </div>

      {recorder.error && <p className="mt-3 text-sm text-red-600">{recorder.error}</p>}
    </div>
  );
}
