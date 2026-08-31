# Kazipoa — Mwongozo wa Kutafuta Mtaalamu wa Mfumo

**Tarehe:** 24 Agosti 2026  
**Mmiliki wa mfumo:** Brian Abesiga Enock  
**Jina la mfumo:** Kazipoa — Find Work. Find Talent.

## 1. Lengo la hati hii

Hati hii imeandaliwa kumsaidia mmiliki wa Kazipoa kutafuta mtu sahihi wa kuikagua, kuikamilisha, kuilinda, kuifanyia majaribio na kuipeleka mfumo kwenye matumizi ya kweli. Kazipoa si landing page pekee; ni recruitment marketplace yenye Job Seeker, Employer na Admin workflows.

Mtu anayehitajika si designer wa website pekee. Anahitajika **Senior Full‑Stack Engineer au Technical Lead mwenye uzoefu wa DevOps, security, database na end-to-end QA**.

## 2. Taarifa za sasa za mfumo

| Kipengele | Hali ya sasa |
|---|---|
| Public URL | https://kazijob-fjgmdyye.manus.space |
| Custom domain inayolengwa | `portol.kazipoa.co.tz` — bado inahitaji kuunganishwa kama website domain |
| Frontend | React 19 na Tailwind 4 |
| Backend | Node.js, Express na tRPC 11 |
| Database | MySQL kupitia Drizzle ORM |
| Authentication | Secure-provider authentication pamoja na custom email/password pilot |
| Storage | Secure file storage kwa CV na documents |
| Payments | Manual Lipa Namba workflow yenye receipt review ya Admin |
| Roles | Job Seeker, Employer na Admin |
| Hosting | Managed production hosting ya Manus |
| Analytics | Haijawezeshwa mpaka GA4 Measurement ID halisi itolewe |
| Supabase | Si backend inayotumika kwa sasa; usihamishe mfumo bila uamuzi na migration plan maalum |

## 3. Mtaalamu wa kutafutwa

Tafuta mtu au timu ndogo yenye uwezo wa kufanya mambo haya:

1. **Full-stack engineering:** React, TypeScript, Node.js, tRPC, MySQL, Drizzle ORM, authentication na file storage.
2. **DevOps:** domains, DNS, HTTPS, deployment, environment variables, backups na rollback.
3. **Security:** role-based access control, private CV documents, session security, password handling, rate limiting na audit logs.
4. **QA:** browser testing, mobile testing, database persistence checks, error handling, empty states na end-to-end recruitment testing.
5. **Product operations:** employer verification, vacancy moderation, payment receipt review, application status, notifications na support workflow.
6. **SEO na monitoring:** sitemap, Search Console, analytics setup, uptime monitoring na production error monitoring.

## 4. Kazi anayopaswa kufanya

### Phase 1 — Technical audit

Mtaalamu aanze kwa kuandika audit report kabla ya kubadilisha mfumo. Report ieleze source code, production deployment, database, authentication, storage, payment workflow, route behavior, security na deployment risks.

Athibitishe kuwa mfumo wa sasa unatumia MySQL/Drizzle na asibadilishe kwenda Supabase kwa assumption. Asifute database, users, applications, employers au documents zilizopo.

### Phase 2 — Role na security verification

Athibitishe kwa browser na backend kwamba:

- Job Seeker anaona portfolio, CV, applications na notifications zake tu.
- Employer anaona company profile, vacancies na candidates wanaohusiana na vacancies zake tu.
- Admin anaweza kuona na kusimamia maeneo yaliyoidhinishwa ya mfumo.
- User mmoja hawezi kufungua dashboard au data ya role nyingine kwa kubadilisha URL.
- CV na documents za seeker hazionekani kwa mtu asiye na ruhusa.
- Password, OTP, session token na secrets hazihifadhiwi kwenye chat, source code au screenshots.
- Hakuna verification au payment state inayowekwa moja kwa moja ili kufanya test ionekane imepita.

### Phase 3 — Safe end-to-end test

Atumie test identities na test records pekee:

