import React, { type ReactNode } from "react";

export type PortfolioRole = "seeker" | "employer" | "admin";

const heroAssets: Record<PortfolioRole, { src: string; alt: string; eyebrow: string; title: string }> = {
  seeker: {
    src: "/manus-storage/kazipoa-seeker-workplace-hero_bc5c1182.jpg",
    alt: "Job seeker reviewing a professional portfolio",
    eyebrow: "Career portfolio",
    title: "Show your next move.",
  },
  employer: {
    src: "/manus-storage/kazipoa-employer-workplace-hero_6341c303.jpg",
    alt: "Hiring team reviewing candidate profiles",
    eyebrow: "Hiring workspace",
    title: "Build a stronger team.",
  },
  admin: {
    src: "/manus-storage/kazipoa-admin-workplace-hero_b5170b35.jpg",
    alt: "Admin operations professional monitoring recruitment activity",
    eyebrow: "Trust operations",
    title: "Keep the marketplace trusted.",
  },
};

export function KazipoaBrand({ className = "" }: { className?: string }) {
  return <span className={`brand-mark ${className}`.trim()}><img src="/manus-storage/kazipoa-brand-mark_72c8b243.png" alt="" /><span>KAZIPOA</span></span>;
}

export function PortfolioHero({ role }: { role: PortfolioRole }) {
  const asset = heroAssets[role];
  return <div className={`workplace-hero-image workplace-hero-${role}`} data-portfolio-hero={role}>
    <img src={asset.src} alt={asset.alt} />
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
