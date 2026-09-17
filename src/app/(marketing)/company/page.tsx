import Image from "next/image";
import { Reveal } from "@/components/marketing/Reveal";
import { PHOTOS } from "@/lib/photos";
import {
  BarnSilhouette,
  RollingHills,
  WheatSprig,
  Windmill,
} from "@/components/marketing/FarmIllustrations";

const VALUES = [
  {
    title: "The field comes first.",
    body: "Every decision starts with whether it makes a worker's day easier, not whether it makes a report look more impressive.",
  },
  {
    title: "Language shouldn't be a barrier to being believed.",
    body: "A log recorded in Spanish is exactly as valid as one recorded in English. Translation exists so the office understands, not so the worker has to accommodate.",
  },
  {
    title: "Compliance should be a byproduct, not a chore.",
    body: "If keeping a record takes more effort than doing the work itself, most people won't keep it. Toph exists to close that gap.",
  },
];

export default function CompanyPage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-soil px-6 pt-20 pb-32 text-center">
        <WheatSprig className="pointer-events-none absolute top-1/2 left-6 z-0 h-36 w-auto -translate-y-1/2 text-harvest/40 sm:left-16" />
        <WheatSprig className="pointer-events-none absolute top-1/2 right-6 z-0 h-36 w-auto -translate-y-1/2 scale-x-[-1] text-harvest/40 sm:right-16" />
        <RollingHills className="pointer-events-none absolute inset-x-0 bottom-0 z-0 block h-14 w-full text-wheat sm:h-20" />
        <div className="relative z-10 font-eyebrow text-[11px] tracking-widest text-harvest uppercase">
          Company
        </div>
        <h1 className="relative z-10 mx-auto mt-4 max-w-2xl font-display text-5xl text-wheat">
          Contextualizing farm compliance, one conversation at a time.
        </h1>
        <p className="relative z-10 mx-auto mt-5 max-w-xl text-wheat/70">
          Agriculture is one of the most heavily regulated industries in the
          United States, yet most farms still rely on fragmented, manual
          systems using paper logs. We think the fix starts with how the
          record gets made, not with another form.
        </p>
      </section>

      <div className="px-6 pt-16">
        <figure className="mx-auto max-w-6xl">
          <div className="relative aspect-[21/9] overflow-hidden rounded-3xl">
            <Image
              src={PHOTOS.tendingCrops.src}
              alt={PHOTOS.tendingCrops.alt}
              fill
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 font-eyebrow text-[11px] tracking-widest text-soil/45 uppercase">
            The record starts here, not in the office.
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
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <h2 className="font-display text-2xl text-soil">{v.title}</h2>
                <p className="mt-2 text-soil/60">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Reveal>
        <section className="border-t border-soil/10 px-6 py-16 text-center">
          <p className="mx-auto max-w-xl text-sm text-soil/50">
            This build of Toph was made as a developer take-home for LavaLab,
            USC&apos;s engineering entrepreneurship club, inspired by the real
            Toph, a Spring 2026 LavaLab startup solving exactly this problem.
          </p>
        </section>
      </Reveal>
    </div>
  );
}
