"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

// Deterministic pseudo-random bar heights per log, so each row's waveform
// looks distinct even though they all currently point at the same placeholder
// audio file (see prisma/seed.ts for why: no real farm recordings exist yet).
function waveformBars(seed: number) {
  let value = seed * 9301 + 49297;
  const bars: number[] = [];
  for (let i = 0; i < 48; i++) {
    value = (value * 9301 + 49297) % 233280;
    bars.push(0.25 + (value / 233280) * 0.75);
  }
  return bars;
}

export function AudioPlayer({
  audioUrl,
  seed,
}: {
  audioUrl: string;
  seed: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const bars = waveformBars(seed);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  return (
    <div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <div className="flex h-14 items-center gap-[3px] rounded-lg bg-neutral-50 px-3">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-full ${
              playing ? "bg-emerald-500" : "bg-neutral-300"
            }`}
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={toggle}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
        {playing ? "Pause Recording" : "Play Recording"}
      </button>
    </div>
  );
}
