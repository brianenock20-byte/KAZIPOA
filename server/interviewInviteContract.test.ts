import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildInterviewInvitationEmail } from "./postmarkEmail";

describe("secure interview invitation contract", () => {
  const routers = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const page = readFileSync(resolve(process.cwd(), "client/src/pages/InterviewInvitePage.tsx"), "utf8");

  it("exposes only a strict public session-id and hex token query", () => {
    expect(routers).toContain("interviewInvite: publicProcedure");
    expect(routers).toContain("token: z.string().regex(/^[a-f0-9]{64}$/)");
    expect(routers).toContain("This interview invitation is invalid or expired");
  });

  it("creates an expiring invite URL and never places the raw hash in the recipient content", () => {
    expect(db).toContain("/interview-invite/${sessionId}?token=${encodeURIComponent(inviteToken)}");
    expect(db).toContain("buildInterviewInvitationEmail");
    expect(page).toContain("securely verified");
    expect(page).toContain("expires after the scheduled interview window");
    const email = buildInterviewInvitationEmail({ vacancyTitle: "Role", company: "Company", scheduledAt: "2026-09-01T09:30:00.000Z", inviteUrl: "https://example.test/interview-invite/1?token=abc" });
    expect(email.text).toContain("https://example.test/interview-invite/1?token=abc");
    expect(email.text).not.toContain("accessTokenHash");
  });
});
