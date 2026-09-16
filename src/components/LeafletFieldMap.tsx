"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

// A DivIcon (plain styled HTML) instead of Leaflet's default marker image,
// which avoids the classic "marker icon 404s under a bundler" issue since
// there's no image asset path to misconfigure.
const pin = divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Esri's World Imagery tile service: free, publicly hosted satellite/aerial
// tiles with no API key, unlike Google/Mapbox. Good enough for a demo; a
// production app would use a licensed provider under its own terms.
const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export function LeafletFieldMap({
  lat,
  lng,
  label,
  zoom = 16,
  interactive = false,
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
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      zoomControl={interactive}
      attributionControl={interactive}
      className={className}
    >
      <TileLayer url={TILE_URL} maxZoom={19} />
      <Marker position={[lat, lng]} icon={pin}>
        {label && <Popup>{label}</Popup>}
      </Marker>
    </MapContainer>
  );
}
