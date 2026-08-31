# KAZIPOA — DOCUMENT YA MAHITAJI YA WEBSITE
## Handover Brief ya Kupeleka kwa Developer, Hosting Provider, au Project Reviewer

**Jina la project:** Kazipoa

**Maana ya project:** Platform ya ajira Tanzania inayowaunganisha watafuta kazi na waajiri.

**Kauli ya brand:** *Find Work. Find Talent.*

**Mmiliki wa project:** Brian Enock

**Lugha ya document:** Kiswahili

**Tarehe ya kuandaa:** 22 Agosti 2026

---

## 1. Maelezo ya project

Nataka Kazipoa iwe website ya kitaalamu ya ajira kwa Tanzania, siyo landing page ya kawaida wala prototype ya kuonyesha tu. Mtu akifungua website akute homepage nzuri yenye picha zinazovutia, maelezo ya huduma, sababu za kutumia Kazipoa, namna platform inavyofanya kazi, pricing, FAQ, safety information, na njia ya kujiunga. Baada ya mtu kujisajili, ndipo aingie kwenye portal yake kulingana na role yake.

Kazipoa iwe marketplace inayofanya kazi kwa database halisi. Actions za mtumiaji zisibaki kwenye toast au local state pekee. Registration, profiles, CV, vacancies, payments, receipts, applications, notifications, moderation, na support tickets zihifadhiwe na kusomeka kutoka database.

---

## 2. Tatizo linalotakiwa kutatuliwa

Watafuta kazi wanahitaji kuona taarifa zilizo wazi kuhusu nafasi za kazi, waajiri, locations, requirements, deadlines, na hatua za maombi. Waajiri wanahitaji kuweka vacancies, kupata candidates, na kufuatilia applications. Admin anahitaji kuwa na control kamili ya mfumo, kwa sababu ndiye anayehakiki waajiri, malipo, vacancies, reports, na users.

Website isiwaonyeshe wageni dashboard au job listings bila maelezo ya kutosha. Mgeni aanze na public homepage. Akihitaji kuona marketplace na kutumia tools za account, aweze kusign in au ku-create profile kwa njia iliyo wazi.

---

## 3. Roles na account separation

Mfumo uwe na roles tatu kuu:

| Role | Anachotakiwa kuona |
|---|---|
| Job Seeker | Profile yake, portfolio yake, CV zake, search ya jobs, saved jobs, applications, notifications, na preferences |
| Employer | Company profile yake, vacancy posting, payments, subscriptions, candidates, applications, na support |
| Admin | Control kamili ya users, employers, vacancies, payments, receipts, support, reports, settings, na moderation |

Mtu akijisajili kama Job Seeker asiingie kwenye Employer workspace. Employer asione private portfolio za seekers ambao hajahusishwa nao. Admin pekee awe na uwezo wa kuona na kusimamia data yote kwa authorization ya server-side.

Mtu aliyeingia akiwa Admin asipate error kwa sababu accountType ya zamani ni seeker au employer. Admin role iwe na priority na workspace ya Admin ifunguke kwa usahihi.

Kuwe na sehemu inayoeleweka ya **Sign in** kwa candidate/employer aliyewahi kujisajili, na **Create profile/Sign up** kwa mtumiaji mpya.

---

## 4. Public homepage na design

Homepage ya public iwe na:

- Picha nzuri na professional inayohusiana na watu wanaofanya kazi Tanzania.
- Hero section yenye message ya Kazipoa na search ya job title, skill, company, au location.
- CTA ya Find jobs.
- CTA ya Post a vacancy kwa waajiri.
- Maelezo ya tofauti kati ya Job Seeker na Employer journey.
- Maelezo ya usalama, verified employers, taarifa wazi, na next steps.
- Marketplace metrics zinazotoka database, siyo namba za kubuni.
- Pricing packages za waajiri.
- FAQ chini ya pricing cards.
- Contact Support inayotumia in-app form na ticket reference.
- Links za Find jobs, Companies, Safety Centre, Sign in, na My workspace.

Design iwe ya kisasa, professional, responsive kwa desktop/mobile, na isitumie Manus badge au branding kwenye public website.

Pricing cards sita ziwe kwenye mstari mmoja kwenye desktop kwa mpangilio huu: **Basic, Featured, Premium, Starter, Business, Enterprise**. Ziwe compact mwanzoni; mgeni akibofya package moja aone maelezo yake kamili. Hover na button interactions ziwe smooth lakini zisizidi.

---

## 5. Job Seeker portal

Job Seeker lazima aweze kujaza portfolio yake kwa taarifa nyingi kama portal ya kitaalamu ya Ajira. Sehemu zinazotakiwa ni:

| Sehemu | Mahitaji |
|---|---|
| Personal information | Jina, mawasiliano, location/region, professional summary |
| Education history | Shule/chuo, qualification, field of study, dates |
| Work experience | Kampuni, job title, majukumu, start/end dates |
| Skills | Skills mbalimbali zinazohusiana na kazi |
| Certifications | Certificate, issuing organization, dates |
| Languages | Lugha anazozijua inapohitajika |
| CV | Upload, private view, na secure download |
| Applications | Kazi alizoomba na status zake |
| Saved jobs | Kazi alizobookmark kwa ajili ya baadaye |
| Notifications | Alerts za applications, interviews, na matching jobs |
| Preferences | Chaguo la email/in-app alerts |

