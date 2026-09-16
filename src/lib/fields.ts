// Real-world coordinates in the farmland surrounding Firebaugh, CA (San
// Joaquin Valley) — visually confirmed via satellite imagery to be actual
// crop fields, not the town itself. An earlier version of these coordinates
// landed inside a built-up area by mistake; these were checked by hand.
// A production version of Toph would store the farm's real field boundaries;
// these stand in for that for the demo.
export const FIELD_COORDS: Record<string, { lat: number; lng: number }> = {
  "Field A": { lat: 36.824779, lng: -120.506436 },
  "Field B": { lat: 36.840579, lng: -120.539395 },
  "Field C": { lat: 36.83, lng: -120.418545 },
  "Field D": { lat: 36.796604, lng: -120.490986 },
};

export const FIELD_NAMES = Object.keys(FIELD_COORDS);

export function coordsForField(field: string) {
  return FIELD_COORDS[field] ?? FIELD_COORDS["Field A"];
}
