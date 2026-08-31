import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { storageUrl } from "@/lib/storageUrl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { emailValidationMessage, nextCapsLockState, normalizeEmailInput, passwordInputType, passwordStrength, passwordToggleLabel, passwordValidationMessage } from "@/lib/authUi";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

type AuthMode = "login" | "register" | "forgot" | "reset" | "verify";

type CustomAuthProps = {
  mode: AuthMode;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [focused, setFocused] = useState(false);

  const readCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(current => nextCapsLockState(current, event));
  };

  useEffect(() => {
    if (!focused) return;
    const readWindowCapsLock = (event: KeyboardEvent) => {
      const active = document.activeElement;
      if (active instanceof HTMLInputElement && active.id === id) {
        setCapsLockOn(current => nextCapsLockState(current, event));
      }
    };
    const clearWhenHidden = () => setCapsLockOn(false);
    window.addEventListener("keyup", readWindowCapsLock);
    document.addEventListener("visibilitychange", clearWhenHidden);
    return () => {
      window.removeEventListener("keyup", readWindowCapsLock);
      document.removeEventListener("visibilitychange", clearWhenHidden);
    };
  }, [focused, id]);

  const handleFocus = () => {
    setFocused(true);
    setCapsLockOn(false);
  };

  const handleBlur = () => {
    setFocused(false);
    setCapsLockOn(false);
  };

  return (
    <div className="custom-auth-field">
      <Label htmlFor={id}>{label}</Label>
      <div className="custom-auth-password-wrap">
        <Input
          id={id}
          name={id}
          type={passwordInputType(visible)}
          value={value}
          onChange={event => onChange(event.target.value)}
          onFocus={handleFocus}
          onKeyDown={readCapsLock}
          onKeyUp={readCapsLock}
          onBlur={handleBlur}
          autoComplete={autoComplete}
          aria-describedby={`${id}-hint${capsLockOn ? ` ${id}-caps` : ""}`}
          required
        />
        <button
          type="button"
          className="custom-auth-password-toggle"
          onClick={() => setVisible(current => !current)}
          aria-label={passwordToggleLabel(label, visible)}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && <p id={`${id}-hint`} className="custom-auth-field-hint">{hint}</p>}
      {capsLockOn && <p id={`${id}-caps`} className="custom-auth-caps" role="status">Caps Lock imewashwa. Password ni case-sensitive.</p>}
    </div>
  );
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = passwordStrength(password);
  if (strength === "empty") return null;
  const copy = { weak: "Nenosiri dhaifu", fair: "Nenosiri la wastani", strong: "Nenosiri imara" }[strength];
  return <div className={`custom-auth-strength custom-auth-strength-${strength}`} role="status" aria-live="polite"><span className="custom-auth-strength-bars" aria-hidden="true"><i /><i /><i /><i /></span><span>{copy}</span></div>;
}

function GoogleSignInButton({ mode }: { mode: "login" | "register" }) {
  return (
    <div className="custom-auth-google-entry">
      <Button type="button" variant="outline" onClick={() => startLogin()} className="custom-auth-google-button">
        <span className="custom-auth-google-mark" aria-hidden="true">G</span>
        {mode === "register" ? "Continue with Google" : "Continue with Google"}
      </Button>
      <p>{mode === "register" ? "Create your Kazipoa account securely with Google." : "Continue securely with your Google account."}</p>
    </div>
  );
}

