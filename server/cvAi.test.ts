import { describe, expect, it } from "vitest";
import { extractSkillsFromCv, normalizeSuggestedSkills } from "./cvAi";

describe("CV AI skill extraction safeguards", () => {
  it("deduplicates, trims, bounds, and limits suggested skills", () => {
    expect(normalizeSuggestedSkills(["  Excel ", "Excel", "", "x", "Customer service"])).toEqual(["Excel", "Customer service"]);
    expect(normalizeSuggestedSkills("not-an-array")).toEqual([]);
  });

  it("rejects unsupported document types before calling the model", async () => {
    await expect(extractSkillsFromCv({ storageKey: "private/cv.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileSize: 100 })).rejects.toThrow("currently supports PDF");
  });

  it("rejects oversized CVs before requesting a signed URL", async () => {
    await expect(extractSkillsFromCv({ storageKey: "private/cv.pdf", mimeType: "application/pdf", fileSize: 8_000_001 })).rejects.toThrow("too large");
  });
});
