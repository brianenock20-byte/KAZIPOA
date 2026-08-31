# Kazipoa Pre-Launch Test Vacancy Import and QA Report

**Author:** Manus AI  
**Assessment date:** 23 August 2026  
**Production URL:** https://kazijob-fjgmdyye.manus.space  
**Test batch:** `KAZIPOA_PRELAUNCH_TEST_001`  
**Current published checkpoint:** `0a5f6a0c`

## Executive conclusion

Kazipoa now contains exactly five source-verified pre-launch vacancies for controlled marketplace testing. Each record is explicitly labelled `🧪 TEST VACANCY`, marked non-authorized and non-verified, linked to the original publisher’s application route, excluded from approved-job and verified-employer metrics, excluded from sitemap/indexable vacancy metadata, and protected by backend expiry and exact-batch cleanup rules.

The public homepage, urgent-vacancy route, company directory, vacancy detail page, mobile layouts, database isolation, and automated regression suite were verified. The platform is **not yet ready for a real employer or job-seeker pilot based solely on this test batch**, because the five listings are third-party source test records without employer authorization and the authenticated Seeker–Employer–Admin workflow could not be executed in the available browser session. A fresh independent Seeker and Employer account pilot remains required before real launch.

> These five rows are suitable for validating search, filtering, cards, urgent-vacancy display, source attribution, and expiry behavior. They must not be presented as employer-authorized Kazipoa postings.

## Imported source records

| # | Vacancy | Source employer | Location | Deadline | Source detail | Original application route | Result |
|---:|---|---|---|---|---|---|---|
| 1 | Sales Executive | 360HR Solutions | Mwanza, Mbeya, Geita | 5 Sep 2026 | [Great Tanzania Jobs listing][1] | Source company application form | Imported as test |
| 2 | Deputy Sales Manager | 360HR Solutions | Dar es Salaam and Geita | 5 Sep 2026 | [Great Tanzania Jobs listing][2] | Source company application form | Imported as test |
| 3 | Health Safety and Environment Officer | Epic | Dar es Salaam | 25 Aug 2026 | [Great Tanzania Jobs listing][3] | Source company application form | Imported as test; urgent |
| 4 | Accountant — Airline Catering/Aviation | Top Talented Recruits | Dar es Salaam | 5 Sep 2026 | [Great Tanzania Jobs listing][4] | Source company application form | Imported as test |
| 5 | Social Studies Teacher | Rahman Pre & Primary School | Kigamboni, Kibada, Uvumba Street, Dar es Salaam | 26 Aug 2026 | [Great Tanzania Jobs listing][5] | Source company application form | Imported as test; urgent |

The source audit confirms the titles, employers, categories, locations, deadlines, salary disclosure, role details, and original application routes for all five records. No source logo was copied, and no employer authorization for Kazipoa publication was inferred.

## Production database integrity

The connected production database returned the following read-only audit results:

| Check | Result | Status |
|---|---:|---|
| Records in exact batch | 5 | **PASS** |
| Rows with `isTest=1` | 5 | **PASS** |
| Rows with `testBatchId=KAZIPOA_PRELAUNCH_TEST_001` | 5 | **PASS** |
| Rows with `employerAuthorized=0` | 5 | **PASS** |
| Rows with both source and external application URLs | 5 | **PASS** |
| Ordinary non-test vacancies created by import | 0 | **PASS** |
| Employer profiles created by import | 0 | **PASS** |
| Existing real records overwritten | 0 observed | **PASS** |

The import script is idempotent and refuses to proceed when duplicate batch/source records or non-test mutation risks are detected. The Admin cleanup action is scoped to the exact test flag and exact batch identifier; it cannot delete ordinary vacancies by title, employer, or broad status.

## Feature QA results

