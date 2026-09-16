"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, which breaks server rendering.
// Loading it only in the browser (ssr: false) is the standard fix.
const LeafletFieldMap = dynamic(
  () => import("@/components/LeafletFieldMap").then((m) => m.LeafletFieldMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-neutral-100" />,
  }
);

export function FieldMap({
  lat,
  lng,
  label,
  zoom,
  interactive,
  className = "",
}: {
  lat: number;
  lng: number;
  label?: string;
  zoom?: number;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <LeafletFieldMap
      lat={lat}
      lng={lng}
      label={label}
      zoom={zoom}
      interactive={interactive}
      className={className}
    />
  );
}
