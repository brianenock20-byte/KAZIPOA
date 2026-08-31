# Resend configuration findings

Resend requires a verified domain before sending. For a domain added in the Resend Dashboard, the Records tab provides generated DKIM and SPF configurations; Resend’s official add-domain guide says these TXT and MX records must be copied exactly from the dashboard. Resend recommends using a dedicated sending subdomain, although the requested domain is portol.kazipoa.co.tz. DNS verification often completes within about 15 minutes but may take up to 72 hours; DMARC is recommended after verification.

The Resend Email API endpoint is `https://api.resend.com/emails`. It uses `Authorization: Bearer <API key>` and `Content-Type: application/json`. Required body fields are `from`, `to`, and `subject`; `html` and/or `text` can be supplied. Resend supports an `Idempotency-Key` header to prevent duplicate sends for up to 24 hours.

For safe testing, Resend provides `delivered@resend.dev`, `bounced@resend.dev`, `complained@resend.dev`, and `suppressed@resend.dev` test recipients. These test addresses count against the account quota and should not be used as real users.

Sources:
- https://resend.com/docs/add-a-domain
- https://resend.com/docs/dashboard/domains/manage-domains
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/send-test-emails
