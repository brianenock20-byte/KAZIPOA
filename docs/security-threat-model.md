# Kazipoa Admin Dashboard Threat Model

## Purpose and scope

This assessment covers the Admin control center and the shared authentication, tRPC, database, notification, activity-log, export, and profile-data paths it uses. It assumes the current React 19, tRPC 11, Express, MySQL/Drizzle, custom email/password, and Manus OAuth architecture remains in place. It is a design-level assessment, not a penetration test or a production approval.

## Security objectives

The system must ensure that only authorized Admins can manage roles, users, notifications, moderation data, settings, reports, and exports. It must prevent cross-workspace and cross-tenant access, preserve authentication and verification boundaries, keep sensitive user and CV data private, maintain an auditable history of privileged actions, and avoid false success states for moderation or payment workflows.

## Assets and impact

| Asset | Examples | Primary impact if compromised |
|---|---|---|
| Identity and sessions | OAuth identity, custom credentials, session cookies, verification state | Account takeover, impersonation, privilege escalation |
| Role and permissions | Admin/user role, workspace/account type, blocked state | Unauthorized control of the platform |
| User records | Names, emails, profile photos, account history | Privacy loss, phishing, reputational harm |
| Recruitment records | Vacancies, applications, candidate profiles, CVs | Confidentiality loss, unfair decisions, fraud |
| Payment and moderation data | Receipts, approval state, admin notes | Financial loss, false publication, trust damage |
| Activity and notification records | Audit events, registration alerts, archived alerts | Loss of accountability or operational visibility |
| Exported reports | CSV, XLSX, PDF/PNG reports | Bulk data leakage, spreadsheet injection |
| Availability and integrity | Database, API, deployment, queues | Service outage or corrupted workflow state |

## Actors and trust boundaries

| Actor or component | Trust level | Boundary to enforce |
|---|---|---|
| Anonymous visitor | Untrusted | Public routes only; no protected query or mutation |
| Seeker or Employer | Authenticated but non-privileged | Own workspace and owned records only |
| Admin | Privileged but still authenticated | Explicit Admin role plus resource scope; audit every mutation |
| Browser client | Untrusted execution environment | Never trust hidden controls, local storage, or client role state |
| tRPC/API server | Security enforcement point | Validate input, authenticate, authorize, scope, and audit |
| Database/storage | Protected persistence | Ownership predicates, least-privilege credentials, safe migrations |
| OAuth/email provider | External dependency | State binding, callback validation, provider health handling |

## Highest-priority abuse cases

| ID | Threat path | Likelihood | Impact | Required controls |
|---|---|---:|---:|---|
| T01 | Non-Admin calls an Admin procedure directly | Medium | Critical | Server-side `adminProcedure`, deny-by-default tests, generic 403 |
| T02 | User changes another user’s role using a guessed ID | Medium | Critical | Role check plus target ownership/organization scope and audit event |
| T03 | Admin demotes themselves or removes the final Admin | Low | Critical | Self-target rejection and transactional last-Admin protection |
| T04 | Stale `accountType` or client state routes Admin into another workspace | Medium | High | Server-authoritative role resolution and role-isolation regression tests |
| T05 | Blocked account reuses an existing session | Medium | High | Session re-evaluation, blocked check on identity lookup and protected procedures |
| T06 | Activity/export filter becomes SQL or data-exfiltration vector | Medium | High | Validated dates, allow-listed sort fields, capped page size, scoped query |
| T07 | CSV/XLSX export leaks secrets or enables formula injection | Medium | High | Explicit output allow-list, escape cells, test dangerous prefixes |
| T08 | Notification archive/delete affects another Admin’s records | Low | Medium | Notification owner predicate and mutation tests |
| T09 | CV/profile photo URL exposes private data | Medium | High | Storage authorization, short-lived access where appropriate, no public-by-default private files |
| T10 | OAuth callback or custom session is forged or replayed | Low/Medium | Critical | Nonce/state binding, secure cookies, expiry, rotation, rate limits |
| T11 | Admin approves a payment/vacancy based on a client success state | Medium | High | Server-confirmed state machine and explicit moderation/payment audit trail |
| T12 | Resource exhaustion through report queries or repeated mutations | Medium | Medium/High | Pagination, query limits, rate limiting, timeouts, idempotency where needed |
| T13 | XSS through user name, notification, or activity text | Medium | High | React escaping, safe URL handling, output encoding, hostile-data tests |
| T14 | Deployment serves an old or mismatched build | Medium | High | Version verification, health checks, build logs, cache/deployment checks |

## Required control design

Every protected operation should follow this order: establish the authenticated subject, reject blocked or invalid sessions, authorize the required role, verify resource ownership or organization scope, validate the input, perform the minimal mutation in a transaction where invariants matter, write an audit event, and return a minimal response. A UI route guard is useful for navigation but is never the authorization boundary.

Role changes must use an allow-listed role set, explicit confirmation, self-protection, last-Admin protection, and an audit event. Notification archive and delete must be scoped to the current Admin; delete must be explicitly confirmed and should be treated as irreversible. Exports must use the active filters, fetch only permitted fields, and exclude credentials, tokens, secrets, private storage keys, and unnecessary personal data.

## Verification plan

The staging test matrix should include anonymous, seeker, employer, blocked user, Admin, unknown-role, malformed-input, self-target, cross-scope, and missing-record cases. For each Admin procedure, assert both the HTTP/tRPC response and the database side effect. Repeat checks after logout, session expiry, role change, blocking, and deployment restart. Run automated tests, TypeScript, production build, dependency audit, migration review, and desktop/mobile preview checks.

## Residual risks and release blockers

The following remain release blockers until evidence exists: any Admin procedure callable by a non-Admin; any cross-tenant or cross-owner read/write; ability to remove the last active Admin; private CV or profile-photo exposure; exports containing secrets; false payment or moderation success; unreviewed destructive migration; unresolved high-severity dependency or runtime finding; or inability to verify the deployed version. Static sample-dashboard checks do not satisfy backend RBAC evidence.

## Ownership and review cadence

The tech lead owns authorization and migration review. The product owner approves the permission matrix and acceptable residual risk. QA owns the staging matrix and regression evidence. Reassess this model whenever roles, identity providers, storage paths, payment state machines, export fields, or Admin procedures change.
