# Kazipoa Safe Test-Account End-to-End QA Report

**Date:** 23 August 2026  
**Production URL:** https://kazijob-fjgmdyye.manus.space  
**Scope:** Read-only verification of the deployed public surface plus a safe synthetic test-account attempt. No personal credentials, OTPs, Cloudflare credentials, Supabase credentials, real employer contacts, external job applications, or production customer records were used.

## Executive conclusion

The deployed public surface is reachable and several public interactions work. The authenticated Seeker → Employer → Admin workflow could not be executed end to end because the first synthetic TEST SEEKER account reached a required email-verification step, while the deployed email provider could not send the verification email. Per the requested safety rule, testing stopped at that exact point. No TEST EMPLOYER or TEST ADMIN was created, no test vacancy or application was created, and no shortlist, interview, hire, or moderation state was changed.

> **Stop condition observed:** “Account created, but the verification email could not be sent. Contact Kazipoa support while the email provider is being activated.”

Therefore, the authenticated workflow is **NOT READY FOR A COMPLETE PILOT VERDICT**. The blocker is externally dependent email/provider activation, not a claimed successful or failed application workflow.

## Test-account safety record

| Identity | Test data used | Result | Database evidence |
|---|---|---|---|
| TEST SEEKER | Name `TEST SEEKER`; reserved `example.com` address; test-only passphrase | **PARTIAL — STOPPED** at verification-email delivery | One `users` row confirmed; role `user`, account type `seeker`, login method `custom_email` |
| TEST EMPLOYER | Not created | **NOT TESTED** | Read-only pattern query found no TEST EMPLOYER |
| TEST ADMIN | Not created | **NOT TESTED** | Read-only pattern query found no TEST ADMIN |

The test password was not written to the project or report. No real user or existing account was modified.

## Public deployed QA

| Test | Result | Evidence |
|---|---|---|
| Homepage load | **PASS** | The exact production homepage loaded with Kazipoa branding, search controls, latest/urgent sections, safety content, employer CTAs, metrics, and footer. Visible pre-launch records were explicitly labelled `TEST VACANCY`. |
| Find Jobs keyword input | **PASS** | A live keyword such as `Sales Executive` was accepted without a client-side error. |
| Find Jobs filters | **PASS** | Location and category controls accepted values such as Dar es Salaam and Marketing & Sales. |
| Find Jobs submit while signed out | **PARTIAL** | Search submission opened the account-type gate instead of a public filtered-results view. |
| Vacancy card access while signed out | **PARTIAL** | A vacancy card opened the account-type gate rather than public vacancy details; save, share, and native application controls were therefore unavailable in signed-out mode. |
| Exact `/jobs` route | **PASS** | The route loaded and showed truthful empty states where no live jobs were available. |
| Urgent jobs route | **PASS** | `/urgent-jobs` rendered two clearly labelled test listings with deadlines, source descriptions, and original-source links. |
| Urgent source links | **PASS** | The source links opened the matching Great Tanzania Jobs forms; no external form was submitted. |
| Verified Companies route | **PASS** | `/verified-companies` loaded the directory UI with search, region, industry, and sorting controls. |
| Verified Companies search | **PASS** | Entering `Azania` preserved the truthful no-match state. |
| Verified Companies sorting | **PASS** | `Company name` could be selected and remained stable. |
| Company profiles/non-empty filters | **NOT TESTED** | No verified company records were available to open or filter. |
| Exact `/safety-centre` route | **PASS** | The route loaded the Safety Centre content successfully. |
| Safety guidance | **PASS** | Verification limitations, privacy guidance, reporting guidance, support email, and manual-payment guidance rendered. |
| Report a Job | **PASS** | The live report action opened Contact Support with job-specific prefilled guidance. |
| Report an Employer | **PASS** | The live report action opened Contact Support with employer-specific prefilled guidance. |
| Contact Support modal | **PASS** | Required name, email, and message fields, two telephone links, and ticket action were visible. |
| Support form validation | **PASS** | Prior live evidence confirmed native required-field and invalid-email validation blocked incomplete or malformed submissions. |
| Successful support-ticket creation | **NOT TESTED** | Deliberately not submitted to avoid an unsolicited production ticket. |
| Browser console | **PASS** | No client-side console output was observed after the public interactions. |

