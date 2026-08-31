import { describe, expect, it } from "vitest";
import { canViewSeekerDocument } from "./cvAccess";

describe("seeker CV access", () => {
  it("allows only the owning seeker session", () => {
    expect(canViewSeekerDocument(42, 42)).toBe(true);
    expect(canViewSeekerDocument(42, 43)).toBe(false);
  });
});
