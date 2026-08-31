# Production smoke QA — 23 August 2026

Read-only checks against `https://kazijob-fjgmdyye.manus.space` returned HTTP 200 for `/`, `/jobs`, `/urgent-jobs`, `/verified-companies`, `/safety-centre`, `/robots.txt`, `/sitemap.xml`, `/api/health`, and `/api/readiness`.

The public HTML routes returned the SPA shell successfully. `robots.txt` disallows `/dashboard` and `/preferences` and points to the live sitemap. The sitemap contains the canonical `/jobs`, `/urgent-jobs`, `/verified-companies`, and `/safety-centre` routes. `/api/health` returned `{"status":"ok","service":"kazipoa"}` and `/api/readiness` returned `{"status":"ready","database":"ok"}`.

This is a public availability/database readiness result only. It does not substitute for fresh authenticated Seeker/Employer/Admin workflow testing or provider email delivery approval.