| Test identity | Kazi ya test |
|---|---|
| TEST SEEKER | Register/login, profile, education, experience, skills, certificate, CV, search na application |
| TEST EMPLOYER | Login, company profile, test vacancy, kuona application, candidate review na status |
| TEST ADMIN | Login, kuona test vacancy/application/employer na kujaribu moderation controls |

Flow inayotakiwa kuthibitishwa ni:

```text
TEST SEEKER registration/login
→ Complete test profile
→ Find TEST VACANCY
→ Open vacancy details
→ Submit TEST APPLICATION
→ Confirm database persistence
→ TEST EMPLOYER sees TEST APPLICATION
→ Employer views candidate
→ Employer shortlists candidate
→ Employer changes application status
→ TEST ADMIN views test vacancy/application/employer
→ Admin tests moderation controls
```

Hakuna test application itumwe kwa employer wa kweli. Hakuna test data ichanganywe na customer data.

### Phase 4 — Production readiness

Mtaalamu akamilishe na kuthibitisha:

- Website domain na HTTPS.
- Email/domain configuration kwa domain inayomilikiwa na Kazipoa.
- Secure file storage na private document access.
- Manual Lipa Namba receipt workflow.
- Admin approval ya employer na vacancy.
- Application status na notification workflow.
- Backups na recovery/rollback process.
- Uptime na error monitoring.
- Mobile na desktop compatibility.
- Public routes, redirects, empty states na error pages.
- Sitemap, robots na Search Console readiness.
- Analytics kwa Measurement ID halisi pekee; hakuna fake ID.

### Phase 5 — Handover na launch

Baada ya kazi, mtaalamu atoe:

1. Technical audit report.
2. QA report yenye `PASS`, `PARTIAL`, `FAIL` na `NOT TESTED`.
3. Orodha ya bugs zilizorekebishwa na retest evidence.
4. Database schema na backup/recovery notes.
5. Deployment na rollback instructions.
6. Environment-variable inventory bila kuonyesha secret values.
7. User-role na permissions matrix.
8. Admin operating manual.
9. Payment na receipt review procedure.
10. Support na incident-response procedure.
11. Source-code handover na repository access.
12. Launch checklist na post-launch monitoring checklist.

## 5. Vitu vya kumpa mtaalamu

Mmiliki aandaye package yenye:

- Live URL: `https://kazijob-fjgmdyye.manus.space`
- Source ZIP au repository access.
- Maelezo ya stack ya mfumo.
- Domain inayolengwa: `portol.kazipoa.co.tz`.
- Admin contact ya mfumo.
- Namba sahihi ya Lipa Namba.
- Sheria za employer verification na vacancy moderation.
- Orodha ya features ambazo ni muhimu kabla ya launch.
- QA scenarios za Job Seeker, Employer na Admin.
- Screenshots za errors zilizopo.
- Orodha ya integrations zinazotumika na ambazo bado hazijawezeshwa.

Usimpe mtaalamu password zako binafsi kupitia WhatsApp, email au chat. Tumia collaborator access, accounts maalum za kazi na password manager. Baada ya kazi, revoke access zote ambazo si lazima ziendelee.

## 6. Acceptance criteria za kumlipa mtaalamu

Kazi ihesabiwe imekamilika pale ambapo mtaalamu ametoa ushahidi wa mambo yafuatayo:

| Eneo | Kigezo cha kukubali kazi |
|---|---|
| Public website | Homepage na public routes zinafunguka kwenye production URL |
| Job Seeker | Anaweza kuingia, kujaza profile, kutafuta vacancy, kufungua details na kutuma test application |
| Employer | Anaweza kuona test application na kubadilisha status bila kuona data isiyomhusu |
| Admin | Anaweza kusimamia test vacancy, test employer na test application kwa permissions sahihi |
| Database | Test records zina-persist; hakuna real records zilizobadilishwa |
| Privacy | CV na documents zinalindwa kwa authorization sahihi |
| Payment | Hakuna payment inayoitwa successful bila confirmation ya kweli |
| Moderation | Employer na vacancy haviitwi verified/published kabla ya approval inayohitajika |
| Mobile | Main flows zinafanya kazi kwenye simu na desktop |
| QA | Report inaonyesha kila PASS, PARTIAL, FAIL na NOT TESTED bila fabricated results |
| Handover | Owner anapokea source, documentation, deployment notes na access control |

