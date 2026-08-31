import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";
import { buildCustomAuthPasswordResetEmail, buildCustomAuthVerificationEmail } from "./postmarkEmail";

describe("custom-auth email links", () => {
  it("uses the configured HTTPS application base URL for verification", () => {
    const email = buildCustomAuthVerificationEmail({ name: "Pilot User", token: "token/with spaces" });
    const expected = `${ENV.appBaseUrl}/verify-email?token=${encodeURIComponent("token/with spaces")}`;
    expect(email.text).toContain(expected);
    expect(email.html).toContain(expected);
    expect(new URL(ENV.appBaseUrl).protocol).toBe("https:");
  });

  it("uses the same canonical base URL for password recovery", () => {
    const email = buildCustomAuthPasswordResetEmail({ name: "Pilot User", token: "reset-token" });
    expect(email.text).toContain(`${ENV.appBaseUrl}/reset-password?token=reset-token`);
    expect(email.html).toContain(`${ENV.appBaseUrl}/reset-password?token=reset-token`);
  });
});
