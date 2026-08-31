import { describe, expect, it } from "vitest";
import { decideExpiredVacancyCleanup } from "./db";

describe("expired vacancy cleanup policy", () => {
  it("hard-deletes an expired vacancy with no linked records", () => {
    expect(decideExpiredVacancyCleanup({ applications: 0, payments: 0, views: 0, saved: 0, notifications: 0, accessEvents: 0 })).toBe("delete");
  });

  it("marks an expired vacancy instead of deleting protected application history", () => {
    expect(decideExpiredVacancyCleanup({ applications: 1, payments: 0, views: 0, saved: 0, notifications: 0, accessEvents: 0 })).toBe("mark_expired");
  });

  it("marks an expired vacancy when any financial, saved, notification, view, or access history exists", () => {
    for (const key of ["payments", "views", "saved", "notifications", "accessEvents"] as const) {
      expect(decideExpiredVacancyCleanup({ applications: 0, payments: 0, views: 0, saved: 0, notifications: 0, accessEvents: 0, [key]: 1 })).toBe("mark_expired");
    }
  });
});