## Authenticated workflow QA

| Test step | Result | Factual outcome |
|---|---|---|
| Seeker registration | **PARTIAL** | Synthetic TEST SEEKER registration completed at the UI level and created one database user row. |
| Seeker verification email | **FAIL/BLOCKED** | The verification email could not be sent by the deployed provider. |
| Seeker login | **NOT TESTED** | Stopped before login because verification was required and unavailable. |
| Seeker profile completion | **NOT TESTED** | No verified session was available. |
| Seeker finds TEST VACANCY | **NOT TESTED** | Authenticated workflow stopped before this step. Public urgent test listings were visible, but no authenticated seeker action was claimed. |
| Seeker opens vacancy details | **NOT TESTED** | Signed-out vacancy details were gated; authenticated access was unavailable. |
| Seeker submits TEST APPLICATION | **NOT TESTED** | No application was created or sent. |
| Application recorded | **NOT TESTED** | No application record was created, so persistence cannot be claimed. |
| Employer registration/login | **NOT TESTED** | TEST EMPLOYER was not created because the required stop condition occurred first. |
| Employer receives application | **NOT TESTED** | No application existed. |
| Employer views candidate | **NOT TESTED** | No application existed. |
| Employer shortlists candidate | **NOT TESTED** | No application existed. |
| Employer changes application status | **NOT TESTED** | No application existed. |
| Admin login | **NOT TESTED in this safe run** | No TEST ADMIN was created. Existing personal/admin credentials were not used. |
| Admin views vacancy/application/employer | **NOT TESTED** | No test records existed and no personal account was used. |
| Admin moderation controls | **NOT TESTED** | No test vacancy or application was created for moderation. |

## Database integrity and security

A read-only query confirmed exactly one synthetic test account matching the run’s test pattern: `TEST SEEKER`, account type `seeker`, role `user`, login method `custom_email`, created at `2026-08-23 17:01:55`. A second read-only query found no TEST EMPLOYER or TEST ADMIN. No vacancy, application, shortlist, interview, hire, payment, support-ticket, or moderation records were created by this run.

The first diagnostic lookup attempted to select an `emailVerified` column that does not exist in the live `users` table. The table was then inspected with `DESCRIBE users`, and the corrected lookup succeeded. This is recorded as a QA-query/schema naming issue, not as an application failure. No schema change was made.

The test respected the requested security boundaries: no personal password or OTP was requested, no external provider login was bypassed, no real employer was contacted, no real application was sent, and no existing real user or customer record was altered.

## Failures, blockers, and remaining evidence gaps

The critical blocker is verification-email delivery for the synthetic custom-auth account. The live UI truthfully reports that the account was created but the email provider could not send the verification message. The required manual action is to activate a working verification-email provider and complete verification using a controlled test mailbox, or to provide an owner-controlled test identity for the secure-provider flow. No workaround should bypass this security step.

The following remain unverified because the stop condition prevented safe continuation: authenticated seeker profile persistence, CV/document access, test application creation, employer candidate receipt, shortlist/status updates, interview notification, Admin moderation, application database persistence, and final hired-state visibility.

## QA status summary

| Area | Status |
|---|---|
| Public homepage and navigation | **PASS with interaction PARTIALs** |
| Find Jobs public interaction | **PARTIAL** |
| Verified Companies empty-state and controls | **PASS; non-empty profiles NOT TESTED** |
| Safety Centre and contextual report actions | **PASS** |
| TEST SEEKER preparation | **PARTIAL — created but blocked at email verification** |
| TEST EMPLOYER | **NOT TESTED** |
| TEST ADMIN | **NOT TESTED** |
| Seeker → Employer → Admin recruitment workflow | **NOT TESTED / BLOCKED** |
| Database integrity for this run | **PASS for no unintended test records beyond TEST SEEKER** |
| Security boundaries | **PASS for the executed scope** |

