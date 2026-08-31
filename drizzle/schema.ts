import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accountType: mysqlEnum("accountType", ["seeker", "employer"]).default("seeker").notNull(),
  accountTypeLocked: boolean("accountTypeLocked").default(false).notNull(),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  profilePhotoKey: varchar("profilePhotoKey", { length: 500 }),
  profilePhotoUrl: varchar("profilePhotoUrl", { length: 600 }),
  profilePhotoMimeType: varchar("profilePhotoMimeType", { length: 120 }),
  profilePhotoSize: int("profilePhotoSize"),
});

export const vacancies = mysqlTable("vacancies", {
  id: int("id").autoincrement().primaryKey(),
  employerUserId: int("employerUserId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  company: varchar("company", { length: 180 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  contractType: varchar("contractType", { length: 40 }).default("Full-time").notNull(),
  salary: varchar("salary", { length: 120 }),
  description: text("description").notNull(),
  deadline: timestamp("deadline").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "payment_pending", "paid_pending_review", "approved", "live", "changes_requested", "rejected", "expired", "withdrawn"]).default("draft").notNull(),
  employerVerified: int("employerVerified").default(0).notNull(),
  paymentRequired: boolean("paymentRequired").default(true).notNull(),
  urgent: int("urgent").default(0).notNull(),
  isTest: int("isTest").default(0).notNull(),
  sourceName: varchar("sourceName", { length: 180 }),
  sourceType: varchar("sourceType", { length: 40 }),
  sourceUrl: varchar("sourceUrl", { length: 700 }),
  externalApplicationUrl: varchar("externalApplicationUrl", { length: 900 }),
  employerAuthorized: int("employerAuthorized").default(1).notNull(),
  publicationStatus: varchar("publicationStatus", { length: 40 }).default("standard").notNull(),
  testBatchId: varchar("testBatchId", { length: 100 }),
  importedAt: timestamp("importedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  testBatchIndex: index("vacancies_test_batch_idx").on(table.isTest, table.testBatchId),
}));

export const vacancyViews = mysqlTable("vacancyViews", {
  id: int("id").autoincrement().primaryKey(),
  vacancyId: int("vacancyId").notNull(),
  viewerUserId: int("viewerUserId"),
  viewerKey: varchar("viewerKey", { length: 180 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ uniqueViewer: uniqueIndex("vacancy_views_unique_viewer_idx").on(table.vacancyId, table.viewerKey) }));

export const seekerAccessEvents = mysqlTable("seekerAccessEvents", {
  id: int("id").autoincrement().primaryKey(),
  seekerUserId: int("seekerUserId").notNull(),
  employerUserId: int("employerUserId").notNull(),
  vacancyId: int("vacancyId"),
  documentId: int("documentId"),
  accessType: mysqlEnum("accessType", ["profile", "cv"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ seekerAccessIndex: index("seeker_access_events_seeker_idx").on(table.seekerUserId, table.createdAt), employerAccessIndex: index("seeker_access_events_employer_idx").on(table.employerUserId, table.createdAt) }));

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  vacancyId: int("vacancyId").notNull(),
  employerUserId: int("employerUserId").notNull(),
  method: varchar("method", { length: 64 }).notNull(),
  provider: varchar("provider", { length: 80 }).notNull(),
  amountTzs: int("amountTzs").notNull(),
  providerReference: varchar("providerReference", { length: 160 }),
  callbackEventId: varchar("callbackEventId", { length: 200 }),
  callbackReceivedAt: timestamp("callbackReceivedAt"),
  callbackPayloadHash: varchar("callbackPayloadHash", { length: 64 }),
  state: mysqlEnum("state", ["initiated", "pending", "successful", "failed", "cancelled", "refunded"]).default("initiated").notNull(),
  evidenceNote: text("evidenceNote"),
  adminNote: text("adminNote"),
  receiptKey: varchar("receiptKey", { length: 255 }),
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  receiptName: varchar("receiptName", { length: 180 }),
  receiptMimeType: varchar("receiptMimeType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  callbackEventUnique: uniqueIndex("payments_callback_event_unique").on(table.callbackEventId),
}));

