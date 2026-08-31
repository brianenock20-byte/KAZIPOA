# Kazipoa — Muhtasari Kamili wa Mradi

**Jina la platform:** Kazipoa — *Find Work. Find Talent.*

**Lengo kuu:** Kujenga marketplace ya ajira ya Tanzania inayowaunganisha watafuta kazi na waajiri kwa njia salama, inayoaminika, na yenye workflow ya kweli kutoka usajili hadi maombi ya kazi, malipo, uhakiki wa Admin, na mawasiliano.

**Hali ya sasa:** Kazipoa imechapishwa kwenye internet kupitia `https://kazijob-fjgmdyye.manus.space/`. Homepage na public vacancy routes zinaweza kufunguliwa bila login. Mfumo uko tayari kwa controlled pilot, lakini custom domain, Google indexing, automated payment API, na baadhi ya hatua za verification za mmiliki bado zinahitaji kukamilishwa.

## 1. Mahitaji ya awali ya bidhaa

Uliomba website ionekane ya kitaalamu na ya kuvutia, siyo dashboard tupu mara tu mtu anapofungua link. Mgeni aanze na homepage yenye picha, maelezo ya Kazipoa, namna platform inavyofanya kazi, huduma za watafuta kazi na waajiri, bei za packages, FAQ, na sehemu ya support. Job listings zisitawali homepage ya mgeni bila mpangilio; mgeni aelewe kwanza huduma, kisha atumie registration/sign-in kuingia kwenye portal yake.

Uliomba mfumo uwe wa Tanzania nzima, siyo regions chache pekee. Categories zilipaswa kuongezwa, hasa **Legal**, pamoja na sekta nyingine. Regions za Tanzania na locations mbalimbali zinapaswa kutumika katika search, vacancy forms, na employer directory.

Uliomba watu wawili wenye roles tofauti wasione portfolio au tools za kila mmoja. Job Seeker awe na portal yake, Employer awe na portal yake, na Admin awe na uwezo wa kuona na kusimamia kila kitu. Mtu akijisajili kama Job Seeker asione Employer posting tools; Employer asione seeker-only tools; Admin awe na control center yake.

Uliomba portal ya Job Seeker ifanane kwa kiwango cha kitaalamu na Ajira Portal, ikiwa na taarifa kamili za mtu: elimu, work experience, skills, certifications, CV, profile, applications, saved jobs, notifications, na application status history.

Uliomba Employer aweze kujaza company profile na kuunda vacancy kupitia form ndani ya Employer dashboard. Vacancy isipatikane public moja kwa moja kabla ya malipo, uhakiki wa mwajiri, na approval ya Admin.

## 2. Uamuzi wa mfumo wa malipo

Uliamua kutumia **manual Lipa Namba/mobile-money verification** badala ya kuanza na automated payment gateway. Kazipoa haitakiwi kuhifadhi card number, CVV, PIN, au siri za kifedha za mteja. Mwajiri anatuma malipo kwenye namba rasmi, kisha anaingiza transaction/reference ID na kupakia receipt. Admin ndiye anayelinganisha taarifa na kuthibitisha.

Njia zilizojadiliwa zilikuwa M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, CRDB Bank, na Visa/Mastercard. Uliamua **M-Pesa iwe primary**, na Visa/Mastercard ziwe secondary options inapohitajika. Mfumo wa sasa ni manual; automated provider API/webhook bado haijaunganishwa kwa credentials halisi.

Namba ya malipo iliyowekwa kwenye project settings ni `255763796723`. Kabla ya launch ya kibiashara, thibitisha kwamba namba hii ni sahihi na inamilikiwa na Kazipoa.

Bei za vacancy packages ulizoweka ni:

| Package | Bei | Maelezo ya msingi |
|---|---:|---|
| Basic vacancy | TSh 10,000 | Posting ya kawaida kwa waajiri wanaotaka kuanza |
| Featured vacancy | TSh 25,000 | Visibility na presentation iliyoboreshwa |
| Premium vacancy | TSh 50,000 | Package ya juu yenye promotion/priority zaidi |

Subscriptions za mwezi ulizoweka ni:

| Plan | Bei | Limit iliyowasilishwa |
|---|---:|---|
| Starter | TSh 50,000 kwa mwezi | Vacancies 5 na candidates 50 |
| Business | TSh 150,000 kwa mwezi | Vacancies 20 na candidates 250 |
| Enterprise | Custom pricing | Capacity na huduma maalum |

