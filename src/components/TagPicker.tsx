"use client";

import { useState, useTransition } from "react";
import { Star, X } from "lucide-react";
import { toggleLogTag } from "@/app/actions";

export function TagPicker({
  logId,
  allTags,
  activeTagIds,
}: {
  logId: number;
  allTags: { id: number; name: string }[];
  activeTagIds: number[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
      >
        <Star size={14} />
        Add Tag
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-semibold text-neutral-500">
              Tags
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <X size={14} />
            </button>
          </div>
          {allTags.map((tag) => {
            const active = activeTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => {
                    toggleLogTag(logId, tag.id);
                  })
                }
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {tag.name}
                {active && <span className="text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
