import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, CircleAlert, MapPin, Save, Share2, ShieldCheck } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { storageUrl } from "@/lib/storageUrl";
import DeadlineCountdown from "@/components/DeadlineCountdown";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { TEST_VACANCY_EXPLANATION, TEST_VACANCY_LABEL, isTestVacancy, vacancyApplicationUrl } from "@shared/testVacancy";

function formatDate(value: Date | string | number) {
  return new Date(value).toLocaleDateString("en-TZ", { day: "2-digit", month: "short", year: "numeric" });
}

export function vacancyTheme(vacancy: { category?: string | null; title?: string | null; description?: string | null }) {
  const signal = `${vacancy.category ?? ""} ${vacancy.title ?? ""} ${vacancy.description ?? ""}`.toLowerCase();
  if (/finance|account|bank|audit|insurance|econom/.test(signal)) return "finance";
  if (/technology|software|developer|cyber|data|digital|it /.test(signal)) return "technology";
  if (/education|teacher|school|lecturer|academic|training/.test(signal)) return "education";
  if (/health|medical|nurse|clinical|pharmacy|hospital/.test(signal)) return "healthcare";
  if (/hotel|hospitality|restaurant|chef|tourism|front office/.test(signal)) return "hospitality";
  if (/sales|marketing|customer|business development|retail/.test(signal)) return "commercial";
  if (/engineer|construction|logistics|transport|warehouse|field|operations|agriculture/.test(signal)) return "operations";
  return "general";
}

export function vacancyImage(theme: string) {
  const images: Record<string, string> = {
    finance: storageUrl("kazipoa-vacancy-finance_d524c60a.png"),
    technology: storageUrl("kazipoa-vacancy-technology_d7d4b5a8.png"),
    healthcare: storageUrl("kazipoa-vacancy-healthcare_068847f1.png"),
    hospitality: storageUrl("kazipoa-vacancy-hospitality_3eea05ab.png"),
    operations: storageUrl("kazipoa-vacancy-operations_ddd08ff5.png"),
  };
  return images[theme] ?? storageUrl("kazipoa-employer-workplace_46d52586.png");
}

