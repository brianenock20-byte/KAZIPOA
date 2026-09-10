import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";

type Intent = "seeker" | "employer" | "not_sure";

export default function EarlyAccess() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState<Intent>("seeker");
  const [done, setDone] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const join = trpc.waitlist.join.useMutation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const result = await join.mutateAsync({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, intent });
      setAlreadyJoined(result.alreadyJoined);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="early-access-page">
      <div className="early-access-glow" />
      <div className="early-access-shell">
        <div className="early-access-topbar">
          <Link href="/" className="early-access-back"><ArrowLeft size={15} /> Back to Kazipoa</Link>
          <ThemeToggle />
        </div>
        <div className="early-access-card">
          <div className="early-access-badge"><Sparkles size={14} /> Early access</div>
          <h1>Be first to know when Kazipoa opens near you.</h1>
          <p className="early-access-intro">Leave your details and we'll reach out personally as new opportunities and employers join the platform. This isn't a full account &mdash; just a way for us to keep you in the loop.</p>

          {done ? (
            <div className="early-access-success" role="status">
              <CheckCircle2 size={22} />
              <h2>{alreadyJoined ? "You're already on the list." : "You're on the list!"}</h2>
              <p>{alreadyJoined ? "We already have your details from before. We'll be in touch." : "We'll reach out at " + email + " as soon as there's something worth telling you about."}</p>
              <Link href="/" className="early-access-home-link">Return to homepage</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="early-access-form">
              <div className="early-access-field">
                <Label htmlFor="ea-name">Full name</Label>
                <Input id="ea-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required minLength={2} maxLength={180} />
              </div>
              <div className="early-access-field">
                <Label htmlFor="ea-email">Email address</Label>
                <Input id="ea-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required maxLength={320} />
              </div>
              <div className="early-access-field">
                <Label htmlFor="ea-phone">Phone number (optional)</Label>
                <Input id="ea-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+255 712 345 678" maxLength={32} />
              </div>
              <div className="early-access-field">
                <Label>I'm mainly here to</Label>
                <div className="early-access-intent-row">
                  <button type="button" className={`early-access-intent-option ${intent === "seeker" ? "active" : ""}`} onClick={() => setIntent("seeker")}>Find work</button>
                  <button type="button" className={`early-access-intent-option ${intent === "employer" ? "active" : ""}`} onClick={() => setIntent("employer")}>Hire people</button>
                  <button type="button" className={`early-access-intent-option ${intent === "not_sure" ? "active" : ""}`} onClick={() => setIntent("not_sure")}>Not sure yet</button>
                </div>
              </div>
              {error && <p className="early-access-error" role="alert">{error}</p>}
              <Button type="submit" disabled={join.isPending} className="early-access-submit">
                {join.isPending ? <><Loader2 size={16} className="early-access-spin" /> Joining…</> : "Join the waitlist"}
              </Button>
              <p className="early-access-fineprint">Already have an account? <Link href="/login">Sign in instead</Link></p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
