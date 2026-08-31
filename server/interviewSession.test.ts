import { describe, expect, it } from "vitest";
import { hashInterviewAccessToken, isInterviewAccessTokenExpired } from "./db";

describe("interview session security", () => {
  it("hashes the same token deterministically and does not expose the raw token", () => {
    const token = "a".repeat(64);
    const digest = hashInterviewAccessToken(token);
    expect(digest).toHaveLength(64);
    expect(digest).toBe(hashInterviewAccessToken(token));
    expect(digest).not.toBe(token);
    expect(digest).not.toBe(hashInterviewAccessToken(`${token}b`));
  });

  it("treats an access token as expired at and after its expiry time", () => {
    const expiry = new Date("2026-08-27T12:00:00.000Z");
    expect(isInterviewAccessTokenExpired(expiry, new Date("2026-08-27T11:59:59.999Z"))).toBe(false);
    expect(isInterviewAccessTokenExpired(expiry, expiry)).toBe(true);
    expect(isInterviewAccessTokenExpired(expiry, new Date("2026-08-27T12:00:00.001Z"))).toBe(true);
  });
});
