# Live public browser QA evidence — 23 August 2026

## Scope

Requested scope: real-browser interaction QA of the live Kazipoa public Find Jobs, Verified Companies, and Safety Centre experiences, including clicks, search, filters, vacancy/company details, report form, and application flow. No code, database, or settings changes are part of this QA.

## Initial state

The live homepage opened with a persisted Admin session in the browser. The authenticated dashboard and Admin controls were visible, so this is not yet a public-visitor result. The next step is to sign out and restart the public QA from the live homepage.

## Public baseline after logout

The persisted Admin session was successfully logged out. The exact live homepage now shows public navigation for Find jobs, Urgent jobs, Companies, and Safety Centre; sign-in/create-profile actions; keyword, location, and category search controls; real-data metrics; latest and urgent vacancy cards; a truthful “No verified employers yet” empty state; safety content; and public CTAs. The homepage also shows five pre-launch records with explicit TEST VACANCY labels and source-attributed content; these were not treated as normal verified-employer records.

## Find Jobs navigation gate

Clicking the top-level **Find jobs** control while signed out did not navigate to a separate public jobs list. It opened an **Account Type** modal requiring a Job Seeker or Employer profile, with fields for full name, phone, email, and region and a “Create profile and vacancies” action. This is a functional account gate, but it is a potential usability/requirement mismatch because the public homepage also presents live vacancy cards and search controls.

The modal closed successfully using its close control, returning to the homepage without changing data.

## Find Jobs search input and location filter

The public search input accepted the keyword **sales**. The Location select accepted and displayed **Dar es Salaam**. The page remained stable and did not require authentication for entering or changing search criteria. The search results had not yet been submitted at this point.

## Find Jobs combined-search submission

The category selector accepted **Marketing & Sales** while the keyword remained **sales** and the location displayed **Dar es Salaam**. Clicking **Search Jobs** did not open a results page; it opened the same **Account Type** modal requiring a Job Seeker or Employer profile. This is a consistent authentication gate for the signed-out search submission. No account or database record was created.

## Find Jobs gate to login

Clicking “Sign in to your existing account” from the account-type gate routed to the exact live `/login` page. After waiting for render, the login page loaded with a clear **Continue with secure provider** button, secondary email/password fields, a Show password control, Forgot password link, Resend verification email help, and Create an account link. The route is functional; no credentials were entered.

## Return from login

Clicking the login page’s **Back to Kazipoa** link returned to the signed-out live homepage. The public search field and location/category selectors remained visible, and the page loaded without an error.

## Public vacancy card and application gate

After scrolling to the Latest Jobs section, clicking the first vacancy card (**Deputy Sales Manager — 360HR Solutions**) did not open public vacancy details. It opened the **Account Type** modal with Job Seeker and Employer choices. The live page identifies the state as “Create a profile to view vacancy details.” This is an intentional authentication/privacy gate, but it means vacancy detail, save, share, and application controls cannot be tested as a signed-out visitor without an authenticated account.

## Urgent Jobs navigation

Closing the vacancy gate returned to the homepage. Clicking the top-level **Urgent jobs** control did not navigate away; the page remained on `/`. Clicking the first urgent vacancy card (**Health Safety and Environment Officer — Epic**) also kept the visitor on the homepage and positioned the viewport at the urgent section; it did not open a dedicated detail route or account gate in this interaction. This is recorded as PARTIAL for the dedicated urgent interaction because the public card is visible but no detail view was opened.

## Verified Companies directory

The homepage **View all** control opened `/companies` successfully. The directory contains a searchable employer input, Region and Industry selectors, and a Sort by selector. Entering `Azania` kept the page stable and showed the truthful empty state: **“No verified companies match these filters.”** Selecting **Company name** changed the sort control value and retained the empty state. The live directory currently exposes no verified companies, so company-profile card clicks and non-empty region/industry options were NOT TESTED.

## Safety Centre and report form

The public navigation opened `/safety` successfully (the deployed route is `/safety`, not `/safety-centre`). The page rendered the Safety Centre content, employer-verification explanation, privacy/safety guidance, support email, and buttons for Report a Job, Report an Employer, and Contact Support. Clicking **Report a Job** produced a non-blocking toast reading “Use the support form to report a suspicious job,” but did not open or reveal a report form in the current page state. Report form field validation and submission therefore remain NOT TESTED; the button behavior is PARTIAL.

