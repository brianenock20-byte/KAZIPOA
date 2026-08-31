export type EmployerPlan = "starter" | "business" | "enterprise";

export const FREE_VACANCY_ALLOWANCE = 5;

export const PLAN_LIMITS: Record<EmployerPlan, { maxVacancies: number; maxCandidates: number }> = {
  starter: { maxVacancies: 5, maxCandidates: 50 },
  business: { maxVacancies: 20, maxCandidates: 250 },
  enterprise: { maxVacancies: 9999, maxCandidates: 9999 },
};

export function canCreateVacancy(usage: number, plan: EmployerPlan | undefined) {
  const limit = plan ? PLAN_LIMITS[plan].maxVacancies : 1;
  return usage < limit;
}

export function canManageCandidate(usage: number, plan: EmployerPlan | undefined) {
  const limit = plan ? PLAN_LIMITS[plan].maxCandidates : 10;
  return usage < limit;
}

export type VacancyPostingPolicy = {
  allowed: boolean;
  paymentRequired: boolean;
  remainingFree: number;
  message?: string;
};

export function getVacancyPostingPolicy(input: {
  usage: number;
  plan?: EmployerPlan;
  employerVerified: boolean;
  hasPaymentEvidence: boolean;
}): VacancyPostingPolicy {
  if (input.plan) {
    const allowed = canCreateVacancy(input.usage, input.plan);
    return {
      allowed,
      paymentRequired: true,
      remainingFree: 0,
      message: allowed ? undefined : "Your current employer plan has reached its vacancy limit",
    };
  }

  if (input.employerVerified && input.usage < FREE_VACANCY_ALLOWANCE) {
    return {
      allowed: true,
      paymentRequired: false,
      remainingFree: FREE_VACANCY_ALLOWANCE - input.usage,
    };
  }

  return {
    allowed: input.hasPaymentEvidence,
    paymentRequired: true,
    remainingFree: 0,
    message: input.hasPaymentEvidence ? undefined : "Payment reference and amount are required after the free allowance or before employer verification",
  };
}
