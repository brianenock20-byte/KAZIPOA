import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { KazipoaBrand, PortfolioBrandLink, PortfolioHero, PortfolioShellBranding } from "../client/src/components/PortfolioBranding";

const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("Kazipoa visual branding contract", () => {
  it("keeps the same persistent mark in public and role portfolio surfaces", () => {
    expect(renderToStaticMarkup(<KazipoaBrand />)).toContain("kazipoa-brand-mark_72c8b243.png");
    expect(renderToStaticMarkup(<PortfolioBrandLink role="employer" />)).toContain("aria-label=\"Kazipoa home\"");
    expect(renderToStaticMarkup(<PortfolioBrandLink role="seeker" />)).toContain("Job Seeker portfolio");
  });

  it("keeps dedicated hero imagery and role shell coverage for all three portfolios", () => {
    for (const role of ["seeker", "employer", "admin"] as const) {
      const markup = renderToStaticMarkup(<PortfolioHero role={role} />);
      expect(markup).toContain(`data-portfolio-hero=\"${role}\"`);
      expect(markup).toContain("workplace-hero-image");
      expect(markup).toContain("alt=");
    }
    expect(renderToStaticMarkup(<PortfolioHero role="seeker" />)).toContain("kazipoa-seeker-workplace-hero_bc5c1182.jpg");
    expect(renderToStaticMarkup(<PortfolioHero role="employer" />)).toContain("kazipoa-employer-workplace-hero_6341c303.jpg");
    expect(renderToStaticMarkup(<PortfolioHero role="admin" />)).toContain("kazipoa-admin-workplace-hero_b5170b35.jpg");
  });

  it("renders the integrated portfolio shell for every role", () => {
    const expected = {
      seeker: ["Job Seeker portfolio", "kazipoa-seeker-workplace-hero_bc5c1182.jpg"],
      employer: ["Employer portfolio", "kazipoa-employer-workplace-hero_6341c303.jpg"],
      admin: ["Admin portfolio", "kazipoa-admin-workplace-hero_b5170b35.jpg"],
    } as const;
    for (const role of ["seeker", "employer", "admin"] as const) {
      const markup = renderToStaticMarkup(<PortfolioShellBranding role={role} />);
      expect(markup).toContain("role-brand-strip");
      expect(markup).toContain(expected[role][0]);
      expect(markup).toContain(expected[role][1]);
      expect(markup).toContain(`data-portfolio-hero=\"${role}\"`);
    }
  });

  it("defines the requested zoomed-in desktop scale and wall-to-wall header contract", () => {
    expect(styles).not.toContain("zoom: 1.3");
    expect(styles).toContain("--kazipoa-desktop-scale: 1.3");
    expect(styles).toContain(".site-header .nav-inner");
    expect(styles).toContain("max-width: none");
    expect(styles).toContain(".site-header .logo-link { margin-left: 0; }");
    expect(styles).toContain(".site-header .nav-actions { margin-right: 0; }");
    expect(styles).toContain("@media (min-width: 901px)");
    expect(styles).toContain("@media (max-width: 900px)");
    expect(styles).toContain(".dashboard-content { font-size: clamp(1rem, calc(1rem * var(--kazipoa-desktop-scale)), 1.18rem); }");
    expect(styles).toContain(".dashboard-page .dashboard-content { padding-left: 12px; padding-right: 12px; }");
  });
});