## Safety report/support controls

Clicking **Report an Employer** produced the corresponding informational toast (“Use the support form to report a suspicious employer”) but did not open a report form. Clicking **Contact Support** opened a modal with Name, Email, Message, two support telephone links, and a Create support ticket action. Submitting the empty form triggered native required-field validation (“Please fill out this field”) and did not submit a ticket. No real support ticket was created during QA.

The support form accepted test text into Name and Message fields, but submitting `not-an-email` triggered native email validation (“Please include an '@' in the email address”) and kept the modal open. No ticket was created.

## Dedicated urgent route and source applications

The exact `/urgent-jobs` route loaded a dedicated urgent-vacancies page with two explicitly labelled **TEST VACANCY** records, deadlines, source descriptions, and “Apply on original source” links. Clicking the first source link opened the external Great Tanzania Jobs application form for Epic; returning and clicking the second opened the corresponding external form for Rahman Pre & Primary School. No external form was submitted. The external forms expose required personal, education, experience, availability, and CV-upload fields, but this QA did not enter personal data or submit externally.

## Exact public route checks

The exact `/verified-companies` URL loaded the same live employer directory and truthful empty state as `/companies`. The exact `/safety-centre` URL loaded the Safety Centre content successfully, while the navigation’s internal URL is `/safety`. The exact `/jobs` check loaded the shared public shell with an explicit **No live jobs yet** state and **No urgent vacancies** state; the root homepage separately displayed clearly labelled pre-launch test cards. No HTTP error page was observed for these exact URLs.

## Homepage section-level job actions

Returning to the root and clicking the visible **View all jobs** action from Latest Jobs opened the account-type modal with the message **“Create a profile to access private vacancies.”** It did not navigate to `/jobs` from the homepage. This is consistent with the signed-out privacy gate but is PARTIAL for a public “View all jobs” link because the direct `/jobs` route itself is reachable.

The homepage **View urgent jobs** action changed the URL to `/urgent-jobs`. The first screenshot immediately after navigation was blank with no detected elements, but waiting for the page to render restored the dedicated urgent page with both labelled test listings and source links. This is functionally reachable but indicates a transient loading/render delay worth monitoring.

On `/urgent-jobs`, **View all jobs** opens the signed-out account-type gate. After closing it, **Looking for talent instead?** opens the same gate with Employer selected and company-specific fields (registered company name, registration/TIN, email, phone, region, and industry), plus a “Create employer workspace” action. No registration was submitted.

On the exact `/safety-centre` route, clicking **Report a Job** and **Report an Employer** reproduced the respective support-form guidance toasts but did not reveal report-specific fields. The separate Contact Support control remains the only visible form path.

## Client-side error check

A live browser-console check after the public QA interactions returned **No console output**. This does not prove backend correctness, but no client-side error was emitted during the tested public flows.

## Final public QA summary

### Scope and method

This run tested the actual published domain `https://kazijob-fjgmdyye.manus.space` in a real browser as a signed-out visitor. The test covered the root homepage, public search controls, vacancy cards, urgent vacancies, company directory, Safety Centre, report/support controls, exact public URLs, external source-application links, empty states, and the browser console. No code, database, credential, payment, support ticket, or external application submission was performed during this public QA run.

### Public-interaction score

Using the transparent rubric **PASS = 1, PARTIAL = 0.5, NOT TESTED = 0**, the scored public checks were **20 PASS, 7 PARTIAL, and 3 NOT TESTED**, producing a weighted score of **78%**. This is a score for the signed-out public surface only; it is not a production-readiness score for the authenticated recruitment workflow.

