import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type MpesaInitiationResult = {
  state: "pending";
  provider: "mpesa";
  providerReference: string;
  providerReady: boolean;
  message: string;
};

export type MpesaCallbackState = "successful" | "failed" | "cancelled";

export type MpesaCallback = {
  eventId: string;
  paymentId: number;
  providerReference: string;
  state: MpesaCallbackState;
  amountTzs: number;
  receivedAt?: string;
};

export function createMpesaProviderReference(paymentId: number, nonce: string) {
  const digest = createHash("sha256").update(`${paymentId}:${nonce}`).digest("hex").slice(0, 24);
  return `KAZIPOA-${paymentId}-${digest}`;
}

export function signMpesaCallback(rawBody: string, secret: string) {
  if (!secret.trim()) throw new Error("M-Pesa callback secret is required");
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export function verifyMpesaCallbackSignature(rawBody: string, signature: string | undefined, secret: string) {
  if (!signature?.trim() || !secret.trim()) return false;
  const expected = Buffer.from(signMpesaCallback(rawBody, secret), "utf8");
  const provided = Buffer.from(signature.trim().toLowerCase(), "utf8");
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export function parseMpesaCallback(rawBody: string): MpesaCallback {
  let value: unknown;
  try {
    value = JSON.parse(rawBody);
  } catch {
    throw new Error("Invalid M-Pesa callback JSON");
  }
  if (!value || typeof value !== "object") throw new Error("Invalid M-Pesa callback payload");
  const input = value as Record<string, unknown>;
  const eventId = typeof input.eventId === "string" ? input.eventId.trim() : "";
  const providerReference = typeof input.providerReference === "string" ? input.providerReference.trim() : "";
  const paymentId = typeof input.paymentId === "number" && Number.isInteger(input.paymentId) ? input.paymentId : Number(input.paymentId);
  const amountTzs = typeof input.amountTzs === "number" && Number.isInteger(input.amountTzs) ? input.amountTzs : Number(input.amountTzs);
  const state = input.state;
  if (!eventId || eventId.length > 200) throw new Error("M-Pesa callback eventId is required");
  if (!providerReference || providerReference.length > 160) throw new Error("M-Pesa provider reference is required");
  if (!Number.isInteger(paymentId) || paymentId <= 0) throw new Error("M-Pesa paymentId is invalid");
  if (!Number.isInteger(amountTzs) || amountTzs <= 0) throw new Error("M-Pesa amountTzs is invalid");
  if (state !== "successful" && state !== "failed" && state !== "cancelled") throw new Error("M-Pesa callback state is invalid");
  return { eventId, paymentId, providerReference, state, amountTzs, receivedAt: typeof input.receivedAt === "string" ? input.receivedAt : undefined };
}

export function callbackPayloadHash(rawBody: string) {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

export function pendingMpesaInitiation(paymentId: number, providerReference: string, providerReady: boolean): MpesaInitiationResult {
  return {
    state: "pending",
    provider: "mpesa",
    providerReference,
    providerReady,
    message: providerReady
      ? "M-Pesa payment intent recorded as pending. A provider adapter must complete the request; Kazipoa marks it successful only after a verified callback."
      : "M-Pesa payment recorded as pending. Provider credentials are not configured, so no external request was sent.",
  };
}
