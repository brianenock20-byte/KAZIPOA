import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const sidebarSource = readFileSync(resolve(root, "client/src/components/RoleWorkspaceSidebar.tsx"), "utf8");
const homeSource = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const cssSource = readFileSync(resolve(root, "client/src/index.css"), "utf8");

describe("shared role workspace sidebar", () => {
  it("defines distinct Employer and Job Seeker navigation contracts", () => {
    expect(sidebarSource).toContain('role === "employer" ? employerItems : seekerItems');
    expect(sidebarSource).toContain('label: "Company profile"');
    expect(sidebarSource).toContain('label: "Payments & packages"');
    expect(sidebarSource).toContain('label: "My applications"');
    expect(sidebarSource).toContain('label: "Saved jobs"');
    expect(sidebarSource).toContain('aria-current={activeId === item.id ? "page" : undefined}');
  });

  it("mounts the role sidebar inside the outer dashboard sidebar and controls Employer views", () => {
    expect(homeSource).toContain('<RoleWorkspaceSidebar role="employer" activeId={employerView} onNavigate={navigateEmployerSidebar} />');
    expect(homeSource).toContain('<RoleWorkspaceSidebar role="seeker" activeId={seekerSidebarActive} onNavigate={navigateSeekerSidebar} />');
    expect(homeSource).toContain('activeView={employerView} onViewChange={setEmployerView}');
  });

  it("removes the nested centered Employer portfolio sidebar and uses the left-edge dashboard grid", () => {
    expect(cssSource).toContain('.workplace-employer .employer-portfolio-sidebar { display: none; }');
    expect(cssSource).toContain('.workplace-employer .dashboard-layout,\n.workplace-seeker .dashboard-layout');
    expect(cssSource).toContain('grid-template-columns: 228px minmax(0, 1fr);');
    expect(cssSource).toContain('.workplace-employer .dashboard-sidebar,\n.workplace-seeker .dashboard-sidebar');
  });
});
