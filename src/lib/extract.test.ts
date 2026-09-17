import { describe, it, expect } from "vitest";
import { extractActivity, extractField, extractLogFields, wordsToDigits } from "./extract";

describe("extractActivity", () => {
  it("recognizes activities from any verb form, in English or Spanish", () => {
    expect(extractActivity("We sprayed the north rows")).toBe("Spraying");
    expect(extractActivity("Rociamos el campo A esta mañana")).toBe("Spraying");
    expect(extractActivity("cosechamos fresas")).toBe("Harvesting");
  });

  it("picks whichever activity was mentioned first", () => {
    expect(extractActivity("irrigated Field B, then scouted for mites")).toBe("Irrigation");
  });

  it("returns null when no activity is described", () => {
    expect(extractActivity("nothing to report today")).toBeNull();
  });
});

describe("extractField", () => {
  it("normalizes field, block, and campo to a field name", () => {
    expect(extractField("worked in field a")).toBe("Field A");
    expect(extractField("en el campo C")).toBe("Field C");
    expect(extractField("finished block d before lunch")).toBe("Field D");
  });

  it("ignores letters that aren't one of the farm's fields", () => {
    expect(extractField("field z")).toBeNull();
  });
});

describe("wordsToDigits", () => {
  it("handles compound English tens before single words", () => {
    expect(wordsToDigits("twenty-four ounces")).toBe("24 ounces");
    expect(wordsToDigits("twenty four ounces")).toBe("24 ounces");
  });

  it("handles Spanish numbers, which are single words", () => {
    expect(wordsToDigits("veinticuatro onzas")).toBe("24 onzas");
  });

  it("leaves digits alone", () => {
    expect(wordsToDigits("24 oz")).toBe("24 oz");
  });
});

describe("extractLogFields", () => {
  it("pulls product, target, and rate out of an English transcript", () => {
    const result = extractLogFields(
      "Sprayed Serenade ASO on the north block for aphids this morning, twenty-four ounces per acre."
    );
    expect(result).toEqual({
      product: "Serenade ASO",
      target: "aphids",
      rate: "24 oz/acre",
    });
  });

  it("pulls the same fields out of the Spanish version", () => {
    // The whole point of extracting rather than storing raw text: a log
    // recorded in Spanish has to produce the same structured record.
    const result = extractLogFields(
      "Rocié Serenade ASO en el bloque norte contra pulgones. Usamos veinticuatro onzas por acre."
    );
    expect(result).toEqual({
      product: "Serenade ASO",
      target: "aphids",
      rate: "24 oz/acre",
    });
  });

  it("matches accented pest names", () => {
    expect(extractLogFields("tratamiento contra ácaros").target).toBe("mites");
  });

  it("reads a rate written with a slash", () => {
    expect(extractLogFields("applied at 2 gal/acre").rate).toBe("2 gal/acre");
  });

  it("normalizes units and decimal commas", () => {
    expect(extractLogFields("1,5 litros por hectárea").rate).toBe("1.5 L/hectare");
  });

  it("returns nulls when there's nothing to extract", () => {
    expect(extractLogFields("Walked the rows checking irrigation lines.")).toEqual({
      product: null,
      target: null,
      rate: null,
    });
  });

  it("ignores products that aren't on the farm's approved list", () => {
    expect(extractLogFields("sprayed SomeUnknownBrand at 4 oz per acre").product).toBeNull();
  });
});
