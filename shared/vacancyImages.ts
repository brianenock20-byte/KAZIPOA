export type VacancyImageKey =
  | "finance"
  | "technology"
  | "healthcare"
  | "hospitality"
  | "operations"
  | "marketing"
  | "legal"
  | "education"
  | "agriculture"
  | "engineering"
  | "business"
  | "internship";

type VacancyImageRule = {
  key: VacancyImageKey;
  categories: string[];
  keywords: string[];
};

const vacancyImageRules: VacancyImageRule[] = [
  { key: "finance", categories: ["accounting & finance", "finance", "banking"], keywords: ["accountant", "accounting", "finance", "audit", "auditor", "bank", "treasury", "payroll", "credit"] },
  { key: "technology", categories: ["it & cybersecurity", "technology", "information technology"], keywords: ["software", "developer", "programmer", "cybersecurity", "cyber security", "data analyst", "network", "systems administrator", "web developer"] },
  { key: "healthcare", categories: ["healthcare", "medical"], keywords: ["health", "medical", "clinic", "nurse", "doctor", "pharmacist", "laboratory", "clinical"] },
  { key: "hospitality", categories: ["hospitality", "tourism"], keywords: ["hotel", "hospitality", "restaurant", "tourism", "chef", "front office", "housekeeping", "waiter"] },
  { key: "operations", categories: ["logistics & transport", "operations"], keywords: ["logistics", "transport", "warehouse", "supply chain", "operations", "driver", "fleet", "procurement"] },
  { key: "marketing", categories: ["marketing & sales", "sales", "communications"], keywords: ["marketing", "sales", "communications", "social media", "brand", "digital marketing", "business development"] },
  { key: "legal", categories: ["law & legal services", "legal"], keywords: ["lawyer", "legal", "advocate", "paralegal", "compliance", "litigation", "conveyancing"] },
  { key: "education", categories: ["education", "teaching"], keywords: ["teacher", "teaching", "education", "school", "lecturer", "trainer", "tutor", "academic"] },
  { key: "agriculture", categories: ["agriculture", "agribusiness"], keywords: ["agriculture", "farmer", "farm", "agronomist", "agribusiness", "livestock", "horticulture", "crops"] },
  { key: "engineering", categories: ["engineering", "construction"], keywords: ["engineer", "engineering", "construction", "civil", "electrical", "mechanical", "architect", "quantity surveyor"] },
  { key: "business", categories: ["business & admin", "business administration", "administration", "human resources"], keywords: ["business", "administration", "administrator", "office manager", "human resources", "hr officer", "receptionist", "executive assistant"] },
  { key: "internship", categories: ["internships", "internship", "graduate trainee"], keywords: ["intern", "internship", "graduate trainee", "entry level", "attachment"] },
];

export function resolveVacancyImageKey(input: { category?: string | null; title?: string | null; description?: string | null }): VacancyImageKey {
  const category = (input.category ?? "").trim().toLowerCase();
  const categorySegments = category.split(/[;,|/]+/).map(segment => segment.trim()).filter(Boolean);
  const text = `${input.title ?? ""} ${input.description ?? ""}`.toLowerCase();
  const primaryCategory = categorySegments[0] ?? "";
  const primaryCategoryRule = vacancyImageRules.find(candidate => candidate.categories.some(label => primaryCategory.includes(label)));
  const broaderCategoryRule = vacancyImageRules.find(candidate => candidate.categories.some(label => category.includes(label)));
  const keywordRule = vacancyImageRules.find(candidate => candidate.keywords.some(keyword => text.includes(keyword)));
  return (primaryCategoryRule ?? broaderCategoryRule ?? keywordRule)?.key ?? "business";
}

export function vacancyCategorySearchTerms(selectedCategory: string | null | undefined): string[] {
  const selected = (selectedCategory ?? "").trim().toLowerCase();
  if (!selected || selected === "all categories") return [];
  const family = resolveVacancyImageKey({ category: selected });
  const rule = vacancyImageRules.find(candidate => candidate.key === family);
  return Array.from(new Set([selected, ...(rule?.categories ?? [])])).filter(Boolean);
}

export function vacancyCategoryMatches(vacancyCategory: string | null | undefined, selectedCategory: string | null | undefined): boolean {
  const selected = (selectedCategory ?? "").trim().toLowerCase();
  const vacancy = (vacancyCategory ?? "").trim().toLowerCase();
  if (!selected || selected === "all categories") return true;
  if (!vacancy) return false;
  if (vacancy.includes(selected) || selected.includes(vacancy)) return true;
  const selectedSegments = selected.split(/[;,|/]+/).map(segment => segment.trim()).filter(Boolean);
  const vacancySegments = vacancy.split(/[;,|/]+/).map(segment => segment.trim()).filter(Boolean);
  if (selectedSegments.some(selectedSegment => vacancySegments.some(vacancySegment => vacancySegment === selectedSegment || vacancySegment.includes(selectedSegment) || selectedSegment.includes(vacancySegment)))) return true;
  return resolveVacancyImageKey({ category: selected }) === resolveVacancyImageKey({ category: vacancy });
}
