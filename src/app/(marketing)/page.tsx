import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mic, Languages, MapPin, Camera, MessageSquare, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/marketing/Reveal";
import { HeroVoiceDemo } from "@/components/marketing/HeroVoiceDemo";
import { FaqItem } from "@/components/FaqItem";
import {
  CornStalk,
  CropRows,
  GrowthStage,
  RollingHills,
  WheatSprig,
  Windmill,
} from "@/components/marketing/FarmIllustrations";
import { FieldStrip } from "@/components/marketing/FieldStrip";
import { FieldScan } from "@/components/marketing/FieldScan";
import { PHOTOS } from "@/lib/photos";
import { getI18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

const FEATURES = [
  { key: "tagging", icon: ShieldCheck, color: "text-crop", ring: "bg-crop/10" },
  { key: "locations", icon: MapPin, color: "text-clay", ring: "bg-clay/10" },
  { key: "photos", icon: Camera, color: "text-harvest", ring: "bg-harvest/15" },
  { key: "handsFree", icon: Mic, color: "text-crop", ring: "bg-crop/10" },
  { key: "languages", icon: Languages, color: "text-sky", ring: "bg-sky/10" },
  { key: "board", icon: MessageSquare, color: "text-sky", ring: "bg-sky/10" },
] as const;

const STEPS = ["capture", "structure", "ready"] as const;
const FAQS = ["replace", "auditReady", "languages", "data", "trial"] as const;

export default async function LandingPage() {
  const user = await getCurrentUser();
  const { lang, t } = await getI18n();
  const h = t.home;
  const [logCount, employeeCount, fieldCount] = await Promise.all([
    prisma.employeeLog.count(),
    prisma.employee.count(),
    prisma.employeeLog.findMany({ distinct: ["field"], select: { field: true } }).then((r) => r.length),
  ]);

  const ctaHref = user ? "/dashboard" : "/signup";
  const ctaLabel = user ? h.hero.goToDashboard : h.hero.getStarted;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-soil px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 78% 28%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%)",
          }}
        />
        {/* Short enough to stay below the CTAs: these grow out of the hill
            line, they aren't meant to cross the copy. */}
        <CornStalk className="pointer-events-none absolute -bottom-6 left-[4%] h-32 w-auto text-harvest/40 sm:h-40" />
        <CornStalk className="pointer-events-none absolute -bottom-10 left-[10%] hidden h-44 w-auto text-wheat/30 sm:block" />
        <WheatSprig className="pointer-events-none absolute -bottom-4 left-[17%] hidden h-28 w-auto text-crop/40 md:block" />
        <Windmill className="pointer-events-none absolute right-[2%] bottom-6 hidden h-80 w-auto text-wheat/20 lg:block" />
        <RollingHills className="pointer-events-none absolute inset-x-0 bottom-0 block h-16 w-full text-wheat sm:h-20" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="font-eyebrow text-[11px] tracking-widest text-harvest uppercase">
              {h.hero.eyebrow}
            </div>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] text-wheat sm:text-6xl">
              {h.hero.titleStart}{" "}
              <span className="text-crop italic">{h.hero.titleEmphasis}</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg text-wheat/70">{h.hero.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={ctaHref}
                className="flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                {ctaLabel}
                <ArrowRight size={15} />
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="rounded-full border border-wheat/25 px-6 py-3 text-sm font-medium text-wheat hover:bg-wheat/10"
                >
                  {h.hero.haveAccount}
                </Link>
              )}
            </div>
          </div>
          {/* Keyed by language so switching the page language also resets
              the demo to that language's examples and recognizer, rather
              than leaving the card on whatever it mounted with. */}
          <HeroVoiceDemo key={lang} />
        </div>
      </section>

      {/* Problem statement */}
      <Reveal>
        <section className="border-b border-soil/10 px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src={PHOTOS.workersInField}
                alt={t.photos.workersInField}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
              {/* What the product adds to this scene: the work gets
                  recorded where it happens, not reconstructed later. */}
              <div className="absolute bottom-4 left-4 rounded-2xl bg-wheat/95 px-4 py-3 shadow-lg backdrop-blur">
                <div className="flex items-center gap-1.5 font-eyebrow text-[10px] tracking-widest text-soil/50 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-crop" />
                  {h.problem.chipLabel}
                </div>
                <div className="mt-1 text-sm font-medium text-soil">{h.problem.chipValue}</div>
              </div>
            </div>
            <div>
              <p className="font-display text-2xl text-soil italic sm:text-3xl">
                &ldquo;{h.problem.quote}&rdquo;
              </p>
              <p className="mt-5 text-soil/60">{h.problem.body}</p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* How it works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="font-eyebrow text-[11px] tracking-widest text-accent uppercase">
              {h.how.eyebrow}
            </div>
            <h2 className="mt-2 font-display text-4xl text-soil">{h.how.title}</h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step} delay={i * 0.1}>
                <GrowthStage stage={(i + 1) as 1 | 2 | 3} className="mb-3 h-12 w-12 text-crop" />
                <div className="flex items-center gap-2 font-eyebrow text-xs text-soil/40">
                  <span>0{i + 1}</span>
                  <span className="h-px flex-1 bg-soil/10" />
                </div>
                <h3 className="mt-4 font-display text-xl text-soil">{h.how[step].title}</h3>
                <p className="mt-2 text-sm text-soil/60">{h.how[step].body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FieldScan />

      {/* Feature grid */}
      <section className="bg-soil/[0.03] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="font-eyebrow text-[11px] tracking-widest text-accent uppercase">
              {h.features.eyebrow}
            </div>
            <h2 className="mt-2 font-display text-4xl text-soil">{h.features.title}</h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.key} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-2xl border border-soil/10 bg-wheat p-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${f.ring}`}>
                    <f.icon size={18} className={f.color} />
                  </div>
                  <h3 className="mt-4 font-semibold text-soil">{h.features[f.key].title}</h3>
                  <p className="mt-1.5 text-sm text-soil/60">{h.features[f.key].body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Live stats */}
      <Reveal>
        <section className="relative overflow-hidden px-6 py-24">
          <CropRows className="pointer-events-none absolute inset-0 h-full w-full text-soil/[0.055] [mask-image:linear-gradient(to_bottom,transparent,black_60%)]" />
          <div className="relative mx-auto max-w-6xl text-center">
            <div className="font-eyebrow text-[11px] tracking-widest text-accent uppercase">
              {h.stats.eyebrow}
            </div>
            <h2 className="mt-2 font-display text-4xl text-soil">{h.stats.title}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-soil/50">{h.stats.body}</p>
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { value: logCount, label: h.stats.logs },
                { value: employeeCount, label: h.stats.workers },
                { value: fieldCount, label: h.stats.fields },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-soil/10 bg-wheat p-8">
                  <div className="font-display text-4xl text-accent">{stat.value}</div>
                  <div className="mt-1 text-sm text-soil/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Testimonial */}
      <Reveal>
        <RollingHills className="-mb-px block h-14 w-full text-soil sm:h-20" />
        <section className="relative overflow-hidden bg-soil px-6 pt-16 pb-32">
          <WheatSprig className="pointer-events-none absolute top-1/2 left-6 h-40 w-auto -translate-y-1/2 text-harvest/45 sm:left-12" />
          <WheatSprig className="pointer-events-none absolute top-1/2 right-6 h-40 w-auto -translate-y-1/2 scale-x-[-1] text-harvest/45 sm:right-12" />
          <RollingHills className="pointer-events-none absolute inset-x-0 bottom-0 block h-14 w-full text-wheat sm:h-20" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="font-display text-2xl text-wheat italic sm:text-3xl">
              &ldquo;{h.testimonial.quote}&rdquo;
            </p>
            <p className="mt-4 font-eyebrow text-xs tracking-widest text-wheat/40 uppercase">
              {h.testimonial.attribution}
            </p>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <Reveal>
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl text-soil">{h.faq.title}</h2>
            <div className="mt-6">
              {FAQS.map((key) => (
                <FaqItem key={key} question={h.faq[key].q} answer={h.faq[key].a} />
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Final CTA */}
      <section className="px-6 pt-24 pb-2">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl text-soil">{h.finalCta.title}</h2>
          <p className="mt-3 text-soil/60">{h.finalCta.body}</p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            {ctaLabel}
            <ArrowRight size={15} />
          </Link>
        </Reveal>
      </section>

      <FieldStrip />
    </div>
  );
}
