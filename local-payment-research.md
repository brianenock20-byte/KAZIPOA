# Tanzania-local payment research

ClickPesa documents support for Airtel Money, HaloPesa, M-Pesa, and Mixx by Yas (formerly Tigo Pesa), with collection and payout capabilities. Beem documents a Tanzania mobile-money collection API with transaction callbacks and reporting. CRDB describes Lipa Hapa, an online payment gateway and TANQR/Lipa Namba options that can accept mobile-money and bank-linked payments. MalipoPay advertises a unified API for M-Pesa, Mixx by Yas, Airtel Money, Halotel, TTCL Pesa, CRDB Bank, NMB Bank, USSD, and bank payments.

Recommended architecture: integrate one licensed aggregator first, rather than five separate MNO APIs. Keep a provider adapter interface with methods for createPayment, verifyPayment, and handleCallback. Expose mobile-money choices to employers as M-Pesa, Airtel Money, Mixx by Yas/Tigo Pesa, HaloPesa, and CRDB Bank/QR or bank payment. Keep transaction states initiated, pending, successful, failed, cancelled, and refunded. Store provider transaction IDs and vacancy/employer references, never PINs or wallet credentials. Do not claim a specific provider is selected until the project owner completes commercial onboarding and supplies API credentials.

Sources:
- https://clickpesa.com/payment-gateway/payment-and-payout-methods/
- https://crdbbank.co.tz/en/for-business/ways-to-bank/crdb-lipa-hapa
- https://beem.africa/mobile-payments-api/
- https://malipopay.co.tz/
