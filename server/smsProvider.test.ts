import { describe, expect, it } from "vitest";
import { getSmsProviderReadiness, normalizeSmsRecipient, sendSms } from "./smsProvider";

describe("Africa's Talking-compatible SMS provider contract", () => {
  it("normalizes valid Tanzania mobile recipients and rejects unsafe values", () => {
    expect(normalizeSmsRecipient("0712 345 678")).toBe("255712345678");
    expect(normalizeSmsRecipient("+255 712 345 678")).toBe("255712345678");
    expect(normalizeSmsRecipient("255 712 345 678")).toBe("255712345678");
    expect(normalizeSmsRecipient("0712 345")).toBeNull();
    expect(normalizeSmsRecipient("+1 202 555 0110")).toBeNull();
  });

  it("stays disabled unless all provider keys and explicit enablement are present", () => {
    const disabled = getSmsProviderReadiness({});
    expect(disabled.provider).toBe("africas_talking");
    expect(disabled.enabled).toBe(false);
    expect(disabled.configured).toBe(false);
    expect(disabled.transport).toBe("disabled");
    expect(disabled.missing).toContain("SMS_PROVIDER_ENABLED=true");

    const ready = getSmsProviderReadiness({
      SMS_PROVIDER_ENABLED: "true",
      SMS_PROVIDER_BASE_URL: "https://api.sandbox.africastalking.com",
      SMS_PROVIDER_API_KEY: "sandbox-key",
      SMS_PROVIDER_SENDER_ID: "KAZIPOA",
    });
    expect(ready.configured).toBe(true);
    expect(ready.transport).toBe("ready");
  });

  it("never makes an external request while transport approval is pending", async () => {
    const result = await sendSms({
      to: "+255 712 345 678",
      message: "Urgent vacancy: apply early.",
      idempotencyKey: "test-sms-1",
    });
    expect(result.status).toBe("skipped");
    expect(result.provider).toBe("africas_talking");
    expect(result.normalizedPhone).toBe("255712345678");
    expect(result.reason).toMatch(/SMS provider is not enabled|awaiting sandbox/);
  });
});
