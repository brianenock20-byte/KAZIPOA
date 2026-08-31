# Kazipoa SMS provider contract

Kazipoa includes an Africa's Talking-compatible SMS boundary for urgent vacancy alerts and interview invitations. The boundary is intentionally **disabled by default**. It can record a truthful `skipped` outcome, but it does not make an external request until the owner has completed provider approval and explicitly enables transport.

## Required server configuration

| Environment variable | Purpose |
| --- | --- |
| `SMS_PROVIDER_BASE_URL` | Approved Africa's Talking-compatible API base URL, normally the sandbox URL during testing and the production URL after approval. |
| `SMS_PROVIDER_API_KEY` | Server-side provider API key. Never expose it to the browser or commit it to source control. |
| `SMS_PROVIDER_SENDER_ID` | Approved sender ID or short code used for transactional messages. |
| `SMS_PROVIDER_ENABLED` | Must be exactly `true` before live transport can be considered ready. The default is disabled. |

The application also requires a valid persisted Tanzania mobile number. Numbers are normalized to the `255XXXXXXXXX` format and invalid or missing numbers are recorded as `skipped`.

## Enablement gates

Before setting `SMS_PROVIDER_ENABLED=true`, the owner must confirm the provider account, sender identity, callback or delivery-report requirements, sandbox test, rate limits, opt-out policy, and production approval. The credentials should be supplied through the project secret-management flow, not by editing `.env` files in the repository.

The adapter currently stops at the transport boundary even when all configuration keys are present. This is deliberate: an approved sandbox test and an explicit production confirmation are required before the external request implementation is enabled. Urgent vacancy and interview code calls the same adapter, so the persisted notification or interview-session record receives one consistent provider state.

## Delivery states

`sent` means the provider transport accepted the message and returned a provider reference. `failed` means a transport request was attempted but did not succeed. `skipped` means no safe delivery was attempted, for example because there is no valid recipient, a required key is missing, enablement is off, or sandbox/production approval is pending.

## Security and operational requirements

Messages must use an idempotency key derived from the persisted notification or interview-session identifier. Server-side ownership checks must happen before creating an interview invitation or urgent alert. Raw interview invitation tokens are never stored; only a one-way hash is persisted, and the token expires with the session. Provider responses and error reasons may be persisted for auditability, but API keys and full message secrets must not be written to logs.
