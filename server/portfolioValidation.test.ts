import { describe, expect, it } from "vitest";
import { normalizePortfolioOptional, validateEducationPeriod } from "./portfolioValidation";

describe("seeker portfolio validation", () => {
  it("rejects an education end year before the start year", () => {
    expect(() => validateEducationPeriod(2024, 2023, false)).toThrow("end year");
  });

  it("rejects an end year for a currently studying record", () => {
    expect(() => validateEducationPeriod(2022, 2024, true)).toThrow(/currently studying/i);
  });

  it("normalizes optional portfolio text", () => {
    expect(normalizePortfolioOptional("  Legal research  ")).toBe("Legal research");
    expect(normalizePortfolioOptional("   ")).toBeUndefined();
  });
});
