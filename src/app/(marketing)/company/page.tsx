import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";
import { PHOTOS } from "@/lib/photos";
import {
  BarnSilhouette,
  RollingHills,
  WheatSprig,
  Windmill,
} from "@/components/marketing/FarmIllustrations";
import { getI18n } from "@/i18n/server";

const VALUES = ["field", "language", "byproduct"] as const;

export default async function CompanyPage() {
  const { t } = await getI18n();
  const c = t.company;

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-soil px-6 pt-20 pb-32 text-center">
        <WheatSprig className="pointer-events-none absolute top-1/2 left-6 z-0 h-36 w-auto -translate-y-1/2 text-harvest/40 sm:left-16" />
        <WheatSprig className="pointer-events-none absolute top-1/2 right-6 z-0 h-36 w-auto -translate-y-1/2 scale-x-[-1] text-harvest/40 sm:right-16" />
        <RollingHills className="pointer-events-none absolute inset-x-0 bottom-0 z-0 block h-14 w-full text-wheat sm:h-20" />
        <div className="relative z-10 font-eyebrow text-[11px] tracking-widest text-harvest uppercase">
          {c.eyebrow}
        </div>
        <h1 className="relative z-10 mx-auto mt-4 max-w-2xl font-display text-5xl text-wheat">
          {c.title}
        </h1>
        <p className="relative z-10 mx-auto mt-5 max-w-xl text-wheat/70">{c.body}</p>
      </section>

      <div className="px-6 pt-16">
        <figure className="mx-auto max-w-6xl">
          <div className="relative aspect-[21/9] overflow-hidden rounded-3xl">
            <Image
              src={PHOTOS.tendingCrops}
              alt={t.photos.tendingCrops}
              fill
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 font-eyebrow text-[11px] tracking-widest text-soil/45 uppercase">
            {c.photoCaption}
          </figcaption>
        </figure>
      </div>

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[240px_1fr]">
          <div aria-hidden className="hidden lg:block">
            <div className="sticky top-28 flex items-end gap-2">
              <Windmill className="h-72 w-auto text-crop/60" />
              <BarnSilhouette className="mb-0.5 h-20 w-auto text-soil/35" />
            </div>
          </div>
          <div className="space-y-12">
            {VALUES.map((key, i) => (
              <Reveal key={key} delay={i * 0.08}>
                <h2 className="font-display text-2xl text-soil">{c[key].title}</h2>
                <p className="mt-2 text-soil/60">{c[key].body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Reveal>
        <section className="border-t border-soil/10 px-6 py-16 text-center">
          <p className="mx-auto max-w-xl text-sm text-soil/50">{c.note}</p>
        </section>
      </Reveal>
    </div>
  );
}
