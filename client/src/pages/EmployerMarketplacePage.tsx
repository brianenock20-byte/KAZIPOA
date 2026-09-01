import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import EmployerVacancyManagement from "@/components/EmployerVacancyManagement";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BriefcaseBusiness, Clock3, LogIn, ShieldAlert } from "lucide-react";

function MarketplaceLoading() {
  return (
    <main className="employer-marketplace-route-main container" aria-busy="true" aria-label="Loading Employer Marketplace">
      <div className="employer-marketplace-route-loading" role="status">
        <Clock3 size={20} />
        <strong>Loading your Employer Marketplace…</strong>
        <span>We are checking your Employer workspace and posted vacancies.</span>
      </div>
    </main>
  );
}

export default function EmployerMarketplacePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const accountRoleQuery = trpc.auth.accountRole.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const isEmployer = accountRoleQuery.data === "employer";
  const metricsQuery = trpc.employer.vacancyMetrics.useQuery(undefined, {
    enabled: isAuthenticated && isEmployer,
    staleTime: 15_000,
  });

  if (loading || (isAuthenticated && accountRoleQuery.isLoading)) return <MarketplaceLoading />;

  if (!isAuthenticated) {
    return (
      <div className="employer-marketplace-route">
        <header className="site-header"><div className="container nav-inner"><a className="logo-link" href="/"><span className="brand-mark"><img src="/kazipoa-mark.png" alt="" /><span>KAZIPOA</span></span></a></div></header>
        <main className="employer-marketplace-route-main container">
          <section className="employer-marketplace-access-state" role="status">
            <BriefcaseBusiness size={28} />
            <p className="eyebrow">EMPLOYER POSTINGS</p>
            <h1>Sign in to manage your postings.</h1>
            <p>This private posting workspace shows your own vacancy history, posting cards, applicants, views, and deadlines.</p>
            <button type="button" className="primary-button" onClick={() => startLogin()}><LogIn size={16} /> Continue to sign in</button>
          </section>
        </main>
      </div>
    );
  }

  if (!isEmployer) {
    return (
      <div className="employer-marketplace-route">
        <header className="site-header"><div className="container nav-inner"><a className="logo-link" href="/"><span className="brand-mark"><img src="/kazipoa-mark.png" alt="" /><span>KAZIPOA</span></span></a></div></header>
        <main className="employer-marketplace-route-main container">
          <section className="employer-marketplace-access-state" role="alert">
            <ShieldAlert size={28} />
            <p className="eyebrow">EMPLOYER POSTINGS</p>
            <h1>This Employer workspace is for Employers.</h1>
            <p>{user?.email ? `${user.email} is signed in with a different workspace.` : "Your account is signed in with a different workspace."} Open your own workspace or create a separate Employer account to manage vacancies.</p>
            <div className="employer-marketplace-access-actions"><a className="outline-button" href="/dashboard"><ArrowLeft size={16} /> Open my workspace</a><a className="primary-button" href="/register">Create Employer account</a><a className="outline-button" href="/">Back to public jobs</a></div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="employer-marketplace-route">
      <header className="site-header"><div className="container nav-inner"><a className="logo-link" href="/"><span className="brand-mark"><img src="/kazipoa-mark.png" alt="" /><span>KAZIPOA</span></span></a><nav className="nav-links" aria-label="Employer navigation"><a href="/dashboard">My workplace</a></nav><div className="nav-actions"><a className="ghost-button" href="/dashboard">My workplace</a></div></div></header>
      <main className="employer-marketplace-route-main container">
        <div className="employer-marketplace-route-intro"><a className="back-button" href="/dashboard"><ArrowLeft size={14} /> Back to workplace</a><p className="eyebrow">EMPLOYER POSTINGS</p><h1>Manage your own vacancies.</h1><p>Only your posted roles appear here. Use History and filters to find a posting, review its applicants and views, or open the full details.</p></div>
        <EmployerVacancyManagement metrics={metricsQuery.data ?? []} />
      </main>
    </div>
  );
}