export const employerProfiles = mysqlTable("employerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  companyName: varchar("companyName", { length: 180 }).notNull(),
  registrationNumber: varchar("registrationNumber", { length: 120 }),
  industry: varchar("industry", { length: 120 }),
  location: varchar("location", { length: 120 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  profileImageKey: varchar("profileImageKey", { length: 500 }),
  profileImageUrl: varchar("profileImageUrl", { length: 600 }),
  profileImageMimeType: varchar("profileImageMimeType", { length: 120 }),
  profileImageSize: int("profileImageSize"),
  verified: int("verified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const employerSubscriptions = mysqlTable("employerSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  employerUserId: int("employerUserId").notNull(),
  plan: mysqlEnum("plan", ["starter", "business", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["pending", "active", "paused", "expired", "cancelled", "rejected"]).default("pending").notNull(),
  maxVacancies: int("maxVacancies").notNull(),
  maxCandidates: int("maxCandidates").notNull(),
  paymentReference: varchar("paymentReference", { length: 160 }),
  paymentAmountTzs: int("paymentAmountTzs"),
  rejectionReason: text("rejectionReason"),
  startedAt: timestamp("startedAt"),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  vacancyId: int("vacancyId").notNull(),
  employerUserId: int("employerUserId").notNull(),
  seekerUserId: int("seekerUserId").notNull(),
  seekerEmail: varchar("seekerEmail", { length: 320 }),
  coverNote: text("coverNote"),
  cvDocumentId: int("cvDocumentId"),
  status: mysqlEnum("status", ["applied", "reviewing", "shortlisted", "interview", "offered", "hired", "rejected"]).default("applied").notNull(),
  interviewAt: timestamp("interviewAt"),
  interviewNote: text("interviewNote"),
  interviewResponse: mysqlEnum("interviewResponse", ["pending", "accepted", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const applicationStatusHistory = mysqlTable("applicationStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  seekerUserId: int("seekerUserId").notNull(),
  employerUserId: int("employerUserId").notNull(),
  previousStatus: varchar("previousStatus", { length: 64 }).notNull(),
  nextStatus: varchar("nextStatus", { length: 64 }).notNull(),
  note: text("note"),
  interviewAt: timestamp("interviewAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const interviewSessions = mysqlTable("interviewSessions", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  vacancyId: int("vacancyId").notNull(),
  employerUserId: int("employerUserId").notNull(),
  seekerUserId: int("seekerUserId").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  note: text("note"),
  provider: varchar("provider", { length: 64 }).default("pending").notNull(),
  roomName: varchar("roomName", { length: 180 }),
  joinUrl: varchar("joinUrl", { length: 500 }),
  accessTokenHash: varchar("accessTokenHash", { length: 128 }).notNull(),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt").notNull(),
  status: mysqlEnum("status", ["scheduled", "accepted", "declined", "cancelled", "completed", "expired"]).default("scheduled").notNull(),
  emailStatus: mysqlEnum("emailStatus", ["not_attempted", "sent", "skipped", "failed"]).default("not_attempted").notNull(),
  smsStatus: mysqlEnum("smsStatus", ["not_attempted", "sent", "skipped", "failed"]).default("not_attempted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ applicationIndex: index("interview_sessions_application_idx").on(table.applicationId, table.createdAt), employerIndex: index("interview_sessions_employer_idx").on(table.employerUserId, table.scheduledAt), seekerIndex: index("interview_sessions_seeker_idx").on(table.seekerUserId, table.scheduledAt) }));

export const seekerNotificationPreferences = mysqlTable("seekerNotificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  seekerUserId: int("seekerUserId").notNull().unique(),
  emailReviewing: int("emailReviewing").default(1).notNull(),
  emailShortlisted: int("emailShortlisted").default(1).notNull(),
  emailInterview: int("emailInterview").default(1).notNull(),
  emailOffered: int("emailOffered").default(1).notNull(),
  emailHired: int("emailHired").default(1).notNull(),
  emailRejected: int("emailRejected").default(1).notNull(),
  inAppReviewing: int("inAppReviewing").default(1).notNull(),
  inAppShortlisted: int("inAppShortlisted").default(1).notNull(),
  inAppInterview: int("inAppInterview").default(1).notNull(),
  inAppOffered: int("inAppOffered").default(1).notNull(),
  inAppHired: int("inAppHired").default(1).notNull(),
  inAppRejected: int("inAppRejected").default(1).notNull(),
  vacancyAlertsEnabled: int("vacancyAlertsEnabled").default(1).notNull(),
  emailVacancyAlerts: int("emailVacancyAlerts").default(1).notNull(),
  inAppVacancyAlerts: int("inAppVacancyAlerts").default(1).notNull(),
  vacancyAlertKeywordsEnabled: int("vacancyAlertKeywordsEnabled").default(1).notNull(),
  vacancyAlertRegionsEnabled: int("vacancyAlertRegionsEnabled").default(1).notNull(),
  vacancyAlertCategoriesEnabled: int("vacancyAlertCategoriesEnabled").default(1).notNull(),
  vacancyAlertKeywords: text("vacancyAlertKeywords"),
  vacancyAlertRegions: text("vacancyAlertRegions"),
  vacancyAlertCategories: text("vacancyAlertCategories"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const seekerDocuments = mysqlTable("seekerDocuments", {
  id: int("id").autoincrement().primaryKey(),
  seekerUserId: int("seekerUserId").notNull(),
  documentType: mysqlEnum("documentType", ["cv"]).default("cv").notNull(),
  fileName: varchar("fileName", { length: 180 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  fileSize: int("fileSize").notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  storageUrl: varchar("storageUrl", { length: 600 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const seekerEducation = mysqlTable("seekerEducation", {
  id: int("id").autoincrement().primaryKey(),
  seekerUserId: int("seekerUserId").notNull(),
  institution: varchar("institution", { length: 180 }).notNull(),
  qualification: varchar("qualification", { length: 180 }).notNull(),
  fieldOfStudy: varchar("fieldOfStudy", { length: 180 }),
  startYear: int("startYear"),
  endYear: int("endYear"),
  currentlyStudying: boolean("currentlyStudying").default(false).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const seekerExperience = mysqlTable("seekerExperience", {
  id: int("id").autoincrement().primaryKey(),
  seekerUserId: int("seekerUserId").notNull(),
  employer: varchar("employer", { length: 180 }).notNull(),
  jobTitle: varchar("jobTitle", { length: 180 }).notNull(),
  location: varchar("location", { length: 120 }),
  startDate: varchar("startDate", { length: 30 }).notNull(),
  endDate: varchar("endDate", { length: 30 }),
  currentRole: boolean("currentRole").default(false).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const seekerSkills = mysqlTable("seekerSkills", {
  id: int("id").autoincrement().primaryKey(),
  seekerUserId: int("seekerUserId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  level: varchar("level", { length: 40 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const seekerCertifications = mysqlTable("seekerCertifications", {
  id: int("id").autoincrement().primaryKey(),
  seekerUserId: int("seekerUserId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  issuer: varchar("issuer", { length: 180 }),
  issueDate: varchar("issueDate", { length: 30 }),
  expiryDate: varchar("expiryDate", { length: 30 }),
  credentialId: varchar("credentialId", { length: 120 }),
  credentialUrl: varchar("credentialUrl", { length: 500 }),
  attachmentName: varchar("attachmentName", { length: 180 }),
  attachmentMimeType: varchar("attachmentMimeType", { length: 120 }),
  attachmentSize: int("attachmentSize"),
  attachmentStorageKey: varchar("attachmentStorageKey", { length: 500 }),
  attachmentStorageUrl: varchar("attachmentStorageUrl", { length: 600 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const savedVacancies = mysqlTable("savedVacancies", {
  id: int("id").autoincrement().primaryKey(),
  seekerUserId: int("seekerUserId").notNull(),
  vacancyId: int("vacancyId").notNull(),
  folder: varchar("folder", { length: 80 }).default("Unsorted").notNull(),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ seekerVacancyUnique: uniqueIndex("savedVacancies_seeker_vacancy_unique").on(table.seekerUserId, table.vacancyId) }));

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  applicationId: int("applicationId"),
  vacancyId: int("vacancyId"),
  emailStatus: mysqlEnum("emailStatus", ["not_attempted", "sent", "skipped", "failed"]).default("not_attempted").notNull(),
  emailSentAt: timestamp("emailSentAt"),
  emailError: text("emailError"),
  smsStatus: mysqlEnum("smsStatus", ["not_attempted", "sent", "skipped", "failed"]).default("not_attempted").notNull(),
  smsSentAt: timestamp("smsSentAt"),
  smsError: text("smsError"),
  readAt: timestamp("readAt"),
  archivedAt: timestamp("archivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketReference: varchar("ticketReference", { length: 40 }).notNull().unique(),
  requesterUserId: int("requesterUserId"),
  requesterName: varchar("requesterName", { length: 180 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 320 }).notNull(),
  message: text("message").notNull(),
  attachmentKey: varchar("attachmentKey", { length: 500 }),
  attachmentUrl: varchar("attachmentUrl", { length: 600 }),
  attachmentName: varchar("attachmentName", { length: 180 }),
  attachmentMimeType: varchar("attachmentMimeType", { length: 120 }),
  attachmentSize: int("attachmentSize"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  adminNote: text("adminNote"),
  userReply: text("userReply"),
  userReplyAt: timestamp("userReplyAt"),
  userReplyAttachmentKey: varchar("userReplyAttachmentKey", { length: 500 }),
  userReplyAttachmentUrl: varchar("userReplyAttachmentUrl", { length: 600 }),
  userReplyAttachmentName: varchar("userReplyAttachmentName", { length: 180 }),
  userReplyAttachmentMimeType: varchar("userReplyAttachmentMimeType", { length: 120 }),
  userReplyAttachmentSize: int("userReplyAttachmentSize"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const platformSettings = mysqlTable("platformSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedByAdminUserId: int("updatedByAdminUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const moderationLogs = mysqlTable("moderationLogs", {
  id: int("id").autoincrement().primaryKey(),
  vacancyId: int("vacancyId").notNull(),
  adminUserId: int("adminUserId").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  reason: text("reason"),
  previousStatus: varchar("previousStatus", { length: 64 }).notNull(),
  nextStatus: varchar("nextStatus", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Phase 2 custom-auth pilot tables. These are deliberately additive and are
 * linked to the existing users table by userId so OAuth identities, roles,
 * portfolios, vacancies, applications, payments, and notifications remain
 * attached to the same account records.
 */
export const authCredentials = mysqlTable("authCredentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  emailNormalized: varchar("emailNormalized", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 600 }).notNull(),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const authTokens = mysqlTable("authTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  purpose: mysqlEnum("purpose", ["email_verification", "password_reset"]).notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userPurposeIndex: index("auth_tokens_user_purpose_idx").on(table.userId, table.purpose),
}));

export const authSessions = mysqlTable("authSessions", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  userId: int("userId").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userExpiryIndex: index("auth_sessions_user_expiry_idx").on(table.userId, table.expiresAt),
}));

export const authRateLimits = mysqlTable("authRateLimits", {
  id: int("id").autoincrement().primaryKey(),
  subjectKey: varchar("subjectKey", { length: 320 }).notNull().unique(),
  attemptCount: int("attemptCount").default(0).notNull(),
  windowStartedAt: timestamp("windowStartedAt").defaultNow().notNull(),
  blockedUntil: timestamp("blockedUntil"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const authEvents = mysqlTable("authEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  success: boolean("success").notNull(),
  requestId: varchar("requestId", { length: 120 }),
  ipHash: varchar("ipHash", { length: 128 }),
  userAgentHash: varchar("userAgentHash", { length: 128 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userEventIndex: index("auth_events_user_created_idx").on(table.userId, table.createdAt),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Vacancy = typeof vacancies.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type ModerationLog = typeof moderationLogs.$inferSelect;
export type AuthCredential = typeof authCredentials.$inferSelect;
export type AuthToken = typeof authTokens.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
export type AuthRateLimit = typeof authRateLimits.$inferSelect;
export type AuthEvent = typeof authEvents.$inferSelect;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type EmployerProfile = typeof employerProfiles.$inferSelect;
export type EmployerSubscription = typeof employerSubscriptions.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type ApplicationStatusHistory = typeof applicationStatusHistory.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type SeekerDocument = typeof seekerDocuments.$inferSelect;
export type SeekerEducation = typeof seekerEducation.$inferSelect;
export type SeekerExperience = typeof seekerExperience.$inferSelect;
export type SeekerSkill = typeof seekerSkills.$inferSelect;
export type SeekerCertification = typeof seekerCertifications.$inferSelect;