| Area | Result | Evidence and interpretation |
|---|---|---|
| Source verification for all five listings | **PASS** | All five direct source pages and application routes were recorded in the source audit. |
| Five-record import and duplicate protection | **PASS** | Production query returned exactly five batch rows with complete source routing. |
| Explicit test markers on marketplace cards | **PASS** | Live homepage showed all five records with `🧪 TEST VACANCY`. |
| Non-authorization warning on detail page | **PASS** | Live `/vacancies/60002` stated that Kazipoa employer authorization was not confirmed. |
| Original-source application routing | **PASS** | Detail and urgent cards exposed `Apply on original source`; no internal application claim was shown for test rows. |
| Urgent vacancy route | **PASS** | Live `/urgent-jobs` rendered HSE Officer and Social Studies Teacher, both with deadlines and source links. |
| Verified-company directory exclusion | **PASS** | Live `/verified-companies` rendered the truthful empty state because all current rows are test/non-authorized. |
| Approved-job and verified-employer metrics | **PASS** | Homepage metrics remained zero for approved active jobs and verified employers. |
| Sitemap and structured-data exclusion | **PASS** | Test rows are excluded from indexable vacancy helpers and normal JobPosting metadata. |
| Backend expiry guard | **PASS** | Backend read/application logic and hourly expiry callback are covered by focused tests; public reads also enforce the deadline gate. |
| Scheduled expiry | **PASS** | Heartbeat schedule `0 0 * * * *` UTC calls `/api/scheduled/expire-test-vacancies`; task UID is recorded in the source audit. |
| Search and marketplace cards | **PASS** | Homepage and `/jobs` displayed the five real database rows; category/location controls were present. |
| Mobile public layout | **PASS** | Mobile screenshots at 390×844 showed responsive header, company filters, urgent cards, and footer without horizontal page overflow. |
| Admin test-batch panel and exact cleanup control | **PARTIAL** | Code and automated authorization tests cover the panel and exact-batch behavior, but a live click-through was not performed without an authenticated Admin session. |
| Job Seeker registration, portfolio, CV, save, and application flow | **NOT TESTED** | Requires a fresh authenticated Seeker account and should be tested independently; no fake success was claimed. |
| Employer registration, verification, payment/receipt, posting, and candidate flow | **NOT TESTED** | Requires a fresh authenticated Employer account and real persisted workflow actions. |
| Admin approval, moderation, payment review, and full status loop | **NOT TESTED** | Requires a fresh authenticated Admin pilot session; backend role tests exist but do not replace end-to-end interaction. |
| External email delivery | **PARTIAL** | Postmark integration exists, but a fresh live notification delivery was not claimed in this batch. |
| Automated M-Pesa/API payment confirmation | **NOT TESTED** | The current production workflow remains manual Lipa Namba review; no provider callback was fabricated. |
| Supabase migration | **NOT TESTED** | The current application remains on MySQL/OAuth/S3; no migration was assumed. |

## Automated and deployment validation

The final implementation validation passed **81 Vitest tests**, TypeScript compilation, and the production build. The build emitted a large-bundle warning and retains a runtime-resolved safety image reference; neither prevented the tested public routes from loading. The managed project was synchronized and restarted after detecting that an earlier production bundle was stale. A fresh publish then served the corrected company-directory and urgent-route behavior.

The exact production routes verified were `/`, `/jobs`, `/urgent-jobs`, `/verified-companies`, and `/vacancies/60002`. The live homepage showed the screenshot-inspired public composition, real database-backed test cards, truthful zero metrics, search controls, urgent vacancies, and the payment-method presentation. The public `/urgent-jobs` route initially served only the shared shell; it was corrected, republished, and then verified live.

## Remaining critical issues before public launch

The most important blocker is the absence of an authenticated, end-to-end pilot with three separate accounts: a fresh Job Seeker, a fresh Employer, and the existing Admin. That pilot must prove that employer verification, payment evidence, Admin approval, vacancy publication, seeker application, candidate review, shortlist, interview scheduling, notification, and hired status all persist correctly in the database.

The five imported records are not employer-authorized. They are safe for test display only and should be deleted before a commercial launch unless the source employers explicitly authorize publication. The existing manual Lipa Namba flow also remains a manual review process; it should not be described as automatic payment confirmation.

The production domain currently verified for this report is `kazijob-fjgmdyye.manus.space`. The requested custom domain `portol.kazipoa.co.tz` remains a separate DNS/binding task and is not the live URL used in this QA evidence. GA4 remains optional and has not been configured with a fabricated Measurement ID.

## Recommended launch gate

Kazipoa should proceed to a **private pilot only**, not an unrestricted commercial launch. The owner should create fresh independent test accounts, complete the full workflow, capture the evidence, and then either obtain authorization for the five source records or use only employer-submitted vacancies. After testing, the Admin should use the exact-batch cleanup control to delete `KAZIPOA_PRELAUNCH_TEST_001` before public launch.

### Final assessment

**QA score for the implemented pre-launch test-vacancy scope: 8.5/10.** The public marketplace and safety controls are in good shape for controlled testing. **Launch readiness for real employers and job seekers: NOT YET CONFIRMED.** The remaining decision depends on the authenticated end-to-end pilot and authorized launch vacancies, not on additional public-page styling.

## References

[1]: https://www.greattanzaniajobs.com/jobs/job-detail/job-Sales-Executive-job-at-360HR-Solutions-85568/nav-15?Itemid=231 "Sales Executive — Great Tanzania Jobs"
[2]: https://www.greattanzaniajobs.com/jobs/job-detail/job-Deputy-Sales-Manager-job-at-360HR-Solutions-85569/nav-15?Itemid=231 "Deputy Sales Manager — Great Tanzania Jobs"
[3]: https://www.greattanzaniajobs.com/jobs/job-detail/job-Health-Safety-and-Environment-Officer-job-at-Epic-85571/nav-15?Itemid=231 "Health Safety and Environment Officer — Great Tanzania Jobs"
[4]: https://www.greattanzaniajobs.com/jobs/job-detail/job-Accountant-Airline-CateringAviation-job-at-Top-Talented-Recruits-85576 "Accountant — Airline Catering/Aviation — Great Tanzania Jobs"
[5]: https://www.greattanzaniajobs.com/jobs/job-detail/job-Social-Studies-Teacher-job-at-Rahman-Pre-Primary-School-85565/nav-15?Itemid=231 "Social Studies Teacher — Great Tanzania Jobs"
[6]: https://kazijob-fjgmdyye.manus.space "Kazipoa production website"
