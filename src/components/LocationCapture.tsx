"use client";

import { useEffect } from "react";
import { MapPin, Loader2, Check, CircleAlert } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/i18n";

export type CapturedLocation = { lat: number; lng: number; accuracyM: number } | null;

/**
 * Attaches a real GPS fix to a log. Without this, a log's coordinates are
 * the block's known centre, which proves nothing about where the worker
 * actually was — and "where was this applied" is a question an auditor
 * does ask.
 *
 * The browser only hands over a location after the person allows it, and
 * only from a real click: nothing is requested on mount, because a
 * permission prompt that appears before the worker has done anything is
 * the fastest way to get it denied for good. If they decline, the log
 * still saves against the block's coordinates and says so.
 */
export function LocationCapture({
  onCapture,
}: {
  onCapture: (location: CapturedLocation) => void;
}) {
  const { t } = useI18n();
  const w = t.worker;
  const { state, locate } = useGeolocation();

  // The hook watches the position, so the newest fix wins without the
  // component having to re-request one. Handing it upward happens in an
  // effect, not during render, since it sets state on the parent.
  const fix = state.status === "granted" ? state : null;
  useEffect(() => {
    onCapture(fix ? { lat: fix.lat, lng: fix.lng, accuracyM: fix.accuracy } : null);
  }, [fix?.lat, fix?.lng, fix?.accuracy, fix, onCapture]);

  const base =
    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium";

  if (state.status === "granted") {
    return (
      <span className={`${base} border-accent-200 bg-accent-25 text-neutral-700`}>
        <Check size={13} className="text-green-600" />
        {format(w.locationCaptured, { meters: String(Math.round(state.accuracy)) })}
      </span>
    );
  }

  if (state.status === "denied" || state.status === "unsupported") {
    return (
      <span className={`${base} border-neutral-200 bg-white text-neutral-500`}>
        <CircleAlert size={13} /> {w.locationUnavailable}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={locate}
      disabled={state.status === "loading"}
      className={`${base} border-accent-200 bg-white text-neutral-700 hover:bg-accent-25 disabled:opacity-60`}
    >
      {state.status === "loading" ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <MapPin size={13} />
      )}
      {state.status === "loading" ? w.locating : w.attachLocation}
    </button>
  );
}
