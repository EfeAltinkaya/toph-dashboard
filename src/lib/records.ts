// Turns the log history into the document a farm actually has to produce.
//
// California requires every agricultural pesticide application to be
// reported monthly, and the state rejects a report that is missing the
// operator ID, site ID, acreage, EPA registration number, method or start
// time. The row shape below is that list. Everything in it comes from what
// a worker said in the field plus the farm's own reference data, which is
// the whole claim the product makes: the record assembles itself.
//
// Pure functions over plain objects, so the aggregation and the scoring are
// unit-tested without a database or a browser.
import { fieldInfo } from "./fields";
import { findApprovedProduct } from "./products";
import { farmDayKey } from "./date-utils";

export type RecordSourceLog = {
  id: number;
  date: Date;
  startTime: string;
  activity: string;
  field: string;
  employeeName: string;
  product: string | null;
  target: string | null;
  rate: string | null;
  method: string | null;
  coordSource: string;
  gpsAccuracyM: number | null;
};

/** One line of the use report. */
export type ApplicationRecord = {
  id: number;
  dateKey: string;
  startTime: string;
  worker: string;
  field: string;
  siteId: string;
  acres: number;
  crop: string;
  /** Null when an application was logged without naming the product. */
  product: string | null;
  epaRegNo: string | null;
  kind: string | null;
  rate: string | null;
  /** Rate multiplied out over the block's acreage, e.g. "1,020 oz". */
  totalApplied: string | null;
  target: string | null;
  method: string | null;
  reiHours: number | null;
  gpsVerified: boolean;
  gpsAccuracyM: number | null;
  /** Which requirements this line fails. Empty means the line is filable. */
  gaps: GapId[];
};

/**
 * Activities that put a product on the ground. A log of one of these
 * belongs on the use report whether or not a product was captured: a
 * spray with no product recorded is the worst gap a report can have, and
 * leaving it off the page would hide exactly the record an auditor would
 * find.
 */
export const APPLICATION_ACTIVITIES = ["Spraying", "Soil work"];

export type GapId =
  | "noProduct"
  | "productNotApproved"
  | "noEpaRegNo"
  | "offLabel"
  | "noRate"
  | "noMethod"
  | "noTarget";

const ACRES_PER_HECTARE = 2.47105;

/** "24 oz/acre" over 42.5 acres -> "1,020 oz". */
export function totalApplied(rate: string | null, acres: number): string | null {
  if (!rate) return null;
  const match = /^([\d.]+)\s+(\S+)\/(\S+)$/.exec(rate);
  if (!match) return null;
  const [, amount, unit, area] = match;
  const perAcre = area === "hectare" ? Number(amount) / ACRES_PER_HECTARE : Number(amount);
  const total = perAcre * acres;
  if (!Number.isFinite(total)) return null;
  // Product is bought in whole containers; a tenth of an ounce of precision
  // is noise on a 40-acre block.
  const rounded = total < 10 ? Math.round(total * 10) / 10 : Math.round(total);
  return `${rounded.toLocaleString("en-US")} ${unit}`;
}

/**
 * The applications in the log history, as report lines: every log that
 * named a product, plus every spray or soil application that didn't.
 * Scouting, pruning and harvest put nothing on the ground and are left off
 * rather than padding the document with blank rows.
 */
export function isApplication(log: { product: string | null; activity: string }) {
  return !!log.product || APPLICATION_ACTIVITIES.includes(log.activity);
}

export function applicationRecords(logs: RecordSourceLog[]): ApplicationRecord[] {
  return logs
    .filter(isApplication)
    .map((log) => {
      const info = fieldInfo(log.field);
      const approved = findApprovedProduct(log.product);
      const isPesticide = approved ? approved.kind !== "Fertilizer" : true;
      const gaps: GapId[] = [];

      // No product at all is its own failure, and it's the one that
      // matters: "not on the approved list" would be true but would read
      // as if the worker had named the wrong product.
      if (!log.product) gaps.push("noProduct");
      else if (!approved) gaps.push("productNotApproved");
      // A fertilizer has no EPA number to be missing, and nothing to be
      // off-label for: it isn't reportable as a pesticide use.
      if (approved && isPesticide && !approved.epaRegNo) gaps.push("noEpaRegNo");
      if (!log.target && isPesticide) gaps.push("noTarget");
      if (approved && log.target && !approved.targets.includes(log.target)) {
        gaps.push("offLabel");
      }
      if (!log.rate) gaps.push("noRate");
      if (!log.method) gaps.push("noMethod");

      return {
        id: log.id,
        dateKey: farmDayKey(log.date),
        startTime: log.startTime,
        worker: log.employeeName,
        field: log.field,
        siteId: info.siteId,
        acres: info.acres,
        crop: info.crop,
        product: log.product,
        epaRegNo: approved?.epaRegNo ?? null,
        kind: approved?.kind ?? null,
        rate: log.rate,
        totalApplied: totalApplied(log.rate, info.acres),
        target: log.target,
        method: log.method,
        reiHours: approved ? approved.reiHours : null,
        gpsVerified: log.coordSource === "device",
        gpsAccuracyM: log.gpsAccuracyM,
        gaps,
      };
    })
    .sort((a, b) => (a.dateKey === b.dateKey ? b.id - a.id : a.dateKey < b.dateKey ? 1 : -1));
}

