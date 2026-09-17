import Link from "next/link";
import {
  ArrowRight,
  Mic,
  Languages,
  MapPin,
  Camera,
  MessageSquare,
  ShieldCheck,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FaqItem } from "@/components/FaqItem";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: Mic,
    title: "Hands-free voice logging",
    body: "Workers report what they did by talking, from the field, on their phone. No forms, no pen and paper.",
  },
  {
    icon: Languages,
    title: "Built-in translation",
    body: "Logs recorded in Spanish are transcribed accurately and translated to English with one click, no separate app or interpreter needed.",
  },
  {
    icon: MapPin,
    title: "Real field locations",
    body: "Every log is pinned to an actual field on a live satellite map, not a guess at which block someone meant.",
  },
  {
    icon: Camera,
    title: "Photo evidence",
    body: "Attach a photo straight from the log, so a compliance record isn't just a transcript, it's proof.",
  },
  {
    icon: ShieldCheck,
    title: "Audit-ready tagging",
    body: "Flag anything that needs a second look, and it surfaces automatically in Audit Manager, not buried in a spreadsheet.",
  },
  {
    icon: MessageSquare,
    title: "One team board",
    body: "Post an update the whole crew sees, so coordination doesn't depend on a group text no one reads.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Mic,
    title: "Field data collection",
    body: "Workers report completed work through a simple voice conversation while they're still in the field, captured accurately in real time.",
  },
  {
    n: "02",
    icon: ClipboardList,
    title: "Compliance records",
    body: "Every report is organized and connected into a complete, continuously updated history for the farm, no manual reconstruction later.",
  },
  {
    n: "03",
    icon: FileCheck,
    title: "Audit documentation",
    body: "When an inspection or certification comes up, the record is already there, structured and ready to hand over.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  const [logCount, employeeCount, fieldCount] = await Promise.all([
    prisma.employeeLog.count(),
    prisma.employee.count(),
    prisma.employeeLog
      .findMany({ distinct: ["field"], select: { field: true } })
      .then((r) => r.length),
  ]);

  const ctaHref = user ? "/dashboard" : "/signup";
  const ctaLabel = user ? "Go to Dashboard" : "Get Started";

  return (
    <div className="flex-1">
      {/* Nav */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-tight text-neutral-900">Toph</div>
          <nav className="flex items-center gap-3">
            {!user && (
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                Log In
              </Link>
            )}
            <Link
              href={ctaHref}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {ctaLabel}
              <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
        <h1 className="text-4xl leading-tight font-semibold tracking-tight text-neutral-900 sm:text-5xl">
          Contextualizing farm compliance,
          <br className="hidden sm:block" /> one conversation at a time.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
          Toph turns a farm worker&apos;s spoken update, in English or Spanish, into a
          structured, audit-ready record, automatically. No paperwork, no manual
          reconstruction at the end of the season.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
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
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              I already have an account
            </Link>
          )}
        </div>
      </section>

      {/* Problem statement */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-xl leading-relaxed font-medium text-neutral-900 sm:text-2xl">
            &ldquo;Agriculture is one of the most heavily regulated industries in the
            United States, yet most farms still rely on fragmented, manual systems
            using paper logs.&rdquo;
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            Every hour spent reconstructing what happened, weeks later, from memory
            and handwriting, is an hour not spent running the farm.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            How Toph works
          </div>
          <h2 className="mt-2 text-3xl font-semibold text-neutral-900">
            Compliance that stays with you from field to form.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n}>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
                <span>{step.n}</span>
                <span className="h-px flex-1 bg-neutral-200" />
              </div>
              <step.icon size={22} className="mt-4 text-neutral-900" />
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              What&apos;s built in
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-neutral-900">
              Everything a crew needs, nothing they have to learn.
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <f.icon size={20} className="text-accent" />
                <h3 className="mt-3 font-semibold text-neutral-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Right now, in this demo
          </div>
          <h2 className="mt-2 text-3xl font-semibold text-neutral-900">
            Real data, not a mockup.
          </h2>
          <p className="mt-3 text-sm text-neutral-500">
            These numbers are pulled live from the same database the dashboard reads
            from, not hardcoded for this page.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center">
            <div className="text-3xl font-semibold text-neutral-900">{logCount}</div>
            <div className="mt-1 text-sm text-neutral-500">Logged activities</div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center">
            <div className="text-3xl font-semibold text-neutral-900">{employeeCount}</div>
            <div className="mt-1 text-sm text-neutral-500">Workers tracked</div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center">
            <div className="text-3xl font-semibold text-neutral-900">{fieldCount}</div>
            <div className="mt-1 text-sm text-neutral-500">Fields monitored</div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-xl leading-relaxed font-medium text-neutral-900">
            &ldquo;We stopped chasing paper at the end of the week. Every log is
            already there, in English, exactly where it happened.&rdquo;
          </p>
          <p className="mt-4 text-sm text-neutral-500">Bays Ranch &middot; Admin</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-2xl font-semibold text-neutral-900">
          Frequently asked questions
        </h2>
        <div className="mt-6">
          <FaqItem
            question="Does Toph replace our existing systems?"
            answer="No. Toph is meant to sit alongside whatever you already use for scheduling, payroll, or field management, it's the layer that turns a spoken update into a structured, searchable record."
          />
          <FaqItem
            question="What languages does Toph support?"
            answer="Voice logs can be recorded in English or Spanish. Anything recorded in Spanish can be translated to English in the dashboard with one click, so nothing gets lost between the field and the office."
          />
          <FaqItem
            question="Who can see the data?"
            answer="Anyone with a Toph account for your farm has full access to logs, the map, and reports. There's no separate admin tier hiding information from the rest of the team."
          />
          <FaqItem
            question="Can I try it before committing to anything?"
            answer="Yes, create a free account and you'll have the full dashboard, recording, and reporting tools immediately, no sales call required."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-neutral-200 bg-neutral-900">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold text-white">
            See what a season of compliance actually looks like.
          </h2>
          <p className="mt-3 text-neutral-400">
            Set up takes a couple of minutes. Your first log can be recorded before
            you put your phone down.
          </p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
          >
            {ctaLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-neutral-400">
        Toph is a fictional product built for the LavaLab Fall 2026 developer
        challenge.
      </footer>
    </div>
  );
}
