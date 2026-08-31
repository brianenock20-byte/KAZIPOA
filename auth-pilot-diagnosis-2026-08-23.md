# Auth pilot diagnosis — 23 August 2026

## Admin identity evidence

A read-only production query found two rows with `role = admin`: the transferred custom account `infokazipoasupport@gmail.com` (user ID 8190001, display name `Brian Abesiga Enock`, `loginMethod = custom_email`, credential verified at 2026-08-23 06:58:43) and the retired OAuth account `brianenock20@gmail.com` (user ID 1, display name `Brian Enock`, `loginMethod = google`). The new credential has a password hash and no plaintext was selected or exposed. The old row had no custom credential.

The old row was corrected in a transaction: user ID 1 was demoted to `user` and any active custom sessions for that user were revoked. Existing profile/recruitment records were not deleted or rewritten.

## Admin login evidence

A clean production browser login using `infokazipoasupport@gmail.com` and the owner-provided password reached `/dashboard` and rendered `Kazipoa Operations`, `Moderation workspace`, and `Admin control center`. The direct `/dashboard` route fix is live; the public marketplace shell is no longer shown first.

## Verification-email evidence

The failed pilot registration record was user ID 5100001 (`brianenock@icloud.com`), with `emailVerifiedAt = NULL` and an audit event at 2026-08-23 07:39:10 recording `{"emailDelivery":"failed"}`. Therefore its correct behavior is to refuse custom login until verification; it must not be marked verified by a test-only database change.

The Postmark server health endpoint returned HTTP 200 and confirmed a live server. A controlled diagnostic send using the configured server token, configured sender, outbound stream, and `brianenock@icloud.com` returned provider error code 413 with message `This account is not approved to send email` and HTTP 422. This is the confirmed cause of recipients not receiving verification messages: Postmark’s account sending approval is not active. The failure is provider-side, not a missing database row or a password-validation issue.

The Postmark `/senders` endpoint could not be queried with a server token (it requires an Account token), so sender-signature verification still requires the Postmark account UI or an Account token owned by the user. No sender/domain or provider approval was changed automatically.

## Remaining safe fix scope

The app should surface the actual delivery failure clearly, avoid implying that verification mail was sent when Postmark returns `failed`, preserve generic login errors and email verification enforcement, and document the owner action: obtain Postmark sending approval and verify the sender/domain, or provide a verified Resend/other provider credential through the project’s secret-management flow. Once provider approval exists, send one fresh registration test and click the real link from the recipient inbox.

## Follow-up after fix

The old `brianenock20@gmail.com` row is now `role = user`; the new `infokazipoasupport@gmail.com` row is the only Admin (`adminCount = 1`) and remains email-verified. A production login with the exact new address and owner-provided password redirected to `/dashboard` and rendered the Admin control center.

`APP_BASE_URL` was approved for update to `https://kazijob-fjgmdyye.manus.space`, the reachable published domain. A regression test was added for verification and reset links to use the configured HTTPS base URL. The app now includes a resend-verification procedure and login-page action; it does not bypass verification when delivery fails.

The external provider remains the blocker: Postmark accepted server authentication but returned error code 413 / HTTP 422 because the account is not approved to send email. Until Postmark sending approval and a verified sender/domain are completed, real users cannot receive verification messages. No unverified user was manually marked verified.

## OAuth-first pilot fallback verification

Preview `/login` visibly shows “Recommended for the pilot”, a secure-provider button, “or continue with email/password pilot”, and the verification resend control. Preview `/register` visibly shows the same recommended secure-provider action, Job seeker/Employer choices, and the secondary email/password form. No provider bypass or fake success state was added.

## Live OAuth-first retest

The published `https://kazijob-fjgmdyye.manus.space/login` initially showed a short “Checking secure access…” state and then loaded the branded login page. It visibly presents “Recommended for the pilot”, the secure-provider action, the secondary email/password pilot, and verification-resend help. The production route returned successfully; no credential was entered during this retest.
