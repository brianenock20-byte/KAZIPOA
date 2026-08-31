# M-Pesa/API payment evaluation — 23 August 2026

## Current state

Kazipoa’s stable pilot payment path is manual Lipa Namba. Employers select a vacancy tier, pay to the configured business number, submit a transaction reference and receipt evidence, and wait for Admin review. Vacancy publication remains gated by employer verification, payment approval, and vacancy moderation.

The codebase also contains a provider-adapter contract and webhook/callback state model for M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, and CRDB. This is an integration contract, not a live gateway connection. No merchant API credentials, sandbox account, callback signature configuration, or provider approval is present in the project secrets.

## Decision

Keep the manual Lipa Namba workflow for the real pilot. Do not enable an automated M-Pesa/API path until the owner supplies the merchant credentials and the provider confirms the callback contract. This avoids falsely displaying “payment successful” and preserves the current Admin verification control.

## Requirements for a future gateway pilot

The owner will need a provider-approved merchant account, sandbox credentials, callback/webhook URL registration, signing or authentication details, a tested reconciliation rule, failure and timeout handling, and a controlled production rollout. The implementation must keep pending, confirmed, failed, rejected, and refunded states and must not store card PINs, CVVs, or mobile-money PINs.

## Result

The payment architecture was evaluated without modifying production payment records. The manual workflow is suitable for the current pilot; automated provider wiring remains a Phase 2 activity pending credentials and provider approval.