Pricing cards zilirekebishwa ziwe compact kwenye mstari mmoja wa desktop zikiwa sita: Basic, Featured, Premium, Starter, Business, Enterprise. Maelezo kamili yanaonekana mtu akibofya package. Kuna FAQ inayofafanua payment methods, receipt, review, refunds, rejected payments, na kwamba Admin review kwa submission kamili hufanyika kwa kawaida ndani ya business day moja.

## 3. Job Seeker portal

Job Seeker anaweza kujisajili na kuingia kwenye workspace yake tofauti. Portfolio imeandaliwa kwa taarifa za kitaalamu za mwombaji, ikiwa ni pamoja na:

| Sehemu | Taarifa inayokusanywa |
|---|---|
| Personal profile | Jina, mawasiliano, location/region, professional summary |
| Education | Institution, qualification, field, dates |
| Experience | Employer, title, responsibilities, dates |
| Skills | Skills zinazohusiana na kazi |
| Certifications | Certificate, issuing body, date |
| CV | File ya PDF/document inayohifadhiwa kwa private storage |
| Applications | Kazi alizoomba na hali ya kila application |
| Saved jobs | Vacancies alizoweka bookmark |
| Notifications | Application status na matching vacancy alerts |
| Preferences | Email/in-app alert controls |

CV inapaswa kubaki private. Owner na Admin mwenye ruhusa pekee ndio wanaoweza kuiona. Uploads mpya sasa zinatumia storage keys salama zisizo na spaces au characters zisizo salama. Preview inapita kwenye protected server route badala ya kupeleka browser moja kwa moja kwenye public storage URL.

Kuna feature ya kuchagua CV katika application form, cover-letter editing na preview kabla ya submit, pamoja na application status timeline. Timeline inaweza kuonyesha employer notes, scheduled interview date, Google Calendar link, na Outlook export.

Job Seeker anaweza kutafuta kazi kwa keyword, region, category, company, na filters nyingine. Kuna saved jobs search, sorting, pagination/infinite scrolling, recent-search chips, clear-search action, folders/tags, share-job action, na auto-suggest ya company/job title.

## 4. Employer portal

Employer anajisajili kama Employer na huona Employer workspace yake pekee. Anaweza kujaza company portfolio yenye jina la kampuni, registration details, industry, region, contact details, description, na taarifa nyingine za uaminifu.

Employer anaweza kuunda vacancy yenye title, category, location, type, salary, education, experience, skills, deadline, description, na recruitment details. Vacancy inapitia state machine ya malipo na moderation. Employer anaweza kuona status ya payment, transaction reference, receipt submission, admin note, subscription status, candidate applications, na limits za plan.

Employer anaweza kuona candidates wa vacancy zake pekee. Anaweza kubadilisha application status, kwa mfano New, Shortlisted, Interview, Accepted, au Rejected, kulingana na workflow iliyopo. Updates zinapaswa kuonekana kwenye seeker timeline na notification center. Email notifications hutumwa kupitia Postmark pale configuration na sender verification vimekamilika.

## 5. Admin control center

Admin ndiye mwenye mfumo mzima wa moderation na operations. Control center ina sehemu za:

| Admin area | Kazi |
|---|---|
| Users & roles | Kuangalia na kusimamia users/roles kulingana na procedures zilizopo |
| Vacancies | Ku-review, edit, approve, reject, request changes, au kuondoa posting |
| Employers | Ku-review employer registration na verification |
| Payments | Kuangalia payment reference, amount, provider, employer, vacancy, receipt, status, na notes |
| Receipts | Ku-preview na kupakua receipt kwa njia salama |
| Reports & safety | Kuchunguza scam reports, duplicate vacancy signals, na safety issues |
| Support | Kusimamia tickets, status, priority, na Admin notes |
| Platform settings | Kuhifadhi categories, regions, support contacts, review guidance, na notification controls |

Admin payment workflow ni: **Employer submits vacancy → payment pending → Admin checks transaction → Admin previews receipt → Admin approves/rejects payment → Admin verifies employer/vacancy → approved vacancy becomes public**. Server inazuia publication kama payment haijafaulu au employer hajathibitishwa.

## 6. Support system

Uliomba support iwe ndani ya website badala ya kutegemea mailto pekee. Contact Support modal inatengeneza ticket reference, inakusanya jina, email, na message, na kuhifadhi ticket kwenye database. Namba za support zilizowekwa ni:

- `+255616116779`
- `+255695985717`

Admin anaweza kuona tickets, kuchuja kwa status, kupanga kwa priority, kuweka notes, na kubadilisha status. Email notifications za ticket updates zimeandaliwa kupitia Postmark.

## 7. Notifications na email

Mfumo una in-app notification center yenye unread count, bell badge, unread-only filter, mark-as-read, mark-all-as-read, direct View vacancy links kwa matching alerts, na slide-in animation yenye reduced-motion support.

