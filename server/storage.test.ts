import { describe, expect, it } from "vitest";
import { sanitizeStorageFileName } from "./storage";

describe("storage filename safety", () => {
  it("removes spaces and unsafe characters while preserving the extension", () => {
    expect(sanitizeStorageFileName("BRIGETRISIA CV CV CV(1)-2.docx")).toBe("BRIGETRISIA-CV-CV-CV-1-2.docx");
  });

  it("provides a safe fallback for an empty or punctuation-only name", () => {
    expect(sanitizeStorageFileName("   ...   ")).toBe("document");
  });
});