Kila sehemu ya portfolio iwe na form inayofanya kazi. Mtumiaji akibonyeza Save, taarifa iende database na ibaki baada ya refresh, logout, na login tena. Isionyeshe ujumbe wa mafanikio bila persistence halisi.

CV na personal documents ziwe private. CV isifanye kazi kwa public URL. Owner na Admin mwenye ruhusa pekee waone CV. Upload ikifanyika, file ihifadhiwe kwenye secure object storage, database ihifadhi metadata na ownership, na access itumie signed/private authorization flow.

Job Seeker aone vacancies baada ya kuingia kwenye marketplace yake. Atoe search na filters kwa category, region, location, title, skill, company, salary, experience, na deadline inapowezekana.

Application form iwe na CV selection dropdown, cover-letter editor, cover-letter preview, na submit confirmation. Seeker asiombe vacancy iliyofungwa, deadline iliyopita, au vacancy ileile mara mbili.

Application dashboard ionyeshe status timeline. Timeline ionyeshe status changes, employer notes, scheduled interview dates, na links za kuongeza interview kwenye Google Calendar au Outlook. Seeker apokee in-app na email notification kulingana na preferences zake.

---

## 6. Employer portal

Employer aweze kujisajili kama Employer na kujaza company profile yake. Company profile iwe na:

- Company name.
- Registration/verification information.
- Industry.
- Region/location Tanzania.
- Company email na phone.
- Company description.
- Website au supporting details inapohitajika.
- Employer verification status.

Employer aweze kuunda vacancy kupitia form rahisi lakini kamili. Fields ziwe:

- Job title.
- Category.
- Legal category inapohitajika.
- Region/location.
- Employment type.
- Salary/pay range.
- Education.
- Experience.
- Skills.
- Application deadline.
- Job description.
- Requirements.
- Vacancy package.

Employer aki-submit vacancy, vacancy isiwe public moja kwa moja. Iingie kwenye payment/review process. Employer aone status wazi: draft, payment pending, under Admin review, changes requested, approved, rejected, au published.

Employer aweze kuona applications za vacancies zake tu, na kubadilisha status ya candidates kama New, Shortlisted, Interview, Accepted, au Rejected. Aongeze notes na interview date. Candidate list ijirefresh baada ya status change bila kuhitaji refresh ya browser inapowezekana.

Employer subscriptions ziwe na limits za vacancies na candidates. Mfumo uzui posting au candidate management ikizidi plan limit, na umwambie Employer sababu kwa lugha iliyo wazi.

---

## 7. Categories na Tanzania regions

Platform isiishie kwenye regions chache. Iwe na support ya locations/regions zote muhimu za Tanzania na iwe rahisi kuongeza au kubadilisha categories kupitia Admin settings.

Category **Legal** iongezwe waziwazi pamoja na categories nyingine za ajira kama technology, finance, sales, marketing, administration, healthcare, education, engineering, logistics, hospitality, construction, customer service, na sectors nyingine.

Regions na categories zitumike kwa usahihi katika:

- Vacancy creation form.
- Marketplace filters.
- Search suggestions.
- Verified companies directory.
- Homepage metrics.
- Admin settings.
- SEO/public vacancy metadata.

---

## 8. Lipa Namba na payment workflow

Nataka kutumia mfumo wa Tanzania wa manual payment, hasa **M-Pesa Lipa Namba**, bila kuhifadhi card number, CVV, PIN, au password za malipo za Employer. Employer alipe kwenye namba rasmi, kisha atume ushahidi wa malipo.

Payment methods zilizojadiliwa ni M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, CRDB Bank, na Visa/Mastercard. M-Pesa ndiyo primary method. Visa/Mastercard zinaweza kuwa secondary option, lakini zisihifadhi card details kwenye Kazipoa.

Payment number iliyotolewa kwa project ni:

`255763796723`

Admin au owner athibitishe namba hii kabla ya kuanza kucharge customers.

Bei za vacancy packages:

| Package | Bei |
|---|---:|
| Basic vacancy | TSh 10,000 |
| Featured vacancy | TSh 25,000 |
| Premium vacancy | TSh 50,000 |

Bei za subscriptions:

| Subscription | Bei |
|---|---:|
| Starter | TSh 50,000 kwa mwezi |
| Business | TSh 150,000 kwa mwezi |
| Enterprise | Custom pricing |

Employer payment form iwe sehemu ya workflow ya vacancy. Iwe na package iliyochaguliwa, amount, payment number, payment provider, transaction/reference ID, na receipt upload. Receipt iwe image au PDF inayohifadhiwa kwenye private storage.

Payment status ziwe angalau pending, approved/confirmed, rejected/failed, na refunded inapohitajika. Employer aone progress/timeline ya payment. Admin aone payment record iliyounganishwa na employer na vacancy.

Admin payment review iwe na:

- Employer.
- Vacancy.
- Package.
- Amount.
- Provider.
- Transaction/reference ID.
- Submission date.
- Receipt preview ndani ya modal.
- Secure receipt download.
- Admin note.
- Approve, reject, au refund actions.

Vacancy iwe public tu kama payment imeapproved, employer amehakikiwa, na vacancy imeapproved. Admin reject akiweka sababu. Usitumie screenshot pekee kama uthibitisho wa automated transaction; linganisha transaction ID na provider records.

