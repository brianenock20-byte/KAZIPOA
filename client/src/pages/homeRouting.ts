export type HomeView = "home" | "jobs" | "companies" | "safety" | "dashboard" | "preferences" | "saved-jobs";

export function resolveInitialView(initialPath: string, isRegistered: boolean): HomeView {
  if (initialPath === "/companies" || initialPath === "/verified-companies") return "companies";
  if (initialPath === "/safety" || initialPath === "/safety-centre") return "safety";
  if (initialPath === "/urgent-jobs") return "jobs";
  if (initialPath === "/jobs" && isRegistered) return "jobs";
  if (initialPath === "/preferences" && isRegistered) return "preferences";
  if (initialPath === "/saved-jobs" && isRegistered) return "saved-jobs";
  // `/dashboard` is reached immediately after authentication. It must not depend
  // on a localStorage flag that is written by the later account-role query.
  if (initialPath === "/dashboard") return "dashboard";
  return "home";
}

export function shouldOpenPrivateWorkspace(initialPath: string): boolean {
  return initialPath === "/dashboard";
}

export function isPublicPath(initialPath: string): boolean {
  return initialPath === "/" || initialPath === "/jobs" || initialPath === "/urgent-jobs" || initialPath === "/companies" || initialPath === "/verified-companies" || initialPath === "/safety" || initialPath === "/safety-centre";
}

export function isProtectedCollectionPath(initialPath: string): boolean {
  return initialPath === "/jobs" || initialPath === "/preferences" || initialPath === "/saved-jobs";
}

export function resolveInitialViewForAuth(initialPath: string, isAuthenticated: boolean, isRegistered: boolean): HomeView {
  if (initialPath === "/dashboard" && isAuthenticated) return "dashboard";
  return resolveInitialView(initialPath, isRegistered);
}
