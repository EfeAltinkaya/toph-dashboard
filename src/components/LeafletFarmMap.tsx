"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { FIELD_COORDS } from "@/lib/fields";
import { createPersonPin } from "@/lib/mapIcon";

const pin = createPersonPin();

const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export function LeafletFarmMap({
  fieldCounts,
}: {
  fieldCounts: Record<string, number>;
}) {
  const entries = Object.entries(FIELD_COORDS);
  const bounds: LatLngBoundsExpression = entries.map(([, c]) => [c.lat, c.lng]);

  return (
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
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-neutral-500">
              {fieldCounts[name] ?? 0} logged {fieldCounts[name] === 1 ? "activity" : "activities"}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