Automated M-Pesa/API integration inaweza kuongezwa baadaye baada ya kupata credentials halali za provider. Current default ni manual verification.

---

## 9. Admin control center

Admin awe na full control ya mfumo kupitia protected Admin dashboard. Sehemu zinazotakiwa ni:

| Sehemu | Admin action |
|---|---|
| Users & roles | Kuona users, kusimamia access, roles, verification, na suspension inapowezekana |
| Vacancies | Ku-review, edit, approve, reject, request changes, expire, feature, au remove |
| Employers | Ku-review company registration na verification |
| Payments | Kuona, approve, reject, refund, na kuandika Admin notes |
| Receipts | Preview na download kwa njia ya secure modal/route |
| Applications | Kuona operational status inapohitajika bila kuvunja privacy |
| Reports & safety | Kuchunguza scam reports, duplicate vacancies, na safety issues |
| Support tickets | Kuchuja kwa status/priority, kuweka notes, na kubadilisha status |
| Platform settings | Kusimamia categories, regions, support contacts, review guidance, translations, na notification rules |
| Audit trail | Kujua Admin gani alifanya action gani na lini |

Admin dashboard isionyeshe namba za kubuni. Counters za vacancies, payments, employers, na applications zitoke database queues au zionyeshe empty state ya kweli.

Admin settings zisitoe ujumbe wa “controlled by protected project configuration” bila sehemu ya kufanya kazi. Settings ambazo Admin anaona zibaki database-backed na ziwe editable kulingana na permission.

---

## 10. Applications, status, and notifications

Seeker akituma application, application ihifadhiwe database ikiwa na seeker ID, vacancy ID, CV reference, cover letter, timestamp, na status. Employer aweze kubadilisha status kwa vacancy zake tu.

Status change itengeneze event ya timeline. Seeker aone:

- Current status.
- Previous statuses.
- Employer note.
- Interview date.
- Updated date.
- Notification state.

Notification center iwe na unread badge, unread-only filter, mark as read, mark all as read, direct View vacancy links, na dropdown inayofanya kazi. Seeker aweze kuchagua email na in-app notifications kwa application alerts na new-vacancy matching alerts.

Matching alerts zitumie recent searches/preferences inapowezekana, na notification iwe na direct link ya vacancy. Email notification itumie Postmark baada ya sender/domain verification.

---

## 11. Support system

Website iwe na Contact Support form ya ndani. Form ikitumiwa:

- Itengeneze ticket reference number.
- Ihifadhi requester name, email, message, priority, status, na timestamps.
- Ionyeshe confirmation kwa mtumiaji.
- Ipeleke notification kwa support/Admin.
- Iweze kufuatiliwa kwenye Admin support queue.

Namba za support:

- `+255616116779`
- `+255695985717`

Admin aweze kuchuja tickets kwa open, in progress, resolved, closed, na priority. Employer aone support ticket status yake bila kuona tickets za wengine.

---

## 12. SEO na public internet discovery

Nataka mtu akitafuta “Kazipoa” au Tanzania jobs Google aweze kuipata website. Mahitaji ni:

- Public homepage.
- Public company directory.
- Public vacancy pages.
- Server-rendered title na description.
- Canonical URLs.
- Open Graph/Twitter metadata kwa WhatsApp, LinkedIn, na social sharing.
- Schema.org `JobPosting` structured data kwa kila public vacancy.
- `robots.txt` yenye public crawl rules.
- `sitemap.xml` yenye public pages na live vacancies.
- Protected dashboard/preferences zisiwe indexable.
- Public vacancy route ifanye kazi ikifunguliwa direct au kupitia shared link.

Public website address iliyopo sasa ni:

`https://kazijob-fjgmdyye.manus.space/`

Public SEO files:

- `https://kazijob-fjgmdyye.manus.space/robots.txt`
- `https://kazijob-fjgmdyye.manus.space/sitemap.xml`

Google indexing ifanyike kupitia Google Search Console baada ya ku-verify public property na ku-submit `sitemap.xml`. Site kuwa public hakumaanishi Google itaionyesha mara moja; crawl/indexing huchukua muda.

---

## 13. Domain ya Kazipoa

Domain ya brand ninayotaka kutumia ni:

`portol.kazipoa.co.tz`

Kwa sasa public fallback domain ni:

`kazijob-fjgmdyye.manus.space`

Domain `kazipoa.co.tz` imeongezwa Cloudflare na ilitoa nameservers hizi:

- `bob.ns.cloudflare.com`
- `yolanda.ns.cloudflare.com`

Nameservers hizi ziwekwe kwenye registrar wa `kazipoa.co.tz`, siyo kama A record/CNAME. Baada ya propagation, Cloudflare iwe Active. Kisha `portol.kazipoa.co.tz` iunganishwe na hosting/project settings kwa target sahihi iliyoonyeshwa na platform.

Usibadilishe DNS bila kuhifadhi MX, SPF, DKIM, na DMARC records zinazohitajika kwa email.

---

## 14. Google Analytics

Nataka kuona wageni wanaotembelea website kupitia Google Analytics 4. Setup inayohitajika ni:

1. Tengeneza GA4 property.
2. Tengeneza Web data stream kwa public URL.
3. Tumia Measurement ID ya aina `G-XXXXXXXXXX`.
4. Iongezwe kwenye website bila kuweka Google password, API secret, au credentials nyingine kwenye frontend.
5. Track page views kwa homepage, companies, safety, public vacancies, na routes za marketplace.
6. Thibitisha first event kwenye Google Analytics → Reports → Realtime.

