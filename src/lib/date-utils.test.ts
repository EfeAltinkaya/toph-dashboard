import { describe, it, expect } from "vitest";
import {
  FARM_TIME_ZONE,
  farmDayKey,
  farmDayOffset,
  farmDayStart,
  formatTime,
  startOfFarmDay,
} from "./date-utils";

describe("farm-local time", () => {
  it("stamps a log with the farm's wall-clock time, not the server's", () => {
    // 1:47 PM in California during daylight saving is 20:47 UTC. Vercel's
    // functions run in UTC, which is how a worker's 1:47 PM log first
    // showed up on the dashboard as 8:47 PM.
    const instant = new Date("2026-09-17T20:47:00Z");
    expect(formatTime(instant)).toBe("1:47 PM");
  });

  it("uses the offset in force on the day, not a fixed one", () => {
    // Standard time: same wall clock, an hour further from UTC.
    expect(formatTime(new Date("2026-01-15T21:47:00Z"))).toBe("1:47 PM");
  });

  it("reads an instant as the calendar day it falls on at the farm", () => {
    // 4 AM UTC on the 18th is still the evening of the 17th in California,
    // so a late-evening log must not count toward the next day's totals.
    expect(farmDayKey(new Date("2026-09-18T04:30:00Z"))).toBe("2026-09-17");
    expect(farmDayKey(new Date("2026-09-18T18:30:00Z"))).toBe("2026-09-18");
  });

  it("turns a plain date string into farm midnight, not UTC midnight", () => {
    const start = farmDayStart("2026-09-17");
    expect(start.toISOString()).toBe("2026-09-17T07:00:00.000Z");
    expect(farmDayKey(start)).toBe("2026-09-17");
  });

  it("brackets a farm day so every instant inside it is included", () => {
    const now = new Date("2026-09-18T04:30:00Z"); // 9:30 PM on the 17th
    const start = startOfFarmDay(now);
    const end = farmDayOffset(now, 1);
    expect(now >= start && now < end).toBe(true);
    expect(farmDayKey(start)).toBe("2026-09-17");
    expect(farmDayKey(end)).toBe("2026-09-18");
  });

  it("keeps day boundaries 24h-agnostic across a DST change", () => {
    // Clocks move forward on 2026-03-08, so that farm day is 23 hours long.
    const springForward = farmDayStart("2026-03-07");
    const next = farmDayOffset(springForward, 1);
    expect(farmDayKey(next)).toBe("2026-03-08");
    expect(next.getTime() - springForward.getTime()).toBe(24 * 3600000);
    const dayAfter = farmDayOffset(next, 1);
    expect(farmDayKey(dayAfter)).toBe("2026-03-09");
    expect(dayAfter.getTime() - next.getTime()).toBe(23 * 3600000);
  });

  it("pins the zone rather than following the machine running the code", () => {
    expect(FARM_TIME_ZONE).toBe("America/Los_Angeles");
  });
});
