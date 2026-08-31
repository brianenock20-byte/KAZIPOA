import { describe, expect, it } from "vitest";
import { isSpaClientPath, PUBLIC_SITEMAP_ROUTES, SPA_CLIENT_ROUTES } from "./_core/vite";

describe("SPA client routes", () => {
  it("uses canonical public routes in the sitemap", () => {
    expect(PUBLIC_SITEMAP_ROUTES).toEqual(["/", "/jobs", "/urgent-jobs", "/verified-companies", "/safety-centre"]);
    expect(PUBLIC_SITEMAP_ROUTES).not.toContain("/dashboard");
    expect(PUBLIC_SITEMAP_ROUTES).not.toContain("/preferences");
  });

  it("keeps authenticated marketplace and dashboard paths on the app shell", () => {
    expect(SPA_CLIENT_ROUTES).toContain("/jobs");
    expect(SPA_CLIENT_ROUTES).toContain("/urgent-jobs");
    expect(SPA_CLIENT_ROUTES).toContain("/dashboard");
    expect(SPA_CLIENT_ROUTES).toContain("/preferences");
    expect(SPA_CLIENT_ROUTES).toContain("/verified-companies");
    expect(SPA_CLIENT_ROUTES).toContain("/safety-centre");
    expect(isSpaClientPath("/jobs?from_webdev=1")).toBe(true);
    expect(isSpaClientPath("/urgent-jobs")).toBe(true);
    expect(isSpaClientPath("/verified-companies")).toBe(true);
    expect(isSpaClientPath("/safety-centre")).toBe(true);
    expect(isSpaClientPath("/jobs?from_webdev=1&tab=saved")).toBe(true);
    expect(isSpaClientPath("/not-a-route?from_webdev=1")).toBe(false);
  });
});
