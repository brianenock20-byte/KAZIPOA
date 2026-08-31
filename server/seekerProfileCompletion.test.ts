import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const employerPackageSource = readFileSync(new URL("../client/src/components/EmployerPackageSummary.tsx", import.meta.url), "utf8");

describe("seeker profile completion dashboard", () => {
  it("derives completion from real CV and profile-photo query state", () => {
    expect(homeSource).toContain("const profileCompletion = (seekerCvQuery.data ? 50 : 0) + (seekerProfilePhotoQuery.data ? 50 : 0)");
    expect(homeSource).toContain("<strong>{profileCompletion}%</strong>");
    expect(homeSource).toContain("aria-valuenow={profileCompletion}");
    expect(homeSource).not.toContain("<strong>72%</strong>");
    expect(homeSource).not.toContain('style={{width:"72%"}}');
  });

  it("shows actionable reminders and reuses the existing upload inputs", () => {
    expect(homeSource).toContain("Add a CV and a clear profile photo");
    expect(homeSource).toContain('onClick={() => document.getElementById("portfolio-cv-input")?.click()}>Upload CV');
    expect(homeSource).toContain('onClick={() => document.getElementById("portfolio-photo-input")?.click()}>Add photo');
    expect(homeSource).toContain('id="portfolio-photo-input"');
    expect(homeSource).toContain('seekerProfilePhotoQuery.data ? "Update photo" : "Upload photo"');
  });

  it("distinguishes one-off vacancy fees from recurring plans", () => {
    expect(employerPackageSource).toContain('name: "Basic vacancy"');
    expect(employerPackageSource).toContain('price: "TZS 10,000"');
    expect(employerPackageSource).toContain('name: "Featured vacancy"');
    expect(employerPackageSource).toContain('price: "TZS 25,000"');
    expect(employerPackageSource).toContain('name: "Urgent vacancy"');
    expect(employerPackageSource).toContain('price: "TZS 30,000"');
    expect(employerPackageSource).toContain('name: "Premium vacancy"');
    expect(employerPackageSource).toContain('price: "TZS 50,000"');
    expect(employerPackageSource).toContain('name: "Starter"');
    expect(employerPackageSource).toContain('price: "TZS 50,000/month"');
    expect(employerPackageSource).toContain('name: "Business"');
    expect(employerPackageSource).toContain('price: "TZS 150,000/month"');
    expect(employerPackageSource).toContain('name: "Enterprise"');
    expect(employerPackageSource).toContain('price: "Custom pricing"');
    expect(employerPackageSource).toContain("Pay for the role you are posting");
    expect(homeSource).not.toContain('SIMPLE PRICING FOR EMPLOYERS');
    expect(homeSource).not.toContain('employer-price-card');
  });
});