export default function PublicVacancy() {
  const [, params] = useRoute("/vacancies/:id");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const accountRoleQuery = trpc.auth.accountRole.useQuery(undefined, { enabled: isAuthenticated });
  const isSeeker = accountRoleQuery.data === "seeker";
  const vacancyId = Number(params?.id);
  const vacancyQuery = trpc.marketplace.vacancy.useQuery({ vacancyId }, { enabled: Number.isInteger(vacancyId) && vacancyId > 0 });
  const savedIdsQuery = trpc.seeker.savedIds.useQuery(undefined, { enabled: isSeeker });
  const saveVacancyMutation = trpc.seeker.saveVacancy.useMutation();
  const removeSavedVacancyMutation = trpc.seeker.removeSavedVacancy.useMutation();

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: vacancyQuery.data?.title, text: `View this vacancy at ${vacancyQuery.data?.company}`, url });
      else await navigator.clipboard.writeText(url);
      toast("Vacancy link ready to share");
    } catch {
      toast("Sharing was cancelled");
    }
  };

  if (vacancyQuery.isLoading) return <main className="subpage"><div className="container"><p className="eyebrow">PUBLIC VACANCY</p><h1>Loading vacancy…</h1></div></main>;
  if (vacancyQuery.isError || !vacancyQuery.data) return <main className="subpage"><div className="container"><p className="eyebrow">VACANCY UNAVAILABLE</p><h1>This opportunity is no longer live.</h1><p className="large-copy">Browse the latest verified opportunities on Kazipoa.</p><button className="primary-button" onClick={() => navigate("/")}><ArrowLeft size={16}/>Browse vacancies</button></div></main>;

  const vacancy = vacancyQuery.data;
  const saved = (savedIdsQuery.data ?? []).map(String).includes(String(vacancy.id));
  const expired = new Date(vacancy.deadline).getTime() < Date.now();
  const testOnly = isTestVacancy(vacancy);
  const theme = vacancyTheme(vacancy);
  const applicationUrl = vacancyApplicationUrl(vacancy);
  const saveJob = () => {
    if (!isAuthenticated) { toast("Create a free Job Seeker account to save this job."); startLogin(); return; }
    if (!isSeeker) { toast("Save Job is available in the Job Seeker workspace."); return; }
    const action = saved ? removeSavedVacancyMutation.mutateAsync({ vacancyId: vacancy.id }) : saveVacancyMutation.mutateAsync({ vacancyId: vacancy.id });
    void action.then(() => { void savedIdsQuery.refetch(); toast(saved ? "Job removed from saved jobs" : "Job saved for later"); }).catch(error => toast(error instanceof Error ? error.message : "Could not update saved jobs"));
  };
  const apply = () => {
    if (expired) { toast("Applications are closed for this vacancy."); return; }
    if (!isAuthenticated) { toast("Create a free Job Seeker account to apply for this position."); return; }
    if (!isSeeker) { toast("Switch to a Job Seeker account to apply for this position."); return; }
    toast("Open your Job Seeker workspace to apply with your saved CV.");
    navigate("/dashboard");
  };

  return <main className={`subpage public-vacancy-page vacancy-theme-${theme}`} data-vacancy-theme={theme}><div className="container"><button className="back-button" onClick={() => navigate("/jobs")}><ArrowLeft size={15}/> Back to vacancies</button><article className="public-vacancy-card"><div className={`vacancy-visual vacancy-visual-${theme}`}><img src={vacancyImage(theme)} alt={`${theme} workplace related to ${vacancy.title}`} /><span>{theme === "general" ? "Professional opportunity" : `${theme} workplace`}</span></div><div className="public-vacancy-heading"><div><p className="eyebrow">{expired ? "APPLICATION CLOSED" : "PUBLIC VACANCY"}</p><h1>{vacancy.title}</h1><p className="company-line">{vacancy.company} <span>·</span> {vacancy.location}</p>{testOnly && <div className="test-vacancy-callout"><strong>{TEST_VACANCY_LABEL}</strong><span>{TEST_VACANCY_EXPLANATION}</span>{vacancy.sourceName && <small>Source: {vacancy.sourceName}</small>}</div>}</div><div className="public-vacancy-badges">{!testOnly && <span className="chip navy"><ShieldCheck size={13}/> Verified opportunity</span>}{testOnly && <span className="chip amber"><CircleAlert size={13}/> {TEST_VACANCY_LABEL}</span>}{expired && <span className="chip red"><CircleAlert size={13}/> Application Closed</span>}</div></div><div className="modal-meta"><span><strong>Location</strong><MapPin size={14}/>{vacancy.location}</span><span><strong>Salary</strong><BriefcaseBusiness size={14}/>{vacancy.salary || "Salary discussed"}</span><span><strong>Employment type</strong>Not specified</span><span><strong>Experience</strong>Not specified</span><span><strong>Deadline</strong><DeadlineCountdown deadlineIso={new Date(vacancy.deadline).toISOString()} /><small>{formatDate(vacancy.deadline)}</small></span><span><strong>Date posted</strong>{formatDate(vacancy.createdAt)}</span></div><section className="public-vacancy-copy"><h2>About the Role</h2><p>{vacancy.description}</p><h2>Responsibilities</h2><p>Review the employer’s role description carefully and confirm the responsibilities before applying.</p><h2>Requirements</h2><p>Use the vacancy description and application guidance supplied by the employer. Do not share sensitive documents outside the official application process.</p><h2>Skills</h2><p>Relevant skills should be described in the vacancy information or discussed through the existing application flow.</p><h2>Application Information</h2><p>{expired ? "This vacancy has passed its deadline and is no longer accepting applications." : testOnly ? "This is a pre-launch test listing. Review the source details carefully and apply through the original source route." : "Apply through your secure Job Seeker workspace using your saved CV and application details."}</p>{testOnly && vacancy.sourceUrl && <p className="source-attribution">Original listing: <a href={vacancy.sourceUrl} target="_blank" rel="noreferrer">View source listing</a></p>}</section><div className="safety-callout"><ShieldCheck size={20}/><span><strong>Stay safe while applying</strong><small>Kazipoa does not ask candidates to pay to apply. Never share passwords, PINs, CVV numbers, or unnecessary sensitive documents.</small></span></div><div className="modal-actions"><button className="outline-button" onClick={share}><Share2 size={16}/>Share Job</button><button className="outline-button" onClick={saveJob} disabled={saveVacancyMutation.isPending || removeSavedVacancyMutation.isPending}><Save size={16}/>{saved ? "Saved Job" : "Save Job"}</button>{testOnly ? applicationUrl ? <a className="primary-button" href={applicationUrl} target="_blank" rel="noreferrer">Apply on original source <ArrowRight size={16}/></a> : <span className="form-note">Original source application link is unavailable.</span> : <button className="primary-button" onClick={apply} disabled={expired}>{expired ? "Application Closed" : isAuthenticated ? "Apply Now" : "Create Account to Apply"} <ArrowRight size={16}/></button>}</div>{!isAuthenticated && !expired && <p className="modal-copy">Create a free Job Seeker account to apply for this position, or <button className="text-button" onClick={() => startLogin()}>Login</button> to use an existing account.</p>}</article></div></main>;
}
