import { describe, expect, it } from "vitest";
import { parseCustomAuthEnabled } from "./_core/env";

describe("custom-auth environment flag", () => {
  it("keeps the approved pilot enabled when the blocked Secrets card leaves the flag unset", () => {
    expect(parseCustomAuthEnabled(undefined)).toBe(true);
    expect(parseCustomAuthEnabled("")).toBe(true);
  });

  it("accepts true values case-insensitively and preserves an explicit false rollback", () => {
    expect(parseCustomAuthEnabled("true")).toBe(true);
    expect(parseCustomAuthEnabled("TRUE")).toBe(true);
    expect(parseCustomAuthEnabled("false")).toBe(false);
    expect(parseCustomAuthEnabled("unexpected")).toBe(false);
  });
});
