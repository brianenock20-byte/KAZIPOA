import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Employer recruitment workspaces design contract", () => {
  const component = readFileSync(resolve(process.cwd(), "client/src/components/EmployerRecruitmentWorkspaces.tsx"), "utf8");
  const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
  const employerMarketplace = readFileSync(resolve(process.cwd(), "client/src/pages/EmployerMarketplacePage.tsx"), "utf8");

  it("keeps the Employer inside the portfolio and anchors navigation below the workplace heading", () => {
    expect(home).toContain('{role !== "employer" && <button className="back-button"');
    expect(home).not.toContain('role === "employer" ? "Employer home"');
    expect(component).toContain('aria-label="Employer portfolio sections"');
    expect(css).toContain('.workplace-employer .dash-heading + .employer-recruitment-workspaces');
    expect(css).toContain('position: static;');
  });

  it("keeps the three distinct employer workspaces visible and navigable", () => {
    expect(component).toContain('aria-label="Employer portfolio"');
    expect(component).toContain('"Application trend"');
    expect(component).toContain('"Candidates"');
    expect(component).toContain('"My interviews"');
    expect(component).toContain('role="tablist"');
    expect(component).toContain('role="tab"');
    expect(home).toContain("<EmployerRecruitmentWorkspaces");
    expect(home).toContain('role === "employer"');
    expect(home).toContain("onSelectCandidate={(applicationId) => setPreviewApplicationId(applicationId)}");
  });

  it("uses persisted application and vacancy metrics without fabricated records", () => {
    expect(component).toContain("applications");
    expect(component).toContain("metrics");
    expect(component).toContain("trend");
    expect(component).toContain("All persisted applications");
    expect(component).toContain("Application trend will appear after candidates apply.");
    expect(component).toContain("Your vacancy performance will appear here after a vacancy is saved.");
    expect(home).toContain("trpc.employer.applications.useQuery");
    expect(home).toContain("trpc.employer.vacancyMetrics.useQuery");
    expect(home).toContain("trpc.employer.applicationTrend.useQuery");
  });

  it("keeps candidate filtering, sorting, pagination, and status badges", () => {
    for (const control of ["Search candidates", "Status", "Vacancy", "Sort", "Reset", "Newest applied", "Oldest applied", "Candidate name", "Position", "Stage"]) {
      expect(component).toContain(control);
    }
    expect(component).toContain("candidatePageCount");
    expect(component).toContain("visibleCandidates");
    expect(component).toContain("employer-stage-badge");
    expect(component).toContain("statusLabels");
    expect(css).toContain(".employer-candidates-table");
    expect(css).toContain(".employer-candidate-identity-button:hover");
  });

  it("keeps payment methods and packages at the bottom of the authenticated Employer portfolio", () => {
    expect(home).toContain('bottomContent={<div id="employer-payments" className="employer-bottom-payments"><EmployerPaymentStatusPanel /><EmployerPackageSummary /></div>}');
    expect(home.indexOf("<EmployerPaymentStatusPanel />")).toBeLessThan(home.indexOf("<EmployerPackageSummary />"));
    expect(employerMarketplace).not.toContain("EmployerPackageSummary");
    expect(employerMarketplace).not.toContain("Compare packages for your next vacancy");
  });

  it("keeps interview invitation filtering and response-aware presentation truthful", () => {
    expect(component).toContain("Upcoming");
    expect(component).toContain("Past");
    expect(component).toContain("Invited");
    expect(component).toContain("Not invited");
    expect(component).toContain("Accepted");
    expect(component).toContain("Declined");
    expect(component).toContain("Invitation sent");
    expect(component).toContain("interviewResponse");
    expect(component).toContain("interviewNote");
    expect(component).toContain("No interview records yet");
    expect(component).toContain("Not scheduled");
    expect(css).toContain(".employer-invite-status.accepted");
    expect(css).toContain(".employer-invite-status.declined");
  });

  it("aligns Employer workspace surfaces with the Job Seeker palette", () => {
    expect(css).toContain(".workplace-employer .employer-recruitment-workspaces");
    expect(css).toContain(".workplace-employer .employer-dashboard-kpis button");
    expect(css).toContain(".workplace-employer .employer-candidates-table-wrap");
    expect(css).toContain("background:#151719!important");
    expect(css).toContain("background:#1b1e1f!important");
    expect(css).toContain("color:#f3f2ed!important");
    expect(css).toContain("color:#9fa39e!important");
    expect(css).toContain("background:#d9f2e5!important");
  });
});
