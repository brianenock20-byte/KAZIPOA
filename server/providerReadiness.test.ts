import { describe, expect, it } from "vitest";
import {
  getProviderReadiness,
  isProviderConfigured,
  providerNotConfiguredMessage,
} from "./providerReadiness";

const configuredEnvironment = {
  MPESA_API_BASE_URL: "https://sandbox.example.test",
  MPESA_CONSUMER_KEY: "consumer-key",
  MPESA_CONSUMER_SECRET: "consumer-secret",
  MPESA_API_KEY: "mpesa-api-key",
  MPESA_PUBLIC_KEY: "public-key",
  MPESA_MERCHANT_ID: "merchant-id",
  MPESA_CALLBACK_URL: "https://kazipoa.example.test/api/providers/mpesa/callback",
  MPESA_CALLBACK_SECRET: "callback-secret",
  SMS_PROVIDER_BASE_URL: "https://sms.example.test",
  SMS_PROVIDER_API_KEY: "sms-api-key",
  SMS_PROVIDER_SENDER_ID: "KAZIPOA",
  DAILY_API_KEY: "daily-api-key",
};

describe("provider readiness", () => {
  it("reports all providers as unconfigured without credentials", () => {
    const readiness = getProviderReadiness({});
    expect(readiness).toEqual([
      expect.objectContaining({ provider: "mpesa", configured: false }),
      expect.objectContaining({ provider: "sms", configured: false }),
      expect.objectContaining({ provider: "daily", configured: false }),
    ]);
    expect(providerNotConfiguredMessage("daily", {})).toContain("No provider action is available");
  });

  it("detects complete future configuration without returning secret values", () => {
    const readiness = getProviderReadiness(configuredEnvironment);
    expect(readiness.every(provider => provider.configured)).toBe(true);
    expect(readiness.flatMap(provider => provider.missing)).toEqual([]);
    expect(isProviderConfigured("mpesa", configuredEnvironment)).toBe(true);
    expect(providerNotConfiguredMessage("mpesa", configuredEnvironment)).toBeNull();
    expect(JSON.stringify(readiness)).not.toContain("consumer-secret");
  });

  it("keeps whitespace-only credentials disabled", () => {
    expect(isProviderConfigured("daily", { DAILY_API_KEY: "   " })).toBe(false);
    expect(providerNotConfiguredMessage("daily", { DAILY_API_KEY: "   " })).toContain("DAILY");
  });
});
