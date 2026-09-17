import { describe, it, expect } from "vitest";
import { en } from "./en";
import { es } from "./es";
import { dictionaries, format, tr } from "./index";

/** Every leaf string in a dictionary, as "path.to.key" -> value. */
function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  const out: Record<string, string> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    Object.assign(out, flatten(child, prefix ? `${prefix}.${key}` : key));
  }
  return out;
}

const flatEn = flatten(en);
const flatEs = flatten(es);

describe("dictionaries", () => {
  // TypeScript already refuses to build if a key is missing, so this is a
  // guard against the other failure modes: an empty string, or a
  // placeholder that only exists on one side.
  it("has the same keys in both languages", () => {
    expect(Object.keys(flatEs).sort()).toEqual(Object.keys(flatEn).sort());
  });

  it("has no empty strings", () => {
    const empty = Object.entries(flatEs).filter(([, value]) => value.trim() === "");
    expect(empty).toEqual([]);
  });

  it("uses the same placeholders in both languages", () => {
    const placeholders = (value: string) => (value.match(/\{(\w+)\}/g) ?? []).sort();
    const mismatched = Object.keys(flatEn).filter(
      (key) => placeholders(flatEn[key]).join() !== placeholders(flatEs[key]).join()
    );
    expect(mismatched).toEqual([]);
  });

  it("actually translates: Spanish differs from English for real copy", () => {
    // Proper nouns and codes legitimately match ("Toph", "botrytis"), but
    // the bulk of the copy should not be identical — that would mean a
    // section was pasted across untranslated.
    const identical = Object.keys(flatEn).filter(
      (key) => flatEn[key] === flatEs[key] && flatEn[key].split(" ").length > 3
    );
    expect(identical).toEqual([]);
  });
});

describe("format", () => {
  it("fills placeholders", () => {
    expect(format("{count} fields · {place}", { count: 4, place: "Firebaugh" })).toBe(
      "4 fields · Firebaugh"
    );
  });

  it("leaves unknown placeholders visible rather than dropping them", () => {
    expect(format("{count} of {total}", { count: 1 })).toBe("1 of {total}");
  });
});

describe("tr", () => {
  it("translates known vocabulary and passes through anything else", () => {
    expect(tr(dictionaries.es.vocab.activities, "Spraying")).toBe("Fumigación");
    expect(tr(dictionaries.es.vocab.fields, "North Block")).toBe("North Block");
  });
});
