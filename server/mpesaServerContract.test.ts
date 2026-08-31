import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("M-Pesa server integration contract", () => {
  const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const index = readFileSync(resolve(process.cwd(), "server/_core/index.ts"), "utf8");
  const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
  const docs = readFileSync(resolve(process.cwd(), "docs/mpesa-server-contract-sw.md"), "utf8");

  it("exposes Employer-only pending initiation and no client success mutation", () => {
    expect(router).toContain("initiateMpesa: employerProcedure");
    expect(router).toContain('pendingMpesaInitiation');
    expect(router).toContain('isProviderConfigured("mpesa")');
    expect(router).not.toContain("state: \"successful\" }); }),");
  });

  it("requires a signed raw-body callback and delegates verified payloads to the server", () => {
    expect(index).toContain("/api/payments/mpesa/callback");
    expect(index).toContain("verifyMpesaCallbackSignature");
    expect(index).toContain("parseMpesaCallback");
    expect(index).toContain("applyVerifiedMpesaCallback");
    expect(index).toContain("rawBody");
  });

  it("persists callback replay metadata and retains the paid-plus-approved gate", () => {
    expect(schema).toContain('callbackEventId: varchar("callbackEventId"');
    expect(schema).toContain('callbackPayloadHash: varchar("callbackPayloadHash"');
    expect(db).toContain("M-Pesa amount is not an approved Kazipoa vacancy fee");
    expect(db).toContain("M-Pesa callback amount does not match the payment");
    expect(db).toContain("M-Pesa payment already has a verified callback");
    expect(db).toContain('status: input.callback.state === "successful" ? "paid_pending_review" : "payment_pending"');
    expect(docs).toContain("successful payment, Employer verification, and Admin approval");
  });
});
