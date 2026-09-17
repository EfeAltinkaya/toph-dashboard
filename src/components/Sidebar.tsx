"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLine,
  AudioLines,
  Map as MapIcon,
  ShieldCheck,
  ClipboardCheck,
  FileText,
  CalendarClock,
  Users,
  TrendingUp,
  MessageSquare,
  Settings,
  LifeBuoy,
  ChevronsUpDown,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { logout } from "@/lib/auth-actions";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/i18n/I18nProvider";

// Section and item labels are dictionary keys; the sidebar looks them up so
// the whole nav switches language with the rest of the app.
const NAV_SECTIONS = [
  {
    label: "overview",
    items: [
      { label: "dashboard", href: "/dashboard", icon: ChartLine },
      { label: "activityLogs", href: "/activity-logs", icon: AudioLines },
      { label: "map", href: "/map", icon: MapIcon },
    ],
  },
  {
    label: "compliance",
    items: [
      { label: "auditManager", href: "/audit-manager", icon: ShieldCheck },
      { label: "records", href: "/records", icon: ClipboardCheck },
      { label: "reports", href: "/reports", icon: FileText },
      { label: "schedule", href: "/schedule", icon: CalendarClock },
    ],
  },
  {
    label: "team",
    items: [
      { label: "employees", href: "/employees", icon: Users },
      { label: "performance", href: "/performance", icon: TrendingUp },
      { label: "messages", href: "/messages", icon: MessageSquare },
    ],
  },
  {
    label: "other",
    items: [
      { label: "settings", href: "/settings", icon: Settings },
      { label: "support", href: "/support", icon: LifeBuoy },
    ],
  },
] as const;

export function Sidebar({
  user,
  newLogCount,
}: {
  user: { name: string; avatarUrl?: string | null };
  newLogCount: number;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="print-hide flex h-screen w-64 shrink-0 flex-col justify-between border-r border-accent-200 bg-accent-50 px-3 py-4 text-surface">
      <div>
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-accent-100"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-300 text-sm font-semibold text-neutral-700">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable remote image
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials || "U"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-surface">{user.name}</div>
            <div className="text-xs text-surface/55">{t.sidebar.role}</div>
          </div>
          <ChevronsUpDown size={16} className="shrink-0 text-surface/40" />
        </Link>

        <nav className="mt-4 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-surface/40 uppercase">
                {t.sidebar[section.label]}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isDashboard = item.href === "/dashboard";
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${
                        active
                          ? "bg-accent-100 text-surface"
                          : "text-surface hover:bg-accent-100"
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="flex-1 truncate">{t.sidebar[item.label]}</span>
                      {isDashboard && newLogCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full border border-[#006939]/25 bg-[#019C25]/50 px-1 text-[10px] font-semibold text-white">
                          {newLogCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="space-y-2 border-t border-accent-200 pt-3">
        <div className="px-2">
          <LanguageToggle tone="app" />
        </div>
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-surface hover:bg-accent-100"
        >
          <ExternalLink size={16} />
          <span>{t.sidebar.productSite}</span>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-surface hover:bg-accent-100"
          >
            <LogOut size={16} />
            <span>{t.sidebar.logOut}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
