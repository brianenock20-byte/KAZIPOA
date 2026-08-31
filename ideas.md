# Kazipoa Design Direction

## Initial approaches

### Theme Name: Civic Signal
Very Brief Intro: A confident public-service marketplace with Tanzanian green, deep ocean navy, and crisp editorial structure. It feels trustworthy, practical, and locally grounded without becoming bureaucratic.
Probability: 0.07

### Theme Name: Market Day
Very Brief Intro: A warm, human marketplace aesthetic using sun-baked neutrals, paper-like surfaces, and lively utility accents. It emphasizes people, momentum, and approachability.
Probability: 0.04

### Theme Name: Night Shift
Very Brief Intro: A dark, high-contrast employment operations interface with electric green highlights and quiet data-dense surfaces. It feels fast and modern, but is intentionally reserved for this one direction.
Probability: 0.02

## Chosen Approach: Civic Signal

### Design Movement
Contemporary civic design with editorial information architecture, East African utility, and restrained modernist typography.

### Core Principles
1. Trust is visible: verification, safety, status, and moderation are first-class UI elements.
2. Action is immediate: search, save, apply, report, and post remain easy to find.
3. Local relevance is explicit: Tanzania-first locations, TZS salary language, Swahili support, and region-aware content.
4. Interfaces should feel calm under pressure: clear hierarchy, strong contrast, and predictable state changes.

### Color Philosophy
Deep navy conveys institutional reliability and protection; fresh green communicates opportunity and forward motion; warm off-white surfaces keep the product human rather than clinical. Amber is reserved for deadlines and attention states, while red is used only for urgent or safety-critical warnings.

### Layout Paradigm
Use asymmetric editorial sections: strong left-aligned statements, narrow supporting rails, and broad job-listing surfaces. Dashboards use a persistent sidebar and wide content canvas rather than centered card stacks.

### Signature Elements
1. A compact green K-mark with a signal-line motif.
2. Verification and safety labels that appear as a consistent visual language across cards.
3. Thin rule lines and small uppercase metadata that make the marketplace feel organized and dependable.

### Interaction Philosophy
Interactions should reassure users that the system understood them. Buttons respond with a small press state, drawers and dialogs enter quickly, filters update without disorienting page jumps, and destructive or trust-sensitive actions require explicit confirmation.

### Animation
Use 160–220ms ease-out transitions for buttons, cards, tabs, and filters. Stagger listing entrances by 40ms. Use subtle upward motion only for cards entering the viewport. Keep all non-essential motion disabled under prefers-reduced-motion.

### Typography System
Use Sora for headings, numerals, and brand moments; use Inter for body copy and controls. Headlines should be compact and decisive; metadata should be 11–12px uppercase with letter spacing; body text should remain 14–16px with comfortable line height.

### Brand Essence
Kazipoa is Tanzania’s trusted private-sector work marketplace for people finding dignified opportunities and companies finding verified talent. Personality: grounded, protective, optimistic.

### Brand Voice
Headlines are direct and opportunity-led. CTAs use clear verbs. Microcopy explains what happens next and avoids hype.
Examples: “Find work that moves you forward.” “Verified employers. Clearer opportunities.”

### Wordmark & Logo
A bold geometric K-mark formed from two offset signal bars, paired with a compact uppercase KAZIPOA wordmark. The mark should work alone as an app icon and favicon.

### Signature Brand Color
Kazipoa Signal Green: #16A34A.

## Implementation reminders

- Maintain the navy / signal green / warm off-white system across all pages.
- Prefer semantic buttons and accessible labels over clickable divs.
- Keep prototype-only behavior clearly labeled; do not imply that simulated payments or alerts are live.
- Use safe, truthful product language. Never fabricate reviews, ratings, or testimonials.
