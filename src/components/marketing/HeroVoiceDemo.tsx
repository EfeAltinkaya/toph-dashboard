"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Square, RotateCcw, CornerDownLeft } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { extractActivity, extractField, extractLogFields } from "@/lib/extract";
import { complianceChecks } from "@/lib/compliance";
import { formatTime } from "@/lib/date-utils";

const LANGS = [
  { code: "en-US", label: "EN" },
  { code: "es-ES", label: "ES" },
] as const;
type LangCode = (typeof LANGS)[number]["code"];

// The second English example is deliberately non-compliant (Regalia isn't
// labeled for aphids), so the demo can show a record being flagged rather
// than only ever showing a clean pass.
const EXAMPLES: Record<LangCode, string[]> = {
  "en-US": [
    "Sprayed M-Pede on field A for aphids, two gallons per acre.",
    "Sprayed Regalia on field C for aphids, one quart per acre.",
  ],
  "es-ES": [
    "Rociamos Serenade ASO en el campo B contra oidio, veinticuatro onzas por acre.",
  ],
};

const STAGES = ["Listen", "Transcribe", "Extract", "Verify", "Audit-ready"];

function Cell({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg bg-wheat/[0.06] px-2.5 py-2">
      <div className="font-eyebrow text-[9px] tracking-widest text-wheat/40 uppercase">
        {label}
      </div>
      <div className="mt-0.5 h-5 overflow-hidden text-sm">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value ?? "empty"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={value ? "truncate font-medium text-wheat" : "text-wheat/25"}
          >
            {value ?? "—"}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * The hero's live demo: the visitor talks (or types, or picks an example)
 * and watches their own sentence become a structured, checked compliance
 * record. Everything below is derived from the transcript on every render
 * using the same parser and checks the real app runs, so there's no
 * scripted animation to fall out of sync with what the product does.
 */
export function HeroVoiceDemo() {
  const recorder = useVoiceRecorder();
  const [lang, setLang] = useState<LangCode>("en-US");
  const [draft, setDraft] = useState("");
  // Set at interaction time, never during render, so the server-rendered
  // HTML and the first client render can't disagree about the clock.
  const [time, setTime] = useState<string | null>(null);

  const text = recorder.transcript;
  const hasText = text.trim().length > 0;
  const listening = recorder.phase === "recording";

  const activity = hasText ? extractActivity(text) : null;
  const field = hasText ? extractField(text) : null;
  const { product, target, rate } = extractLogFields(text);
  const found = [activity, field, product, target, rate].filter(Boolean).length;

  const checks =
    hasText && !listening
      ? complianceChecks({ field: field ?? "", startTime: time ?? "", product, target, rate })
      : [];
  const flagged = checks.some((c) => c.status === "fail");

  // Index of the furthest stage this record has honestly reached.
  const stage = listening
    ? hasText ? 1 : 0
    : !hasText ? -1
    : found === 0 ? 1
    : flagged ? 3
    : 4;

  function submitText(value: string) {
    if (listening) recorder.stop();
    recorder.setTranscript(value);
    setTime(formatTime(new Date()));
  }

  // Speech support is only knowable in the browser, so the first render
  // always shows the mic button (matching the server HTML) and the
  // "unsupported" note only appears once someone actually tries it.
  const [unsupported, setUnsupported] = useState(false);

  function start() {
    if (!recorder.speechSupported) {
      setUnsupported(true);
      return;
    }
    setTime(formatTime(new Date()));
    recorder.start(lang);
  }

  function reset() {
    recorder.reset();
    setDraft("");
    setTime(null);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-wheat/15 bg-soil p-5 text-left shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full bg-clay ${listening ? "animate-pulse" : "opacity-40"}`} />
          <span className="font-eyebrow text-[11px] tracking-widest text-wheat/60 uppercase">
            {listening ? "Listening" : "Live demo · try it"}
          </span>
        </div>
        <div className="flex rounded-full border border-wheat/15 p-0.5">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              disabled={listening}
              onClick={() => {
                setLang(l.code);
                reset();
              }}
              className={`rounded-full px-2.5 py-0.5 font-eyebrow text-[10px] tracking-widest transition-colors ${
                lang === l.code ? "bg-wheat text-soil" : "text-wheat/50 hover:text-wheat"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-1">
        {STAGES.map((s, i) => {
          const lit = i <= stage;
          const warn = flagged && i === 3;
          return (
            <div key={s} className="flex flex-1 flex-col gap-1">
              <div
                className={`h-1 rounded-full transition-colors duration-500 ${
                  warn ? "bg-clay" : lit ? "bg-crop" : "bg-wheat/10"
                }`}
              />
              <span
                className={`font-eyebrow text-[8px] tracking-widest uppercase transition-colors ${
                  lit ? "text-wheat/70" : "text-wheat/25"
                }`}
              >
                {s}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 min-h-[5.5rem]">
        {listening ? (
          <div>
            <div className="flex h-8 items-center gap-[3px]">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-harvest"
                  style={{
                    height: `${10 + (i % 5) * 5}px`,
                    animation: "toph-bar 900ms ease-in-out infinite",
                    animationDelay: `${i * 55}ms`,
                  }}
                />
              ))}
            </div>
            <p className="mt-2 font-display text-lg text-wheat">
              {text || <span className="text-wheat/40">Say what you did in the field…</span>}
            </p>
            <button
              type="button"
              onClick={recorder.stop}
              className="mt-3 flex items-center gap-1.5 rounded-full bg-clay px-4 py-2 text-xs font-medium text-white hover:opacity-90"
            >
              <Square size={12} /> Stop
            </button>
          </div>
        ) : hasText ? (
          <div>
            <p className="font-display text-lg leading-snug text-wheat">&ldquo;{text}&rdquo;</p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 flex items-center gap-1 text-xs text-wheat/50 hover:text-wheat"
            >
              <RotateCcw size={11} /> Try another
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={start}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-wheat py-3 text-sm font-medium text-soil shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Mic size={16} /> Tap and say what you did
            </button>
            {unsupported && (
              <p className="mt-2 text-xs text-wheat/60">
                Voice needs Chrome or Edge. Pick an example or type a sentence below.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {EXAMPLES[lang].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => submitText(example)}
                  className="rounded-full border border-wheat/15 px-2.5 py-1 text-left text-[11px] text-wheat/60 hover:border-wheat/40 hover:text-wheat"
                >
                  {example}
                </button>
              ))}
            </div>
            <form
              className="mt-2 flex items-center gap-2 border-b border-wheat/15"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) submitText(draft.trim());
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="…or type one"
                className="w-full bg-transparent py-1.5 text-sm text-wheat placeholder:text-wheat/30 focus:outline-none"
              />
              <button type="submit" aria-label="Run" className="text-wheat/40 hover:text-wheat">
                <CornerDownLeft size={14} />
              </button>
            </form>
          </div>
        )}
        {recorder.error && <p className="mt-2 text-xs text-clay">{recorder.error}</p>}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5">
        <Cell label="Activity" value={activity} />
        <Cell label="Field" value={field} />
        <Cell label="Time" value={hasText ? time : null} />
        <Cell label="Product" value={product} />
        <Cell label="Target" value={target} />
        <Cell label="Rate" value={rate} />
      </div>

      <AnimatePresence>
        {checks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ul className="mt-4 space-y-1">
              {checks.map((check, i) => (
                <motion.li
                  key={check.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.12 }}
                  className="flex items-start gap-2 text-xs"
                >
                  <span
                    className={`mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                      check.status === "pass" ? "bg-crop" : check.status === "fail" ? "bg-clay" : "bg-wheat/25"
                    }`}
                  >
                    {check.status === "pass" ? "✓" : check.status === "fail" ? "!" : "–"}
                  </span>
                  <span className="text-wheat/70">
                    {check.label}
                    {check.detail && <span className="text-wheat/35"> · {check.detail}</span>}
                  </span>
                </motion.li>
              ))}
            </ul>
            <div
              className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
                flagged ? "bg-clay/20 text-clay" : found === 0 ? "bg-wheat/5 text-wheat/50" : "bg-crop/20 text-wheat"
              }`}
            >
              {flagged
                ? "Flagged for review before this goes in the audit file."
                : found === 0
                  ? "Nothing recognizable yet — try naming a product, a field, and a rate."
                  : "Audit-ready. This is what goes on file."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-4 text-[10px] text-wheat/30">
        Nothing from this demo is saved. Speech recognition is handled by your browser.
      </p>
    </div>
  );
}
