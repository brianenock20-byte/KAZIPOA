import { getProviderReadiness } from "./providerReadiness";

export type SmsDeliveryStatus = "sent" | "skipped" | "failed";

export type SmsDeliveryResult = {
  status: SmsDeliveryStatus;
  provider: "africas_talking";
  normalizedPhone: string | null;
  reason: string | null;
  providerReference?: string | null;
};

export type SmsProviderReadiness = {
  provider: "africas_talking";
  enabled: boolean;
  configured: boolean;
  missing: string[];
  transport: "disabled" | "ready";
};

const normalizeTanzaniaRecipient = (value: string | null | undefined) => {
  const compact = (value ?? "").replace(/[^\d+]/g, "");
  if (!compact) return null;
  if (compact.startsWith("0")) return `255${compact.slice(1)}`;
  if (compact.startsWith("+")) return compact.slice(1);
  return compact;
};

export function normalizeSmsRecipient(value: string | null | undefined) {
  const normalized = normalizeTanzaniaRecipient(value);
  return normalized && /^255[6789]\d{8}$/.test(normalized) ? normalized : null;
}

export function getSmsProviderReadiness(env: Record<string, string | undefined> = process.env): SmsProviderReadiness {
  const baseReadiness = getProviderReadiness(env).find(item => item.provider === "sms");
  const enabled = env.SMS_PROVIDER_ENABLED?.trim().toLowerCase() === "true";
  const missing = [...(baseReadiness?.missing ?? [])];
  if (!enabled) missing.push("SMS_PROVIDER_ENABLED=true");
  return {
    provider: "africas_talking",
    enabled,
    configured: Boolean(baseReadiness?.configured && enabled),
    missing,
    transport: baseReadiness?.configured && enabled ? "ready" : "disabled",
  };
}

/**
 * Africa's Talking-compatible delivery boundary.
 *
 * The transport intentionally remains disabled until the owner supplies an
 * approved API base URL, API key, sender ID, sandbox proof, and explicit
 * enablement. This function therefore never makes a network request while
 * the project is not approved for live messaging.
 */
export async function sendSms(input: { to: string | null | undefined; message: string; idempotencyKey: string }): Promise<SmsDeliveryResult> {
  const normalizedPhone = normalizeSmsRecipient(input.to);
  if (!normalizedPhone) return { status: "skipped", provider: "africas_talking", normalizedPhone: null, reason: "No valid Tanzania mobile number is saved for this recipient.", providerReference: null };

  const readiness = getSmsProviderReadiness();
  if (!readiness.configured) return { status: "skipped", provider: "africas_talking", normalizedPhone, reason: `SMS provider is not enabled. Missing: ${readiness.missing.join(", ")}.`, providerReference: null };

  return { status: "skipped", provider: "africas_talking", normalizedPhone, reason: "SMS transport is awaiting sandbox and production approval before external delivery is enabled.", providerReference: null };
}
