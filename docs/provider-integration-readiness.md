# Kazipoa provider-integration readiness

**Status:** readiness only. No live provider credential has been added, no payment can be marked successful from the browser, and no interview room or SMS delivery is claimed to work until the relevant provider is configured and tested.

## Current safe behavior

Kazipoa currently supports the manual Lipa Namba evidence path and the existing Admin review workflow. Employer-entered references and uploaded receipts remain evidence, not proof of payment. A vacancy may become live only after the server has a successful payment state, an approved vacancy, and a verified employer. This preserves the existing publication gate while the automatic provider phase remains disabled.

The existing Employer live-interview control is intentionally a provider-not-configured state. It may display the scheduled interview context, but it must not invent a meeting URL, expose a room identifier, or issue a token from the browser.

## Provider readiness matrix

| Capability | Required owner-controlled inputs | Server-side behavior after configuration | Current state |
|---|---|---|---|
| Vodacom M-Pesa automatic payment confirmation | Approved business collection/C2B account, developer application, API/public credentials, production callback URL, and provider approval | Create a pending order on the server; verify callback authenticity; match order, amount, merchant, and provider reference; make processing idempotent; then persist the provider-confirmed state and audit event | Not configured; manual payment review remains active |
| Tanzania transactional SMS | Approved SMS provider account, API credential, sender identity, and delivery policy | Send only from a server-side delivery worker after a committed business event; persist delivery outcome; never block the underlying application or vacancy state on an SMS outage | Not configured; no urgent SMS claim is made |
| Daily.co interviews | `DAILY_API_KEY`, approved Daily account, room/token policy, and retention/privacy policy | Create private rooms and expiring meeting tokens server-side only after employer/candidate ownership checks; give host privileges only to the employer; persist room/session and delivery outcomes | Not configured; UI remains an honest fallback |
| Email interview/urgent notices | Existing Postmark configuration plus verified sender/domain | Queue a server-side email after a committed event and persist delivery outcome | Existing email path available; provider/domain delivery verification remains an operational prerequisite |

## Proposed environment contract

These names are a future configuration contract, not values to place in source control. They should be added through the project’s secret manager only after the owner supplies approved credentials and confirms the target environment.

| Variable | Provider | Purpose | Exposure rule |
|---|---|---|---|
| `MPESA_API_BASE_URL` | Vodacom M-Pesa | Sandbox or production API base URL | Server-only |
| `MPESA_CONSUMER_KEY` | Vodacom M-Pesa | OAuth/client credential where required by the approved application | Server-only |
| `MPESA_CONSUMER_SECRET` | Vodacom M-Pesa | OAuth/client secret where required by the approved application | Server-only |
| `MPESA_API_KEY` | Vodacom M-Pesa | Provider application credential where issued by Vodacom | Server-only |
| `MPESA_PUBLIC_KEY` | Vodacom M-Pesa | Public-key material used by the approved callback/authentication scheme | Server-only unless Vodacom explicitly documents otherwise |
| `MPESA_MERCHANT_ID` | Vodacom M-Pesa | Business collection account identifier | Server-only |
| `MPESA_CALLBACK_URL` | Vodacom M-Pesa | HTTPS callback endpoint registered with the provider | Server configuration and provider portal |
| `SMS_PROVIDER_BASE_URL` | Approved Tanzania SMS vendor | API base URL | Server-only |
| `SMS_PROVIDER_API_KEY` | Approved Tanzania SMS vendor | API credential | Server-only |
| `SMS_PROVIDER_SENDER_ID` | Approved Tanzania SMS vendor | Approved sender identity | Server configuration |
| `SMS_PROVIDER_ACCOUNT_ID` | Approved Tanzania SMS vendor | Account/project identifier if required | Server-only |
| `DAILY_API_KEY` | Daily.co | REST API bearer credential for room and token creation | Server-only; never stored in a database row or public URL |
| `DAILY_API_BASE_URL` | Daily.co | API base URL; default can be the documented Daily endpoint | Server configuration |

The exact M-Pesa credential names may differ from the account’s approved Vodacom application. The project should map the provider’s issued names into the contract above only after the provider confirms them. No PIN, CVV, customer password, OTP, or email password belongs in this application’s environment.

