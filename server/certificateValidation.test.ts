import { describe, expect, it } from "vitest";
import { validateCertificateInput } from "./certificateValidation";

describe("certificate upload validation", () => {
  it("accepts a small PDF payload", () => {
    const result = validateCertificateInput({ base64: `data:application/pdf;base64,${Buffer.from("certificate").toString("base64")}`, name: "degree.pdf", mimeType: "application/pdf" });
    expect(result.size).toBeGreaterThan(0);
  });

  it("rejects unsupported file types and malformed payloads", () => {
    expect(() => validateCertificateInput({ base64: "ZmFrZQ==", name: "certificate.exe", mimeType: "application/octet-stream" })).toThrow("JPG, PNG, or PDF");
    expect(() => validateCertificateInput({ base64: "not base64!", name: "certificate.pdf", mimeType: "application/pdf" })).toThrow("Invalid certificate file payload");
  });
});
