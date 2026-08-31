import { useMemo, useState, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, Clock3, Filter, Search, Users, XCircle } from "lucide-react";
import EmployerVacancyManagement from "./EmployerVacancyManagement";
import EmployerCompanyProfileSetup from "./EmployerCompanyProfileSetup";
import EmployerPackageSummary from "./EmployerPackageSummary";

export type EmployerWorkspaceApplication = {
  applicationId: number;
  seekerName?: string | null;
  seekerEmail?: string | null;
  profilePhotoUrl?: string | null;
  vacancyId: number;
  status: string;
  appliedAt: Date | string;
  title?: string | null;
  location?: string | null;
  interviewAt?: Date | string | null;
  interviewNote?: string | null;
  interviewResponse?: string | null;
  skills?: string[];
  experienceTitles?: string[];
  experienceYears?: number;
};

export type EmployerWorkspaceMetric = {
  vacancyId: number;
  title: string;
  status: string;
  deadline: Date | string;
  views: number;
  applications: number;
};

export type EmployerWorkspaceTrend = { label: string; applications: number };

export type EmployerWorkspaceView = "marketplace" | "dashboard" | "candidates" | "interviews";
type WorkspaceView = EmployerWorkspaceView;
type CandidateSort = "recent" | "oldest" | "name" | "vacancy" | "status" | "skills" | "experience";
type InterviewScope = "all" | "invited" | "not_invited";
type InterviewPeriod = "upcoming" | "past";

const statusLabels: Record<string, string> = {
  applied: "New applied",
  reviewing: "Screening",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offering",
  hired: "Hired",
  rejected: "Rejected",
};

function statusLabel(status: string) {
  return statusLabels[status] ?? status.replace(/_/g, " ");
}

