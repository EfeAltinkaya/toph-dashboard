import { Mic, Languages, MapPin, Camera, ShieldCheck, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import {
  FenceLine,
  RollingHills,
  WheatSprig,
  Windmill,
} from "@/components/marketing/FarmIllustrations";
import { getI18n } from "@/i18n/server";

const SECTIONS = [
  { key: "recording", icon: Mic, color: "text-crop", bg: "bg-crop/10" },
  { key: "understanding", icon: Languages, color: "text-sky", bg: "bg-sky/10" },
  { key: "location", icon: MapPin, color: "text-clay", bg: "bg-clay/10" },
  { key: "evidence", icon: Camera, color: "text-harvest", bg: "bg-harvest/15" },
  { key: "review", icon: ShieldCheck, color: "text-crop", bg: "bg-crop/10" },
  { key: "coordination", icon: MessageSquare, color: "text-sky", bg: "bg-sky/10" },
] as const;

export default async function ProductPage() {
  const { t } = await getI18n();
  const p = t.product;

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-soil px-6 pt-20 pb-32 text-center">
        <WheatSprig className="pointer-events-none absolute top-1/2 left-6 z-0 h-36 w-auto -translate-y-1/2 text-harvest/40 sm:left-16" />
        <Windmill className="pointer-events-none absolute right-4 bottom-8 z-0 hidden h-64 w-auto text-wheat/25 md:block lg:right-16" />
        <RollingHills className="pointer-events-none absolute inset-x-0 bottom-0 z-0 block h-14 w-full text-wheat sm:h-20" />
        <div className="relative z-10 font-eyebrow text-[11px] tracking-widest text-harvest uppercase">
          {p.eyebrow}
        </div>
        <h1 className="relative z-10 mx-auto mt-4 max-w-2xl font-display text-5xl text-wheat">
          {p.title}
        </h1>
        <p className="relative z-10 mx-auto mt-5 max-w-xl text-wheat/70">{p.body}</p>
      </section>

      <section className="px-6 py-24">
        <div className="relative mx-auto max-w-4xl space-y-16">
          {/* The six steps are one pipeline, so they hang off a single
              furrow line rather than floating as separate blocks. */}
          <div
            aria-hidden
            className="absolute top-6 bottom-6 left-6 border-l-2 border-dashed border-crop/30"
          />
          {SECTIONS.map((s, i) => (
            <Reveal key={s.key} delay={(i % 2) * 0.05}>
              <div className="flex gap-6">
                <div className="relative shrink-0 rounded-full bg-wheat">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${s.bg}`}>
                    <s.icon size={22} className={s.color} />
                  </div>
                </div>
                <div>
                  <div className="font-eyebrow text-[11px] tracking-widest text-soil/40 uppercase">
                    {p[s.key].eyebrow}
                  </div>
                  <h2 className="mt-1 font-display text-2xl text-soil">{p[s.key].title}</h2>
                  <p className="mt-2 max-w-xl text-soil/60">{p[s.key].body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="px-6 pb-4">
        <FenceLine id="product-fence" className="text-soil/25" />
      </div>
    </div>
  );
}
