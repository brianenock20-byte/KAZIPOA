export type ProviderReadinessName = "mpesa" | "sms" | "daily";

export type ProviderReadiness = {
  provider: ProviderReadinessName;
  configured: boolean;
  missing: string[];
};

/**
 * Future provider configuration contract.
 *
 * This helper intentionally reports only whether required keys exist. It never
 * returns secret values and does not create payments, send messages, or create
 * video rooms. Callers must still implement provider-specific authentication,
 * idempotency, ownership checks, and sandbox verification before enabling a
 * production action.
 */
const requiredEnvironmentKeys: Record<ProviderReadinessName, string[]> = {
  mpesa: [
    "MPESA_API_BASE_URL",
    "MPESA_CONSUMER_KEY",
    "MPESA_CONSUMER_SECRET",
    "MPESA_API_KEY",
    "MPESA_PUBLIC_KEY",
    "MPESA_MERCHANT_ID",
    "MPESA_CALLBACK_URL",
    "MPESA_CALLBACK_SECRET",
  ],
  sms: ["SMS_PROVIDER_BASE_URL", "SMS_PROVIDER_API_KEY", "SMS_PROVIDER_SENDER_ID"],
  daily: ["DAILY_API_KEY"],
};

export function getProviderReadiness(
  env: Record<string, string | undefined> = process.env,
): ProviderReadiness[] {
  return (Object.keys(requiredEnvironmentKeys) as ProviderReadinessName[]).map(provider => {
    const missing = requiredEnvironmentKeys[provider].filter(key => !env[key]?.trim());
    return { provider, configured: missing.length === 0, missing };
  });
}

export function isProviderConfigured(
  provider: ProviderReadinessName,
  env: Record<string, string | undefined> = process.env,
) {
  return getProviderReadiness(env).find(item => item.provider === provider)?.configured ?? false;
}

export function providerNotConfiguredMessage(provider: ProviderReadinessName, env: Record<string, string | undefined> = process.env) {
  const readiness = getProviderReadiness(env).find(item => item.provider === provider);
  if (!readiness || readiness.configured) return null;
  return `${provider.toUpperCase()} provider is not configured. No provider action is available.`;
}
