import Link from "next/link";
import { BarnSilhouette, RollingHills } from "./FarmIllustrations";

export function MarketingFooter() {
  return (
    <>
    <RollingHills className="-mb-px block h-14 w-full text-soil sm:h-20" />
    <footer className="relative isolate overflow-hidden bg-soil px-6 py-10 text-center">
      <BarnSilhouette className="pointer-events-none absolute right-6 bottom-0 z-0 hidden h-20 w-auto text-wheat/20 sm:block lg:right-16" />
      <div className="relative z-10 font-display text-lg text-wheat italic">Toph</div>
      <nav className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {[
          { href: "/product", label: "Product" },
          { href: "/use-cases", label: "Use Cases" },
          { href: "/company", label: "Company" },
          { href: "/login", label: "Log In" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="font-eyebrow text-[11px] tracking-widest text-wheat/50 uppercase hover:text-wheat"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="relative z-10 mt-6 text-xs text-wheat/30">
        Toph is a fictional product built for the LavaLab Fall 2026 developer
        challenge. Photography from Unsplash; no one pictured is a Toph user.
      </p>
    </footer>
    </>
  );
}