Notifications zinazolengwa ni application status changes, matching new vacancies, payment/support status updates, na scheduled interview reminders inapohitajika. Seeker anaweza kuchagua channels tofauti za email na in-app kupitia preferences.

Postmark ilichaguliwa badala ya Resend. Sender domain/email lazima iwe verified vizuri kabla ya kutegemea delivery ya production. Usihifadhi au kushiriki Postmark server token kwenye chat, screenshot, code, au public repository. Kama token ilishawahi kuwekwa wazi, izungushwe/irevoke na itengenezwe nyingine.

## 8. SEO na public discovery

Uliomba mtu akitafuta “Kazipoa” au Tanzania jobs kwenye Google aweze kuiona platform. Kwa hilo tuliweka:

- Public homepage inayofunguka bila login.
- Public vacancy routes.
- Server-rendered title, description, canonical, Open Graph, Twitter metadata, na Schema.org JobPosting structured data kwa vacancies.
- `robots.txt` inayoruhusu public pages na kuzuia dashboard/preferences.
- `sitemap.xml` yenye homepage, companies, safety, na public vacancies.
- Canonical URLs zinazotumia public Kazipoa domain, siyo internal Cloud Run hostname.

Public SEO assets zilizothibitishwa ni:

- Website: `https://kazijob-fjgmdyye.manus.space/`
- Robots: `https://kazijob-fjgmdyye.manus.space/robots.txt`
- Sitemap: `https://kazijob-fjgmdyye.manus.space/sitemap.xml`
- Public vacancy example: `https://kazijob-fjgmdyye.manus.space/vacancies/30006`

Google Search Console ni hatua ya mmiliki. Chagua **URL-prefix**, weka `https://kazijob-fjgmdyye.manus.space/`, thibitisha ownership, kisha submit `sitemap.xml`. Google indexing siyo ya papo hapo; inaweza kuchukua siku au zaidi.

## 9. Domain na Cloudflare

Domain uliyotaja kwa brand ni `portol.kazipoa.co.tz`, lakini kwa sasa public domain inayopatikana ni `kazijob-fjgmdyye.manus.space`.

Cloudflare screenshot ilionyesha `kazipoa.co.tz` inasubiri nameserver delegation. Nameservers ulizopewa ni:

- `bob.ns.cloudflare.com`
- `yolanda.ns.cloudflare.com`

Hizi ziwekwe kwenye **Nameservers** za registrar aliyekuuzia `kazipoa.co.tz`; zisiwekwe kama A record au CNAME. Public DNS check ya mwisho ilionyesha nameservers bado hazijasoma, kwa hiyo Cloudflare bado haikuwa Active. Baada ya kubadilisha, subiri saa 1–2 au hadi saa 24, kisha bofya **Check nameservers now** Cloudflare.

Baada ya domain kuwa Active Cloudflare, `portol.kazipoa.co.tz` bado inahitaji kuunganishwa na Kazipoa kupitia Manus project Settings → Domains. Usibashiri CNAME target; tumia target iliyoonyeshwa na hosting platform.

## 10. Monitoring

Health endpoints ziliandaliwa kwa external uptime monitoring:

- `/api/health`
- `/api/readiness`

Health endpoint huonyesha kama application iko hai; readiness inakagua database connectivity bila kuonyesha taarifa nyeti. Uptime monitor inaweza kupiga endpoints hizi kila dakika 5 na ku-alert baada ya failures mbili au tatu mfululizo. Payment/application queues zinapaswa kufuatiliwa kwa Admin dashboard, application logs, error rates, na alerts za 5xx. Template ya pilot results na observability report imeandaliwa ndani ya project.

## 11. CV bug iliyogunduliwa

CV ya zamani ilihifadhiwa kwa object key yenye spaces, na storage provider ilirudisha `AccessDenied`. Baada ya jaribio la kubadilisha route, record ya zamani ilionyesha Cloudflare `502 Bad Gateway` kwa sababu object yenyewe ilikuwa legacy/inaccessible. Fix iliyowekwa ni:

1. Storage keys mpya zinasanitize filename.
2. CV na receipt uploads mpya hazitumii spaces/unsafe characters kwenye object key.
3. CV preview inatumia protected application route.
4. Dashboard inatambua legacy CV na kuonyesha **Re-upload CV to repair preview**.
5. CV ya zamani lazima ipakiwe tena ili itengeneze record mpya salama.

Usifute CV ya zamani au kubadilisha database manually bila backup/approval; upload tena kupitia dashboard ndiyo njia salama.

