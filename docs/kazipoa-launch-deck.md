# Kazipoa Launch Briefing

## Slide 1 — Kazipoa
### Find work. Find talent. Move forward.

A Tanzania-focused private-sector job marketplace built around clearer information, verified employers, and safer next steps.

![Live Kazipoa homepage](/home/ubuntu/screenshots/kazijob-fjgmdyye_man_2026-08-21_06-28-37_2359.webp)

**Launch status:** Public soft launch ready; final domain, sitemap, performance, and branding checks remain before broad promotion.

## Slide 2 — The launch promise

Kazipoa turns a noisy job search into a trusted signal. Job seekers register once, build an Ajira-style professional portfolio, discover verified opportunities, save roles, apply, and track progress. Employers receive a moderated route to publish vacancies and manage candidates.

**Design principle:** Civic Signal — clarity, safety, and accountability before growth.

## Slide 3 — What is live today

| Job seekers | Employers | Admin |
|---|---|---|
| Registration-gated discovery | Vacancy creation workflow | Vacancy moderation |
| Portfolio and profile data | Manual payment evidence | Receipt preview and download |
| Applications and timelines | Subscription plans and limits | Payment approval/rejection |
| Saved jobs and organization | Candidate status management | Employer and vacancy controls |
| In-app and email alerts | Postmark delivery path | Operational audit trail |

## Slide 4 — Tanzania-first marketplace

Kazipoa supports the full Tanzania region footprint and presents location, salary context, category, deadline, employer identity, and safety guidance directly on each opportunity.

The current public marketplace baseline observed in production was **5 open opportunities**, **4 verified companies**, and **0 applications started** in the audit run.

## Slide 5 — Trust and manual payment model

1. Employer submits a vacancy and selects a posting tier.
2. Employer pays using the configured local payment instructions.
3. Employer submits the transaction reference and receipt.
4. Admin reviews the evidence and vacancy quality.
5. Only paid and approved vacancies become publicly visible.

Kazipoa does not store card numbers, CVV values, PINs, or wallet credentials.

## Slide 6 — Notification and seeker retention loop

A seeker’s recent searches and preferences can drive matching vacancy alerts. Delivery is independently configurable for **in-app** and **email** channels. The notification center supports unread filtering, unread counts, direct vacancy links, and Mark all read. Saved jobs support search, recent-search chips, pagination, custom folders, and comma-separated tags.

**Operational requirement:** monitor notification idempotency, Postmark delivery/bounce events, and provider webhook health.

## Slide 7 — SEO and Google Jobs readiness

Public vacancy routes now expose:

- Server-rendered canonical, Open Graph, and Twitter metadata.
- Schema.org `JobPosting` JSON-LD with title, description, posting date, expiry date, employer, Tanzania location, identifier, and canonical URL.
- Public vacancy pages that remain readable without a seeker login.
- Robots and sitemap endpoints.

![Public vacancy detail route](/home/ubuntu/screenshots/kazijob-fjgmdyye_man_2026-08-21_06-28-53_3323.webp)

## Slide 8 — Final audit findings before broad promotion

| Check | Result | Decision |
|---|---|---|
| Public routes | HTTP 200 for homepage, vacancy, robots, sitemap | Pass |
| JobPosting JSON-LD | Present in served local vacancy HTML; tests parse required fields | Pass |
| Sitemap consistency | Sitemap and robots point to custom domain while current live domain is Manus domain | Resolve before SEO push |
| Vacancy sitemap coverage | Current sitemap lists homepage, companies, safety; no vacancy URLs observed | Expand before SEO push |
| Homepage response | ~371 KB; TTFB ~3.33s in single run | Optimize |
| Vacancy response | ~371 KB; TTFB ~4.49s; total ~11.68s in single run | Priority optimize |
| Compression/cache | HTML returned without content-encoding and no-cache headers | Review hosting/server settings |
| Branding | `Made with Manus` overlay visible bottom-right | Confirm hosting branding option |

## Slide 9 — Deployment strategy

**Current hosting:** Manus-managed full-stack deployment with React, Express/tRPC, MySQL, authentication, storage, and automatic checkpoint publishing.

**Production path:** bind `portol.kazipoa.co.tz`, verify HTTPS and DNS, align APP_BASE_URL/canonical URLs/robots/sitemap, verify Postmark sender/domain, run controlled seeker/employer/admin tests, then submit the final sitemap and representative vacancy URLs to Google Search Console.

**Rollback path:** preserve every checkpoint, monitor after each release, and rollback the latest version if public discovery, payment review, notification delivery, or authentication regresses.

## Slide 10 — First 30 days after launch

**Day 0–1:** Run controlled seeker, employer, and admin transactions; verify notification channels and payment evidence.

**Week 1:** Monitor uptime, vacancy freshness, application conversion, notification delivery, payment queue age, and support reports daily.

**Weeks 2–4:** Review Search Console indexing, JobPosting rich-result status, Core Web Vitals, traffic by region/category, employer activation, and saved-job engagement weekly.

**Success signal:** a fast, crawlable public vacancy page; clean payment moderation; reliable alerts; and measurable movement from discovery to profile creation to application.

## Appendix — Sources and operator references

[1] [Google JobPosting structured data](https://developers.google.com/search/docs/appearance/structured-data/job-posting)

[2] [Google Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start)

[3] [Web Vitals](https://web.dev/articles/vitals)

[4] [Postmark webhooks overview](https://postmarkapp.com/developer/webhooks/webhooks-overview)
