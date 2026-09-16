import {
  LayoutDashboard,
  ListChecks,
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
  Repeat,
  LogOut,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, active: true },
      { label: "Activity Logs", icon: ListChecks },
      { label: "Map", icon: MapIcon },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "Audit Manager", icon: ShieldCheck },
      { label: "Reports", icon: FileText },
      { label: "Schedule", icon: CalendarClock },
    ],
  },
  {
    label: "Team Management",
    items: [
      { label: "Employees", icon: Users },
      { label: "Performance", icon: TrendingUp },
      { label: "Messages", icon: MessageSquare },
    ],
  },
  {
    label: "Other",
    items: [
      { label: "Settings", icon: Settings },
      { label: "Support", icon: LifeBuoy },
    ],
  },
];

export function Sidebar({ newLogCount }: { newLogCount: number }) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between bg-neutral-950 px-3 py-4 text-neutral-300">
      <div>
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-white">
            BR
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              Bays Ranch
            </div>
            <div className="text-xs text-neutral-500">Admin</div>
          </div>
          <ChevronsUpDown size={16} className="shrink-0 text-neutral-600" />
        </div>

        <nav className="mt-4 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-neutral-600 uppercase">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isDashboard = item.label === "Dashboard";
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${
                        item.active
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-400"
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isDashboard && newLogCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                          {newLogCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="space-y-0.5 border-t border-neutral-800 pt-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-neutral-400">
          <Repeat size={16} />
          <span>Switch User</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-neutral-400">
          <LogOut size={16} />
          <span>Log Out</span>
        </div>
      </div>
    </aside>
  );
}