| Public capability | Result | Factual finding |
|---|---|---|
| Root homepage | PASS | Live homepage loaded and showed the Kazipoa hero, search controls, latest/urgent sections, safety content, employer CTAs, pricing/FAQ, and footer. The homepage metrics displayed zero, and visible pre-launch records were explicitly labelled `TEST VACANCY`. |
| Keyword search input | PASS | Accepted `sales` without error. |
| Location filter | PASS | Accepted and displayed `Dar es Salaam`. |
| Category filter | PASS | Accepted and displayed `Marketing & Sales`. |
| Search submit while signed out | PARTIAL | Search controls accepted input, but Search Jobs opened the account-type gate instead of displaying a public filtered results list. |
| Find Jobs header action | PARTIAL | Opened the account-type modal rather than a separate public jobs list. |
| Login handoff | PASS | The gate’s sign-in action opened `/login`; the secure-provider recommendation, email/password pilot fields, password visibility control, forgot-password and verification-help paths were visible. |
| Public vacancy card | PARTIAL | Clicking a vacancy card opened the account-type gate (“Create a profile to view vacancy details”), so public detail/save/share/application controls were not available while signed out. |
| Exact `/jobs` URL | PASS | Loaded successfully and showed truthful `No live jobs yet` and `No urgent vacancies` states. |
| Latest Jobs View all action | PARTIAL | Opened the account-type access gate instead of navigating to `/jobs`. |
| Urgent Jobs header action | PARTIAL | Kept the visitor on the root page; it did not navigate directly. |
| Urgent Jobs View all action | PASS | Navigated to `/urgent-jobs`; the initial capture was blank, but the page rendered correctly after waiting. |
| Exact `/urgent-jobs` URL | PASS | Loaded a dedicated page with two labelled test listings, deadlines, source descriptions, and source links. |
| Urgent source links | PASS | Both links opened the intended Great Tanzania Jobs application form with vacancy-specific prefilled query parameters. No form was submitted. |
| Urgent page View all jobs | PARTIAL | Opened the signed-out account-type gate. |
| Urgent page employer CTA | PASS | Opened the employer-selected account-type gate with company registration/TIN, email, phone, region, and industry fields. |
| Verified Companies View all | PASS | Opened `/companies` successfully. |
| Exact `/verified-companies` URL | PASS | Loaded the same employer directory successfully. |
| Company keyword search | PASS | `Azania` was accepted and preserved the truthful no-match state. |
| Company sorting | PASS | `Company name` could be selected and remained stable. |
| Company region/industry non-empty filtering | NOT TESTED | The live directory had no companies and exposed only `All regions`/`All industries`, so real option filtering could not be exercised. |
| Company profile cards | NOT TESTED | No verified company records existed to open. |
| Exact `/safety-centre` URL | PASS | Loaded Safety Centre content successfully. The navigation’s internal route is `/safety`, but the requested exact URL also works. |
| Safety guidance content | PASS | Verification, privacy, reporting, support-email, and manual-payment guidance rendered. |
| Report a Job / Report an Employer | PARTIAL | Both buttons displayed guidance to use the support form but did not open report-specific fields. |
| Contact Support modal | PASS | Opened with Name, Email, Message, support telephone links, and Create support ticket. |
| Empty support validation | PASS | Native required-field validation blocked an empty submission. |
| Invalid email validation | PASS | Native email validation blocked `not-an-email`; no ticket was created. |
| Successful support-ticket submission | NOT TESTED | Deliberately not submitted to avoid creating an unsolicited production support ticket. |
| Browser console | PASS | No console output was present after the tested public interactions. |

### Passed features

The live public domain is reachable, its requested exact public URLs are loadable, the homepage and public directories use truthful empty states, the search and company-directory controls accept input, urgent test listings preserve source attribution, external source links resolve, the Safety Centre content is present, the support modal opens, and browser-level validation blocks incomplete or invalid support requests. No client-side console error appeared in the observed run.

### Failed or partial features

The public homepage presents search and vacancy cards, but signed-out search submission, View all jobs, vacancy cards, and urgent-page View all jobs all stop at an account-type gate rather than opening a public filtered/detail experience. The header Urgent jobs and Companies controls remain on the shared shell rather than providing direct navigation. The public report buttons do not open report-specific forms; they only display guidance to use Contact Support. A transient blank capture occurred immediately after the homepage View urgent jobs navigation, although the dedicated urgent page rendered after waiting.

### Not tested and why

Non-empty company filters and company profiles could not be tested because the live directory has no verified company records. A successful support ticket, external job application submission, and authenticated seeker/employer recruitment workflow were not submitted in this signed-out public run because they would create production records or require fresh authenticated pilot accounts. Prior authenticated/deployment findings remain in `launch-readiness-report-2026-08-23.md` and should not be conflated with this public-only evidence.

