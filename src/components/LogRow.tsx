"use client";

import { useState, useTransition } from "react";
import { Maximize2, Pencil, Trash2, X, Check, Camera } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TagPicker } from "@/components/TagPicker";
import { FieldMap } from "@/components/FieldMap";
import { markLogViewed } from "@/app/actions";
import { updateLog, deleteLog, setLogPhoto } from "@/lib/log-actions";
import { ACTIVITIES } from "@/lib/constants";
import { FIELD_NAMES } from "@/lib/fields";
import { resizeImageFile } from "@/lib/image";
import type { LogWithRelations, TagOption } from "@/lib/types";

const GRID_COLS = "grid-cols-[24px_1.6fr_1.2fr_1.3fr_0.9fr_1.4fr_1fr]";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

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
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState(() => ({
    employeeName: log.employee.name,
    activity: log.activity,
    field: log.field,
    date: toDateInputValue(log.date),
    startTime: log.startTime,
    endTime: log.endTime,
  }));

  function handleToggle() {
    if (!expanded && log.isNew) {
      startTransition(() => {
        markLogViewed(log.id);
      });
    }
    onToggle();
  }

  function saveEdit() {
    startTransition(async () => {
      await updateLog(log.id, form);
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete this log for ${log.employee.name}? This can't be undone.`)) {
      return;
    }
    startTransition(() => {
      deleteLog(log.id);
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImageFile(file, 1024, 0.8);
    startTransition(() => {
      setLogPhoto(log.id, dataUrl);
    });
  }

  if (editing) {
    return (
      <div className="grid grid-cols-1 gap-2 border-b border-neutral-100 bg-amber-50/40 px-4 py-3 last:border-b-0 sm:grid-cols-6 sm:items-center sm:gap-3">
        <input
          value={form.employeeName}
          onChange={(e) => setForm((f) => ({ ...f, employeeName: e.target.value }))}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          placeholder="Employee name"
        />
        <select
          value={form.activity}
          onChange={(e) => setForm((f) => ({ ...f, activity: e.target.value }))}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        >
          {ACTIVITIES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <select
          value={form.field}
          onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        >
          {FIELD_NAMES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <input
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            className="w-full min-w-0 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            placeholder="6:00 AM"
          />
          <span className="text-neutral-400">-</span>
          <input
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            className="w-full min-w-0 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            placeholder="8:00 AM"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isPending}
            onClick={saveEdit}
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            <Check size={12} /> Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <div className={`grid ${GRID_COLS} items-center gap-3 px-4 py-3 text-sm`}>
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex items-center gap-2 font-medium text-neutral-900">
          {log.employee.name}
          {log.isNew && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
        </div>
        <div className="text-neutral-600">{log.activity}</div>
        <div className="text-neutral-600">{dateFormatter.format(log.date)}</div>
        <div className="text-neutral-600 uppercase">{log.field}</div>
        <div className="text-neutral-600">
          {log.startTime} - {log.endTime}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            title="Edit"
            className="rounded-full border border-neutral-300 bg-white p-1.5 text-neutral-600 hover:bg-neutral-50"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            title="Delete"
            className="rounded-full border border-neutral-300 bg-white p-1.5 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={13} />
          </button>
          <button
            type="button"
            onClick={handleToggle}
            className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
          >
            {expanded ? "Close" : "View"}
          </button>
        </div>
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
              <div className="text-xs font-semibold text-neutral-500">Summary</div>
              <p className="mt-1 text-sm text-neutral-600">&ldquo;{log.transcript}&rdquo;</p>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-neutral-500">Photo</div>
              {log.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable remote image
                <img
                  src={log.photoUrl}
                  alt=""
                  className="mt-1 h-32 w-full rounded-lg object-cover"
                />
              )}
              <label className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
                <Camera size={13} />
                {log.photoUrl ? "Replace Photo" : "Add Photo"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="relative isolate overflow-hidden rounded-xl">
            {!mapOpen && (
              <FieldMap
                lat={log.lat}
                lng={log.lng}
                label={log.field}
                className="h-48 w-full sm:h-full"
              />
            )}
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="absolute right-3 bottom-3 z-[400] flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
            >
              <Maximize2 size={12} />
              Expand Map
            </button>
          </div>
        </div>
      )}

      {mapOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-6"
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
              lat={log.lat}
              lng={log.lng}
              label={log.field}
              interactive
              className="h-[60vh] w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { GRID_COLS };
