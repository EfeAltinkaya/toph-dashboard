// Real-world coordinates in the farmland surrounding Firebaugh, CA (San
// Joaquin Valley) — visually confirmed via satellite imagery to be actual
// crop fields, not the town itself. An earlier version of these coordinates
// landed inside a built-up area by mistake; these were checked by hand.
// A production version of Toph would store the farm's real field boundaries;
// these stand in for that for the demo.
//
// Acreage, crop and site ID sit alongside the coordinates because a filed
// pesticide use report needs all three: the state matches the site ID
// against its own records, and the acres treated are what turn a per-acre
// rate into the total product used. Crops are ones actually grown around
// Firebaugh.
export type FieldInfo = {
  lat: number;
  lng: number;
  /** Site ID as registered with the county agricultural commissioner. */
  siteId: string;
  acres: number;
  crop: string;
};

export const FIELDS: Record<string, FieldInfo> = {
  "Field A": {
    lat: 36.824779,
    lng: -120.506436,
    siteId: "0417-A",
    acres: 42.5,
    crop: "Processing tomatoes",
  },
  "Field B": {
    lat: 36.840579,
    lng: -120.539395,
    siteId: "0417-B",
    acres: 38.2,
    crop: "Almonds",
  },
  "Field C": {
    lat: 36.83,
    lng: -120.418545,
    siteId: "0417-C",
    acres: 55.0,
    crop: "Cantaloupe",
  },
  "Field D": {
    lat: 36.796604,
    lng: -120.490986,
    siteId: "0417-D",
    acres: 27.8,
    crop: "Garlic",
  },
};

export const FIELD_COORDS: Record<string, { lat: number; lng: number }> =
  Object.fromEntries(
    Object.entries(FIELDS).map(([name, f]) => [name, { lat: f.lat, lng: f.lng }])
  );

export const FIELD_NAMES = Object.keys(FIELDS);

export function coordsForField(field: string) {
  return FIELD_COORDS[field] ?? FIELD_COORDS["Field A"];
}

export function fieldInfo(field: string): FieldInfo {
  return FIELDS[field] ?? FIELDS["Field A"];
}
