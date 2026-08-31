import { describe, expect, it } from "vitest";
import { getInterviewSmsDeliveryResult } from "./interviewNotification";

describe("interview SMS delivery readiness", () => {
  it("skips when the seeker phone is missing", () => {
    expect(getInterviewSmsDeliveryResult({ phone: null, env: {} })).toEqual({ status: "skipped", reason: "No valid Tanzania mobile number is stored" });
  });

  it("skips when the approved SMS provider is not configured", () => {
    expect(getInterviewSmsDeliveryResult({ phone: "+255700000000", env: {} })).toEqual({ status: "skipped", reason: "SMS provider is not enabled. Missing: SMS_PROVIDER_BASE_URL, SMS_PROVIDER_API_KEY, SMS_PROVIDER_SENDER_ID, SMS_PROVIDER_ENABLED=true." });
  });

  it("does not send even when keys exist before adapter approval and sandbox verification", () => {
    const env = { SMS_PROVIDER_BASE_URL: "https://sms.example.test", SMS_PROVIDER_API_KEY: "redacted-test-key", SMS_PROVIDER_SENDER_ID: "KAZIPOA" };
    expect(getInterviewSmsDeliveryResult({ phone: "+255700000000", env })).toEqual({ status: "skipped", reason: "SMS provider is not enabled. Missing: SMS_PROVIDER_ENABLED=true." });
  });
});
