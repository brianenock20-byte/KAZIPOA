import { describe, expect, it } from "vitest";
import { getSubscriptionModerationStatus, validateSubscriptionModerationInput } from "./db";

describe("subscription moderation", () => {
  it("activates an approved employer subscription", () => {
    expect(getSubscriptionModerationStatus("approve")).toBe("active");
  });

  it("marks a rejected employer subscription as rejected", () => {
    expect(getSubscriptionModerationStatus("reject")).toBe("rejected");
  });

  it("requires a reason when an Admin rejects a payment", () => {
    expect(() => validateSubscriptionModerationInput("reject")).toThrow("reason");
    expect(() => validateSubscriptionModerationInput("reject", "Receipt mismatch")).not.toThrow();
    expect(() => validateSubscriptionModerationInput("approve")).not.toThrow();
  });
});
