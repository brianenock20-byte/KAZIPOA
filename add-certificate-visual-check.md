# Add certificate visual verification

The Job Seeker dashboard was checked at desktop width (1280px) and mobile width (390px). The Certifications panel remains in the dark portfolio flow, the simplified certificate-name and optional-proof controls are preserved, and the action now reads “Add certificate” when idle and “Adding certificate…” while pending. The control remains visible below the proof field on both layouts without changing the surrounding Skills/Certifications two-column relationship on desktop or the stacked flow on mobile.

Validation also passed before visual review: TypeScript compilation, the focused employer/admin regression suite, the complete Vitest suite (65 files, 258 tests), and the production build. The existing non-blocking large Home chunk warning remains unchanged.
