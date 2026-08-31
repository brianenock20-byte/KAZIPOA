export const TEST_VACANCY_BATCH_ID = "KAZIPOA_PRELAUNCH_TEST_001";
export const TEST_VACANCY_LABEL = "🧪 TEST VACANCY";
export const TEST_VACANCY_EXPLANATION =
  "Imported for pre-launch platform testing. Employer authorization for Kazipoa publication has not been confirmed.";
export const TEST_VACANCY_SOURCE_TYPE = "external_test";

export type TestVacancyLike = {
  isTest?: number | boolean | null;
  testBatchId?: string | null;
  publicationStatus?: string | null;
  employerAuthorized?: number | boolean | null;
  externalApplicationUrl?: string | null;
  sourceUrl?: string | null;
};

export function isTestVacancy(vacancy: TestVacancyLike) {
  return (vacancy.isTest === 1 || vacancy.isTest === true) && vacancy.testBatchId === TEST_VACANCY_BATCH_ID;
}

export function vacancyApplicationMode(vacancy: TestVacancyLike) {
  return isTestVacancy(vacancy) ? "external" : "internal";
}

export function vacancyApplicationUrl(vacancy: TestVacancyLike) {
  return vacancy.externalApplicationUrl || vacancy.sourceUrl || null;
}

export function vacancyCanBeIndexed(vacancy: TestVacancyLike) {
  return !isTestVacancy(vacancy);
}

export function vacancyIsAuthorized(vacancy: TestVacancyLike) {
  return vacancy.employerAuthorized !== 0 && vacancy.employerAuthorized !== false && !isTestVacancy(vacancy);
}
