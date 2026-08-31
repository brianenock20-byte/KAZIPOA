import { ArrowRight, CalendarDays, CircleAlert, MapPin, X } from "lucide-react";

export type EmployerVacancyPreviewDraft = {
  company: string;
  title: string;
  category: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  education: string;
  skills: string;
  deadline: string;
  tierLabel: string;
  tierAmount: number;
  urgent: boolean;
  description: string;
};

type Props = { draft: EmployerVacancyPreviewDraft; onClose: () => void };

export default function EmployerVacancyPreview({ draft, onClose }: Props) {
  const skills = draft.skills.split(",").map(skill => skill.trim()).filter(Boolean);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="job-modal vacancy-preview-modal" role="dialog" aria-modal="true" aria-labelledby="vacancy-preview-title" onClick={event => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close vacancy preview"><X size={19} /></button>
        <div className="vacancy-preview-kicker"><span>EMPLOYER PREVIEW</span><span>Not published</span></div>
        <p className="eyebrow">{draft.category}</p>
        <h2 id="vacancy-preview-title">{draft.title || "Untitled vacancy"}</h2>
        <p className="company-line">{draft.company || "Your company"} · {draft.location || "Location not selected"}</p>
        <div className="vacancy-preview-meta">
          <span><MapPin size={15} /> {draft.location || "Location not selected"}</span>
          <span><CalendarDays size={15} /> Closes {draft.deadline || "Date not selected"}</span>
          <strong>{draft.salary || "Salary to be discussed"}</strong>
        </div>
        <div className="vacancy-preview-summary"><span>{draft.type}</span><span>{draft.experience}</span><span>{draft.education}</span><span>{draft.tierLabel} · TZS {draft.tierAmount.toLocaleString()}</span></div>
        <h3>About the role</h3>
        <p className="vacancy-preview-description">{draft.description || "Add a clear description before submitting this vacancy."}</p>
        <h3>Skills</h3>
        {skills.length ? <div className="skill-list">{skills.map(skill => <span className="chip" key={skill}>{skill}</span>)}</div> : <p className="form-note">No skills added yet.</p>}
        <div className="safety-callout"><CircleAlert size={19} /><span><strong>Preview only</strong><small>This view uses the current form values. It has not created a database record and will not publish the vacancy.</small></span></div>
        <div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>Back to edit</button><button type="button" className="primary-button" onClick={onClose}>Continue to submit <ArrowRight size={16} /></button></div>
      </section>
    </div>
  );
}
