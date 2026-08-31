export type VacancyPreviewInput = {
  company: string;
  title: string;
  category: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  education: string;
  skills: string;
  deadline: string;
  tierLabel?: string;
  tierAmount?: number;
  tier?: string;
  description: string;
};

export type VacancyPreviewDraft = VacancyPreviewInput & {
  tierLabel: string;
  tierAmount: number;
  urgent: boolean;
};

export function buildVacancyPreviewDraft(input: VacancyPreviewInput): VacancyPreviewDraft {
  return {
    ...input,
    tierLabel: input.tierLabel || "Basic vacancy",
    tierAmount: input.tierAmount ?? 10000,
    urgent: input.tier === "urgent",
  };
}
