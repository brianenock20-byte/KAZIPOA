export default function AcceptedPaymentMethods() {
  return <section className="payment-methods-panel employer-accepted-payment-methods" aria-labelledby="accepted-payment-methods-title">
    <div>
      <p className="eyebrow">ACCEPTED PAYMENT METHODS</p>
      <h3 id="accepted-payment-methods-title">Pay through a channel available to you.</h3>
      <p>Employer payments use manual confirmation. Choose your available mobile-money or bank channel, then submit the transaction reference and receipt for Admin review.</p>
    </div>
    <div className="payment-method-badges" aria-label="Accepted payment channels">
      <span className="payment-method-logo"><img src="/manus-storage/mpesa_3ec60d65.png" alt="M-Pesa / Lipa Namba" /></span>
      <span className="payment-method-logo"><img src="/manus-storage/airtel-money_d5ad5319.png" alt="Airtel Money" /></span>
      <span className="payment-method-logo"><img src="/manus-storage/tigo-pesa_68d7c7d1.jpg" alt="Tigo Pesa" /></span>
      <span className="payment-method-logo"><b>HaloPesa</b><small>Mobile money</small></span>
      <span className="payment-method-logo"><img src="/manus-storage/crdb_5f9e10a4.png" alt="CRDB Bank" /></span>
    </div>
  </section>;
}
