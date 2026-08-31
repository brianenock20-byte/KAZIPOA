# Certificate management and CV preview verification

Date: 2026-08-28

## Implementation verified

- Job Seeker Certifications now provides Edit, Save changes, Cancel, and Delete actions for each listed certificate.
- Certificate edits are persisted through the ownership-scoped `seeker.updateCertification` procedure.
- Delete uses a browser confirmation prompt before the ownership-scoped delete mutation runs.
- Adding a certificate displays `Certificate added successfully` after the mutation completes.
- Job Seeker CVs render in the private dashboard through the reusable `SecureCvPreview` component. PDF files display in an embedded iframe; DOC/DOCX files remain private and show a transparent PDF-preview guidance state because browsers do not natively render those formats in an iframe.
- Authorized Employer candidate review uses the same embedded component and the existing `employer.viewCandidateCv` procedure. The procedure scopes access to the employer-owned application and records a seeker document access event.
- The preview component does not use external navigation or third-party document viewers.

## Validation results

- TypeScript: passed with `pnpm exec tsc --noEmit`.
- Focused regression tests: 7 passed.
- Full Vitest suite: 66 files, 262 tests passed.
- Production build: passed. The existing non-blocking Home chunk-size warning remains.
- Desktop dashboard screenshot: passed; certificate controls fit the dark Seeker portfolio and the CV area remains in the same workspace.
- Mobile dashboard screenshot at 390x844: passed; certificate actions wrap into usable full-width controls and the CV section remains responsive.
- Recent browser console logs show only expected Vite/React DevTools informational messages; no new runtime errors were observed.

## Privacy note

CV storage remains server-side and private. Seeker preview uses the protected `/api/seeker/cv/:id/preview` route. Employer preview uses a short-lived signed storage URL only after the application ownership check succeeds; no external viewer service is used.
