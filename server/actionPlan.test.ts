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

describe("Action Plan core workflow contracts", () => {
  it("protects the seeker application procedure", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.seeker.submitApplication({ vacancyId: 1, cvDocumentId: 1, coverNote: "A valid cover note for this application" })).rejects.toThrow();
  });

  it("protects Admin employer verification beside vacancy moderation", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.vacancies.verifyEmployer({ employerUserId: 1 })).rejects.toThrow();
    await expect(caller.vacancies.moderate({ vacancyId: 1, action: "approve" })).rejects.toThrow();
  });
});