## Secure M-Pesa flow to implement later

1. The Employer submits the vacancy and the server creates a unique Kazipoa payment order with amount, vacancy ID, employer ID, and `pending` state.
2. The server initiates the provider request. The browser may receive a pending response or a provider checkout reference, but it cannot set `successful`.
3. The provider calls the HTTPS callback. The server verifies the callback signature/checksum or provider-authenticated request according to the approved Vodacom contract.
4. The server matches the callback to exactly one order, compares amount and currency, verifies the merchant/account, and rejects mismatches.
5. Repeated callbacks are safe: an already-confirmed provider reference produces no duplicate side effect. The server records the raw provider reference and an audit event without storing unnecessary sensitive payload data.
6. Only a verified provider result may change the payment state to `successful`. Admin moderation and employer verification remain required before publication.
7. Sandbox tests must cover success, failure, duplicate callback, wrong amount, wrong order, invalid signature, timeout, and replay attempts before production enablement.

## Secure Daily.co flow to implement later

Daily’s documented REST flow uses server-side room creation followed by server-side meeting-token creation. Rooms should be private and bounded by the scheduled start/end window. The server should issue an expiring employer token with host privileges and a separate candidate token without host privileges only after verifying the authenticated relationship to the application.

The browser should receive only the room URL and the short-lived meeting token. The API key must never be sent to the client, saved in an interview record, embedded in a URL, or exposed in an error message. Interview sessions should retain ownership, scheduled time, provider room name, token expiry metadata, and delivery outcomes, but not long-lived reusable tokens.

## SMS and email delivery rules

Urgent-vacancy alerts must be generated from a committed vacancy event and delivered through configured server-side providers. A missing or failing SMS provider must produce an honest `not_configured` or `delivery_failed` outcome and must not claim that a message was sent. Email and SMS delivery failures must not silently change vacancy, payment, application, or interview state. The application should retain a retry/audit record and provide an Admin-visible operational status once the provider is enabled.

## Go-live checklist

| Gate | Pass condition |
|---|---|
| Ownership | Owner supplies credentials through the secret manager; no personal email password, OTP, or customer credential is requested |
| Environment separation | Sandbox and production credentials, callback URLs, sender identities, and provider accounts are separate |
| Network security | Callback endpoints use HTTPS, authenticate provider requests, validate timestamps/nonces where supported, and reject replayed payloads |
| Authorization | Employer owns the vacancy/application; candidates can join only their invited interview; Admin controls moderation and audit review |
| Data minimization | API keys and long-lived tokens are never stored in browser storage, public URLs, or ordinary database fields |
| Idempotency | Payment callbacks and notification events can be retried without duplicate state transitions or duplicate user-visible messages |
| Observability | Each provider request has a safe correlation ID, state, provider reference, and delivery outcome without logging secrets |
| Sandbox evidence | Success, failure, mismatch, replay, timeout, and permission tests are captured before production enablement |
| Rollback | A provider can be disabled without removing the manual payment review path or blocking existing vacancy/application records |

## Implementation boundaries

The next implementation increment should add dedicated interview-session persistence and provider callback procedures only after the owner supplies approved provider configuration. Until then, the application must retain the current manual payment and provider-not-configured interview states. This boundary prevents a visual placeholder or client-side action from being mistaken for a completed payment, SMS, or video integration.

## References

[1] [M-Pesa Developers – Official Business INFO Portal](https://business.m-pesa.com/developers/)

[2] [Vodacom Tanzania – M-Pesa for Business](https://vodacom.co.tz/vodacom-business/11/Mpesaforbus)

[3] [Daily Create Room API](https://docs.daily.co/reference/rest-api/rooms/create-room)

[4] [Daily Create Meeting Token API](https://docs.daily.co/reference/rest-api/meeting-tokens/create-meeting-token)

[5] [Existing Kazipoa M-Pesa integration findings](./mpesa-integration-findings-sw.md)

[6] [Existing Kazipoa Daily.co integration findings](./daily-live-interview-findings-2026-08.md)
