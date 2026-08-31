import { ArrowRight, Eye, LockKeyhole, ShieldCheck, X } from "lucide-react";
import { startLogin } from "@/const";
import { storageUrl } from "@/lib/storageUrl";
import { useEffect } from "react";

export const AUTH_HANDOFF_DELAY_MS = 350;

type AuthHandoffProps = {
  open: boolean;
  mode: "sign-in" | "create-profile";
  onCancel: () => void;
};

export default function AuthHandoff({ open, mode, onCancel }: AuthHandoffProps) {
  const isSignIn = mode === "sign-in";

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => startLogin(), AUTH_HANDOFF_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="auth-handoff-backdrop" role="presentation">
      <section className="auth-handoff" role="dialog" aria-modal="true" aria-labelledby="auth-handoff-title">
        <button className="auth-handoff-close" type="button" onClick={onCancel} aria-label="Cancel sign-in">
          <X size={18} />
        </button>
        <div className="auth-handoff-visual">
          <img src={storageUrl("kazipoa-hero_3140ef94.jpg")} alt="Professional at work in a Tanzanian workplace" />
          <div className="auth-handoff-visual-scrim" />
          <div className="auth-handoff-visual-copy">
            <span className="auth-handoff-kicker"><ShieldCheck size={14} /> Kazipoa secure access</span>
            <strong>{isSignIn ? "Return to your workspace." : "Start your professional profile."}</strong>
            <span>Find work, present your skills, and move forward with confidence.</span>
          </div>
        </div>
        <div className="auth-handoff-content">
          <div className="auth-handoff-icon"><LockKeyhole size={21} /></div>
          <p className="eyebrow">{isSignIn ? "WELCOME BACK" : "CREATE YOUR ACCOUNT"}</p>
          <h2 id="auth-handoff-title">{isSignIn ? "Opening secure sign in." : "Opening secure registration."}</h2>
          <p className="auth-handoff-copy">Your email and password are handled by Kazipoa’s secure sign-in provider. Kazipoa does not ask for or store your password on this page.</p>
          <div className="auth-handoff-status" aria-live="polite">
            <span className="auth-handoff-spinner" aria-hidden="true" />
            <span>{isSignIn ? "Taking you to sign in…" : "Taking you to account creation…"}</span>
          </div>
          <div className="auth-handoff-note"><Eye size={15} /><span>Tip: passwords are case-sensitive. If your password appears not to work, check the Caps Lock indicator on the secure sign-in page.</span></div>
          <button className="outline-button auth-handoff-cancel" type="button" onClick={onCancel}>Stay on Kazipoa <ArrowRight size={15} /></button>
        </div>
      </section>
    </div>
  );
}
