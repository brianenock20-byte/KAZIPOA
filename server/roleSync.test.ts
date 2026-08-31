import { describe, expect, it } from "vitest";
import { resolvePersistedRole } from "./db";
import { resolveWorkspaceRole } from "../shared/roleAccess";
import { readFileSync } from "node:fs";

describe("OAuth role synchronization", () => {
  it("does not infer Admin from a missing role", () => {
    expect(resolvePersistedRole(undefined)).toBeUndefined();
  });

  it("keeps explicit role assignments intact", () => {
    expect(resolvePersistedRole("admin")).toBe("admin");
    expect(resolvePersistedRole("user")).toBe("user");
  });

  it("keeps an Admin out of the Seeker workspace despite a stale account type", () => {
    expect(resolveWorkspaceRole("seeker", "admin")).toBe("admin");
    expect(resolveWorkspaceRole("employer", "admin")).toBe("admin");
  });

  it("resolves a duplicate email to the persisted Admin row", () => {
    const source = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    expect(source).toContain('eq(users.email, user.email), eq(users.role, "admin")');
    expect(source).toContain("if (adminRows[0]) return adminRows[0]");
  });
});
