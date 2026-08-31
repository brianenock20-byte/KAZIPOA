import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { emailValidationMessage, passwordStrength, passwordValidationMessage } from "../client/src/lib/authUi";

describe("authentication UX contract", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/CustomAuth.tsx"), "utf8");
  const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const sessionSource = readFileSync(resolve(process.cwd(), "server/customAuth.ts"), "utf8");
  const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

  it("offers Google sign-in from both login and registration", () => {
    expect(source).toContain("function GoogleSignInButton");
    expect(source).toContain("mode === \"login\" || mode === \"register\"");
    expect(source).toContain("Continue with Google");
    expect(source).toContain("startLogin()");
  });

  it("keeps the Swahili forgot-password entry and reset routes", () => {
    expect(source).toContain("Umesahau Nenosiri?");
    expect(source).toContain("requestReset.mutateAsync");
    expect(source).toContain("resetPassword.mutateAsync");
  });

  it("scores passwords and validates fields immediately", () => {
    expect(passwordStrength("")).toBe("empty");
    expect(passwordStrength("weak")).toBe("weak");
    expect(passwordStrength("LongerPass123!")).toBe("strong");
    expect(emailValidationMessage("wrong-email")).toContain("muundo sahihi");
    expect(emailValidationMessage("user@example.com")).toBeNull();
    expect(passwordValidationMessage("short")).toContain("angalau");
    expect(passwordValidationMessage("LongerPass123!")).toBeNull();
  });

  it("uses a secure remember-me preference without storing passwords", () => {
    expect(source).toContain("Nikumbuke kwenye kifaa hiki");
    expect(source).toContain("rememberMe");
    expect(routerSource).toContain("rememberMe: z.boolean().default(false)");
    expect(routerSource).toContain("createCustomSession(user.id, input.rememberMe)");
    expect(sessionSource).toContain("CUSTOM_SESSION_SHORT_TTL_MS");
    expect(appSource).toContain("path=\"/profile\"");
  });

  it("shows real-action success feedback before navigation or verification", () => {
    expect(source).toContain("Umeingia Kazipoa. Karibu kwenye workspace yako.");
    expect(source).toContain("Akaunti yako imetengenezwa. Hatua inayofuata ni kuthibitisha email yako.");
    expect(source).toContain("custom-auth-success-banner");
    expect(source).toContain("barua pepe ya kurejesha nenosiri imetumwa");
    expect(source).toContain("passwordToggleLabel");
  });
});