## Required next manual action

An owner-controlled test mailbox or secure-provider test identity must be made available, and the verification-email provider must be activated or replaced with a working approved sender. Once that manual step is complete, the QA can resume at **TEST SEEKER login**. Until then, Kazipoa should not be declared fully ready for real employers and job seekers based on this run.

## References

[1]: https://kazijob-fjgmdyye.manus.space/ — Kazipoa deployed production homepage and public application surface.
[2]: https://kazijob-fjgmdyye.manus.space/jobs — Deployed public jobs route tested during QA.
[3]: https://kazijob-fjgmdyye.manus.space/urgent-jobs — Deployed urgent vacancies route tested during QA.
[4]: https://kazijob-fjgmdyye.manus.space/verified-companies — Deployed verified-company directory tested during QA.
[5]: https://kazijob-fjgmdyye.manus.space/safety-centre — Deployed Safety Centre route tested during QA.


## Verification continuation — authorized mechanism audit

The deployed/source contract was checked before attempting any workaround. Custom email verification is performed only by the public `verifyEmail` procedure when a valid emailed verification token is supplied. Registration creates the token and attempts Postmark delivery; login rejects an unverified credential. The existing Admin procedures cover employer/vacancy/payment moderation, but no authorized Admin or support procedure exists to mark a custom-auth email credential verified. Therefore, verification cannot safely be completed from the current browser session without the missing provider-side email delivery or a controlled test identity that can use the secure provider.

**Final verification result: BLOCKED, not passed.** The exact missing owner-controlled configuration is an approved, working verification-email sender/provider for the configured Kazipoa application URL, or an owner-controlled secure-provider test identity. No direct verification-record write, global verification bypass, real-account change, or security weakening was performed.


## Resumed QA attempt after reported verification

The live production login was attempted with the synthetic TEST SEEKER identity only. Kazipoa returned the visible error **“Please verify your email before signing in”** and did not open `/dashboard`. A read-only query of `authCredentials` for the same normalized test address returned `emailVerifiedAt = NULL`. This means verification is not currently evidenced in the application database, despite the owner’s report that it was completed. The safe workflow therefore stopped again at authentication. No profile, vacancy, application, employer, shortlist, status, interview, hire, or moderation action was performed.

**Updated result:** TEST SEEKER login **FAIL/BLOCKED in the deployed application**; all subsequent authenticated steps remain **NOT TESTED**. The owner-controlled action required is to complete verification through the actual emailed token or an existing authorized secure-provider test identity, then retest login. No direct database verification write or bypass was performed.


## Production secure-provider retest — 24 August 2026

The exact public login URL `https://kazijob-fjgmdyye.manus.space/login?deploy=98304a73` was opened after checkpoint `98304a73`. The initial secure-access loading state completed and the Kazipoa login page rendered. Clicking **Continue with secure provider** navigated away from Kazipoa to the expected top-level URL at `https://manus.im/app-auth` with the Kazipoa callback URL and OAuth state parameters present.

This confirms that the Kazipoa-side handoff no longer remains stuck on **“Taking you to sign in…”**. The destination provider page then rendered as a blank white page with a loading indicator and did not expose sign-in controls or return a callback during the observed test window. This is a provider/browser/configuration boundary, not a confirmed Kazipoa-side redirect failure. No credentials, OTPs, user records, application records, database rows, or security settings were changed.

Result: Kazipoa handoff **PASS**; external Manus provider page **FAIL/BLOCKED for completion**; authenticated end-to-end QA remains paused at the provider boundary.
