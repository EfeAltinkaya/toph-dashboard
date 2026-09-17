// Pure date helpers, kept separate from log-actions.ts (which pulls in
// Prisma/the database) so they're trivial to unit test in isolation.

// Every timestamp a worker sees, and every one that goes into a compliance
// record, is in the farm's local time — not the server's and not the
// viewer's. Vercel's functions run in UTC, so a log recorded at 1:47 PM in
// California was being stamped 8:47 PM. And "the farm's day" is the right
// unit anyway: a record of when spraying happened has to read the same to
// the operator, to a manager checking from another state, and to an
// auditor reading it next year. Deriving it from the reader's browser
// would make one event show three different times.
//
// One constant, because this build is one farm. A multi-farm product would
// hang this off the Farm row, and every helper here already takes the zone
// as an argument to make that a one-line change.
export const FARM_TIME_ZONE = "America/Los_Angeles";

// How far the zone is from UTC at a given instant, in minutes. Read out of
// Intl rather than hardcoded, so daylight saving is handled by the same
// database the rest of the platform uses instead of a magic -7/-8.
function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  const asIfUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  // Millisecond precision is lost by formatToParts, so line both sides up
  // on the second before differencing.
  return (asIfUtc - Math.floor(instant.getTime() / 1000) * 1000) / 60000;
}

/** "YYYY-MM-DD" for an instant, as the calendar day it falls on at the farm. */
export function farmDayKey(date: Date, timeZone = FARM_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** "YYYY-MM" for an instant, as the month it falls in at the farm. */
export function farmMonthKey(date: Date, timeZone = FARM_TIME_ZONE): string {
  return farmDayKey(date, timeZone).slice(0, 7);
}

/**
 * The instant at which a calendar day starts at the farm. A plain
 * "YYYY-MM-DD" from an <input type="date"> handed to `new Date()` is UTC
 * midnight, which is 5 PM the previous day in California.
 */
export function farmDayStart(dateStr: string, timeZone = FARM_TIME_ZONE): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const utcGuess = Date.UTC(year, month - 1, day);
  // The offset has to be sampled at roughly the right instant, because it
  // changes across a DST boundary. One correction lands on the answer for
  // every case except a midnight inside the shifted hour itself.
  const offset = zoneOffsetMinutes(new Date(utcGuess), timeZone);
  const candidate = new Date(utcGuess - offset * 60000);
  const corrected = zoneOffsetMinutes(candidate, timeZone);
  return corrected === offset
    ? candidate
    : new Date(utcGuess - corrected * 60000);
}

/** Midnight at the farm for the day `now` falls on. */
export function startOfFarmDay(now: Date = new Date(), timeZone = FARM_TIME_ZONE): Date {
  return farmDayStart(farmDayKey(now, timeZone), timeZone);
}

/** Midnight at the farm `days` days after the day `from` falls on. */
export function farmDayOffset(
  from: Date,
  days: number,
  timeZone = FARM_TIME_ZONE
): Date {
  const start = startOfFarmDay(from, timeZone);
  // Step through noon: adding 24h to a midnight that crosses a DST change
  // lands at 11 PM or 1 AM, and re-deriving the day key from noon is
  // immune to that.
  const noonish = new Date(start.getTime() + days * 86400000 + 43200000);
  return farmDayStart(farmDayKey(noonish, timeZone), timeZone);
}

/** "10:00 AM", "1:30 PM" or "13:30" -> minutes past midnight. */
export function parseClockTime(value: string): number | null {
  const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(value);
  if (!match) return null;
  const [, rawHour, rawMinute, meridiem] = match;
  let hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (minute > 59) return null;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    const pm = meridiem.toUpperCase() === "PM";
    hour = hour === 12 ? (pm ? 12 : 0) : pm ? hour + 12 : hour;
  } else if (hour > 23) {
    return null;
  }
  return hour * 60 + minute;
}

/**
 * The instant for a calendar day plus a wall-clock time at the farm, used
 * when a manager edits a log's date or start time by hand.
 *
 * Editing used to store farm midnight and keep the start time only as a
 * display string, which quietly moved every edited log to the top of its
 * day and broke any ordering or "today" check that read the timestamp.
 * The two have to stay the same moment.
 */
export function farmDateAt(
  dateStr: string,
  time: string,
  timeZone = FARM_TIME_ZONE
): Date {
  const start = farmDayStart(dateStr, timeZone);
  const minutes = parseClockTime(time);
  return minutes === null ? start : new Date(start.getTime() + minutes * 60000);
}

export function formatTime(date: Date, timeZone = FARM_TIME_ZONE): string {
  return date.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
}
