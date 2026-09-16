"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Inbox,
  ArrowUpDown,
  ListFilter,
  Calendar,
  X,
} from "lucide-react";
import { StatCards } from "@/components/StatCards";
import { LogRow, GRID_COLS } from "@/components/LogRow";
import type { LogWithRelations, TagOption } from "@/lib/types";

type DateRange = "all" | "week" | "month";

const HEADERS = ["", "Employee", "Activity", "Date", "Field", "Time", ""];

export function DashboardBody({
  logs,
  allTags,
  stats,
}: {
  logs: LogWithRelations[];
  allTags: TagOption[];
  stats: {
    todaysRecordings: number;
    newToday: number;
    activeWorkers: number;
    responseAccuracy: number;
  };
}) {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);
  const [activityFilter, setActivityFilter] = useState<string | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const activities = useMemo(
    () => Array.from(new Set(logs.map((l) => l.activity))).sort(),
    [logs]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    let rows = logs;

    if (dateRange === "month") {
      rows = rows.filter(
        (l) =>
          l.date.getMonth() === now.getMonth() &&
          l.date.getFullYear() === now.getFullYear()
      );
    } else if (dateRange === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      rows = rows.filter((l) => l.date >= weekAgo);
    }

    if (activityFilter) {
      rows = rows.filter((l) => l.activity === activityFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (l) =>
          l.employee.name.toLowerCase().includes(q) ||
          l.activity.toLowerCase().includes(q) ||
          l.field.toLowerCase().includes(q)
      );
    }

    rows = [...rows].sort((a, b) =>
      sortDesc
        ? b.date.getTime() - a.date.getTime()
        : a.date.getTime() - b.date.getTime()
    );

    return rows;
  }, [logs, dateRange, activityFilter, search, sortDesc]);

  const dateRangeLabel =
    dateRange === "month" ? "This Month" : dateRange === "week" ? "This Week" : "All Time";

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500">
            An overview of your farm and employee activity
          </p>
        </div>
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-56 rounded-full border border-neutral-200 bg-white py-2 pr-3 pl-9 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6">
        <StatCards {...stats} />
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
            <Inbox size={15} />
            New Employee Logs ({filtered.length})
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Pill onClick={() => setDateMenuOpen((v) => !v)} icon={<Calendar size={12} />}>
                Date
              </Pill>
              {dateMenuOpen && (
                <DropdownMenu onClose={() => setDateMenuOpen(false)}>
                  {(["all", "week", "month"] as DateRange[]).map((opt) => (
                    <MenuOption
                      key={opt}
                      active={dateRange === opt}
                      onClick={() => {
                        setDateRange(opt);
                        setDateMenuOpen(false);
                      }}
                    >
                      {opt === "all"
                        ? "All Time"
                        : opt === "week"
                          ? "This Week"
                          : "This Month"}
                    </MenuOption>
                  ))}
                </DropdownMenu>
              )}
            </div>

            <Pill
              onClick={() => setSortDesc((v) => !v)}
              icon={<ArrowUpDown size={12} />}
            >
              Sort
            </Pill>

            {dateRange !== "all" && (
              <Pill
                onClick={() => setDateRange("all")}
                trailingIcon={<X size={12} />}
              >
                {dateRangeLabel} ({filtered.length})
              </Pill>
            )}

            <div className="relative">
              <Pill
                onClick={() => setFilterMenuOpen((v) => !v)}
                icon={<ListFilter size={12} />}
                trailingIcon={activityFilter ? <X size={12} /> : undefined}
                onTrailingClick={() => setActivityFilter(null)}
              >
                {activityFilter ?? "Filter"}
              </Pill>
              {filterMenuOpen && (
                <DropdownMenu onClose={() => setFilterMenuOpen(false)}>
                  <MenuOption
                    active={activityFilter === null}
                    onClick={() => {
                      setActivityFilter(null);
                      setFilterMenuOpen(false);
                    }}
                  >
                    All Activities
                  </MenuOption>
                  {activities.map((activity) => (
                    <MenuOption
                      key={activity}
                      active={activityFilter === activity}
                      onClick={() => {
                        setActivityFilter(activity);
                        setFilterMenuOpen(false);
                      }}
                    >
                      {activity}
                    </MenuOption>
                  ))}
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <div
          className={`grid ${GRID_COLS} gap-3 px-4 py-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase`}
        >
          {HEADERS.map((h, i) => (
            <div key={i}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-neutral-400">
            No logs match your filters.
          </div>
        ) : (
          filtered.map((log) => (
            <LogRow
              key={log.id}
              log={log}
              allTags={allTags}
              expanded={expandedId === log.id}
              onToggle={() =>
                setExpandedId((cur) => (cur === log.id ? null : log.id))
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function Pill({
  children,
  icon,
  trailingIcon,
  onClick,
  onTrailingClick,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onClick?: () => void;
  onTrailingClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200"
    >
      {icon}
      {children}
      {trailingIcon && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onTrailingClick?.();
          }}
        >
          {trailingIcon}
        </span>
      )}
    </button>
  );
}

function DropdownMenu({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg">
        {children}
      </div>
    </>
  );
}

function MenuOption({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}
