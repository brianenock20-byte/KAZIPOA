import { describe, expect, it } from "vitest";
import { notificationPreferenceKey } from "./db";

describe("notification preference routing", () => {
  it("maps status changes to separate email and in-app preference fields", () => {
    expect(notificationPreferenceKey("email", "interview")).toBe("emailInterview");
    expect(notificationPreferenceKey("inApp", "rejected")).toBe("inAppRejected");
    expect(notificationPreferenceKey("email", "shortlisted")).toBe("emailShortlisted");
  });
});
