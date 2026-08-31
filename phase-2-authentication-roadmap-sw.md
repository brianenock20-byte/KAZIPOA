# Mpango wa Phase 2: Authentication ya Kazipoa

**Mwandishi:** Manus AI  
**Tarehe:** 23 Agosti 2026  
**Uamuzi unaopendekezwa:** Endelea na secure OAuth provider wa sasa wakati wa pilot; custom email/password ijengwe kwanza kama mfumo wa pili wa majaribio, si replacement ya haraka.

## 1. Hali ya sasa ya mfumo

Kwa sasa Kazipoa haichukui wala kuhifadhi password kwenye frontend yake. Kitufe cha **Sign in** na **Create profile** kinatumia `startLogin()` kisha kinampeleka mtumiaji kwenye secure sign-in provider ya nje. Hii ndiyo sababu Kazipoa haiwezi kubadilisha moja kwa moja rangi, picha, Show/Hide Password, au Caps Lock indicator ndani ya ukurasa wa email/password unaoonekana huko.

Mabadiliko yaliyowekwa kwenye Kazipoa ni **branded authentication handoff**: mtumiaji anaona panel yenye picha ya Kazipoa, ujumbe wa usalama, loading indicator, na maelezo kwamba password inashughulikiwa na provider salama kabla ya kuondoka kwenye Kazipoa. Hii hupunguza hisia ya ukurasa mweupe unaochelewa, bila kutengeneza password form ya uongo au kuvunja OAuth.

> **Muhimu:** Usihifadhi password plain text, usiweke password kwenye `localStorage`, na usiunde form ya kuonekana inafanya kazi ikiwa backend yake haijajengwa. Mfumo wa sasa unaendelea kuwa salama kwa sababu provider ndiye anayesimamia credential verification.

## 2. Jinsi ya kuweka picha au mchoro mzuri kwenye login experience

### Chaguo linalopendekezwa kwa sasa: branded handoff ndani ya Kazipoa

Tumia picha ya Kazipoa iliyopo kwenye storage, kwa mfano hero asset iliyotumika kwenye homepage: `/manus-storage/kazipoa-hero_3140ef94.jpg`. Picha iwe upande wa kushoto kwenye desktop na iwe sehemu fupi ya juu kwenye simu. Upande mwingine uwe na ujumbe mfupi wa hatua inayofuata, loading indicator, lock icon, na button ya kubaki Kazipoa.

Muundo wa visual uwe na sehemu mbili. Kwanza, picha yenye overlay ya navy ili maandishi meupe yasomeke. Pili, sehemu ya maelezo yenye background nyeupe, heading kubwa, ujumbe wa usalama, na progress state. Tumia picha halisi ya brand au illustration iliyoidhinishwa; usitumie logo za uongo, employer photos zisizo na ruhusa, au picha inayodai uthibitisho ambao haujafanyika.

| Sehemu | Pendekezo la UI | Sababu |
|---|---|---|
| Picha | Hero/safety image ya Kazipoa kutoka storage | Inajenga continuity na homepage |
| Overlay | Navy gradient, siyo black opaque kabisa | Hufanya maandishi yasomeke bila kuficha picha yote |
| Heading | “Opening secure sign in.” au “Opening secure registration.” | Mtumiaji ajue kinachoendelea |
| Ujumbe | “Password yako inashughulikiwa na secure sign-in provider.” | Huongeza trust bila kudai Kazipoa inahifadhi password |
| Loading | Spinner ndogo na `aria-live="polite"` | Huzuia mtumiaji kubofya mara nyingi |
| Mobile | Picha iwe takriban 190–205px juu, maelezo chini | Inabaki readable kwenye screen ndogo |
| Accessibility | Alt text, focus ring, close/cancel, reduced motion | Inafanya UI itumike na keyboard na screen readers |

### Kama tunataka custom provider baadaye

Baada ya custom email/password kujengwa na kuidhinishwa, login page yenyewe inaweza kuwa na picha hiyo hiyo ndani ya layout ya page. Hapo ndipo image panel itaonekana pamoja na email, password, Show/Hide Password, Caps Lock warning, Forgot Password, na Create Account form. Hatuipaswi kuifanya kabla backend ya credential authentication haijawa tayari.

