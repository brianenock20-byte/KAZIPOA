import { Bookmark, BriefcaseBusiness, CalendarDays, CircleAlert, Clock3, MapPin, Search, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type SavedJobsPageProps = { onBack: () => void };

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SavedJobsPage({ onBack }: SavedJobsPageProps) {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("All regions");
  const [sort, setSort] = useState<"recent" | "deadline" | "title">("recent");
  const [organizationDrafts, setOrganizationDrafts] = useState<Record<number, { folder: string; tags: string }>>({});
  const input = useMemo(() => ({ page, pageSize: 12, keyword: keyword.trim() || undefined, region: region === "All regions" ? undefined : region, sort }), [keyword, page, region, sort]);
  const savedQuery = trpc.seeker.savedPage.useQuery(input, { staleTime: 15_000 });
  const removeMutation = trpc.seeker.removeSavedVacancy.useMutation();
  const organizationMutation = trpc.seeker.updateSavedVacancyOrganization.useMutation();

  const draftFor = (id: number, folder?: string | null, tags?: string | null) => organizationDrafts[id] ?? { folder: folder || "Unsorted", tags: tags || "" };
  const updateDraft = (id: number, key: "folder" | "tags", value: string) => setOrganizationDrafts(current => ({ ...current, [id]: { ...draftFor(id), [key]: value } }));

  const remove = async (vacancyId: number) => {
    try {
      await removeMutation.mutateAsync({ vacancyId });
      await Promise.all([utils.seeker.savedPage.invalidate(), utils.seeker.savedIds.invalidate()]);
      toast.success("Job removed from your bookmarks");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove bookmarked job");
    }
  };

  const saveOrganization = async (vacancyId: number) => {
    const draft = draftFor(vacancyId);
    try {
      await organizationMutation.mutateAsync({ vacancyId, folder: draft.folder, tags: draft.tags.trim() || null });
      await utils.seeker.savedPage.invalidate();
      toast.success("Bookmark organization updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update bookmark organization");
    }
  };

  const totalPages = Math.max(1, Math.ceil((savedQuery.data?.total ?? 0) / (savedQuery.data?.pageSize ?? 12)));

  return <main className="saved-jobs-page" aria-labelledby="saved-jobs-page-title">
    <div className="container saved-jobs-page-container">
      <div className="saved-jobs-page-heading"><div><button type="button" className="back-button" onClick={onBack}>← Dashboard</button><p className="eyebrow">JOB SEEKER BOOKMARKS</p><h1 id="saved-jobs-page-title">Bookmarked jobs</h1><p>Keep the vacancies you are considering in one place, with live deadlines and your own folders or tags.</p></div><span className="saved-jobs-page-count"><Bookmark size={17} /> {savedQuery.data?.total ?? 0} saved</span></div>
      <div className="saved-jobs-page-toolbar"><label className="saved-job-search"><Search size={16} /><input value={keyword} onChange={event => { setKeyword(event.target.value); setPage(1); }} placeholder="Search title, company, category, or region" aria-label="Search bookmarked jobs" /></label><select value={region} onChange={event => { setRegion(event.target.value); setPage(1); }} aria-label="Filter bookmarked jobs by region"><option>All regions</option>{(savedQuery.data?.regions ?? []).map(item => <option key={item}>{item}</option>)}</select><select value={sort} onChange={event => { setSort(event.target.value as typeof sort); setPage(1); }} aria-label="Sort bookmarked jobs"><option value="recent">Recently bookmarked</option><option value="deadline">Deadline soonest</option><option value="title">Title A–Z</option></select></div>
      {savedQuery.isLoading ? <div className="saved-jobs-page-empty" role="status"><Clock3 size={22} /><strong>Loading your bookmarks…</strong><span>Saved vacancy details are being refreshed.</span></div> : savedQuery.isError ? <div className="saved-jobs-page-empty error" role="alert"><CircleAlert size={22} /><strong>Bookmarks could not be loaded</strong><span>{savedQuery.error.message}</span></div> : savedQuery.data?.items.length ? <div className="saved-jobs-page-list">{savedQuery.data.items.map(job => { const draft = draftFor(job.id, job.folder, job.tags); return <article className="saved-job-page-item" key={job.id}><div className="saved-job-page-main"><div className="saved-job-page-icon"><BriefcaseBusiness size={19} /></div><div><div className="saved-job-page-title-row"><h2>{job.title}</h2>{job.urgent === 1 && <span className="saved-job-urgent-badge">Urgent</span>}</div><p>{job.company} · {job.category}</p><div className="saved-job-page-facts"><span><MapPin size={14} />{job.location}</span><span><CalendarDays size={14} />Closes {formatDate(job.deadline)}</span><strong>{job.salary || "Salary discussed"}</strong></div></div></div><div className="saved-job-page-actions"><a className="outline-button small" href={`/vacancies/${job.id}`}>View vacancy</a><button type="button" className="danger-button small" disabled={removeMutation.isPending} onClick={() => void remove(job.id)}><Trash2 size={14} /> Remove</button></div><div className="saved-job-page-organization"><label>Folder<input value={draft.folder} onChange={event => updateDraft(job.id, "folder", event.target.value)} placeholder="Unsorted" /></label><label className="saved-job-page-tags"><Tag size={14} /><input value={draft.tags} onChange={event => updateDraft(job.id, "tags", event.target.value)} placeholder="Tags, comma separated" aria-label={`Tags for ${job.title}`} /></label><button type="button" className="outline-button small" disabled={organizationMutation.isPending} onClick={() => void saveOrganization(job.id)}>Save tags</button></div></article>; })}</div> : <div className="saved-jobs-page-empty"><Bookmark size={22} /><strong>{savedQuery.data?.total ? "No bookmarks match your filters" : "You have no bookmarked jobs yet"}</strong><span>Use Save on a live marketplace vacancy to keep it here.</span><button type="button" className="primary-button small" onClick={onBack}>Browse marketplace</button></div>}
      {savedQuery.data?.total ? <div className="saved-jobs-page-pagination"><button type="button" className="outline-button small" disabled={page <= 1 || savedQuery.isFetching} onClick={() => setPage(current => Math.max(1, current - 1))}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" className="outline-button small" disabled={page >= totalPages || savedQuery.isFetching} onClick={() => setPage(current => current + 1)}>Next</button></div> : null}
    </div>
  </main>;
}
