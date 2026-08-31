# Kazipoa Read-Only Backend and Supabase Scope Audit

**Date:** 23 August 2026  
**Project:** Kazipoa recruitment platform  
**Author:** Manus AI  
**Audit type:** Read-only source, configuration, and database inspection. No database writes, migrations, connector changes, account creation, credential handling, or destructive actions were performed.

## Executive conclusion

The attached instruction asks Kazipoa to use an existing Supabase project as the source of truth. The current Kazipoa application, however, is not Supabase-backed. It is implemented with **MySQL/TiDB-compatible persistence, Drizzle ORM, tRPC, Manus OAuth/custom authentication, and server-side storage helpers**.

The session configuration contains built-in entries named **Supabase** and **Supabase API**, but both are disabled. No active Supabase project, Postgres connection, Supabase Auth configuration, Supabase Storage bucket, or Supabase RLS policy was available for inspection. Neither connector was enabled because the requested first step was a read-only audit and the owner did not provide authorization to change external integration state.

> **Safe decision:** Do not migrate, replace, reset, or split the current backend by assumption. Preserve the existing MySQL-backed system until the owner explicitly confirms whether Supabase is intended to replace it, coexist with it, or remain a separate future service.

## Current system evidence

| Area | Evidence observed | Finding |
|---|---|---|
| Database | `drizzle/schema.ts` uses `mysqlTable`; migration snapshots and journal declare the `mysql` dialect; the full-stack template uses `DATABASE_URL` | Active persistence is MySQL/TiDB-compatible |
| Authentication | Manus OAuth plus additive custom-auth tables for credentials, verification/reset tokens, sessions, rate limits, and audit events | Current authentication must not be replaced by an assumed Supabase Auth migration |
| Storage | Server storage helpers and storage references for CVs, certificate attachments, receipts, and profile photos | File bytes are represented by storage references rather than database BLOB fields |
| API | tRPC router procedures are separated into public, protected, and admin access levels | Existing role gates should be preserved |
| Supabase | `Supabase` and `Supabase API` entries exist in session configuration, both with `enabled: false` | No active Supabase integration was audited |
| RLS | No Supabase project was connected or exposed to this session | RLS policy inspection is unavailable until the owner enables or authorizes the existing connector |

## Relevant existing data model

The current schema already covers the requested recruitment workflow and related privacy controls.

| Domain | Existing tables and fields |
|---|---|
| Users and roles | `users` stores identity, email, `role` (`user`/`admin`), `accountType` (`seeker`/`employer`), account locking, and profile-photo metadata |
| Employers | `employerProfiles` stores company identity, registration information, industry, location, contacts, and `verified` state |
| Vacancies | `vacancies` stores employer ownership, job details, deadlines, moderation status, employer verification, payment requirement, urgency, test/source metadata, authorization, and publication status |
| Payments | `payments` stores method/provider, TZS amount, provider reference, state, evidence/admin notes, and receipt-storage metadata |
| Applications | `applications` stores vacancy, employer, seeker, cover note, selected CV, and status through `hired` or `rejected` |
| Status history | `applicationStatusHistory` stores prior/next status, employer notes, interview timestamp, and ownership fields |
| Seeker portfolio | `seekerDocuments`, `seekerEducation`, `seekerExperience`, `seekerSkills`, and `seekerCertifications` store CVs, education, experience, skills, and certificate metadata/attachments |
| Saved jobs | `savedVacancies` stores seeker ownership, folders, tags, and a seeker/vacancy uniqueness constraint |
| Notifications | `notifications` stores recipient, type, application/vacancy linkage, email state/error, read time, and creation time |
| Support/moderation | `supportTickets`, `moderationLogs`, and `platformSettings` support operations and safety workflows |
| Access/privacy | `vacancyViews` and `seekerAccessEvents` record vacancy/document access without making private document URLs public |

## Existing server workflow coverage

