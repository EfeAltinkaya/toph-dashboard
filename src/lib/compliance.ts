// Turns a log's structured fields into the checks an auditor actually
// asks about: was the product one you're allowed to use, was the pest on
// its label, did you record a rate, and is the re-entry interval on file.
//
// These are derived at render time rather than stored, so editing a log
// re-runs them immediately and a fix to the approved-product list applies
// to the whole history at once.
//
// Checks return keys and raw values, not sentences: the same check has to
// read correctly in English and Spanish (see describeCheck in src/i18n).
import { findApprovedProduct } from "./products";
import type { Dictionary } from "@/i18n/en";

export type ComplianceCheck = {
  id: keyof Dictionary["compliance"]["labels"];
  /** "info" is for checks that don't apply to this log, e.g. no product used. */
  status: "pass" | "fail" | "info";
  detail: keyof Dictionary["compliance"]["details"];
  params?: Record<string, string>;
};

export type ComplianceInput = {
  field: string;
  startTime: string;
  product: string | null;
  target: string | null;
  rate: string | null;
};

export function complianceChecks(log: ComplianceInput): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  checks.push(
    log.field && log.startTime
      ? {
          id: "fieldTiming",
          status: "pass",
          detail: "fieldTiming",
          params: { field: log.field, time: log.startTime },
        }
      : { id: "fieldTiming", status: "fail", detail: "fieldTimingMissing" }
  );

  if (!log.product) {
    checks.push({ id: "noProduct", status: "info", detail: "noProduct" });
    return checks;
  }

  const approved = findApprovedProduct(log.product);

  checks.push(
    approved
      ? {
          id: "productApproved",
          status: "pass",
          detail: "productApproved",
          params: { product: approved.name, kind: approved.kind },
        }
      : {
          id: "productApproved",
          status: "fail",
          detail: "productNotApproved",
          params: { product: log.product },
        }
  );

  if (!log.target) {
    checks.push({ id: "targetOnLabel", status: "info", detail: "targetMissing" });
  } else if (!approved) {
    checks.push({ id: "targetOnLabel", status: "info", detail: "targetUnapproved" });
  } else {
    checks.push(
      approved.targets.includes(log.target)
        ? {
            id: "targetOnLabel",
            status: "pass",
            detail: "targetOnLabel",
            params: { target: log.target },
          }
        : {
            id: "targetOnLabel",
            status: "fail",
            detail: "targetNotOnLabel",
            params: { target: log.target, product: approved.name },
          }
    );
  }

  checks.push(
    log.rate
      ? { id: "rateRecorded", status: "pass", detail: "rate", params: { rate: log.rate } }
      : { id: "rateRecorded", status: "fail", detail: "rateMissing" }
  );

  if (approved) {
    checks.push({
      id: "reiLogged",
      status: "pass",
      detail: "rei",
      params: { hours: String(approved.reiHours) },
    });
  }

  return checks;
}
