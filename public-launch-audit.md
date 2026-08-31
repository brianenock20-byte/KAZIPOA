# Public launch audit

Verified public homepage: https://kazijob-fjgmdyye.manus.space/

The homepage loaded without authentication and exposed public Kazipoa content, public navigation, pricing, FAQ, contact numbers, and a sign-in/create-profile path.

Initial robots.txt response from https://kazijob-fjgmdyye.manus.space/robots.txt was:

User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /preferences
Sitemap: https://itc3flvoi3-4c2qlj7g3a-uk.a.run.app/sitemap.xml

The advertised sitemap was reachable at that internal Cloud Run hostname, but its URLs also used the internal hostname rather than the public Kazipoa domain. This was identified as a public SEO defect. The code was changed so canonicalOrigin prefers an explicit CANONICAL_ORIGIN, respects an explicit external request origin, and falls back to https://kazijob-fjgmdyye.manus.space when the request host is an internal *.a.run.app or *.manus.computer host. Regression coverage was added for this fallback. Full validation is pending after the test correction.
