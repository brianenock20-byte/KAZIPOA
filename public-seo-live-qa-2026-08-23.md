# Public SEO live QA — 23 August 2026

The published `https://kazijob-fjgmdyye.manus.space/robots.txt` is reachable and now points to `https://kazijob-fjgmdyye.manus.space/sitemap.xml`; it keeps `/dashboard` and `/preferences` disallowed.

The published `https://kazijob-fjgmdyye.manus.space/sitemap.xml` is reachable but still serves the previous deployment content (`/`, `/companies`, `/safety`). The source has already been corrected to list `/`, `/jobs`, `/urgent-jobs`, `/verified-companies`, and `/safety-centre`, but that correction still needs a checkpoint/publication and live retest.

Post-publication retest — 23 August 2026

After checkpoint `712a9b93`, the live `https://kazijob-fjgmdyye.manus.space/sitemap.xml` still returns only `/`, `/companies`, and `/safety` with `x-manus-seo-source: server`, not the corrected route list. The live `robots.txt` remains reachable and points at the live sitemap. `https://kazijob-fjgmdyye.manus.space/__manus__/version.json` returns the SPA HTML shell rather than a version JSON payload. `manus-webdev-logs --limit 80` returned `cloudrun service not found`, so runtime log evidence is unavailable through that command. This is a deployment/service-version mismatch, not a source-build failure: local source and `dist/public` contain the corrected sitemap.

Final live sitemap retest — 23 August 2026

A cache-busting browser request to `https://kazijob-fjgmdyye.manus.space/sitemap.xml?cb=729ed16e` now returns the corrected canonical URLs: `/`, `/jobs`, `/urgent-jobs`, `/verified-companies`, and `/safety-centre`. The prior browser response was stale during deployment propagation; curl and the fresh browser request now agree with the built source.
