import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";
import { buildApplicationStatusEmail, buildInterviewInvitationEmail } from "./postmarkEmail";

describe("Postmark email integration", () => {
  it("builds the application status email payload", () => {
    const email = buildApplicationStatusEmail({ previousStatus: "reviewing", nextStatus: "shortlisted", applicationId: 42 });
    expect(email.subject).toContain("shortlisted");
    expect(email.text).toContain("#42");
    expect(email.html).toContain("portol.kazipoa.co.tz");
    expect(ENV.appBaseUrl).toBe("https://portol.kazipoa.co.tz");
  });

  it("includes interview schedule and employer note in interview invitations", () => {
    const email = buildApplicationStatusEmail({ previousStatus: "shortlisted", nextStatus: "interview", applicationId: 43, interviewAt: "2026-09-01T09:30:00.000Z", interviewNote: "Bring your ID and arrive 10 minutes early" });
    expect(email.subject).toContain("interview invitation");
    expect(email.text).toContain("Interview schedule:");
    expect(email.text).toContain("Sep");
    expect(email.text).toContain("Bring your ID");
    expect(email.html).toContain("Message from the employer:");
  });

  it("builds an interview invitation with a secure response URL and no live-room claim", () => {
    const email = buildInterviewInvitationEmail({ vacancyTitle: "Finance Officer", company: "Kazipoa Test Ltd", scheduledAt: "2026-09-01T09:30:00.000Z", note: "Bring your ID", inviteUrl: "https://portol.kazipoa.co.tz/interview-invite/12?token=secret-token" });
    expect(email.text).toContain("https://portol.kazipoa.co.tz/interview-invite/12?token=secret-token");
    expect(email.html).toContain("Review invitation and respond securely");
    expect(email.text).toContain("Bring your ID");
    expect(email.html).toContain("only be available after a provider is configured");
  });

  it.skipIf(!ENV.postmarkServerToken)("exposes the configured Postmark sender contract", () => {
    expect(ENV.postmarkServerToken).toBeTruthy();
    expect(ENV.postmarkFromEmail).toBe("notifications@portol.kazipoa.co.tz");
    expect(ENV.postmarkMessageStream).toBe("outbound");
  });
});
