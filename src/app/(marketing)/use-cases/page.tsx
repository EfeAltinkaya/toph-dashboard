import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";
import { CornStalk, FarmScene, RollingHills } from "@/components/marketing/FarmIllustrations";
import { PHOTOS } from "@/lib/photos";

const CASES = [
  {
    tag: "Multi-language crews",
    title: "A crew that speaks three languages between them.",
    body: "Nobody has to switch to English to be understood. Every worker records in whatever language they think in, and the office reads it in whichever language they need.",
    photo: PHOTOS.paddyPlowing,
  },
  {
    tag: "Spray & chemical compliance",
    title: "Prove exactly what went on which field, and when.",
    body: "A spray log captured the moment it happened, with a field pin and a timestamp, holds up a lot better under audit than a memory from three weeks ago.",
    photo: PHOTOS.tractorPlanting,
  },
  {
    tag: "Multi-field operations",
    title: "Four fields or forty, the record looks the same.",
    body: "Every field gets its own coordinates on the map. Scaling up doesn't mean inventing a new spreadsheet tab for every new block.",
    photo: PHOTOS.coveredRows,
  },
  {
    tag: "Audit season",
    title: "Stop reconstructing the season from memory.",
    body: "When the inspector calls, the season's activity is already organized by employee, field, and date, not waiting to be assembled the night before.",
    photo: PHOTOS.workerCarryingFlat,
  },
];

export default function UseCasesPage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-soil px-6 pt-20 pb-32 text-center">
        <CornStalk className="pointer-events-none absolute bottom-6 left-[8%] z-0 h-40 w-auto text-harvest/35" />
        <CornStalk className="pointer-events-none absolute bottom-4 left-[14%] z-0 hidden h-32 w-auto text-wheat/25 sm:block" />
        <CornStalk className="pointer-events-none absolute bottom-6 right-[8%] z-0 h-44 w-auto scale-x-[-1] text-wheat/30" />
        <RollingHills className="pointer-events-none absolute inset-x-0 bottom-0 z-0 block h-14 w-full text-wheat sm:h-20" />
        <div className="relative z-10 font-eyebrow text-[11px] tracking-widest text-harvest uppercase">
          Use cases
        </div>
        <h1 className="relative z-10 mx-auto mt-4 max-w-2xl font-display text-5xl text-wheat">
          Built for how a real operation actually runs.
        </h1>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
          {CASES.map((c, i) => (
            <Reveal key={c.tag} delay={(i % 2) * 0.08}>
              <div className="group h-full overflow-hidden rounded-2xl border border-soil/10 bg-wheat">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={c.photo.src}
                    alt={c.photo.alt}
                    fill
                    sizes="(min-width: 640px) 480px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-8">
                  <div className="font-eyebrow text-[11px] tracking-widest text-accent uppercase">
                    {c.tag}
                  </div>
                  <h2 className="mt-3 font-display text-2xl text-soil">{c.title}</h2>
                  <p className="mt-2 text-sm text-soil/60">{c.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <FarmScene />
    </div>
  );
}
