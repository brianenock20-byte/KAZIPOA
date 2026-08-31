import { useMemo, useState } from "react";
import { AlertTriangle, BriefcaseBusiness, CheckCircle2, Clock3, Download, Eye, Filter, Pencil, Save, Search, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { EmployerWorkspaceMetric } from "./EmployerRecruitmentWorkspaces";

type EmployerVacancy = {
  id: number;
  company: string;
  title: string;
  category: string;
  location: string;
  contractType?: string | null;
  salary: string | null;
  description: string;
  deadline: Date | string;
  status: string;
  createdAt: Date | string;
};

type VacancyDraft = Pick<EmployerVacancy, "company" | "title" | "category" | "location" | "contractType" | "salary" | "description" | "deadline">;
type ShowBy = "recent" | "most_applicants" | "most_views";

type CsvValue = string | number | null | undefined;

function downloadCsv(fileName: string, rows: Record<string, CsvValue>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const csv = [headers, ...rows.map(row => headers.map(header => row[header]))].map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });
}

function dateTimeLocalValue(value: Date | string) {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    live: "Live in marketplace",
    approved: "Approved",
    submitted: "Awaiting review",
    paid_pending_review: "Payment review",
    payment_pending: "Payment pending",
    changes_requested: "Changes requested",
    rejected: "Rejected",
    expired: "Expired",
  };
  return labels[status] ?? status.replace(/_/g, " ");
}

function publicationMessage(status: string) {
  if (status === "live" || status === "approved") return "Visible to Job Seekers in the marketplace.";
  if (status === "rejected") return "Hidden from the marketplace until you edit and resubmit it.";
  if (status === "expired") return "No longer visible because the deadline has passed.";
  return "Not public yet; Admin review and payment checks still apply.";
}