## 7. Maswali ya kumuuliza kabla ya kumpa kazi

- Umeshawahi kuzindua recruitment marketplace au mfumo wenye roles tofauti?
- Unawezaje kuthibitisha private document access na role isolation?
- Utaanza na audit gani kabla ya kubadilisha code?
- Utawezaje kufanya testing bila kutumia real customer data?
- Utaandaa vipi backup na rollback?
- Utawezaje kuthibitisha database persistence bila ku-force success state?
- Utaandika QA report yenye PASS/PARTIAL/FAIL/NOT TESTED?
- Utaacha vipi owner akiwa na source code, documentation na access zote?
- Utafanya nini ukikuta integration ya nje haijathibitishwa?
- Ni vitu gani vitakuwa Phase 1 na ni vitu gani vitasubiri Phase 2?

## 8. Red flags za kumkataa mtaalamu

Mkatae mtu anayefanya mojawapo ya mambo haya:

- Anaomba password zako binafsi au OTP kwa chat.
- Anataka kufuta au ku-rebuild database bila backup na sababu ya kitaalamu.
- Anataka kuhamisha mfumo kwenda Supabase bila audit na migration plan.
- Anatumia fake users, fake employers, fake jobs, fake reviews au fake testimonials.
- Anaahidi “everything is done” bila browser testing na database evidence.
- Anataka ku-mark account verified moja kwa moja kwenye database ili test ipite.
- Hana mpango wa rollback, backup, security au handover.
- Anafanya mabadiliko bila staging/test records.
- Haelezi ni data gani amebadilisha na kwa nini.

## 9. Ujumbe wa kutuma kwa developer

```text
Nahitaji Senior Full-Stack Engineer au Technical Lead wa kufanya audit, security hardening, end-to-end QA na production launch ya recruitment platform yangu inayoitwa Kazipoa.

Live URL:
https://kazijob-fjgmdyye.manus.space

Stack:
React 19, TypeScript, Node.js, tRPC 11, MySQL/Drizzle, secure-provider authentication pamoja na custom email/password pilot, secure file storage na manual Lipa Namba payment workflow.

Usi-rebuild project, usibadilishe database, usihamishe mfumo kwenda Supabase kwa assumption, na usitumie fake users, fake employers, fake vacancies, fake reviews au fake testimonials.

Deliverables ninazohitaji:
1. Technical audit ya source code, deployment, database, authentication, storage na integrations.
2. Uthibitisho wa role separation ya Job Seeker, Employer na Admin.
3. Safe end-to-end QA kwa TEST SEEKER, TEST EMPLOYER na TEST ADMIN pekee.
4. Working profile, CV, vacancy, application, shortlist, interview/status na moderation flow.
5. Privacy protection ya seeker documents na role-based access control.
6. Manual payment/receipt approval workflow bila fake payment-success state.
7. Domain, HTTPS, backups, monitoring na rollback readiness.
8. Mobile, security, performance, SEO na error testing.
9. QA report yenye PASS, PARTIAL, FAIL na NOT TESTED.
10. Complete technical handover na launch checklist.

Hakuna real employer atakayepokea test application. Hakuna real user au customer data itakayobadilishwa. Usibypass authentication na usiandike fake verification records. Kazi ianze kwa audit report kabla ya implementation.
```

## 10. Mpangilio wa kuanza

Anza kwa kutafuta **Senior Full‑Stack Engineer mwenye DevOps na QA experience**. Mpe live URL na brief hii, lakini usimpe secrets zako kwenye chat. Mwombe audit report ya kwanza. Baada ya kukubaliana juu ya scope, mpe temporary access inayoweza kurevokewa. Mwombe afanye safe test-account flow. Baada ya test kupita, ndipo akamilishe domain, monitoring, real employers, payment operations na production launch.

Kwa hali ya sasa, Kazipoa ina public foundation na recruitment architecture, lakini full authenticated pilot haipaswi kutangazwa kuwa imekamilika mpaka test account verification, Seeker application, Employer candidate workflow na Admin moderation viwe vimejaribiwa kwa ushahidi halisi.
