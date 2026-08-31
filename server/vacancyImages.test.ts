import { describe, expect, it } from "vitest";
import { resolveVacancyImageKey, vacancyCategoryMatches, vacancyCategorySearchTerms } from "@shared/vacancyImages";

describe("resolveVacancyImageKey", () => {
  it("prioritizes an exact category match over unrelated description words", () => {
    expect(resolveVacancyImageKey({
      category: "Healthcare",
      title: "Clinic Operations Coordinator",
      description: "Coordinate hospital finance reporting and procurement.",
    })).toBe("healthcare");
  });

  it.each([
    ["Accounting & Finance", "finance"],
    ["IT & Cybersecurity", "technology"],
    ["Marketing & Sales", "marketing"],
    ["Business & Admin", "business"],
    ["Law & Legal Services", "legal"],
    ["Healthcare", "healthcare"],
    ["Engineering", "engineering"],
    ["Construction", "engineering"],
    ["Hospitality", "hospitality"],
    ["Logistics & Transport", "operations"],
    ["Education", "education"],
    ["Agriculture", "agriculture"],
    ["Internships", "internship"],
  ])("maps %s to the relevant image family", (category, expected) => {
    expect(resolveVacancyImageKey({ category })).toBe(expected);
  });

  it("uses the primary category in a multi-label category string", () => {
    expect(resolveVacancyImageKey({ category: "Sales & Retail; Management; Business Operations", title: "Deputy Sales Manager", description: "Lead a sales team and drive business growth." })).toBe("marketing");
  });

  it("uses title and description keywords when the category is not standardized", () => {
    expect(resolveVacancyImageKey({ category: "Other", title: "Digital Marketing Officer", description: "Manage social media campaigns." })).toBe("marketing");
    expect(resolveVacancyImageKey({ category: "Other", title: "Graduate Trainee", description: "Learn from an experienced team." })).toBe("internship");
  });

  it("uses a business-workspace fallback instead of an unrelated specialist image", () => {
    expect(resolveVacancyImageKey({ category: "Other", title: "General Office Support", description: "Assist the team with daily coordination." })).toBe("business");
  });

  it("matches related category labels used by real vacancies", () => {
    expect(vacancyCategoryMatches("Sales & Retail; Management; Business Operations", "Marketing & Sales")).toBe(true);
    expect(vacancyCategoryMatches("Construction", "Engineering")).toBe(true);
    expect(vacancyCategoryMatches("Healthcare", "Education")).toBe(false);
  });

  it("produces stable backend search terms for a selected category family", () => {
    expect(vacancyCategorySearchTerms("Marketing & Sales")).toContain("sales");
    expect(vacancyCategorySearchTerms("All categories")).toEqual([]);
  });
});