Mfano wa markup ya layout:

```tsx
<main className="auth-page">
  <section className="auth-visual" aria-label="Kazipoa recruitment platform">
    <img
      src="/manus-storage/kazipoa-hero_3140ef94.jpg"
      alt="Professional at work in a Tanzanian workplace"
    />
    <div className="auth-visual-scrim" />
    <div className="auth-visual-copy">
      <span>Kazipoa secure access</span>
      <h1>Find work. Find talent. Move forward.</h1>
    </div>
  </section>
  <section className="auth-form-panel" aria-labelledby="login-title">
    {/* Email/password form belongs here only after custom auth is approved. */}
  </section>
</main>
```

## 3. Jinsi Show/Hide Password inavyofanya kazi

Show/Hide Password haibadilishi password yenyewe. Inabadilisha tu `type` ya input kutoka `password` kwenda `text` wakati mtumiaji ameamua kuiona, na kurudisha `password` anapobofya tena. Button lazima iwe na `type="button"` ili isisubmit form kimakosa, iwe na `aria-pressed`, iwe na label inayobadilika, na isiweke value ya password kwenye logs.

```tsx
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  return (
    <div className="password-field">
      <label htmlFor="password">Password</label>
      <div className="password-input-wrap">
        <input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => setCapsLockOn(event.getModifierState("CapsLock"))}
          onKeyUp={(event) => setCapsLockOn(event.getModifierState("CapsLock"))}
          autoComplete="current-password"
          aria-describedby={capsLockOn ? "caps-lock-hint" : undefined}
          required
        />
        <button
          type="button"
          className="password-visibility-button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {capsLockOn && (
        <p id="caps-lock-hint" className="caps-lock-hint" role="status">
          Caps Lock imewashwa. Password ni case-sensitive.
        </p>
      )}
    </div>
  );
}
```

### Kanuni za interaction

Usibadilishe herufi kuwa uppercase au lowercase kwa nguvu. Usifute password wakati mtumiaji amebofya Show/Hide. Usionyeshe password kwenye toast, analytics, network logs, error logs, URL, au query string. Baada ya submit, clear password value kutoka memory ya component inapofaa, na tumia `autocomplete="current-password"` kwa sign-in au `autocomplete="new-password"` kwa registration.

Caps Lock warning haipaswi kuzuia submit. Ni msaada wa mtumiaji tu. Onyo liingie wakati wa `keydown` na `keyup`, libaki na `role="status"`, na lionekane pia kwa keyboard users. Kwenye simu, keyboard ya device inaweza kutotoa modifier state kwa usahihi; kwa hiyo ujumbe wa jumla kwamba password ni case-sensitive ubaki kama helper text.

## 4. Mpango wa Phase 2 wa custom email/password

### Hatua ya A: Security design kabla ya code

Tutaanza kwa threat model na data-flow review. Tutatenganisha **identity**, **authentication credential**, **session**, na **workspace role**. `users.id` iliyopo itaendelea kuwa identity ya msingi ili portfolio, vacancies, applications, payments, notifications, na admin ownership zisihamishwe kwenye user mpya kwa bahati mbaya.

Password itahifadhiwa kama hash ya adaptive password algorithm, si encryption na si plaintext. OWASP inapendekeza Argon2id kwa password storage, ikiwa na salt ya kipekee kwa kila password; inashauri pia work factor inayofaa mazingira ya production [1]. NIST inaeleza kuwa password/passphrase inapaswa kuruhusu urefu unaofaa na authentication process lazima ilinde secrets wakati wa remote authentication [2].

### Hatua ya B: Database model ya additive migration

Schema itapanuliwa bila kufuta au kubadilisha rows zilizopo. Mfano wa tables ni kama ifuatavyo:

| Table | Fields muhimu | Maana |
|---|---|---|
| `authCredentials` | `userId`, `emailNormalized`, `passwordHash`, `algorithm`, `verifiedAt`, `createdAt`, `updatedAt` | Credential ya custom auth; hash tu |
| `emailVerificationTokens` | `id`, `userId`, `tokenHash`, `expiresAt`, `usedAt` | Verification ya email bila kuhifadhi token raw |
| `passwordResetTokens` | `id`, `userId`, `tokenHash`, `expiresAt`, `usedAt` | Reset token ya matumizi ya mara moja |
| `authSessions` | `idHash`, `userId`, `createdAt`, `expiresAt`, `lastSeenAt`, `revokedAt`, `ipHash`, `userAgentHash` | Server-side session; raw token haitunzwe database |
| `authEvents` | `userId`, `eventType`, `success`, `createdAt`, `requestId` | Audit ya login, logout, reset, verification, lockout |
| `authRateLimits` | `subjectKey`, `attemptCount`, `windowStartedAt`, `blockedUntil` | Throttling ya email/IP/device kwa tahadhari |

Email ya login iwe normalized kwa lowercase na trimming, lakini display email ihifadhiwe kwa namna inayofaa. Unique constraint iwe kwenye normalized email. Migrate kwa additive SQL, verify foreign keys, kisha rollback plan iwe tayari kabla ya production enablement.

### Hatua ya C: Backend procedures na endpoints

Tutatengeneza procedures zifuatazo kwa server-side validation na generic errors:

| Procedure | Kazi | Ulinzi |
|---|---|---|
| `auth.passwordRegister` | Tengeneza credential iliyohashwa na link kwa existing/new user policy | Rate limit, email verification, role policy |
| `auth.passwordLogin` | Verify hash na kuanzisha session | Generic error, throttling, audit event |
| `auth.passwordLogout` | Revoke current session | Idempotent |
| `auth.requestPasswordReset` | Tuma one-time reset link | Generic response ili kuzuia email enumeration |
| `auth.resetPassword` | Verify token, replace hash, revoke old sessions | One-time token, audit event |
| `auth.verifyEmail` | Verify one-time email token | Expiry and replay protection |
| `auth.listSessions` | Optional security page ya kuona sessions | Current user only |
| `auth.revokeSession` | Revoke session moja | Owner/admin policy |

Login response isiambie “email hii haipo” tofauti na “password si sahihi”; itumie ujumbe wa jumla kama **“Email or password is incorrect.”** Hii inapunguza account enumeration. Admin accounts zipewe step-up authentication, MFA/passkey policy, au ziendelee kutumia provider iliyopo hadi security review ikamilike.

### Hatua ya D: Cookie na session design

Session ID iwe random, ndefu, isiyotabirika, na ihifadhiwe kwenye cookie ya `HttpOnly`, `Secure`, `SameSite=Lax` au `Strict` kulingana na OAuth callback requirements, yenye `Path=/` na expiry iliyo wazi. Session ihifadhiwe server-side kwa hash ya token; token raw ibaki kwenye browser cookie tu. Session ID ibadilishwe baada ya login na privilege change ili kuzuia session fixation. OWASP inaweka mkazo kwenye Secure, HttpOnly, SameSite, lifecycle, expiration, na re-authentication ya sessions [3].

Tutaweka idle timeout na absolute timeout, logout ya server-side, revocation ya sessions baada ya password reset, na audit trail kwa login failures, password reset, email change, role changes, na admin privilege events. Tusitumie `localStorage` kwa session token.

### Hatua ya E: Email verification na password recovery

Registration itaanza na pending/unverified state. Mtumiaji ataweza kujaza profile ya msingi lakini actions nyeti kama apply, post vacancy, payment submission, au admin operations ziwe na policy ya verification inayojulikana. Verification token iwe random, hashed kwenye database, expire kwa muda mfupi, itumike mara moja, na isiwekwe kwenye logs.

Password reset endpoint itarudisha ujumbe ule ule kwa email iliyopo au isiyopo. Reset link iwe one-time, expire, revoke sessions zote baada ya successful reset, na itume notification ya security. Tusitumie security questions au kupeleka password kupitia email.

### Hatua ya F: Rate limiting, abuse prevention, na monitoring

Rate-limit login attempts kwa mchanganyiko wa normalized email na IP/network signal, lakini tusifanye permanent lockout inayoweza kutumiwa kumfungia mwathirika. Weka exponential backoff, temporary block, audit events, alert thresholds, na optional CAPTCHA/challenge wakati wa abuse. Log metadata salama tu: request ID, timestamp, result, coarse network signal, na user ID ikiwa inajulikana. Usilog password, reset token, session token, au full sensitive form payload.

