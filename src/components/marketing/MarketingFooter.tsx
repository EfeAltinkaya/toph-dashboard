import Link from "next/link";
import { BarnSilhouette, RollingHills } from "./FarmIllustrations";
import { getI18n } from "@/i18n/server";

export async function MarketingFooter() {
  const { t } = await getI18n();
  const links = [
    { href: "/product", label: t.nav.product },
    { href: "/use-cases", label: t.nav.useCases },
    { href: "/company", label: t.nav.company },
    { href: "/login", label: t.nav.logIn },
  ];

  return (
    <>
      <RollingHills className="-mb-px block h-14 w-full text-soil sm:h-20" />
      <footer className="relative isolate overflow-hidden bg-soil px-6 py-10 text-center">
        <BarnSilhouette className="pointer-events-none absolute right-6 bottom-0 z-0 hidden h-20 w-auto text-wheat/20 sm:block lg:right-16" />
        <div className="relative z-10 font-display text-lg text-wheat italic">Toph</div>
        <nav className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-eyebrow text-[11px] tracking-widest text-wheat/50 uppercase hover:text-wheat"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="relative z-10 mx-auto mt-6 max-w-2xl text-xs text-wheat/30">
          {t.footer.disclaimer}
        </p>
      </footer>
    </>
  );
}
