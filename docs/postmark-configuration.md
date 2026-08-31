# Postmark configuration for Kazipoa

Kazipoa uses Postmark’s transactional email API for offline application-status notifications. The API endpoint is `https://api.postmarkapp.com/email`; requests authenticate with the `X-Postmark-Server-Token` header and include `From`, `To`, `Subject`, `TextBody`, `HtmlBody`, and `MessageStream`. The configured stream is `outbound`.

The sender address must be a confirmed Postmark sender signature or verified domain address. For Kazipoa, configure an address such as `notifications@portol.kazipoa.co.tz` after confirming `portol.kazipoa.co.tz` in Postmark’s Sender Signatures or Domains settings. Postmark returns a 422 response when the sender is not verified.

The project stores `POSTMARK_SERVER_TOKEN`, `POSTMARK_FROM_EMAIL`, and `POSTMARK_MESSAGE_STREAM` through managed environment secrets. The server token is never included in source code. Notification delivery is non-blocking: the in-app notification is saved first, then email delivery is attempted; the notification records `sent`, `skipped`, or `failed` with an error message when applicable.

For safe API validation, run `POSTMARK_TEST_MODE=sandbox node scripts/test-postmark.mjs`. Postmark’s `POSTMARK_API_TEST` token validates the request without delivering a real message. To send a real message after confirming the sender, run `node scripts/test-postmark.mjs` with `POSTMARK_TEST_TO` set to an intended recipient.

The canonical application URL is `https://portol.kazipoa.co.tz`, configured through `APP_BASE_URL`. The custom-domain binding and DNS records must still be completed in the project Domains settings and at the domain registrar if they are not already active.

## References

1. [Postmark: Sending email with API](https://postmarkapp.com/developer/user-guide/send-email-with-api)
2. [Postmark: Managing sender signatures](https://postmarkapp.com/developer/user-guide/managing-your-account/managing-sender-signatures)
3. [Postmark: Server sandbox mode](https://postmarkapp.com/developer/user-guide/sandbox-mode/server-sandbox-mode)
