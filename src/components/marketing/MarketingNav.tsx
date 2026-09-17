"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { BriefingModal } from "@/components/marketing/BriefingModal";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/i18n/I18nProvider";

const LINKS = [
  { href: "/product", key: "product" },
  { href: "/use-cases", key: "useCases" },
  { href: "/company", key: "company" },
] as const;

export function MarketingNav({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [briefingOpen, setBriefingOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-wheat/10 bg-soil/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
          <Link href="/" className="font-display text-xl text-wheat italic">
            Toph
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 font-eyebrow text-[11px] tracking-widest text-wheat/70 uppercase hover:text-wheat"
                >
                  {t.nav[link.key]}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute right-4 bottom-0 left-4 h-px bg-accent"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle tone="marketing" />
            {!loggedIn && (
              <Link
                href="/login"
                className="hidden px-3 py-2 font-eyebrow text-[11px] tracking-widest whitespace-nowrap text-wheat/70 uppercase hover:text-wheat lg:block"
              >
                {t.nav.logIn}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setBriefingOpen(true)}
              className="hidden rounded-full border border-wheat/25 px-4 py-2 font-eyebrow text-[11px] tracking-widest whitespace-nowrap text-wheat uppercase hover:bg-wheat/10 lg:block"
            >
              {t.nav.requestBriefing}
            </button>
            <Link
              href={loggedIn ? "/dashboard" : "/signup"}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:opacity-90"
            >
              {loggedIn ? t.nav.dashboard : t.nav.getStarted}
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {briefingOpen && <BriefingModal onClose={() => setBriefingOpen(false)} />}
    </>
  );
}
