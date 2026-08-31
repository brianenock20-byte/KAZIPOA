import { useEffect, useMemo, useState } from "react";
import { Bookmark, BriefcaseBusiness, CheckCircle2, Clock3, FileText, MapPin, Search, Share2, ShieldCheck } from "lucide-react";
import DeadlineCountdown from "@/components/DeadlineCountdown";
import type { SalaryRangeFilter } from "@shared/salaryFilters";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  type: string;
  experience: string;
  education: string;
  salary: string | null;
  deadline: string;
  deadlineIso?: string;
  urgent?: boolean;
  featured?: boolean;
  verified?: boolean;
  description: string;
  skills: string[];
};

type Props = {
  liveJobs: Job[];
  filtered: Job[];
  query: string;
  setQuery: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  contractType: string;
  setContractType: (value: string) => void;
  salaryRange: SalaryRangeFilter;
  setSalaryRange: (value: SalaryRangeFilter) => void;
  deadlineSort: "newest" | "deadline";
  setDeadlineSort: (value: "newest" | "deadline") => void;
  saved: string[];
  toggleSave: (id: string) => void | Promise<void>;
  onSelectJob: (job: Job) => void;
  onShareJob: (job: Job) => void | Promise<void>;
  onBack: () => void;
  onDashboard: () => void;
  loading: boolean;
  opening: boolean;
  locations: string[];
  categories: string[];
  salaryRangeOptions: readonly string[];
};

function Salary({ value }: { value: string | null }) {
  return <span>{value || "Salary not disclosed"}</span>;
}

