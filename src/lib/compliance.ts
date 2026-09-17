// Turns a log's structured fields into the checks an auditor actually
// asks about: was the product one you're allowed to use, was the pest on
// its label, did you record a rate, and is the re-entry interval on file.
//
// These are derived at render time rather than stored, so editing a log
// re-runs them immediately and a fix to the approved-product list applies
// to the whole history at once.
import { findApprovedProduct } from "./products";

export type ComplianceCheck = {
  label: string;
  /** "info" is for checks that don't apply to this log, e.g. no product used. */
  status: "pass" | "fail" | "info";
  detail?: string;
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
      ? { label: "Field and timing recorded", status: "pass", detail: `${log.field} · ${log.startTime}` }
      : { label: "Field and timing recorded", status: "fail", detail: "Missing field or start time" }
  );

  if (!log.product) {
    checks.push({
      label: "No product applied",
      status: "info",
      detail: "Nothing to verify against a label",
    });
    return checks;
  }

  const approved = findApprovedProduct(log.product);

  checks.push(
    approved
      ? { label: "Product on approved list", status: "pass", detail: `${approved.name} · ${approved.kind}` }
      : { label: "Product on approved list", status: "fail", detail: `"${log.product}" is not on the farm's list` }
  );

  if (!log.target) {
    checks.push({
      label: "Target on product label",
      status: "info",
      detail: "No target recorded for this application",
    });
  } else if (!approved) {
    checks.push({
      label: "Target on product label",
      status: "info",
      detail: "Can't check a label for an unapproved product",
    });
  } else {
    checks.push(
      approved.targets.includes(log.target)
        ? { label: "Target on product label", status: "pass", detail: log.target }
        : {
            label: "Target on product label",
            status: "fail",
            detail: `${log.target} is not a labeled target for ${approved.name}`,
          }
    );
  }

  checks.push(
    log.rate
      ? { label: "Application rate recorded", status: "pass", detail: log.rate }
      : { label: "Application rate recorded", status: "fail", detail: "No rate captured" }
  );

  if (approved) {
    checks.push({
      label: "Re-entry interval logged",
      status: "pass",
      detail: `${approved.reiHours}h after application`,
    });
  }

  return checks;
}
