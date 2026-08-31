import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Admin reference dashboard design contract", () => {
  const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
  const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  const candidates = readFileSync(resolve(process.cwd(), "client/src/components/AdminActiveCandidates.tsx"), "utf8");
  const employerWorkspace = readFileSync(resolve(process.cwd(), "client/src/components/EmployerRecruitmentWorkspaces.tsx"), "utf8");
  const adminControlCenter = readFileSync(resolve(process.cwd(), "client/src/components/AdminControlCenter.tsx"), "utf8");
  const secureCvPreview = readFileSync(resolve(process.cwd(), "client/src/components/SecureCvPreview.tsx"), "utf8");
  const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

  it("keeps the dark navy workspace and reference layout tokens", () => {
    expect(css).toContain("--admin-panel: #171b3b");
    expect(css).toContain("--admin-sidebar: #121633");
    expect(css).toContain("grid-template-columns: 228px minmax(0, 1fr)");
    expect(css).toContain(".admin-console .admin-stat-grid { grid-template-columns:repeat(4,minmax(0,1fr))");
  });

  it("keeps distinct KPI color families and responsive navigation behavior", () => {
    expect(css).toContain("linear-gradient(135deg,#05bc86,#087e81)");
    expect(css).toContain("linear-gradient(135deg,#3d9bea,#2b64c9)");
    expect(css).toContain("linear-gradient(135deg,#f05272,#c93662)");
    expect(css).toContain("linear-gradient(135deg,#ffa913,#e87509)");
    expect(css).toContain(".admin-console .admin-sidebar.open { transform:translateX(0); }");
    expect(css).toContain("@media (max-width:560px) { .admin-console .admin-stat-grid { grid-template-columns:1fr; }");
  });

  it("keeps the Active Candidates workspace real-data and reference-aligned", () => {
    expect(router).toContain("activeCandidates: adminProcedure");
    expect(router).toContain("candidateDetail: adminProcedure");
    expect(router).toContain("getAdminCandidateProfile");
    expect(candidates).toContain("trpc.admin.activeCandidates.useQuery");
    expect(candidates).toContain("Active candidates");
    expect(candidates).toContain("Not assessed");
    expect(candidates).toContain("CANDIDATE DETAIL");
    expect(candidates).toContain("trpc.admin.candidateDetail.useQuery");
    for (const field of ["Vacancy", "Date & time", "Status", "Deadline", "Score"]) expect(candidates).toContain(field);
    expect(candidates).toContain('id="admin-candidates"');
    expect(home).toContain('href="#admin-candidates"');
  });

  it("aligns the Employer candidate preview with the profile/application detail treatment", () => {
    expect(home).toContain("candidate-preview-layout");
    expect(home).toContain("candidate-preview-rail");
    expect(home).toContain("candidate-preview-rail-item");
    expect(home).toContain("candidate-preview-identity");
    expect(home).toContain("candidate-preview-facts");
    expect(home).toContain("candidate-preview-security");
    expect(home).toContain("Schedule interview");
    expect(secureCvPreview).toContain("Inline preview is currently available for PDF CVs");
    expect(home).toContain("Employer-owned application access");
    expect(db).toContain("seekerName: users.name");
    expect(db).toContain("profilePhotoUrl: users.profilePhotoUrl");
    expect(db).toContain("eq(applications.employerUserId, employerUserId)");
    expect(css).toContain(".workplace-employer .candidate-preview-layout { display:grid; grid-template-columns:220px minmax(0,1fr) 220px");
    expect(css).toContain(".workplace-employer .candidate-preview-rail-item.selected");
    expect(css).toContain("@media (max-width:760px) { .workplace-employer .candidate-preview-layout { grid-template-columns:1fr; }");
  });

  it("adds truthful candidate filters, sorting, status badges, and accessible card interaction", () => {
    expect(candidates).toContain("admin-candidates-filter-grid");
    expect(candidates).toContain("vacancyFilter");
    expect(candidates).toContain("dateFilter");
    expect(candidates).toContain("sortBy");
    expect(candidates).toContain("filteredCandidates.map");
    expect(employerWorkspace).toContain("candidateVacancy");
    expect(employerWorkspace).toContain("candidateExperience");
    expect(employerWorkspace).toContain("candidateSort");
    expect(employerWorkspace).toContain("visibleCandidates");
    expect(employerWorkspace).toContain("employer-stage-badge");
    expect(employerWorkspace).toContain("statusLabels");
    expect(css).toContain(".workplace-employer .candidate-card:hover");
    expect(css).toContain(".workplace-employer .candidate-card:focus-within");
    expect(css).toContain(".workplace-admin .candidate-list-item:hover");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("keeps Job Seeker sidebar navigation readable in both workplace themes", () => {
    expect(css).toContain(".workplace-seeker .seeker-section-nav button { color:#547067; }");
    expect(css).toContain("html.dark .workplace-seeker .seeker-section-nav button { color:rgba(255,255,255,.62); }");
    expect(css).toContain(".workplace-seeker .seeker-section-nav button:hover");
  });

  it("keeps Platform Overview before Live Payment Operations", () => {
    const overviewLink = '<a href="#admin-overview">Platform overview</a>';
    const paymentLink = '<a href="#admin-payments">Live payment operations</a>';
    expect(home).toContain(overviewLink);
    expect(home).toContain(paymentLink);
    expect(home.indexOf(overviewLink)).toBeLessThan(home.indexOf(paymentLink));
    const overviewWorkspace = '<Suspense fallback={<RouteLoading label="Loading Admin workspace…" />}><section id="admin-users" className="admin-sidebar-section"><AdminControlCenter /></section></Suspense>';
    const livePayments = '<section id="admin-payments" className="admin-sidebar-section"><AdminLivePaymentPanel /></section>';
    expect(home.indexOf(overviewWorkspace)).toBeGreaterThan(-1);
    expect(home.indexOf(livePayments)).toBeGreaterThan(-1);
    expect(home.indexOf(overviewWorkspace)).toBeLessThan(home.indexOf(livePayments));
    const adminRoleGuide = '<RoleGuide role={role} />';
    const adminRoleGuideIndex = home.indexOf(adminRoleGuide, home.indexOf(overviewWorkspace));
    expect(adminRoleGuideIndex).toBeGreaterThan(home.indexOf(overviewWorkspace));
    expect(adminRoleGuideIndex).toBeLessThan(home.indexOf(livePayments));
  });

  it("matches the reference Account Management preview and full-list flow", () => {
    expect(adminControlCenter).toContain("Showing");
    expect(adminControlCenter).toContain("View all users");
    expect(adminControlCenter).toContain("Show top 5");
    expect(adminControlCenter).toContain("usersQuery.data.slice(0, 5)");
    expect(adminControlCenter).toContain("admin-user-table-head");
    expect(adminControlCenter).toContain("admin-user-role-badges");
    expect(adminControlCenter).toContain("user.accountType === \"employer\" ? \"Employer\" : \"Job seeker\"");
    expect(css).toContain(".admin-users-panel .admin-user-row { display:grid; grid-template-columns:minmax(250px,1.6fr) minmax(150px,.9fr) minmax(250px,1fr)");
    expect(css).toContain("@media (max-width:680px) {");
    expect(css).toContain(".admin-user-table-head { display:none; }");
  });

  it("keeps Platform Analytics and Support on the unified Admin navy theme", () => {
    expect(css).toContain(".workplace-admin .admin-analytics-panel,");
    expect(css).toContain(".workplace-admin .support-admin-panel { border-color:rgba(174,191,235,.14); background:#171b3b");
    expect(css).toContain(".workplace-admin .admin-analytics-panel .admin-analytics-kpis > div { border-color:rgba(174,191,235,.14); background:#202754; }");
    expect(css).toContain(".workplace-admin .support-admin-panel .support-ticket-admin-row { border-color:rgba(174,191,235,.14); background:#202754");
    expect(css).toContain(".workplace-admin .support-admin-panel textarea");
    expect(css).toContain(".workplace-admin .dashboard-content .dash-panel,");
    expect(css).toContain("background:#171b3b !important; border-color:rgba(174,191,235,.14); color:#f4f7ff;");
    expect(css).toContain(".workplace-admin.admin-analytics-container { background:#171b3b !important; color:#f4f7ff; }");
    expect(css).toContain(".account-support-history.workplace-admin { background:#171b3b !important; color:#f4f7ff; }");
    expect(home).toContain("className={`section account-support-history workplace-${role}`}");
    expect(home).toContain("className=\"container workplace-admin admin-analytics-container\"");
    expect(home).toContain("className={`section account-support-history workplace-${role}`}");
    expect(css).toContain(".workplace-admin.admin-analytics-container > #admin-candidates.admin-active-candidates-panel");
    expect(css).toContain(".account-support-history.workplace-admin {\n  width: 100%;");
    expect(css).toContain(".workplace-admin.admin-analytics-container > #admin-analytics > .admin-analytics-panel .admin-analytics-kpis > div");
    expect(css).toContain(".workplace-admin.admin-analytics-container .empty-state,\n.account-support-history.workplace-admin .empty-state");
    expect(css).toContain("gap: 8px 12px;");
    expect(css).toContain("min-height: 150px;");
  });

  it("keeps every Admin surface reachable from the reference-style sidebar", () => {
    for (const link of ["#admin-overview", "#admin-analytics", "#admin-users", "/admin/roles", "#admin-payments", "#admin-vacancies", "#admin-support", "#admin-reports", "#admin-candidates"]) {
      expect(home).toContain(`href="${link}"`);
    }
    expect(home).toContain('id={role === "admin" ? "admin-overview" : undefined}');
    for (const anchor of ["admin-analytics", "admin-users", "admin-payments", "admin-vacancies", "admin-support", "admin-reports"]) {
      expect(home).toContain(`id=\"${anchor}\"`);
    }
    expect(home).toContain('aria-label="Admin sections"');
  });
});
