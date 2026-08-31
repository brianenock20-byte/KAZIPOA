# Admin Dashboard RBAC Technical Specification

**Document status:** Engineering draft for staging review  
**Owner:** Kazipoa engineering team  
**Scope:** Admin Control Center, role management, notifications, activity logs, exports, chart summaries, authentication boundaries, and staging verification.

## 1. Purpose

This specification defines the security and implementation contract for role-based access control in the Admin dashboard. It is designed for the existing React 19, tRPC 11, Express, MySQL/Drizzle, custom email/password, and Manus OAuth architecture. It does not replace the existing application architecture, database, or authentication provider.

The primary requirement is simple: the client may improve navigation and usability, but the server and database must make every authorization decision. A hidden button, route guard, `accountType`, local storage value, or email address must never be treated as proof of permission.

## 2. Security objectives

The system shall authenticate the actor, reject blocked or expired sessions, authorize the required role, enforce organization/resource scope, validate all inputs, execute the smallest permitted operation, record privileged mutations, and return only the fields necessary for the requested UI. Unknown roles and missing authorization context shall be denied by default.

## 3. Roles and permissions

| Role | User administration | Role management | Activity and reports | Notifications | Workspace access |
|---|---|---|---|---|---|
| Admin | Read, block/unblock, delete with safeguards | Grant/revoke permitted roles; cannot self-demote or remove last Admin | Read, filter, sort, paginate, compare, export | Read, search, mark read, archive, restore, delete own Admin alerts | Admin Control Center |
| Employer | Own company, vacancies, and applications | None | Own operational views only | Own operational notifications | Employer workspace |
| Seeker | Own profile, CV, applications, and saved jobs | None | Own application history | Own seeker notifications | Seeker workspace |
| Blocked account | None | None | None | None | No protected workspace |

If a project introduces Manager or Viewer roles, add them to an explicit allow-list and document scope. Do not silently treat them as Admin.

## 4. Authorization flow

Every protected procedure shall use this sequence:

1. Build the authenticated subject from the verified session or OAuth identity.
2. Reject missing, expired, invalid, or blocked sessions.
3. Check the required server-side permission.
4. Validate the requested resource belongs to the actor’s organization or permitted scope.
5. Validate all input with a strict schema.
6. Execute the operation in a transaction when an invariant can be broken by concurrency.
7. Write an audit event for role, access, blocking, deletion, moderation, export, and other privileged mutations.
8. Return a minimal, non-sensitive result and invalidate/re-evaluate affected sessions where policy requires it.

## 5. Backend contract

Admin procedures should be exposed through a protected router boundary such as `adminProcedure`. Inputs should be strict and finite. Activity queries should accept allow-listed filter fields (`search`, event type, start date, end date), sort fields (`createdAt`, event type, user name), direction, page, and a capped page size. Return a stable envelope such as `{ items, page, pageSize, total, totalPages }`.

Role mutation input should include a positive target ID, an allow-listed role, and explicit confirmation text such as `CHANGE_ROLE`. The server must reject self-targets, blocked targets when policy prohibits promotion, out-of-scope targets, malformed roles, and attempts to remove the last active Admin. The database update and last-Admin check should be transactionally safe.

Notification procedures must scope rows to the authenticated Admin. Archive is reversible; permanent delete requires explicit confirmation and audit logging. `markAllAsRead` must update only the caller’s unread notification rows. Export procedures must use active filters and an output allow-list, and must not include password hashes, session tokens, secrets, private storage keys, or unnecessary personal data.

## 6. Data model expectations

The users table shall contain a server-authoritative role and blocked state. Activity events shall record actor, target where applicable, action type, timestamp, and enough display metadata to audit without exposing secrets. Notifications shall contain recipient ownership, title/message, read timestamp, and nullable archive timestamp. Profile photos and CV files shall be stored outside the database as authorized storage references; the database should contain metadata and access policy, not file bytes.

Any schema change must be reviewed, generated as a migration, applied to staging first, and verified against the actual database. Destructive changes require explicit approval and a recovery plan.

## 7. Frontend contract

The UI shall conditionally render Admin controls based on the server-resolved role, but it shall also handle a forbidden response gracefully. Role changes require a confirmation modal that names the target and resulting role, prevents submission while a mutation is pending, and reports success or failure without claiming a change that the server rejected. Destructive notification deletion requires a second explicit confirmation.

Activity Log shall support search, event/date filters, sorting, pagination, loading skeletons, empty states, and exports that reflect the active filters. Tooltips and profile actions must be available only when the underlying user data is permitted. Email/message controls must require a deliberate user action and must not send automatically.

## 8. Error and observability contract

Return generic unauthorized/forbidden responses to callers and write detailed diagnostic information only to protected server logs. Log request correlation IDs, actor ID, procedure, result, and latency where the project observability system supports it; never log passwords, OTPs, access tokens, or full private documents. Alert on repeated forbidden calls, unusual role mutations, bulk export spikes, and unexpected database errors.

## 9. Testing requirements

| Test layer | Required coverage |
|---|---|
| Unit | Permission middleware, unknown role denial, blocked actor denial, self-target rejection, cross-scope rejection, last-Admin invariant |
| Router/integration | Real tRPC procedures, schema validation, database ownership predicates, audit events, notification ownership, session re-evaluation |
| UI | Confirmation modal, disabled pending state, filters, pagination, loading skeleton, empty/error states, export buttons, keyboard access |
| Security regression | IDOR attempts, cross-organization IDs, forged role/account type, stale session after block, dangerous export values, XSS payloads |
| Deployment | Migration result, build artifact/version, runtime health, route status, logs, desktop/mobile preview |

A test may be marked PASS only when the asserted response and relevant database side effect were observed. Use PASS, PARTIAL, FAIL, or NOT TESTED; do not convert missing evidence into success.

## 10. Staging and release process

Use separate database, storage, OAuth callback, email sink, payment sandbox, and secrets. Create clearly labeled test identities through documented application flows. Run the permission matrix for anonymous, Seeker, Employer, blocked user, Admin, unknown-role, malformed-input, self-target, cross-scope, and missing-record cases. Preserve the build ID and evidence table for the release candidate.

Production promotion requires successful tests, reviewed migrations, no unresolved high-severity findings, confirmed export redaction, verified role invariants, reviewed logs, and a live-version check. If owner-controlled login or provider verification is needed, stop at that step and record the exact manual action rather than using personal credentials or bypassing authentication.

## 11. Non-functional requirements

The dashboard should remain usable on desktop and mobile, should show accessible loading and error states, should cap expensive queries, and should use stable pagination/filter inputs. Security-sensitive operations should be idempotent where retries are possible. The implementation should preserve existing workspace isolation and avoid coupling Admin routing to stale client-side account type.

## 12. Acceptance criteria

The feature is accepted when every Admin procedure has a server-side permission check, every read/write query has an ownership or organization predicate, role invariants are protected, notifications are scoped, exports are redacted and filter-aware, audit events exist for privileged mutations, unit and integration tests pass, the production build succeeds, and the exact candidate version is verified in staging. Leadership approval does not replace technical evidence.

## 13. Open decisions

The team must confirm whether a future Manager role is needed, whether notification deletion is subject to a retention policy, whether export files require additional storage controls, and whether role changes should immediately invalidate all existing sessions. Document each decision in the project record before implementation.
