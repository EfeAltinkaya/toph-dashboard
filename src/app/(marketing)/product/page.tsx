import { Mic, Languages, MapPin, Camera, ShieldCheck, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import {
  FenceLine,
  RollingHills,
  WheatSprig,
  Windmill,
} from "@/components/marketing/FarmIllustrations";

const SECTIONS = [
  {
    icon: Mic,
    eyebrow: "01 / Recording",
    title: "A conversation, not a form.",
    body: "A worker taps record and talks the way they already describe their day. Toph listens continuously and captures the activity, the field, and the time without a single dropdown.",
    color: "text-crop",
    bg: "bg-crop/10",
  },
  {
    icon: Languages,
    eyebrow: "02 / Understanding",
    title: "It doesn't need English to understand you.",
    body: "Recognition runs in the worker's own language. A Spanish-speaking crew member is heard as accurately as an English-speaking one, and the record can be translated for whoever reviews it later.",
    color: "text-sky",
    bg: "bg-sky/10",
  },
  {
    icon: MapPin,
    eyebrow: "03 / Location",
    title: "Every log knows where it happened.",
    body: "Logs are pinned to real field coordinates on a live satellite map, so 'field A' means an actual polygon on the ground, not a label someone has to remember.",
    color: "text-clay",
    bg: "bg-clay/10",
  },
  {
    icon: Camera,
    eyebrow: "04 / Evidence",
    title: "A photo turns a claim into proof.",
    body: "Attach a picture straight from the recording flow. When an inspector asks what a treated block looked like that morning, you have an answer instead of a guess.",
    color: "text-harvest",
    bg: "bg-harvest/15",
  },
  {
    icon: ShieldCheck,
    eyebrow: "05 / Review",
    title: "Flag it once, find it forever.",
    body: "Tag anything that needs a second look and it surfaces automatically under Audit Manager, already filtered, already dated, already attributed.",
    color: "text-crop",
    bg: "bg-crop/10",
  },
  {
    icon: MessageSquare,
    eyebrow: "06 / Coordination",
    title: "One board the whole crew actually reads.",
    body: "Post an update once and everyone with an account sees it, replacing the group chat that half the team has muted.",
    color: "text-sky",
    bg: "bg-sky/10",
  },
];

export default function ProductPage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-soil px-6 pt-20 pb-32 text-center">
        <WheatSprig className="pointer-events-none absolute top-1/2 left-6 z-0 h-36 w-auto -translate-y-1/2 text-harvest/40 sm:left-16" />
        <Windmill className="pointer-events-none absolute right-4 bottom-8 z-0 hidden h-64 w-auto text-wheat/25 md:block lg:right-16" />
        <RollingHills className="pointer-events-none absolute inset-x-0 bottom-0 z-0 block h-14 w-full text-wheat sm:h-20" />
        <div className="relative z-10 font-eyebrow text-[11px] tracking-widest text-harvest uppercase">
          Product
        </div>
        <h1 className="relative z-10 mx-auto mt-4 max-w-2xl font-display text-5xl text-wheat">
          One system, from what happens in the field to the document an
          auditor signs off on.
        </h1>
        <p className="relative z-10 mx-auto mt-5 max-w-xl text-wheat/70">
          Every piece below is live in the dashboard today, not a roadmap
          item.
        </p>
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
            <Reveal key={s.title} delay={(i % 2) * 0.05}>
              <div className="flex gap-6">
                <div className="relative shrink-0 rounded-full bg-wheat">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${s.bg}`}>
                    <s.icon size={22} className={s.color} />
                  </div>
                </div>
                <div>
                  <div className="font-eyebrow text-[11px] tracking-widest text-soil/40 uppercase">
                    {s.eyebrow}
                  </div>
                  <h2 className="mt-1 font-display text-2xl text-soil">{s.title}</h2>
                  <p className="mt-2 max-w-xl text-soil/60">{s.body}</p>
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
