# Admin and Employer dashboard preview access guide

**Project:** Kazipoa — Find Work. Find Talent.  
**Public site:** [kazijob-fjgmdyye.manus.space](https://kazijob-fjgmdyye.manus.space)

## Important safety rule

Use separate, clearly named test identities for preview work. Do not use a personal password, OTP, email password, Cloudflare password, or provider secret in chat. Do not change a real user, real employer, real application, or production record merely to obtain a screenshot.

## Opening the Employer dashboard

Open `/register` on the public site. Choose the **Employer** account type, then use a dedicated test email address that you control and that is not attached to a real Kazipoa user. Complete the registration form and follow the email-verification link sent to that test inbox. After verification, sign in at `/login`, then open **My workspace** or `/dashboard`. The Employer workspace should show the employer vacancy-management and applicant-management surfaces. Log out before testing another identity.

If the verification message does not arrive, do not disable verification and do not create a verification row directly in the database. Check the test inbox and spam folder first. If the provider is not configured, the missing owner-controlled email configuration must be supplied before authenticated testing can continue.

## Opening the Admin dashboard

Do not rely on selecting “Admin” in a public registration form. Admin access is a protected authorization decision and must come from an owner-authorized identity whose database role is already `admin`. Sign in with that authorized Admin identity, then open **My workspace** or `/dashboard`, and use the Admin control-center navigation. The role-management page is available at `/admin/roles` after authorization.

If a dedicated test Admin identity is needed, create it through the existing owner-controlled/admin verification process. The owner or authorized system administrator must grant the identity the Admin role using the documented management path. Never promote a real customer or alter a real user just for visual review.

## Switching safely between previews

For each role, use a separate browser profile or private window where appropriate, sign in only with the corresponding test identity, and log out completely before opening the next workspace. Verify the visible workspace label and account type before reviewing controls. A Job Seeker session should not expose Admin controls; seeing “Admin permission required” at `/admin/roles` while signed in as a Job Seeker is expected and confirms role isolation.

## Current limitation in the available preview session

The available browser session is a Job Seeker session. It can directly preview `/dashboard` and `/profile`, while `/admin/roles` correctly shows the protected permission boundary. A full interactive Admin or Employer walkthrough requires separate authorized sessions; no personal credentials should be supplied to Kazipoa for that purpose.
