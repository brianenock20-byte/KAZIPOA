import React, { type ReactNode } from "react";

export type PortfolioRole = "seeker" | "employer" | "admin";

const heroAssets: Record<PortfolioRole, { eyebrow: string; title: string }> = {
  seeker: {
    eyebrow: "Career portfolio",
    title: "Show your next move.",
  },
  employer: {
    eyebrow: "Hiring workspace",
    title: "Build a stronger team.",
  },
  admin: {
    eyebrow: "Trust operations",
    title: "Keep the marketplace trusted.",
  },
};

export function KazipoaBrand({ className = "" }: { className?: string }) {
  return <span className={`brand-mark ${className}`.trim()}>
    <img className="brand-mark-glyph" src="/kazipoa-mark.png" alt="" aria-hidden="true" />
    <span>KAZIPOA</span>
  </span>;
}

export function PortfolioHero({ role }: { role: PortfolioRole }) {
  const asset = heroAssets[role];
  return <div className={`workplace-hero-image workplace-hero-${role}`} data-portfolio-hero={role}>
    <div className="workplace-hero-art" aria-hidden="true" />
    <div className="workplace-hero-overlay"><span>{asset.eyebrow}</span><strong>{asset.title}</strong></div>
  </div>;
}

export function PortfolioBrandLink({ role }: { role: PortfolioRole }) {
  const label = role === "seeker" ? "Job Seeker portfolio" : role === "employer" ? "Employer portfolio" : "Admin portfolio";
  return <a href="/" className="role-brand-link" aria-label="Kazipoa home"><KazipoaBrand /><small>{label}</small></a>;
}

export function PortfolioShellBranding({ role }: { role: PortfolioRole }) {
  return <div className={`portfolio-shell-branding portfolio-shell-branding-${role}`}>
    <div className="role-brand-strip"><PortfolioBrandLink role={role} /></div>
    <PortfolioHero role={role} />
  </div>;
}

export function PortfolioBrandingPreview({ children }: { children?: ReactNode }) {
  return <div className="portfolio-branding-preview">{children}</div>;
}