The source router includes public vacancy discovery procedures such as `liveVacancies`, `suggestions`, `indexableVacancies`, and `vacancy`; protected procedures for seeker and employer actions; and admin procedures including `adminQueue`, `moderate`, `verifyEmployer`, `setUrgency`, `adminReceipt`, and `updateState`.

Authentication includes custom registration/login, email verification, resend-verification, password reset, logout, and OAuth fallback. This confirms that the current application already has a MySQL-backed model for:

1. seeker registration, portfolio completion, CV storage, and application submission;
2. employer profiles, verification, vacancies, payment evidence, and applications;
3. admin moderation, receipt review, vacancy approval, and role-based access; and
4. application history, interview dates, notifications, support tickets, and private document access events.

## Read-only verification of the five pre-launch vacancies

A read-only query against the active database returned exactly five pre-launch vacancies: IDs **60001–60005**. Every record has the required test-only metadata.

| Required field | Observed value for all five records |
|---|---|
| `isTest` | `1` |
| `testBatchId` | `KAZIPOA_PRELAUNCH_TEST_001` |
| `employerAuthorized` | `0` |
| `employerVerified` | `0` |
| `sourceType` | `external_test` |
| `sourceName` | Great Tanzania Jobs — direct source listing |

The database status is `live`, but the records are explicitly test-only and not employer-authorized or employer-verified. They must not be described as verified employer vacancies, and applications must not be delivered to the external employers named in their source metadata. No update was made to these records.

## Safe test-account and workflow scope

No real customer was connected and no new production account was created during this audit. The recommended pilot uses three isolated identities: **TEST SEEKER**, **TEST EMPLOYER**, and **TEST ADMIN**. Credentials must be entered through a secure authentication flow only; they must not be written to project files or posted in chat.

The minimum safe pilot is:

> Test seeker registers or logs in → completes profile → finds a test-only vacancy → applies → test employer logs in → sees the persisted application → shortlists the candidate → Admin reviews or moderates the vacancy/application.

The existing schema appears sufficient for this loop. Any missing behavior discovered during an authorized pilot should be implemented as a narrow backward-compatible change in the current MySQL/tRPC architecture. No Supabase tables, RLS policies, authentication replacement, storage migration, or database reset is required by this audit.

## Analytics, DNS, and email constraints

GA4 remains disabled because no real Measurement ID was provided. No fake Measurement ID was added.

Cloudflare/registrar DNS and Postmark sender/domain verification remain owner-controlled actions. No Cloudflare password, registrar credential, Postmark credential, or DNS mutation was requested or fabricated. The owner should perform account-level verification directly or provide an authorized connector through the appropriate secure flow.

## Security and architecture observations

The current source separates public, protected, and admin procedures; stores password hashes rather than plaintext passwords; includes expiry and revocation fields for tokens and sessions; records authentication events with hashed request metadata; and protects seeker document access through authenticated server paths. These are source-level observations and do not replace a dedicated penetration test.

The principal risk is **backend expectation drift**. Connecting Supabase without a confirmed migration or coexistence design could create a second source of truth and undermine existing role, privacy, payment, or document-storage guarantees.

## Final recommendation

The attached instructions are now applied as project constraints:

- preserve the current MySQL/Drizzle backend;
- do not create, reset, replace, or delete a Supabase project or existing production data;
- do not enable Supabase until the owner confirms the intended scope and authorizes a read-only connector audit;
- keep the five pre-launch records test-only and non-authorized;
- keep GA4 disabled without a real Measurement ID;
- keep Cloudflare/registrar DNS and Postmark verification pending owner-controlled access; and
- perform the authenticated Seeker → Employer → Admin pilot only with isolated test identities and persisted records.

A Supabase migration or integration is **not authorized or required by this audit**. The next safe action is an owner-reviewed pilot against the existing MySQL-backed application, followed by a separate migration decision only if Supabase is genuinely required.
