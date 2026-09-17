import { describe, it, expect } from "vitest";
import { complianceChecks } from "./compliance";

const base = {
  field: "Field A",
  startTime: "7:00 AM",
  product: null as string | null,
  target: null as string | null,
  rate: null as string | null,
};

function statusFor(checks: ReturnType<typeof complianceChecks>, id: string) {
  return checks.find((c) => c.id === id)?.status;
}

describe("complianceChecks", () => {
  it("passes everything for a labeled application with a rate", () => {
    const checks = complianceChecks({
      ...base,
      product: "Serenade ASO",
      target: "aphids",
      rate: "24 oz/acre",
    });
    expect(checks.every((c) => c.status === "pass")).toBe(true);
  });

  it("flags a target that isn't on that product's label", () => {
    // Regalia is labeled for mildew and botrytis, not aphids.
    const checks = complianceChecks({
      ...base,
      product: "Regalia",
      target: "aphids",
      rate: "1 qt/acre",
    });
    expect(statusFor(checks, "targetOnLabel")).toBe("fail");
    expect(statusFor(checks, "productApproved")).toBe("pass");
  });

  it("flags a product the farm hasn't approved", () => {
    const checks = complianceChecks({
      ...base,
      product: "Mystery Mix",
      target: "aphids",
      rate: "4 oz/acre",
    });
    expect(statusFor(checks, "productApproved")).toBe("fail");
  });

  it("flags a missing application rate", () => {
    const checks = complianceChecks({
      ...base,
      product: "Serenade ASO",
      target: "aphids",
    });
    expect(statusFor(checks, "rateRecorded")).toBe("fail");
  });

  it("skips label checks entirely when no product was applied", () => {
    const checks = complianceChecks(base);
    expect(statusFor(checks, "noProduct")).toBe("info");
    expect(checks.some((c) => c.status === "fail")).toBe(false);
  });

  it("fails when the field or start time is missing", () => {
    const checks = complianceChecks({ ...base, field: "" });
    expect(statusFor(checks, "fieldTiming")).toBe("fail");
  });
});
