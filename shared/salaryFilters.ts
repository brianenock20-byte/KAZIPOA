export const salaryRangeOptions = [
  "All salary ranges",
  "Not disclosed",
  "Under TZS 500,000",
  "TZS 500,000–1,000,000",
  "TZS 1,000,000–2,000,000",
  "Above TZS 2,000,000",
] as const;

export type SalaryRangeFilter = (typeof salaryRangeOptions)[number];

function numericSalaryValues(value: string) {
  return (value.match(/\d[\d,\.\s]*/g) ?? [])
    .map(item => Number(item.replace(/[,.\s]/g, "")))
    .filter(Number.isFinite);
}

export function salaryRangeMatches(salary: string | null | undefined, filter: SalaryRangeFilter = "All salary ranges") {
  if (filter === "All salary ranges") return true;
  const raw = salary?.trim() ?? "";
  const values = numericSalaryValues(raw);
  if (!values.length) return filter === "Not disclosed";
  if (filter === "Not disclosed") return false;
  const lower = Math.min(...values);
  const upper = Math.max(...values);
  if (filter === "Under TZS 500,000") return lower < 500_000;
  if (filter === "TZS 500,000–1,000,000") return upper >= 500_000 && lower <= 1_000_000;
  if (filter === "TZS 1,000,000–2,000,000") return upper >= 1_000_000 && lower <= 2_000_000;
  return upper >= 2_000_000;
}
