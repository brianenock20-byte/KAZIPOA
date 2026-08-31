import { Building2, CheckCircle2, Image as ImageIcon, Loader2, Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const regions = ["Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Mbeya", "Morogoro", "Tanga", "Zanzibar North", "Zanzibar South", "Remote"];

type EmployerProfileDraft = {
  companyName: string;
  registrationNumber: string;
  industry: string;
  location: string;
  email: string;
  phone: string;
};

const emptyDraft: EmployerProfileDraft = {
  companyName: "",
  registrationNumber: "",
  industry: "",
  location: "Dar es Salaam",
  email: "",
  phone: "",
};

export default function EmployerCompanyProfileSetup() {
  const utils = trpc.useUtils();
  const profileQuery = trpc.employer.profile.useQuery(undefined, { staleTime: 30_000 });
  const saveProfileMutation = trpc.employer.saveProfile.useMutation();
  const uploadProfileImageMutation = trpc.employer.uploadProfileImage.useMutation();
  const [draft, setDraft] = useState<EmployerProfileDraft>(emptyDraft);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setDraft({
      companyName: profile.companyName ?? "",
      registrationNumber: profile.registrationNumber ?? "",
      industry: profile.industry ?? "",
      location: profile.location ?? "Dar es Salaam",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    });
  }, [profileQuery.data]);

  const updateDraft = <K extends keyof EmployerProfileDraft>(key: K, value: EmployerProfileDraft[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await saveProfileMutation.mutateAsync({
        companyName: draft.companyName.trim(),
        registrationNumber: draft.registrationNumber.trim() || undefined,
        industry: draft.industry.trim() || undefined,
        location: draft.location.trim() || undefined,
        email: draft.email.trim() || undefined,
        phone: draft.phone.trim() || undefined,
      });
      await utils.employer.profile.invalidate();
      toast.success("Company profile saved to your Employer workspace");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save company profile");
    }
  };

  const uploadImage = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Company image must be JPG, PNG, or WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Company image must be 5MB or smaller");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      try {
        await uploadProfileImageMutation.mutateAsync({ base64: reader.result, name: file.name, mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" });
        await utils.employer.profile.invalidate();
        toast.success("Company profile image updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not upload company image");
      }
    };
    reader.onerror = () => toast.error("Could not read company image");
    reader.readAsDataURL(file);
  };

  if (profileQuery.isLoading) {
    return <section className="employer-profile-setup employer-dashboard-card" aria-labelledby="employer-profile-setup-title"><div className="employer-profile-setup-loading" role="status"><Loader2 className="button-spinner" size={18} /><span>Loading your company profile…</span></div></section>;
  }

  return <section className="employer-profile-setup employer-dashboard-card" aria-labelledby="employer-profile-setup-title">
    <div className="employer-profile-setup-heading">
      <div><p className="eyebrow">COMPANY PROFILE</p><h3 id="employer-profile-setup-title">Set up your company details</h3><p>Give Job Seekers the context they need before they apply. Your profile is saved to this Employer account.</p></div>
      <span className={`employer-profile-status ${profileQuery.data?.verified === 1 ? "verified" : "pending"}`}><Building2 size={15} />{profileQuery.data?.verified === 1 ? "Verified" : "Profile not verified yet"}</span>
    </div>
    {profileQuery.isError && <p className="employer-profile-error" role="alert">We could not load your profile. You can still try saving the details below.</p>}
    <div className="employer-profile-image-panel">
      <div className="employer-profile-image-preview">
        {profileQuery.data?.profileImageUrl ? <img src={profileQuery.data.profileImageUrl} alt={`${draft.companyName || "Company"} profile`} /> : <span aria-hidden="true"><ImageIcon size={26} /></span>}
      </div>
      <div className="employer-profile-image-copy"><strong>Company profile image</strong><p>Add a clear company logo or workplace image. It is stored with this Employer profile and is not used as a vacancy image.</p><label className="outline-button small employer-profile-image-upload"><Upload size={14} />{uploadProfileImageMutation.isPending ? "Uploading…" : profileQuery.data?.profileImageUrl ? "Update image" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadProfileImageMutation.isPending} onChange={event => { const file = event.target.files?.[0]; if (file) uploadImage(file); event.currentTarget.value = ""; }} /></label><small>JPG, PNG, or WebP · maximum 5 MB</small></div>
    </div>
    <form className="employer-profile-setup-form" onSubmit={submit}>
      <label>Registered company name<input required minLength={2} value={draft.companyName} onChange={event => updateDraft("companyName", event.target.value)} placeholder="ABC Tanzania Ltd" /></label>
      <label>Industry<input value={draft.industry} onChange={event => updateDraft("industry", event.target.value)} placeholder="Technology, healthcare, legal…" /></label>
      <label>Company registration / TIN<input value={draft.registrationNumber} onChange={event => updateDraft("registrationNumber", event.target.value)} placeholder="Business registration number" /></label>
      <label>Company location<select value={draft.location} onChange={event => updateDraft("location", event.target.value)}>{regions.map(region => <option key={region}>{region}</option>)}</select></label>
      <label>Company email<input type="email" value={draft.email} onChange={event => updateDraft("email", event.target.value)} placeholder="hr@company.co.tz" /></label>
      <label>Company phone<input value={draft.phone} onChange={event => updateDraft("phone", event.target.value)} placeholder="022 xxx xxxx" /></label>
      <div className="employer-profile-setup-actions"><span><CheckCircle2 size={15} /> Use accurate registered details for verification.</span><button type="submit" className="primary-button small" disabled={saveProfileMutation.isPending || !draft.companyName.trim()}>{saveProfileMutation.isPending ? <><Loader2 size={14} className="button-spinner" /> Saving…</> : <><Save size={14} /> Save company profile</>}</button></div>
    </form>
  </section>;
}
