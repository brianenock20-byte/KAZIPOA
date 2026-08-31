import { describe, expect, it } from "vitest";
import { FREE_VACANCY_ALLOWANCE, PLAN_LIMITS, canCreateVacancy, canManageCandidate, getVacancyPostingPolicy } from "./subscriptionLimits";

describe("employer subscription limits", () => {
  it("defines the configured vacancy and candidate limits", () => {
    expect(PLAN_LIMITS.starter).toEqual({ maxVacancies: 5, maxCandidates: 50 });
    expect(PLAN_LIMITS.business).toEqual({ maxVacancies: 20, maxCandidates: 250 });
    expect(PLAN_LIMITS.enterprise.maxVacancies).toBeGreaterThan(1000);
  });

  it("blocks usage at the plan limit", () => {
    expect(canCreateVacancy(4, "starter")).toBe(true);
    expect(canCreateVacancy(5, "starter")).toBe(false);
    expect(canManageCandidate(49, "starter")).toBe(true);
    expect(canManageCandidate(50, "starter")).toBe(false);
  });

  it("allows five free postings only after employer verification", () => {
    expect(FREE_VACANCY_ALLOWANCE).toBe(5);
    expect(getVacancyPostingPolicy({ usage: 0, employerVerified: true, hasPaymentEvidence: false })).toMatchObject({ allowed: true, paymentRequired: false, remainingFree: 5 });
    expect(getVacancyPostingPolicy({ usage: 4, employerVerified: true, hasPaymentEvidence: false })).toMatchObject({ allowed: true, paymentRequired: false, remainingFree: 1 });
    expect(getVacancyPostingPolicy({ usage: 5, employerVerified: true, hasPaymentEvidence: false })).toMatchObject({ allowed: false, paymentRequired: true, remainingFree: 0 });
    expect(getVacancyPostingPolicy({ usage: 5, employerVerified: true, hasPaymentEvidence: true })).toMatchObject({ allowed: true, paymentRequired: true, remainingFree: 0 });
    expect(getVacancyPostingPolicy({ usage: 0, employerVerified: false, hasPaymentEvidence: false })).toMatchObject({ allowed: false, paymentRequired: true });
  });

  it("uses safe defaults without an active plan", () => {
    expect(canCreateVacancy(0, undefined)).toBe(true);
    expect(canCreateVacancy(1, undefined)).toBe(false);
    expect(canManageCandidate(9, undefined)).toBe(true);
    expect(canManageCandidate(10, undefined)).toBe(false);
  });
});
