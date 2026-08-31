import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const componentSource = readFileSync(new URL("../client/src/components/AdminControlCenter.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");

describe("Admin control center safety contracts", () => {
  it("exposes admin-only users, metrics, trends, block, and confirmed delete procedures", () => {
    expect(routerSource).toContain("users: adminProcedure.input");
    expect(routerSource).toContain("userMetrics: adminProcedure.query");
    expect(routerSource).toContain("registrationTrends: adminProcedure.query");
    expect(routerSource).toContain("setUserBlocked: adminProcedure");
    expect(routerSource).toContain('confirmation: z.literal("DELETE_USER")');
  });

  it("does not return password or token fields in the Admin user listing", () => {
    expect(dbSource).toContain("listAdminUsers");
    expect(dbSource).toContain("isBlocked: users.isBlocked");
    expect(dbSource).not.toContain("passwordHash: authCredentials.passwordHash");
    expect(dbSource).not.toContain("tokenHash: authTokens.tokenHash");
  });

  it("protects self and Admin accounts from destructive access actions", () => {
    expect(dbSource).toContain("You cannot block your own Admin account");
    expect(dbSource).toContain("You cannot delete your own Admin account");
    expect(dbSource).toContain("Admin accounts cannot be deleted from this panel");
    expect(dbSource).toContain("block it instead of permanently deleting it");
    expect(dbSource).toContain("if (!user || user.isBlocked) return undefined;");
    expect(readFileSync(new URL("./customAuth.ts", import.meta.url), "utf8")).toContain("row.user.isBlocked");
  });

  it("renders real monthly trend bars and responsive Admin navigation", () => {
    expect(dbSource).toContain("getAdminRegistrationTrends");
    expect(dbSource).toContain("accountType === \"employer\"");
    expect(componentSource).toContain("admin-trend-chart");
    expect(componentSource).toContain("admin-mobile-menu");
    expect(componentSource).toContain("Users & access");
    expect(componentSource).toContain("recentActivities");
    expect(componentSource).toContain("Export CSV");
    expect(componentSource).toContain("Print / save PDF");
    expect(componentSource).toContain("Search name or email");
    expect(routerSource).toContain("recentActivities: adminProcedure.input");
    expect(routerSource).toContain("eventType: z.string().trim().max(80).optional()");
    expect(homeSource).toContain("<AdminControlCenter />");
  });
});