GA4 Measurement ID bado inahitaji kutolewa na owner kabla integration ya code kukamilika.

---

## 15. Email na Postmark

Email notifications zitumie Postmark. Sender/domain ya Postmark ihakikiwe kwanza. Token isiwekwe kwenye browser, screenshots, chat, au public source code. Email status changes ziwe non-blocking ili database update isishindwe kwa sababu email provider imechelewa.

Email cases ni pamoja na application status, matching vacancy alerts, support ticket updates, na payment/support status kwa Employer.

---

## 16. Security and privacy requirements

Mfumo lazima:

- Usihifadhi CVV, PIN, card number, au payment password.
- Usionyeshe CV/receipt kwenye public URL.
- Uthibitishe ownership ya data kwenye server-side procedures.
- Uzuie seeker kuona data ya seeker mwingine.
- Uzuie employer kuona applications za employer mwingine.
- Uzuie employer kujihakikishia payment au vacancy yake.
- Uweke Admin actions nyuma ya role checks.
- Usihifadhi secrets kwenye client code.
- Uwe na signed/private storage access.
- Uwe na audit trail ya moderation/payment actions.
- Usitumie fake reviews, fake ratings, au fake testimonials.
- Uonyeshe terms, privacy, safety, na support information kwa uwazi.

---

## 17. Testing inayotakiwa kabla ya launch kubwa

Fanya acceptance test kwa accounts mpya, siyo Admin account pekee.

| Test | Pass condition |
|---|---|
| New Seeker registration | Anaingia Job Seeker workspace bila kuona Employer/Admin tools |
| Seeker portfolio | Education, experience, skills, certification, na profile vinabaki baada ya refresh |
| CV upload | CV ina-upload, inabaki private, na owner anaweza ku-view/download |
| New Employer registration | Anaingia Employer workspace bila kuona seeker/Admin tools |
| Company profile | Company data inabaki baada ya refresh/login tena |
| Vacancy creation | Vacancy inahifadhiwa na kuingia pending state |
| Payment evidence | Transaction ID na receipt vinaonekana kwa Employer na Admin |
| Admin payment review | Admin ana-preview receipt na anaapprove/reject kwa sababu |
| Vacancy publication | Vacancy haiwi public mpaka payment/employer/vacancy approvals zipite |
| Seeker application | Seeker anaweza kuomba live vacancy mara moja kwa usahihi |
| Employer application status | Employer anabadilisha status ya candidate wake tu |
| Seeker notification | Seeker anaona status timeline na notification mpya |
| Role privacy | Kila role haiwezi kufikia tools/data za role nyingine |
| Public SEO | Homepage, sitemap, robots, na public vacancy routes zinafunguka bila login |
| Email | Postmark notification inafika baada ya domain/sender verification |

Usitumie fake transaction ID kwenye live payment test. Kama hautaki kutuma fedha, simama kabla ya malipo na piga test ya validation tu. Kwa full payment test, tumia malipo halisi ya Basic pekee kama uko tayari.

---

## 18. Hali iliyopangwa ya delivery

Website inapaswa kuonekana na kufanya kazi kama commercial pilot, lakini haipaswi kutangazwa kuwa automated payment platform mpaka M-Pesa/API credentials na webhook verification ziwe zimeunganishwa. Manual Lipa Namba flow ndiyo default salama ya mwanzo.

Public deployment ya sasa ni:

`https://kazijob-fjgmdyye.manus.space/`

Custom domain bado inategemea nameserver propagation na domain binding. Google Search Console na GA4 zinahitaji actions za owner kwenye akaunti zake binafsi. Legacy CV iliyopakiwa kwa storage filename yenye spaces inahitaji ku-uploadiwa tena kupitia Job Seeker dashboard.

---

# SEHEMU YA KUPELEKA DOCUMENT HII

## A. Kama unampelekea developer mwingine

Tuma document hii pamoja na ujumbe huu:

> Habari, hii ni document ya mahitaji ya Kazipoa, Tanzania job marketplace. Tafadhali ipitie yote kabla ya kubadilisha code. Nataka system iwe database-backed, iwe na roles tofauti za Job Seeker, Employer, na Admin, iwe na private CV/receipt storage, manual M-Pesa Lipa Namba verification, vacancy moderation, applications, notifications, SEO, na public deployment. Usitumie fake reviews, fake transactions, au local-only prototype actions. Kabla ya kuanza, nipe list ya requirements ulizoelewa, kazi iliyokamilika, kazi iliyobaki, na risks.

Mpelekee developer document hii kama file ya Markdown au Word/PDF utakayo-export baadaye. Usimpelekee passwords, OAuth credentials, Postmark token, database URL, payment PIN, au card information.

## B. Kama unaipeleka kwa hosting/domain provider

Hosting provider atahitaji sehemu za **Domain ya Kazipoa**, **Public deployment**, na **DNS/Cloudflare**. Waambie public domain inayofanya kazi ni `kazijob-fjgmdyye.manus.space`, na custom domain inayolengwa ni `portol.kazipoa.co.tz`. Waonyeshe nameserver status bila kutuma login credentials. Waombe wakusaidie DNS delegation, SSL, na custom-domain binding tu.

## C. Kama unaipeleka Google Search Console

