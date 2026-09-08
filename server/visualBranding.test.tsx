import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { KazipoaBrand, PortfolioBrandLink, PortfolioHero, PortfolioShellBranding } from "../client/src/components/PortfolioBranding";
import { trpc } from "../client/src/lib/trpc";

const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

// PortfolioShellBranding renders EmailVerificationBanner, which calls a tRPC
// query hook. renderToStaticMarkup needs a real (even if inert) tRPC context
// to avoid crashing, but since the render is synchronous the query stays in
// its initial "loading" state and the banner correctly renders nothing.
function withTrpc(children: React.ReactNode) {
  const queryClient = new QueryClient();
  const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: "http://localhost/api/trpc", transformer: superjson })] });
  return <trpc.Provider client={trpcClient} queryClient={queryClient}>{children}</trpc.Provider>;
}

describe("Kazipoa visual branding contract", () => {
  it("keeps the same persistent mark in public and role portfolio surfaces", () => {
    expect(renderToStaticMarkup(<KazipoaBrand />)).toContain("/kazipoa-mark.png");
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
    expect(renderToStaticMarkup(<PortfolioHero role="seeker" />)).toContain("/kazipoa-hero-seeker.jpg");
    expect(renderToStaticMarkup(<PortfolioHero role="employer" />)).toContain("/kazipoa-hero-employer.jpg");
    expect(renderToStaticMarkup(<PortfolioHero role="admin" />)).toContain("/kazipoa-hero-admin.jpg");
  });

  it("renders the integrated portfolio shell for every role", () => {
    const expected = {
      seeker: ["Job Seeker portfolio", "/kazipoa-hero-seeker.jpg"],
      employer: ["Employer portfolio", "/kazipoa-hero-employer.jpg"],
      admin: ["Admin portfolio", "/kazipoa-hero-admin.jpg"],
    } as const;
    for (const role of ["seeker", "employer", "admin"] as const) {
      const markup = renderToStaticMarkup(withTrpc(<PortfolioShellBranding role={role} />));
      expect(markup).toContain("role-brand-strip");
      expect(markup).toContain(expected[role][0]);
      expect(markup).toContain(expected[role][1]);
      expect(markup).toContain(`data-portfolio-hero=\"${role}\"`);
    }
  });

  it("keeps desktop scale neutral (no artificial zoom) and header alignment matching the page container", () => {
    expect(styles).not.toContain("zoom: 1.3");
    expect(styles).toContain("--kazipoa-desktop-scale: 1;");
    expect(styles).not.toContain("--kazipoa-desktop-scale: 1.3");
    expect(styles).toContain(".site-header .nav-inner");
    expect(styles).toContain("max-width: none");
    expect(styles).toContain(".site-header .nav-actions { margin-right: 0; }");
    expect(styles).toContain("@media (min-width: 901px)");
    expect(styles).toContain("@media (max-width: 900px)");
    expect(styles).toContain(".dashboard-content { font-size: clamp(1rem, calc(1rem * var(--kazipoa-desktop-scale)), 1.18rem); }");
  });
});
