import { CalendarDays, CheckCircle2, CircleAlert, Clock3, ShieldCheck } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

function formatDate(value: Date | string | number) {
  return new Date(value).toLocaleString("en-TZ", { timeZone: "Africa/Dar_es_Salaam", dateStyle: "full", timeStyle: "short" });
}

export default function InterviewInvitePage() {
  const [, params] = useRoute("/interview-invite/:sessionId");
  const [, navigate] = useLocation();
  const sessionId = Number(params?.sessionId);
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const inviteQuery = trpc.interviewInvite.useQuery({ sessionId, token }, { enabled: Number.isInteger(sessionId) && sessionId > 0 && /^[a-f0-9]{64}$/.test(token) });

  if (inviteQuery.isLoading) return <main className="subpage interview-invite-page"><div className="container"><div className="interview-invite-card"><Clock3 size={28} /><p className="eyebrow">SECURE INTERVIEW INVITATION</p><h1>Loading your invitation…</h1><p>Checking the invitation token and schedule securely.</p></div></div></main>;
  if (inviteQuery.isError || !inviteQuery.data) return <main className="subpage interview-invite-page"><div className="container"><div className="interview-invite-card"><CircleAlert size={28} /><p className="eyebrow">INVITATION UNAVAILABLE</p><h1>This interview invitation is invalid or expired.</h1><p>The secure link may have expired or already been replaced. Ask the employer to send a new invitation from Kazipoa.</p><button className="primary-button" onClick={() => navigate("/")}>Go to Kazipoa</button></div></div></main>;

  const session = inviteQuery.data;
  const expired = new Date(session.accessTokenExpiresAt).getTime() <= Date.now();
  return <main className="subpage interview-invite-page"><div className="container"><div className="interview-invite-card"><div className="interview-invite-icon"><ShieldCheck size={28} /></div><p className="eyebrow">SECURE INTERVIEW INVITATION</p><h1>Your interview invitation is ready.</h1><p className="interview-invite-context"><strong>{session.vacancyTitle}</strong><span>{session.vacancyCompany}</span></p><p className="interview-invite-lead">Review the schedule and respond from your Job Seeker dashboard. This link is private and expires after the scheduled interview window.</p><div className="interview-invite-details"><div><CalendarDays size={18} /><span><strong>Scheduled time</strong><small>{formatDate(session.scheduledAt)}</small></span></div><div><Clock3 size={18} /><span><strong>Link expiry</strong><small>{formatDate(session.accessTokenExpiresAt)}</small></span></div><div><ShieldCheck size={18} /><span><strong>Provider status</strong><small>{session.provider === "pending" ? "Live video room is not connected yet" : session.provider}</small></span></div></div>{session.note && <div className="interview-invite-note"><strong>Message from the employer</strong><p>{session.note}</p></div>}<div className="interview-invite-status"><CheckCircle2 size={18} /><span>{expired ? "This invitation has expired." : "Your invitation is securely verified. Sign in to accept or decline it."}</span></div><button className="primary-button" disabled={expired} onClick={() => navigate("/dashboard")}>{expired ? "Invitation expired" : "Open Job Seeker dashboard"}</button></div></div></main>;
}