Hii document yote haihitajiki. Kwenye Google Search Console tumia URL-prefix property:

`https://kazijob-fjgmdyye.manus.space/`

Baada ya verification, submit:

`sitemap.xml`

Usitumie Cloudflare Connect Domain kwa Manus subdomain. Cloudflare itumike kwa domain unayomiliki, yaani `kazipoa.co.tz`.

## D. Kama unaipeleka kwa investor/partner

Tumia sehemu za project vision, user roles, marketplace workflow, packages, payment model, support, safety, SEO, na roadmap. Usimpe partner credentials au private documents za users. Eleza kwamba business model ya mwanzo ni employer vacancy fees na monthly subscriptions, huku Admin akihakiki manual payments kabla ya publication.

## E. Kama unaipeleka kwa project reviewer

Mwombe reviewer athibitishe:

1. Role isolation na privacy.
2. Database persistence ya forms.
3. CV/receipt private storage.
4. Payment-to-publication gate.
5. Admin moderation authority.
6. Application status loop.
7. Public SEO routes.
8. Error logs na uptime endpoints.
9. Security ya secrets na payment information.
10. Acceptance test ya accounts mpya.

---

# TAARIFA AMBAZO HAZITAKIWI KUPELEKWA KWENYE DOCUMENT YA PUBLIC

Usiweke kwenye email, WhatsApp group, public GitHub, au kwa developer asiyeaminika:

- Password za Admin au users.
- OAuth login credentials.
- Postmark server token.
- Database connection string.
- JWT secret.
- Storage credentials.
- Payment PIN/CVV/card number.
- Private CVs na receipts za customers.
- Real transaction references isipokuwa kwa authorized Admin/payment auditor.

Kama credential iliwekwa wazi kimakosa wakati wa mawasiliano, rotate/revoke credential hiyo na tengeneza mpya.

---

## Hitimisho la handover

Kazipoa inatakiwa iwe zaidi ya website ya kuonyesha pages. Ni Tanzania-focused job marketplace yenye public discovery, private role-based workspaces, verified employers, Admin moderation, manual local payment verification, secure documents, application tracking, notifications, support, na SEO.

Mtu anayepokea document hii anatakiwa aelewe kwamba mahitaji ya msingi ni **security, real database persistence, role isolation, manual payment control, na user trust**. Kipaumbele si kuongeza buttons nyingi; kipaumbele ni kuhakikisha kila workflow inafanya kazi kwa usalama na inaacha audit trail.


---

# APPENDIX: FULL OWNER-PROVIDED WEBSITE REQUIREMENTS

The following appendix preserves the complete requirements supplied by the owner. It should be treated as the source brief for future developers and reviewers.

You are working on my existing Kazipoa project.

IMPORTANT:
DO NOT create a new website from scratch.
DO NOT replace the existing project unnecessarily.
First inspect the entire existing codebase, database/schema, routes, components, authentication, current UI, and all existing features.

The current Kazipoa project is already partially built. Your job is to upgrade it into a production-ready private-sector recruitment platform while preserving useful existing work.

PROJECT NAME:
Kazipoa

CORE POSITIONING:
Kazipoa is a Tanzania-focused private-sector recruitment platform that connects verified employers with job seekers.

It is NOT just a job listing website.
It must function as a recruitment management platform where:
- Job seekers create professional profiles
- Employers create and verify company accounts
- Employers post vacancies
- Candidates apply
- Employers manage applications
- Employers shortlist candidates
- Employers schedule interviews
- Candidates track application status
- Admin verifies employers and moderates jobs
- Users receive notifications
- Employers can eventually pay for recruitment services

TARGET MARKET:
Tanzania, starting with Dar es Salaam.

==================================================
1. FIRST: AUDIT THE EXISTING PROJECT
==================================================

Before changing anything:

1. Inspect all existing pages.
2. Inspect all routes.
3. Inspect authentication.
4. Inspect database/schema.
5. Inspect current user roles.
6. Inspect current job posting functionality.
7. Inspect current employer functionality.
8. Inspect current job seeker functionality.
9. Inspect Safety Centre.
10. Inspect Verified Companies.
11. Inspect current responsive/mobile implementation.
12. Identify what is already functional versus mock/demo data.
13. Do not duplicate existing features.
14. Reuse existing components and architecture where possible.
15. Do not destroy working functionality.

Create a short internal implementation plan based on the existing codebase, then implement it.

==================================================
2. USER ROLES
==================================================

Implement three primary roles:

A. JOB SEEKER
B. EMPLOYER
C. ADMIN

Each role must have appropriate permissions.

JOB SEEKER:
- Create account
- Login/logout
- Manage profile
- Upload CV
- Add education
- Add skills
- Add work experience
- Add certifications
- Set preferred locations
- Set preferred job types
- Set expected salary
- Search jobs
- Filter jobs
- View job details
- Apply
- Track applications
- Receive notifications
- Save jobs
- Report suspicious jobs
- Manage notification preferences

EMPLOYER:
- Create employer account
- Create company profile
- Submit verification information
- Wait for admin approval
- Edit company profile
- Post vacancies
- Manage vacancies
- View applications
- Filter candidates
- View candidate profiles
- Shortlist candidates
- Reject candidates
- Invite candidates to interviews
- Track recruitment pipeline
- View hiring analytics
- Manage notifications
- Eventually manage billing/subscriptions