export default function SeekerMarketplaceWorkspace({
  liveJobs,
  filtered,
  query,
  setQuery,
  location,
  setLocation,
  category,
  setCategory,
  contractType,
  setContractType,
  salaryRange,
  setSalaryRange,
  deadlineSort,
  setDeadlineSort,
  saved,
  toggleSave,
  onSelectJob,
  onShareJob,
  onBack,
  onDashboard,
  loading,
  opening,
  locations,
  categories,
  salaryRangeOptions,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(filtered[0]?.id ?? null);
  const selectedJob = useMemo(() => filtered.find(job => job.id === selectedId) ?? filtered[0] ?? null, [filtered, selectedId]);

  useEffect(() => {
    if (!selectedJob) setSelectedId(null);
    else if (!filtered.some(job => job.id === selectedId)) setSelectedId(selectedJob.id);
  }, [filtered, selectedId, selectedJob]);

  const reset = () => {
    setQuery("");
    setLocation("All regions");
    setCategory("All categories");
    setContractType("All contract types");
    setSalaryRange("All salary ranges");
    setDeadlineSort("newest");
  };

  return (
    <main className="candidate-marketplace-page seeker-marketplace-reference">
      <div className="candidate-marketplace-shell">
        <div className="candidate-marketplace-top">
          <button className="back-button" onClick={onBack}>← My workspace</button>
          <button className="outline-button" onClick={onDashboard}>Open portfolio</button>
        </div>
        <div className="seeker-marketplace-toolbar">
          <div className="seeker-history-heading"><p className="eyebrow">JOB SEEKER WORKSPACE</p><h1>History</h1><span>{filtered.length} matching opportunities</span></div>
          <div className="seeker-toolbar-search"><Search size={17} aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search job title, skill or company" aria-label="Search job title, skill or company" /></div>
          <div className="seeker-toolbar-search"><MapPin size={17} aria-hidden="true" /><select value={location} onChange={event => setLocation(event.target.value)} aria-label="Location filter"><option>All regions</option>{locations.filter(item => item !== "All Tanzania").map(item => <option key={item}>{item}</option>)}</select></div>
          <button className="primary-button seeker-find-button" onClick={() => undefined}><Search size={16} /> Find jobs</button>
        </div>
        <div className="seeker-active-filters" aria-label="Active filters">
          {[query && `Search: ${query}`, location !== "All regions" && location, category !== "All categories" && category, contractType !== "All contract types" && contractType, salaryRange !== "All salary ranges" && salaryRange].filter(Boolean).map(item => <span key={String(item)}>{item}<button type="button" aria-label={`Remove ${item} filter`} onClick={reset}>×</button></span>)}
          <button type="button" className="text-button" onClick={reset}>Delete All</button>
        </div>
        <div className="seeker-marketplace-grid">
          <aside className="seeker-filter-rail" aria-label="Vacancy filters">
            <div className="seeker-rail-heading"><strong>Show By</strong><span>⌃</span></div>
            <div className="seeker-show-by"><button className={deadlineSort === "newest" ? "active" : ""} onClick={() => setDeadlineSort("newest")}>New Jobs</button><button className={deadlineSort === "deadline" ? "active" : ""} onClick={() => setDeadlineSort("deadline")}>Most Suitable</button></div>
            <label>Category<select value={category} onChange={event => setCategory(event.target.value)}><option>All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Location<select value={location} onChange={event => setLocation(event.target.value)}><option>All regions</option>{locations.filter(item => item !== "All Tanzania").map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Salary<select value={salaryRange} onChange={event => setSalaryRange(event.target.value as SalaryRangeFilter)}>{salaryRangeOptions.map(item => <option key={item}>{item}</option>)}</select></label>
            <fieldset><legend>Job Type</legend>{["Full-time", "Part-time", "Contract", "Internship", "Freelance"].map(item => <label className="seeker-checkbox" key={item}><input type="checkbox" checked={contractType === item} onChange={() => setContractType(contractType === item ? "All contract types" : item)} />{item}</label>)}</fieldset>
            <button type="button" className="outline-button seeker-reset-button" onClick={reset}>Reset filters</button>
          </aside>
          <section className="seeker-results-column" aria-label="Vacancy results">
            <div className="seeker-results-heading"><div><p className="eyebrow">LIVE VACANCIES</p><h2>{filtered.length} jobs found</h2></div><select value={deadlineSort} onChange={event => setDeadlineSort(event.target.value as "newest" | "deadline")} aria-label="Sort jobs"><option value="newest">Newest posted</option><option value="deadline">Upcoming deadline</option></select></div>
            {loading || opening ? <div className="seeker-loading-state"><span className="route-loading-spinner" /><strong>{opening ? "Loading vacancy details…" : "Updating jobs…"}</strong></div> : filtered.length ? <div className="seeker-vacancy-list">{filtered.map(job => <article className={`seeker-vacancy-card ${selectedJob?.id === job.id ? "is-selected" : ""}`} key={job.id} onClick={() => setSelectedId(job.id)}>
              <div className="seeker-vacancy-card-head"><span className="seeker-company-logo">{job.company.charAt(0).toUpperCase()}</span><div><h3>{job.title}</h3><p>{job.company}</p></div><button type="button" className="save-button" onClick={event => { event.stopPropagation(); void toggleSave(job.id); }} aria-label={saved.includes(job.id) ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}><Bookmark size={18} fill={saved.includes(job.id) ? "currentColor" : "none"} /></button></div>
              <div className="seeker-vacancy-card-meta"><span><MapPin size={13} />{job.location}</span><span><BriefcaseBusiness size={13} />{job.type}</span><span><Salary value={job.salary} /></span></div><p className="seeker-vacancy-card-description">{job.description}</p><div className="seeker-vacancy-card-footer"><span>{job.urgent ? "Urgent vacancy" : job.verified ? "Verified employer" : "Employer review"}</span><small>{job.deadlineIso ? <DeadlineCountdown deadlineIso={job.deadlineIso} /> : <><Clock3 size={13} /> Posted recently</>}</small><button type="button" className="outline-button small" onClick={event => { event.stopPropagation(); onSelectJob(job); }}>Details</button></div>
            </article>)}</div> : <div className="empty-state seeker-empty-state"><Search size={22}/><h3>No matching vacancies yet.</h3><p>Try another category, region, salary range, or keyword.</p><button className="outline-button" onClick={reset}>Clear filters</button></div>}
          </section>
          <aside className="seeker-detail-column" aria-label="Selected vacancy details">{selectedJob ? <div className="seeker-selected-detail"><div className="seeker-selected-brand"><span className="seeker-detail-logo">{selectedJob.company.charAt(0).toUpperCase()}</span><div><h2>{selectedJob.title}</h2><p>{selectedJob.company}</p></div></div><div className="seeker-detail-actions"><button className="save-button save-button-labeled" onClick={() => void toggleSave(selectedJob.id)}><Bookmark size={16} fill={saved.includes(selectedJob.id) ? "currentColor" : "none"}/>{saved.includes(selectedJob.id) ? "Saved" : "Save"}</button><button className="job-card-share" onClick={() => void onShareJob(selectedJob)}><Share2 size={15}/> Share</button></div><div className="seeker-detail-meta"><span><strong>Job Type</strong>{selectedJob.type}</span><span><strong>Work Type</strong>{selectedJob.location.toLowerCase().includes("remote") ? "Remote" : "On-site"}</span><span><strong>Location</strong>{selectedJob.location}</span><span><strong>Experience</strong>{selectedJob.experience}</span><span><strong>Salary</strong><Salary value={selectedJob.salary} /></span><span><strong>Deadline</strong>{selectedJob.deadline}</span></div><div className="seeker-detail-copy"><h3>Description</h3><p>{selectedJob.description}</p><h3>Requirements</h3>{selectedJob.skills.length ? <ul>{selectedJob.skills.map(skill => <li key={skill}>{skill}</li>)}</ul> : <p>Review the full vacancy details and employer requirements before applying.</p>}</div><div className="seeker-detail-footer"><span>{selectedJob.verified ? <><CheckCircle2 size={15}/> Verified employer</> : <><ShieldCheck size={15}/> Employer review status shown in details</>}</span><button className="primary-button" onClick={() => onSelectJob(selectedJob)}>View &amp; apply <BriefcaseBusiness size={16}/></button></div></div> : <div className="empty-state"><BriefcaseBusiness size={22}/><strong>Select a vacancy</strong><span>Choose a job card to see its details here.</span></div>}</aside>
        </div>
      </div>
    </main>
  );
}
