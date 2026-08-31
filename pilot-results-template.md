# Kazipoa Pilot Test Results and Monitoring Template

**Test date:** YYYY-MM-DD  
**Tester:**  
**Environment:** Production / Preview  
**Site URL:** https://kazijob-fjgmdyye.manus.space  
**Admin account:**  
**Seeker test email:**  
**Employer test email:**  

## Current audit snapshot

The latest read-only database check on 22 August 2026 found **2 users, 0 employer profiles, 0 vacancies, 0 payments, 0 applications, 0 notifications, and 0 support tickets**. Both persisted users currently have `accountType=seeker`; no separate Employer account has been corroborated. The latest runtime and network review found successful public route, health/readiness, and protected-procedure responses, with no explicit payment/application API failure in the inspected window.

The logs did show normal unauthenticated probes such as “Missing session cookie” and normal empty queue responses. These are not application failures unless they occur after a user has completed sign-in. Google Analytics is intentionally deferred: do not add a fake Measurement ID; activate GA4 only after the owner supplies a real `VITE_GA_MEASUREMENT_ID`.

## Pilot execution checklist

| Step | Action | Expected result | Actual result | Pass/Fail | Evidence or error ID |
|---|---|---|---|---|---|
| A1 | Open public homepage while logged out | Homepage returns HTTP 200 and public content is visible |  |  |  |
| A2 | Register fresh Job Seeker | Account opens in Job Seeker workspace |  |  |  |
| A3 | Save education, experience, skills, certification | Data remains after refresh |  |  |  |
| A4 | Upload and view a PDF CV | CV uploads to protected storage and can be viewed by its owner |  |  |  |
| A5 | Check seeker privacy | Seeker cannot see Employer/Admin tools or another user’s portfolio |  |  |  |
| A6 | Register fresh Employer | Account opens in Employer workspace |  |  |  |
| A7 | Save company portfolio | Company data remains after refresh |  |  |  |
| A8 | Create Basic vacancy | Vacancy enters payment/review flow; fee is TSh 10,000 |  |  |  |
| A9 | Submit real payment reference and receipt | Employer sees Pending review; receipt is attached to the submission |  |  |  |
| A10 | Admin opens Payment Operations | Payment record shows employer, amount, provider/reference, and timestamp |  |  |  |
| A11 | Admin previews receipt | Receipt opens in the Admin modal without a new tab or error |  |  |  |
| A12 | Admin approves payment | Payment becomes successful/approved and employer receives the updated status |  |  |  |
| A13 | Admin reviews vacancy | Approved vacancy becomes live only after required checks pass |  |  |  |
| A14 | Seeker opens live vacancy | Approved vacancy is visible in marketplace |  |  |  |
| A15 | Seeker submits application | Application is persisted and appears in Seeker dashboard |  |  |  |
| A16 | Employer updates candidate status | Employer can set Shortlisted/Interview and add note/date |  |  |  |
| A17 | Seeker sees status update | Timeline and notification show the Employer update |  |  |  |

## Payment and receipt verification record

**Vacancy ID:**  
**Payment ID:**  
**Employer user ID:**  
**Package:** Basic / Featured / Premium  
**Expected amount:** TSh  
**Actual amount shown on receipt:** TSh  
**Provider:** M-Pesa / Airtel Money / Other  
**Provider transaction reference:**  
**Receipt filename:**  
**Receipt preview checked by Admin:** Yes / No  
**Payment status before Admin review:**  
**Payment status after Admin review:**  
**Vacancy status before Admin review:**  
**Vacancy status after Admin review:**  
**Admin note:**  

> Never record a fabricated transaction ID as a successful payment test. For a production payment test, compare the receipt against the actual mobile-money transaction and keep the reference confidential.

## Incident report template

**Incident ID:** KZP-YYYYMMDD-001  
**Severity:** Critical / High / Medium / Low  
**Detected at:**  
**Account role:** Seeker / Employer / Admin / Logged out  
**Page and URL:**  
**Action being performed:**  
**Expected result:**  
**Observed result:**  
**Exact error message:**  
**HTTP status or tRPC procedure:**  
**Payment ID, vacancy ID, or application ID:**  
**Timestamp and timezone:** Africa/Dar_es_Salaam  
**Screenshot or screen recording:**  
**Reproduction steps:**  
**Workaround:**  
**Owner:**  
**Resolution and verification:**  

## Owner follow-ups before final launch

| Item | Current status | Required owner action |
|---|---|---|
| Separate Employer account | Pending | Create a fresh Employer account with a different email and save Company Profile. |
| Fresh Seeker account | Pending | Create a fresh Job Seeker account with a different email and verify portfolio/CV persistence. |
| GA4 | Deferred | Supply a real GA4 Measurement ID; no analytics script is enabled until then. |
| Google Search Console | Pending | Verify the public property and submit `/sitemap.xml`. |
| Custom domain | Pending | Complete nameserver delegation and domain binding for the chosen domain. |
| Postmark | Pending | Verify sender/domain and perform a real delivery test. |

## Recommended monitoring setup

### Availability monitoring

Create an external uptime check against the public homepage and a lightweight health endpoint. The project now exposes `/api/health` for process availability and `/api/readiness` for process plus database readiness. Both endpoints were verified with HTTP 200 in the current deployment. `/api/readiness` returns HTTP 503 if the database check fails. The response contains no payment records, user data, credentials, or database connection details. Do not expose payment records, user data, credentials, or database connection details in the response.

Monitor the homepage every 1–5 minutes and the health endpoint every minute. Alert after three consecutive failures, then clear the alert after three consecutive successful checks. A second check should request the public marketplace route and verify that it returns 200 rather than a SPA fallback or gateway error.

### Error monitoring

Add a server-side error-monitoring service such as Sentry or an equivalent provider. Capture unhandled exceptions, tRPC procedure failures, database connection errors, storage failures, and Postmark delivery failures. Scrub email addresses, authentication tokens, CV contents, receipt contents, transaction references, and payment credentials before sending events. Tag events by `role`, `procedure`, `vacancyId`, `paymentId`, and `applicationId` only where those identifiers are safe to record.

### Payment queue monitoring

Create a protected Admin-only queue-health query or server metric that reports the count of payments in `pending`, `successful`, `failed`, `cancelled`, and `refunded` states, plus the age of the oldest pending payment. Alert when a pending payment is older than one business day, when the queue query returns an error, or when receipt storage/preview fails. Do not automatically approve payments based only on a database status or uploaded screenshot.

### Application queue monitoring

Track application creation failures, duplicate-application rejections, Employer status-update failures, and notification-delivery failures. Alert when an application mutation returns an unexpected 4xx/5xx error, when status updates are persisted but the corresponding notification fails, or when the application queue query becomes unavailable. Keep application content and CV contents out of alert payloads.

### Daily Admin review

The Admin should review the payment queue, oldest pending item, failed payment count, receipt-preview failures, application mutation errors, and email-delivery failures once per business day. Record the review in the incident template even when no issue is found.

## Monitoring implementation order

1. Monitor `/api/health` and `/api/readiness`; both are now implemented with safe process/database checks.
2. Add Sentry or an equivalent server/client error monitor with sensitive-data scrubbing.
3. Configure external uptime checks for the homepage, marketplace route, and readiness endpoint.
4. Add protected queue-health metrics for payments and applications.
5. Configure alerts for three failed uptime checks, one unexpected queue API failure, and pending payments older than one business day.
6. Perform one controlled alert test and record the result in this document.
