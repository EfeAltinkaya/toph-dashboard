// The operation's own identifiers, as they appear on a filed report.
//
// California requires every agricultural pesticide application to be
// reported monthly, and a report is rejected outright if the operator ID
// number, site ID, acreage, EPA registration number, method or start time
// is missing or doesn't match the state's records
// (https://www.cdpr.ca.gov/pesticide-use-in-california/pesticide-use-reporting/).
// That list is why the record in this app captures what it captures.
//
// Demo values for one farm. A production build would hold these on the
// Farm row, entered once during onboarding.
export const FARM = {
  name: "Bay Ranch",
  /** Operator identification number, issued by the county agricultural commissioner. */
  operatorId: "10-2026-0417",
  county: "Fresno County, California",
  /** Reports are due by the 10th of the month after the work, and kept on file for two years. */
  retentionYears: 2,
} as const;

/** How a product was put out. The state reports on method, so the worker picks one. */
export const APPLICATION_METHODS = [
  "Ground rig",
  "Airblast",
  "Backpack",
  "Chemigation",
] as const;

export type ApplicationMethod = (typeof APPLICATION_METHODS)[number];
