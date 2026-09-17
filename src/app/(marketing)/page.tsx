import Link from "next/link";
import { ArrowRight, Mic, Languages, MapPin, Camera, MessageSquare, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/marketing/Reveal";
import { HeroVoiceDemo } from "@/components/marketing/HeroVoiceDemo";
import { FaqItem } from "@/components/FaqItem";
import Image from "next/image";
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

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: ShieldCheck,
    color: "text-crop",
    ring: "bg-crop/10",
    title: "Audit-ready tagging",
    body: "Flag anything that needs a second look, and it surfaces automatically in Audit Manager, already dated and attributed.",
  },
  {
    icon: MapPin,
    color: "text-clay",
    ring: "bg-clay/10",
    title: "Real field locations",
    body: "Every log is pinned to an actual field on a live satellite map, so the record says exactly where the work happened.",
  },
  {
    icon: Camera,
    color: "text-harvest",
    ring: "bg-harvest/15",
    title: "Photo evidence",
    body: "Attach a photo straight from the log, so a compliance record isn't just a transcript, it's proof.",
  },
  {
    icon: Mic,
    color: "text-crop",
    ring: "bg-crop/10",
    title: "Hands-free reporting",
    body: "Workers report what they did by talking, from the field, on their phone, the moment it happens instead of days later on a form.",
  },
  {
    icon: Languages,
    color: "text-sky",
    ring: "bg-sky/10",
    title: "Understands every worker",
    body: "A log recorded in Spanish is captured just as accurately as one in English, so language is never why a record goes missing.",
  },
  {
    icon: MessageSquare,
    color: "text-sky",
    ring: "bg-sky/10",
    title: "One team board",
    body: "Post an update the whole crew sees, so coordination doesn't depend on a group text no one reads.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const [logCount, employeeCount, fieldCount] = await Promise.all([
    prisma.employeeLog.count(),
    prisma.employee.count(),
    prisma.employeeLog.findMany({ distinct: ["field"], select: { field: true } }).then((r) => r.length),
  ]);

  const ctaHref = user ? "/dashboard" : "/signup";
  const ctaLabel = user ? "Go to Dashboard" : "Get Started";

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
              Audit-ready, from the moment it happens
            </div>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] text-wheat sm:text-6xl">
              Turn a season of fieldwork into a{" "}
              <span className="text-crop italic">record that survives an audit</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg text-wheat/70">
              Toph captures what happens in the field at the source and turns
              it into a continuously updated system of record, so a
              compliance report is something you already have, not something
              you build the night before an inspection.
            </p>
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
                  I already have an account
                </Link>
              )}
            </div>
          </div>
          <HeroVoiceDemo />
        </div>
      </section>

      {/* Problem statement */}
      <Reveal>
        <section className="border-b border-soil/10 px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src={PHOTOS.workersInField.src}
                alt={PHOTOS.workersInField.alt}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
              {/* What the product adds to this scene: the work gets
                  recorded where it happens, not reconstructed later. */}
              <div className="absolute bottom-4 left-4 rounded-2xl bg-wheat/95 px-4 py-3 shadow-lg backdrop-blur">
                <div className="flex items-center gap-1.5 font-eyebrow text-[10px] tracking-widest text-soil/50 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-crop" />
                  Voice log captured
                </div>
                <div className="mt-1 text-sm font-medium text-soil">
                  Field B · Harvest · 6:42 AM
                </div>
              </div>
            </div>
            <div>
              <p className="font-display text-2xl text-soil italic sm:text-3xl">
                &ldquo;Agriculture is one of the most heavily regulated
                industries in the United States, yet most farms still rely on
                fragmented, manual systems using paper logs.&rdquo;
              </p>
              <p className="mt-5 text-soil/60">
                With audits landing 5&ndash;10 times a year, often with little
                notice, that means hundreds of hours spent reconstructing
                months of records by hand, pulled straight out of the field.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* How it works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="font-eyebrow text-[11px] tracking-widest text-accent uppercase">
              How Toph works
            </div>
            <h2 className="mt-2 font-display text-4xl text-soil">
              From what happened in the field to what an auditor can sign off on.
            </h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Capture at the source",
                body: "A worker reports what they did while they're still in the field, so the record starts as close to the work as possible, not as a memory from later.",
              },
              {
                n: "02",
                title: "Structure and enrich",
                body: "Toph processes that report against workflow context and farm data, turning it into a structured log with audit regulations already in mind.",
              },
              {
                n: "03",
                title: "Audit-ready, always",
                body: "The result is a continuously updated system of record. When an inspection comes up, nothing has to be reconstructed by hand.",
              },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1}>
                <GrowthStage stage={(i + 1) as 1 | 2 | 3} className="mb-3 h-12 w-12 text-crop" />
                <div className="flex items-center gap-2 font-eyebrow text-xs text-soil/40">
                  <span>{step.n}</span>
                  <span className="h-px flex-1 bg-soil/10" />
                </div>
                <h3 className="mt-4 font-display text-xl text-soil">{step.title}</h3>
                <p className="mt-2 text-sm text-soil/60">{step.body}</p>
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
              What&apos;s built in
            </div>
            <h2 className="mt-2 font-display text-4xl text-soil">
              Everything it takes to make the record hold up.
            </h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-2xl border border-soil/10 bg-wheat p-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${f.ring}`}>
                    <f.icon size={18} className={f.color} />
                  </div>
                  <h3 className="mt-4 font-semibold text-soil">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-soil/60">{f.body}</p>
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
              Right now, in this demo
            </div>
            <h2 className="mt-2 font-display text-4xl text-soil">
              A system of record, not a mockup.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-soil/50">
              These numbers are pulled live from the same database the
              dashboard, and any compliance report, reads from.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { value: logCount, label: "Logged activities" },
                { value: employeeCount, label: "Workers tracked" },
                { value: fieldCount, label: "Fields monitored" },
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
              &ldquo;Our last audit used to take a week to prepare for. Now the
              record is just already there, waiting for someone to ask.&rdquo;
            </p>
            <p className="mt-4 font-eyebrow text-xs tracking-widest text-wheat/40 uppercase">
              Bays Ranch &middot; Admin
            </p>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <Reveal>
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl text-soil">
              Frequently asked questions
            </h2>
            <div className="mt-6">
              <FaqItem
                question="Does Toph replace our existing systems?"
                answer="No. Toph sits alongside whatever you already use for scheduling, payroll, or field management, it's the layer that turns what happens in the field into a structured, audit-ready record."
              />
              <FaqItem
                question="What actually makes a log 'audit-ready'?"
                answer="Every log is enriched with the field, the time, and workflow context, then tagged against the regulations that apply, so it can be handed to an inspector as-is instead of cleaned up first."
              />
              <FaqItem
                question="What languages does Toph support?"
                answer="Voice logs can be recorded in English or Spanish, so language is never the reason a report doesn't get filed. Anything in Spanish can be translated to English in the dashboard with one click."
              />
              <FaqItem
                question="Who can see the data?"
                answer="Anyone with a Toph account for your farm has full access to logs, the map, and reports, no separate admin tier hiding information."
              />
              <FaqItem
                question="Can I try it before committing to anything?"
                answer="Yes, create a free account and you'll have the full dashboard, recording, and reporting tools immediately."
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Final CTA */}
      <section className="px-6 pt-24 pb-2">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl text-soil">
            Stop reconstructing the season from memory.
          </h2>
          <p className="mt-3 text-soil/60">
            Set up takes a couple of minutes. Your first field report can be
            captured before you put your phone down.
          </p>
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
