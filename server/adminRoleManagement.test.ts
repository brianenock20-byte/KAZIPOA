import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const uiSource = readFileSync(new URL("../client/src/components/AdminControlCenter.tsx", import.meta.url), "utf8");
const rolePageSource = readFileSync(new URL("../client/src/pages/RoleManagement.tsx", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");

describe("Admin role management and registration notifications", () => {
  it("uses an Admin-only role mutation with explicit confirmation", () => {
    expect(routerSource).toContain("setUserRole: adminProcedure");
    expect(routerSource).toContain('confirmation: z.literal("CHANGE_ROLE")');
    expect(dbSource).toContain("You cannot change your own Admin role");
    expect(dbSource).toContain("At least one active Admin account must remain");
    expect(dbSource).toContain("admin_role_granted");
    expect(dbSource).toContain("admin_role_revoked");
  });

  it("creates notifications only for active Admin accounts after registration", () => {
    expect(routerSource).toContain("notifyAdminsOfNewRegistration");
    expect(dbSource).toContain('eq(users.role, "admin")');
    expect(dbSource).toContain('eq(users.isBlocked, false)');
    expect(dbSource).toContain('type: "admin_new_registration"');
  });

  it("registers the dedicated Role Management page and readable role audit history", () => {
    expect(appSource).toContain('path="/admin/roles"');
    expect(uiSource).toContain('label: "Role management"');
    expect(uiSource).toContain('setLocation("/admin/roles")');
    expect(rolePageSource).toContain("Role Management");
    expect(rolePageSource).toContain("role audit history");
    expect(rolePageSource).toContain("admin_role_granted");
    expect(rolePageSource).toContain("admin_role_revoked");
    expect(rolePageSource).toContain('confirmation: "CHANGE_ROLE"');
  });

  it("renders Admin notification and role-management controls", () => {
    expect(uiSource).toContain("trpc.admin.notifications.useQuery");
    expect(uiSource).toContain("trpc.admin.markNotificationRead.useMutation");
    expect(uiSource).toContain("trpc.admin.setUserRole.useMutation");
    expect(uiSource).toContain('confirmation: "CHANGE_ROLE"');
    expect(uiSource).toContain("Mark read");
    expect(uiSource).toContain("Make Admin");
    expect(uiSource).toContain("activityPage");
    expect(uiSource).toContain("Mark all as read");
    expect(uiSource).toContain("Export CSV");
    expect(uiSource).toContain("Print / save PDF");
    expect(routerSource).toContain("markAllNotificationsRead: adminProcedure");
    expect(routerSource).toContain("pageSize: z.number().int().min(5).max(50)");
    expect(dbSource).toContain("listAdminRecentActivitiesPage");
    expect(dbSource).toContain("markAllAdminNotificationsRead");
    expect(dbSource).toContain("startDate?: string");
    expect(dbSource).toContain("gte(authEvents.createdAt");
    expect(dbSource).toContain("like(notifications.title");
    expect(uiSource).toContain("activityStartDate");
    expect(uiSource).toContain("notificationSearch");
    expect(uiSource).toContain("Loading activity page");
    expect(uiSource).toContain("activitySort");
    expect(uiSource).toContain("Sort: action type");
    expect(uiSource).toContain("notification-dot");
    expect(dbSource).toContain("sortBy?: \"createdAt\" | \"eventType\" | \"userName\"");
    expect(dbSource).toContain("asc(authEvents.eventType)");
    expect(dbSource).toContain("archivedAt");
    expect(dbSource).toContain("archiveAdminNotification");
    expect(dbSource).toContain("getAdminActivityLastSevenDays");
    expect(routerSource).toContain("archiveNotification: adminProcedure");
    expect(routerSource).toContain("deleteNotification: adminProcedure");
    expect(uiSource).toContain("Archive");
    expect(uiSource).toContain("Delete this Admin notification permanently?");
    expect(uiSource).toContain("activitySevenDaysQuery");
    expect(uiSource).toContain("admin-activity-avatar");
    expect(dbSource).toContain("notificationAutoArchiveType");
    expect(dbSource).toContain("notificationAutoArchiveDays");
    expect(routerSource).toContain("notificationAutoArchiveType");
    expect(routerSource).toContain("notificationAutoArchiveDays");
    expect(uiSource).toContain("Download PNG");
    expect(uiSource).toContain("Print / PDF");
    expect(uiSource).toContain("persisted Kazipoa auth events");
    expect(uiSource).toContain("User ID");
    expect(dbSource).toContain("restoreAdminNotification");
    expect(dbSource).toContain("getAdminActivitySummary");
    expect(routerSource).toContain("restoreNotification: adminProcedure");
    expect(routerSource).toContain("range: z.enum([\"week\", \"month\", \"year\"])");
    expect(uiSource).toContain("View archived");
    expect(uiSource).toContain("Restore");
    expect(uiSource).toContain("Last 12 months");
    expect(uiSource).toContain("mailto:");
    expect(dbSource).toContain("archived?: boolean");
    expect(dbSource).toContain("notificationAutoArchiveType");
    expect(dbSource).toContain("notificationAutoArchiveDays");
    expect(routerSource).toContain("restoreNotification: adminProcedure");
    expect(routerSource).toContain("range: z.enum([\"week\", \"month\", \"year\"])");
    expect(uiSource).toContain("View archived");
    expect(uiSource).toContain("Restore");
    expect(uiSource).toContain("Last 12 months");
    expect(uiSource).toContain("admin-quick-contact");
    expect(uiSource).toContain("admin-chart-refresh-status");
    expect(uiSource).toContain("Updating activity chart");
    expect(uiSource).toContain("aria-busy={activitySevenDaysQuery.isFetching}");
    expect(routerSource).toContain("activityComparison: adminProcedure");
    expect(routerSource).toContain("activityEventsForExport: adminProcedure");
    expect(dbSource).toContain("getAdminActivityComparison");
    expect(dbSource).toContain("listAdminActivityEventsForExport");
    expect(uiSource).toContain("activityComparisonQuery");
    expect(uiSource).toContain("Current {activityComparisonQuery.data.currentTotal}");
    expect(uiSource).toContain("Export Excel");
    expect(uiSource).toContain("archivedNotificationSearch");
    expect(uiSource).toContain("activityExportQuery");
  });

  it("provides clear safe states for unauthenticated and non-Admin access", () => {
    expect(rolePageSource).toContain("Sign in required");
    expect(rolePageSource).toContain("Admin permission required");
    expect(rolePageSource).toContain("Return to my workspace");
    expect(rolePageSource).toContain("Server protected");
  });
});