export type ReportSummary = {
  applications: number;
  filable: number;
  flagged: number;
  acresTreated: number;
  /** Share of lines with no gaps, 0-100. */
  completeness: number;
};

export function reportSummary(records: ApplicationRecord[]): ReportSummary {
  const filable = records.filter((r) => r.gaps.length === 0).length;
  const acres = records.reduce((sum, r) => sum + r.acres, 0);
  return {
    applications: records.length,
    filable,
    flagged: records.length - filable,
    acresTreated: Math.round(acres * 10) / 10,
    completeness: records.length ? Math.round((filable / records.length) * 100) : 100,
  };
}

/**
 * The audit checklist, scored from the records rather than filled in by
 * hand. Each item is the yes/no a third-party auditor works through, and
 * scoring it 0 or 1 with the offending records named is the same shape as
 * the paper form it replaces — except the farm can see the score before
 * the auditor arrives instead of after.
 */
export type ChecklistItem = {
  id: ChecklistId;
  /** 1 = every applicable record satisfies it. */
  score: 0 | 1;
  /** Records that fail the item, by id, for the Comments column. */
  failing: number[];
  /** Records the item applies to at all. */
  applicable: number;
};

export type ChecklistId =
  | "productRecorded"
  | "productsApproved"
  | "epaRegNos"
  | "onLabel"
  | "ratesRecorded"
  | "methodsRecorded"
  | "targetsRecorded"
  | "siteIds"
  | "timing"
  | "applicator"
  | "reiDocumented"
  | "gpsVerified";

function item(
  id: ChecklistId,
  records: ApplicationRecord[],
  fails: (r: ApplicationRecord) => boolean,
  appliesTo: (r: ApplicationRecord) => boolean = () => true
): ChecklistItem {
  const scope = records.filter(appliesTo);
  const failing = scope.filter(fails).map((r) => r.id);
  return {
    id,
    score: failing.length === 0 ? 1 : 0,
    failing,
    applicable: scope.length,
  };
}

export function auditChecklist(records: ApplicationRecord[]): ChecklistItem[] {
  // Label facts (EPA number, target, REI) can only be checked for a product
  // that was named. A spray with no product fails "product recorded", once,
  // instead of failing four items for a product that doesn't exist.
  const isPesticide = (r: ApplicationRecord) => !!r.product && r.kind !== "Fertilizer";
  return [
    item("productRecorded", records, (r) => !r.product),
    item("productsApproved", records, (r) => r.gaps.includes("productNotApproved")),
    item("epaRegNos", records, (r) => !r.epaRegNo, isPesticide),
    item("onLabel", records, (r) => r.gaps.includes("offLabel")),
    item("targetsRecorded", records, (r) => !r.target, isPesticide),
    item("ratesRecorded", records, (r) => !r.rate),
    item("methodsRecorded", records, (r) => !r.method),
    item("siteIds", records, (r) => !r.siteId || !r.acres),
    item("timing", records, (r) => !r.dateKey || !r.startTime),
    item("applicator", records, (r) => !r.worker),
    item("reiDocumented", records, (r) => r.reiHours === null, isPesticide),
    item("gpsVerified", records, (r) => !r.gpsVerified),
  ];
}

const CSV_HEADERS = [
  "Date",
  "Start time",
  "Site ID",
  "Block",
  "Crop",
  "Acres treated",
  "Product",
  "EPA reg. no.",
  "Type",
  "Rate",
  "Total applied",
  "Target pest",
  "Method",
  "REI (hours)",
  "Applicator",
  "Location",
  "Status",
] as const;

function csvCell(value: string | number | null): string {
  if (value === null || value === "") return "";
  const text = String(value);
  // A product name or comment can contain a comma or a quote; anything
  // written to a CSV has to survive being read back by a spreadsheet.
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * The report as a CSV. Deliberately English-only: this is the artifact
 * that gets filed with the county or handed to an auditor, and the filing
 * is in English no matter which language the work was logged in.
 */
export function recordsToCsv(records: ApplicationRecord[]): string {
  const rows = records.map((r) =>
    [
      r.dateKey,
      r.startTime,
      r.siteId,
      r.field,
      r.crop,
      r.acres,
      r.product,
      r.epaRegNo,
      r.kind,
      r.rate,
      r.totalApplied,
      r.target,
      r.method,
      r.reiHours,
      r.worker,
      r.gpsVerified
        ? `GPS ${r.gpsAccuracyM ? `±${Math.round(r.gpsAccuracyM)}m` : "verified"}`
        : "Block coordinates",
      r.gaps.length === 0
        ? r.gpsVerified
          ? "Complete"
          : "Complete (no GPS fix)"
        : `Incomplete: ${r.gaps.join(", ")}`,
    ]
      .map(csvCell)
      .join(",")
  );
  return [CSV_HEADERS.join(","), ...rows].join("\n");
}
