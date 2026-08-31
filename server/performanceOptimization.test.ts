import { describe, expect, it } from "vitest";
import { storageUrl } from "../client/src/lib/storageUrl";

describe("performance-safe asset references", () => {
  it("builds storage paths at runtime without changing the storage route", () => {
    expect(storageUrl("kazipoa-hero_3140ef94.jpg")).toBe("/manus-storage/kazipoa-hero_3140ef94.jpg");
    expect(storageUrl("private/cv.pdf")).toBe("/manus-storage/private/cv.pdf");
  });
});
