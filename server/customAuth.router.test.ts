import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("custom authentication pilot router", () => {
  function caller() {
    const ctx: TrpcContext = {
      user: undefined,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        cookie: () => undefined,
        clearCookie: () => undefined,
      } as TrpcContext["res"],
    };
    return appRouter.createCaller(ctx);
  }

  it("reports the configured pilot state", async () => {
    const result = await caller().auth.customStatus();
    expect(result).toEqual({ enabled: expect.any(Boolean) });
  });

  it("does not process login credentials while the pilot is disabled", async () => {
    const authCaller = caller();
    const status = await authCaller.auth.customStatus();
    if (status.enabled) return;

    await expect(authCaller.auth.customLogin({
      email: "pilot@example.com",
      password: "Correct Horse Battery Staple",
    })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
