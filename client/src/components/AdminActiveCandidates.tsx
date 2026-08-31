import { useMemo, useState } from "react";
import { CalendarDays, Clock3, FileText, Mail, MoreVertical, Search, SlidersHorizontal, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type CandidateStatus = "all" | "active" | "evaluated" | "applied" | "reviewing" | "shortlisted" | "interview" | "offered" | "hired" | "rejected";
type CandidateDateFilter = "all" | "7d" | "30d" | "older";
type CandidateSort = "recent" | "oldest" | "name" | "vacancy" | "status";
const statusLabels: Record<string, string> = { applied: "Applied", reviewing: "Reviewing", shortlisted: "Shortlisted", interview: "Interview", offered: "Offered", hired: "Hired", rejected: "Rejected" };
function statusTone(status: string) { if (["shortlisted", "interview", "offered", "hired"].includes(status)) return "candidate-status-green"; if (status === "rejected") return "candidate-status-red"; if (status === "reviewing") return "candidate-status-blue"; return "candidate-status-amber"; }
function timeRemaining(deadline: Date | string | null) { if (!deadline) return "No deadline"; const milliseconds = new Date(deadline).getTime() - Date.now(); if (milliseconds <= 0) return "Closed"; const days = Math.floor(milliseconds / 86_400_000); const hours = Math.floor((milliseconds % 86_400_000) / 3_600_000); return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`; }
function formatDate(value: Date | string | null) { return value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—"; }

export function AdminActiveCandidates() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<CandidateStatus>("all");
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [vacancyFilter, setVacancyFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<CandidateDateFilter>("all");
  const [sortBy, setSortBy] = useState<CandidateSort>("recent");
  const query = trpc.admin.activeCandidates.useQuery({ keyword: keyword.trim() || undefined, status }, { refetchInterval: 30_000 });
  const detailQuery = trpc.admin.candidateDetail.useQuery({ applicationId: selectedApplicationId ?? 0 }, { enabled: Boolean(selectedApplicationId) });
  const candidates = query.data ?? [];
  const activeCount = useMemo(() => candidates.filter(candidate => !["rejected", "hired"].includes(candidate.status)).length, [candidates]);
  const evaluatedCount = useMemo(() => candidates.filter(candidate => ["shortlisted", "interview", "offered", "hired", "rejected"].includes(candidate.status)).length, [candidates]);
  const candidateTabs = [["all", `All (${candidates.length})`], ["active", `Active (${activeCount})`], ["evaluated", `Evaluated (${evaluatedCount})`]] as const;
  const vacancyOptions = useMemo(() => Array.from(new Map(candidates.map(candidate => [String(candidate.vacancyId), candidate.vacancyTitle || `Vacancy #${candidate.vacancyId}`])).entries()), [candidates]);
  const filteredCandidates = useMemo(() => {
    const now = Date.now();
    const list = candidates.filter(candidate => {
      const matchesVacancy = vacancyFilter === "all" || String(candidate.vacancyId) === vacancyFilter;
      const appliedAt = new Date(candidate.appliedAt).getTime();
      const matchesDate = dateFilter === "all" || (dateFilter === "7d" && appliedAt >= now - 7 * 86_400_000) || (dateFilter === "30d" && appliedAt >= now - 30 * 86_400_000) || (dateFilter === "older" && appliedAt < now - 30 * 86_400_000);
      return matchesVacancy && matchesDate;
    });
    return list.sort((left, right) => {
      if (sortBy === "name") return (left.seekerName || left.seekerEmail || "").localeCompare(right.seekerName || right.seekerEmail || "");
      if (sortBy === "vacancy") return (left.vacancyTitle || "").localeCompare(right.vacancyTitle || "");
      if (sortBy === "status") return (statusLabels[left.status] || left.status).localeCompare(statusLabels[right.status] || right.status);
      const leftTime = new Date(left.appliedAt).getTime();
      const rightTime = new Date(right.appliedAt).getTime();
      return sortBy === "oldest" ? leftTime - rightTime : rightTime - leftTime;
    });
  }, [candidates, dateFilter, sortBy, vacancyFilter]);
  const detail = detailQuery.data;
  const selectedCandidate = candidates.find(candidate => candidate.applicationId === selectedApplicationId);

  return <section id="admin-candidates" className="dash-panel admin-active-candidates-panel">
    <div className="panel-heading admin-candidates-heading">
      <div><p className="eyebrow">CANDIDATE PIPELINE</p><h2>Active candidates</h2><p className="section-copy">Review persisted applications across the marketplace. Candidate scores and seniority remain unassessed until a verified workflow records them.</p></div>
      <button className="outline-button small" type="button" onClick={() => toast("Candidate invitations remain controlled by the existing application process.")}><UserRound size={15}/> Invite candidate</button>
    </div>
    <div className="admin-candidates-toolbar">
      <div className="admin-candidates-tabs" role="tablist" aria-label="Candidate views">{candidateTabs.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={status === value} className={status === value ? "selected" : ""} onClick={() => { setStatus(value); setSelectedApplicationId(null); }}>{label}</button>)}</div>
      <div className="admin-candidates-controls"><label className="admin-candidates-search"><Search size={16}/><span className="sr-only">Search candidates</span><input value={keyword} onChange={event => { setKeyword(event.target.value); setSelectedApplicationId(null); }} placeholder="Search candidates or vacancies" /></label><button className="outline-button small" type="button" onClick={() => { setKeyword(""); setStatus("all"); setVacancyFilter("all"); setDateFilter("all"); setSortBy("recent"); setSelectedApplicationId(null); }}><SlidersHorizontal size={15}/> Reset</button></div>
      <div className="admin-candidates-filter-grid"><label><span>Vacancy</span><select value={vacancyFilter} onChange={event => { setVacancyFilter(event.target.value); setSelectedApplicationId(null); }}><option value="all">All vacancies</option>{vacancyOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label><span>Applied</span><select value={dateFilter} onChange={event => { setDateFilter(event.target.value as CandidateDateFilter); setSelectedApplicationId(null); }}><option value="all">Any date</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="older">Older than 30 days</option></select></label><label><span>Sort by</span><select value={sortBy} onChange={event => setSortBy(event.target.value as CandidateSort)}><option value="recent">Newest first</option><option value="oldest">Oldest first</option><option value="name">Candidate name</option><option value="vacancy">Vacancy</option><option value="status">Status</option></select></label></div>
    </div>
    {query.isLoading ? <div className="admin-candidates-skeleton" aria-label="Loading candidates"><span/><span/><span/></div> : query.isError ? <div className="empty-state"><Clock3 size={20}/><strong>Candidate list unavailable</strong><span>{query.error.message}</span></div> : candidates.length === 0 ? <div className="empty-state admin-candidates-empty"><UserRound size={24}/><strong>No candidate applications yet</strong><span>Applications will appear here after a seeker submits a live vacancy application.</span></div> : filteredCandidates.length === 0 ? <div className="empty-state admin-candidates-empty"><Search size={24}/><strong>No candidates match these filters</strong><span>Try another vacancy, date range, status tab, or search term.</span></div> : selectedApplicationId && selectedCandidate ? <div className="candidate-detail-workspace">
      <aside className="candidate-list-rail" aria-label="Candidate list"><div className="candidate-list-rail-heading"><div><p className="eyebrow">PIPELINE</p><strong>{filteredCandidates.length} candidate{filteredCandidates.length === 1 ? "" : "s"}</strong></div><button className="candidate-more" type="button" aria-label="Close candidate detail" onClick={() => setSelectedApplicationId(null)}><X size={17}/></button></div>{filteredCandidates.map(candidate => <button key={candidate.applicationId} className={`candidate-list-item ${candidate.applicationId === selectedApplicationId ? "selected" : ""}`} type="button" onClick={() => setSelectedApplicationId(candidate.applicationId)}>{candidate.profilePhotoUrl ? <img src={candidate.profilePhotoUrl} alt="" /> : <span className="candidate-avatar"><UserRound size={15}/></span>}<span><strong>{candidate.seekerName || "Unnamed candidate"}</strong><small>{candidate.vacancyTitle || "Vacancy unavailable"}</small></span><span className={`candidate-status-dot ${statusTone(candidate.status)}`} aria-hidden="true"/></button>)}</aside>
      <div className="candidate-detail-main"><div className="candidate-detail-main-header"><div><p className="eyebrow">CANDIDATE DETAIL</p><h3>{detail?.seeker?.name || selectedCandidate.seekerName || "Selected candidate"}</h3><p className="section-copy">Admin review view · application #{selectedApplicationId}</p></div><button className="outline-button small" type="button" onClick={() => setSelectedApplicationId(null)}>Back to candidates</button></div>{detailQuery.isLoading ? <div className="empty-state"><Clock3 size={20}/><strong>Loading candidate details…</strong></div> : detailQuery.isError ? <div className="empty-state"><Clock3 size={20}/><strong>Candidate detail unavailable</strong><span>{detailQuery.error.message}</span></div> : detail ? <div className="candidate-detail-content"><div className="candidate-profile-hero">{detail.seeker.profilePhotoUrl ? <img src={detail.seeker.profilePhotoUrl} alt="" /> : <span className="candidate-avatar large"><UserRound size={26}/></span>}<div><h4>{detail.seeker.name || "Unnamed candidate"}</h4><p>{detail.seeker.email || detail.application.seekerEmail || "Email not stored"}</p><span className={`candidate-status ${statusTone(detail.application.status)}`}>{statusLabels[detail.application.status] || detail.application.status}</span></div></div><div className="candidate-detail-facts"><div><small>Applied for</small><strong>{detail.vacancy?.title || "Vacancy unavailable"}</strong><span>{detail.vacancy?.company || "Company unavailable"}</span></div><div><small>Location & category</small><strong>{detail.vacancy?.location || "—"}</strong><span>{detail.vacancy?.category || "Category not set"}</span></div><div><small>Application date</small><strong>{formatDate(detail.application.createdAt)}</strong><span>{detail.vacancy?.deadline ? `${timeRemaining(detail.vacancy.deadline)} on vacancy` : "No deadline"}</span></div><div><small>Interview response</small><strong>{detail.application.status === "interview" ? detail.application.interviewResponse || "Pending response" : "Not scheduled"}</strong><span>{detail.application.interviewAt ? formatDate(detail.application.interviewAt) : "No interview date"}</span></div></div><div className="candidate-detail-tabs"><span className="active">Profile</span><span>Application</span><span>Interview</span></div><div className="candidate-detail-description"><h4>Application note</h4><p>{detail.application.coverNote || "No cover note was provided with this application."}</p></div><aside className="candidate-detail-aside"><div><FileText size={18}/><strong>CV access</strong><span>{detail.application.cvDocumentId ? "CV attached to application" : "No CV attached"}</span></div><div><Mail size={18}/><strong>Contact</strong><span>{detail.seeker.email || detail.application.seekerEmail || "Email not stored"}</span></div><p>Score and seniority are not assessed in the current recruitment workflow.</p></aside></div> : null}</div>
    </div> : <div className="admin-candidates-table-wrap"><table className="admin-candidates-table"><thead><tr><th>Name</th><th>Vacancy</th><th>Date & time</th><th>Status</th><th>Deadline</th><th>Score</th><th><span className="sr-only">More</span></th></tr></thead><tbody>{filteredCandidates.map(candidate => <tr key={candidate.applicationId}>
      <td><button className="candidate-row-button" type="button" onClick={() => setSelectedApplicationId(candidate.applicationId)}><span className="candidate-name-cell">{candidate.profilePhotoUrl ? <img src={candidate.profilePhotoUrl} alt="" /> : <span className="candidate-avatar"><UserRound size={16}/></span>}<span><strong>{candidate.seekerName || "Unnamed candidate"}</strong><small>{candidate.seekerEmail || "Email not stored"}</small></span></span></button></td>
      <td><strong>{candidate.vacancyTitle || "Vacancy unavailable"}</strong><small>{candidate.vacancyCategory || "Category not set"}</small></td>
      <td><span className="candidate-date"><CalendarDays size={14}/>{formatDate(candidate.appliedAt)}</span>{candidate.interviewAt && <small>{new Date(candidate.interviewAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} interview</small>}</td>
      <td><span className={`candidate-status ${statusTone(candidate.status)}`}>{statusLabels[candidate.status] || candidate.status}</span>{candidate.interviewResponse && candidate.status === "interview" && <small>{candidate.interviewResponse}</small>}</td>
      <td><span className={timeRemaining(candidate.vacancyDeadline) === "Closed" ? "candidate-deadline closed" : "candidate-deadline"}><Clock3 size={14}/>{timeRemaining(candidate.vacancyDeadline)}</span></td>
      <td><span className="candidate-unassessed">Not assessed</span></td>
      <td><button className="candidate-more" type="button" aria-label={`More actions for ${candidate.seekerName || "candidate"}`} onClick={() => setSelectedApplicationId(candidate.applicationId)}><MoreVertical size={17}/></button></td>
    </tr>)}</tbody></table></div>}
  </section>;
}
