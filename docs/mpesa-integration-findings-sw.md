# M-Pesa Integration Findings — Kazipoa

## Muhtasari

M-Pesa Developer Portal ya Vodacom inaeleza kuwa APIs zake zinajumuisha **Customer-to-Business (C2B)**, **reversals**, na **transaction-status queries**. Ili kutumia API, Kazipoa inahitaji developer account, API key, public key, application/service configuration, sandbox testing, na mchakato wa Vodacom wa ku-review na kupeleka integration live. [1]

Vodacom Tanzania pia inaeleza kuwa M-Pesa Business Collection Account humwezesha mteja kulipa na kampuni kupokea fedha, na kwamba huduma ya C2B ina uthibitisho wa hatua nyingi, usalama wa HTTPS/encryption, na real-time transaction processing. [2]

## Maana kwa Kazipoa

Mfumo haupaswi kubadilisha payment kuwa `successful` kutokana na button ya browser, receipt upload, au reference iliyowekwa na Employer pekee. Uthibitisho unatakiwa kutoka kwenye server-side provider response/callback inayolingana na order ya Kazipoa, kiasi cha TZS, merchant/account, na transaction reference. Callback inapaswa kuwa idempotent, authenticated, na kuweka audit trail.

## Kinachohitajika kabla ya automatic confirmation

| Mahitaji | Hali |
|---|---|
| M-Pesa business collection/C2B account | Inahitajika kutoka Vodacom |
| Developer portal account and application | Inahitajika |
| API key and public key/credentials | Inahitajika kama secrets za server |
| Sandbox callback/transaction-status testing | Inahitajika kabla ya production |
| Production callback URL na provider approval | Inahitajika |
| Signed/authenticated callback validation | Lazima iwe implemented |
| SMS provider credentials kwa urgent alerts | Bado hazijapewa |

## References

[1] [M-Pesa Developers – Official Business INFO Portal](https://business.m-pesa.com/developers/)

[2] [Vodacom Tanzania – M-Pesa for Business](https://vodacom.co.tz/vodacom-business/11/Mpesaforbus)

[3] [Vodacom Tanzania – Business Payment Overview](https://vodacom.co.tz/business-payment)