### Remaining launch blockers

The public surface is suitable for another controlled review, but Kazipoa should not yet be declared ready for an unrestricted recruitment launch. The remaining material blockers documented across the launch evidence are the missing Postmark sending approval/DNS verification for real verification email delivery, the need for an independently replayed fresh Seeker–Employer–Admin persisted workflow, and owner-controlled Cloudflare/custom-domain and GA4 setup if those are required for launch. The live public QA additionally leaves the report-specific form behavior and signed-out vacancy-detail/search behavior as product decisions or follow-up fixes.

### Handover recommendation

Hand over the live URL and this evidence file as a **public-surface QA result**, not as proof that the full recruitment lifecycle is independently verified. The safest next pilot remains OAuth-first with real owner-created Seeker and Employer accounts, while Postmark approval is completed. No unrelated code or data changes were made during this browser QA run.

## QA-confirmed report-action correction

The public Safety Centre report controls were corrected without changing the support-ticket schema or procedure. In preview, **Report a Job** opens the existing Contact Support modal with the message “I would like to report a suspicious job. Please share the vacancy title, employer name, and what concerned you.” **Report an Employer** opens the same modal with employer-specific context. The existing required Name, Email, and Message fields and support-ticket submission path remain unchanged. The full Vitest suite passed with 36 files and 108 tests; TypeScript and production build also passed. Publication and exact live-domain retest remain the next checkpoint step.

## Attached-instruction scope audit

A read-only configuration audit found that the active Kazipoa project is MySQL/Drizzle-backed. Supabase and Supabase API entries exist in session configuration but are disabled; no Supabase project, Postgres schema, storage bucket, or RLS policy was accessed or changed. The current schema already contains users/roles, employer profiles, vacancies, payments, applications, application history, seeker documents/portfolio tables, saved vacancies, notifications, support tickets, and moderation logs.

A read-only database query returned the five pre-launch vacancies (IDs 60001–60005). All five have `isTest = 1`, `testBatchId = KAZIPOA_PRELAUNCH_TEST_001`, `employerAuthorized = 0`, and `employerVerified = 0`. They remain test-only records; no database update or real-employer application delivery was performed. GA4 remains disabled without a real Measurement ID. Cloudflare/registrar DNS and Postmark verification remain owner-controlled pending actions.

## Current deployed QA run — homepage and Find Jobs

The exact production homepage loaded successfully and visibly showed the upgraded Kazipoa marketplace: hero, Find a Job and Hire Talent CTAs, keyword search, location/category filters, Latest Jobs, Urgent Vacancies, Verified Employers, How Kazipoa Works, trust/safety content, pricing, FAQ, support contacts, and footer. The public metrics displayed zero, while the visible vacancy data was explicitly identified as pre-launch test data.

Searching `Sales Executive` returned a real database-backed test vacancy from 360HR Solutions. The result showed `TEST VACANCY` and `Employer review pending`; the signed-out application/detail action opened the account-type gate. No application or database change was made. The public search controls accepted input and the search submission opened the account gate rather than a public results route.

## Current deployed QA run — Find Jobs top-level action

Clicking the top-level Find jobs control while signed out opened the Account Type modal rather than navigating to a standalone public jobs list. The gate offered Job seeker and Employer paths, an existing-account sign-in action, and profile fields; it closed without data changes. This is a functional access gate and a PARTIAL result for direct public discovery.

## Current deployed QA run — dedicated `/jobs` route

The exact `/jobs` URL loaded the shared public shell successfully. It displayed a truthful `No live jobs yet` state and `No urgent vacancies` state because the five database records are test-only/non-authorized. The keyword input accepted `Accountant` and the category selector accepted `Accounting & Finance`; the controls remained stable and did not create data. This route is PASS for reachability and truthful empty-state handling; filtered-result rendering could not be verified because no approved public jobs exist.

## Current deployed QA run — urgent vacancies

The exact `/urgent-jobs` route rendered two urgent records, both explicitly labelled `TEST VACANCY`, with deadlines, source descriptions, and original-source application links. Opening the first link reached the Great Tanzania Jobs company application form for the matching Epic vacancy with vacancy-specific query parameters. No personal data was entered and no external application was submitted. This is PASS for route rendering and source handoff, but not evidence of a Kazipoa-native application workflow.

