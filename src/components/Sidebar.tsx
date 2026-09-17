"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLine,
  AudioLines,
  Map as MapIcon,
  ShieldCheck,
  FileText,
  CalendarClock,
  Users,
  TrendingUp,
  MessageSquare,
  Settings,
  LifeBuoy,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth-actions";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: ChartLine },
      { label: "Activity Logs", href: "/activity-logs", icon: AudioLines },
      { label: "Map", href: "/map", icon: MapIcon },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "Audit Manager", href: "/audit-manager", icon: ShieldCheck },
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Schedule", href: "/schedule", icon: CalendarClock },
    ],
  },
  {
    label: "Team Management",
    items: [
      { label: "Employees", href: "/employees", icon: Users },
      { label: "Performance", href: "/performance", icon: TrendingUp },
      { label: "Messages", href: "/messages", icon: MessageSquare },
    ],
  },
  {
    label: "Other",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Support", href: "/support", icon: LifeBuoy },
    ],
  },
];

export function Sidebar({
  user,
  newLogCount,
}: {
  user: { name: string; avatarUrl?: string | null };
  newLogCount: number;
}) {
  const pathname = usePathname();
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-neutral-300 bg-white px-3 py-4 text-neutral-700">
      <div>
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-black/5"
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
            <div className="truncate text-sm font-semibold text-neutral-900">
              {user.name}
            </div>
            <div className="text-xs text-neutral-500">Admin</div>
          </div>
          <ChevronsUpDown size={16} className="shrink-0 text-neutral-400" />
        </Link>

        <nav className="mt-4 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                {section.label}
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
                          ? "bg-black/5 text-neutral-900"
                          : "text-neutral-900 hover:bg-black/5"
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
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

      <div className="space-y-0.5 border-t border-neutral-200 pt-3">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-neutral-900 hover:bg-black/5"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
