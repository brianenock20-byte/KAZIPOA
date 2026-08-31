import { describe, expect, it } from "vitest";
import { canAccessWorkspace, isWorkspaceReady, resolveWorkspaceRole, workspaceTabsForRole } from "@shared/roleAccess";

describe("role-isolated workspaces", () => {
  it("shows only the account workspace to seekers and employers", () => {
    expect(workspaceTabsForRole("seeker")).toEqual(["seeker"]);
    expect(workspaceTabsForRole("employer")).toEqual(["employer"]);
  });

  it("resolves an admin session as admin even when persisted accountType is stale", () => {
    expect(resolveWorkspaceRole(undefined, "admin", "seeker")).toBe("admin");
    expect(resolveWorkspaceRole("admin", "admin", "seeker")).toBe("admin");
    expect(resolveWorkspaceRole("seeker", "admin", "seeker")).toBe("admin");
  });

  it("does not mount a dashboard before account role resolution completes", () => {
    expect(isWorkspaceReady(true, undefined, true)).toBe(false);
    expect(isWorkspaceReady(true, "admin", false)).toBe(true);
    expect(isWorkspaceReady(false, "admin", false)).toBe(false);
  });

  it("gives admin access to all workspaces", () => {
    expect(workspaceTabsForRole("admin")).toEqual(["seeker", "employer", "admin"]);
    expect(canAccessWorkspace("admin", "employer")).toBe(true);
  });

  it("blocks cross-role workspace access for normal accounts", () => {
    expect(canAccessWorkspace("seeker", "employer")).toBe(false);
    expect(canAccessWorkspace("employer", "admin")).toBe(false);
  });
});
