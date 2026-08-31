import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const schemaSource = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const workflowDoc = readFileSync(new URL("../docs/employer-payment-vacancy-workflow-schema-sw.md", import.meta.url), "utf8");
const liveInterviewDoc = readFileSync(new URL("../docs/employer-live-interview-boundary-sw.md", import.meta.url), "utf8");
const employerWorkspaceSource = readFileSync(new URL("../client/src/components/EmployerRecruitmentWorkspaces.tsx", import.meta.url), "utf8");
const employerVacancySource = readFileSync(new URL("../client/src/components/EmployerVacancyManagement.tsx", import.meta.url), "utf8");

describe("Employer vacancy and manual payment workflow", () => {
  it("requires an Employer profile and creates payment evidence as pending", () => {
    expect(routerSource).toContain("Complete your employer profile before using employer tools");
    expect(routerSource).toContain('const hasPaymentEvidence = Boolean(input.method && input.amountTzs && input.providerReference)');
    expect(dbSource).toContain('state: "pending"');
    expect(dbSource).toContain('status: "paid_pending_review"');
  });

  it("keeps publication behind successful payment, employer verification, and Admin approval", () => {
    expect(dbSource).toContain('payment.state === "successful"');
    expect(dbSource).toContain('current[0].employerVerified !== 1');
    expect(dbSource).toContain('nextStatus = "live"');
    expect(routerSource).toContain('moderateVacancy');
  });

  it("uses protected Admin procedures for payment and vacancy decisions", () => {
    expect(routerSource).toContain('adminQueue: adminProcedure.query(() => listPendingVacancies())');
    expect(routerSource).toContain('updateState: adminProcedure');
    expect(routerSource).toContain('moderate: adminProcedure');
    expect(homeSource).toContain("Admin note: confirm the reference or explain why this payment is rejected");
    expect(homeSource).toContain("Payment evidence is pending Admin review; it is not published yet.");
  });

  it("notifies the Employer after persisted payment and vacancy decisions", () => {
    expect(dbSource).toContain("notifyEmployerOfPaymentStatus");
    expect(dbSource).toContain("notifyEmployerOfVacancyDecision");
    expect(dbSource).toContain("employer_payment_");
    expect(dbSource).toContain("employer_vacancy_");
    expect(homeSource).toContain("Payment and vacancy decisions");
    expect(homeSource).toContain("Admin notifications");
  });

  it("shows full vacancy review context behind an Admin-only procedure", () => {
    expect(routerSource).toContain("detail: adminProcedure");
    expect(dbSource).toContain("getAdminVacancyReview");
    expect(dbSource).toContain("moderationLogs: moderationRows");
    expect(homeSource).toContain("View full vacancy");
    expect(homeSource).toContain("Payment gate");
  });

  it("does not claim automatic payment confirmation without a provider callback", () => {
    const providerSource = readFileSync(new URL("./localPayments.ts", import.meta.url), "utf8");
    expect(providerSource).toContain("verifyCallback");
    expect(providerSource).not.toContain("export async function handleWebhook");
    expect(homeSource).toContain("Payment evidence is pending Admin review; it is not published yet.");
  });

  it("allows only rejected or changes-requested vacancies to be edited and resubmitted", () => {
    expect(dbSource).toContain("resubmitEmployerVacancy");
    expect(dbSource).toContain('Only rejected or changes-requested vacancies can be resubmitted');
    expect(dbSource).toContain('status: nextStatus');
    expect(routerSource).toContain('editVacancy: employerProcedure');
    expect(employerVacancySource).toContain("Save & Resubmit");
  });

  it("keeps urgent vacancy pricing distinct from monthly and premium prices", () => {
    expect(homeSource).toContain('id: "urgent"');
    expect(homeSource).toContain('amount: 30000');
    expect(homeSource).toContain("approved urgent vacancy");
    expect(homeSource).toContain("Candidate alerts by enabled channels after publication");
  });

  it("persists employer-selected urgency and enforces the configured urgent fee", () => {
    expect(routerSource).toContain('urgent: z.boolean().optional()');
    expect(routerSource).toContain('input.urgent && input.amountTzs !== 30000');
    expect(dbSource).toContain('urgent: input.urgent ? 1 : 0');
    expect(homeSource).toContain("Mark as urgent");
    expect(homeSource).toContain("Urgent posting: TZS 30,000");
  });

  it("requires a specific Admin reason before rejecting a vacancy", () => {
    expect(routerSource).toContain('action !== "reject" || Boolean(value.reason?.trim())');
    expect(homeSource).toContain("Rejection reason");
    expect(homeSource).toContain("Add a specific rejection reason before rejecting this vacancy");
    expect(homeSource).toContain("Explain exactly what the employer should correct");
  });

  it("keeps the live interview action Employer-only and honest about provider readiness", () => {
    expect(routerSource).toContain('manageCandidate: employerProcedure');
    expect(employerWorkspaceSource).toContain("Live interview");
    expect(employerWorkspaceSource).toContain("EMPLOYER LIVE INTERVIEW");
    expect(employerWorkspaceSource).toContain("Video provider setup required");
    expect(employerWorkspaceSource).toContain("no video provider is connected yet");
    expect(liveInterviewDoc).toContain("Employer-only");
    expect(liveInterviewDoc).toContain("not_configured");
    expect(liveInterviewDoc).toContain("fake meeting link");
  });

  it("documents the production tables and manual state transitions", () => {
    expect(schemaSource).toContain('export const employerProfiles');
    expect(schemaSource).toContain('export const vacancies');
    expect(schemaSource).toContain('export const payments');
    expect(schemaSource).toContain('export const moderationLogs');
    expect(workflowDoc).toContain("Hali za payment");
    expect(workflowDoc).toContain("Gates za publication");
    expect(workflowDoc).toContain("haupaswi kufanya auto-verification");
  });
});
