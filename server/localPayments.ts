export type LocalPaymentMethod =
  | "mpesa"
  | "visa"
  | "mastercard"
  | "airtel_money"
  | "mixx_by_yas"
  | "halopesa"
  | "crdb_lipa_namba";

export type LocalPaymentState =
  | "initiated"
  | "pending"
  | "successful"
  | "failed"
  | "cancelled"
  | "refunded";

export type LocalPaymentOrder = {
  orderId: string;
  vacancyId: string;
  employerId: number;
  amountTzs: number;
  method: LocalPaymentMethod;
  providerReference?: string;
  state: LocalPaymentState;
};

export type PaymentCallback = {
  orderId: string;
  providerReference: string;
  state: Exclude<LocalPaymentState, "initiated" | "pending">;
  amountTzs: number;
  signature?: string;
};

export interface LocalPaymentProvider {
  createPayment(order: LocalPaymentOrder): Promise<{ checkoutUrl?: string; providerReference?: string; state: "pending" }>;
  verifyPayment(orderId: string): Promise<LocalPaymentState>;
  verifyCallback(callback: PaymentCallback, rawBody: string): Promise<boolean>;
}

/**
 * Configuration contract for a licensed provider such as Vodacom M-Pesa,
 * ClickPesa, Beem, or another merchant gateway. Secrets must come from the
 * project environment; never put PINs, CVVs, or API secrets in the client.
 */
export type LocalPaymentConfig = {
  providerName: string;
  apiBaseUrl: string;
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  callbackUrl: string;
};

export const publicPaymentMethods: Array<{ id: LocalPaymentMethod; label: string; priority: number }> = [
  { id: "mpesa", label: "M-Pesa", priority: 1 },
  { id: "visa", label: "Visa", priority: 2 },
  { id: "mastercard", label: "Mastercard", priority: 3 },
  { id: "airtel_money", label: "Airtel Money", priority: 4 },
  { id: "mixx_by_yas", label: "Mixx by Yas / Tigo Pesa", priority: 5 },
  { id: "halopesa", label: "HaloPesa", priority: 6 },
  { id: "crdb_lipa_namba", label: "CRDB / Lipa Namba", priority: 7 },
];

export function canPublishVacancy(paymentState: LocalPaymentState, adminApproved: boolean, employerVerified: boolean) {
  return paymentState === "successful" && adminApproved && employerVerified;
}