ADMIN:
- Dashboard
- Manage users
- Manage employers
- Verify employers
- Approve/reject job postings
- Manage reported jobs
- Manage reported employers
- Suspend users
- Suspend employers
- Remove jobs
- View platform analytics
- Manage featured/urgent vacancies
- Manage platform settings

==================================================
3. HOMEPAGE
==================================================

Improve the existing homepage without destroying its current design identity.

Primary headline:

"Find Work. Find Talent."

Secondary headline:

"Tanzania's private-sector recruitment platform."

Supporting text:

"Create your professional profile, discover verified job opportunities, apply easily, and track your applications — while employers find and manage qualified talent from one platform."

Primary buttons:

"Find a Job"
"Hire Talent"

Add trust indicators:

- Verified Employers
- Private-Sector Opportunities
- Job Alerts
- Safety Centre

Add an Urgent Vacancies section.

Example:

URGENT VACANCIES

Sales Representative
ABC Company ✓ Verified
Dar es Salaam
Closing Today

Button:
"Apply Now"

Add a section explaining:

FOR JOB SEEKERS
- Create your professional profile
- Find relevant jobs
- Apply
- Track applications
- Receive alerts

FOR EMPLOYERS
- Verify your company
- Post vacancies
- Receive applications
- Shortlist candidates
- Schedule interviews
- Hire talent

Do not use fake statistics.

If displaying platform statistics, calculate them from the actual database.

==================================================
4. JOB SEEKER PROFILE
==================================================

Create a professional job seeker profile.

Fields:

Personal:
- Full name
- Profile photo
- Phone
- Email
- Location

Professional:
- Professional headline
- About me
- Skills
- Work experience
- Education
- Certifications
- Languages
- Years of experience

Job preferences:
- Preferred job title
- Preferred industry
- Preferred location
- Employment type
- Expected salary

Documents:
- CV upload
- Certificates if supported

Add profile completion percentage.

Example:

PROFILE COMPLETION
80%

Show recommendations:

"Complete your profile to improve your chances of being discovered by employers."

==================================================
5. JOB SEEKER DASHBOARD
==================================================

Create a professional dashboard.

Show:

Welcome message.

Profile completion.

Recommended Jobs.

Saved Jobs.

Application statistics:

- Applications
- Viewed
- Shortlisted
- Interviews
- Hired

Application tracker:

Applied
→ Viewed
→ Shortlisted
→ Interview
→ Hired / Rejected

Make statuses visible and easy to understand.

==================================================
6. JOB SEARCH
==================================================

Create a strong job search experience.

Search fields:

- Keyword
- Job title
- Skill
- Location

Filters:

- Industry
- Employment type
- Salary range
- Experience
- Date posted
- Verified employer only
- Urgent vacancy only

Allow sorting:

- Most recent
- Relevance
- Deadline

Job cards should show:

- Job title
- Company
- Verification badge
- Location
- Employment type
- Salary if provided
- Date posted
- Deadline
- Urgent badge if applicable

==================================================
7. JOB DETAILS
==================================================

Create detailed job pages.

Show:

- Job title
- Company
- Verified status
- Company description
- Job description
- Responsibilities
- Requirements
- Skills
- Salary
- Location
- Employment type
- Experience
- Deadline
- Date posted

Buttons:

"Apply Now"
"Save Job"
"Report Job"

Do not allow users to apply without authentication.

==================================================
8. APPLICATION SYSTEM
==================================================

When a job seeker applies:

Store the application in the database.

Application statuses:

APPLIED
VIEWED
SHORTLISTED
INTERVIEW
HIRED
REJECTED

Job seekers can see their applications from their dashboard.

Employers can update application statuses.

Whenever an important status changes, create an in-app notification.

Example:

"Your application for Sales Officer at ABC Ltd has been shortlisted."

==================================================
9. EMPLOYER REGISTRATION
==================================================

Create a proper employer onboarding process.

Fields:

Company:
- Company name
- Logo
- Industry
- Company description
- Location
- Phone
- Official email
- Website

Verification information:

- Business registration information
- TIN/business details
- Contact person
- Supporting documentation where appropriate

Initial status:

PENDING VERIFICATION

Admin can:

APPROVE
REJECT
REQUEST MORE INFORMATION
SUSPEND

Only verified employers should receive the verified badge.

Do not allow users to falsely claim that they are verified.

==================================================
10. EMPLOYER DASHBOARD
==================================================

Create a professional recruitment dashboard.

Dashboard statistics:

- Active jobs
- Applications
- Shortlisted
- Interviews
- Hired

Navigation:

Overview
Company Profile
Post Vacancy
My Jobs
Applications
Candidates
Interviews
Analytics
Notifications
Billing

Make the dashboard responsive.

==================================================
11. POST VACANCY
==================================================

Create a multi-step vacancy posting process.

Step 1:
Job title

Step 2:
Department/industry

Step 3:
Job description

Step 4:
Responsibilities

Step 5:
Requirements

Step 6:
Skills

Step 7:
Experience

Step 8:
Location

Step 9:
Employment type

Step 10:
Salary range

Step 11:
Application deadline

Step 12:
Urgent vacancy option

Step 13:
Preview

Step 14:
Submit for approval

IMPORTANT:
New vacancies should initially have:

PENDING REVIEW

Admin approves before public publishing.

