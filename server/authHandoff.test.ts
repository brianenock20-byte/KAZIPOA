import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AUTH_HANDOFF_DELAY_MS } from "../client/src/components/AuthHandoff";

describe("secure-provider handoff", () => {
  it("uses a short visible transition before redirecting", () => {
    expect(AUTH_HANDOFF_DELAY_MS).toBeGreaterThanOrEqual(250);
    expect(AUTH_HANDOFF_DELAY_MS).toBeLessThanOrEqual(500);
  });

  it("schedules the real secure-provider redirect and cleans up the timer", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/AuthHandoff.tsx"), "utf8");
    expect(source).toContain("window.setTimeout(() => startLogin(), AUTH_HANDOFF_DELAY_MS)");
    expect(source).toContain("window.clearTimeout(timer)");
  });
});
