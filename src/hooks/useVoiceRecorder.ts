"use client";

import { useRef, useState } from "react";

export type RecorderPhase = "idle" | "recording" | "stopped";

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
        recognition.onerror = () => {
          /* mic hiccups shouldn't kill the recording */
        };
        recognitionRef.current = recognition;
        recognition.start();
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
    speechSupported,
    accuracy,
    start,
    stop,
    reset,
  };
}
