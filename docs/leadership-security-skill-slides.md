# Leadership briefing: Admin Dashboard Hardening Skill

## Slide 1 — From feature requests to controlled releases
The reusable `admin-dashboard-hardening` skill turns incremental Admin dashboard requests into a repeatable delivery process. It preserves existing architecture, requires server-side authorization, uses real data, and ends with tests, preview evidence, and a versioned checkpoint.

## Slide 2 — What the skill protects
The scope covers identity and sessions, roles and permissions, user and recruitment records, payments and moderation states, notifications and audit events, exports, storage, and availability. The central principle is that the browser is untrusted and the API/database enforce policy.

## Slide 3 — RBAC baseline
The skill requires an explicit permission matrix, allow-listed roles, deny-by-default behavior, resource/organization scope checks, blocked-account rejection, self-demotion protection, last-Admin protection, minimal responses, and audit events. Negative tests are required for anonymous, wrong-role, blocked, malformed, self-target, and cross-scope requests.

## Slide 4 — Threat model priorities
The highest-impact paths are Admin procedure abuse, guessed-ID privilege escalation, stale role routing, session reuse after blocking, private CV/profile exposure, unsafe exports, forged payment/moderation success, OAuth/session abuse, resource exhaustion, XSS, and stale deployments. Each has a required control and a documented release-blocker condition.

## Slide 5 — Staging proof before production
Staging must use separate database, storage, OAuth, email, payment, and secrets. Test identities are synthetic and clearly labeled. The team records expected response, actual response, database side effect, version, reviewer, and PASS/PARTIAL/FAIL/NOT TESTED for each protected procedure.

## Slide 6 — Evidence and leadership decision
The skill package validated successfully. The isolated browser fixture passed UI smoke checks for Admin context, activity search/sort, notification search, mark-all-read, chart range, and comparison summary. Kazipoa’s recent regression suite passed 40 files and 124 tests with TypeScript and production build checks. Leadership should approve the skill for staging use, require the threat-model exit criteria, and treat unresolved high-severity findings or unverified production builds as release blockers.