## 12. Technology iliyotumika

Project ilijengwa kwa React 19, TypeScript, Tailwind CSS 4, Express, tRPC 11, Drizzle ORM, MySQL/TiDB, Vitest, Postmark, na S3-compatible private storage. Database schema ina users, roles/account types, employer profiles, seeker profiles/documents, vacancies, payments, subscriptions, applications, notifications, support tickets, platform settings, na audit/moderation fields.

Testing imekuwa ikifanywa kwa Vitest, TypeScript no-emit check, production build, route checks, live HTTP checks, database read-only audits, na browser screenshots. Checkpoint za mwisho zimepita na project iko public live.

## 13. Hali ya sasa kwa kifupi

| Eneo | Hali |
|---|---|
| Public website | Live: `https://kazijob-fjgmdyye.manus.space/` |
| Homepage | Public, ina content ya Kazipoa, pricing, FAQ, support, na CTAs |
| Role isolation | Implemented kwa Seeker, Employer, na Admin |
| Job Seeker portfolio | Implemented na database-backed sections |
| CV private storage | Implemented; legacy CV inahitaji re-upload |
| Employer vacancy workflow | Implemented |
| Manual Lipa Namba | Implemented; Admin verification ni manual |
| Receipt upload/preview | Implemented kwa protected flow |
| Admin moderation | Implemented |
| Applications/status timeline | Implemented |
| Notifications | Implemented |
| Support tickets | Implemented |
| Admin Platform Settings | Implemented kwa database-backed settings |
| Google SEO assets | Live na verified |
| Google Analytics 4 | Haijaunganishwa bado; inahitaji Measurement ID ya `G-XXXXXXXXXX` |
| Custom domain | Bado inasubiri nameserver delegation na domain binding |
| Google indexing | Inahitaji Search Console verification/submission na muda wa Google crawl |
| Automated payment API | Haijaunganishwa; current path ni manual Lipa Namba |

## 14. Hatua za mwisho za mmiliki

Kwanza, fungua public website na uthibitishe homepage, public vacancy, registration, na sign-in. Pili, re-upload CV ya legacy kutoka Job Seeker dashboard na uthibitishe View CV. Tatu, tengeneza test account mpya ya Seeker na Employer, kisha fanya controlled end-to-end pilot bila kutumia transaction ID ya uongo. Nne, kamilisha nameserver delegation ya Cloudflare na domain binding ya `portol.kazipoa.co.tz`. Tano, fungua Google Search Console, verify URL-prefix property ya public domain, na submit `sitemap.xml`. Sita, tengeneza GA4 web data stream na Measurement ID, kisha iingizwe kwenye project. Saba, thibitisha Postmark sender/domain na ufanye email delivery test. Nane, baada ya pilot, ndipo uanze kuunganisha automated M-Pesa/payment API kama utaamua kuondoka kwenye manual verification.

## 15. Kanuni muhimu za usalama

Kazipoa isihifadhi CVV, PIN, card number, passwords, OAuth secrets, Postmark tokens, database credentials, au API keys kwenye frontend, screenshots, chat, au repository. Payment records zihifadhi transaction reference na receipt metadata tu. CV na receipts ziwe private na zifikike kwa authorization ya owner/Admin. Admin actions zote zibaki server-side protected. Usitumie fake customer reviews, fake ratings, au fake testimonials kwenye website.

## 16. Files muhimu za project

- `client/src/pages/Home.tsx` — homepage, dashboards, role-aware UI, forms, modals.
- `server/routers.ts` — tRPC procedures na role/protection rules.
- `server/db.ts` — database helpers.
- `drizzle/schema.ts` — database schema.
- `server/storage.ts` — private storage uploads na filename sanitization.
- `server/publicVacancy.ts` — public vacancy metadata, canonical URLs, Schema.org data.
- `server/_core/vite.ts` — public robots, sitemap, SSR metadata routes.
- `server/postmarkEmail.ts` — email notifications.
- `pilot-results-template.md` — template ya kurekodi pilot results.
- `google-search-console-launch.md` — mwongozo wa Search Console.
- `todo.md` — task tracker na audit history.

## Hitimisho

Kazipoa sasa ni platform ya kweli ya pilot, siyo homepage ya mfano pekee. Core workflows zimejengwa kwa database na protected tRPC procedures. Mambo makubwa yaliyobaki siyo kujenga upya platform, bali ni **kufanya owner verification na operational setup**: nameservers/custom domain, Google Search Console, GA4 Measurement ID, Postmark verification, re-upload ya legacy CV, na controlled test ya accounts mpya pamoja na manual payment ya kweli ikiwa uko tayari kuilipia.
