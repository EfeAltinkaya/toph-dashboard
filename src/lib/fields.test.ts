import { describe, it, expect } from "vitest";
import { coordsForField, FIELD_COORDS, FIELD_NAMES } from "./fields";

describe("coordsForField", () => {
  it("returns the exact stored coordinates for a known field", () => {
    expect(coordsForField("Field B")).toEqual(FIELD_COORDS["Field B"]);
  });

  it("falls back to Field A instead of returning undefined for an unknown field", () => {
    // Guards against a log ever ending up with a null island (0,0) pin if a
    // field name is ever renamed/misspelled somewhere upstream.
    expect(coordsForField("Field Z")).toEqual(FIELD_COORDS["Field A"]);
    expect(coordsForField("")).toEqual(FIELD_COORDS["Field A"]);
  });

  it("has real, distinct coordinates for every named field", () => {
    for (const name of FIELD_NAMES) {
      const { lat, lng } = FIELD_COORDS[name];
      expect(lat).toBeGreaterThan(-90);
      expect(lat).toBeLessThan(90);
      expect(lng).toBeGreaterThan(-180);
      expect(lng).toBeLessThan(180);
    }
    const uniqueCoords = new Set(FIELD_NAMES.map((n) => `${FIELD_COORDS[n].lat},${FIELD_COORDS[n].lng}`));
    expect(uniqueCoords.size).toBe(FIELD_NAMES.length);
  });
});
