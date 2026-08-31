import { describe, expect, it } from "vitest";
import { formatDeadlineCountdown } from "./DeadlineCountdown";

describe("formatDeadlineCountdown", () => {
  const now = Date.parse("2026-08-26T12:00:00.000Z");

  it("shows days and hours for a distant deadline", () => {
    expect(formatDeadlineCountdown("2026-08-28T15:30:00.000Z", now)).toBe("2d 3h left");
  });

  it("shows hours and minutes for a near deadline", () => {
    expect(formatDeadlineCountdown("2026-08-26T15:42:00.000Z", now)).toBe("3h 42m left");
  });

  it("shows a closed state after the deadline", () => {
    expect(formatDeadlineCountdown("2026-08-26T11:59:59.000Z", now)).toBe("Deadline passed");
  });
});
