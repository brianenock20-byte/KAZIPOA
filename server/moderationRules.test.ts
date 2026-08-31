import { describe, expect, it } from "vitest";
import { validateModerationInput } from "./db";
import { canPublishVacancy } from "./localPayments";

describe("moderation rules", () => {
  it("requires a reason for rejected or change-requested vacancies", () => {
    expect(() => validateModerationInput("reject")).toThrow("reason");
    expect(() => validateModerationInput("request_changes", "")).toThrow("reason");
    expect(() => validateModerationInput("reject", "Missing payment evidence")).not.toThrow();
    expect(() => validateModerationInput("approve")).not.toThrow();
  });

  it("does not publish without successful payment and employer verification", () => {
    expect(canPublishVacancy("successful", true, true)).toBe(true);
    expect(canPublishVacancy("pending", true, true)).toBe(false);
    expect(canPublishVacancy("successful", true, false)).toBe(false);
  });
});
