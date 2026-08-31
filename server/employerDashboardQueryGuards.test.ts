import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Employer dashboard query guards", () => {
  const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  const routers = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

  it("waits for the persisted account type before mounting the dashboard", () => {
    expect(home).toContain("accountRoleQuery.isLoading || accountRoleQuery.data === undefined");
    expect(home).toContain('enabled: isAuthenticated && accountRoleQuery.data === "seeker"');
    expect(home).toContain('const seekerCvsQuery = trpc.seeker.cvs.useQuery(undefined, { enabled: isAuthenticated && accountRoleQuery.data === "seeker"');
  });

  it("keeps dashboard seeker queries role-gated and employer queries employer-gated", () => {
    expect(home).toContain('const seekerApplicationsQuery = trpc.seeker.applications.useQuery(undefined, { enabled: role === "seeker" })');
    expect(home).toContain('const seekerProfilePhotoQuery = trpc.seeker.profilePhoto.useQuery(undefined, { enabled: role === "seeker" })');
    expect(home).toContain('const employerApplicationsQuery = trpc.employer.applications.useQuery({ keyword: employerApplicationKeyword || undefined, status: employerApplicationStatus }, { enabled: role === "employer" })');
    expect(home).toContain('const employerNotificationsQuery = trpc.seeker.employerNotifications.useQuery(undefined, { enabled: role === "employer"');
    expect(routers).toContain('employerNotifications: employerProcedure.query');
  });

  it("returns null rather than undefined for a missing Employer profile", () => {
    expect(routers).toContain('profile: employerProcedure.query(async ({ ctx }) => (await getEmployerProfile(ctx.user.id)) ?? null)');
    expect(routers).toContain('return (await getEmployerProfile(ctx.user.id)) ?? null;');
  });
});
