# Staging RBAC Setup and Test Guide

## Goal

Create a staging environment that mirrors the application’s authentication and authorization paths while keeping production credentials, users, files, payments, and messages completely separate. Use only clearly labeled test identities and synthetic records.

## Environment separation

| Area | Staging rule | Production rule |
|---|---|---|
| Database | Separate database and credentials; resettable test data | Never use staging credentials or fixtures |
| Storage | Separate bucket/prefix with non-sensitive files | Private production objects remain isolated |
| OAuth | Staging callback and test provider identities | Production callback and owner-controlled identities |
| Email | Sink mailbox or provider test mode | Real delivery only after approval |
| Payments | Sandbox/test provider or manual non-financial fixtures | Real payment confirmation must be server-backed |
| Secrets | Staging secret store and rotated test keys | Production secret store; never copy values into tickets |
| Domain | Staging hostname with no search indexing | Public production domain |

## Setup sequence

1. Provision a staging database, storage namespace, OAuth callback, email sink, and secret set. Confirm the staging application cannot resolve the production database or storage bucket.
2. Run schema migrations against staging only. Review generated SQL before applying it. Load the minimum synthetic fixture set: one Admin, one manager if supported, one viewer if supported, one Seeker, one Employer, one blocked user, one second organization, and representative activity/notification rows.
3. Configure `NODE_ENV=staging` and staging-only URLs. Disable real payment capture and external outbound messages unless the test explicitly requires a sandbox provider.
4. Create test identities through the documented registration/admin flow. Do not insert role or verification rows directly unless the application’s documented staging bootstrap mechanism requires it. Record identity labels, not passwords or OTPs.
5. Confirm health checks, migrations, logs, session cookies, OAuth state, and database connectivity. Capture the deployed staging version before testing.

## Permission matrix example

| Capability | Admin | Manager | Viewer | Seeker/Employer | Blocked user |
|---|---:|---:|---:|---:|---:|
| Read permitted reports | Yes | Yes | Yes | No | No |
| List users | Yes | Scoped only | No | No | No |
| Change roles | Yes, except self/last Admin | No | No | No | No |
| Archive/restore notifications | Own Admin alerts | No | No | No | No |
| Delete user | Yes with safeguards | No | No | No | No |
| Access own workspace | Yes | Yes | Yes | Yes | No |

Adapt the matrix to the project’s actual roles. Unknown roles must be denied by default.

## Test procedure

For every protected route or tRPC procedure, execute the following cases and record request, actor, expected result, actual result, and database side effect:

1. Anonymous caller receives the generic unauthorized response and no data.
2. Seeker, Employer, Viewer, and Manager callers receive forbidden responses for Admin-only procedures.
3. Admin can perform the permitted operation within scope.
4. A blocked account is rejected even if it has a previously issued session.
5. A caller cannot read, update, archive, restore, delete, or export another organization’s record by changing an ID.
6. An Admin cannot demote themselves or remove the last active Admin.
7. Unknown roles, invalid enums, negative IDs, invalid dates, oversized searches, unsafe sort fields, and oversized page sizes are rejected.
8. Role changes create the expected audit event and invalidate/re-evaluate sessions according to the application policy.
9. Exports contain only allow-listed fields, honor filters, escape CSV cells, and do not contain credentials, tokens, secrets, private file keys, or formula-injection payloads.
10. Notification actions affect only the authenticated Admin’s notifications; permanent deletion requires confirmation and archive/restore remains reversible.

## Evidence template

| Field | Value |
|---|---|
| Staging version | [checkpoint/build ID] |
| Actor label | [TEST_ADMIN / TEST_MANAGER / etc.] |
| Procedure/route | [name] |
| Expected | [allowed/denied + side effect] |
| Actual | [response + side effect] |
| Database verification | [query/evidence reference] |
| Result | PASS / PARTIAL / FAIL / NOT TESTED |
| Reviewer/date | [owner] |

## Exit criteria

Promote only after every Admin procedure has an authorization result, every high-risk negative case passes, role invariants are preserved, migrations are reviewed, staging logs show no unexpected errors, and the exact build tested is the build proposed for production. Any test requiring a personal password, OTP, mailbox, provider login, or production record must stop and be handed to the owner as a manual prerequisite.
