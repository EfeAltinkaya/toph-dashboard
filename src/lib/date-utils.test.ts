import { describe, it, expect } from "vitest";
import { parseLocalDate } from "./date-utils";

describe("parseLocalDate", () => {
  it("preserves the exact calendar day regardless of local timezone", () => {
    const date = parseLocalDate("2026-09-16");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8); // September, zero-indexed
    expect(date.getDate()).toBe(16);
  });

  it("does not shift a day backward the way `new Date(string)` can", () => {
    // This is the exact bug this function exists to avoid: parsing a plain
    // date string as UTC midnight, then reading it back in a timezone
    // behind UTC, can land on the previous day.
    const viaLocalParts = parseLocalDate("2026-01-01");
    expect(viaLocalParts.getDate()).toBe(1);
    expect(viaLocalParts.getMonth()).toBe(0);
  });
});
