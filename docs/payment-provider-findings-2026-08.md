# Payment provider findings — 26 August 2026

## Findings

The official M-Pesa Business INFO Portal states that its developer platform exposes REST APIs for Customer-to-Business (C2B), reversals, and transaction-status queries. It also states that an account must be registered and activated to access the API documentation and credentials, and that the integration must be verified before going live. Source: https://business.m-pesa.com/developers/

ClickPesa's official documentation states that its webhooks are HTTP POST callbacks for transaction events. It documents `PAYMENT RECEIVED` with status `SUCCESS`, payment/order references, collected amount and currency, and `PAYMENT FAILED` events. It also documents merchant-level and application-level webhook configuration. Source: https://docs.clickpesa.com/home/webhooks

## Implication for Kazipoa

The current Kazipoa code has a manual Lipa Namba evidence flow, but it does not yet have a live provider client, callback endpoint, signature/checksum verification, idempotency handling, or provider credentials. Therefore an uploaded receipt alone cannot truthfully auto-confirm a payment. Automatic confirmation should be enabled only after connecting an approved provider account and implementing verified callbacks or transaction-status queries. Until then, receipt/reference submissions must remain `pending` and Admin review remains the truthful fallback.
