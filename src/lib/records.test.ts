import { describe, it, expect } from "vitest";
import {
  applicationRecords,
  auditChecklist,
  recordsToCsv,
  reportSummary,
  totalApplied,
  type RecordSourceLog,
} from "./records";

function log(overrides: Partial<RecordSourceLog> = {}): RecordSourceLog {
  return {
    id: 1,
    date: new Date("2026-09-17T20:47:00Z"), // 1:47 PM at the farm
    startTime: "1:47 PM",
    activity: "Spraying",
    field: "Field A",
    employeeName: "Maya Patel",
    product: "Serenade ASO",
    target: "powdery mildew",
    rate: "24 oz/acre",
    method: "Ground rig",
    coordSource: "device",
    gpsAccuracyM: 8,
    ...overrides,
  };
}

describe("totalApplied", () => {
  it("multiplies a per-acre rate out over the block", () => {
    expect(totalApplied("24 oz/acre", 42.5)).toBe("1,020 oz");
  });

  it("converts a per-hectare rate before multiplying", () => {
    // 2 gal/hectare over 42.5 acres is 2 / 2.47105 gal per acre.
    expect(totalApplied("2 gal/hectare", 42.5)).toBe("34 gal");
  });

  it("keeps one decimal on small totals and none on large ones", () => {
    expect(totalApplied("0.2 qt/acre", 27.8)).toBe("5.6 qt");
    expect(totalApplied("6 oz/acre", 55)).toBe("330 oz");
  });

  it("returns null rather than a wrong number when there is no rate", () => {
    expect(totalApplied(null, 42.5)).toBeNull();
    expect(totalApplied("a couple of jugs", 42.5)).toBeNull();
  });
});

describe("applicationRecords", () => {
  it("only reports logs that actually applied something", () => {
    const records = applicationRecords([
      log({ id: 1 }),
      log({ id: 2, activity: "Scouting", product: null, target: null, rate: null }),
    ]);
    expect(records.map((r) => r.id)).toEqual([1]);
  });

  it("fills the state's required fields from the farm's own data", () => {
    const [record] = applicationRecords([log()]);
    expect(record).toMatchObject({
      dateKey: "2026-09-17",
      startTime: "1:47 PM",
      siteId: "0417-A",
      acres: 42.5,
      crop: "Processing tomatoes",
      epaRegNo: "69592-12",
      kind: "Fungicide",
      totalApplied: "1,020 oz",
      reiHours: 4,
      gpsVerified: true,
    });
    expect(record.gaps).toEqual([]);
  });

  it("flags an off-label application", () => {
    // Regalia is labeled for powdery mildew and botrytis, not aphids.
    const [record] = applicationRecords([
      log({ product: "Regalia", target: "aphids" }),
    ]);
    expect(record.gaps).toContain("offLabel");
  });

  it("flags a product that isn't on the approved list", () => {
    const [record] = applicationRecords([log({ product: "Whatever was in the shed" })]);
    expect(record.gaps).toContain("productNotApproved");
    expect(record.epaRegNo).toBeNull();
  });

  it("flags a missing rate or method", () => {
    const [record] = applicationRecords([log({ rate: null, method: null })]);
    expect(record.gaps).toEqual(expect.arrayContaining(["noRate", "noMethod"]));
  });

  it("does not demand pesticide paperwork for a fertilizer", () => {
    const [record] = applicationRecords([
      log({ product: "CAN-17", target: null, rate: "12 gal/acre" }),
    ]);
    expect(record.gaps).toEqual([]);
  });

  it("keeps a spray that named no product, and flags it", () => {
    // The bug this covers: the report used to include only logs that named
    // a product, so a spray logged with nothing captured (a phone that
    // recorded but couldn't transcribe) disappeared from the page entirely.
    const records = applicationRecords([
      log({ id: 59, product: null, target: null, rate: null }),
    ]);
    expect(records.map((r) => r.id)).toEqual([59]);
    expect(records[0].gaps).toContain("noProduct");
    // Not "not on the approved list": there was no product to check.
    expect(records[0].gaps).not.toContain("productNotApproved");
  });

  it("still leaves off activities that apply nothing", () => {
    const records = applicationRecords([
      log({ id: 1, activity: "Harvesting", product: null, target: null, rate: null }),
    ]);
    expect(records).toEqual([]);
  });

  it("orders newest first so the current month reads from the top", () => {
    const records = applicationRecords([
      log({ id: 1, date: new Date("2026-09-10T18:00:00Z") }),
      log({ id: 2, date: new Date("2026-09-17T18:00:00Z") }),
    ]);
    expect(records.map((r) => r.id)).toEqual([2, 1]);
  });
});

describe("reportSummary", () => {
  it("counts what can be filed and what can't", () => {
    const records = applicationRecords([
      log({ id: 1 }),
      log({ id: 2, field: "Field B", rate: null }),
    ]);
    expect(reportSummary(records)).toEqual({
      applications: 2,
      filable: 1,
      flagged: 1,
      acresTreated: 80.7,
      completeness: 50,
    });
  });

  it("reports an empty month as complete rather than 0%", () => {
    expect(reportSummary([]).completeness).toBe(100);
  });
});

describe("auditChecklist", () => {
  it("scores every item 1 when the records are clean", () => {
    const records = applicationRecords([log()]);
    const checklist = auditChecklist(records);
    expect(checklist.every((i) => i.score === 1)).toBe(true);
  });

  it("scores the failing item 0 and names the record behind it", () => {
    const records = applicationRecords([log({ id: 7, rate: null })]);
    const rates = auditChecklist(records).find((i) => i.id === "ratesRecorded")!;
    expect(rates.score).toBe(0);
    expect(rates.failing).toEqual([7]);
  });

  it("fails a missing product once, not once per label fact", () => {
    const checklist = auditChecklist(
      applicationRecords([log({ id: 59, product: null, target: null })])
    );
    const byId = Object.fromEntries(checklist.map((i) => [i.id, i]));
    expect(byId.productRecorded).toMatchObject({ score: 0, failing: [59] });
    // No product means no EPA number or REI to look up, so those items
    // don't pile on for a product that doesn't exist.
    expect(byId.epaRegNos.applicable).toBe(0);
    expect(byId.reiDocumented.applicable).toBe(0);
  });

  it("skips items that don't apply to the record", () => {
    // A fertilizer has no EPA number and no label target, so those items
    // shouldn't be scored against it.
    const records = applicationRecords([log({ product: "CAN-17", target: null })]);
    const checklist = auditChecklist(records);
    expect(checklist.find((i) => i.id === "epaRegNos")).toMatchObject({
      score: 1,
      applicable: 0,
    });
  });
});

describe("recordsToCsv", () => {
  it("writes a header row and one line per application", () => {
    const csv = recordsToCsv(applicationRecords([log()]));
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("EPA reg. no.");
    expect(lines[1]).toContain("69592-12");
    // Quoted, because the thousands separator would otherwise split the cell.
    expect(lines[1]).toContain('"1,020 oz"');
  });

  it("quotes values containing commas so a spreadsheet reads them back", () => {
    const csv = recordsToCsv(applicationRecords([log({ product: "Serenade ASO, 2.5 gal" })]));
    expect(csv).toContain('"Serenade ASO, 2.5 gal"');
  });
});
