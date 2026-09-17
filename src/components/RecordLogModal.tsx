"use client";

import { useRef, useState, useTransition } from "react";
import { Mic, Square, X, Loader2, Camera } from "lucide-react";
import { createLog } from "@/lib/log-actions";
import { ACTIVITIES, LANGUAGES } from "@/lib/constants";
import { FIELD_NAMES } from "@/lib/fields";
import { resizeImageFile } from "@/lib/image";

type Phase = "idle" | "recording" | "stopped" | "saving";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function RecordLogModal({
  employeeNames,
  onClose,
}: {
  employeeNames: string[];
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [employeeName, setEmployeeName] = useState(employeeNames[0] ?? "");
  const [activity, setActivity] = useState<string>(ACTIVITIES[0]);
  const [field, setField] = useState(FIELD_NAMES[0]);
  const [language, setLanguage] = useState<string>(LANGUAGES[0].code);
  const [transcript, setTranscript] = useState("");
  const [confidences, setConfidences] = useState<number[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Lazy initializer only runs in the browser render pass, so this is safe
  // even though the component also renders once on the server (where
  // `window` has no SpeechRecognition constructors at all).
  const [speechSupported] = useState(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function startRecording() {
    setError(null);
    setTranscript("");
    setConfidences([]);
    setAudioUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const dataUrl = await blobToDataUrl(blob);
        setAudioUrl(dataUrl);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();

      const SpeechRecognitionCtor =
        window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.onresult = (event) => {
          // `event.results` is the full accumulated list for the whole
          // continuous session, not just what's new since the last event —
          // rebuilding from scratch each time (rather than appending to
          // existing state) is what avoids re-appending already-finalized
          // text on every subsequent result.
          let finalText = "";
          const allConfidences: number[] = [];
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalText += result[0].transcript + " ";
              allConfidences.push(result[0].confidence);
            }
          }
          setTranscript(finalText.trim());
          setConfidences(allConfidences);
        };
        recognition.onerror = () => {
          /* mic hiccups shouldn't kill the recording */
        };
        recognitionRef.current = recognition;
        recognition.start();
      }

      setPhase("recording");
    } catch {
      setError(
        "Couldn't access your microphone. Check your browser's site permissions and try again."
      );
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("stopped");
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUrl(await resizeImageFile(file, 1024, 0.8));
  }

  function handleSave() {
    if (!audioUrl) return;
    const avgConfidence = confidences.length
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0.9;

    setPhase("saving");
    startTransition(async () => {
      await createLog({
        employeeName: employeeName.trim() || "Unassigned",
        activity,
        field,
        transcript,
        audioUrl,
        photoUrl,
        language,
        accuracy: avgConfidence * 100,
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
            Record a New Log
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
          <div className="col-span-2">
            <label className="text-xs font-medium text-neutral-500">Employee</label>
            <input
              list="employee-options"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              disabled={phase === "recording"}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-50"
              placeholder="Type a name (new or existing)"
            />
            <datalist id="employee-options">
              {employeeNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500">Activity</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              disabled={phase === "recording"}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-50"
            >
              {ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500">Field</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              disabled={phase === "recording"}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-50"
            >
              {FIELD_NAMES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-neutral-500">
              Spoken Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={phase === "recording"}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-50"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-neutral-400">
              Sets what the recognizer listens for. Logs in Spanish can be translated to English afterward.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          {phase === "idle" && (
            <button
              type="button"
              onClick={startRecording}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              <Mic size={16} /> Start Recording
            </button>
          )}

          {phase === "recording" && (
            <div>
              <div className="flex items-center justify-center gap-2 text-sm text-red-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Recording...
              </div>
              <p className="mt-2 min-h-10 text-sm text-neutral-600 italic">
                {transcript || (speechSupported ? "Listening..." : "")}
              </p>
              <button
                type="button"
                onClick={stopRecording}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                <Square size={14} /> Stop Recording
              </button>
            </div>
          )}

          {(phase === "stopped" || phase === "saving") && (
            <div>
              {audioUrl && <audio src={audioUrl} controls className="w-full" />}
              <label className="mt-3 block text-xs font-medium text-neutral-500">
                Transcript{" "}
                {!speechSupported && "(live transcription needs Chrome or Edge — type it manually)"}
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                placeholder="What happened in this log?"
              />

              <label className="mt-3 block text-xs font-medium text-neutral-500">
                Photo (optional)
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
                  {photoUrl ? "Retake" : "Add Photo"}
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
                {isPending ? "Saving..." : "Save Log"}
              </button>
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
