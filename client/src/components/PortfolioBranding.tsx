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
    <span className="brand-mark-glyph" aria-hidden="true">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kazipoaGlyphBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ade94" />
            <stop offset="100%" stopColor="#159a5b" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="96" height="96" rx="24" fill="url(#kazipoaGlyphBg)" />
        <g fill="none" stroke="#0a1120" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M38 78 C24 70 18 56 22 42 C25 31 33 22 44 17" fill="#0a1120" stroke="none" />
          <path d="M60 82 L83 55" />
          <path d="M60 82 L38 82" />
          <path d="M52 50 L83 18" />
        </g>
        <path d="M70 14 L88 19 L83 37 Z" fill="#0a1120" />
      </svg>
    </span>
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
