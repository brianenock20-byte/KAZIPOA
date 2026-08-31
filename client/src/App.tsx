import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const InterviewInvitePage = lazy(() => import("./pages/InterviewInvitePage"));
const PublicVacancy = lazy(() => import("./pages/PublicVacancy"));
const CustomAuth = lazy(() => import("./pages/CustomAuth"));
const Profile = lazy(() => import("./pages/Profile"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const EmployerMarketplacePage = lazy(() => import("./pages/EmployerMarketplacePage"));

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
        <Toaster />
        <Suspense fallback={<div className="route-loading" role="status">Loading Kazipoa…</div>}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/companies" component={Home} />
          <Route path="/verified-companies" component={Home} />
          <Route path="/safety" component={Home} />
          <Route path="/safety-centre" component={Home} />
          <Route path="/dashboard" component={Home} />
          <Route path="/employer-marketplace" component={EmployerMarketplacePage} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin/roles" component={RoleManagement} />
          <Route path="/jobs" component={Home} />
          <Route path="/urgent-jobs" component={Home} />
          <Route path="/preferences" component={Home} />
          <Route path="/saved-jobs" component={Home} />
          <Route path="/login"><CustomAuth mode="login" /></Route>
          <Route path="/register"><CustomAuth mode="register" /></Route>
          <Route path="/forgot-password"><CustomAuth mode="forgot" /></Route>
          <Route path="/reset-password"><CustomAuth mode="reset" /></Route>
          <Route path="/verify-email"><CustomAuth mode="verify" /></Route>
          <Route path="/vacancies/:id" component={PublicVacancy} />
          <Route path="/interview-invite/:sessionId" component={InterviewInvitePage} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
        </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
