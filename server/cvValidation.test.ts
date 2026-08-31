import { describe, expect, it } from "vitest";
import { validateCvInput } from "./cvValidation";

describe("CV upload validation", () => {
  it("accepts a small PDF data payload", () => {
    const result = validateCvInput({ base64: "data:application/pdf;base64," + Buffer.from("cv").toString("base64"), name: "resume.pdf", mimeType: "application/pdf" });
    expect(result.size).toBe(2);
  });

  it("rejects unsupported file types", () => {
    expect(() => validateCvInput({ base64: Buffer.from("cv").toString("base64"), name: "resume.exe", mimeType: "application/octet-stream" })).toThrow("PDF, DOC, or DOCX");
  });

  it("rejects malformed base64 payloads", () => {
    expect(() => validateCvInput({ base64: "not base64!", name: "resume.pdf", mimeType: "application/pdf" })).toThrow("Invalid CV file payload");
  });
});
