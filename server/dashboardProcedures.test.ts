import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthenticatedContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("dashboard procedure authorization", () => {
  it("blocks unauthenticated Admin receipt access", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.payments.adminReceipt({ paymentId: 1 })).rejects.toThrow();
  });

  it("blocks unauthenticated Employer application updates", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.employer.manageCandidate({ applicationId: 1, status: "shortlisted" })).rejects.toThrow();
  });

  it("blocks unauthenticated saved-vacancy access", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.seeker.saved()).rejects.toThrow();
    await expect(caller.seeker.savedPage({ page: 1, pageSize: 12, sort: "recent" })).rejects.toThrow();
    await expect(caller.seeker.saveVacancy({ vacancyId: 1 })).rejects.toThrow();
    await expect(caller.seeker.removeSavedVacancy({ vacancyId: 1 })).rejects.toThrow();
  });

  it("blocks unauthenticated subscription status access", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.subscriptions.me()).rejects.toThrow();
  });
});

function authenticatedUserContext(role: "user" | "admin" = "user"): TrpcContext {
  const now = new Date();
  return {
    user: { id: 44, openId: "dashboard-test-user", name: "Dashboard Test", email: "dashboard@example.com", loginMethod: "test", role, createdAt: now, updatedAt: now, lastSignedIn: now },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("authenticated dashboard authorization", () => {
  it("blocks a non-admin from payment review routes", async () => {
    const caller = appRouter.createCaller(authenticatedUserContext("user"));
    await expect(caller.payments.adminReviews()).rejects.toThrow();
    await expect(caller.payments.adminReceipt({ paymentId: 1 })).rejects.toThrow();
  });

  it("guards candidate management behind an Employer profile before database work", () => {
    const routers = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(routers).toContain("manageCandidate: employerProcedure");
    expect(routers).toContain("const employerProfile = await getEmployerProfile(ctx.user.id)");
    expect(routers).toContain('message: "Employer profile required"');
  });
});

export function subscriptionStatusCopy(status: "pending" | "active" | undefined) {
  if (status === "active") return { label: "Approved", message: "Your plan is active." };
  if (status === "pending") return { label: "Pending", message: "Payment pending Admin review." };
  return { label: "Pending", message: "No active subscription." };
}

describe("subscription status presentation", () => {
  it("shows pending and active states distinctly", () => {
    expect(subscriptionStatusCopy("pending")).toEqual({ label: "Pending", message: "Payment pending Admin review." });
    expect(subscriptionStatusCopy("active")).toEqual({ label: "Approved", message: "Your plan is active." });
  });
});


describe("employer profile live contract", () => {
  it("blocks unauthenticated profile reads and writes", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.employer.profile()).rejects.toThrow();
    await expect(caller.employer.saveProfile({ companyName: "Test Company" })).rejects.toThrow();
  });
});

export function profileSavePayload(input: { companyName: string; email?: string }) {
  return { companyName: input.companyName.trim(), email: input.email?.trim() || undefined };
}

describe("profile save payload", () => {
  it("removes blank optional contact values before the live mutation", () => {
    expect(profileSavePayload({ companyName: "  Acme Tanzania  ", email: "  " })).toEqual({ companyName: "Acme Tanzania", email: undefined });
  });
});


describe("admin platform settings authorization", () => {
  it("blocks unauthenticated and non-admin settings access", async () => {
    const unauthenticated = appRouter.createCaller(unauthenticatedContext());
    const regularUser = appRouter.createCaller(authenticatedUserContext("user"));
    await expect(unauthenticated.admin.settings()).rejects.toThrow();
    await expect(regularUser.admin.settings()).rejects.toThrow();
    await expect(regularUser.admin.saveSettings({ categories: "IT", regions: "Dar es Salaam", supportPhoneNumbers: "+255616116779", publicationReviewHours: "One business day", seekerStatusEmailNotifications: "enabled", employerStatusEmailNotifications: "enabled" })).rejects.toThrow();
  });
});
