import { Facebook, Link2, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { vacancyShareTargets } from "@shared/marketplaceView";

type Props = {
  vacancyId: string | number;
  title: string;
  company: string;
  onClose: () => void;
};

export default function VacancyShareMenu({ vacancyId, title, company, onClose }: Props) {
  const { url, whatsapp, facebook, x } = vacancyShareTargets(window.location.origin, vacancyId, title, company);
  const openShare = (target: string) => {
    window.open(target, "_blank", "noopener,noreferrer");
    onClose();
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Vacancy link copied to clipboard");
    } catch {
      toast("Copy this vacancy URL from your browser");
    }
    onClose();
  };
  return <div className="modal-backdrop share-menu-backdrop" role="presentation" onClick={onClose}>
    <section className="share-menu" role="dialog" aria-modal="true" aria-labelledby="share-vacancy-title" onClick={event => event.stopPropagation()}>
      <button type="button" className="modal-close" onClick={onClose} aria-label="Close share menu"><X size={19}/></button>
      <p className="eyebrow">SHARE OPPORTUNITY</p>
      <h2 id="share-vacancy-title">Send this vacancy to someone who may be a great fit.</h2>
      <p className="share-menu-copy">{title} · {company}</p>
      <div className="share-option-grid">
        <button type="button" className="share-option whatsapp" onClick={() => openShare(whatsapp)}><MessageCircle size={20}/><span>WhatsApp</span></button>
        <button type="button" className="share-option facebook" onClick={() => openShare(facebook)}><Facebook size={20}/><span>Facebook</span></button>
        <button type="button" className="share-option x-social" onClick={() => openShare(x)}><span className="x-social-mark">𝕏</span><span>X</span></button>
        <button type="button" className="share-option copy-link" onClick={() => void copyLink()}><Link2 size={20}/><span>Copy link</span></button>
      </div>
      <p className="share-menu-url">{url}</p>
    </section>
  </div>;
}
