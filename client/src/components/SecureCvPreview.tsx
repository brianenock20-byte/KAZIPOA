import { FileText } from "lucide-react";

type SecureCvPreviewProps = {
  previewUrl: string;
  mimeType: string;
  fileName: string;
  audience: "seeker" | "employer";
};

export default function SecureCvPreview({ previewUrl, mimeType, fileName, audience }: SecureCvPreviewProps) {
  const isPdf = mimeType === "application/pdf";
  const audienceLabel = audience === "employer" ? "Employer review workspace" : "Your private workspace";

  return (
    <div className="cv-preview-inline" data-cv-audience={audience}>
      <div className="cv-preview-inline-heading">
        <div>
          <p className="eyebrow">IN-APP CV PREVIEW</p>
          <strong>{fileName}</strong>
          <small>{audienceLabel} · private document access</small>
        </div>
        <span className="chip green">{isPdf ? "Preview ready" : "Stored securely"}</span>
      </div>
      {isPdf ? (
        <iframe className="cv-inline-frame" title={`CV preview for ${fileName}`} src={previewUrl} />
      ) : (
        <div className="empty-state cv-preview-unsupported">
          <FileText size={20} />
          <strong>Word CV stored securely</strong>
          <span>Inline preview is currently available for PDF CVs. Upload a PDF when you need an in-workspace preview.</span>
        </div>
      )}
    </div>
  );
}
