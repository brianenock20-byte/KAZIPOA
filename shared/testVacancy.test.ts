import { describe, expect, it } from "vitest";
import { TEST_VACANCY_BATCH_ID, TEST_VACANCY_LABEL, isTestVacancy, vacancyApplicationMode, vacancyApplicationUrl, vacancyCanBeIndexed, vacancyIsAuthorized } from "./testVacancy";

describe("pre-launch test vacancy safety rules", () => {
  const testVacancy = { isTest: 1, testBatchId: TEST_VACANCY_BATCH_ID, employerAuthorized: 0, sourceUrl: "https://source.example/job/1", externalApplicationUrl: "https://source.example/apply/1" };

  it("recognizes only the exact flagged batch", () => {
    expect(isTestVacancy(testVacancy)).toBe(true);
    expect(isTestVacancy({ ...testVacancy, testBatchId: "OTHER_BATCH" })).toBe(false);
    expect(TEST_VACANCY_LABEL).toContain("TEST VACANCY");
  });

  it("uses the original application route and is not indexable or authorized", () => {
    expect(vacancyApplicationMode(testVacancy)).toBe("external");
    expect(vacancyApplicationUrl(testVacancy)).toBe(testVacancy.externalApplicationUrl);
    expect(vacancyCanBeIndexed(testVacancy)).toBe(false);
    expect(vacancyIsAuthorized(testVacancy)).toBe(false);
  });

  it("keeps ordinary live vacancies on the normal path", () => {
    const ordinary = { isTest: 0, testBatchId: null, employerAuthorized: 1, sourceUrl: null, externalApplicationUrl: null };
    expect(isTestVacancy(ordinary)).toBe(false);
    expect(vacancyApplicationMode(ordinary)).toBe("internal");
    expect(vacancyApplicationUrl(ordinary)).toBeNull();
    expect(vacancyCanBeIndexed(ordinary)).toBe(true);
    expect(vacancyIsAuthorized(ordinary)).toBe(true);
  });
});