export default function EmployerVacancyManagement({ metrics }: { metrics: EmployerWorkspaceMetric[] }) {
  const utils = trpc.useUtils();
  const vacanciesQuery = trpc.employer.vacancies.useQuery(undefined, { staleTime: 15_000 });
  const applicationsQuery = trpc.employer.applications.useQuery(undefined, { staleTime: 15_000 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<VacancyDraft | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showBy, setShowBy] = useState<ShowBy>("recent");

  const updateVacancyMutation = trpc.employer.updateVacancy.useMutation({
    onSuccess: async () => {
      toast.success("Vacancy updated and sent through the publication review flow.");
      setEditingId(null);
      setDraft(null);
      await Promise.all([utils.employer.vacancies.invalidate(), utils.employer.vacancyMetrics.invalidate()]);
    },
    onError: error => toast.error(error.message),
  });

  const deleteVacancyMutation = trpc.employer.deleteVacancy.useMutation({
    onSuccess: async () => {
      toast.success("Vacancy deleted.");
      setConfirmDeleteId(null);
      setSelectedId(null);
      await Promise.all([utils.employer.vacancies.invalidate(), utils.employer.vacancyMetrics.invalidate()]);
    },
    onError: error => toast.error(error.message),
  });

  const locations = useMemo(() => Array.from(new Set((vacanciesQuery.data ?? []).map(v => v.location).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [vacanciesQuery.data]);
  const statuses = useMemo(() => Array.from(new Set((vacanciesQuery.data ?? []).map(v => v.status))).sort((a, b) => a.localeCompare(b)), [vacanciesQuery.data]);

  const filteredVacancies = useMemo(() => {
    const list = vacanciesQuery.data ?? [];
    const search = keyword.trim().toLowerCase();
    const now = Date.now();
    return list.filter(v => {
      const matchesKeyword = !search || [v.title, v.category, v.location, v.company].some(value => value.toLowerCase().includes(search));
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      const matchesLocation = locationFilter === "all" || v.location === locationFilter;
      const createdAt = new Date(v.createdAt).getTime();
      const matchesDate = dateFilter === "all" || (dateFilter === "7d" && createdAt >= now - 7 * 86_400_000) || (dateFilter === "30d" && createdAt >= now - 30 * 86_400_000);
      return matchesKeyword && matchesStatus && matchesLocation && matchesDate;
    }).sort((a, b) => {
      if (showBy === "most_applicants" || showBy === "most_views") {
        const leftMetric = metrics.find(metric => metric.vacancyId === a.id);
        const rightMetric = metrics.find(metric => metric.vacancyId === b.id);
        const left = showBy === "most_views" ? leftMetric?.views ?? 0 : leftMetric?.applications ?? 0;
        const right = showBy === "most_views" ? rightMetric?.views ?? 0 : rightMetric?.applications ?? 0;
        return right - left || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [dateFilter, keyword, locationFilter, metrics, showBy, statusFilter, vacanciesQuery.data]);

  const selectedVacancy = vacanciesQuery.data?.find(v => v.id === selectedId) || filteredVacancies[0];
  const selectedMetric = metrics.find(m => m.vacancyId === selectedVacancy?.id);
  const selectedApplicants = applicationsQuery.data?.filter(application => application.vacancyId === selectedVacancy?.id) ?? [];
  const activeFilterCount = [statusFilter !== "all", locationFilter !== "all", dateFilter !== "all", Boolean(keyword.trim())].filter(Boolean).length;

  const clearFilters = () => {
    setKeyword("");
    setStatusFilter("all");
    setLocationFilter("all");
    setDateFilter("all");
    setShowBy("recent");
  };

  const exportSelectedApplicants = () => {
    if (!selectedVacancy || !selectedApplicants.length) return;
    downloadCsv(`kazipoa-${selectedVacancy.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-applicants.csv`, selectedApplicants.map(application => ({
      Applicant: application.seekerName || "Name not provided",
      Email: application.seekerEmail,
      Vacancy: application.title,
      Status: application.status,
      "Applied at": new Date(application.appliedAt).toLocaleString(),
      Skills: application.skills.join("; "),
      "Experience titles": application.experienceTitles.join("; "),
      "Experience years": application.experienceYears,
    })));
  };

  const startEditing = (vacancy: EmployerVacancy) => {
    setEditingId(vacancy.id);
    setConfirmDeleteId(null);
    setDraft({
      company: vacancy.company,
      title: vacancy.title,
      category: vacancy.category,
      location: vacancy.location,
      contractType: vacancy.contractType ?? "",
      salary: vacancy.salary ?? "",
      description: vacancy.description,
      deadline: vacancy.deadline,
    });
  };

  const updateDraft = <K extends keyof VacancyDraft>(key: K, value: VacancyDraft[K]) => {
    setDraft(current => current ? { ...current, [key]: value } : current);
  };

  const submitEdit = async (vacancyId: number) => {
    if (!draft) return;
    await updateVacancyMutation.mutateAsync({
      vacancyId,
      company: draft.company.trim(),
      title: draft.title.trim(),
      category: draft.category.trim(),
      location: draft.location.trim(),
      contractType: draft.contractType?.trim() || undefined,
      salary: (draft.salary ?? "").trim() || undefined,
      description: draft.description.trim(),
      deadline: new Date(draft.deadline),
    });
  };

  if (vacanciesQuery.isLoading) {
    return <section className="employer-vacancy-workspace employer-marketplace-workspace" aria-busy="true" aria-label="Loading employer marketplace">
      <div className="employer-vacancy-workspace-header"><div><p className="eyebrow">EMPLOYER MARKETPLACE</p><h2>Loading your posted vacancies</h2></div></div>
      <div className="employer-marketplace-grid employer-marketplace-skeleton"><aside className="employer-marketplace-filters"><span className="skeleton-line wide" /><span className="skeleton-line" /><span className="skeleton-control" /><span className="skeleton-control" /><span className="skeleton-control" /></aside><section className="employer-marketplace-list"><div className="employer-marketplace-list-header"><span className="skeleton-line" /><span className="skeleton-line short" /></div><div className="employer-marketplace-list-scroll">{[1, 2, 3].map(item => <div className="employer-posting-card-skeleton" key={item}><span className="skeleton-line short" /><span className="skeleton-line wide" /><span className="skeleton-line" /><span className="skeleton-line medium" /></div>)}</div></section><main className="employer-vacancy-detail-view"><div className="employer-detail-skeleton"><span className="skeleton-avatar" /><span className="skeleton-line wide" /><span className="skeleton-line medium" /><div className="skeleton-stat-row"><span className="skeleton-box" /><span className="skeleton-box" /><span className="skeleton-box" /></div><span className="skeleton-block" /></div></main></div>
    </section>;
  }

  return <section className="employer-vacancy-workspace employer-marketplace-workspace" aria-labelledby="employer-vacancy-workspace-title">
    <div className="employer-vacancy-workspace-header">
      <div><p className="eyebrow">EMPLOYER MARKETPLACE</p><h2 id="employer-vacancy-workspace-title">Your posted vacancies</h2><p className="employer-vacancy-workspace-intro">Browse your posting history, compare roles, and open a full vacancy detail view.</p></div>
      <span className="employer-vacancy-count"><BriefcaseBusiness size={15} /> {vacanciesQuery.data?.length ?? 0} postings</span>
    </div>

    {!vacanciesQuery.data?.length ? <div className="employer-vacancy-workspace-empty"><BriefcaseBusiness size={32} /><h3>No vacancies posted yet</h3><p>Use the vacancy form to submit your first role to the marketplace.</p></div> : <div className="employer-marketplace-grid">
      <aside className="employer-marketplace-filters" aria-label="Vacancy filters and history">
        <div className="employer-filter-heading"><strong>History</strong><span>{filteredVacancies.length} results</span></div>
        <div className="employer-filter-block"><div className="employer-filter-label"><span>Show by</span><Filter size={14} /></div><div className="employer-show-by"><button type="button" className={showBy === "recent" ? "active" : ""} onClick={() => setShowBy("recent")}>Recent postings</button><button type="button" className={showBy === "most_applicants" ? "active" : ""} onClick={() => setShowBy("most_applicants")}>Most applicants</button><button type="button" className={showBy === "most_views" ? "active" : ""} onClick={() => setShowBy("most_views")}>Most views</button></div></div>
        <div className="employer-filter-block"><label htmlFor="employer-posting-search">Search postings</label><div className="employer-filter-search"><Search size={15} /><input id="employer-posting-search" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Title or category" /></div></div>
        <div className="employer-filter-block"><label htmlFor="employer-posting-status">Status</label><select id="employer-posting-status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map(status => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></div>
        <div className="employer-filter-block"><label htmlFor="employer-posting-location">Location</label><select id="employer-posting-location" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}><option value="all">All locations</option>{locations.map(location => <option key={location} value={location}>{location}</option>)}</select></div>
        <div className="employer-filter-block"><label htmlFor="employer-posting-date">Posted date</label><select id="employer-posting-date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}><option value="all">Any time</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></div>
        <button type="button" className="employer-clear-filters" onClick={clearFilters} disabled={!activeFilterCount && showBy === "recent"}>Clear all {activeFilterCount ? `(${activeFilterCount})` : ""}</button>
      </aside>

      <section className="employer-marketplace-list" aria-label="Your posted vacancy cards">
        <div className="employer-marketplace-list-header"><div><strong>{showBy === "most_applicants" ? "Most active roles" : showBy === "most_views" ? "Most viewed roles" : "Recent postings"}</strong><span>Only your employer postings</span></div><span>{filteredVacancies.length} shown</span></div>
        <div className="employer-marketplace-list-scroll">
          {filteredVacancies.map(vacancy => {
            const metric = metrics.find(item => item.vacancyId === vacancy.id);
            const isSelected = selectedVacancy?.id === vacancy.id;
            return <button type="button" className={`employer-posting-card ${isSelected ? "active" : ""}`} key={vacancy.id} onClick={() => { setSelectedId(vacancy.id); setEditingId(null); setConfirmDeleteId(null); }}>
              <div className="employer-posting-card-top"><span className={`employer-posting-status status-${vacancy.status}`}><span aria-hidden="true" />{statusLabel(vacancy.status)}</span><span>{formatDate(vacancy.createdAt)}</span></div>
              <div className="employer-posting-card-title"><span className="employer-posting-company-mark"><BriefcaseBusiness size={17} /></span><span><strong>{vacancy.title}</strong><small>{vacancy.company}</small></span></div>
              <div className="employer-posting-card-facts"><span>{vacancy.location}</span><span>{vacancy.contractType || "Contract not specified"}</span></div>
              <div className="employer-posting-card-bottom"><span>{vacancy.salary || "Salary not disclosed"}</span><span>{metric?.applications ?? 0} applicants · {metric?.views ?? 0} views</span></div>
            </button>;
          })}
          {!filteredVacancies.length && <div className="employer-list-empty"><Search size={22} /><strong>No postings match these filters</strong><button type="button" onClick={clearFilters}>Reset filters</button></div>}
        </div>
      </section>

      <main className="employer-vacancy-detail-view" aria-label="Selected vacancy details">
        {selectedVacancy ? editingId === selectedVacancy.id && draft ? <form className="employer-vacancy-edit-form" onSubmit={e => { e.preventDefault(); void submitEdit(selectedVacancy.id); }}>
          <div className="edit-form-header"><div><p className="eyebrow">EDIT POSTING</p><h3>{selectedVacancy.title}</h3></div><button type="button" className="icon-button" onClick={() => setEditingId(null)} aria-label="Close edit form"><X size={18} /></button></div>
          <div className="edit-form-grid">
            <label>Job title<input required value={draft.title} onChange={e => updateDraft("title", e.target.value)} /></label>
            <label>Category<input required value={draft.category} onChange={e => updateDraft("category", e.target.value)} /></label>
            <label>Location<input required value={draft.location} onChange={e => updateDraft("location", e.target.value)} /></label>
            <label>Salary <span className="field-hint">(optional)</span><input value={draft.salary ?? ""} onChange={e => updateDraft("salary", e.target.value)} /></label>
            <label>Deadline<input required type="datetime-local" value={dateTimeLocalValue(draft.deadline)} onChange={e => updateDraft("deadline", e.target.value)} /></label>
            <label className="full-width">Description<textarea required rows={6} value={draft.description} onChange={e => updateDraft("description", e.target.value)} /></label>
          </div>
          <div className="edit-form-actions"><p><AlertTriangle size={14} /> Resubmitting sends the vacancy back to Admin review.</p><div><button type="button" className="outline-button small" onClick={() => setEditingId(null)}>Cancel</button><button type="submit" className="primary-button small" disabled={updateVacancyMutation.isPending}>{updateVacancyMutation.isPending ? "Saving…" : <><Save size={14} /> Save & Resubmit</>}</button></div></div>
        </form> : <div className="vacancy-detail-content">
          <div className="vacancy-detail-header"><div className="vacancy-detail-title"><div className="vacancy-detail-icon"><BriefcaseBusiness size={24} /></div><div><p className="eyebrow">SELECTED POSTING</p><h2>{selectedVacancy.title}</h2><p>{selectedVacancy.company} · {selectedVacancy.location}</p></div></div><div className="vacancy-detail-actions"><button type="button" className="outline-button small" onClick={exportSelectedApplicants} disabled={applicationsQuery.isLoading || !selectedApplicants.length}><Download size={14} /> Export applicants</button><button type="button" className="outline-button small" onClick={() => startEditing(selectedVacancy)}><Pencil size={14} /> Edit</button><button type="button" className="danger-button small" disabled={Boolean(selectedMetric?.applications)} onClick={() => setConfirmDeleteId(selectedVacancy.id)} title={selectedMetric?.applications ? "Cannot delete vacancy with applicants" : "Delete vacancy"}><Trash2 size={14} /> Delete</button></div></div>
          <div className="vacancy-detail-stats"><div className="stat-card"><Users size={18} /><div><strong>{selectedMetric?.applications ?? 0}</strong><span>Applicants</span></div></div><div className="stat-card"><Eye size={18} /><div><strong>{selectedMetric?.views ?? 0}</strong><span>Views</span></div></div><div className="stat-card"><Clock3 size={18} /><div><strong>{formatDate(selectedVacancy.deadline)}</strong><span>Deadline</span></div></div></div>
          <div className="vacancy-detail-status-panel"><div className="status-header"><strong>Publication Status</strong><span className={`status-badge ${selectedVacancy.status}`}><CheckCircle2 size={13} />{statusLabel(selectedVacancy.status)}</span></div><p>{publicationMessage(selectedVacancy.status)}</p>{Boolean(selectedMetric?.applications) && <p className="status-note"><Users size={14} /> This role has applicants. Permanent deletion is disabled to protect recruitment records.</p>}</div>
          <div className="vacancy-detail-body"><div className="detail-section"><h4>Description</h4><p>{selectedVacancy.description}</p></div><div className="detail-section-grid"><div><h4>Category</h4><p>{selectedVacancy.category}</p></div><div><h4>Salary</h4><p>{selectedVacancy.salary || "Salary not disclosed"}</p></div><div><h4>Contract</h4><p>{selectedVacancy.contractType || "Not specified"}</p></div><div><h4>Posted on</h4><p>{formatDate(selectedVacancy.createdAt)}</p></div></div></div>
          {confirmDeleteId === selectedVacancy.id && <div className="delete-confirm-overlay"><div className="delete-confirm-modal"><AlertTriangle size={32} /><h3>Delete this vacancy?</h3><p>This permanently removes “{selectedVacancy.title}” and all its performance data. This action cannot be undone.</p><div className="delete-confirm-actions"><button type="button" className="outline-button" onClick={() => setConfirmDeleteId(null)}>Keep vacancy</button><button type="button" className="danger-button" disabled={deleteVacancyMutation.isPending} onClick={() => void deleteVacancyMutation.mutateAsync({ vacancyId: selectedVacancy.id })}>{deleteVacancyMutation.isPending ? "Deleting…" : "Confirm delete"}</button></div></div></div>}
        </div> : <div className="detail-empty-state"><BriefcaseBusiness size={24} /><p>Select a vacancy card to view details.</p></div>}
      </main>
    </div>}
  </section>;
}
