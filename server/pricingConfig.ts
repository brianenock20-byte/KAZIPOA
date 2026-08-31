export const vacancyTiers = {
  basic: { id: "basic", label: "Basic vacancy", amountTzs: 10_000, description: "Standard listing for employers starting out." },
  featured: { id: "featured", label: "Featured vacancy", amountTzs: 25_000, description: "Higher visibility and featured placement." },
  premium: { id: "premium", label: "Premium vacancy", amountTzs: 50_000, description: "Priority placement plus enhanced employer visibility." },
} as const;

export const employerPlans = {
  starter: { id: "starter", label: "Starter", amountTzs: 50_000, interval: "month", description: "Multiple vacancy posts for growing teams." },
  business: { id: "business", label: "Business", amountTzs: 150_000, interval: "month", description: "Vacancy posting plus candidate-management tools." },
  enterprise: { id: "enterprise", label: "Enterprise", amountTzs: null, interval: "custom", description: "Custom pricing and a tailored hiring workflow." },
} as const;

export function getKazipoaPricingConfig() {
  return {
    paymentNumber: process.env.KAZIPOA_PAYMENT_NUMBER || "255763796723",
    basicFeeTzs: Number(process.env.KAZIPOA_POSTING_FEE_TZS || vacancyTiers.basic.amountTzs),
    vacancyTiers,
    employerPlans,
    editableAfterMarketTesting: true,
  };
}
