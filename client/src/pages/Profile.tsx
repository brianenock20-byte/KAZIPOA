import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, CheckCircle2, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

function initials(name?: string | null) {
  return (name ?? "K").split(" ").filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "K";
}

export default function Profile() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const updatePhone = trpc.auth.updatePhone.useMutation();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setPhone(user?.phone ?? "");
  }, [user?.phone]);

  if (loading || !user) {
    return <main className="profile-page profile-loading"><div className="profile-loading-mark">K</div><p>Opening your secure profile…</p></main>;
  }

  const role = user.role === "admin" ? "Admin" : user.accountType === "employer" ? "Employer" : "Job seeker";
  const accountLabel = user.role === "admin" ? "Admin workspace" : user.accountType === "employer" ? "Employer workspace" : "Job seeker workspace";
  const savePhone = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updatePhone.mutateAsync({ phone: phone.trim() || null });
      toast.success(phone.trim() ? "Phone number saved" : "Phone number removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update phone number");
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-page-glow" />
      <div className="profile-shell">
        <Link href="/dashboard" className="profile-back"><ArrowLeft size={16} /> Back to workspace</Link>
        <section className="profile-hero" aria-labelledby="profile-title">
          <div className="profile-avatar"><UserRound size={30} /><span>{initials(user.name)}</span></div>
          <div><p className="profile-eyebrow">YOUR KAZIPOA PROFILE</p><h1 id="profile-title">Welcome, {user.name || "Kazipoa member"}.</h1><p className="profile-intro">This is your personal profile. This information is only visible on your own account.</p></div>
          <span className="profile-status"><BadgeCheck size={15} /> Active account</span>
        </section>
        <section className="profile-details" aria-label="Profile details">
          <div className="profile-detail-item"><Mail size={18} /><div><span>Email address</span><strong>{user.email || "Email not available"}</strong></div></div>
          <div className="profile-detail-item"><BriefcaseBusiness size={18} /><div><span>Account type</span><strong>{accountLabel}</strong></div></div>
          <div className="profile-detail-item"><ShieldCheck size={18} /><div><span>Access level</span><strong>{role}</strong></div></div>
        </section>
        <section className="profile-contact-panel" aria-labelledby="profile-contact-title">
          <div className="profile-contact-copy"><div className="profile-contact-icon"><Phone size={19} /></div><div><p className="profile-eyebrow">URGENT VACANCY ALERTS</p><h2 id="profile-contact-title">Add your mobile number</h2><p>We will use this number for urgent vacancy SMS alerts only when SMS delivery is approved and configured. Email and in-app alerts remain controlled by your notification preferences.</p></div></div>
          <form className="profile-contact-form" onSubmit={savePhone}>
            <label htmlFor="profile-phone">Tanzania mobile number</label>
            <div className="profile-contact-input-row"><input id="profile-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="+255 712 345 678" aria-describedby="profile-phone-help" /><Button type="submit" disabled={updatePhone.isPending}>{updatePhone.isPending ? "Saving…" : "Save number"}</Button></div>
            <small id="profile-phone-help">Use a Tanzania mobile number. You can clear it any time.</small>
            {updatePhone.isSuccess && <span className="profile-contact-success" role="status"><CheckCircle2 size={14} /> Contact preference saved.</span>}
          </form>
        </section>
        <section className="profile-next-step"><div><p className="profile-eyebrow">NEXT STEP</p><h2>Complete your professional profile</h2><p>Add your CV, education, work experience, skills, and certification details from your workspace.</p></div><Button onClick={() => window.location.assign("/dashboard")} className="profile-primary-button">Open workspace</Button></section>
      </div>
    </main>
  );
}
