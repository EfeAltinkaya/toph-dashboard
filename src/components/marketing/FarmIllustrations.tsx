/** Hand-drawn-style farm line art, built as inline SVG so it inherits the
 * page's own palette (via `currentColor`) instead of shipping raster
 * images. Kept as thin, single-weight strokes so it reads as a sketch
 * accent rather than clipart competing with the type. */

export function WheatSprig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 140"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M30 138 L30 20" />
      {Array.from({ length: 7 }).map((_, i) => {
        const y = 24 + i * 15;
        const s = 1 - i * 0.07;
        return (
          <g key={i}>
            <path d={`M30 ${y} Q${30 - 16 * s} ${y - 6 * s} ${30 - 10 * s} ${y - 18 * s}`} />
            <path d={`M30 ${y} Q${30 + 16 * s} ${y - 6 * s} ${30 + 10 * s} ${y - 18 * s}`} />
          </g>
        );
      })}
      <path d="M30 20 L30 4" />
    </svg>
  );
}

export function CornStalk({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M40 158 C38 120 40 80 42 40" />
      <path d="M42 100 C25 95 15 80 12 60" />
      <path d="M40 70 C56 64 66 50 68 32" />
      <path d="M42 40 C40 26 42 12 48 2" />
      <ellipse cx="49" cy="24" rx="8" ry="20" transform="rotate(18 49 24)" />
      <path d="M45 12 L45 40 M49 10 L49 40 M53 12 L53 40" opacity="0.6" />
    </svg>
  );
}

export function BarnSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 116 L20 60 L60 24 L100 60 L100 116" />
      <path d="M100 116 L100 46 L140 12 L180 46 L180 116" />
      <path d="M20 60 L180 60" opacity="0.5" />
      <rect x="52" y="84" width="18" height="32" />
      <path d="M138 30 L138 46 M148 46 L148 30" opacity="0.6" />
    </svg>
  );
}

/** Filled, two-layer hill line for the seam between a dark and a light
 * section. Color it with the section it rises *into*: the transparent part
 * above the ridge shows whatever sits behind it, so the seam reads as a
 * horizon rather than a hard edge. */
export function RollingHills({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        d="M0 70 C180 30 360 30 540 60 C720 90 900 40 1080 45 C1260 50 1350 75 1440 60 L1440 120 L0 120 Z"
        fill="currentColor"
        opacity="0.45"
      />
      <path
        d="M0 95 C200 60 420 60 640 85 C860 110 1080 70 1260 72 C1350 73 1400 85 1440 88 L1440 120 L0 120 Z"
        fill="currentColor"
      />
    </svg>
  );
}

const WINDMILL_BLADES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 * Math.PI) / 180;
  const spread = (7 * Math.PI) / 180;
  // Fixed precision so the path string is identical on server and client.
  const point = (r: number, a: number) =>
    `${(60 + r * Math.cos(a)).toFixed(1)} ${(60 + r * Math.sin(a)).toFixed(1)}`;
  return `M${point(9, angle - spread / 3)} L${point(40, angle - spread)} L${point(40, angle + spread)} L${point(9, angle + spread / 3)} Z`;
});

/** Farm windmill. The wheel turns slowly via the `toph-spin` class, which
 * globals.css switches off for visitors who prefer reduced motion. */
export function Windmill({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 220"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M42 216 L56 72 M78 216 L64 72 M50 72 L70 72 M20 216 L100 216" />
      <path d="M45.5 180 L74.5 180 M50.4 130 L69.6 130 M53.8 95 L66.2 95" opacity="0.7" />
      <path d="M45.5 180 L69.6 130 M74.5 180 L50.4 130 M50.4 130 L66.2 95 M69.6 130 L53.8 95" opacity="0.45" />
      <path d="M60 60 L100 60 M96 50 L112 45 L112 75 L96 70 Z" />
      <g className="toph-spin" style={{ transformOrigin: "60px 60px" }}>
        <circle cx="60" cy="60" r="40" opacity="0.5" />
        {WINDMILL_BLADES.map((d) => (
          <path key={d} d={d} />
        ))}
        <circle cx="60" cy="60" r="5" />
      </g>
    </svg>
  );
}

/** A post-and-rail fence. Drawn with an SVG pattern rather than a stretched
 * viewBox so the posts keep their shape at any width. `id` must be unique
 * on the page, since it names the pattern. */
export function FenceLine({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg width="100%" height="56" className={className} aria-hidden>
      <defs>
        <pattern id={id} width="72" height="56" patternUnits="userSpaceOnUse">
          <path
            d="M8 14 L13 6 L18 14 L18 56 L8 56 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinejoin="round"
          />
        </pattern>
      </defs>
      <line x1="0" x2="100%" y1="22" y2="22" stroke="currentColor" strokeWidth="2.25" />
      <line x1="0" x2="100%" y1="40" y2="40" stroke="currentColor" strokeWidth="2.25" />
      <rect width="100%" height="56" fill={`url(#${id})`} />
    </svg>
  );
}

/** Seed, young plant, grain head: markers for a three-step sequence where
 * each step builds on the last. */
export function GrowthStage({ stage, className = "" }: { stage: 1 | 2 | 3; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 42 L42 42" opacity="0.5" />
      {stage === 1 && (
        <>
          <ellipse cx="24" cy="45" rx="3" ry="1.5" opacity="0.6" />
          <path d="M24 42 L24 33" />
          <path d="M24 36 Q18 35 16 29 Q22 29 24 34" />
          <path d="M24 34 Q30 31 32 26 Q26 26 24 31" />
        </>
      )}
      {stage === 2 && (
        <>
          <path d="M24 42 L24 18" />
          <path d="M24 37 Q16 36 12 29 Q20 28 24 34" />
          <path d="M24 33 Q32 31 36 24 Q28 23 24 30" />
          <path d="M24 26 Q18 24 16 18 Q22 18 24 23" />
          <path d="M24 22 Q30 20 32 14 Q26 14 24 19" />
        </>
      )}
      {stage === 3 && (
        <>
          <path d="M24 42 L24 8" />
          <path d="M24 38 Q17 37 13 31 Q20 30 24 35" />
          <path d="M24 34 Q31 32 35 26 Q28 25 24 31" />
          {[10, 15, 20].map((y) => (
            <g key={y}>
              <path d={`M24 ${y + 4} Q19 ${y + 2} 18 ${y - 3}`} />
              <path d={`M24 ${y + 4} Q29 ${y + 2} 30 ${y - 3}`} />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}

/** Crop rows converging on a vanishing point, as a faint section texture. */
export function CropRows({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="none" fill="none" className={className} aria-hidden>
      {Array.from({ length: 19 }).map((_, i) => (
        <path
          key={i}
          d={`M600 -40 L${-525 + i * 125} 400`}
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/** Windmill, barn, and a few stalks on a hill line, for page endings. */
export function FarmScene({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`relative h-56 w-full overflow-hidden ${className}`}>
      <Windmill className="absolute bottom-8 left-[14%] h-44 w-auto text-soil/45" />
      <BarnSilhouette className="absolute bottom-8 left-1/2 h-28 w-auto -translate-x-1/2 text-soil/55" />
      <CornStalk className="absolute bottom-8 right-[18%] h-24 w-auto text-crop/60" />
      <CornStalk className="absolute bottom-8 right-[13%] h-28 w-auto text-crop/50" />
      <CornStalk className="absolute bottom-8 right-[8%] h-20 w-auto text-crop/60" />
      <RollingHills className="absolute inset-x-0 bottom-0 block h-14 w-full text-soil/15" />
    </div>
  );
}
