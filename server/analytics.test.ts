import { describe, expect, it } from "vitest";
import { isValidGaMeasurementId } from "@shared/analytics";

describe("optional GA4 configuration", () => {
  it("accepts only real-looking GA4 Measurement IDs", () => {
    expect(isValidGaMeasurementId("G-ABC123456")).toBe(true);
    expect(isValidGaMeasurementId(undefined)).toBe(false);
    expect(isValidGaMeasurementId("")).toBe(false);
    expect(isValidGaMeasurementId("GA-ABC123456")).toBe(false);
    expect(isValidGaMeasurementId("G-FAKE")).toBe(false);
  });
});
