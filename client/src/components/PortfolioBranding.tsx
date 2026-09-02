import React, { type ReactNode, useState } from "react";
import { Mail, ShieldAlert, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

export type PortfolioRole = "seeker" | "employer" | "admin";

const heroAssets: Record<PortfolioRole, { eyebrow: string; title: string; image: string }> = {
  seeker: {
    eyebrow: "Career portfolio",
    title: "Show your next move.",
    image: "/kazipoa-hero-seeker.jpg",
  },
  employer: {
    eyebrow: "Hiring workspace",
    title: "Build a stronger team.",
    image: "/kazipoa-hero-employer.jpg",
  },
  admin: {
    eyebrow: "Trust operations",
    title: "Keep the marketplace trusted.",
    image: "/kazipoa-hero-admin.jpg",
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
    <img src={asset.image} alt={`${asset.eyebrow} — ${asset.title}`} loading="eager" />
  </div>;
}

export function PortfolioBrandLink({ role }: { role: PortfolioRole }) {
  const label = role === "seeker" ? "Job Seeker portfolio" : role === "employer" ? "Employer portfolio" : "Admin portfolio";
  return <a href="/" className="role-brand-link" aria-label="Kazipoa home"><KazipoaBrand /><small>{label}</small></a>;
}

export function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const statusQuery = trpc.auth.emailVerificationStatus.useQuery();
  const resend = trpc.auth.resendVerification.useMutation();

  if (dismissed || statusQuery.isLoading || !statusQuery.data) return null;
  if (!statusQuery.data.hasCredential || statusQuery.data.verified) return null;

  const handleResend = async () => {
    if (!statusQuery.data?.email) return;
    try {
      await resend.mutateAsync({ email: statusQuery.data.email });
      setSent(true);
    } catch {
      // resend already surfaces a rate-limit-safe response; silently ignore duplicate clicks
    }
  };

  return <div className="email-verify-banner" role="status">
    <div className="email-verify-banner-icon"><ShieldAlert size={18} /></div>
    <div className="email-verify-banner-copy">
      <strong>Please verify your email address</strong>
      <span>{sent ? "Verification email sent — check your inbox (and spam folder)." : "We sent a verification link when you registered. Verify to keep full access to your account."}</span>
    </div>
    <button type="button" className="email-verify-banner-action" onClick={handleResend} disabled={resend.isPending || sent}>
      <Mail size={14} /> {resend.isPending ? "Sending…" : sent ? "Sent" : "Resend email"}
    </button>
    <button type="button" className="email-verify-banner-dismiss" aria-label="Dismiss" onClick={() => setDismissed(true)}><X size={15} /></button>
  </div>;
}

export function PortfolioShellBranding({ role }: { role: PortfolioRole }) {
  return <div className={`portfolio-shell-branding portfolio-shell-branding-${role}`}>
    <div className="role-brand-strip"><PortfolioBrandLink role={role} /></div>
    <PortfolioHero role={role} />
    <EmailVerificationBanner />
  </div>;
}

export function PortfolioBrandingPreview({ children }: { children?: ReactNode }) {
  return <div className="portfolio-branding-preview">{children}</div>;
}
