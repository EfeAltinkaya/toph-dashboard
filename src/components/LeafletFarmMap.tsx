"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon, type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { FIELD_COORDS } from "@/lib/fields";

const pin = divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.5)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

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
