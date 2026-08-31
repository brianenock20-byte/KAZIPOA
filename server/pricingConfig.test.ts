import { describe, expect, it } from "vitest";
import { getKazipoaPricingConfig } from "./pricingConfig";

describe("Kazipoa pricing configuration", () => {
  it("loads the configured manual payment number and Basic fee", () => {
    const config = getKazipoaPricingConfig();
    expect(config.paymentNumber).toBe("255763796723");
    expect(config.basicFeeTzs).toBe(10000);
  });
});
