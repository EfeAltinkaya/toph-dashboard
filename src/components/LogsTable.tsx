"use client";

import { useMemo, useState } from "react";
import {
  Search,
  AudioLines,
  SlidersHorizontal,
  Filter as FilterIcon,
  Calendar,
  X,
  Mic,
} from "lucide-react";
import { LogRow, GRID_COLS } from "@/components/LogRow";
import { RecordLogModal } from "@/components/RecordLogModal";
import type { LogWithRelations, TagOption } from "@/lib/types";

type DateRange = "all" | "week" | "month";

const HEADERS = ["", "Employee", "Activity", "Date", "Field", "Time", ""];

export function LogsTable({
  logs,
  allTags,
  defaultDateRange = "month",
  title = "New Employee Logs",
}: {
  logs: LogWithRelations[];
  allTags: TagOption[];
  defaultDateRange?: DateRange;
  title?: string;
}) {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);
  const [activityFilter, setActivityFilter] = useState<string | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);

  const employeeNames = useMemo(
    () => Array.from(new Set(logs.map((l) => l.employee.name))).sort(),
    [logs]
  );

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
    <div>
      <div className="flex items-center justify-end gap-2">
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
        <button
          type="button"
          onClick={() => setRecordOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Mic size={14} />
          New Log
        </button>
      </div>

      {recordOpen && (
        <RecordLogModal
          employeeNames={employeeNames}
          onClose={() => setRecordOpen(false)}
        />
      )}

      <div className="mt-4 rounded-2xl border border-accent-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-accent-200 bg-accent-25 px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-surface">
            <AudioLines size={15} className="text-accent" />
            {title} ({filtered.length})
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              {dateRange === "all" ? (
                <Pill onClick={() => setDateMenuOpen((v) => !v)} icon={<Calendar size={12} />}>
                  Date
                </Pill>
              ) : (
                <ActivePill
                  onClick={() => setDateMenuOpen((v) => !v)}
                  onClear={() => setDateRange("all")}
                >
                  Date
                </ActivePill>
              )}
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

            <Pill onClick={() => setSortDesc((v) => !v)} icon={<SlidersHorizontal size={12} />}>
              Sort
            </Pill>

            {dateRange !== "all" && (
              <ActivePill onClick={() => {}} onClear={() => setDateRange("all")}>
                {dateRangeLabel} ({filtered.length})
              </ActivePill>
            )}

            <div className="relative">
              {activityFilter ? (
                <ActivePill
                  onClick={() => setFilterMenuOpen((v) => !v)}
                  onClear={() => setActivityFilter(null)}
                >
                  {activityFilter}
                </ActivePill>
              ) : (
                <Pill
                  onClick={() => setFilterMenuOpen((v) => !v)}
                  icon={<FilterIcon size={12} />}
                >
                  Filter
                </Pill>
              )}
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
              onToggle={() => setExpandedId((cur) => (cur === log.id ? null : log.id))}
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
  onClick,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
    >
      {icon}
      {children}
    </button>
  );
}

function ActivePill({
  children,
  onClick,
  onClear,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
    >
      <span
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
      >
        <X size={12} />
      </span>
      {children}
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
        active ? "bg-emerald-50 text-emerald-700" : "text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}
