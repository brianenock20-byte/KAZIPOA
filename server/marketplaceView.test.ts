import { describe, expect, it } from "vitest";
import { filterAndSortCompanies, filterAndSortSavedVacancies, filterUnreadNotifications, groupApplicationTimeline, markAllNotificationsRead, markAllReadButtonState, metricDestination, notificationEmptyLabel, rememberRecentSearches, savedVacancyPagination, unreadNotificationCount, vacancyNotificationUrl, vacancyShareTargets, vacancyShareUrl } from "../shared/marketplaceView";

describe("marketplace interaction helpers", () => {
  it("filters notification alerts to unread items", () => {
    const alerts = [{ id: 1, readAt: null }, { id: 2, readAt: new Date() }];
    expect(filterUnreadNotifications(alerts, true).map(alert => alert.id)).toEqual([1]);
    expect(filterUnreadNotifications(alerts, false)).toHaveLength(2);
  });

  it("groups history under the actual application IDs", () => {
    const applications = [{ applicationId: 41, title: "Legal Officer" }, { applicationId: 42, title: "Planner" }];
    const history = [{ applicationId: 41, nextStatus: "reviewing", note: "Strong application", interviewAt: new Date("2026-09-10T09:00:00Z") }, { applicationId: 42, nextStatus: "shortlisted" }];
    const grouped = groupApplicationTimeline(applications, history);
    expect(grouped[0].application.applicationId).toBe(41);
    expect(grouped[0].items[0].nextStatus).toBe("reviewing");
    expect(grouped[0].items[0].note).toBe("Strong application");
    expect(grouped[0].items[0].interviewAt).toEqual(new Date("2026-09-10T09:00:00Z"));
    expect(grouped[1].items[0].nextStatus).toBe("shortlisted");
  });

  it("marks every unread alert as read without changing existing read timestamps", () => {
    const existingReadAt = new Date("2026-08-01T00:00:00.000Z");
    const markedAt = new Date("2026-08-21T00:00:00.000Z");
    const result = markAllNotificationsRead([{ id: 1, readAt: null }, { id: 2, readAt: existingReadAt }], markedAt);
    expect(result[0].readAt).toBe(markedAt);
    expect(result[1].readAt).toBe(existingReadAt);
  });

  it("filters companies by region and industry, then sorts by open roles", () => {
    const companies = [{ name: "A", location: "Arusha", industry: "Technology", jobs: 1 }, { name: "B", location: "Dar es Salaam", industry: "Technology", jobs: 3 }, { name: "C", location: "Dar es Salaam", industry: "Legal", jobs: 2 }];
    expect(filterAndSortCompanies(companies, "Dar es Salaam", "Technology", "roles-high").map(company => company.name)).toEqual(["B"]);
    expect(filterAndSortCompanies(companies, "All regions", "All industries", "roles-low").map(company => company.name)).toEqual(["A", "C", "B"]);
    expect(filterAndSortCompanies(companies, "All regions", "All industries", "name", "dar es salaam").map(company => company.name)).toEqual(["B", "C"]);
  });

  it("organizes saved vacancies by keyword, region, and sort mode", () => {
    const jobs = [
      { title: "Legal Officer", company: "Azania", category: "Law", location: "Dar es Salaam", deadline: "2026-09-20", savedAt: "2026-08-21T10:00:00Z" },
      { title: "Frontend Engineer", company: "Kijani", category: "Technology", location: "Arusha", deadline: "2026-08-25", savedAt: "2026-08-22T10:00:00Z" },
    ];
    expect(filterAndSortSavedVacancies(jobs, "legal", "All regions", "title").map(job => job.title)).toEqual(["Legal Officer"]);
    expect(filterAndSortSavedVacancies(jobs, "", "All regions", "deadline").map(job => job.title)).toEqual(["Frontend Engineer", "Legal Officer"]);
    expect(filterAndSortSavedVacancies(jobs, "", "Arusha", "recent").map(job => job.company)).toEqual(["Kijani"]);
  });

  it("maintains bounded recent Saved jobs search chips", () => {
    expect(rememberRecentSearches(["Legal", "Finance"], " legal ", 5)).toEqual(["legal", "Finance"]);
    expect(rememberRecentSearches(["A", "B", "C"], "D", 3)).toEqual(["D", "A", "B"]);
  });

  it("counts unread notifications for the bell badge", () => {
    expect(unreadNotificationCount([{ readAt: null }, { readAt: new Date() }, { readAt: undefined }])).toBe(2);
    expect(unreadNotificationCount([])).toBe(0);
  });

  it("calculates Saved jobs pagination and read-all button states", () => {
    expect(savedVacancyPagination(25, 1, 12)).toEqual({ page: 1, pages: 3, hasPrevious: false, hasNext: true });
    expect(savedVacancyPagination(25, 9, 12)).toEqual({ page: 3, pages: 3, hasPrevious: true, hasNext: false });
    expect(markAllReadButtonState(2, false)).toEqual({ disabled: false, label: "Mark all read" });
    expect(markAllReadButtonState(0, false)).toEqual({ disabled: true, label: "Mark all read" });
    expect(markAllReadButtonState(2, true)).toEqual({ disabled: true, label: "Marking…" });
  });

  it("builds direct notification vacancy links and filtered empty labels", () => {
    expect(vacancyNotificationUrl("https://kazipoa.co.tz/", 17)).toBe("https://kazipoa.co.tz/vacancies/17");
    expect(notificationEmptyLabel(true, 0)).toBe("No unread notifications.");
    expect(notificationEmptyLabel(false, 0)).toBe("No notifications yet.");
    expect(notificationEmptyLabel(true, 1)).toBeNull();
  });

  it("builds share URLs without duplicate slashes and preserves vacancy IDs", () => {
    expect(vacancyShareUrl("https://kazipoa.co.tz/", 42)).toBe("https://kazipoa.co.tz/vacancies/42");
    expect(vacancyShareUrl("https://kazipoa.co.tz", "legal role")).toBe("https://kazipoa.co.tz/vacancies/legal%20role");
  });

  it("builds social share targets for the exact vacancy URL", () => {
    const targets = vacancyShareTargets("https://kazipoa.co.tz/", 42, "Frontend Engineer", "Kijani Labs");
    expect(targets.url).toBe("https://kazipoa.co.tz/vacancies/42");
    expect(targets.whatsapp).toContain("wa.me/?text=");
    expect(decodeURIComponent(targets.whatsapp)).toContain("Frontend Engineer at Kijani Labs");
    expect(targets.facebook).toContain("sharer/sharer.php?u=https%3A%2F%2Fkazipoa.co.tz%2Fvacancies%2F42");
    expect(targets.x).toContain("twitter.com/intent/tweet");
    expect(decodeURIComponent(targets.x)).toContain("kazipoa.co.tz/vacancies/42");
  });

  it("keeps public companies discoverable while gating private vacancies", () => {
    expect(metricDestination("companies", false)).toBe("companies");
    expect(metricDestination("vacancies", false)).toBe("register");
    expect(metricDestination("vacancies", true)).toBe("vacancies");
    expect(metricDestination("applications", true)).toBe("dashboard");
  });
});
