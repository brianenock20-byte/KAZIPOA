import { describe, expect, it } from "vitest";
import { isValidTanzaniaPhone, normalizeTanzaniaPhone } from "./db";

describe("Tanzania phone readiness", () => {
  it("normalizes common local and international formats", () => {
    expect(normalizeTanzaniaPhone("0712 345 678")).toBe("255712345678");
    expect(normalizeTanzaniaPhone("+255 712-345-678")).toBe("255712345678");
    expect(normalizeTanzaniaPhone("255712345678")).toBe("255712345678");
    expect(normalizeTanzaniaPhone("  ")).toBeNull();
  });

  it("accepts Tanzania mobile numbers and rejects unsafe values", () => {
    expect(isValidTanzaniaPhone("+255 712 345 678")).toBe(true);
    expect(isValidTanzaniaPhone("0712 345 678")).toBe(true);
    expect(isValidTanzaniaPhone("+254 712 345 678")).toBe(false);
    expect(isValidTanzaniaPhone("+255 712 345 67")).toBe(false);
    expect(isValidTanzaniaPhone("not-a-phone")).toBe(false);
    expect(isValidTanzaniaPhone(null)).toBe(false);
  });
});
