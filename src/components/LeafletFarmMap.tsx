"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Loader2 } from "lucide-react";
import { FIELD_COORDS } from "@/lib/fields";
import { createPersonPin, createLiveLocationPin } from "@/lib/mapIcon";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useI18n } from "@/i18n/I18nProvider";
import { format, tr } from "@/i18n";

const pin = createPersonPin();
const livePin = createLiveLocationPin();

const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

// Flies the map to a position once it's known. Has to live inside
// <MapContainer> since `useMap` only works in that context — the button
// that triggers it lives outside, in the parent.
function RecenterOnLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 17);
  }, [lat, lng, map]);
  return null;
}

export function LeafletFarmMap({
  fieldCounts,
}: {
  fieldCounts: Record<string, number>;
}) {
  const { t } = useI18n();
  const m = t.pages.map;
  const { state: geo, locate } = useGeolocation();
  const entries = Object.entries(FIELD_COORDS);
  const bounds: LatLngBoundsExpression = entries.map(([, c]) => [c.lat, c.lng]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [60, 60] }}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer url={TILE_URL} maxZoom={19} />
        {entries.map(([name, coords]) => (
          <Marker key={name} position={[coords.lat, coords.lng]} icon={pin}>
            <Popup>
              <div className="text-sm font-medium">{tr(t.vocab.fields, name)}</div>
              <div className="text-xs text-neutral-500">
                {fieldCounts[name] === 1
                  ? m.activityCountOne
                  : format(m.activityCount, { count: fieldCounts[name] ?? 0 })}
              </div>
            </Popup>
          </Marker>
        ))}

        {geo.status === "granted" && (
          <>
            <RecenterOnLocation lat={geo.lat} lng={geo.lng} />
            <Circle
              center={[geo.lat, geo.lng]}
              radius={geo.accuracy}
              pathOptions={{ color: "#2563eb", fillOpacity: 0.08, weight: 1 }}
            />
            <Marker position={[geo.lat, geo.lng]} icon={livePin}>
              <Popup>{m.youAreHere}</Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      <div className="absolute top-3 right-3 z-[1000]">
        <button
          type="button"
          onClick={locate}
          className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-sm hover:bg-neutral-50"
        >
          {geo.status === "loading" ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <LocateFixed size={13} />
          )}
          {geo.status === "loading" ? m.locating : m.locateMe}
        </button>
        {geo.status === "denied" && (
          <p className="mt-1.5 max-w-48 rounded-lg bg-white px-2 py-1 text-[11px] text-red-600 shadow-sm">
            {t.errors.locationDenied}
          </p>
        )}
        {geo.status === "unsupported" && (
          <p className="mt-1.5 max-w-48 rounded-lg bg-white px-2 py-1 text-[11px] text-neutral-500 shadow-sm">
            {t.errors.locationUnsupported}
          </p>
        )}
      </div>
    </div>
  );
}