==================================================
12. CANDIDATE MANAGEMENT
==================================================

Employers need an applicant management interface.

Example:

Sales Representative
127 Applicants

Filters:

- Education
- Skills
- Experience
- Location
- Salary expectation
- Profile completion

Candidate card:

Name
Professional headline
Location
Experience
Skills
Education
CV available

Actions:

View Profile
Shortlist
Reject
Invite to Interview

==================================================
13. RECRUITMENT PIPELINE
==================================================

Create a visual candidate pipeline.

Columns:

NEW
VIEWED
SHORTLISTED
INTERVIEW
HIRED
REJECTED

Employers should be able to move candidates between stages.

Keep the database application status synchronized with the pipeline.

==================================================
14. INTERVIEW SYSTEM
==================================================

Employers should be able to invite shortlisted candidates.

Fields:

- Interview date
- Time
- Interview type
- Location or meeting information
- Message

Candidate receives an in-app notification.

Example:

"ABC Company has invited you for an interview."

Candidate can:

Accept
Decline

Store interview details in the database.

==================================================
15. VERIFIED COMPANIES
==================================================

Improve the existing Verified Companies page.

Show only companies whose verification status is APPROVED.

Search by:

- Company name
- Industry
- Location

Company cards should show:

Logo
Company name
Verified badge
Industry
Location
Number of active vacancies

Company profile page should show:

About
Industry
Location
Website
Verification status
Active vacancies

==================================================
16. SAFETY CENTRE
==================================================

Keep and improve the existing Safety Centre.

Include:

- How Kazipoa verifies employers
- How to identify fake jobs
- Never pay money to obtain a job
- Never share your password
- Never send sensitive personal information unnecessarily
- How to report a suspicious vacancy
- How to report an employer

Add:

"Report a Job"

"Report an Employer"

Make safety information highly visible.

==================================================
17. REPORTING SYSTEM
==================================================

Job seekers can report:

- Fake job
- Scam
- Misleading information
- Suspicious employer
- Inappropriate content

Employers can report:

- Fraudulent candidates
- Abusive behavior
- Suspicious accounts

Admin receives reports.

Admin can:

Review
Resolve
Reject report
Remove job
Suspend employer
Suspend user

==================================================
18. NOTIFICATIONS
==================================================

Build an internal notification system first.

Notifications for:

- New matching job
- Application received
- Application viewed
- Application shortlisted
- Interview invitation
- Application rejected
- Job deadline approaching
- Employer verification approved
- Employer verification rejected
- Job approved
- Job rejected

Create notification settings.

Categories:

Email
SMS
WhatsApp

IMPORTANT:
Only show SMS or WhatsApp as ACTIVE if an actual integration exists.

If integrations are not configured yet, label them:

"Coming soon"

Do not fake functionality.

==================================================
19. URGENT VACANCIES
==================================================

Create a dedicated urgent vacancies system.

Employers can request urgent status.

Admin approves urgent status.

Urgent vacancies show:

🚨 URGENT

Do not let every employer automatically make jobs urgent without moderation.

Add a dedicated:

/urgent-jobs

page.

==================================================
20. ADMIN DASHBOARD
==================================================

Create a real admin control centre.

Statistics:

Total users
Total job seekers
Total employers
Verified employers
Pending employers
Active jobs
Pending jobs
Applications
Interviews
Hires
Reports

Admin tables:

Pending employers
Pending jobs
Reported jobs
Reported employers
Users

Actions:

Approve
Reject
Suspend
Delete
Verify
Review

==================================================
21. PAYMENTS / MONETIZATION
==================================================

Prepare the architecture for employer payments.

Do not require payment for the first launch unless payment infrastructure already exists.

Create future plans:

Starter
Professional
Premium

Possible paid products:

- Job posting
- Featured vacancy
- Urgent vacancy
- Candidate search
- Recruitment packages
- Employer subscriptions

First 50 founding employers can receive a free first vacancy.

If payment gateway is not connected, do not pretend payments are functional.

Prepare the UI and backend structure for future integration.

==================================================
22. TRUST FEATURES
==================================================

Add visible trust elements:

Verified Employer badge
Company verification status
Report Job
Report Employer
Safety Centre
Contact Support

Never use fake testimonials.

Never use fake employer logos.

Never display fake job statistics.

Never claim "trusted by thousands" unless the database actually supports it.

==================================================
23. MOBILE EXPERIENCE
==================================================

The website must be mobile-first.

Test:

- Homepage
- Registration
- Login
- Job search
- Job details
- Apply
- Job seeker dashboard
- Employer dashboard
- Post vacancy
- Candidate management
- Admin dashboard

Make buttons large enough for mobile.

Do not create horizontal scrolling.

Make forms easy to complete on phones.

==================================================
24. DESIGN
==================================================

Keep the existing Kazipoa brand identity where it is good.

Improve:

- Typography
- Spacing
- Card consistency
- Button hierarchy
- Empty states
- Loading states
- Error messages
- Success messages
- Mobile navigation
- Accessibility

The design should feel:

Professional
Trustworthy
Modern
Tanzania-focused
Recruitment-focused

Avoid looking like a generic classifieds website.

Avoid excessive animations.

Use consistent badges:

Verified = green
Urgent = red
Pending = amber/yellow
Rejected = appropriate neutral/error styling

==================================================
25. DATABASE
==================================================

Inspect the existing schema before modifying it.

