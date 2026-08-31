# Muundo wa Live Interview kwa Employer

## Lengo

Kazipoa itaonyesha live-interview control ndani ya Employer workspace pekee. Employer ataweza kuifikia baada ya application kuwekwa kwenye hali ya **Interview** na muda wa interview kuwekwa. Hii haitakiwi kuchukuliwa kama uthibitisho kwamba video call imeunganishwa tayari.

## Mipaka ya usalama

| Kanuni | Utekelezaji |
|---|---|
| Employer-only | Entry point inaonekana ndani ya Employer workspace na server procedure inapaswa kutumia `employerProcedure`. |
| Candidate ownership | Employer anaweza kuhusisha interview na application iliyo chini ya vacancy yake tu. |
| Scheduled interview prerequisite | Live room haiwezi kuanzishwa bila application kuwa kwenye interview workflow na kuwa na muda halali. |
| Provider prerequisite | Video room haianzishwi kwa link ya kubahatisha. Provider halisi, credentials, signaling, access tokens, na webhook/status callbacks vinahitajika. |
| No public exposure | Room identifier, join token, au meeting link haitakiwi kuonekana kwenye public jobs pages. |
| Auditability | Create/start/end actions zitahifadhiwa kwenye audit trail wakati provider halisi itaunganishwa. |

## Hali za room

`not_configured` ndiyo hali ya sasa ya UI. Hali zitakazotumika baada ya provider kuunganishwa ni `scheduled`, `ready`, `live`, `ended`, na `cancelled`.

## Hatua inayofuata ya production

Kuchagua video provider anayetoa authenticated room creation, employer/candidate join permissions, expiring tokens, server-side webhooks, recording policy, data-retention controls, na Tanzania-appropriate privacy terms. Baada ya hapo schema ya interview sessions na provider callback zitaongezwa, kisha zitatestwa sandbox kabla ya production.

Kwa sasa UI inatoa taarifa ya wazi kwamba provider setup inahitajika; haisemi kwamba live stream imeanza na haitengenezi fake meeting link.