### Hatua ya G: Account migration na dual-auth rollout

Recommendation yangu ni **parallel authentication**:

1. OAuth provider abaki default na aendelee kutumika kwa accounts zote zilizopo.
2. Custom credential table iunganishwe na `userId` iliyopo tu baada ya email ownership verification.
3. Usicreate duplicate user kwa email inayolingana; tumia explicit account-linking flow.
4. Existing admin Brian na role yake ya admin isibadilishwe na registration ya kawaida.
5. Portfolio, CVs, vacancies, applications, payments, notifications, saved jobs, na employer profiles zibaki chini ya `users.id` ile ile.
6. Custom auth ianze kwa internal test accounts tu; isiwashwe kwa public users mpaka security and end-to-end review ipite.
7. Rollback flag izime custom login bila kuathiri OAuth sessions.

### Hatua ya H: Frontend pages za Phase 2

Pages zinazohitajika ni `SignIn`, `CreateAccount`, `VerifyEmail`, `ForgotPassword`, `ResetPassword`, `SecuritySessions`, na optional `LinkLoginMethod`. Kila page itatumia same branded visual system na mobile layout. Form states ziwe: idle, validating, submitting, success, generic error, rate-limited, na offline/retry.

Sign-in page iwe na email, password, Show/Hide Password, Caps Lock warning, Forgot Password, Continue, link ya Create Account, na alternative OAuth/Google/other provider. Registration iwe na role choice ya Seeker au Employer, terms acknowledgement, email, password, confirm password, password strength helper, na verification message. Admin account creation isiwe public option.

## 5. Acceptance criteria kabla ya kuwasha custom auth

| Eneo | Acceptance criterion |
|---|---|
| Password storage | Hakuna plaintext/password encryption; Argon2id configuration ime-reviewiwa na secrets ziko vault/environment |
| Sessions | Secure HttpOnly cookies, rotation, expiry, revocation, logout, and no localStorage tokens |
| Recovery | Email verification and reset links are one-time, hashed, expiring, and do not enumerate accounts |
| Role isolation | Seeker haoni Employer/Admin; Employer haoni Seeker private data; Admin gates bado zinafanya kazi |
| Migration | Existing `userId` records, Brian admin, portfolios, CVs, applications, payments, and notifications remain intact |
| UX | Show/Hide works; Caps Lock warning works; casing is untouched; keyboard and mobile focus pass |
| Abuse controls | Throttling, audit events, generic errors, and monitoring are tested under repeated failures |
| QA | Vitest, API tests, browser tests, mobile checks, fresh-account pilot, and rollback drill pass |
| Rollback | Feature flag disables custom auth without deleting credentials or affecting OAuth login |
| Launch | Security review and owner approval are recorded before public enablement |

## 6. Timeline inayopendekezwa

| Sprint | Kazi | Matokeo ya kutolewa |
|---|---|---|
| Sprint 1 | Threat model, schema draft, cookie/session design, email delivery design | Design review and migration plan |
| Sprint 2 | Additive schema, hash helper, sessions, audit events, rate limits | Backend unit tests and migration verification |
| Sprint 3 | Register, verify email, login, logout, reset password procedures | API and security tests |
| Sprint 4 | Branded login/register screens, Show/Hide, Caps Lock, responsive states | Browser/mobile visual QA |
| Sprint 5 | OAuth/custom parallel linking, feature flag, admin/security review | Fresh Seeker/Employer pilot |
| Sprint 6 | Controlled rollout, monitoring, rollback rehearsal, documentation | Decision ya public enablement |

## 7. Uamuzi wa mwisho unaopendekezwa

Kwa launch ya sasa, **usiibadilishe authentication architecture**. Tumia secure provider wa sasa, branded handoff iliyowekwa, na alternative sign-in methods zinazoonekana provider anapofunguka. Hii ndiyo njia yenye risk ndogo kwa Seeker, Employer, Admin, portfolios, vacancies, payments, na role isolation.

Custom email/password iwe Phase 2 inayofanyika kwa parallel rollout na feature flag. Ianze tu baada ya kuwa na security design, migration test, password hashing, sessions, recovery, rate limiting, audit logging, fresh-account pilot, na rollback drill. Ukihitaji control ya moja kwa moja ya Show/Hide Password na Caps Lock kwenye login page, ndipo custom form itakuwa na maana—lakini ifanywe kama mfumo kamili wa authentication, si kama UI-only patch.

