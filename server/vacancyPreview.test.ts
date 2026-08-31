import { describe, expect, it } from "vitest";
import { buildVacancyPreviewDraft } from "@shared/vacancyPreview";

describe("vacancy preview draft", () => {
  it("keeps current form data and derives urgent tier state", () => {
    const draft = buildVacancyPreviewDraft({ company: "Test Company", title: "Sales Manager", category: "Sales & Retail", location: "Dar es Salaam", type: "Full-time", salary: "TZS 1,500,000", experience: "3–5 years", education: "Degree", skills: "Sales, CRM", deadline: "2026-09-30", tier: "urgent", tierAmount: 30000, tierLabel: "Urgent vacancy", description: "Lead the sales team and grow customer relationships." });
    expect(draft.title).toBe("Sales Manager");
    expect(draft.urgent).toBe(true);
    expect(draft.tierAmount).toBe(30000);
    expect(draft.skills).toBe("Sales, CRM");
  });

  it("uses honest non-published defaults when tier metadata is absent", () => {
    const draft = buildVacancyPreviewDraft({ company: "Test Company", title: "Accountant", category: "Finance & Accounting", location: "Arusha", type: "Full-time", salary: "Negotiable", experience: "1–2 years", education: "Degree", skills: "", deadline: "", description: "Prepare monthly financial reports." });
    expect(draft.tierLabel).toBe("Basic vacancy");
    expect(draft.tierAmount).toBe(10000);
    expect(draft.urgent).toBe(false);
  });
});
