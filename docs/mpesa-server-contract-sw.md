# Kazipoa M-Pesa Server Contract

## Purpose

Kazipoa treats the browser as untrusted. The Employer client may request a payment intent, but it cannot mark a payment successful, change a payment state, or publish a vacancy. The server records the intent as `pending`; only a verified provider callback may move the payment to a terminal callback state.

## Initiation boundary

The protected `payments.initiateMpesa` procedure requires an authenticated Employer account and a vacancy owned by that Employer. It creates or reuses one pending M-Pesa payment intent for the vacancy and returns a generated Kazipoa provider reference. The response contains `state: "pending"` in every case. If the required provider environment is incomplete, no outbound provider request is sent and the response states that honestly.

Provider credentials must remain server-side. The callback secret is never returned to the client and is read only by the callback handler. The production adapter still needs the merchant-specific request format, authentication method, and phone-number rules supplied by the selected licensed gateway before outbound requests are enabled.

## Callback endpoint

The server accepts `POST /api/payments/mpesa/callback`. The provider must send the raw JSON body and an HMAC-SHA256 signature in `X-M-Pesa-Signature` (the compatibility fallback `X-Callback-Signature` is also accepted). The signature is calculated over the exact UTF-8 request body with `MPESA_CALLBACK_SECRET` and compared in constant time.

The allowlisted callback payload is:

```json
{
  "eventId": "provider-event-id",
  "paymentId": 42,
  "providerReference": "KAZIPOA-42-…",
  "state": "successful",
  "amountTzs": 30000
}
```

Only `successful`, `failed`, and `cancelled` are terminal callback states. Missing identifiers, invalid amounts, malformed JSON, unknown states, amount mismatches, and provider-reference mismatches are rejected.

## Replay and state safety

Each accepted callback stores `callbackEventId`, `callbackReceivedAt`, and a SHA-256 `callbackPayloadHash` on the payment row. A repeated event for the same payment is idempotent. An event already attached to a different payment, or a different event received after a payment already has a verified callback, is rejected. The unique database index on `payments.callbackEventId` provides an additional race-safe invariant.

A successful callback moves the payment to `successful` and leaves the vacancy at `paid_pending_review`; it does not make the vacancy public. A failed or cancelled callback moves the vacancy back to `payment_pending`. The existing publication gate still requires successful payment, Employer verification, and Admin approval.

## Environment and rollout

The readiness check requires `MPESA_API_BASE_URL`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_API_KEY`, `MPESA_PUBLIC_KEY`, `MPESA_MERCHANT_ID`, `MPESA_CALLBACK_URL`, and `MPESA_CALLBACK_SECRET`. Until the selected provider’s credentials, callback registration, sandbox verification, sender/merchant approval, and production confirmation are complete, the adapter remains provider-safe and does not claim live payment success.

Before launch, the team must confirm the gateway-specific callback field mapping, signature scheme, TLS callback URL, timeout/retry behavior, idempotency semantics, and reconciliation procedure with the selected Tanzania M-Pesa provider. Those details cannot be inferred safely from a generic M-Pesa label because gateways expose different APIs.