Create or extend appropriate entities such as:

users
job_seeker_profiles
employers
employer_verifications
jobs
job_applications
saved_jobs
skills
education
work_experience
certifications
interviews
notifications
reports
subscriptions
payments
admin_actions

Do not duplicate tables if equivalent existing tables already exist.

Use proper relationships and constraints.

Do not store sensitive information unnecessarily.

==================================================
26. AUTHENTICATION & AUTHORIZATION
==================================================

Implement secure role-based access.

Job seekers cannot access employer dashboards.

Employers cannot access admin functionality.

Only admins can approve employers and jobs.

Users can only edit their own profiles/applications.

Protect API endpoints/server actions, not just frontend routes.

==================================================
27. DATA VALIDATION
==================================================

Validate all important forms.

Prevent:

- Empty job titles
- Invalid email
- Invalid phone numbers
- Invalid salary ranges
- Past deadlines
- Unauthorized status changes
- Unauthorized access
- Duplicate applications where inappropriate

Display clear user-friendly errors.

==================================================
28. EMPTY STATES
==================================================

Do not leave blank screens.

Examples:

No jobs:

"No jobs found matching your search."

No applications:

"You haven't applied for any jobs yet."

No candidates:

"No candidates have applied yet."

No notifications:

"You're all caught up."

==================================================
29. SEO
==================================================

Optimize public pages for search engines.

Important keywords naturally include:

Tanzania jobs
private sector jobs Tanzania
jobs in Dar es Salaam
Tanzania recruitment
private companies hiring Tanzania
job vacancies Tanzania
employment Tanzania

Create appropriate:

title
meta description
Open Graph information
robots configuration
sitemap if appropriate

Do not keyword stuff.

==================================================
30. PERFORMANCE
==================================================

Optimize:

- Images
- Database queries
- Job listings
- Candidate lists
- Pagination
- Lazy loading where useful

Do not load thousands of records at once.

Use pagination for:

Jobs
Applications
Candidates
Users
Reports

==================================================
31. SECURITY
==================================================

Perform a security review.

Check:

Authentication
Authorization
Input validation
File uploads
CV uploads
API access
Database rules
XSS
CSRF where relevant
SQL injection protections
Rate limiting where appropriate
Sensitive data exposure

CV uploads must not become executable files.

Do not expose private candidate information publicly.

==================================================
32. REAL DATA VS DEMO DATA
==================================================

This is extremely important.

Clearly separate:

REAL DATABASE DATA
from
DEMO/PLACEHOLDER DATA.

Do not show fake employers, fake applications, fake statistics or fake users as if they are real.

If seed/demo data is necessary during development, clearly label it or make it development-only.

==================================================
33. LEGAL / TRUST PAGES
==================================================

Create:

About Kazipoa
Contact
Privacy Policy
Terms & Conditions
Employer Verification Policy
Safety Centre

Make them accessible from the footer.

==================================================
34. CONTACT / SUPPORT
==================================================

Create a support section.

Include:

Contact form
Support email placeholder if no real email is configured
Support phone placeholder if no real phone is configured

Do not invent real contact details.

==================================================
35. FINAL TESTING
==================================================

After implementation, test the full flows.

JOB SEEKER:

Register
→ Login
→ Complete profile
→ Upload CV
→ Search jobs
→ Open job
→ Apply
→ View application
→ Receive status notification

EMPLOYER:

Register
→ Submit verification
→ Admin approves
→ Complete company profile
→ Post job
→ Admin approves
→ Receive applications
→ View candidate
→ Shortlist
→ Invite to interview
→ Mark hired

ADMIN:

Login
→ View dashboard
→ Verify employer
→ Review job
→ Approve/reject
→ Review reports
→ Manage users

Test unauthorized access.

Test mobile layout.

Test errors.

Fix broken routes.

Fix console errors.

Fix database errors.

==================================================
36. IMPORTANT PRODUCT RULE
==================================================

Kazipoa must feel different from a traditional job board.

The product loop should be:

JOB SEEKER:
Profile → Discover → Apply → Track → Interview → Hire

EMPLOYER:
Verify → Post → Receive → Filter → Shortlist → Interview → Hire

ADMIN:
Verify → Moderate → Protect → Manage

The final product should communicate:

"Kazipoa is where Tanzanian private-sector employers and job seekers actually complete the recruitment process."

==================================================
37. DO NOT DO THESE THINGS
==================================================

Do NOT:

- Start a new unrelated project
- Delete existing working functionality
- Replace the current design unnecessarily
- Add fake statistics
- Add fake companies
- Add fake testimonials
- Pretend SMS works if it doesn't
- Pretend WhatsApp works if it doesn't
- Pretend payments work if no gateway is connected
- Allow unverified employers to appear verified
- Allow unapproved jobs to appear as approved
- Expose private candidate data
- Make admin features accessible to normal users

==================================================
38. FINAL DELIVERABLE
==================================================

After implementation:

1. Give me a concise summary of what already existed.
2. List what you changed.
3. List what you added.
4. List what remains incomplete.
5. List any integrations that still need API keys/configuration.
6. List any database migrations performed.
7. List test results.
8. Identify any critical issues before public launch.

Most importantly:

PRESERVE THE EXISTING KAZIPOA PROJECT AND UPGRADE IT.

Do not simply create mock UI screens.

Where possible, implement real functionality connected to the existing database/backend.
