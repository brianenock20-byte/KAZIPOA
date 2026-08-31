# Kazipoa controlled QA handoff

**Date:** 26 August 2026  
**Scope:** safe, test-account-only verification of public recruitment flows and the Seeker → Employer → Admin workflow.  
**Safety boundary:** no personal credentials, OTPs, mailbox access, provider passwords, real applications, real employer records, or production test data were used in this handoff.

## Executive result

The codebase is in a validated state for the safe UI and readiness work. The automated regression suite, TypeScript check, and production build passed. The responsive `/jobs` and `/dashboard` preview surfaces were captured and remained readable on a narrow mobile viewport. The controlled authenticated workflow is **not certified as passed** because a safe, provider-authorized test identity and authenticated staging session were not available for this continuation. No production record was created or modified.

## Evidence-based status

| Area | Result | Evidence or stop condition |
|---|---|---|
| Marketplace search and filters | Passed at code/preview level | Contract type, salary range, location, keyword, category, and deadline inputs are present in the public/seeker marketplace implementation; salary parsing has focused regression coverage |
| Vacancy details and Save/Share actions | Passed at code/preview level | Vacancy-specific URLs, WhatsApp, Facebook, X, Copy link, Save Job, deadline countdown, and under-24-hour urgency state are implemented and covered by existing tests/build validation |
| Job Seeker Saved Jobs and application history | Passed at implementation level; authenticated mutation not re-executed | Existing protected procedures and dashboard surfaces are database-backed; direct authenticated mutation verification remains blocked by safe-session availability |
| Employer applicant review and status changes | Passed at implementation level; authenticated mutation not re-executed | Employer application query, candidate profile/CV access, status mutation, notes, interview date, and status summary are protected server-side; no test application was changed |
| Admin activity collapse and readiness panel | Passed at implementation level | Recent Activities defaults closed; explicit Show activities control exists; provider panel reports only configured/missing state and never returns secrets |
| M-Pesa automatic confirmation | Not passed / deferred | Requires owner-provided approved Vodacom application, callback URL, signature/authentication contract, and sandbox evidence |
| Urgent SMS delivery | Not passed / deferred | Requires an approved Tanzania SMS provider, sender identity, credentials, and sandbox delivery evidence |
| Daily.co room/token flow | Not passed / deferred | Requires `DAILY_API_KEY`, provider policy, persisted session implementation, and authorized Employer/candidate staging test |
| Seeker → Employer → Admin end-to-end workflow | Not certified | A secure authenticated test session and synthetic test records are required; do not substitute personal credentials or create production records |

## Exact stop condition for manual verification

Testing must stop at the authentication boundary if the secure provider cannot supply a synthetic test identity or an owner-authorized staging session without personal information. The owner must then provide one of the following through an approved channel: a staging environment with clearly synthetic Seeker, Employer, and Admin accounts; or an authorized provider/admin action that verifies those synthetic identities without disabling email verification or weakening production security.

The owner does **not** need to provide a personal password, OTP, email password, Cloudflare password, Supabase password, or any customer credential. If those are the only available authentication options, the workflow remains blocked and no workaround should be attempted.

## Safe rerun sequence once the prerequisite exists

1. Sign in only with the synthetic TEST SEEKER identity and verify that the session identity is synthetic and role-correct.
2. Complete a synthetic profile, locate a clearly marked TEST VACANCY, open it, submit a TEST APPLICATION, and verify the persisted application record.
3. Sign in only with the synthetic TEST EMPLOYER identity, confirm that the test application appears under the owned vacancy, view the candidate, shortlist the candidate, and change the status to Interview.
4. Sign in only with the synthetic TEST ADMIN identity, inspect the test vacancy, test application, test employer, and moderation controls, and verify that activity/audit records are limited to the test records.
5. Confirm that no unrelated user, employer, application, payment, vacancy, notification, or support record changed.

## Current non-production verification evidence

The latest safe code increment passed **53 test files and 190 tests**, TypeScript compilation, a frozen pnpm install, and the production build. The runtime storage-image references and initial bundle-size warning were addressed through runtime URL handling, lazy route loading, deferred XLSX loading, and dependency-aware chunks; the current Vite build emitted no storage-image or bundle-size warning. The provider-readiness tests verify missing, complete, and whitespace-only credential states without serializing secret values. The salary-filter tests verify undisclosed values, numeric bands, inclusive boundaries, and the no-filter state.

## References

[1] [Kazipoa provider-integration readiness](./provider-integration-readiness.md)

[2] [Kazipoa staging RBAC guide](./staging-rbac-guide.md)

[3] [Kazipoa security threat model](./security-threat-model.md)

## Read-only persistence evidence — 27 August 2026

A read-only aggregate query was run against the configured database; no insert, update, delete, migration, or test-data injection was performed. The database currently contains 8 users, 4 vacancies, 0 employer profiles, 0 payments, 0 applications, 0 application-status history rows, 1 notification, 1 seeker document, and 0 support tickets. The test-record check found 1 user matching the test-name/email heuristic, 4 vacancies marked `isTest = 1`, and 0 applications matching the test-email heuristic.

These counts confirm that persistence tables are reachable and that the current database does not contain a completed test application workflow. They do not certify the end-to-end Seeker → Employer → Admin workflow; that workflow remains authentication- and authorized-test-session-gated. The four test vacancies were observed only and were not modified.