## Marejeo

[1]: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html "OWASP Password Storage Cheat Sheet"

[2]: https://pages.nist.gov/800-63-4/sp800-63b.html "NIST SP 800-63B Digital Identity Guidelines"

[3]: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html "OWASP Session Management Cheat Sheet"

[4]: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html "OWASP Authentication Cheat Sheet"


## Preview verification update — 23 Agosti 2026

Preview route `/login?auth-pilot=preview` now renders the **Kazipoa-owned** authentication page rather than immediately showing `manus.im/app-auth`. The page visibly includes the Kazipoa workplace image, “Find work. Find talent. Move forward.” messaging, secure-access copy, email field, password field, Show/Hide Password control, pilot-status notice, OAuth fallback, and mobile-safe layout. The Show Password control was tested in the browser and changed the password input from `type=password` to `type=text`, with the accessible hint changing from “Show password” to “Hide password”.


Browser interaction verification: On the preview login page, Show Password changed the field to visible text and its accessible button hint to “Hide password”. After focusing that field and toggling Caps Lock, the browser reported the field’s CapsLock state and the component displayed its case-sensitive warning state. The user’s password casing is not transformed by the component.


Registration and mobile QA update: Preview route `/register?auth-pilot=preview` shows the same Kazipoa visual panel, full-name/email fields, Job seeker and Employer role choices, password and confirm-password fields, and no public Admin option. At 390×844, both `/login` and `/register` collapse to a readable image panel above the form; the visual copy, pilot notice, fields, and password controls remain within the viewport width without horizontal overflow.


Final desktop visual QA update: At 1280×720, `/login` and `/register` render as actual Kazipoa-owned pages rather than `manus.im/app-auth`. The split layout shows the approved workplace image on the left and the credential form on the right. Login shows the email field, password field with eye control, pilot-disabled state, recovery link, and OAuth fallback. Registration shows full name, email, account type selection, and the same password-control pattern. No Admin registration option is exposed.


## 9. Current-state addendum — 23 Agosti 2026

Baada ya pilot kuidhinishwa na owner, Kazipoa sasa ina custom email/password flow inayofanya kazi kwa `CustomAuth` pages na protected tRPC procedures. Feature flag inasomwa na `parseCustomAuthEnabled()` ndani ya `server/_core/env.ts`: thamani ya `true` huwezesha pilot, `false` huizima, na thamani ikiwa haijawekwa huendelea kuwezesha pilot hii iliyoidhinishwa kwa sababu Secrets card ya Management UI haikubali kuhifadhi value. Hii ni **default ya pilot ya sasa**, si ruhusa ya kuweka credentials kwenye source code.

OAuth bado ipo kama fallback iliyo wazi kwenye login page na haijafutwa. Registration ya kawaida haiwezi kutengeneza Admin; role ya Admin ilihamishwa kwa utaratibu wa database na account mpya ya custom email imefungwa kwa jina la owner **Brian Abesiga Enock**. Ujumbe wa login unabaki generic ili usifichue kama email ipo. Password inahifadhiwa kama scrypt hash, si plaintext; sessions ni server-side, tokens zinahashiwa, na rate limits pamoja na token expiry/replay protection zinaendelea kutumika.

### Rollback ya pilot

Kuweka `KAZIPOA_CUSTOM_AUTH_ENABLED=false` kwenye environment kunazima custom registration/login/reset routes bila kufuta credentials au kuvunja OAuth. Baada ya rollback, Admin anaweza kutumia OAuth fallback mpaka pilot ikaguliwe tena. Usibadilishe `users.id`, usifute portfolio/CV/vacancy/application/payment records, na usitumie password kwenye logs, URLs, localStorage, au support tickets.

### Evidence ya sasa

- New Admin email: `infokazipoasupport@gmail.com`; display name: `Brian Abesiga Enock`.
- Former email `brianenock20@gmail.com` is no longer an Admin and its custom login was rejected in the browser validation.
- New Admin custom login reached the protected Admin control center.
- Focused flag and auth UI tests are present; complete project validation passed with 99 Vitest tests, TypeScript, and production build.
