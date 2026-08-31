# Kazipoa: Schema ya Employer, Vacancy na Malipo

## Lengo la workflow

Mnyororo wa Kazipoa unapaswa kumlinda Job Seeker, Employer, na Admin kwa kutenganisha wazi hatua za kutengeneza taarifa, kutuma ombi, kufanya malipo, kufanya ukaguzi, na kuchapisha vacancy. Mfumo **haupaswi kufanya auto-verification**. Kila payment na vacancy inaanza katika hali ya kusubiri mpaka Admin achukue hatua iliyoidhinishwa.

## Muhtasari wa mahusiano

```text
users
  ├── employerProfiles
  │     └── vacancies
  │             ├── payments
  │             ├── moderationLogs
  │             ├── applications
  │             │       └── applicationStatusHistory
  │             └── notifications
  └── employerSubscriptions

users (seeker)
  └── applications ──> vacancies
```

## Tables zinazohusika

| Table | Kazi yake | Uhusiano muhimu |
|---|---|---|
| `users` | Identity, role, account type, na blocked state | Employer/Seeker/Admin owner wa records |
| `employerProfiles` | Jina la kampuni, registration number, industry, eneo, mawasiliano, na `verified` | `userId` mmoja kwa Employer mmoja |
| `vacancies` | Taarifa za kazi, owner, deadline, payment requirement, employer verification, na publication status | `employerUserId` inaunganisha Employer |
| `payments` | Method, provider, kiasi, transaction reference, receipt metadata, state, na Admin note | `vacancyId` na `employerUserId` |
| `moderationLogs` | Historia ya Admin approve, reject, au request changes | `vacancyId` na `adminUserId` |
| `applications` | Application ya Seeker kwa vacancy na status ya sasa | `vacancyId`, `employerUserId`, `seekerUserId` |
| `applicationStatusHistory` | Timeline ya reviewing, shortlisted, interview, hired, au rejected | `applicationId` na actors |
| `notifications` | Ujumbe wa status kwa Seeker, Employer, au Admin | Inaweza kuhusishwa na application/vacancy |
| `employerSubscriptions` | Plans za kila mwezi na manual subscription review | `employerUserId` |

## Hali za vacancy

| Hali | Maana |
|---|---|
| `draft` | Employer bado anaandaa taarifa; haionekani public |
| `payment_pending` | Vacancy imetumwa lakini payment evidence haijawasilishwa |
| `paid_pending_review` | Payment/receipt imewasilishwa; Admin bado hajathibitisha |
| `submitted` | Vacancy iko tayari kwa moderation, kwa mfano free allowance au hatua isiyohitaji payment |
| `changes_requested` | Admin amerejesha vacancy kwa marekebisho na sababu |
| `approved` | Approval ya ndani; public publication ifanyike tu baada ya gates zote kupita |
| `live` | Employer verified, payment approved au free allowance imethibitishwa, na Admin ameapprove |
| `rejected` | Admin amekataa vacancy na lazima aweke sababu |
| `expired` | Deadline imepita |
| `withdrawn` | Employer ameiondoa |

## Hali za payment

| Hali | Maana na ruhusa |
|---|---|
| `initiated` | Record imeanzishwa; hakuna uthibitisho wa payment |
| `pending` | Employer amewasilisha transaction reference/receipt; Admin hajafanya uamuzi |
| `successful` | Admin amethibitisha payment kwa manually; haimaanishi vacancy ni live mpaka employer na vacancy approval zipite |
| `failed` | Admin amekataa/ameshindwa kuthibitisha payment na anaandika note |
| `cancelled` | Mchakato umefutwa kabla ya approval |
| `refunded` | Payment imerudishwa; vacancy hairuhusiwi kuwa live |

## Gates za publication

Vacancy inaweza kuwa `live` tu ikiwa masharti yote yafuatayo yametimizwa server-side:

1. Employer ni owner wa vacancy na `employerProfiles.verified = 1`.
2. Payment haihitajiki kwa record hiyo, au kuna payment ya vacancy hiyo yenye `state = successful`.
3. Admin ametoa action ya `approve`.
4. Vacancy deadline bado haijapita na record haijawa withdrawn/rejected.
5. Action ya Admin imehifadhiwa kwenye `moderationLogs`.

> Muhimu: Kubadilisha payment kuwa `successful` pekee hakufanyi vacancy iwe `live`. Vivyo hivyo, ku-approve vacancy bila successful payment na employer verification hakuruhusiwi.

## Mtiririko wa Employer

Employer anajaza `employerProfiles` kupitia `saveProfile`. Kisha anajaza title, category, location, salary, description, deadline, na payment requirement kupitia `submitVacancy`. Vacancy mpya yenye payment requirement inaingia `payment_pending`; haionekani kwenye public marketplace.

Employer akiwasilisha transaction reference na receipt kupitia `payments.createManual`, mfumo una-save receipt kwa storage ya private na kuweka payment `pending`. Vacancy inakuwa `paid_pending_review`. Hakuna ujumbe wa “payment successful” unaoonyeshwa kabla ya Admin action.

## Mtiririko wa Admin

Admin anaona payment review queue na vacancy moderation queue kupitia protected procedures. Admin anaweza:

- Kuangalia amount, provider, method, transaction reference, evidence note, na receipt ya record iliyoidhinishwa.
- Kuweka payment kuwa `successful`, `failed`, `cancelled`, au `refunded`, pamoja na `adminNote`.
- Ku-verify Employer kwa njia ya Admin-only action.
- Ku-approve vacancy ikiwa gates zote zimepita.
- Ku-reject au ku-request changes ikiwa sababu imewekwa.
- Kuona moderation history kupitia `moderationLogs`.

## Ulinzi wa lazima

Authorization lazima itekelezwe server-side kupitia `adminProcedure` na `employerProcedure`. Employer hawezi kusoma au kubadilisha payment/vacancy ya Employer mwingine. Admin actions lazima zipokee IDs zilizo-validated, ziwe na audit event, na zionyeshe loading, error, empty, na success states. Receipt URLs zibaki private na zifunguliwe kwa owner/Admin aliyeidhinishwa tu.

## Status flow iliyopendekezwa

```text
Employer profile draft
      ↓
Vacancy submitted
      ↓
Payment pending ── receipt submitted ──> Paid pending review
      │                                      │
      │                                      ├── Admin payment reject → Payment failed
      │                                      └── Admin payment approve → Payment successful
      │
Admin employer verification
      ↓
Admin vacancy review
      ├── Request changes → Changes requested → Employer edits/resubmits
      ├── Reject → Rejected
      └── Approve + all gates pass → Live
```

## Kitu ambacho hakipaswi kufanyika

Mfumo usitumie email, localStorage, `accountType` ya client, au button iliyofichwa kama uthibitisho wa Admin. Usitengeneze fake payment, fake employer, fake vacancy, au fake statistics. Empty queues zionyeshe empty state halisi.
