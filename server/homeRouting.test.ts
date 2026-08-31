import { describe, expect, it } from "vitest";
import { isProtectedCollectionPath, isPublicPath, resolveInitialView, resolveInitialViewForAuth, shouldOpenPrivateWorkspace } from "../client/src/pages/homeRouting";

describe("shared Home routing", () => {
  it("opens the private workspace directly after authentication", () => {
    expect(resolveInitialView("/dashboard", false)).toBe("dashboard");
    expect(resolveInitialViewForAuth("/dashboard", true, false)).toBe("dashboard");
    expect(shouldOpenPrivateWorkspace("/dashboard")).toBe(true);
  });

  it("preserves public pages and registered-only collection gates", () => {
    expect(resolveInitialView("/", false)).toBe("home");
    expect(resolveInitialView("/companies", false)).toBe("companies");
    expect(resolveInitialView("/safety-centre", false)).toBe("safety");
    expect(resolveInitialView("/urgent-jobs", false)).toBe("jobs");
    expect(resolveInitialView("/jobs", false)).toBe("home");
    expect(resolveInitialView("/jobs", true)).toBe("jobs");
    expect(resolveInitialView("/preferences", false)).toBe("home");
    expect(resolveInitialView("/preferences", true)).toBe("preferences");
    expect(isPublicPath("/verified-companies")).toBe(true);
    expect(isProtectedCollectionPath("/jobs")).toBe(true);
    expect(isProtectedCollectionPath("/companies")).toBe(false);
  });
});
