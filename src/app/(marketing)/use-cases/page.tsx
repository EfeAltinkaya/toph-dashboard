import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";
import { CornStalk, FarmScene, RollingHills } from "@/components/marketing/FarmIllustrations";
import { PHOTOS } from "@/lib/photos";
import { getI18n } from "@/i18n/server";

const CASES = [
  { key: "crews", photo: "paddyPlowing" },
  { key: "spray", photo: "tractorPlanting" },
  { key: "multiField", photo: "coveredRows" },
  { key: "audit", photo: "workerCarryingFlat" },
] as const;

export default async function UseCasesPage() {
  const { t } = await getI18n();
  const u = t.useCases;

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-soil px-6 pt-20 pb-32 text-center">
        <CornStalk className="pointer-events-none absolute bottom-6 left-[8%] z-0 h-40 w-auto text-harvest/35" />
        <CornStalk className="pointer-events-none absolute bottom-4 left-[14%] z-0 hidden h-32 w-auto text-wheat/25 sm:block" />
        <CornStalk className="pointer-events-none absolute bottom-6 right-[8%] z-0 h-44 w-auto scale-x-[-1] text-wheat/30" />
        <RollingHills className="pointer-events-none absolute inset-x-0 bottom-0 z-0 block h-14 w-full text-wheat sm:h-20" />
        <div className="relative z-10 font-eyebrow text-[11px] tracking-widest text-harvest uppercase">
          {u.eyebrow}
        </div>
        <h1 className="relative z-10 mx-auto mt-4 max-w-2xl font-display text-5xl text-wheat">
          {u.title}
        </h1>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
          {CASES.map((c, i) => (
            <Reveal key={c.key} delay={(i % 2) * 0.08}>
              <div className="group h-full overflow-hidden rounded-2xl border border-soil/10 bg-wheat">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={PHOTOS[c.photo]}
                    alt={t.photos[c.photo]}
                    fill
                    sizes="(min-width: 640px) 480px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-8">
                  <div className="font-eyebrow text-[11px] tracking-widest text-accent uppercase">
                    {u[c.key].tag}
                  </div>
                  <h2 className="mt-3 font-display text-2xl text-soil">{u[c.key].title}</h2>
                  <p className="mt-2 text-sm text-soil/60">{u[c.key].body}</p>
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
