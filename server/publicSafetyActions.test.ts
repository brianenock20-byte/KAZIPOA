import { describe, expect, it } from "vitest";
import { safetyReportSupportMessage } from "@shared/publicSafety";

describe("Safety Centre report actions", () => {
  it("opens a job-report context with actionable prompts", () => {
    expect(safetyReportSupportMessage("job")).toContain("report a suspicious job");
    expect(safetyReportSupportMessage("job")).toContain("vacancy title");
  });

  it("opens an employer-report context with actionable prompts", () => {
    expect(safetyReportSupportMessage("employer")).toContain("report a suspicious employer");
    expect(safetyReportSupportMessage("employer")).toContain("employer name");
  });
});
