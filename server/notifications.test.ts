import { describe, expect, it } from "vitest";
import { buildApplicationStatusNotification, buildVacancyAlertContent, normalizeSavedVacancyOrganization, vacancyAlertDeliveryChannels, vacancyMatchesAlertPreferences } from "./db";

describe("application notifications", () => {
  it("builds a clear status-change notification", () => {
    expect(buildApplicationStatusNotification("reviewing", "shortlisted")).toEqual({
      type: "application_status",
      title: "Application status updated",
      message: "Your application status changed from reviewing to shortlisted.",
    });
  });

  it("builds urgent vacancy alert content that prompts early applications", () => {
    expect(buildVacancyAlertContent({ title: "Finance Officer", company: "Azania Finance", location: "Dar es Salaam", urgent: 1 })).toEqual({
      type: "urgent_vacancy",
      title: "Urgent vacancy: apply early",
      message: "Urgent opportunity: Finance Officer at Azania Finance in Dar es Salaam. Apply as soon as possible before the deadline.",
      emailSubject: "Urgent vacancy: Finance Officer",
    });
    expect(buildVacancyAlertContent({ title: "Finance Officer", company: "Azania Finance", location: "Dar es Salaam", urgent: 0 }).type).toBe("new_vacancy_match");
  });

  it("keeps email and in-app vacancy channels independently configurable", () => {
    expect(vacancyAlertDeliveryChannels({})).toEqual({ email: true, inApp: true });
    expect(vacancyAlertDeliveryChannels({ emailVacancyAlerts: 0, inAppVacancyAlerts: 1 })).toEqual({ email: false, inApp: true });
    expect(vacancyAlertDeliveryChannels({ emailVacancyAlerts: 1, inAppVacancyAlerts: 0 })).toEqual({ email: true, inApp: false });
  });

  it("normalizes saved-job folders and tags", () => {
    expect(normalizeSavedVacancyOrganization({ folder: "  Apply soon  ", tags: "legal, , Tanzania" })).toEqual({ folder: "Apply soon", tags: "legal, Tanzania" });
    expect(normalizeSavedVacancyOrganization({ folder: "", tags: null })).toEqual({ folder: "Unsorted", tags: null });
  });

  it("supports independent keyword, region, and category alert switches", () => {
    const vacancy = { title: "Legal Officer", company: "Azania Finance", category: "Law & Legal Services", location: "Dar es Salaam", description: "Support compliance and contracts." };
    expect(vacancyMatchesAlertPreferences(vacancy, { vacancyAlertsEnabled: 1, vacancyAlertKeywordsEnabled: 0, vacancyAlertRegionsEnabled: 1, vacancyAlertCategoriesEnabled: 1, vacancyAlertKeywords: "engineering", vacancyAlertRegions: "Dar es Salaam", vacancyAlertCategories: "Law" })).toBe(true);
    expect(vacancyMatchesAlertPreferences(vacancy, { vacancyAlertsEnabled: 1, vacancyAlertKeywordsEnabled: 1, vacancyAlertRegionsEnabled: 0, vacancyAlertCategoriesEnabled: 1, vacancyAlertKeywords: "legal", vacancyAlertRegions: "Arusha", vacancyAlertCategories: "Law" })).toBe(true);
    expect(vacancyMatchesAlertPreferences(vacancy, { vacancyAlertsEnabled: 1, vacancyAlertKeywordsEnabled: 1, vacancyAlertRegionsEnabled: 1, vacancyAlertCategoriesEnabled: 0, vacancyAlertKeywords: "legal", vacancyAlertRegions: "Dar es Salaam", vacancyAlertCategories: "Technology" })).toBe(true);
  });

  it("matches a live vacancy against seeker alert criteria", () => {
    const vacancy = { title: "Legal Officer", company: "Azania Finance", category: "Law & Legal Services", location: "Dar es Salaam", description: "Support compliance and contracts." };
    expect(vacancyMatchesAlertPreferences(vacancy, { vacancyAlertsEnabled: 1, vacancyAlertKeywords: "legal, compliance", vacancyAlertRegions: "Dar es Salaam", vacancyAlertCategories: "Law" })).toBe(true);
    expect(vacancyMatchesAlertPreferences(vacancy, { vacancyAlertsEnabled: 1, vacancyAlertKeywords: "engineering", vacancyAlertRegions: "Dar es Salaam", vacancyAlertCategories: "Law" })).toBe(false);
    expect(vacancyMatchesAlertPreferences(vacancy, { vacancyAlertsEnabled: 0, vacancyAlertKeywords: "legal", vacancyAlertRegions: null, vacancyAlertCategories: null })).toBe(false);
  });
});
