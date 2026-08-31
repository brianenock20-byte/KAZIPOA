import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, FileText, LayoutDashboard, Settings2, ShieldCheck, UserRound, Users, WalletCards } from "lucide-react";

export type RoleWorkspace = "employer" | "seeker";

export type RoleWorkspaceSidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
};

const employerItems = [
  { id: "company-profile", label: "Company profile", icon: Building2 },
  { id: "marketplace", label: "Recruitment workplace", icon: BriefcaseBusiness },
  { id: "dashboard", label: "Application trend", icon: LayoutDashboard },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "interviews", label: "My interviews", icon: CalendarDays },
  { id: "post-vacancy", label: "Post a vacancy", icon: FileText },
  { id: "payments", label: "Payments & packages", icon: WalletCards },
] as const;

const seekerItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "education", label: "Academic qualifications", icon: FileText },
  { id: "experience", label: "Working experience", icon: BriefcaseBusiness },
  { id: "skills", label: "Skills & languages", icon: Settings2 },
  { id: "certifications", label: "Certifications", icon: ShieldCheck },
  { id: "cv", label: "CV & attachments", icon: FileText },
  { id: "applications", label: "My applications", icon: CheckCircle2 },
  { id: "saved", label: "Saved jobs", icon: WalletCards },
] as const;

export function RoleWorkspaceSidebar({ role, activeId, onNavigate }: { role: RoleWorkspace; activeId: string; onNavigate: (id: string) => void }) {
  const items = role === "employer" ? employerItems : seekerItems;
  const title = role === "employer" ? "Employer workplace" : "Job Seeker portfolio";
  const note = role === "employer" ? "Manage your company, vacancies, candidates, interviews, and payment workflow." : "Build your profile, discover suitable work, and track your applications.";

  return <div className={`role-workspace-sidebar role-workspace-sidebar-${role}`}>
    <div className="role-workspace-sidebar-head"><div><p className="eyebrow">{role === "employer" ? "EMPLOYER WORKPLACE" : "JOB SEEKER PORTFOLIO"}</p><strong>{title}</strong></div></div>
    <nav aria-label={`${title} sections`}>
      {items.map(item => { const Icon = item.icon; return <button key={item.id} type="button" className={activeId === item.id ? "active" : ""} aria-current={activeId === item.id ? "page" : undefined} onClick={() => onNavigate(item.id)}><Icon size={16} />{item.label}</button>; })}
    </nav>
    <div className="role-workspace-sidebar-note"><ShieldCheck size={16} /><span>{note}</span></div>
  </div>;
}

export default RoleWorkspaceSidebar;
