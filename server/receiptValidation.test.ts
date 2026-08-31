import { describe, expect, it } from "vitest";
import { validateReceiptInput } from "./receiptValidation";

describe("receipt validation", () => {
  it("accepts a small supported receipt with metadata", () => {
    const result = validateReceiptInput({ base64: "data:image/png;base64,aGVsbG8=", name: "receipt.png", mimeType: "image/png" });
    expect(result.hasReceipt).toBe(true);
  });

  it("rejects missing metadata and unsupported formats", () => {
    expect(() => validateReceiptInput({ base64: "aGVsbG8=" })).toThrow("Receipt name and type are required");
    expect(() => validateReceiptInput({ base64: "aGVsbG8=", name: "receipt.exe", mimeType: "application/octet-stream" })).toThrow("JPG, PNG, or PDF");
  });

  it("rejects payloads above the size limit", () => {
    const oversized = Buffer.alloc(5_000_001).toString("base64");
    expect(() => validateReceiptInput({ base64: oversized, name: "large.pdf", mimeType: "application/pdf" })).toThrow("5MB or smaller");
  });
});
