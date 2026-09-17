"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { CornStalk, FenceLine } from "./FarmIllustrations";

function Wheel({
  cx,
  cy,
  r,
  rotate,
}: {
  cx: number;
  cy: number;
  r: number;
  rotate: MotionValue<number> | number;
}) {
  return (
    // Motion rotates SVG groups around their own bounding-box center, and
    // a wheel is symmetric about its hub, so no explicit origin is needed.
    <motion.g style={{ rotate }}>
      <circle cx={cx} cy={cy} r={r} />
      <circle cx={cx} cy={cy} r={r - 4} strokeDasharray="3 4" opacity="0.5" />
      <circle cx={cx} cy={cy} r={r * 0.28} />
      {[0, 60, 120].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const dx = Math.cos(rad) * r * 0.78;
        const dy = Math.sin(rad) * r * 0.78;
        return (
          <path
            key={deg}
            d={`M${(cx - dx).toFixed(1)} ${(cy - dy).toFixed(1)} L${(cx + dx).toFixed(1)} ${(cy + dy).toFixed(1)}`}
          />
        );
      })}
    </motion.g>
  );
}

function Tractor({ rotate }: { rotate: MotionValue<number> | number }) {
  return (
    <svg
      viewBox="-14 0 174 97"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-auto w-full"
    >
      {/* dust kicked up behind the rear wheel */}
      <circle cx="-4" cy="88" r="4" opacity="0.35" />
      <circle cx="-10" cy="80" r="2.5" opacity="0.25" />
      <path d="M22 14 L76 14 M28 14 L24 50 M70 14 L78 50" />
      <path d="M34 20 L64 20 L70 42 L33 42 Z" opacity="0.55" />
      <path d="M52 42 L60 32 M56 30 L65 34" opacity="0.7" />
      <path d="M78 50 L140 53 Q150 55 150 63 L150 72 L143 72" />
      <path d="M139 58 L146 60 M139 63 L146 65" opacity="0.5" />
      <path d="M118 51 L118 26 M114 26 L122 26" />
      <path d="M14 60 Q42 34 70 60" />
      <path d="M66 68 L114 76" />
      <Wheel cx={42} cy={72} r={24} rotate={rotate} />
      <Wheel cx={128} cy={82} r={14} rotate={rotate} />
    </svg>
  );
}

const STALK_HEIGHTS = ["h-14", "h-20", "h-16", "h-24", "h-16", "h-20", "h-14", "h-24", "h-[4.5rem]"];

/**
 * A tractor that works its way across the field as the visitor scrolls
 * past, leaving plowed rows behind it. Tied to scroll position rather than
 * a timer, so it moves at the reader's pace, stops when they stop, and
 * reverses if they scroll back up.
 */
export function FieldStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // Scroll range in page pixels: from the moment the strip's top enters the
  // viewport to the very bottom of the page. The strip sits at the end of
  // the page, so the usual "until it scrolls back out the top" range can
  // never be reached — the page runs out first and the tractor stalls
  // partway across.
  const range = useRef({ start: 0, end: 1 });

  useEffect(() => {
    function measure() {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const start = top - window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      range.current = { start, end: Math.max(maxScroll, start + 1) };
    }
    measure();
    window.addEventListener("resize", measure);
    // Page height changes after mount too (fonts loading, an FAQ opening).
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (y) => {
    const { start, end } = range.current;
    return Math.min(1, Math.max(0, (y - start) / (end - start)));
  });
  const left = useTransform(progress, [0, 1], ["-14%", "86%"]);
  const plowed = useTransform(progress, [0, 1], ["0%", "86%"]);
  // Roughly one full turn per stretch of ground the wheel actually covers.
  const rotate = useTransform(progress, [0, 1], [0, 1440]);

  return (
    <div ref={ref} aria-hidden className="relative h-44 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-around px-6">
        {STALK_HEIGHTS.map((height, i) => (
          <CornStalk key={i} className={`${height} w-auto text-crop/35`} />
        ))}
      </div>
      <FenceLine id="field-strip-fence" className="absolute inset-x-0 bottom-0 text-soil/20" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-soil/25" />
      <motion.div
        style={{ width: reduceMotion ? "0%" : plowed }}
        className="absolute bottom-0 left-0 h-1.5 bg-[repeating-linear-gradient(90deg,var(--soil)_0_12px,transparent_12px_18px)] opacity-40"
      />
      <motion.div
        style={{ left: reduceMotion ? "44%" : left }}
        className="absolute bottom-0 w-36 text-soil sm:w-44"
      >
        <Tractor rotate={reduceMotion ? 0 : rotate} />
      </motion.div>
    </div>
  );
}
