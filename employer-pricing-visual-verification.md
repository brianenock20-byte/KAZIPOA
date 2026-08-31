# Employer pricing relocation verification

Date: 2026-08-28

## Code placement

The authenticated dashboard mounts `EmployerPaymentStatusPanel` followed by `EmployerPackageSummary` inside the `employer-payments` bottom-content region of the Employer portfolio. The standalone Employer postings route now renders only the Employer-owned vacancy management view and no longer imports or renders the package summary. The public homepage source does not mount Employer payment methods or package cards.

## Package contents

The Employer portfolio package section retains four one-off vacancy cards: Basic vacancy at TZS 10,000, Featured vacancy at TZS 25,000, Urgent vacancy at TZS 30,000, and Premium vacancy at TZS 50,000. Each card keeps the single-open expanded-benefits interaction. The Urgent card continues to explain email and SMS notification readiness without claiming live delivery before provider credentials are configured.

## Visual verification

The current browser session is authenticated as a Job Seeker, not an Employer. The `/employer-marketplace` route therefore correctly showed the protected different-workspace state rather than exposing Employer data. The public root path also resolved to the authenticated dashboard under the current session, so direct visual inspection of the Employer-only bottom package cards requires an Employer pilot account. Source-level assertions verify the exact bottom-content order and absence from the standalone route.

## Corrected payment-method placement

The provider-logo panel is now a reusable `AcceptedPaymentMethods` component rendered immediately after the Employer package heading “Pay for the role you are posting” and before the four one-off package cards. The public Home pricing block no longer renders the provider-logo panel. The current screenshot session is still a Job Seeker session, so `/employer-marketplace` correctly shows the protected different-workspace state; the Employer package panel must be viewed after signing in with an Employer account.
