import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FIELD_COORDS } from "@/lib/fields";
import { PHOTOS } from "@/lib/photos";
import { getI18n } from "@/i18n/server";
import { format, tr } from "@/i18n";

const CELL = 64;

// Mapped plots, placed in whole grid cells so their borders land exactly on
// the grid lines behind them. Each only appears at widths where it sits
// clear of the copy on the left.
const PLOTS = [
  { field: "Field A", reading: "plotA", col: 11, row: 2, w: 4, h: 3, show: "hidden lg:block", delay: "0s", crosshair: true, labelRight: false },
  { field: "Field C", reading: "plotC", col: 13, row: 6, w: 2, h: 2, show: "hidden lg:block", delay: "1.1s", crosshair: false, labelRight: false },
  // Nearest the right edge, so its label hangs off the box's right side
  // instead of running past the viewport.
  { field: "Field B", reading: "plotB", col: 16, row: 3, w: 3, h: 2, show: "hidden xl:block", delay: "2.2s", crosshair: false, labelRight: true },
] as const;

function formatCoord(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

function CornerTicks() {
  const tick = "absolute h-2.5 w-2.5 border-scan";
  return (
    <>
      <span className={`${tick} -top-px -left-px border-t-2 border-l-2`} />
      <span className={`${tick} -top-px -right-px border-t-2 border-r-2`} />
      <span className={`${tick} -bottom-px -left-px border-b-2 border-l-2`} />
      <span className={`${tick} -right-px -bottom-px border-r-2 border-b-2`} />
    </>
  );
}

/**
 * A real aerial field photo with a live-looking data grid over it: the
 * visual version of what Toph does, turning ground into records. The plot
 * labels use the demo farm's actual field coordinates.
 */
export async function FieldScan() {
  const { t } = await getI18n();
  const fieldA = FIELD_COORDS["Field A"];

  return (
    <section className="relative isolate min-h-[36rem] overflow-hidden bg-soil">
      <Image
        src={PHOTOS.fieldRowsAerial}
        alt={t.photos.fieldRowsAerial}
        fill
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {/* Darkest on the left where the copy sits, clearer on the right
          where the plots are, so the photo still reads as a field. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-soil via-soil/80 to-soil/30" />

      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,transparent_15%,black_55%)]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--scan) 28%, transparent) 1px, transparent 1px)," +
            "linear-gradient(90deg, color-mix(in srgb, var(--scan) 28%, transparent) 1px, transparent 1px)",
          backgroundSize: `${CELL}px ${CELL}px`,
        }}
      />

      <div aria-hidden className="toph-scan pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-scan/20" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-scan/80" />
      </div>

      {PLOTS.map((plot) => (
        <div
          key={plot.field}
          aria-hidden
          className={`${plot.show} toph-plot absolute -z-10 border border-scan/50`}
          style={{
            left: plot.col * CELL,
            top: plot.row * CELL,
            width: plot.w * CELL,
            height: plot.h * CELL,
            animationDelay: plot.delay,
          }}
        >
          <CornerTicks />
          <div
            className={`absolute -top-7 font-eyebrow text-[10px] tracking-widest whitespace-nowrap text-scan uppercase ${
              plot.labelRight ? "right-0" : "left-0"
            }`}
          >
            <span className="rounded bg-soil/80 px-1.5 py-0.5">
              {tr(t.vocab.fields, plot.field)} · {t.fieldScan[plot.reading]}
            </span>
          </div>
          {plot.crosshair && (
            <div className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute top-1/2 left-0 h-px w-full bg-scan" />
              <span className="absolute top-0 left-1/2 h-full w-px bg-scan" />
              <span className="absolute inset-2 rounded-full border border-scan" />
            </div>
          )}
        </div>
      ))}

      <div className="mx-auto flex min-h-[36rem] max-w-6xl items-center px-6 py-20">
        <div className="max-w-md">
          <div className="font-eyebrow text-[11px] tracking-widest text-scan uppercase">
            {t.fieldScan.eyebrow}
          </div>
          <h2 className="mt-3 font-display text-4xl leading-tight text-wheat sm:text-5xl">
            {t.fieldScan.title}
          </h2>
          <p className="mt-4 text-wheat/70">{t.fieldScan.body}</p>
          <dl className="mt-6 space-y-1.5 font-eyebrow text-[11px] tracking-widest text-wheat/50 uppercase">
            <div className="flex gap-3">
              <dt className="text-scan">{tr(t.vocab.fields, "Field A")}</dt>
              <dd>
                {formatCoord(fieldA.lat, "N", "S")} · {formatCoord(fieldA.lng, "E", "W")}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-scan">{t.fieldScan.mapped}</dt>
              <dd>{format(t.fieldScan.mappedValue, { count: Object.keys(FIELD_COORDS).length })}</dd>
            </div>
          </dl>
          <Link
            href="/product"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-wheat/25 px-5 py-2.5 text-sm font-medium text-wheat hover:bg-wheat/10"
          >
            {t.fieldScan.cta} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
