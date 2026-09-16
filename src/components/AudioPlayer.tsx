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
      <div className="flex h-14 items-center gap-[3px] px-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-emerald-800"
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={toggle}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
        {playing ? "Pause Recording" : "Play Recording"}
      </button>
    </div>
  );
}
