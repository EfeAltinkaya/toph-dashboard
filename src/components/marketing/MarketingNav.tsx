"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { BriefingModal } from "@/components/marketing/BriefingModal";

const LINKS = [
  { href: "/product", label: "Product" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/company", label: "Company" },
];

export function MarketingNav({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const [briefingOpen, setBriefingOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-wheat/10 bg-soil/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
                  {link.label}
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
            {!loggedIn && (
              <Link
                href="/login"
                className="hidden px-3 py-2 font-eyebrow text-[11px] tracking-widest text-wheat/70 uppercase hover:text-wheat sm:block"
              >
                Log In
              </Link>
            )}
            <button
              type="button"
              onClick={() => setBriefingOpen(true)}
              className="hidden rounded-full border border-wheat/25 px-4 py-2 font-eyebrow text-[11px] tracking-widest text-wheat uppercase hover:bg-wheat/10 sm:block"
            >
              Request a Briefing
            </button>
            <Link
              href={loggedIn ? "/dashboard" : "/signup"}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {loggedIn ? "Dashboard" : "Get Started"}
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {briefingOpen && <BriefingModal onClose={() => setBriefingOpen(false)} />}
    </>
  );
}
