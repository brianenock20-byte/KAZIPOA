import { describe, expect, it } from "vitest";
import { salaryRangeMatches } from "@shared/salaryFilters";

describe("salaryRangeMatches", () => {
  it("matches undisclosed salaries only with the undisclosed filter", () => {
    expect(salaryRangeMatches("Not disclosed", "Not disclosed")).toBe(true);
    expect(salaryRangeMatches("", "Not disclosed")).toBe(true);
    expect(salaryRangeMatches("Not disclosed", "Under TZS 500,000")).toBe(false);
  });

  it("matches numeric salaries and ranges using inclusive bands", () => {
    expect(salaryRangeMatches("TZS 350,000", "Under TZS 500,000")).toBe(true);
    expect(salaryRangeMatches("TZS 500,000 - 1,000,000", "TZS 500,000–1,000,000")).toBe(true);
    expect(salaryRangeMatches("TZS 1,500,000", "TZS 1,000,000–2,000,000")).toBe(true);
    expect(salaryRangeMatches("TZS 2,500,000", "Above TZS 2,000,000")).toBe(true);
  });

  it("keeps all salaries visible when no salary filter is selected", () => {
    expect(salaryRangeMatches("TZS 4,000,000", "All salary ranges")).toBe(true);
    expect(salaryRangeMatches(undefined, "All salary ranges")).toBe(true);
  });
});