## Current deployed QA run — urgent-page actions

On `/urgent-jobs`, View all jobs opened the signed-out Account Type gate. Closing it and selecting Looking for talent instead opened the Employer-selected gate with company name, registration/TIN, email, phone, region, and industry fields plus Create employer workspace. No registration was submitted and no data changed.

## Current deployed QA run — Verified Companies

The exact `/verified-companies` route loaded the live directory successfully. It exposed Search employers, Region, Industry, and Sort by controls. Entering `Azania` preserved the truthful `No verified companies match these filters` empty state; selecting `Company name` changed the sort value without error. No company profile cards or non-empty region/industry filters were available because the database currently has no verified employers. No data changed.

## Current deployed QA run — Safety Centre

The exact `/safety-centre` route loaded successfully with safety guidance, verification limitations, privacy guidance, support email, and report/support actions. Report a Job opened Contact Support with the prefilled message `I would like to report a suspicious job...`; Report an Employer opened the same existing support form with employer-specific prefilled context. No ticket was submitted. This confirms the narrow report-action correction is served by the live domain.

## Current deployed QA run — support modal

The general Contact Support action opened a live modal with required Name, Email, and Message fields, two telephone support links, and Create support ticket. The modal was inspected only; no ticket was submitted, so no production side effect occurred. Prior evidence covers native required-field and invalid-email validation.

## Current deployed QA run — safe TEST SEEKER registration stop

A synthetic TEST SEEKER was submitted using the reserved `example.com` domain and no personal information. The deployed UI reported: `Account created, but the verification email could not be sent. Contact Kazipoa support while the email provider is being activated.` This is the required stop point: the account exists but cannot proceed to verified login without manual provider/email verification. No employer or admin test identities were created, and no vacancy/application/status records were changed.


## Current deployed QA run — database reconciliation and manual stop

A read-only lookup confirmed one synthetic account: `TEST SEEKER`, `test.seeker.20260823@example.com`, role `user`, account type `seeker`, login method `custom_email`, created at `2026-08-23 17:01:55`. A read-only pattern query found no TEST EMPLOYER or TEST ADMIN records. The registration UI reported that the account was created but its verification email could not be sent, and instructed the operator to contact support while the email provider is activated. This is the required stop point. No employer or admin test identities, vacancies, applications, shortlist states, or moderation records were created or modified.

The first database lookup attempt used a non-existent `emailVerified` column and failed; `DESCRIBE users` confirmed the live users table does not expose that column, after which the corrected read-only lookup succeeded. No credentials or passwords were written to the evidence file.

## 2026-08-24 production login/handoff verification

The exact production route `https://kazijob-fjgmdyye.manus.space/login` was opened in a real browser. The live Kazipoa page is serving the dark split-screen login design with the shared workplace image, dark brown panel, lime accents, green secure-provider card, custom email/password fields, and the Kazipoa footer. Clicking `Continue with secure provider` opens the Kazipoa-controlled branded handoff overlay, which also serves the dark right panel, shared image, lime accents, and white text. The subsequent provider-hosted page at `manus.im/app-auth` is external to Kazipoa and remains white/provider-controlled. No credentials or records were entered or changed during this comparison.

## 2026-08-24 secure-provider failure diagnosis

The production `/login` route and Kazipoa-controlled handoff were rechecked. The handoff now redirects to `https://manus.im/app-auth` with the live application ID, live-origin callback URL, encoded OAuth state, and one-time state cookie. The browser did not receive a provider callback; it remained on a blank/empty provider context. Server logs contained no OAuth callback error, only missing-session-cookie messages from unauthenticated page queries. This indicates the failure occurs before Kazipoa receives the callback and is consistent with an external Manus provider render/session/browser-context problem, not a confirmed Kazipoa callback or database defect.

Safe next action: test the exact handoff in a normal top-level browser tab with extensions/privacy blockers disabled for `manus.im`; do not use an iframe, embedded preview, or webview. If the provider is still blank in a normal browser, the owner must report the Manus app/provider issue and confirm the live callback URL is allowlisted. No authentication bypass, cookie weakening, direct verification write, user change, or database mutation was performed.
