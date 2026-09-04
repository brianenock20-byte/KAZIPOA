export default function AcceptedPaymentMethods() {
  return <section className="payment-methods-panel employer-accepted-payment-methods" aria-labelledby="accepted-payment-methods-title">
    <div>
      <p className="eyebrow">ACCEPTED PAYMENT METHODS</p>
      <h3 id="accepted-payment-methods-title">Pay through a channel available to you.</h3>
      <p>Employer payments use manual confirmation. Choose your available mobile-money or bank channel, then submit the transaction reference and receipt for Admin review.</p>
    </div>
    <div className="payment-method-badges" aria-label="Accepted payment channels">
      <span className="payment-method-logo"><b>M-Pesa</b><small>Lipa Namba</small></span>
      <span className="payment-method-logo"><b>Airtel Money</b><small>Mobile money</small></span>
      <span className="payment-method-logo"><b>Mixx by Yas</b><small>Tigo Pesa</small></span>
      <span className="payment-method-logo"><b>HaloPesa</b><small>Mobile money</small></span>
      <span className="payment-method-logo"><b>CRDB Bank</b><small>Lipa Namba</small></span>
    </div>
  </section>;
}
