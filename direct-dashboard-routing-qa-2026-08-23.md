# Direct dashboard routing QA — 23 August 2026

## Preview evidence

The transferred Admin signed in through the first-party custom login at the preview `/login` route. After submission, the browser landed at `/dashboard`. After the routing fix, the page rendered the Admin workspace directly instead of the public marketplace shell.

Visible evidence included: `Kazipoa Operations`, `Moderation workspace`, `Admin control center`, `Review the signal.`, protected Admin payment operations, employer verification, support operations, platform settings, and the `Log out` control. The preview retained the existing marketplace navigation and role-isolated workspace tabs.

## Production regression observed before the fix

On the published domain, the same login previously landed at `/dashboard` but initially rendered the public marketplace homepage until `My workspace` was clicked. The cause was an initial-view condition that required `localStorage.kazipoa_registered === "true"`; an authenticated Admin could have no such client marker after login.

## Fix

`client/src/pages/homeRouting.ts` now resolves `/dashboard` directly to `dashboard` without depending on the registration marker. `Home.tsx` uses that helper. The public `/jobs` and `/preferences` collection gates remain registered-only, while public company, safety, urgent-job, and marketplace routes remain unchanged.

## Automated evidence

`pnpm test`: 33 test files, 101 tests passed. TypeScript check passed. Production build passed. The direct-dashboard regression is covered by `server/homeRouting.test.ts`.
