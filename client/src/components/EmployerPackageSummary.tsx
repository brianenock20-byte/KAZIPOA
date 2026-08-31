import { useState } from "react";
import { BarChart3, Check, CheckCircle2, ChevronDown, Clock3, CreditCard, Loader2, Mail, MessageSquareText, PackageOpen, ShieldCheck, Sparkles, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AcceptedPaymentMethods from "@/components/AcceptedPaymentMethods";

const vacancyPackages = [
  {
    id: "basic",
    name: "Basic vacancy",
    price: "TZS 10,000",
    eyebrow: "For one standard hire",
    detail: "A straightforward vacancy listing for employers who want the normal review and publication flow.",
    benefits: ["One vacancy submission", "Standard Admin review", "Marketplace publication after approval"],
    icon: PackageOpen,
  },
  {
    id: "featured",
    name: "Featured vacancy",
    price: "TZS 25,000",
    eyebrow: "For more visibility",
    detail: "Give one important role stronger visibility after payment, employer verification, and Admin approval.",
    benefits: ["Featured presentation", "Standard publication checks", "Stronger visibility in the marketplace"],
    icon: Sparkles,
    featured: true,
  },
  {
    id: "urgent",
    name: "Urgent vacancy",
    price: "TZS 30,000",
    eyebrow: "For time-sensitive hiring",
    detail: "Mark one approved vacancy as urgent so eligible candidates can recognise the hiring priority and act quickly.",
    benefits: ["Urgent label on the vacancy", "Candidate email notification readiness", "Candidate SMS notification readiness", "Publication only after Admin approval"],
    icon: Clock3,
    urgent: true,
  },
  {
    id: "premium",
    name: "Premium vacancy",
    price: "TZS 50,000",
    eyebrow: "For hard-to-fill roles",
    detail: "Priority treatment for one important vacancy that needs a more prominent employer presentation.",
    benefits: ["Premium presentation", "Priority treatment", "Application tracking in your workspace"],
    icon: ShieldCheck,
  },
];

const monthlyPlans = [
  {
    id: "plan-starter",
    name: "Starter",
    price: "TZS 50,000/month",
    audience: "For small teams hiring occasionally",
    detail: "A practical starting plan for a small team that needs a dependable Employer workspace without a high monthly commitment.",
    benefits: ["Up to 5 active vacancies", "Up to 50 candidate-management records", "Core Employer workspace"],
  },
  {
    id: "plan-business",
    name: "Business",
    price: "TZS 150,000/month",
    audience: "For teams hiring throughout the month",
    detail: "A broader plan for active hiring teams that need more vacancy capacity and a larger candidate-management allowance.",
    benefits: ["Up to 20 active vacancies", "Up to 250 candidate-management records", "Expanded hiring workflow"],
    featured: true,
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    price: "Custom pricing",
    audience: "For larger teams with tailored needs",
    detail: "A tailored arrangement for larger recruitment operations. Contact Kazipoa support to discuss capacity and workflow needs.",
    benefits: ["Tailored posting capacity", "Tailored candidate-management capacity", "Discussed with Kazipoa support"],
  },
];

export default function EmployerPackageSummary() {
  const subscriptionQuery = trpc.subscriptions.me.useQuery(undefined, { staleTime: 30_000 });
  const subscription = subscriptionQuery.data?.subscription;
  const [openPackageId, setOpenPackageId] = useState<string | null>(null);

  const togglePackage = (id: string) => setOpenPackageId(current => current === id ? null : id);

  return <section className="employer-package-summary employer-dashboard-card" aria-labelledby="employer-package-summary-title">
    <div className="employer-package-summary-heading">
      <div>
        <p className="eyebrow">EMPLOYER PLANS & PACKAGES</p>
        <h3 id="employer-package-summary-title">Choose the hiring support that fits your next role</h3>
        <p>Compare one-off vacancy packages with monthly plans. Open one package at a time to see exactly what is included. Every listing still follows payment, verification, and Admin publication checks.</p>
      </div>
      <span className="employer-package-status"><CreditCard size={15} />{subscription?.status === "active" ? "Plan active" : subscription?.status === "pending" ? "Plan under review" : "Pay per vacancy"}</span>
    </div>

    {subscriptionQuery.isLoading ? <div className="employer-package-loading" role="status"><Loader2 size={17} className="button-spinner" /> Loading your plan status…</div> : <>
      <div className="employer-package-section-heading"><div><p className="eyebrow">ONE-OFF VACANCY PACKAGES</p><strong>Pay for the role you are posting</strong></div><small>Click one package to expand its benefits</small></div>
      <AcceptedPaymentMethods />
      <div className="employer-package-grid" aria-label="One-off vacancy packages">{vacancyPackages.map(item => { const Icon = item.icon; const isOpen = openPackageId === item.id; return <article className={`employer-package-card ${item.featured ? "featured" : ""} ${isOpen ? "expanded" : ""}`} key={item.id}>
        <button type="button" className="employer-package-card-trigger" aria-expanded={isOpen} onClick={() => togglePackage(item.id)}>
          <span className="employer-package-card-top"><span className="employer-package-icon"><Icon size={17} /></span><span>{item.eyebrow}</span></span>
          <span className="employer-package-card-title"><strong>{item.name}</strong><b>{item.price}</b></span>
          <span className="employer-package-trigger-hint">{isOpen ? "Hide package details" : "View package details"}<ChevronDown size={16} /></span>
        </button>
        {isOpen && <div className="employer-package-card-details"><p>{item.detail}</p><ul>{item.benefits.map(benefit => <li key={benefit}><Check size={14} />{benefit}</li>)}</ul>{item.urgent && <div className="employer-urgent-notification-note"><div><Mail size={15} /><MessageSquareText size={15} /></div><span><strong>How urgent candidate alerts work</strong><small>When the SMS provider is configured, eligible candidates receive the urgent vacancy notice by email and text message using the phone number saved in their profile. Until provider credentials are active, the alert remains prepared but is not sent.</small></span></div>}<span className="employer-package-footnote"><CheckCircle2 size={14} /> Receipt and Admin review required</span></div>}
      </article>; })}</div>

      <div className="employer-package-section-heading monthly"><div><p className="eyebrow">MONTHLY EMPLOYER PLANS</p><strong>For recurring recruitment</strong></div><small>Click one plan to expand its benefits</small></div>
      <div className="employer-monthly-plan-list">{monthlyPlans.map(plan => { const isOpen = openPackageId === plan.id; return <article className={`employer-monthly-plan ${plan.featured ? "featured" : ""} ${isOpen ? "expanded" : ""}`} key={plan.id}>
        <button type="button" className="employer-monthly-plan-trigger" aria-expanded={isOpen} onClick={() => togglePackage(plan.id)}><span className="employer-monthly-plan-main"><span className="employer-monthly-plan-title"><span>{plan.name}</span>{plan.featured && <em>Popular</em>}</span><b>{plan.price}</b><small>{plan.audience}</small></span><span className="employer-package-trigger-hint">{isOpen ? "Hide plan details" : "View plan details"}<ChevronDown size={16} /></span></button>
        {isOpen && <div className="employer-monthly-plan-details"><p>{plan.detail}</p><ul>{plan.benefits.map(benefit => <li key={benefit}><Check size={14} />{benefit}</li>)}</ul></div>}
      </article>; })}</div>

      <div className="employer-package-guidance"><div><ShieldCheck size={18} /><span><strong>What happens after you choose?</strong><small>Submit the vacancy and payment evidence, then follow review status from your own postings history. A package does not bypass verification or Admin approval.</small></span></div><div><BarChart3 size={18} /><span><strong>Track value in one place</strong><small>Your Employer dashboard keeps your postings, applications, views, and plan status together.</small></span></div><div><Users size={18} /><span><strong>Candidate management</strong><small>Active plan limits apply to vacancy and candidate-management actions.</small></span></div></div>
    </>}
  </section>;
}