function AuthShell({ children, eyebrow, title, description }: { children: React.ReactNode; eyebrow: string; title: string; description: string }) {
  return (
    <main className="custom-auth-page" data-auth-layout="kazipoa-premium-v2">
      <section className="custom-auth-visual" aria-label="Kazipoa secure access">
        <img src={storageUrl("kazipoa-hero_3140ef94.jpg")} alt="Professional at work in a Tanzanian workplace" />
        <div className="custom-auth-visual-scrim" />
        <div className="custom-auth-visual-copy">
          <Link href="/" className="custom-auth-back"><ArrowLeft size={15} /> Back to Kazipoa</Link>
          <div className="custom-auth-visual-badge"><Sparkles size={15} /> Secure access</div>
          <h1>Find work.<br />Find talent.<br /><span>Move forward.</span></h1>
          <p>Your next opportunity starts with a trusted profile.</p>
          <div className="custom-auth-trust-row"><ShieldCheck size={16} /> Your credentials are protected during sign in.</div>
        </div>
      </section>
      <section className="custom-auth-panel" aria-labelledby="custom-auth-title">
        <div className="custom-auth-theme-toggle"><ThemeToggle /></div>
        <div className="custom-auth-panel-inner">
          <div className="custom-auth-brand-mark" aria-hidden="true">K</div>
          <p className="custom-auth-eyebrow">{eyebrow}</p>
          <h2 id="custom-auth-title">{title}</h2>
          <p className="custom-auth-description">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

export default function CustomAuth({ mode }: CustomAuthProps) {
  const [, navigate] = useLocation();
  const statusQuery = trpc.auth.customStatus.useQuery();
  const utils = trpc.useUtils();
  const login = trpc.auth.customLogin.useMutation();
  const register = trpc.auth.customRegister.useMutation();
  const verifyEmail = trpc.auth.verifyEmail.useMutation();
  const resendVerification = trpc.auth.resendVerification.useMutation();
  const requestReset = trpc.auth.requestPasswordReset.useMutation();
  const resetPassword = trpc.auth.resetPassword.useMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"seeker" | "employer">("seeker");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") ?? "", []);
  const isBusy = login.isPending || register.isPending || verifyEmail.isPending || resendVerification.isPending || requestReset.isPending || resetPassword.isPending;

  useEffect(() => {
    setFormError(null);
    setMessage(null);
  }, [mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setMessage(null);
    const normalizedEmail = normalizeEmailInput(email);
    const nextEmailError = emailValidationMessage(normalizedEmail);
    const nextPasswordError = mode !== "forgot" ? passwordValidationMessage(password) : null;
    setEmailTouched(true);
    if (nextEmailError || nextPasswordError || (mode === "register" && password !== confirmPassword)) {
      setPasswordTouched(true);
      setFormError(mode === "register" && password !== confirmPassword ? "Nenosiri mbili hazifanani." : nextEmailError ?? nextPasswordError);
      return;
    }
    if (!statusQuery.data?.enabled) {
      setFormError("Custom email/password pilot is disabled. Use the secure provider option below.");
      return;
    }
    try {
      if (mode === "login") {
        const result = await login.mutateAsync({ email: normalizedEmail, password, rememberMe });
        await utils.auth.me.invalidate();
        setSuccessMessage("Umeingia Kazipoa. Karibu kwenye workspace yako.");
        toast.success("Umeingia Kazipoa");
        window.setTimeout(() => window.location.assign("/profile"), 850);
        return result;
      }
      if (mode === "register") {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        const result = await register.mutateAsync({ name, email: normalizedEmail, password, accountType });
        setSuccessMessage("Akaunti yako imetengenezwa. Hatua inayofuata ni kuthibitisha email yako.");
        setMessage(result.emailDelivery === "sent" ? "Account created. Check your email and spam folder to verify it before signing in." : "Account created, but the verification email could not be sent. Contact Kazipoa support while the email provider is being activated.");
        return result;
      }
      if (mode === "forgot") {
        const result = await requestReset.mutateAsync({ email: normalizedEmail });
        setSuccessMessage("Ombi limefanikiwa. Kama akaunti ipo, barua pepe ya kurejesha nenosiri imetumwa; angalia inbox na spam folder yako.");
        setMessage(result.message);
        return result;
      }
      if (mode === "reset") {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        const result = await resetPassword.mutateAsync({ token, password });
        toast.success("Password updated");
        setMessage("Password updated successfully. You can now sign in.");
        navigate("/login");
        return result;
      }
      return undefined;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setFormError(errorMessage);
      toast.error(errorMessage);
      return undefined;
    }
  };

  const handleResendVerification = async () => {
    setFormError(null);
    setMessage(null);
    const normalizedEmail = normalizeEmailInput(email);
    if (!normalizedEmail) {
      setFormError("Enter your email address first.");
      return;
    }
    try {
      const result = await resendVerification.mutateAsync({ email: normalizedEmail });
      setMessage(result.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to resend the verification email.";
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleVerify = async () => {
    setFormError(null);
    try {
      await verifyEmail.mutateAsync({ token });
      setSuccessMessage("Email imethibitishwa. Tunafungua wasifu wako salama…");
      setMessage("Uthibitisho umekamilika.");
      window.setTimeout(() => window.location.assign("/profile"), 850);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "This verification link is invalid or expired.";
      setFormError(errorMessage);
    }
  };

  if (statusQuery.isLoading) {
    return <div className="custom-auth-loading"><Loader2 className="animate-spin" size={24} /> Checking secure access…</div>;
  }

  const enabled = Boolean(statusQuery.data?.enabled);
  const modeCopy = {
    login: { eyebrow: "Welcome back", title: "Sign in to Kazipoa", description: "Continue to your private workspace and keep your profile moving forward." },
    register: { eyebrow: "Start your journey", title: "Create your Kazipoa account", description: "Choose the workspace that matches your goal. Your account type controls the tools and information you see after sign up." },
    forgot: { eyebrow: "Account recovery", title: "Reset your password", description: "Enter your email and we will send a one-time password reset link if an account exists." },
    reset: { eyebrow: "New password", title: "Choose a new password", description: "Use a strong passphrase you do not reuse on another service." },
    verify: { eyebrow: "Almost there", title: "Verify your email", description: "Confirm your email address to activate custom sign in for this pilot." },
  }[mode];

  return (
    <AuthShell {...modeCopy}>
      {!enabled && mode !== "verify" && <div className="custom-auth-pilot-note"><LockKeyhole size={17} /><span><strong>Pilot preview</strong><small>Custom email/password is being tested separately. OAuth remains the active production sign-in.</small></span></div>}
      {mode === "verify" ? (
        <div className="custom-auth-message-card">
          <div className="custom-auth-success-icon"><Mail size={22} /></div>
          <p>{message ?? "Click below to verify this email address."}</p>
          {formError && <p className="custom-auth-error" role="alert">{formError}</p>}
          <Button type="button" onClick={handleVerify} disabled={!enabled || isBusy || !token} className="custom-auth-primary-button">{verifyEmail.isPending ? <Loader2 className="animate-spin" size={17} /> : "Verify email"}</Button>
          <Link href="/login" className="custom-auth-text-link">Back to sign in</Link>
        </div>
      ) : (
        <>
        {successMessage && <div className="custom-auth-success-banner" role="status"><CheckCircle2 size={19} /><span>{successMessage}</span></div>}
        {(mode === "login" || mode === "register") && <GoogleSignInButton mode={mode} />}
        {(mode === "login" || mode === "register") && <div className="custom-auth-divider"><span>{mode === "register" ? "or use email and password" : "or continue with email and password"}</span></div>}
        <form className="custom-auth-form" onSubmit={handleSubmit} noValidate>
          {mode === "register" && (
            <div className="custom-auth-field"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={event => setName(event.target.value)} autoComplete="name" placeholder="Your full name" required /></div>
          )}
          <div className="custom-auth-field"><Label htmlFor="email">Email address</Label><div className="custom-auth-input-icon"><Mail size={17} /><Input id="email" type="email" value={email} onChange={event => { setEmail(normalizeEmailInput(event.target.value)); setEmailTouched(true); }} onBlur={() => { setEmail(current => normalizeEmailInput(current)); setEmailTouched(true); }} autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(emailTouched && emailValidationMessage(email))} aria-describedby={emailTouched && emailValidationMessage(email) ? "email-error" : undefined} required /></div>{emailTouched && emailValidationMessage(email) && <p id="email-error" className="custom-auth-inline-error" role="alert">{emailValidationMessage(email)}</p>}</div>
          {mode === "register" && (
            <div className="custom-auth-field"><Label>Choose your workspace</Label><p className="custom-auth-role-help">Select the path you want to use. You can create a separate account later if you need both workspaces.</p><div className="custom-auth-role-grid" role="group" aria-label="Choose a Kazipoa workspace"><button type="button" aria-pressed={accountType === "seeker"} className={accountType === "seeker" ? "selected" : ""} onClick={() => setAccountType("seeker")}><strong>Job Seeker</strong><span>Looking for work</span><small>Search verified vacancies, save roles, apply with your CV, and track interviews.</small></button><button type="button" aria-pressed={accountType === "employer"} className={accountType === "employer" ? "selected" : ""} onClick={() => setAccountType("employer")}><strong>Employer</strong><span>Hiring talent</span><small>Create a company profile, post vacancies, review applicants, and manage interviews.</small></button></div><p className="custom-auth-role-selection" role="status">Selected: <strong>{accountType === "seeker" ? "Job Seeker workspace" : "Employer workspace"}</strong></p></div>
          )}
          {mode !== "forgot" && <PasswordField id="password" label={mode === "reset" ? "New password" : "Password"} value={password} onChange={value => { setPassword(value); setPasswordTouched(true); }} autoComplete={mode === "reset" || mode === "register" ? "new-password" : "current-password"} hint="Choose any password you'll remember." />}
          {mode === "register" && <PasswordStrengthIndicator password={password} />}
          {mode !== "forgot" && passwordTouched && passwordValidationMessage(password) && <p className="custom-auth-inline-error" role="alert">{passwordValidationMessage(password)}</p>}
          {(mode === "register" || mode === "reset") && <PasswordField id="confirmPassword" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />}
          {formError && <p className="custom-auth-error" role="alert">{formError}</p>}
          {message && <p className="custom-auth-success" role="status"><CheckCircle2 size={17} /> {message}</p>}
          {mode === "login" && <label className="custom-auth-remember"><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} /><span>Nikumbuke kwenye kifaa hiki</span></label>}
          <Button type="submit" disabled={!enabled || isBusy} className="custom-auth-primary-button">{isBusy ? <><Loader2 className="animate-spin" size={17} /> Please wait…</> : !enabled ? "Pilot disabled" : mode === "login" ? "Sign in securely" : mode === "register" ? "Create account" : mode === "forgot" ? "Send reset link" : "Update password"}</Button>
          {mode === "login" && <Link href="/forgot-password" className="custom-auth-text-link">Umesahau Nenosiri?</Link>}
          {mode === "login" && <div className="custom-auth-verification-help"><span>Didn’t receive your verification email?</span><Button type="button" variant="outline" onClick={handleResendVerification} disabled={!enabled || isBusy || !email.trim()} className="custom-auth-secondary-button">{resendVerification.isPending ? <><Loader2 className="animate-spin" size={16} /> Resending…</> : "Resend verification email"}</Button></div>}
          <div className="custom-auth-links">{mode === "login" ? <span>New to Kazipoa? <Link href="/register">Create an account</Link></span> : <span>Already have an account? <Link href="/login">Sign in</Link></span>}</div>
        </form>
        </>
      )}
    </AuthShell>
  );
}
