import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { canAccessWorkspace, isWorkspaceReady } from "@shared/roleAccess";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("published Employer access boundary", () => {
  it("uses the dashboard route as the protected workspace entry", () => {
    expect(appSource).toContain('<Route path="/dashboard" component={Home} />');
    expect(homeSource).toContain("const workspaceReady = isWorkspaceReady(isAuthenticated");
    expect(homeSource).toContain("{view === \"dashboard\" && (workspaceReady ? <Dashboard");
  });

  it("does not mount private dashboard tools until the authenticated workspace is ready", () => {
    expect(homeSource).toContain("view === \"dashboard\" && workspaceReady && user?.role === \"admin\"");
    expect(homeSource).toContain("view === \"dashboard\" && workspaceReady && <SupportHistoryPanel");
    expect(homeSource).toContain("Sign in to your existing account");
    expect(isWorkspaceReady(false, "employer", false)).toBe(false);
    expect(isWorkspaceReady(true, undefined, true)).toBe(false);
    expect(isWorkspaceReady(true, "employer", false)).toBe(true);
    expect(canAccessWorkspace("seeker", "employer")).toBe(false);
    expect(canAccessWorkspace("employer", "employer")).toBe(true);
    expect(canAccessWorkspace("admin", "employer")).toBe(true);
  });
});
