import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Employer vacancy management and registration clarity contracts", () => {
  const auth = readFileSync(resolve(process.cwd(), "client/src/pages/CustomAuth.tsx"), "utf8");
  const schemaSource = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
  const component = readFileSync(resolve(process.cwd(), "client/src/components/EmployerVacancyManagement.tsx"), "utf8");
  const workspace = readFileSync(resolve(process.cwd(), "client/src/components/EmployerRecruitmentWorkspaces.tsx"), "utf8");
  const admin = readFileSync(resolve(process.cwd(), "client/src/components/AdminControlCenter.tsx"), "utf8");
  const routers = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  const employerMarketplacePage = readFileSync(resolve(process.cwd(), "client/src/pages/EmployerMarketplacePage.tsx"), "utf8");
  const profile = readFileSync(resolve(process.cwd(), "client/src/components/EmployerCompanyProfileSetup.tsx"), "utf8");
  const packages = readFileSync(resolve(process.cwd(), "client/src/components/EmployerPackageSummary.tsx"), "utf8");
  const acceptedPaymentMethods = readFileSync(resolve(process.cwd(), "client/src/components/AcceptedPaymentMethods.tsx"), "utf8");
  const savedJobs = readFileSync(resolve(process.cwd(), "client/src/components/SavedJobsPage.tsx"), "utf8");
  const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
  const routing = readFileSync(resolve(process.cwd(), "client/src/pages/homeRouting.ts"), "utf8");
  const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
  const themeToggle = readFileSync(resolve(process.cwd(), "client/src/components/ThemeToggle.tsx"), "utf8");

  it("makes the Seeker and Employer registration outcomes explicit", () => {
    expect(auth).toContain("Choose your workspace");
    expect(auth).toContain("Looking for work");
    expect(auth).toContain("Hiring talent");
    expect(auth).toContain("Search verified vacancies, save roles, apply with your CV, and track interviews.");
    expect(auth).toContain("Create a company profile, post vacancies, review applicants, and manage interviews.");
    expect(auth).toContain('aria-pressed={accountType === "seeker"}');
    expect(auth).toContain('aria-pressed={accountType === "employer"}');
  });

  it("exposes protected Employer-owned vacancy list, update, and delete procedures", () => {
    expect(routers).toContain("vacancies: employerProcedure.query(({ ctx }) => listEmployerVacancies(ctx.user.id))");
    expect(routers).toContain("updateVacancy: employerProcedure.input");
    expect(routers).toContain("deleteVacancy: employerProcedure.input");
    expect(db).toContain("listEmployerVacancies(employerUserId: number)");
    expect(db).toContain("updateEmployerVacancy(input:");
    expect(db).toContain("deleteEmployerVacancy(input:");
    expect(db).toContain("Vacancy not found or not owned by Employer");
  });

  it("keeps deletion guarded when applications or payments are linked", () => {
    expect(db).toContain("This vacancy has applications and cannot be permanently deleted");
    expect(db).toContain("This vacancy has payment records and cannot be permanently deleted");
    expect(component).toContain("Confirm delete");
    expect(component).toContain("Cannot delete vacancy with applicants");
    expect(component).toContain("protect recruitment records");
  });

  it("shows persisted applicant statistics and marketplace publication state", () => {
    expect(component).toContain("Applicants");
    expect(component).toContain("Views");
    expect(component).toContain("Publication Status");
    expect(component).toContain("Visible to Job Seekers in the marketplace.");
    expect(component).toContain("Not public yet; Admin review and payment checks still apply.");
    expect(workspace).toContain("<EmployerVacancyManagement metrics={metrics} />");
    expect(db).toContain('eq(vacancies.status, "live")');
    expect(db).toContain("gt(vacancies.deadline, new Date())");
  });

  it("supports persisted skills and experience filters and allow-listed sorting", () => {
    expect(db).toContain("seekerSkills.seekerUserId");
    expect(db).toContain("seekerExperience.seekerUserId");
    expect(db).toContain("experienceYears");
    expect(db).toContain("experienceTitles");
    expect(workspace).toContain('type CandidateSort = "recent" | "oldest" | "name" | "vacancy" | "status" | "skills" | "experience"');
    expect(workspace).toContain('>Skill</span>');
    expect(workspace).toContain('>Experience</span>');
    expect(workspace).toContain('value="skills"');
    expect(workspace).toContain('value="experience"');
    expect(workspace).toContain("matchesExperience");
  });

  it("exposes persisted marketplace bookmark controls and truthful applicant charts", () => {
    expect(home).toContain("saveVacancyMutation.mutateAsync");
    expect(home).toContain("Remove saved job");
    expect(home).toContain("save-button-labeled");
    expect(workspace).toContain("APPLICANTS BY VACANCY");
    expect(workspace).toContain("APPLICATION STATUS");
    expect(workspace).toContain("applicationStatusCounts");
    expect(workspace).toContain("maxApplicantsPerVacancy");
  });

  it("keeps Employer workspace focused and adds a protected saved-jobs page", () => {
    expect(workspace).toContain("<EmployerCompanyProfileSetup />");
    expect(workspace).toContain("<EmployerPackageSummary />");
    expect(workspace).toContain("<EmployerVacancyManagement metrics={metrics} />");
    expect(profile).toContain("trpc.employer.profile.useQuery");
    expect(profile).toContain("trpc.employer.saveProfile.useMutation");
    expect(packages).toContain("EMPLOYER PLANS & PACKAGES");
    expect(packages).toContain("MONTHLY EMPLOYER PLANS");
    expect(savedJobs).toContain("trpc.seeker.savedPage.useQuery");
    expect(savedJobs).toContain("trpc.seeker.removeSavedVacancy.useMutation");
    expect(savedJobs).toContain("Bookmarked jobs");
    expect(app).toContain('<Route path="/saved-jobs" component={Home} />');
    expect(routing).toContain('"saved-jobs"');
    expect(routing).toContain('initialPath === "/saved-jobs" && isRegistered');
    expect(routing).toContain('initialPath === "/saved-jobs"');
    expect(home).toContain('hidden={role !== "seeker" || seekerSection !== "saved"}');
    expect(home).toContain('hidden={role !== "seeker" || seekerSection !== "applications"}');
    expect(styles).toContain(".workplace-employer .saved-jobs-panel");
    expect(styles).toContain(".workplace-employer .subscription-panel");
    expect(styles).toContain(".workplace-employer .employer-portfolio");
  });

  it("matches the Employer marketplace reference with three own-posting panes", () => {
    expect(component).toContain("employer-marketplace-grid");
    expect(component).toContain("employer-marketplace-filters");
    expect(component).toContain("employer-marketplace-list");
    expect(component).toContain("employer-vacancy-detail-view");
    expect(component).toContain("Only your employer postings");
    expect(component).toContain("History");
    expect(component).toContain("SELECTED POSTING");
    expect(styles).toContain("grid-template-columns: minmax(13rem, 18%) minmax(20rem, 42%) minmax(25rem, 40%)");
    expect(home).not.toContain("employer-marketplace-workspace-public");
    expect(workspace).toContain('useState<WorkspaceView>("marketplace")');
    expect(workspace).toContain('view === "marketplace" ? <div className="employer-marketplace-view"><EmployerVacancyManagement metrics={metrics} />{includePackages && <EmployerPackageSummary />}');
    expect(workspace).toContain('["marketplace", "dashboard", "candidates", "interviews"]');
    expect(home).toContain('if (workspaceRole === "employer") { window.location.assign("/employer-marketplace"); return; } nav(workspaceRole === "seeker" ? "jobs" : "home")');
    expect(home).toContain('window.location.assign("/employer-marketplace")');
  });

  it("exposes a dedicated Employer Marketplace route separate from the public homepage and broader Workplace", () => {
    expect(app).toContain('<Route path="/employer-marketplace" component={EmployerMarketplacePage} />');
    expect(employerMarketplacePage).toContain('trpc.auth.accountRole.useQuery');
    expect(employerMarketplacePage).toContain('accountRoleQuery.data === "employer"');
    expect(employerMarketplacePage).toContain("Only your posted roles appear here");
    expect(employerMarketplacePage).toContain("<EmployerVacancyManagement metrics={metricsQuery.data ?? []} />");
    expect(employerMarketplacePage).not.toContain("EmployerPackageSummary");
    expect(employerMarketplacePage).toContain("Create Employer account");
    expect(home).toContain('window.location.assign("/employer-marketplace")');
  });

  it("supports real applicant export, loading skeletons, and history ordering by applicants or views", () => {
    expect(component).toContain("trpc.employer.applications.useQuery");
    expect(component).toContain("downloadCsv");
    expect(component).toContain("Export applicants");
    expect(component).toContain('type ShowBy = "recent" | "most_applicants" | "most_views"');
    expect(component).toContain("Most applicants");
    expect(component).toContain("Most views");
    expect(component).toContain("employer-marketplace-skeleton");
    expect(component).toContain("employer-detail-skeleton");
    expect(styles).toContain("kazipoa-skeleton-shimmer");
  });

  it("places accepted payment methods under the Employer package heading and removes them from public pricing", () => {
    expect(packages).toContain('import AcceptedPaymentMethods from "@/components/AcceptedPaymentMethods";');
    expect(packages).toContain('<strong>Pay for the role you are posting</strong></div><small>Click one package to expand its benefits</small></div>\n      <AcceptedPaymentMethods />');
    for (const label of ["M-Pesa / Lipa Namba", "Airtel Money", "Tigo Pesa", "HaloPesa", "CRDB Bank"]) expect(acceptedPaymentMethods).toContain(label);
    expect(home).not.toContain('className="payment-methods-panel"');
    expect(home).not.toContain('employer-pricing-block');
    expect(home).not.toContain('SIMPLE PRICING FOR EMPLOYERS');
    expect(home).not.toContain('MONTHLY EMPLOYER PLANS');
    expect(styles).toContain('.employer-accepted-payment-methods');
    expect(styles).toContain('border: 1px solid #12345c');
    expect(styles).toContain('grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr)');
  });

  it("keeps package benefits collapsed and documents urgent candidate email and SMS readiness", () => {
    expect(packages).toContain("openPackageId");
    expect(packages).toContain("aria-expanded={isOpen}");
    expect(packages).toContain("Candidate email notification readiness");
    expect(packages).toContain("Candidate SMS notification readiness");
    expect(packages).toContain("phone number saved in their profile");
    expect(packages).toContain("Until provider credentials are active");
    expect(styles).toContain("employer-package-card.expanded");
    expect(styles).toContain("employer-urgent-notification-note");
  });

  it("orders the Employer portfolio with profile first, recruitment next, and payments/packages last", () => {
    expect(workspace).toContain("employer-portfolio-sidebar");
    expect(workspace).toContain('id="employer-company-profile"');
    expect(workspace).toContain('id="employer-application-trend"');
    expect(workspace).toContain('id="employer-candidates"');
    expect(workspace).toContain('id="employer-interviews"');
    expect(workspace).toContain("Payments & packages");
    expect(workspace).toContain("showCompanyProfile = false");
    expect(workspace).toContain("includePackages = true");
    expect(home).toContain("showCompanyProfile includePackages={false}");
    expect(home).toContain("additionalContent={<>");
    expect(home).toContain('bottomContent={<div id="employer-payments"');
    expect(home).toContain('id="employer-vacancy-form"');
    expect(home).toContain('onPostVacancy={() =>');
    expect(home).toContain('id="employer-payments"');
    expect(styles).toContain(".employer-portfolio-sidebar");
    expect(styles).toContain(".employer-bottom-payments");
  });

  it("keeps the Employer portfolio below the hero inside one sidebar-managed flow", () => {
    const heroIndex = home.indexOf('role === "employer" ? "A calmer way to hire."');
    const workspaceIndex = home.indexOf('role === "employer" && <EmployerRecruitmentWorkspaces');
    expect(heroIndex).toBeGreaterThanOrEqual(0);
    expect(workspaceIndex).toBeGreaterThan(heroIndex);
    expect(workspace).toContain('aria-label="Employer portfolio"');
    expect(workspace.indexOf('className="employer-recruitment-shell"')).toBeLessThan(workspace.indexOf('id="employer-company-profile"'));
    expect(workspace.indexOf('id="employer-company-profile"')).toBeLessThan(workspace.indexOf('className="employer-workspace-topbar"'));
    expect(workspace).toContain('additionalContent');
    expect(workspace).toContain('bottomContent');
    expect(workspace).not.toContain("Employer marketplace");
    expect(workspace).not.toContain('>Marketplace<');
  });

  it("supports persisted Employer company profile images and removes the visible Marketplace label", () => {
    expect(routers).toContain("uploadProfileImage: employerProcedure.input");
    expect(routers).toContain("updateEmployerProfileImage");
    expect(db).toContain("profileImageKey");
    expect(profile).toContain("uploadProfileImageMutation");
    expect(profile).toContain("Company profile image");
    expect(profile).toContain("employer-profile-image-preview");
    expect(employerMarketplacePage).toContain("EMPLOYER POSTINGS");
    expect(employerMarketplacePage).not.toContain("EMPLOYER MARKETPLACE");
    expect(employerMarketplacePage).not.toContain("This Marketplace is for Employers.");
    expect(employerMarketplacePage).toContain("This Employer workspace is for Employers.");
    expect(styles).toContain(".employer-profile-image-panel");
  });

  it("allows employers to omit salary and shows a truthful not-disclosed fallback", () => {
    expect(schemaSource).toContain('salary: varchar("salary", { length: 120 }),');
    expect(routers).toContain('salary: z.string().trim().max(120).optional()');
    expect(db).toContain('salary?: string | null');
    expect(component).toContain('(draft.salary ?? "").trim() || undefined');
    expect(component).toContain('Salary not disclosed');
    expect(home).toContain('Salary range <span className="field-hint">(optional)</span>');
  });

  it("shows a truthful new-application state without inventing unread records", () => {
    expect(workspace).toContain('application.status === "applied"');
    expect(workspace).toContain("newApplicationCount");
    expect(workspace).toContain("No new applications");
    expect(workspace).toContain("new application");
  });

  it("removes the new portfolio header links while preserving required controls", () => {
    expect(home).toContain('const isPortfolioWorkspace = view === "dashboard" && (workspaceRole === "employer" || workspaceRole === "admin");');
    expect(home).toContain('const showWorkspaceProfileMenu = isPortfolioWorkspace || (view === "dashboard" && workspaceRole === "seeker" && isAuthenticated);');
    expect(home).toContain('className={`container nav-inner ${isPortfolioWorkspace ? "portfolio-nav-inner" : ""}`}');
    expect(home).toContain('{!isPortfolioWorkspace && <nav');
    expect(home).not.toContain('portfolio-header-nav');
    expect(home).not.toContain('Account management</a>');
    expect(home).not.toContain('Payment review</a>');
    expect(home).not.toContain('Recruitment workplace</a>');
    expect(home).toContain('className={`portfolio-profile-menu ${portfolioProfileOpen ? "is-open" : ""}`}');
    expect(home).toContain('aria-label="Open profile menu"');
    expect(home).toContain('aria-expanded={portfolioProfileOpen}');
    expect(home).not.toContain("Edit Profile");
    expect(home).not.toContain('<Settings2 size={15} />Settings');
    expect(home).toContain("Signed in as");
    expect(home).toContain(">Logout</button>");
    expect(home).toContain('workspaceRole === "employer" ? "Employer" : "Job Seeker"');
    expect(home).not.toContain('onClick={handleLogout}>Log out</button>');
    expect(home).toContain('className="language-button"');
    expect(home).toContain("<ThemeToggle />");
    expect(home).toContain('className={`ghost-button ${isPortfolioWorkspace ? "portfolio-workspace-link" : "desktop-only"}`}');
    expect(home).toContain('aria-label="Primary"');
    expect(home).toContain("Find jobs");
    expect(home).toContain("Urgent jobs");
    expect(home).toContain("Safety Centre");
  });

  it("covers the Admin lower-surface navy treatment", () => {
    expect(styles).toContain(".workplace-admin .admin-console");
    expect(styles).toContain(".workplace-admin .admin-chart-panel");
    expect(styles).toContain(".support-admin-panel");
    expect(admin).toContain("Platform overview");
    expect(admin).toContain("support queues");
  });
  it("matches the supplied dark-charcoal portfolio palette and brand green", () => {
    expect(styles).toContain(".workplace-seeker .dashboard-layout,.workplace-employer .dashboard-layout{background:#151719!important");
    expect(styles).toContain(".workplace-seeker .dashboard-content,.workplace-employer .dashboard-content{background:#151719!important");
    expect(styles).toContain(".workplace-seeker .portfolio-panel .portfolio-section,.workplace-employer .portfolio-panel .portfolio-section{background:#1b1e1f!important");
    expect(styles).toContain(".workplace-seeker .primary-button,.workplace-employer .primary-button{background:#18b77a!important");
    expect(styles).toContain(".dashboard-page::before{background:#1b2e20!important}");
    expect(styles).toContain(".site-header .theme-toggle{background:#111b35!important;color:#fff!important");
    expect(themeToggle).toContain('className="theme-toggle"');
    expect(styles).toContain(".dashboard-page .portfolio-profile-panel,.dashboard-page .notification-bell-button{background:#1b2e20!important");
    expect(styles).toContain(".workplace-seeker .portfolio-sections > .portfolio-refresh-row{background:#1b2e20!important");
    expect(styles).toContain(".workplace-seeker input,.workplace-seeker select,.workplace-seeker textarea{background:#151719!important;color:#fff!important");
  });
  it("keeps the shared top header on the supplied dark reference palette", () => {
    expect(styles).toContain(".site-header{background:#111b35!important;color:#f3f6ff!important");
    expect(styles).toContain(".site-header .language-button,.site-header .ghost-button,.site-header .menu-button");
    expect(home).toContain('className="site-header"');
    expect(home).toContain('className="language-button"');
    expect(home).toContain('<ThemeToggle />');
  });
  it("adds real workspace-card discovery controls and edge-aligned visual treatment", () => {
    expect(admin).toContain("workspaceCardSearch");
    expect(admin).toContain("workspaceCardFilter");
    expect(admin).toContain("Search workspace cards");
    expect(admin).toContain("workspaceSummaryCards");
    expect(admin).toContain("metricsQuery.data?.totalUsers");
    expect(styles).toContain(".admin-workspace-discovery");
    expect(styles).toContain(".admin-stat:hover");
    expect(styles).toContain(".workplace-admin .dashboard-content > .workplace-hero-image");
  });

  it("matches the Job Seeker Support History dark olive reference palette", () => {
    expect(home).toContain("account-support-history workplace-${role}");
    expect(styles).toContain(".account-support-history.workplace-seeker{background:#1b211b!important;color:#f0eee6}");
    expect(styles).toContain(".account-support-history.workplace-seeker .support-history-item");
    expect(styles).toContain(".account-support-history.workplace-seeker .empty-state");
  });
  it("places Seeker Profile Data before Education in the portfolio flow", () => {
    const profileOrder = styles.indexOf(".workplace-seeker .dashboard-content>.portfolio-panel{order:5}");
    const educationOrder = styles.indexOf(".workplace-seeker .dashboard-content>.portfolio-sections{order:7}");
    expect(profileOrder).toBeGreaterThan(-1);
    expect(educationOrder).toBeGreaterThan(profileOrder);
    expect(home).toContain('className="dash-panel portfolio-panel"');
    expect(home).toContain('id="seeker-education"');
    expect(home).toContain('id="seeker-experience"');
    expect(home).toContain('id="seeker-skills"');
    expect(home).toContain('id="seeker-certifications"');
  });
  it("places Seeker notifications before shortlist and application status sections", () => {
    expect(styles).toContain(".workplace-seeker .dashboard-content>#seeker-notifications{order:9}");
    expect(styles).toContain(".workplace-seeker .dashboard-content>.seeker-status-center{order:10}");
    expect(styles).toContain(".workplace-seeker .dashboard-content>.status-history-panel{order:11}");
    expect(styles).toContain(".workplace-seeker .dashboard-content>.vacancy-preview{order:12}");
    expect(home).toContain('className="dash-panel seeker-status-center"');
    expect(home).toContain('className="dash-panel status-history-panel"');
    expect(home).toContain('className="dash-panel notification-panel"');
    expect(home).toContain('className="dash-panel vacancy-preview"');
  });
  it("removes duplicate Seeker overview summaries without removing live editors", () => {
    expect(styles).toContain(".workplace-seeker .portfolio-panel>.portfolio-section,.workplace-seeker .portfolio-panel>.primary-button{display:none}");
    expect(home).toContain('className="dash-panel portfolio-panel"');
    expect(home).toContain('className="portfolio-sections"');
    expect(home).toContain('id="seeker-education"');
    expect(home).toContain('id="seeker-experience"');
    expect(home).toContain('id="seeker-skills"');
    expect(home).toContain('id="seeker-certifications"');
  });
  it("hides the redundant Seeker profile-completion prompt but preserves upload controls", () => {
    expect(styles).toContain(".workplace-seeker .profile-completion-panel{display:none}");
    expect(home).toContain('className={`profile-completion-panel ${profileCompletion === 100 ? "complete" : "needs-attention"}`}');
    expect(home).toContain('id="portfolio-cv-input"');
    expect(home).toContain('id="portfolio-photo-input"');
    expect(home).toContain('className="dash-panel cv-panel"');
  });
  it("simplifies Seeker certifications to a name and optional proof attachment", () => {
    expect(schemaSource).toContain('issuer: varchar("issuer", { length: 180 }),');
    expect(db).toContain('input: { name: string; issuer?: string;');
    expect(routers).toContain('name: z.string().trim().min(2).max(180), issuer: z.string().trim().max(180).optional()');
    expect(home).toContain('const [certification, setCertification] = useState({ name: "" });');
    expect(home).toContain('addCertification.mutateAsync({ name: certification.name, attachmentBase64: certificateAttachment?.base64');
    expect(home).toContain('Certificate proof (optional)');
    expect(home).not.toContain('>Issuer<input required value={certification.issuer}');
    expect(home).not.toContain('>Issue date<input value={certification.issueDate}');
    expect(home).not.toContain('>Credential ID<input value={certification.credentialId}');
  });
});
