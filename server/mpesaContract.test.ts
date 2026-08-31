import { describe, expect, it } from "vitest";
import { callbackPayloadHash, createMpesaProviderReference, parseMpesaCallback, pendingMpesaInitiation, signMpesaCallback, verifyMpesaCallbackSignature } from "./mpesaContract";

describe("M-Pesa provider-safe contract", () => {
  const payload = JSON.stringify({ eventId: "evt-001", paymentId: 42, providerReference: "KAZIPOA-42-ref", state: "successful", amountTzs: 30000 });

  it("never exposes a successful state during initiation", () => {
    const result = pendingMpesaInitiation(42, createMpesaProviderReference(42, "nonce"), false);
    expect(result.state).toBe("pending");
    expect(result.providerReady).toBe(false);
    expect(result.message).toContain("no external request was sent");
  });

  it("verifies an exact callback signature and rejects tampering", () => {
    const signature = signMpesaCallback(payload, "callback-secret");
    expect(verifyMpesaCallbackSignature(payload, signature, "callback-secret")).toBe(true);
    expect(verifyMpesaCallbackSignature(payload.replace("30000", "1"), signature, "callback-secret")).toBe(false);
    expect(verifyMpesaCallbackSignature(payload, signature, "wrong-secret")).toBe(false);
  });

  it("parses only the allowlisted terminal callback states", () => {
    expect(parseMpesaCallback(payload)).toMatchObject({ eventId: "evt-001", paymentId: 42, state: "successful", amountTzs: 30000 });
    expect(() => parseMpesaCallback(JSON.stringify({ ...JSON.parse(payload), state: "pending" }))).toThrow("callback state is invalid");
    expect(() => parseMpesaCallback("not-json")).toThrow("Invalid M-Pesa callback JSON");
  });

  it("produces a stable replay-detection hash for the raw body", () => {
    expect(callbackPayloadHash(payload)).toBe(callbackPayloadHash(payload));
    expect(callbackPayloadHash(payload)).not.toBe(callbackPayloadHash(`${payload} `));
  });
});
