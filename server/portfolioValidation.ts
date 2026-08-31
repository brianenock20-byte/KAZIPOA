export function validateEducationPeriod(startYear?: number, endYear?: number, currentlyStudying = false) {
  if (startYear !== undefined && endYear !== undefined && endYear < startYear) {
    throw new Error("Education end year cannot be before start year");
  }
  if (currentlyStudying && endYear !== undefined) {
    throw new Error("Currently studying records should not have an end year");
  }
}

export function normalizePortfolioOptional(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