function formatDate(value?: Date | string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function isInterviewInvited(application: EmployerWorkspaceApplication) {
  return application.status === "interview" || Boolean(application.interviewAt);
}

function invitationLabel(application: EmployerWorkspaceApplication) {
  if (!isInterviewInvited(application)) return "Not invited";
  if (application.interviewResponse === "accepted") return "Accepted";
  if (application.interviewResponse === "declined") return "Declined";
  return "Invitation sent";
}

function initials(application: EmployerWorkspaceApplication) {
  const name = application.seekerName || application.seekerEmail || "Candidate";
  return name.slice(0, 2).toUpperCase();
}

export function EmployerRecruitmentWorkspaces({
  applications,
  metrics,
  trend,
  isLoading,
  onSelectCandidate,
  showCompanyProfile = false,
  includePackages = true,
  additionalContent,
  bottomContent,
  onPostVacancy,
  activeView,
  onViewChange,
}: {
  applications: EmployerWorkspaceApplication[];
  metrics: EmployerWorkspaceMetric[];
  trend: EmployerWorkspaceTrend[];
  isLoading?: boolean;
  onSelectCandidate?: (applicationId: number) => void;
  showCompanyProfile?: boolean;
  includePackages?: boolean;
  additionalContent?: ReactNode;
  bottomContent?: ReactNode;
  onPostVacancy?: () => void;
  activeView?: WorkspaceView;
  onViewChange?: (view: WorkspaceView) => void;
}) {
  const [internalView, setInternalView] = useState<WorkspaceView>("marketplace");
  const view = activeView ?? internalView;
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateStatus, setCandidateStatus] = useState("all");
  const [candidateVacancy, setCandidateVacancy] = useState("all");
  const [candidateSkill, setCandidateSkill] = useState("all");
  const [candidateExperience, setCandidateExperience] = useState("all");
  const [candidateSort, setCandidateSort] = useState<CandidateSort>("recent");
  const [candidatePage, setCandidatePage] = useState(1);
  const [interviewScope, setInterviewScope] = useState<InterviewScope>("all");
  const [interviewPeriod, setInterviewPeriod] = useState<InterviewPeriod>("upcoming");
  const [interviewSearch, setInterviewSearch] = useState("");
  const pageSize = 8;
  const interviewSessionsQuery = trpc.interviews.employerList.useQuery(undefined, { enabled: view === "interviews" });
  const scheduleInterview = trpc.interviews.schedule.useMutation({ onSuccess: () => interviewSessionsQuery.refetch() });
  const [scheduleTarget, setScheduleTarget] = useState<number | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduleNote, setScheduleNote] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);

  const vacancyOptions = useMemo(() => Array.from(new Map(applications.map(application => [String(application.vacancyId), application.title || `Vacancy #${application.vacancyId}`])).entries()), [applications]);
  const skillOptions = useMemo(() => Array.from(new Set(applications.flatMap(application => application.skills ?? []).filter(Boolean))).sort((left, right) => left.localeCompare(right)), [applications]);
  const sortedCandidates = useMemo(() => {
    const keyword = candidateSearch.trim().toLowerCase();
    return applications
      .filter(application => {
        const searchable = [application.seekerName, application.seekerEmail, application.title, application.location, ...(application.skills ?? []), ...(application.experienceTitles ?? [])].filter(Boolean).join(" ").toLowerCase();
        const experienceYears = application.experienceYears ?? 0;
        const matchesExperience = candidateExperience === "all" || (candidateExperience === "none" ? experienceYears === 0 : candidateExperience === "1_3" ? experienceYears >= 1 && experienceYears < 3 : candidateExperience === "3_5" ? experienceYears >= 3 && experienceYears < 5 : experienceYears >= 5);
        const matchesSkill = candidateSkill === "all" || (application.skills ?? []).some(skill => skill.toLowerCase() === candidateSkill.toLowerCase());
        return (!keyword || searchable.includes(keyword)) && (candidateStatus === "all" || application.status === candidateStatus) && (candidateVacancy === "all" || String(application.vacancyId) === candidateVacancy) && matchesSkill && matchesExperience;
      })
      .sort((left, right) => {
        if (candidateSort === "name") return (left.seekerName || left.seekerEmail || "").localeCompare(right.seekerName || right.seekerEmail || "");
        if (candidateSort === "vacancy") return (left.title || "").localeCompare(right.title || "");
        if (candidateSort === "status") return left.status.localeCompare(right.status);
        if (candidateSort === "skills") return (right.skills?.length ?? 0) - (left.skills?.length ?? 0);
        if (candidateSort === "experience") return (right.experienceYears ?? 0) - (left.experienceYears ?? 0);
        const leftTime = new Date(left.appliedAt).getTime();
        const rightTime = new Date(right.appliedAt).getTime();
        return candidateSort === "oldest" ? leftTime - rightTime : rightTime - leftTime;
      });
  }, [applications, candidateExperience, candidateSearch, candidateSkill, candidateSort, candidateStatus, candidateVacancy]);
  const candidatePageCount = Math.max(1, Math.ceil(sortedCandidates.length / pageSize));
  const visibleCandidates = sortedCandidates.slice((candidatePage - 1) * pageSize, candidatePage * pageSize);

  const interviewRecords = useMemo(() => {
    const now = Date.now();
    const keyword = interviewSearch.trim().toLowerCase();
    return applications.filter(application => {
      const invited = isInterviewInvited(application);
      const searchable = [application.seekerName, application.seekerEmail, application.title].filter(Boolean).join(" ").toLowerCase();
      const time = application.interviewAt ? new Date(application.interviewAt).getTime() : 0;
      const matchesPeriod = !invited || (interviewPeriod === "upcoming" ? time >= now : time < now);
      return (!keyword || searchable.includes(keyword)) && (interviewScope === "all" || (interviewScope === "invited" ? invited : !invited)) && matchesPeriod;
    }).sort((left, right) => {
      const leftTime = left.interviewAt ? new Date(left.interviewAt).getTime() : 0;
      const rightTime = right.interviewAt ? new Date(right.interviewAt).getTime() : 0;
      return rightTime - leftTime;
    });
  }, [applications, interviewPeriod, interviewScope, interviewSearch]);

  const totalApplications = applications.length;
  const shortlisted = applications.filter(application => ["shortlisted", "interview", "offered", "hired"].includes(application.status)).length;
  const onHold = applications.filter(application => application.status === "reviewing").length;
  const activeJobs = metrics.filter(metric => ["live", "approved"].includes(metric.status)).length;
  const maxTrend = Math.max(1, ...trend.map(item => item.applications));
  const maxApplicantsPerVacancy = Math.max(1, ...metrics.map(item => item.applications));
  const applicationStatusCounts = useMemo(() => Object.entries(statusLabels).map(([status, label]) => ({ status, label, count: applications.filter(application => application.status === status).length })).filter(item => item.count > 0), [applications]);
  const newApplicationCount = applications.filter(application => application.status === "applied").length;

  const switchView = (nextView: WorkspaceView) => {
    setInternalView(nextView);
    onViewChange?.(nextView);
    if (nextView === "candidates") setCandidatePage(1);
  };

  const jumpToEmployerSection = (id: string, nextView?: WorkspaceView) => {
    if (nextView) switchView(nextView);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  };

  return <section id="employer-recruitment-workspace" className="employer-recruitment-workspaces" aria-label="Employer portfolio">
    <div className="employer-recruitment-shell">
      <nav className="employer-portfolio-sidebar" aria-label="Employer portfolio sections">
        <p className="eyebrow">EMPLOYER PORTFOLIO</p>
        {showCompanyProfile && <button type="button" className="employer-portfolio-nav-button" onClick={() => jumpToEmployerSection("employer-company-profile")}><Building2 size={15} /> Company profile</button>}
        <button type="button" className={`employer-portfolio-nav-button ${view === "marketplace" ? "active" : ""}`} onClick={() => jumpToEmployerSection("employer-recruitment-workspace", "marketplace")}><BriefcaseBusiness size={15} /> Recruitment workplace</button>
        <button type="button" className={`employer-portfolio-nav-button ${view === "dashboard" ? "active" : ""}`} onClick={() => jumpToEmployerSection("employer-application-trend", "dashboard")}><ArrowRight size={15} /> Application trend</button>
        <button type="button" className={`employer-portfolio-nav-button ${view === "candidates" ? "active" : ""}`} onClick={() => jumpToEmployerSection("employer-candidates", "candidates")}><Users size={15} /> Candidates</button>
        <button type="button" className={`employer-portfolio-nav-button ${view === "interviews" ? "active" : ""}`} onClick={() => jumpToEmployerSection("employer-interviews", "interviews")}><CalendarDays size={15} /> My interviews</button>
        {showCompanyProfile && <button type="button" className="employer-portfolio-nav-button employer-portfolio-nav-bottom" onClick={() => jumpToEmployerSection("employer-payments")}><CheckCircle2 size={15} /> Payments & packages</button>}
      </nav>
      <div className="employer-recruitment-main">
    {showCompanyProfile && <div id="employer-company-profile" className="employer-company-profile-first"><EmployerCompanyProfileSetup /></div>}
    <div className="employer-workspace-topbar">
      <div><p className="eyebrow">RECRUITMENT WORKSPACE</p><h2>{view === "marketplace" ? "Your vacancy history" : view === "dashboard" ? "Application trend" : view === "candidates" ? "Candidates" : "My interviews"}</h2><p className="employer-workspace-subtitle">{view === "marketplace" ? "Manage only your own posted vacancies, history, and employer packages." : "Review your hiring pipeline with real applications from your vacancies."}</p></div>
      <div className="employer-workspace-tabs" role="tablist" aria-label="Employer workspace views">
        {view === "marketplace" && onPostVacancy && <button type="button" className="primary-button small employer-post-vacancy-button" onClick={onPostVacancy}>+ Post vacancy</button>}
        <span className={`employer-new-application-badge ${newApplicationCount > 0 ? "has-new" : ""}`} aria-live="polite"><span aria-hidden="true" />{newApplicationCount > 0 ? `${newApplicationCount} new application${newApplicationCount === 1 ? "" : "s"}` : "No new applications"}</span>
        {(["marketplace", "dashboard", "candidates", "interviews"] as WorkspaceView[]).map(tab => <button key={tab} type="button" role="tab" aria-selected={view === tab} className={view === tab ? "active" : ""} onClick={() => switchView(tab)}>{tab === "marketplace" ? "Recruitment workplace" : tab === "dashboard" ? "Application trend" : tab === "candidates" ? "Candidates" : "My interviews"}</button>)}
      </div>
    </div>

    {isLoading ? <div className="employer-workspace-empty" role="status"><Clock3 size={20}/><strong>Loading recruitment data…</strong><span>Applications and interview records are being refreshed.</span></div> : view === "marketplace" ? <div className="employer-marketplace-view"><EmployerVacancyManagement metrics={metrics} />{includePackages && <EmployerPackageSummary />}</div> : view === "dashboard" ? <div id="employer-application-trend" className="employer-dashboard-view">
      <div className="employer-dashboard-kpis">
        <button type="button" onClick={() => switchView("candidates")}><span>Applications</span><strong>{totalApplications}</strong><small>All persisted applications</small></button>
        <button type="button" onClick={() => switchView("candidates")}><span>Shortlisted</span><strong>{shortlisted}</strong><small>Shortlisted, interview, offer, or hired</small></button>
        <button type="button" onClick={() => switchView("candidates")}><span>On hold</span><strong>{onHold}</strong><small>Currently under review</small></button>
        <button type="button" onClick={() => switchView("interviews")}><span>Active jobs</span><strong>{activeJobs}</strong><small>Live or approved vacancies</small></button>
      </div>
      <div className="employer-dashboard-columns">
        <section className="employer-dashboard-card employer-trend-card"><div className="employer-dashboard-card-heading"><div><p className="eyebrow">APPLICATION TREND</p><h3>Hiring activity</h3></div><span>{trend.length ? `${trend.reduce((sum, item) => sum + item.applications, 0)} records` : "No records"}</span></div>{trend.length ? <div className="employer-trend-bars" aria-label="Persisted application trend">{trend.slice(-8).map(item => <div className="employer-trend-bar" key={item.label}><div><span>{item.applications}</span><i style={{ height: `${Math.max(8, (item.applications / maxTrend) * 100)}%` }} /></div><small>{item.label}</small></div>)}</div> : <div className="employer-inline-empty"><Clock3 size={17}/><span>Application trend will appear after candidates apply.</span></div>}</section>
        <section className="employer-dashboard-card"><div className="employer-dashboard-card-heading"><div><p className="eyebrow">SCHEDULED MEETINGS</p><h3>Upcoming interviews</h3></div><button type="button" className="text-button" onClick={() => switchView("interviews")}>View all <ArrowRight size={14}/></button></div>{interviewRecords.filter(application => isInterviewInvited(application)).slice(0, 4).map(application => <button type="button" className="employer-meeting-row" key={application.applicationId} onClick={() => onSelectCandidate?.(application.applicationId)}><CalendarDays size={16}/><span><strong>{application.seekerName || application.seekerEmail || `Candidate #${application.applicationId}`}</strong><small>{application.title || "Vacancy"} · {formatDate(application.interviewAt)}</small></span><span className={`employer-invite-status ${application.interviewResponse || "pending"}`}>{invitationLabel(application)}</span></button>)}{!interviewRecords.some(application => isInterviewInvited(application)) && <div className="employer-inline-empty"><CalendarDays size={17}/><span>No interview invitations scheduled yet.</span></div>}</section>
      </div>
      <div className="employer-dashboard-columns">
        <section className="employer-dashboard-card"><div className="employer-dashboard-card-heading"><div><p className="eyebrow">ACTIVE JOBS</p><h3>Vacancy performance</h3></div><span>{metrics.length} total</span></div>{metrics.slice(0, 5).map(metric => <div className="employer-job-performance" key={metric.vacancyId}><div><strong>{metric.title}</strong><small>{statusLabel(metric.status)} · Deadline {formatDate(metric.deadline)}</small></div><span><b>{metric.applications}</b> applications · {metric.views} views</span></div>)}{!metrics.length && <div className="employer-inline-empty"><BriefcaseBusiness size={17}/><span>Your vacancy performance will appear here after a vacancy is saved.</span></div>}</section>
        <section className="employer-dashboard-card"><div className="employer-dashboard-card-heading"><div><p className="eyebrow">NEW APPLICATIONS</p><h3>Latest candidates</h3></div><button type="button" className="text-button" onClick={() => switchView("candidates")}>Open candidates <ArrowRight size={14}/></button></div>{applications.slice(0, 5).map(application => <button type="button" className="employer-new-application-row" key={application.applicationId} onClick={() => onSelectCandidate?.(application.applicationId)}>{application.profilePhotoUrl ? <img src={application.profilePhotoUrl} alt="" /> : <span className="employer-workspace-avatar">{initials(application)}</span>}<span><strong>{application.seekerName || application.seekerEmail || `Candidate #${application.applicationId}`}</strong><small>Applied for {application.title || "Vacancy"} · {formatDate(application.appliedAt)}</small></span><span className={`employer-stage-badge status-${application.status}`}>{statusLabel(application.status)}</span></button>)}{!applications.length && <div className="employer-inline-empty"><Users size={17}/><span>No applications yet. New candidates will appear here after they apply.</span></div>}</section>
      </div>
      <div className="employer-analytics-chart-grid" aria-label="Employer applicant analytics charts">
        <section className="employer-dashboard-card employer-analytics-chart-card"><div className="employer-dashboard-card-heading"><div><p className="eyebrow">APPLICANTS BY VACANCY</p><h3>Which roles attract candidates</h3></div><span>Persisted applications</span></div>{metrics.length ? <div className="employer-applicant-bars">{metrics.slice(0, 6).map(metric => <div className="employer-applicant-bar-row" key={metric.vacancyId}><div><span>{metric.title}</span><strong>{metric.applications}</strong></div><div className="employer-applicant-bar-track"><i style={{ width: `${(metric.applications / maxApplicantsPerVacancy) * 100}%` }} /></div></div>)}</div> : <div className="employer-inline-empty"><BriefcaseBusiness size={17}/><span>Applicant counts by vacancy will appear after a role is posted.</span></div>}</section>
        <section className="employer-dashboard-card employer-analytics-chart-card"><div className="employer-dashboard-card-heading"><div><p className="eyebrow">APPLICATION STATUS</p><h3>Pipeline distribution</h3></div><span>{applications.length} total</span></div>{applicationStatusCounts.length ? <div className="employer-status-chart">{applicationStatusCounts.map(item => <div className="employer-status-chart-row" key={item.status}><div><span className={`employer-stage-badge status-${item.status}`}>{item.label}</span><strong>{item.count}</strong></div><div className="employer-status-track"><i style={{ width: `${(item.count / Math.max(1, applications.length)) * 100}%` }} /></div></div>)}</div> : <div className="employer-inline-empty"><Users size={17}/><span>Status distribution will appear after candidates apply.</span></div>}</section>
      </div>
    </div> : view === "candidates" ? <div id="employer-candidates" className="employer-candidates-view">
      <div className="employer-view-toolbar"><label className="employer-search-field"><Search size={16}/><span className="sr-only">Search candidates</span><input value={candidateSearch} onChange={event => { setCandidateSearch(event.target.value); setCandidatePage(1); }} placeholder="Search name, skill, or position" /></label><label><span>Status</span><select value={candidateStatus} onChange={event => { setCandidateStatus(event.target.value); setCandidatePage(1); }}><option value="all">All stages</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label><span>Vacancy</span><select value={candidateVacancy} onChange={event => { setCandidateVacancy(event.target.value); setCandidatePage(1); }}><option value="all">All vacancies</option>{vacancyOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label><span>Skill</span><select value={candidateSkill} onChange={event => { setCandidateSkill(event.target.value); setCandidatePage(1); }}><option value="all">All skills</option>{skillOptions.map(skill => <option value={skill} key={skill}>{skill}</option>)}</select></label><label><span>Experience</span><select value={candidateExperience} onChange={event => { setCandidateExperience(event.target.value); setCandidatePage(1); }}><option value="all">Any experience</option><option value="none">No experience listed</option><option value="1_3">1–3 years</option><option value="3_5">3–5 years</option><option value="5_plus">5+ years</option></select></label><label><span>Sort</span><select value={candidateSort} onChange={event => { setCandidateSort(event.target.value as CandidateSort); setCandidatePage(1); }}><option value="recent">Newest applied</option><option value="oldest">Oldest applied</option><option value="name">Candidate name</option><option value="vacancy">Position</option><option value="status">Stage</option><option value="skills">Most skills</option><option value="experience">Most experience</option></select></label><button type="button" className="outline-button small" onClick={() => { setCandidateSearch(""); setCandidateStatus("all"); setCandidateVacancy("all"); setCandidateSkill("all"); setCandidateExperience("all"); setCandidateSort("recent"); setCandidatePage(1); }}><Filter size={14}/> Reset</button></div>
      <div className="employer-candidates-summary"><span>{sortedCandidates.length} matching candidate{sortedCandidates.length === 1 ? "" : "s"}</span><span>Page {candidatePage} of {candidatePageCount}</span></div>
      <div className="employer-candidates-table-wrap"><table className="employer-candidates-table"><thead><tr><th>Candidate name</th><th>Applied position</th><th>Stage</th><th>Applied date</th><th>Action</th></tr></thead><tbody>{visibleCandidates.map(application => <tr key={application.applicationId}><td><button type="button" className="employer-candidate-identity-button" onClick={() => onSelectCandidate?.(application.applicationId)}>{application.profilePhotoUrl ? <img src={application.profilePhotoUrl} alt="" /> : <span className="employer-workspace-avatar">{initials(application)}</span>}<span><strong>{application.seekerName || application.seekerEmail || `Candidate #${application.applicationId}`}</strong><small>{application.seekerEmail || "Email not stored"}</small><small className="employer-candidate-profile-meta">{application.skills?.length ? `${application.skills.slice(0, 2).join(", ")}${application.skills.length > 2 ? "…" : ""}` : "Skills not added"} · {application.experienceYears ? `${application.experienceYears.toFixed(1)} yrs experience` : "Experience not added"}</small></span></button></td><td>{application.title || "Vacancy unavailable"}<small>{application.location || "Location not stored"}</small></td><td><span className={`employer-stage-badge status-${application.status}`}>{statusLabel(application.status)}</span></td><td>{formatDate(application.appliedAt)}</td><td><button type="button" className="text-button" onClick={() => onSelectCandidate?.(application.applicationId)}>View profile <ArrowRight size={13}/></button></td></tr>)}</tbody></table>{!visibleCandidates.length && <div className="employer-workspace-empty"><Search size={20}/><strong>{applications.length ? "No candidates match these filters" : "No applications yet"}</strong><span>{applications.length ? "Try another status, vacancy, or search term." : "New applications will appear here after seekers apply."}</span></div>}</div>
      {candidatePageCount > 1 && <div className="employer-pagination"><button type="button" className="outline-button small" disabled={candidatePage === 1} onClick={() => setCandidatePage(page => Math.max(1, page - 1))}>Previous</button><span>Page {candidatePage} of {candidatePageCount}</span><button type="button" className="outline-button small" disabled={candidatePage === candidatePageCount} onClick={() => setCandidatePage(page => Math.min(candidatePageCount, page + 1))}>Next</button></div>}
    </div> : <div id="employer-interviews" className="employer-interviews-view">
      <div className="employer-interview-provider-note"><p className="eyebrow">EMPLOYER LIVE INTERVIEW</p><strong>Live interview</strong><span>Video provider setup required. Secure rooms will remain unavailable while no video provider is connected yet.</span></div>
      <div className="employer-interview-toolbar"><label className="employer-search-field"><Search size={16}/><span className="sr-only">Search interview candidates</span><input value={interviewSearch} onChange={event => setInterviewSearch(event.target.value)} placeholder="Search candidates or positions" /></label><div className="employer-segmented-control" role="tablist" aria-label="Interview invitation scope">{(["all", "invited", "not_invited"] as InterviewScope[]).map(scope => <button key={scope} type="button" role="tab" aria-selected={interviewScope === scope} className={interviewScope === scope ? "active" : ""} onClick={() => setInterviewScope(scope)}>{scope === "all" ? "All candidates" : scope === "invited" ? "Invited" : "Not invited"}</button>)}</div><label><span>Show</span><select value={interviewPeriod} onChange={event => setInterviewPeriod(event.target.value as InterviewPeriod)}><option value="upcoming">Upcoming</option><option value="past">Past</option></select></label></div>
      <div className="employer-candidates-summary"><span>{interviewRecords.length} candidate{interviewRecords.length === 1 ? "" : "s"}</span><span>Invitation status and scheduled date</span><span>{interviewSessionsQuery.isLoading ? "Loading saved sessions…" : `${interviewSessionsQuery.data?.length ?? 0} saved session${(interviewSessionsQuery.data?.length ?? 0) === 1 ? "" : "s"}`}</span></div>
      <div className="employer-interview-table-wrap"><table className="employer-interview-table"><thead><tr><th>Candidate name</th><th>Applied position</th><th>Invitation status</th><th>Interview date</th><th>Action</th></tr></thead><tbody>{interviewRecords.map(application => <tr key={application.applicationId}><td><button type="button" className="employer-candidate-identity-button" onClick={() => onSelectCandidate?.(application.applicationId)}>{application.profilePhotoUrl ? <img src={application.profilePhotoUrl} alt="" /> : <span className="employer-workspace-avatar">{initials(application)}</span>}<span><strong>{application.seekerName || application.seekerEmail || `Candidate #${application.applicationId}`}</strong><small>{application.seekerEmail || "Email not stored"}</small></span></button></td><td>{application.title || "Vacancy unavailable"}</td><td><span className={`employer-invite-status ${application.interviewResponse || (isInterviewInvited(application) ? "pending" : "not-invited")}`}>{invitationLabel(application)}</span></td><td>{isInterviewInvited(application) ? formatDate(application.interviewAt) : "Not scheduled"}</td><td><div className="employer-interview-actions"><button type="button" className="text-button" onClick={() => onSelectCandidate?.(application.applicationId)}>Review <ArrowRight size={13}/></button>{["shortlisted", "interview"].includes(application.status) && <button type="button" className="text-button" onClick={() => { setScheduleTarget(application.applicationId); setScheduleAt(application.interviewAt ? new Date(application.interviewAt).toISOString().slice(0, 16) : ""); setScheduleNote(application.interviewNote ?? ""); setScheduleMessage(null); }}>{isInterviewInvited(application) ? "Reschedule" : "Schedule"}</button>}</div>{scheduleTarget === application.applicationId && <form className="employer-schedule-form" onSubmit={async event => { event.preventDefault(); setScheduleMessage(null); try { await scheduleInterview.mutateAsync({ applicationId: application.applicationId, scheduledAt: new Date(scheduleAt), note: scheduleNote.trim() || undefined }); setScheduleMessage("Interview saved. Delivery status will remain visible until providers are configured."); setScheduleTarget(null); } catch (error) { setScheduleMessage(error instanceof Error ? error.message : "Unable to schedule interview"); } }}><label><span>Date and time</span><input type="datetime-local" value={scheduleAt} onChange={event => setScheduleAt(event.target.value)} required /></label><label><span>Message for candidate</span><textarea value={scheduleNote} onChange={event => setScheduleNote(event.target.value)} maxLength={2000} placeholder="Add practical interview details" /></label><div><button type="submit" className="primary-button small" disabled={scheduleInterview.isPending}>{scheduleInterview.isPending ? "Saving…" : "Save invite"}</button><button type="button" className="outline-button small" onClick={() => setScheduleTarget(null)}>Cancel</button></div></form>}{scheduleMessage && <small className="employer-schedule-message" role="status">{scheduleMessage}</small>}</td></tr>)}</tbody></table>{!interviewRecords.length && <div className="employer-workspace-empty"><CalendarDays size={20}/><strong>{applications.length ? "No interview records match these filters" : "No interview records yet"}</strong><span>{applications.length ? "Switch invitation scope or period to see another set of records." : "Candidates will appear here when interview invitations are scheduled."}</span></div>}</div>
    </div>}
      {additionalContent}
      {bottomContent}
      </div>
    </div>
  </section>;
}

export default EmployerRecruitmentWorkspaces;
