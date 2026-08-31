export type WorkspaceRole = "seeker" | "employer" | "admin";

export function workspaceTabsForRole(role: WorkspaceRole): WorkspaceRole[] {
  return role === "admin" ? ["seeker", "employer", "admin"] : [role];
}

export function resolveWorkspaceRole(accountRole: WorkspaceRole | undefined, userRole: "user" | "admin" | undefined, fallback: WorkspaceRole = "seeker"): WorkspaceRole {
  // The authenticated server role is authoritative. An admin may retain a
  // stale seeker/employer accountType from an earlier registration flow.
  return userRole === "admin" ? "admin" : accountRole ?? fallback;
}

export function isWorkspaceReady(isAuthenticated: boolean, role: WorkspaceRole | undefined, roleLoading: boolean) {
  return isAuthenticated && !roleLoading && role !== undefined;
}

export function canAccessWorkspace(accountRole: WorkspaceRole, requestedRole: WorkspaceRole) {
  return accountRole === "admin" || accountRole === requestedRole;
}
