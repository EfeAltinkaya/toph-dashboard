"use client";

import { useRef, useState } from "react";

export type RecorderPhase = "idle" | "recording" | "stopped";

// Safari records MP4, Chrome and Firefox record WebM, and a device only
// offers what it offers. Asking rather than assuming is what keeps the
// saved audio playable: labelling an MP4 recording as WebM produced a
// file that would not play back on the phone that recorded it.
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm", "audio/mp4", "audio/ogg"];
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Captures real audio (MediaRecorder) and a live transcript (Web Speech
 * API) at the same time, so a log keeps both the recording and the text.
 *
 * Extracted into a hook because two screens record now — the manager's
 * modal and the worker's inline Voice tab — and a second copy of this
 * logic would be a second place for the transcript-duplication bug to
 * come back.
 */
export function useVoiceRecorder() {
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [transcript, setTranscript] = useState("");
  const [confidences, setConfidences] = useState<number[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Separate from `error`: transcription can fail while the recording
  // itself is fine, and in that case the worker should be told to type the
  // words rather than lose the log.
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  // Lazy initializer only runs in the browser render pass, so this is safe
  // even though the component also renders once on the server (where
  // `window` has no SpeechRecognition constructors at all).
  const [speechSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function start(language: string) {
    setError(null);
    setTranscript("");
    setConfidences([]);
    setAudioUrl(null);
    setTranscriptError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        // Every browser that can record has this. Not having it means an
        // insecure origin (plain http) far more often than an old browser,
        // and "check your permissions" would be the wrong advice.
        setError("micInsecureContext");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        setAudioUrl(await blobToDataUrl(blob));
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
        recognition.onerror = (event) => {
          // A pause in speech is not a failure, and neither is the
          // recogniser giving up at the end of a long silence. Anything
          // else is worth saying out loud: the old handler swallowed every
          // error, so a phone that could record but not transcribe just
          // sat on "Listening…" forever with no explanation.
          if (event.error === "no-speech" || event.error === "aborted") return;
          setTranscriptError(
            event.error === "not-allowed" || event.error === "service-not-allowed"
              ? "speechNotAllowed"
              : event.error === "network"
                ? "speechNetwork"
                : "speechUnavailable"
          );
        };
        recognitionRef.current = recognition;
        // iOS in particular can refuse to start the recogniser while the
        // recorder holds the microphone. That must not take the recording
        // down with it, so the worker still ends up with audio and can
        // type what they said.
        try {
          recognition.start();
        } catch {
          setTranscriptError("speechUnavailable");
        }
      }

      setPhase("recording");
    } catch {
      // A dictionary key (see src/i18n/en.ts errors), not a sentence.
      setError("micUnavailable");
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("stopped");
  }

  function reset() {
    setPhase("idle");
    setTranscript("");
    setConfidences([]);
    setAudioUrl(null);
    setError(null);
    setTranscriptError(null);
  }

  // Averaged recogniser confidence, shown on the dashboard as "response
  // accuracy". Falls back to a neutral value when the browser gives us no
  // confidence scores rather than claiming a perfect transcription.
  const accuracy = confidences.length
    ? (confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100
    : 90;

  return {
    phase,
    transcript,
    setTranscript,
    audioUrl,
    error,
    transcriptError,
    speechSupported,
    accuracy,
    start,
    stop,
    reset,
  };
}
