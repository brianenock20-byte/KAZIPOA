import { getSmsProviderReadiness, normalizeSmsRecipient } from "./smsProvider";

export type InterviewSmsDeliveryResult =
  | { status: "skipped"; reason: string }
  | { status: "sent"; providerId: string | null }
  | { status: "failed"; reason: string };

export function getInterviewSmsDeliveryResult(input: { phone?: string | null; env?: Record<string, string | undefined> }): InterviewSmsDeliveryResult {
  if (!normalizeSmsRecipient(input.phone)) return { status: "skipped", reason: "No valid Tanzania mobile number is stored" };
  const readiness = getSmsProviderReadiness(input.env);
  if (!readiness.configured) return { status: "skipped", reason: `SMS provider is not enabled. Missing: ${readiness.missing.join(", ")}.` };
  return { status: "skipped", reason: "SMS transport is awaiting sandbox and production approval" };
}
