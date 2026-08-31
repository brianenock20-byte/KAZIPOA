import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type UserRole = "user" | "admin";

function contextWithRole(role: UserRole): TrpcContext {
  return {
    user: {
      id: 7,
      openId: `test-${role}`,
      email: `${role}@example.com`,
      name: role === "admin" ? "Admin" : "Employer",
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Admin moderation authorization", () => {
  it("blocks a normal user from the vacancy queue", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.vacancies.adminQueue()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks a normal user from moderating a vacancy", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.vacancies.moderate({ vacancyId: 1, action: "approve" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks a normal user from updating payment state", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.payments.updateState({ paymentId: 1, state: "successful" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks a normal user from viewing or deleting the test batch", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.vacancies.testBatch()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.vacancies.deleteTestBatch({ batchId: "KAZIPOA_PRELAUNCH_TEST_001", confirmation: "DELETE_TEST_BATCH" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
