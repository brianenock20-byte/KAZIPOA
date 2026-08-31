import { describe, expect, it } from "vitest";
import { canPublishVacancy, publicPaymentMethods } from "./localPayments";

describe("local payment publication gate", () => {
  it("requires successful payment, admin approval, and verified employer", () => {
    expect(canPublishVacancy("successful", true, true)).toBe(true);
    expect(canPublishVacancy("pending", true, true)).toBe(false);
    expect(canPublishVacancy("successful", false, true)).toBe(false);
    expect(canPublishVacancy("successful", true, false)).toBe(false);
  });

  it("prioritizes M-Pesa and includes card methods", () => {
    expect(publicPaymentMethods[0]).toMatchObject({ id: "mpesa", priority: 1 });
    expect(publicPaymentMethods.map(method => method.id)).toEqual(
      expect.arrayContaining(["visa", "mastercard", "crdb_lipa_namba"]),
    );
  });
});
