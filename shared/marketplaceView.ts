export function filterUnreadNotifications<T extends { readAt: unknown }>(notifications: T[], unreadOnly: boolean) {
  return unreadOnly ? notifications.filter(notification => !notification.readAt) : notifications;
}

export function groupApplicationTimeline<A extends { applicationId: number }, H extends { applicationId: number }>(applications: A[], history: H[]) {
  return applications.map(application => ({ application, items: history.filter(item => item.applicationId === application.applicationId) }));
}

export type SeekerApplicationRecord = { applicationId: number; status?: string | null; title?: string | null; company?: string | null; location?: string | null; interviewAt?: Date | string | null; interviewNote?: string | null; interviewResponse?: "pending" | "accepted" | "declined" | null };
export type SeekerApplicationHistoryRecord = { applicationId: number; nextStatus?: string | null; interviewAt?: Date | string | null; createdAt?: Date | string | null; note?: string | null };

export function summarizeSeekerApplicationStatuses(applications: SeekerApplicationRecord[], history: SeekerApplicationHistoryRecord[]) {
  const shortlistStatuses = new Set(["shortlisted", "interview", "offered", "hired"]);
  const interviewStatuses = new Set(["interview", "offered", "hired"]);
  const shortlisted: Array<SeekerApplicationRecord & { status: string }> = [];
  const interviews: Array<SeekerApplicationRecord & { status: string; interviewAt: Date | string | null; note: string | null; response: "pending" | "accepted" | "declined" }> = [];

  applications.forEach(application => {
    const applicationHistory = history.filter(item => item.applicationId === application.applicationId);
    const status = String(application.status ?? "submitted").toLowerCase();
    const latestInterview = applicationHistory
      .filter(item => item.interviewAt)
      .sort((a, b) => new Date(b.createdAt ?? b.interviewAt ?? 0).getTime() - new Date(a.createdAt ?? a.interviewAt ?? 0).getTime())[0];
    const scheduledAt = application.interviewAt ?? latestInterview?.interviewAt ?? null;
    const hasShortlistSignal = shortlistStatuses.has(status) || applicationHistory.some(item => shortlistStatuses.has(String(item.nextStatus ?? "").toLowerCase()));
    const hasInterviewSignal = interviewStatuses.has(status) || applicationHistory.some(item => interviewStatuses.has(String(item.nextStatus ?? "").toLowerCase())) || Boolean(scheduledAt);

    if (hasShortlistSignal) shortlisted.push({ ...application, status });
    if (hasInterviewSignal) interviews.push({ ...application, status, interviewAt: scheduledAt, note: application.interviewNote ?? latestInterview?.note ?? null, response: application.interviewResponse ?? "pending" });
  });

  return { shortlisted, interviews };
}

export type InterviewScheduleFilter = "upcoming" | "past";

export function filterSeekerInterviews<T extends { interviewAt?: Date | string | null }>(interviews: T[], filter: InterviewScheduleFilter, now = new Date()) {
  const nowMs = now.getTime();
  return interviews.filter(interview => {
    const interviewMs = interview.interviewAt ? new Date(interview.interviewAt).getTime() : Number.POSITIVE_INFINITY;
    return filter === "upcoming" ? interviewMs >= nowMs : interviewMs < nowMs;
  });
}

export function markAllNotificationsRead<T extends { readAt: unknown }>(notifications: T[], readAt = new Date()) {
  return notifications.map(notification => notification.readAt ? notification : { ...notification, readAt });
}

export type CompanyDirectoryItem = { name: string; location: string; industry: string; jobs: number };

export function filterAndSortCompanies<T extends CompanyDirectoryItem>(companies: T[], region: string, industry: string, sort: "roles-high" | "roles-low" | "name", keyword = "") {
  const query = keyword.trim().toLowerCase();
  return companies.filter(company => (region === "All regions" || company.location === region) && (industry === "All industries" || company.industry === industry) && (!query || `${company.name} ${company.location} ${company.industry}`.toLowerCase().includes(query))).sort((a, b) => sort === "roles-high" ? b.jobs - a.jobs : sort === "roles-low" ? a.jobs - b.jobs : a.name.localeCompare(b.name));
}

export type SavedVacancyItem = { title: string; company: string; category: string; location: string; deadline: Date | string; savedAt: Date | string };

export function filterAndSortSavedVacancies<T extends SavedVacancyItem>(items: T[], keyword: string, region: string, sort: "recent" | "deadline" | "title") { const query = keyword.trim().toLowerCase(); return [...items].filter(item => (region === "All regions" || item.location === region) && (!query || `${item.title} ${item.company} ${item.category} ${item.location}`.toLowerCase().includes(query))).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "deadline" ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime() : new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()); }

export function vacancyShareUrl(origin: string, vacancyId: string | number) { return `${origin.replace(/\/$/, "")}/vacancies/${encodeURIComponent(String(vacancyId))}`; }
export function vacancyShareTargets(origin: string, vacancyId: string | number, title: string, company: string) { const url = vacancyShareUrl(origin, vacancyId); const message = `View this vacancy on Kazipoa: ${title} at ${company}`; return { url, whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`, facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}` }; }
export function vacancyNotificationUrl(origin: string, vacancyId: string | number) { return vacancyShareUrl(origin, vacancyId); }
export function notificationEmptyLabel(unreadOnly: boolean, visibleCount: number) { return visibleCount ? null : unreadOnly ? "No unread notifications." : "No notifications yet."; }
export function savedVacancyPagination(total: number, page: number, pageSize: number) { const safePageSize = Math.max(1, pageSize); const safeTotal = Math.max(0, total); const pages = Math.max(1, Math.ceil(safeTotal / safePageSize)); const safePage = Math.min(Math.max(1, page), pages); return { page: safePage, pages, hasPrevious: safePage > 1, hasNext: safePage < pages }; }
export function markAllReadButtonState(unreadCount: number, pending: boolean) { return { disabled: pending || unreadCount === 0, label: pending ? "Marking…" : "Mark all read" }; }
export function unreadNotificationCount<T extends { readAt?: Date | string | null }>(notifications: T[]) { return notifications.reduce((count, notification) => count + (notification.readAt ? 0 : 1), 0); }
export function rememberRecentSearches(existing: string[], term: string, limit = 5) { const normalized = term.trim(); if (!normalized) return existing.slice(0, limit); return [normalized, ...existing.filter(search => search.toLowerCase() !== normalized.toLowerCase())].slice(0, limit); }

export function metricDestination(metric: "vacancies" | "companies" | "applications", registered: boolean) {
  if (metric === "companies") return "companies" as const;
  if (!registered) return "register" as const;
  return metric === "applications" ? "dashboard" as const : "vacancies" as const;
}

export type InterviewResponseState = "pending" | "accepted" | "declined";

export function interviewResponseLabel(response?: InterviewResponseState | null) {
  return response === "accepted" ? "Accepted" : response === "declined" ? "Declined" : "Pending";
}

export function interviewResponseTone(response?: InterviewResponseState | null) {
  return response === "accepted" ? "accepted" : response === "declined" ? "declined" : "pending";
}
