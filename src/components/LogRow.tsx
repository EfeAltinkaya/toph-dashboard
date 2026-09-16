"use client";

import { useState, useTransition } from "react";
import { Maximize2 } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TagPicker } from "@/components/TagPicker";
import { FieldMap } from "@/components/FieldMap";
import { markLogViewed } from "@/app/actions";
import type { LogWithRelations, TagOption } from "@/lib/types";

const GRID_COLS =
  "grid-cols-[24px_1.6fr_1.2fr_1.3fr_0.9fr_1.4fr_80px]";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function LogRow({
  log,
  allTags,
  expanded,
  onToggle,
}: {
  log: LogWithRelations;
  allTags: TagOption[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleToggle() {
    if (!expanded && log.isNew) {
      startTransition(() => {
        markLogViewed(log.id);
      });
    }
    onToggle();
  }

  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <div
        className={`grid ${GRID_COLS} items-center gap-3 px-4 py-3 text-sm`}
      >
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex items-center gap-2 font-medium text-neutral-900">
          {log.employee.name}
          {log.isNew && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}
        </div>
        <div className="text-neutral-600">{log.activity}</div>
        <div className="text-neutral-600">{dateFormatter.format(log.date)}</div>
        <div className="text-neutral-600 uppercase">{log.field}</div>
        <div className="text-neutral-600">
          {log.startTime} - {log.endTime}
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
        >
          {expanded ? "Close" : "View"}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 gap-4 border-t border-neutral-100 bg-neutral-50/60 p-4 sm:grid-cols-2">
          <div>
            <AudioPlayer audioUrl={log.audioUrl} seed={log.id} />
            <div className="mt-2">
              <TagPicker
                logId={log.id}
                allTags={allTags}
                activeTagIds={log.tags.map((t) => t.id)}
              />
            </div>
            {log.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {log.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4">
              <div className="text-xs font-semibold text-neutral-500">
                Summary
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                &ldquo;{log.transcript}&rdquo;
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl">
            <FieldMap
              x={log.mapX}
              y={log.mapY}
              label={log.field}
              className="h-48 w-full sm:h-full"
            />
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
            >
              <Maximize2 size={12} />
              Expand Map
            </button>
          </div>
        </div>
      )}

      {mapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setMapOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-neutral-900">
                {log.field} — {log.employee.name}
              </div>
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
            <FieldMap
              x={log.mapX}
              y={log.mapY}
              label={log.field}
              className="h-[60vh] w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { GRID_COLS };
