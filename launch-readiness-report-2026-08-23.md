# Kazipoa launch-readiness evidence record

**Assessment date:** 23 August 2026  
**Live URL:** https://kazijob-fjgmdyye.manus.space  
**Scope:** Existing application, Admin ownership transfer, custom-auth pilot, public availability, SEO, and authenticated workflow readiness.

## Executive assessment

Kazipoa is operational for the existing Admin and public read-only surfaces. The transferred Admin account `infokazipoasupport@gmail.com` successfully authenticated on the published domain and reached the protected Admin control center. The retired `brianenock20@gmail.com` row is demoted to a regular user, and OAuth role synchronization no longer infers Admin privileges from a legacy owner identifier.

The custom email/password pilot is enabled through the project-controlled flag reader, with an explicit `false` rollback switch. OAuth is the recommended pilot path on login and registration because the configured Postmark server is not currently approved to send email. The application correctly keeps email verification enforced; no unverified user was manually marked verified.

## Evidence matrix

| Area | Result | Evidence and limitation |
|---|---|---|
| Admin ownership transfer | PASS | Production database verification found exactly one Admin: `infokazipoasupport@gmail.com`, display name Brian Abesiga Enock. The old email is demoted and old custom sessions were revoked. |
| New Admin custom login | PASS | A clean published-domain login reached `/dashboard` and rendered the Admin control center. Password material was not exposed in logs or reports. |
| OAuth role guard | PASS | Role decision was made explicit; regression coverage confirms a missing OAuth role cannot implicitly become Admin. |
| Login page | PASS | Production page loads the secure-provider recommendation, secondary email/password pilot, and verification-resend help. |
| Registration page | PASS | Preview verification shows the secure-provider recommendation, Job Seeker/Employer choices, and the secondary email/password form. |
| Public availability | PASS | `/`, `/jobs`, `/urgent-jobs`, `/verified-companies`, `/safety-centre`, `/robots.txt`, `/sitemap.xml`, `/api/health`, and `/api/readiness` returned HTTP 200. Readiness reported database `ok`. |
| Sitemap and robots | PASS | Live sitemap now lists the canonical public routes; robots disallows `/dashboard` and `/preferences` and points to the live sitemap. |
| Verification-email delivery | FAIL — external blocker | Postmark health was reachable, but a controlled send returned provider error 413 / HTTP 422: account not approved to send email. Sender/domain DKIM and Return-Path verification remain incomplete. |
| Verification enforcement | PASS | Unverified accounts remain blocked from custom login; the system does not create a false verification success. |
| Verification resend | PASS — app-side | A protected resend procedure, rate-limit handling, single-use token behavior, and truthful failure messaging are implemented and covered by tests. Actual delivery remains provider-dependent. |
| Seeker registration and full portfolio | NOT TESTED in a fresh live account | Existing automated coverage and prior preview checks cover the implementation, but a new owner-created account was not available for the current end-to-end run. |
| Seeker CV upload/private preview | PARTIAL | Secure storage and authenticated preview are implemented and covered by automated tests. A fresh live upload was not performed during this run. |
| Employer registration/company profile | NOT TESTED in a fresh live account | The registration UI is available, but no fresh employer account was supplied for a full live loop. |
| Vacancy posting/payment/receipt | PARTIAL | Manual Lipa Namba, receipt metadata, pricing, and publication gates are covered by automated tests. A fresh employer payment and receipt were not created in production. |
| Admin payment/employer/vacancy moderation | PARTIAL | Protected procedures and moderation tests pass; a fresh live payment-to-approval loop was not executed. |
| Seeker application/interview/hired loop | NOT TESTED | Requires a real seeker and employer account with persisted vacancy/application records; no fake records were inserted. |
| Notifications | PARTIAL | In-app notification procedures, unread state, email handoff, preferences, and status-history tests exist. Live delivery is blocked by Postmark and a fresh authenticated loop was not available. |
| Saved jobs/search/filtering | PARTIAL | Backend and UI coverage exists; fresh authenticated browser interaction was not available for this assessment. |
| Safety Centre and urgent vacancies | PASS for public route availability | Both public routes return HTTP 200 and are reachable without authentication. |
| Reports/analytics | PARTIAL | Analytics/reporting code and tests are present; current owner-side GA4 realtime confirmation is still pending. |
| Mobile responsiveness | PASS for automated/preview validation; live authenticated retest pending | Prior responsive checks passed for public/auth surfaces; fresh authenticated mobile workflow was not available. |
| Error and empty states | PASS for covered paths | Auth, storage, payment, moderation, notification, and public-vacancy error handling have regression coverage; live empty-state exercise remains limited by unavailable pilot accounts. |
| SEO metadata | PASS | Static canonical/OG metadata, dynamic metadata, robots, and server-rendered sitemap now use the reachable live origin. |

## Automated validation

The latest validation run passed **35 Vitest files and 106 tests**, TypeScript compilation, and the production build. The build emitted only the existing non-blocking warnings about a runtime storage image reference and large JavaScript chunks.

## External actions required before a real-user pilot

1. Complete Cloudflare/registrar nameserver setup for `kazipoa.co.tz` if the custom domain is required. The current takeover session reached a Cloudflare login wall, so no DNS mutation was performed by this task.
2. In Postmark, confirm the sender mailbox and complete DKIM and Return-Path verification, then request sending approval. A real confirmation email must arrive before email/password registration can be considered fully operational.
3. Create one fresh Seeker account and one fresh Employer account through OAuth or a verified email route, then run the persisted recruitment loop with no manually injected database records.
4. Create/verify the GA4 web data stream and confirm the first realtime event if analytics is required. No fake Measurement ID is used.
5. Submit the live sitemap to Google Search Console after owner access is available; indexing is asynchronous.

## Launch decision

**Not ready for an unrestricted public recruitment launch yet.** The public application and Admin control center are reachable, and the existing application/payment/moderation architecture has substantial automated coverage. The critical launch blockers are verified email delivery, a real Seeker–Employer–Admin pilot with persisted records, and owner-controlled DNS/provider setup. The safest immediate pilot is OAuth-first, with real employers and seekers completing the workflow while Postmark approval is resolved.

## Payment integration decision

The automated M-Pesa/API path was evaluated separately. The current manual Lipa Namba workflow is the appropriate pilot path because no provider merchant credentials, sandbox account, callback registration, or signing configuration is available. The provider adapter contract exists, but no automated payment success is claimed. Automated gateway work is deferred until provider approval and credentials are supplied.

## Owner-confirmed pilot outcome

The owner reported that both fresh Seeker and Employer accounts were tried through the secure-provider path and answered “Yes” for all six requested checks: Seeker dashboard/profile/CV access; Employer dashboard/company profile; vacancy/payment or receipt form; vacancy discovery and application; employer application/status handling; and notification/interview/hired-status visibility. This is recorded as **owner-confirmed**, not as independently reproduced browser evidence in this session. No passwords were requested or stored, and no database records were manually altered to manufacture a pass.
