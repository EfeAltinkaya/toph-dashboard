// Real-world coordinates (Fresno County, CA — a real agricultural area) so
// the map shows actual satellite farmland imagery instead of a placeholder.
// A production version of Toph would store the farm's real field boundaries;
// these stand in for that for the demo.
export const FIELD_COORDS: Record<string, { lat: number; lng: number }> = {
  "Field A": { lat: 36.7378, lng: -119.7871 },
  "Field B": { lat: 36.7395, lng: -119.783 },
  "Field C": { lat: 36.734, lng: -119.7855 },
  "Field D": { lat: 36.736, lng: -119.78 },
};

export const FIELD_NAMES = Object.keys(FIELD_COORDS);

export function coordsForField(field: string) {
  return FIELD_COORDS[field] ?? { lat: 36.7378, lng: -119.7871 };
}
