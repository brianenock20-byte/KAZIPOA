# Kazipoa Post-Launch Monitoring Checklist

## Launch decision summary

Kazipoa is publicly reachable and the core public pages render correctly. The launch should be treated as a **soft launch rather than a full marketing push** until the custom-domain sitemap mismatch, public vacancy sitemap coverage, hosting badge, and slow uncached HTML responses are resolved or explicitly accepted.

| Area | Current observation | Launch action |
|---|---|---|
| Public availability | Homepage, public vacancy route, robots.txt, and sitemap.xml returned HTTP 200 during the audit. | Continue availability checks after every release. |
| SEO domain consistency | robots.txt and sitemap URLs point to `portol.kazipoa.co.tz`, while the live domain is `kazijob-fjgmdyye.manus.space`. | Bind the custom domain or update canonical, robots, and sitemap URLs to the live domain. |
| Vacancy discovery | Public vacancy pages expose server-rendered JobPosting JSON-LD. | Validate representative URLs in Google Rich Results Test and Search Console. |
| Performance | Single-run homepage TTFB was about 3.33s; vacancy TTFB was about 4.49s; HTML was about 371 KB and returned without a content-encoding header. | Enable compression, review SSR/database latency, and test under mobile conditions before paid promotion. |
| Branding | A `Made with Manus` badge appears bottom-right in the live rendered pages. | Confirm whether the selected hosting plan or branding setting permits removing the overlay. |

## First hour after launch

1. Open the homepage, one public vacancy, the companies directory, and the safety page from a clean browser session. Confirm HTTP 200 responses, correct titles, no blank states, and working navigation.
2. Create one controlled seeker account and verify registration gating, profile creation, application submission, notification bell unread count, mark-all-read, saved-job search, recent-search chips, and folder/tag persistence.
3. Create one controlled employer account and submit a test vacancy using the manual payment flow. Confirm the payment reference and receipt are visible to Admin and that the vacancy remains unpublished until approval.
4. Approve the controlled vacancy as Admin and confirm it becomes visible in marketplace queries, the public vacancy route, the sitemap process, and JobPosting JSON-LD.
5. Trigger one matching vacancy alert and verify the selected in-app and email channels independently. Record the notification ID, vacancy ID, email delivery status, and timestamp.

## Daily checks during the first two weeks

| Check | Expected result | Action if it fails |
|---|---|---|
| Homepage and vacancy uptime | HTTP 200 with normal content | Inspect production logs and hosting status; rollback the latest checkpoint if a release caused the regression. |
| Public vacancy freshness | Approved live vacancies appear; expired or withdrawn vacancies do not remain discoverable | Check publication gates, deadline filtering, sitemap generation, and structured data removal/expiry. |
| Search and registration gating | Public landing content is crawlable; private vacancy discovery still requires registration | Treat any private dashboard exposure or broken registration redirect as a priority incident. |
| Notification queue | New matching alerts are created once per seeker-vacancy pair | Check idempotency, notification preferences, and duplicate delivery records. |
| Postmark delivery | Delivery/bounce events are received and status is persisted | Check sender verification, Message Stream, webhook reachability, authentication, retries, and idempotency. |
| Payments | Receipts and transaction references are reviewable; unpaid or rejected vacancies remain hidden | Freeze affected approvals and reconcile the payment review queue manually. |
| Database health | Queries remain responsive and no migration errors appear | Inspect database connection, slow queries, and the most recent migration before further releases. |

## Weekly SEO and performance review

1. In Google Search Console, inspect Indexing, Sitemaps, URL Inspection, JobPosting rich-result status, Core Web Vitals, Security Issues, and Manual Actions. Submit the sitemap for the final production domain.
2. Validate at least three public vacancy URLs with Google’s Rich Results Test: one standard vacancy, one with HTML-sensitive text, and one recently approved vacancy. Confirm `JobPosting`, `datePosted`, `validThrough`, `hiringOrganization`, `jobLocation`, and canonical URL values.
3. Run PageSpeed Insights on the homepage and a public vacancy route using both mobile and desktop profiles. Track LCP, INP, CLS, total blocking time, transfer size, and failed network requests.
4. Review the 75th-percentile Core Web Vitals trend. Target LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1, following Google’s current Web Vitals guidance.
5. Review JavaScript bundle size and public HTML transfer size after each significant feature release. Prioritize compression, code splitting, and public-page caching if sizes or TTFB worsen.
6. Review search impressions and clicks by vacancy URL, region, company, and query. Remove or expire vacancies promptly when they are no longer open.

## Incident response

When a production issue is detected, record the first observed time, affected URL or user role, request ID if available, recent checkpoint, and whether the issue affects discovery, payments, notifications, or authentication. Reproduce the issue with a clean browser session, inspect server and browser logs, and decide whether to rollback or apply a targeted fix. For notification failures, preserve the notification and email records, avoid manually sending duplicates, and use provider delivery or bounce evidence before retrying. For payment discrepancies, do not approve based only on a receipt screenshot; reconcile the transaction reference and preserve the audit trail.

## References

[1]: https://developers.google.com/search/docs/appearance/structured-data/job-posting "Google Search Central: JobPosting structured data"
[2]: https://developers.google.com/search/docs/monitor-debug/search-console-start "Google Search Central: Get started with Search Console"
[3]: https://web.dev/articles/vitals "web.dev: Web Vitals"
[4]: https://postmarkapp.com/developer/webhooks/webhooks-overview "Postmark: Webhooks overview"
