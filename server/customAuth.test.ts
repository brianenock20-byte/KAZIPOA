import { describe, expect, it } from "vitest";
import {
  customAuthConfig,
  getAuthRateLimitDecision,
  hashCustomPassword,
  hashOpaqueToken,
  isAuthTokenActive,
  isCustomSessionActive,
  normalizeEmail,
  validateCustomPassword,
  verifyCustomPassword,
} from "./customAuth";

describe("custom authentication safety primitives", () => {
  it("normalizes email addresses without changing password casing", () => {
    expect(normalizeEmail("  Candidate@Example.COM ")).toBe("candidate@example.com");
    expect(validateCustomPassword("ShortPass1!")).toContain("12 characters");
    expect(validateCustomPassword("Correct Horse Battery Staple")).toBeNull();
  });

  it("hashes passwords with a salted one-way scrypt record", async () => {
    const password = "Correct Horse Battery Staple";
    const stored = await hashCustomPassword(password);

    expect(stored).toMatch(/^scrypt\$N=131072\$r=8\$p=1\$[^$]+\$[^$]+$/);
    expect(stored).not.toContain(password);
    expect(await verifyCustomPassword(password, stored)).toBe(true);
    expect(await verifyCustomPassword("Correct Horse Battery Staple!", stored)).toBe(false);
  });

  it("hashes opaque tokens deterministically without exposing the token", () => {
    const token = "pilot-token-value";
    expect(hashOpaqueToken(token)).toHaveLength(64);
    expect(hashOpaqueToken(token)).toBe(hashOpaqueToken(token));
    expect(hashOpaqueToken(token)).not.toBe(token);
  });

  it("enforces rate-limit windows and blocked retries deterministically", () => {
    const now = new Date("2026-08-23T05:00:00.000Z");
    expect(getAuthRateLimitDecision({ attemptCount: 4, windowStartedAt: new Date(now.getTime() - 60_000) }, now)).toMatchObject({ allowed: true, remaining: 1 });
    expect(getAuthRateLimitDecision({ attemptCount: 5, windowStartedAt: new Date(now.getTime() - 60_000) }, now)).toMatchObject({ allowed: false, remaining: 0 });
    expect(getAuthRateLimitDecision({ attemptCount: 5, windowStartedAt: new Date(now.getTime() - 16 * 60_000) }, now)).toMatchObject({ allowed: true, remaining: 5 });
    const retryAt = new Date(now.getTime() + 60_000);
    expect(getAuthRateLimitDecision({ attemptCount: 1, windowStartedAt: now, blockedUntil: retryAt }, now)).toMatchObject({ allowed: false, remaining: 0, retryAt });
  });

  it("accepts only unconsumed, unexpired single-use tokens", () => {
    const now = new Date("2026-08-23T05:00:00.000Z");
    expect(isAuthTokenActive({ expiresAt: new Date(now.getTime() + 1_000) }, now)).toBe(true);
    expect(isAuthTokenActive({ expiresAt: new Date(now.getTime() - 1_000) }, now)).toBe(false);
    expect(isAuthTokenActive({ consumedAt: now, expiresAt: new Date(now.getTime() + 1_000) }, now)).toBe(false);
  });

  it("rejects revoked and expired custom sessions", () => {
    const now = new Date("2026-08-23T05:00:00.000Z");
    expect(isCustomSessionActive({ expiresAt: new Date(now.getTime() + 60_000) }, now)).toBe(true);
    expect(isCustomSessionActive({ revokedAt: now, expiresAt: new Date(now.getTime() + 60_000) }, now)).toBe(false);
    expect(isCustomSessionActive({ expiresAt: new Date(now.getTime() - 60_000) }, now)).toBe(false);
  });

  it("keeps the pilot limits explicit and bounded", () => {
    expect(customAuthConfig.emailVerificationTtlMs).toBe(24 * 60 * 60 * 1000);
    expect(customAuthConfig.passwordResetTtlMs).toBe(30 * 60 * 1000);
    expect(customAuthConfig.maxAttemptsPerWindow).toBe(5);
  });
});
