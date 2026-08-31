# Kazipoa Platform — Managed WebDev Migration TODO

- [x] Migrate the validated public marketplace interface into the managed project.
- [x] Migrate the validated Job Seeker portfolio and recruitment workflows.
- [x] Migrate the validated Employer portfolio, including the shared dark charcoal, warm cream, and Kazipoa Green palette.
- [x] Migrate the validated Admin interface and role-specific navigation.
- [x] Preserve Manus authentication, session handling, and role-based access controls.
- [x] Preserve database-backed recruitment procedures, schema, and migrations.
- [x] Preserve secure file-reference handling and storage integration without committing file bytes.
- [x] Preserve public routes, protected route boundaries, and environment-safe configuration.
- [x] Add or migrate regression coverage for public routes, protected access, roles, security, and core workflows.
- [x] Run dependency installation, TypeScript checking, tests, production build, and route smoke checks.
- [x] Verify database migration readiness without destructive changes or fabricated production data.
- [x] Save a complete managed-project checkpoint ready for publication.
- [x] Publish the project through the WebDev Management UI on a generated permanent HTTPS URL.
- [x] Verify the public homepage and protected Employer access boundary after publication.
- [x] Document owner-controlled prerequisites and any remaining provider-gated launch checks.


## Managed deployment verification follow-up

- [x] Confirm the managed WebDev project’s Drizzle migration path and configuration match the migrated Kazipoa layout.
- [x] Run a non-destructive migration readiness check against the managed project configuration and available database connection.
- [x] Record explicit evidence of the managed database schema state before publication.
- [x] Restart the managed development services after dependency reinstall and confirm the WebDev health monitor is clean.


## Visual scale, branding, and portfolio hero refinement

- [x] Tune the shared visual scale to feel like a 130% zoomed-in layout while remaining responsive and avoiding browser zoom hacks.
- [x] Restore or surface the Kazipoa logo consistently in the public header and every portfolio header.
- [x] Restore the intended top hero image or branded visual for Job Seeker, Employer, and Admin portfolio surfaces.
- [x] Align the Kazipoa brand at the far left edge and Create profile at the far right edge of the public header; apply the same edge alignment to all portfolio headers.
- [x] Add regression coverage and verify desktop/mobile rendering for the shared header, logo, hero visuals, and scale.


## Visual refinement follow-up corrections

- [x] Replace the desktop CSS zoom approach with production-safe responsive sizing tokens that create the requested 130%-feeling scale without `zoom`.
- [x] Strengthen regression coverage for rendered branding and role-shell markup instead of relying only on source-string assertions.
- [x] Verify authenticated Seeker, Employer, and Admin portfolio shell markup and responsive layout behavior through role-shell tests or an authorized staging session.


## Component-level visual verification corrections

- [x] Extract the shared Kazipoa brand and portfolio hero into renderable components used by the public and role shells.
- [x] Add component render tests that verify logo visibility, role-specific hero images, and accessible labels from rendered output.
- [x] Add responsive role-shell contract coverage for Seeker, Employer, and Admin hero variants without requiring real user data.


## Final role-shell integration coverage

- [x] Extract a shared renderable portfolio shell header that combines the brand strip and role hero for Seeker, Employer, and Admin.
- [x] Add integration render tests for all three role shells, including role labels, hero variants, and shared logo markup.
- [x] Add responsive breakpoint contract assertions for the portfolio shell’s desktop and mobile behavior.


## Integrated role-shell test completion

- [x] Render and test PortfolioShellBranding for Seeker, Employer, and Admin together, including all role labels, logo markup, and hero assets.
- [x] Add explicit desktop and mobile breakpoint assertions for the shared portfolio shell styles.


## Published Employer boundary verification correction

- [x] Document the actual published Employer workspace entry flow and distinguish it from unsupported direct URL aliases.
- [x] Add a route-level regression contract proving unauthenticated Employer access cannot render private workspace content.
- [x] Verify the permanent domain’s Employer entry flow shows the authentication boundary without exposing private data.


## Behavioral Employer boundary completion

- [x] Extract the workspace access guard used by the dashboard render path into a tested pure function.
- [x] Add behavioral coverage proving unauthenticated or unresolved workspace state cannot render private Employer content.
- [x] Document the supported published entry path and the observed authentication boundary in the continuation report.


## Complete code handoff

- [x] Package the complete Kazipoa source, project metadata, tests, migrations, and handoff documentation into a downloadable archive.
- [x] Save the latest behavioral Employer-boundary test update as a managed WebDev checkpoint.


## Archive verification correction

- [ ] Create the downloadable source archive from the managed project with generated dependencies and build output excluded.
- [ ] Verify the archive contains project metadata, tests, migrations, todo.md, and CONTINUATION_REPORT.md and attach it with the latest checkpoint.
