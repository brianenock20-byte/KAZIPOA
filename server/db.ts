import { and, asc, count, countDistinct, desc, eq, gt, gte, inArray, isNotNull, isNull, like, lt, lte, ne, or } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, vacancies, vacancyViews, payments, moderationLogs, platformSettings, employerProfiles, employerSubscriptions, applications, applicationStatusHistory, interviewSessions, seekerNotificationPreferences, notifications, supportTickets, seekerDocuments, seekerAccessEvents, seekerEducation, seekerExperience, seekerSkills, seekerCertifications, savedVacancies, authCredentials, authTokens, authSessions, authRateLimits, authEvents } from "../drizzle/schema";
import { TEST_VACANCY_BATCH_ID } from "../shared/testVacancy";
import { vacancyCategorySearchTerms } from "../shared/vacancyImages";
import { salaryRangeMatches, type SalaryRangeFilter } from "../shared/salaryFilters";
import { ENV } from './_core/env';
import { buildApplicationStatusEmail, buildEmployerPaymentStatusEmail, buildEmployerVacancyDecisionEmail, buildInterviewInvitationEmail, sendPostmarkEmail } from './postmarkEmail';
import { sendSms } from './smsProvider';
import { callbackPayloadHash, type MpesaCallback } from './mpesaContract';
import { getInterviewSmsDeliveryResult } from './interviewNotification';
import { storageGetSignedUrl } from './storage';
import { getKazipoaPricingConfig } from './pricingConfig';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export function resolvePersistedRole(role: InsertUser["role"] | undefined) {
  return role;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    // Role changes are explicit. OAuth synchronization must not infer Admin
    // privileges from a legacy OWNER_OPEN_ID after an approved ownership transfer.
    // The transferred Admin is persisted in the users table and custom-auth
    // sessions resolve that row directly; future OAuth callbacks may update
    // identity metadata but cannot silently change role authorization.
    const explicitRole = resolvePersistedRole(user.role);
    if (explicitRole !== undefined) {
      values.role = explicitRole;
      updateSet.role = explicitRole;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  const user = result[0];
  if (!user || user.isBlocked) return undefined;
  // An authenticated email may have an older duplicate regular-user row. The
  // persisted Admin assignment is authoritative for workspace access, so use
  // the Admin row without deleting or mutating the duplicate record.
  if (user.email) {
    const adminRows = await db.select().from(users).where(and(eq(users.email, user.email), eq(users.role, "admin"), eq(users.isBlocked, false))).limit(1);
    if (adminRows[0]) return adminRows[0];
  }
  return user;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export function normalizeTanzaniaPhone(value: string | null | undefined) { const compact = (value ?? "").replace(/[^\d+]/g, ""); if (!compact) return null; if (compact.startsWith("0")) return `255${compact.slice(1)}`; if (compact.startsWith("+")) return compact.slice(1); return compact; }

export function isValidTanzaniaPhone(value: string | null | undefined) { const normalized = normalizeTanzaniaPhone(value); return normalized ? /^255[6789]\d{8}$/.test(normalized) : false; }

export async function updateUserPhone(userId: number, phone: string | null | undefined) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const normalized = normalizeTanzaniaPhone(phone); if (normalized && !isValidTanzaniaPhone(normalized)) throw new Error("Enter a valid Tanzania mobile number, for example +255 712 345 678"); await db.update(users).set({ phone: normalized }).where(eq(users.id, userId)); return getUserById(userId); }

export async function updateUserProfilePhoto(userId: number, input: { profilePhotoKey: string; profilePhotoUrl: string; profilePhotoMimeType: string; profilePhotoSize: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(users).set(input).where(eq(users.id, userId)); return getUserById(userId); }

export async function getAccountType(userId: number) { const db = await getDb(); if (!db) return "seeker" as const; const rows = await db.select({ role: users.role, accountType: users.accountType }).from(users).where(eq(users.id, userId)).limit(1); if (rows[0]?.role === "admin") return "admin" as const; return rows[0]?.accountType ?? "seeker"; }

export async function setAccountType(userId: number, accountType: "seeker" | "employer") { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const existing = await db.select({ role: users.role, accountType: users.accountType, accountTypeLocked: users.accountTypeLocked }).from(users).where(eq(users.id, userId)).limit(1); if (!existing[0]) throw new Error("Account not found"); if (existing[0].role === "admin") return "admin" as const; if (existing[0].accountTypeLocked && existing[0].accountType !== accountType) throw new Error("This account workspace is already locked. Create a separate account for the other role."); await db.update(users).set({ accountType, accountTypeLocked: true }).where(eq(users.id, userId)); return getAccountType(userId); }

export async function saveSeekerCv(input: { seekerUserId: number; fileName: string; mimeType: string; fileSize: number; storageKey: string; storageUrl: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(seekerDocuments).values({ ...input, documentType: "cv" }); return Number(result[0].insertId); }

export async function getSeekerPortfolio(seekerUserId: number) { const db = await getDb(); if (!db) return { education: [], experience: [], skills: [], certifications: [] }; const [education, experience, skills, certifications] = await Promise.all([db.select().from(seekerEducation).where(eq(seekerEducation.seekerUserId, seekerUserId)).orderBy(desc(seekerEducation.createdAt)), db.select().from(seekerExperience).where(eq(seekerExperience.seekerUserId, seekerUserId)).orderBy(desc(seekerExperience.createdAt)), db.select().from(seekerSkills).where(eq(seekerSkills.seekerUserId, seekerUserId)).orderBy(asc(seekerSkills.name)), db.select().from(seekerCertifications).where(eq(seekerCertifications.seekerUserId, seekerUserId)).orderBy(desc(seekerCertifications.createdAt))]); const securedCertifications = await Promise.all(certifications.map(async certification => ({ ...certification, attachmentUrl: certification.attachmentStorageKey ? await storageGetSignedUrl(certification.attachmentStorageKey) : undefined }))); return { education, experience, skills, certifications: securedCertifications }; }

export async function createSeekerEducation(seekerUserId: number, input: { institution: string; qualification: string; fieldOfStudy?: string; startYear?: number; endYear?: number; currentlyStudying: boolean; description?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(seekerEducation).values({ seekerUserId, ...input }); return Number(result[0].insertId); }
export async function deleteSeekerEducation(seekerUserId: number, id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(seekerEducation).where(and(eq(seekerEducation.id, id), eq(seekerEducation.seekerUserId, seekerUserId))); }
export async function createSeekerExperience(seekerUserId: number, input: { employer: string; jobTitle: string; location?: string; startDate: string; endDate?: string; currentRole: boolean; description?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(seekerExperience).values({ seekerUserId, ...input }); return Number(result[0].insertId); }
export async function deleteSeekerExperience(seekerUserId: number, id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(seekerExperience).where(and(eq(seekerExperience.id, id), eq(seekerExperience.seekerUserId, seekerUserId))); }
export async function createSeekerSkill(seekerUserId: number, input: { name: string; level?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(seekerSkills).values({ seekerUserId, name: input.name, level: input.level }); return Number(result[0].insertId); }
export async function deleteSeekerSkill(seekerUserId: number, id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(seekerSkills).where(and(eq(seekerSkills.id, id), eq(seekerSkills.seekerUserId, seekerUserId))); }
export async function createSeekerCertification(seekerUserId: number, input: { name: string; issuer?: string; issueDate?: string; expiryDate?: string; credentialId?: string; credentialUrl?: string; attachmentName?: string; attachmentMimeType?: string; attachmentSize?: number; attachmentStorageKey?: string; attachmentStorageUrl?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(seekerCertifications).values({ seekerUserId, ...input }); return Number(result[0].insertId); }
export async function updateSeekerCertification(seekerUserId: number, id: number, input: { name: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(seekerCertifications).set({ name: input.name }).where(and(eq(seekerCertifications.id, id), eq(seekerCertifications.seekerUserId, seekerUserId))); return getSeekerPortfolio(seekerUserId); }
export async function deleteSeekerCertification(seekerUserId: number, id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(seekerCertifications).where(and(eq(seekerCertifications.id, id), eq(seekerCertifications.seekerUserId, seekerUserId))); }

export async function getLatestSeekerCv(seekerUserId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(seekerDocuments).where(and(eq(seekerDocuments.seekerUserId, seekerUserId), eq(seekerDocuments.documentType, "cv"))).orderBy(desc(seekerDocuments.createdAt)).limit(1); return rows[0]; }
export async function getSeekerCvById(seekerUserId: number, documentId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(seekerDocuments).where(and(eq(seekerDocuments.id, documentId), eq(seekerDocuments.seekerUserId, seekerUserId), eq(seekerDocuments.documentType, "cv"))).limit(1); return rows[0]; }

export async function listSeekerCvs(seekerUserId: number) { const db = await getDb(); if (!db) return []; return db.select().from(seekerDocuments).where(and(eq(seekerDocuments.seekerUserId, seekerUserId), eq(seekerDocuments.documentType, "cv"))).orderBy(desc(seekerDocuments.createdAt)); }

export async function listPendingVacancies() { const db = await getDb(); if (!db) return []; return db.select().from(vacancies).where(or(eq(vacancies.status, "submitted"), eq(vacancies.status, "paid_pending_review"))); }

export async function expireTestVacancies(now = new Date()) { const db = await getDb(); if (!db) return { expired: 0 }; const result = await db.update(vacancies).set({ status: "expired", publicationStatus: "expired" }).where(and(eq(vacancies.isTest, 1), eq(vacancies.testBatchId, TEST_VACANCY_BATCH_ID), eq(vacancies.status, "live"), lte(vacancies.deadline, now))); return { expired: Number(result[0]?.affectedRows ?? 0) }; }

export async function listTestVacancies(batchId = TEST_VACANCY_BATCH_ID) { const db = await getDb(); if (!db) return []; return db.select().from(vacancies).where(and(eq(vacancies.isTest, 1), eq(vacancies.testBatchId, batchId))).orderBy(desc(vacancies.createdAt)); }

export async function deleteTestVacancyBatch(batchId: string, adminUserId: number) { if (batchId !== TEST_VACANCY_BATCH_ID) throw new Error("Only the pre-launch test batch can be deleted by this action"); const db = await getDb(); if (!db) throw new Error("Database unavailable"); const testRows = await db.select({ id: vacancies.id }).from(vacancies).where(and(eq(vacancies.isTest, 1), eq(vacancies.testBatchId, TEST_VACANCY_BATCH_ID))); const vacancyIds = testRows.map(row => row.id); let deletedApplications = 0; if (vacancyIds.length) { const applicationRows = await db.select({ id: applications.id }).from(applications).where(inArray(applications.vacancyId, vacancyIds)); const applicationIds = applicationRows.map(row => row.id); deletedApplications = applicationIds.length; if (applicationIds.length) { await db.delete(applicationStatusHistory).where(inArray(applicationStatusHistory.applicationId, applicationIds)); await db.delete(applications).where(inArray(applications.id, applicationIds)); } await db.delete(savedVacancies).where(inArray(savedVacancies.vacancyId, vacancyIds)); await db.delete(notifications).where(inArray(notifications.vacancyId, vacancyIds)); await db.delete(vacancies).where(inArray(vacancies.id, vacancyIds)); } return { deletedVacancies: vacancyIds.length, deletedApplications, adminUserId, batchId }; }

export async function listLiveVacancies(input: { limit?: number; keyword?: string; location?: string; category?: string; contractType?: string; salaryRange?: SalaryRangeFilter; sort?: "relevance" | "newest" | "deadline" } = {}) { const db = await getDb(); if (!db) return []; await expireTestVacancies(); const criteria = [eq(vacancies.status, "live"), gt(vacancies.deadline, new Date())]; const keyword = input.keyword?.trim(); if (keyword) { const pattern = `%${keyword}%`; criteria.push(or(like(vacancies.title, pattern), like(vacancies.company, pattern), like(vacancies.description, pattern))!); } if (input.location && input.location !== "All regions" && input.location !== "All Tanzania") criteria.push(eq(vacancies.location, input.location)); if (input.category && input.category !== "All categories") { const categoryTerms = vacancyCategorySearchTerms(input.category); if (categoryTerms.length) criteria.push(or(...categoryTerms.map(term => like(vacancies.category, `%${term}%`)))!); } if (input.contractType && input.contractType !== "All contract types") criteria.push(eq(vacancies.contractType, input.contractType)); const order = input.sort === "deadline" ? asc(vacancies.deadline) : desc(vacancies.createdAt); const rows = await db.select().from(vacancies).where(and(...criteria)).orderBy(order); return rows.filter(row => !input.salaryRange || salaryRangeMatches(row.salary, input.salaryRange)).slice(0, Math.min(50, Math.max(1, input.limit ?? 24))); }

export async function recordVacancyView(vacancyId: number, viewerUserId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const live = await db.select({ id: vacancies.id }).from(vacancies).where(and(eq(vacancies.id, vacancyId), eq(vacancies.status, "live"), gt(vacancies.deadline, new Date()))).limit(1); if (!live[0]) throw new Error("Vacancy is not available"); const viewerKey = `user:${viewerUserId}`; await db.insert(vacancyViews).values({ vacancyId, viewerUserId, viewerKey }).onDuplicateKeyUpdate({ set: { viewerUserId } }); return { vacancyId, recorded: true }; }

export async function getEmployerVacancyMetrics(employerUserId: number) { const db = await getDb(); if (!db) return []; const rows = await db.select({ vacancyId: vacancies.id, title: vacancies.title, status: vacancies.status, deadline: vacancies.deadline, createdAt: vacancies.createdAt, views: countDistinct(vacancyViews.id), applications: countDistinct(applications.id) }).from(vacancies).leftJoin(vacancyViews, eq(vacancyViews.vacancyId, vacancies.id)).leftJoin(applications, eq(applications.vacancyId, vacancies.id)).where(eq(vacancies.employerUserId, employerUserId)).groupBy(vacancies.id, vacancies.title, vacancies.status, vacancies.deadline, vacancies.createdAt).orderBy(desc(vacancies.createdAt)); return rows.map(row => ({ ...row, views: Number(row.views), applications: Number(row.applications) })); }

export async function listIndexableLiveVacancies(limit = 200) { const db = await getDb(); if (!db) return []; await expireTestVacancies(); return db.select().from(vacancies).where(and(eq(vacancies.status, "live"), gt(vacancies.deadline, new Date()), eq(vacancies.isTest, 0))).orderBy(desc(vacancies.createdAt)).limit(limit); }

export async function setVacancyUrgency(vacancyId: number, urgent: boolean) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const current = await db.select().from(vacancies).where(eq(vacancies.id, vacancyId)).limit(1); if (!current[0]) throw new Error("Vacancy not found"); await db.update(vacancies).set({ urgent: urgent ? 1 : 0 }).where(eq(vacancies.id, vacancyId)); return { ...current[0], urgent: urgent ? 1 : 0 }; }

export async function getPublicLiveVacancy(vacancyId: number) { const db = await getDb(); if (!db) return undefined; await expireTestVacancies(); const rows = await db.select().from(vacancies).where(and(eq(vacancies.id, vacancyId), eq(vacancies.status, "live"), gt(vacancies.deadline, new Date()))).limit(1); return rows[0]; }

export async function listSearchSuggestions(query: string, limit = 8) { const db = await getDb(); if (!db) return []; const normalized = query.trim().toLowerCase(); if (normalized.length < 2) return []; const rows = await db.select({ title: vacancies.title, company: vacancies.company }).from(vacancies).where(and(eq(vacancies.status, "live"), gt(vacancies.deadline, new Date()))).orderBy(desc(vacancies.createdAt)).limit(100); const seen = new Set<string>(); const suggestions: Array<{ value: string; kind: "title" | "company" }> = []; for (const row of rows) { for (const [value, kind] of [[row.title, "title"], [row.company, "company"]] as const) { const key = `${kind}:${value.toLowerCase()}`; if (value.toLowerCase().includes(normalized) && !seen.has(key)) { seen.add(key); suggestions.push({ value, kind }); if (suggestions.length >= limit) return suggestions; } } } return suggestions; }

const savedVacancySelection = { id: vacancies.id, employerUserId: vacancies.employerUserId, title: vacancies.title, company: vacancies.company, category: vacancies.category, location: vacancies.location, salary: vacancies.salary, description: vacancies.description, deadline: vacancies.deadline, status: vacancies.status, employerVerified: vacancies.employerVerified, urgent: vacancies.urgent, createdAt: vacancies.createdAt, updatedAt: vacancies.updatedAt, savedAt: savedVacancies.createdAt, folder: savedVacancies.folder, tags: savedVacancies.tags };

function savedVacancyWhere(seekerUserId: number) { return and(eq(savedVacancies.seekerUserId, seekerUserId), eq(vacancies.status, "live"), gt(vacancies.deadline, new Date())); }

export async function listSavedVacancies(seekerUserId: number) { const db = await getDb(); if (!db) return []; return db.select(savedVacancySelection).from(savedVacancies).innerJoin(vacancies, eq(savedVacancies.vacancyId, vacancies.id)).where(savedVacancyWhere(seekerUserId)).orderBy(desc(savedVacancies.createdAt)); }

export async function listSavedVacanciesPage(seekerUserId: number, page = 1, pageSize = 12, filters: { keyword?: string; region?: string; sort?: "recent" | "deadline" | "title" } = {}) { const db = await getDb(); if (!db) return { items: [], page, pageSize, total: 0, hasMore: false, regions: [] as string[] }; const safePage = Math.max(1, page); const safePageSize = Math.min(50, Math.max(1, pageSize)); const criteria = [savedVacancyWhere(seekerUserId)]; const keyword = filters.keyword?.trim(); if (keyword) { const pattern = `%${keyword}%`; criteria.push(or(like(vacancies.title, pattern), like(vacancies.company, pattern), like(vacancies.category, pattern), like(vacancies.location, pattern))!); } if (filters.region && filters.region !== "All regions") criteria.push(eq(vacancies.location, filters.region)); const where = and(...criteria); const sort = filters.sort === "deadline" ? asc(vacancies.deadline) : filters.sort === "title" ? asc(vacancies.title) : desc(savedVacancies.createdAt); const [items, totals, regionRows] = await Promise.all([db.select(savedVacancySelection).from(savedVacancies).innerJoin(vacancies, eq(savedVacancies.vacancyId, vacancies.id)).where(where).orderBy(sort).limit(safePageSize).offset((safePage - 1) * safePageSize), db.select({ total: count() }).from(savedVacancies).innerJoin(vacancies, eq(savedVacancies.vacancyId, vacancies.id)).where(where), db.select({ location: vacancies.location }).from(savedVacancies).innerJoin(vacancies, eq(savedVacancies.vacancyId, vacancies.id)).where(savedVacancyWhere(seekerUserId)).groupBy(vacancies.location)]); const total = Number(totals[0]?.total ?? 0); return { items, page: safePage, pageSize: safePageSize, total, hasMore: safePage * safePageSize < total, regions: regionRows.map(row => row.location).sort() }; }

export async function saveVacancy(seekerUserId: number, vacancyId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const live = await db.select({ id: vacancies.id }).from(vacancies).where(and(eq(vacancies.id, vacancyId), eq(vacancies.status, "live"), gt(vacancies.deadline, new Date()))).limit(1); if (!live[0]) throw new Error("Vacancy is not available to save"); await db.insert(savedVacancies).values({ seekerUserId, vacancyId }).onDuplicateKeyUpdate({ set: { vacancyId } }); return { vacancyId, saved: true }; }

export function normalizeSavedVacancyOrganization(input: { folder: string; tags: string | null }) { return { folder: input.folder.trim().slice(0, 80) || "Unsorted", tags: input.tags?.split(",").map(tag => tag.trim()).filter(Boolean).slice(0, 12).join(", ") || null }; }

export async function updateSavedVacancyOrganization(seekerUserId: number, vacancyId: number, input: { folder: string; tags: string | null }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const { folder, tags } = normalizeSavedVacancyOrganization(input); await db.update(savedVacancies).set({ folder, tags }).where(and(eq(savedVacancies.seekerUserId, seekerUserId), eq(savedVacancies.vacancyId, vacancyId))); return { vacancyId, folder, tags }; }

export async function removeSavedVacancy(seekerUserId: number, vacancyId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(savedVacancies).where(and(eq(savedVacancies.seekerUserId, seekerUserId), eq(savedVacancies.vacancyId, vacancyId))); return { vacancyId, saved: false }; }

export async function listSavedVacancyIds(seekerUserId: number) { const db = await getDb(); if (!db) return []; const rows = await db.select({ vacancyId: savedVacancies.vacancyId }).from(savedVacancies).where(eq(savedVacancies.seekerUserId, seekerUserId)); return rows.map(row => row.vacancyId); }

export async function getMarketplaceMetrics() { const db = await getDb(); if (!db) return { vacancies: 0, companies: 0, seekers: 0 }; await expireTestVacancies(); const [vacancyRows, companyRows, seekerRows] = await Promise.all([db.select({ total: count() }).from(vacancies).where(and(eq(vacancies.status, "live"), gt(vacancies.deadline, new Date()), eq(vacancies.isTest, 0))), db.select({ total: count() }).from(employerProfiles).where(eq(employerProfiles.verified, 1)), db.select({ total: count() }).from(applications)]); return { vacancies: Number(vacancyRows[0]?.total ?? 0), companies: Number(companyRows[0]?.total ?? 0), seekers: Number(seekerRows[0]?.total ?? 0) }; }

export function buildApplicationStatusNotification(previousStatus: string, nextStatus: string) { return { type: "application_status", title: "Application status updated", message: `Your application status changed from ${previousStatus} to ${nextStatus}.` }; }

export async function createNotification(input: { userId: number; type: string; title: string; message: string; applicationId?: number; vacancyId?: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(notifications).values(input); return Number(result[0].insertId); }

export async function notifyEmployerOfPaymentStatus(input: { employerUserId: number; paymentId: number; vacancyId: number; state: string; providerReference?: string | null; adminNote?: string | null }) { const db = await getDb(); if (!db) return { notificationId: null, emailStatus: "skipped" as const }; const labels: Record<string, string> = { successful: "Payment confirmed", failed: "Payment could not be confirmed", cancelled: "Payment cancelled", refunded: "Payment refunded", pending: "Payment is awaiting review" }; const title = labels[input.state] ?? `Payment status: ${input.state}`; const message = `${title} for vacancy #${input.vacancyId}. ${input.adminNote ? `Admin note: ${input.adminNote}` : ""}`.trim(); const notificationId = await createNotification({ userId: input.employerUserId, type: `employer_payment_${input.state}`, title, message, vacancyId: input.vacancyId }); const employer = await getEmployerProfile(input.employerUserId); if (!employer?.email) return { notificationId, emailStatus: "skipped" as const }; const email = buildEmployerPaymentStatusEmail({ paymentId: input.paymentId, state: input.state, providerReference: input.providerReference, adminNote: input.adminNote }); const result = await sendPostmarkEmail({ to: employer.email, ...email, idempotencyKey: `kazipoa-payment-status-${input.paymentId}-${input.state}` }); await db.update(notifications).set({ emailStatus: result.status, emailSentAt: result.status === "sent" ? new Date() : null, emailError: result.status === "sent" ? null : result.reason }).where(eq(notifications.id, notificationId)); return { notificationId, emailStatus: result.status }; }

export async function notifyEmployerOfVacancyDecision(input: { employerUserId: number; vacancyId: number; title: string; action: "approve" | "reject" | "request_changes"; reason?: string | null }) { const db = await getDb(); if (!db) return { notificationId: null, emailStatus: "skipped" as const }; const labels = { approve: "Vacancy approved and published", reject: "Vacancy rejected", request_changes: "Vacancy changes requested" } as const; const title = labels[input.action]; const message = `${title}: ${input.title}.${input.reason ? ` Admin note: ${input.reason}` : ""}`; const notificationId = await createNotification({ userId: input.employerUserId, type: `employer_vacancy_${input.action}`, title, message, vacancyId: input.vacancyId }); const employer = await getEmployerProfile(input.employerUserId); if (!employer?.email) return { notificationId, emailStatus: "skipped" as const }; const email = buildEmployerVacancyDecisionEmail({ vacancyId: input.vacancyId, title: input.title, action: input.action, reason: input.reason }); const result = await sendPostmarkEmail({ to: employer.email, ...email, idempotencyKey: `kazipoa-vacancy-decision-${input.vacancyId}-${input.action}` }); await db.update(notifications).set({ emailStatus: result.status, emailSentAt: result.status === "sent" ? new Date() : null, emailError: result.status === "sent" ? null : result.reason }).where(eq(notifications.id, notificationId)); return { notificationId, emailStatus: result.status }; }

export async function getAdminVacancyReview(vacancyId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const vacancyRows = await db.select().from(vacancies).where(eq(vacancies.id, vacancyId)).limit(1); const vacancy = vacancyRows[0]; if (!vacancy) return null; const [employerRows, paymentRows, moderationRows] = await Promise.all([db.select().from(employerProfiles).where(eq(employerProfiles.userId, vacancy.employerUserId)).limit(1), db.select().from(payments).where(eq(payments.vacancyId, vacancyId)).orderBy(desc(payments.createdAt)), db.select().from(moderationLogs).where(eq(moderationLogs.vacancyId, vacancyId)).orderBy(desc(moderationLogs.createdAt))]); return { vacancy, employer: employerRows[0] ?? null, payments: paymentRows, moderationLogs: moderationRows }; }

export async function notifyAdminsOfNewRegistration(input: { userId: number; name: string | null; email: string; accountType: "seeker" | "employer" }) {
  const db = await getDb();
  if (!db) return { notified: 0 };
  const admins = await db.select({ id: users.id }).from(users).where(and(eq(users.role, "admin"), eq(users.isBlocked, false)));
  if (!admins.length) return { notified: 0 };
  const label = input.accountType === "employer" ? "Employer" : "Job seeker";
  for (const admin of admins) {
    await db.insert(notifications).values({ userId: admin.id, type: "admin_new_registration", title: `New ${label} registered`, message: `${input.name || "A new user"} (${input.email}) created a ${label.toLowerCase()} account.` });
  }
  return { notified: admins.length };
}

export async function listUserNotifications(userId: number, limit = 30) { const db = await getDb(); if (!db) return []; return db.select().from(notifications).where(and(eq(notifications.userId, userId), ne(notifications.type, "application_status_email_only"), ne(notifications.type, "new_vacancy_match_email_only"))).orderBy(desc(notifications.createdAt)).limit(limit); }

export async function markNotificationRead(userId: number, notificationId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId))); }

export async function markAllNotificationsRead(userId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, userId), isNull(notifications.readAt))); }

async function deliverNotificationEmail(notificationId: number, recipient: string | null | undefined, input: { previousStatus: string; nextStatus: string; applicationId: number; interviewAt?: Date | string | null; interviewNote?: string | null }) { const db = await getDb(); if (!db) return; let result: Awaited<ReturnType<typeof sendPostmarkEmail>>; if (!recipient) result = { status: "skipped", reason: "No seeker email is stored" }; else { const email = buildApplicationStatusEmail(input); result = await sendPostmarkEmail({ to: recipient, ...email, idempotencyKey: `kazipoa-notification-${notificationId}` }); } await db.update(notifications).set({ emailStatus: result.status, emailSentAt: result.status === "sent" ? new Date() : null, emailError: result.status === "sent" ? null : result.reason }).where(eq(notifications.id, notificationId)); }
async function recordInterviewSmsDelivery(notificationId: number) { const db = await getDb(); if (!db) return; const result = getInterviewSmsDeliveryResult({ phone: null }); await db.update(notifications).set({ smsStatus: result.status, smsSentAt: result.status === "sent" ? new Date() : null, smsError: result.status === "sent" ? null : result.reason }).where(eq(notifications.id, notificationId)); }

export function validateModerationInput(action: "approve" | "reject" | "request_changes", reason?: string) { if ((action === "reject" || action === "request_changes") && !reason?.trim()) throw new Error("A moderation reason is required"); }

export async function moderateVacancy(input: { vacancyId: number; adminUserId: number; action: "approve" | "reject" | "request_changes"; reason?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); validateModerationInput(input.action, input.reason); const current = await db.select().from(vacancies).where(eq(vacancies.id, input.vacancyId)).limit(1); if (!current[0]) throw new Error("Vacancy not found"); let nextStatus: "live" | "rejected" | "changes_requested"; if (input.action === "approve") { const successfulPayment = await db.select().from(payments).where(eq(payments.vacancyId, input.vacancyId)); const isPaid = current[0].paymentRequired === false || successfulPayment.some(payment => payment.state === "successful"); if (!isPaid || current[0].employerVerified !== 1) throw new Error("Vacancy requires successful payment unless free allowance applies, and verified employer before publication"); nextStatus = "live"; } else { nextStatus = input.action === "reject" ? "rejected" : "changes_requested"; } await db.update(vacancies).set({ status: nextStatus }).where(eq(vacancies.id, input.vacancyId)); await db.insert(moderationLogs).values({ vacancyId: input.vacancyId, adminUserId: input.adminUserId, action: input.action, reason: input.reason ?? null, previousStatus: current[0].status, nextStatus }); await notifyEmployerOfVacancyDecision({ employerUserId: current[0].employerUserId, vacancyId: current[0].id, title: current[0].title, action: input.action, reason: input.reason }); if (nextStatus === "live") await notifyMatchingSeekersForVacancy(input.vacancyId); return { ...current[0], status: nextStatus }; }

export async function resubmitEmployerVacancy(input: { vacancyId: number; employerUserId: number; company: string; title: string; category: string; location: string; contractType?: string; salary?: string | null; description: string; deadline: Date }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const current = await db.select().from(vacancies).where(and(eq(vacancies.id, input.vacancyId), eq(vacancies.employerUserId, input.employerUserId))).limit(1); if (!current[0]) throw new Error("Vacancy not found or not owned by Employer"); if (!["rejected", "changes_requested"].includes(current[0].status)) throw new Error("Only rejected or changes-requested vacancies can be resubmitted"); const nextStatus = current[0].paymentRequired ? "paid_pending_review" : "submitted"; await db.update(vacancies).set({ company: input.company, title: input.title, category: input.category, location: input.location, contractType: input.contractType ?? current[0].contractType, salary: input.salary?.trim() || null, description: input.description, deadline: input.deadline, status: nextStatus }).where(eq(vacancies.id, input.vacancyId)); return { ...current[0], ...input, status: nextStatus }; }

export async function createEmployerVacancy(input: { employerUserId: number; company: string; title: string; category: string; location: string; contractType?: string; salary?: string | null; description: string; deadline: Date; paymentRequired?: boolean; urgent?: boolean }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const paymentRequired = input.paymentRequired ?? true; const result = await db.insert(vacancies).values({ ...input, paymentRequired, urgent: input.urgent ? 1 : 0, status: paymentRequired ? "payment_pending" : "submitted", employerVerified: 0 }); return Number(result[0].insertId); }

export async function recordPayment(input: { vacancyId: number; employerUserId: number; method: string; provider: string; amountTzs: number; providerReference?: string; evidenceNote?: string; receiptKey?: string; receiptUrl?: string; receiptName?: string; receiptMimeType?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(payments).values({ ...input, state: "pending" }); await db.update(vacancies).set({ status: "paid_pending_review" }).where(eq(vacancies.id, input.vacancyId)); return Number(result[0].insertId); }

export async function upsertEmployerProfile(input: { userId: number; companyName: string; registrationNumber?: string; industry?: string; location?: string; email?: string; phone?: string; profileImageKey?: string | null; profileImageUrl?: string | null; profileImageMimeType?: string | null; profileImageSize?: number | null }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(employerProfiles).values(input).onDuplicateKeyUpdate({ set: { ...input } }); }

export async function updateEmployerProfileImage(input: { userId: number; profileImageKey: string; profileImageUrl: string; profileImageMimeType: string; profileImageSize: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(employerProfiles).set({ profileImageKey: input.profileImageKey, profileImageUrl: input.profileImageUrl, profileImageMimeType: input.profileImageMimeType, profileImageSize: input.profileImageSize }).where(eq(employerProfiles.userId, input.userId)); }

export async function getEmployerProfile(userId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId)).limit(1); return rows[0]; }

const DEFAULT_PLATFORM_SETTINGS = {
  categories: "Accounting & Finance, IT & Cybersecurity, Marketing & Sales, Business & Admin, Law & Legal Services, Healthcare, Engineering, Hospitality, Logistics & Transport, Education, Agriculture, Construction, Internships",
  regions: "All Tanzania, Arusha, Dar es Salaam, Dodoma, Geita, Iringa, Kagera, Katavi, Kigoma, Kilimanjaro, Lindi, Manyara, Mara, Mbeya, Morogoro, Mtwara, Mwanza, Njombe, Pemba North, Pemba South, Pwani, Rukwa, Ruvuma, Shinyanga, Simiyu, Singida, Songwe, Tabora, Tanga, Zanzibar North, Zanzibar South, Zanzibar West, Remote",
  supportPhoneNumbers: "+255616116779, +255695985717",
  publicationReviewHours: "Within one business day when payment evidence and vacancy details are complete",
  seekerStatusEmailNotifications: "enabled",
  employerStatusEmailNotifications: "enabled",
  notificationAutoArchiveType: "admin_new_registration",
  notificationAutoArchiveDays: "30",
} as const;

export type PlatformSettings = { categories: string; regions: string; supportPhoneNumbers: string; publicationReviewHours: string; seekerStatusEmailNotifications: "enabled" | "disabled"; employerStatusEmailNotifications: "enabled" | "disabled"; notificationAutoArchiveType: "admin_new_registration" | "all_admin_notifications"; notificationAutoArchiveDays: string };

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const db = await getDb();
  if (!db) return { ...DEFAULT_PLATFORM_SETTINGS };
  const rows = await db.select().from(platformSettings);
  const values = Object.fromEntries(rows.map(row => [row.settingKey, row.settingValue]));
  return {
    categories: values.categories || DEFAULT_PLATFORM_SETTINGS.categories,
    regions: values.regions || DEFAULT_PLATFORM_SETTINGS.regions,
    supportPhoneNumbers: values.supportPhoneNumbers || DEFAULT_PLATFORM_SETTINGS.supportPhoneNumbers,
    publicationReviewHours: values.publicationReviewHours || DEFAULT_PLATFORM_SETTINGS.publicationReviewHours,
    seekerStatusEmailNotifications: values.seekerStatusEmailNotifications === "disabled" ? "disabled" : DEFAULT_PLATFORM_SETTINGS.seekerStatusEmailNotifications,
    employerStatusEmailNotifications: values.employerStatusEmailNotifications === "disabled" ? "disabled" : DEFAULT_PLATFORM_SETTINGS.employerStatusEmailNotifications,
    notificationAutoArchiveType: values.notificationAutoArchiveType === "all_admin_notifications" ? "all_admin_notifications" : DEFAULT_PLATFORM_SETTINGS.notificationAutoArchiveType,
    notificationAutoArchiveDays: values.notificationAutoArchiveDays || DEFAULT_PLATFORM_SETTINGS.notificationAutoArchiveDays,
  };
}

export async function savePlatformSettings(input: PlatformSettings, adminUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  for (const [settingKey, settingValue] of Object.entries(input)) {
    await db.insert(platformSettings).values({ settingKey, settingValue, updatedByAdminUserId: adminUserId }).onDuplicateKeyUpdate({ set: { settingValue, updatedByAdminUserId: adminUserId } });
  }
  return getPlatformSettings();
}

export async function getActiveSubscription(employerUserId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(employerSubscriptions).where(and(eq(employerSubscriptions.employerUserId, employerUserId), eq(employerSubscriptions.status, "active"))).limit(1); return rows[0]; }

export async function createEmployerSubscription(input: { employerUserId: number; plan: "starter" | "business" | "enterprise"; maxVacancies: number; maxCandidates: number; startedAt?: Date; endsAt?: Date }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(employerSubscriptions).values({ ...input, status: "active" }); }

export async function getEmployerUsage(employerUserId: number) { const db = await getDb(); if (!db) return { vacancies: 0, candidates: 0 }; const vacancyRows = await db.select({ total: count() }).from(vacancies).where(eq(vacancies.employerUserId, employerUserId)); const candidateRows = await db.select({ total: count() }).from(applications).where(eq(applications.employerUserId, employerUserId)); return { vacancies: Number(vacancyRows[0]?.total ?? 0), candidates: Number(candidateRows[0]?.total ?? 0) }; }

export async function createMpesaPaymentIntent(input: { vacancyId: number; employerUserId: number; amountTzs: number; providerReference: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const vacancyRows = await db.select().from(vacancies).where(and(eq(vacancies.id, input.vacancyId), eq(vacancies.employerUserId, input.employerUserId))).limit(1); const vacancy = vacancyRows[0]; if (!vacancy) throw new Error("Vacancy not found or not owned by Employer"); if (!vacancy.paymentRequired) throw new Error("This vacancy does not require payment"); const pricing = getKazipoaPricingConfig(); const allowedAmounts = new Set([pricing.basicFeeTzs, ...Object.values(pricing.vacancyTiers).map(tier => tier.amountTzs), 30_000]); if (!allowedAmounts.has(input.amountTzs)) throw new Error("M-Pesa amount is not an approved Kazipoa vacancy fee"); const existing = await db.select().from(payments).where(and(eq(payments.vacancyId, input.vacancyId), eq(payments.employerUserId, input.employerUserId), eq(payments.provider, "mpesa"), eq(payments.state, "pending"))).orderBy(desc(payments.createdAt)).limit(1); if (existing[0]) return existing[0]; const result = await db.insert(payments).values({ vacancyId: input.vacancyId, employerUserId: input.employerUserId, method: "mpesa", provider: "mpesa", amountTzs: input.amountTzs, providerReference: input.providerReference, state: "pending" }); await db.update(vacancies).set({ status: "paid_pending_review" }).where(and(eq(vacancies.id, input.vacancyId), eq(vacancies.employerUserId, input.employerUserId))); const rows = await db.select().from(payments).where(eq(payments.id, Number(result[0].insertId))).limit(1); return rows[0]; }

export async function applyVerifiedMpesaCallback(input: { callback: MpesaCallback; rawBody: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const rows = await db.select().from(payments).where(and(eq(payments.id, input.callback.paymentId), eq(payments.provider, "mpesa"))).limit(1); const payment = rows[0]; if (!payment) throw new Error("M-Pesa payment not found"); if (payment.amountTzs !== input.callback.amountTzs) throw new Error("M-Pesa callback amount does not match the payment"); if (payment.providerReference && payment.providerReference !== input.callback.providerReference) throw new Error("M-Pesa callback reference does not match the payment"); const replay = await db.select({ id: payments.id }).from(payments).where(eq(payments.callbackEventId, input.callback.eventId)).limit(1); if (replay[0]) { if (replay[0].id !== payment.id) throw new Error("M-Pesa callback event is already attached to another payment"); return { duplicate: true, paymentId: payment.id, state: payment.state }; } if (payment.callbackEventId) throw new Error("M-Pesa payment already has a verified callback"); const payloadHash = callbackPayloadHash(input.rawBody); await db.update(payments).set({ state: input.callback.state, providerReference: input.callback.providerReference, callbackEventId: input.callback.eventId, callbackReceivedAt: new Date(), callbackPayloadHash: payloadHash }).where(and(eq(payments.id, payment.id), isNull(payments.callbackEventId))); await db.update(vacancies).set({ status: input.callback.state === "successful" ? "paid_pending_review" : "payment_pending" }).where(eq(vacancies.id, payment.vacancyId)); await notifyEmployerOfPaymentStatus({ employerUserId: payment.employerUserId, paymentId: payment.id, vacancyId: payment.vacancyId, state: input.callback.state, providerReference: input.callback.providerReference }); const updated = await db.select().from(payments).where(eq(payments.id, payment.id)).limit(1); return { duplicate: false, paymentId: payment.id, state: updated[0]?.state ?? input.callback.state }; }

export async function updatePaymentState(paymentId: number, state: "successful" | "failed" | "cancelled" | "refunded", providerReference?: string, adminNote?: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const rows = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1); const payment = rows[0]; if (!payment) throw new Error("Payment not found"); await db.update(payments).set({ state, providerReference, adminNote: adminNote ?? null }).where(eq(payments.id, paymentId)); await notifyEmployerOfPaymentStatus({ employerUserId: payment.employerUserId, paymentId: payment.id, vacancyId: payment.vacancyId, state, providerReference: providerReference ?? payment.providerReference, adminNote }); }

export async function createSupportTicket(input: { ticketReference: string; requesterUserId?: number; requesterName: string; requesterEmail: string; message: string; attachmentKey?: string; attachmentUrl?: string; attachmentName?: string; attachmentMimeType?: string; attachmentSize?: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(supportTickets).values({ ...input, requesterUserId: input.requesterUserId ?? null, status: "open" }); const rows = await db.select().from(supportTickets).where(eq(supportTickets.id, Number(result[0].insertId))).limit(1); return rows[0]; }

export async function listSupportTickets(status?: "open" | "in_progress" | "resolved", sort: "priority" | "newest" = "priority") { const db = await getDb(); if (!db) return []; const rows = status ? await db.select().from(supportTickets).where(eq(supportTickets.status, status)) : await db.select().from(supportTickets); const priorityRank: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 }; return rows.sort((a, b) => sort === "priority" ? (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }

export async function listUserSupportTickets(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(supportTickets).where(eq(supportTickets.requesterUserId, userId)).orderBy(desc(supportTickets.createdAt)); }

export async function replyToSupportTicket(ticketId: number, requesterUserId: number, userReply: string, attachment?: { key: string; url: string; name: string; mimeType: string; size: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const rows = await db.select().from(supportTickets).where(and(eq(supportTickets.id, ticketId), eq(supportTickets.requesterUserId, requesterUserId))).limit(1); const ticket = rows[0]; if (!ticket) throw new Error("Support ticket not found"); await db.update(supportTickets).set({ userReply, userReplyAt: new Date(), userReplyAttachmentKey: attachment?.key ?? null, userReplyAttachmentUrl: attachment?.url ?? null, userReplyAttachmentName: attachment?.name ?? null, userReplyAttachmentMimeType: attachment?.mimeType ?? null, userReplyAttachmentSize: attachment?.size ?? null, status: ticket.status === "resolved" ? "open" : ticket.status }).where(and(eq(supportTickets.id, ticketId), eq(supportTickets.requesterUserId, requesterUserId))); const updated = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1); return updated[0]; }

export async function updateSupportTicket(ticketId: number, status: "open" | "in_progress" | "resolved", priority: "low" | "normal" | "high" | "urgent", adminNote?: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(supportTickets).set({ status, priority, adminNote: adminNote ?? null }).where(eq(supportTickets.id, ticketId)); const rows = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1); return rows[0]; }

export async function listPaymentReviews() { const db = await getDb(); if (!db) return []; return db.select().from(payments).orderBy(desc(payments.createdAt)); }

export async function listEmployerPayments(employerUserId: number) { const db = await getDb(); if (!db) return []; return db.select().from(payments).where(eq(payments.employerUserId, employerUserId)).orderBy(desc(payments.createdAt)); }

export async function getPaymentReceipt(paymentId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const rows = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1); return rows[0]; }

export async function getLatestSubscription(employerUserId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(employerSubscriptions).where(eq(employerSubscriptions.employerUserId, employerUserId)).orderBy(desc(employerSubscriptions.createdAt)).limit(1); return rows[0]; }

export async function requestEmployerSubscription(input: { employerUserId: number; plan: "starter" | "business" | "enterprise"; maxVacancies: number; maxCandidates: number; paymentReference: string; paymentAmountTzs: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(employerSubscriptions).values({ ...input, status: "pending" }); }

export async function listPendingSubscriptions() { const db = await getDb(); if (!db) return []; return db.select().from(employerSubscriptions).where(eq(employerSubscriptions.status, "pending")).orderBy(desc(employerSubscriptions.createdAt)); }

export function validateSubscriptionModerationInput(action: "approve" | "reject", reason?: string) { if (action === "reject" && !reason?.trim()) throw new Error("A rejection reason is required"); }

export function getSubscriptionModerationStatus(action: "approve" | "reject") { return action === "approve" ? "active" as const : "rejected" as const; }

export async function moderateSubscription(input: { subscriptionId: number; adminUserId: number; action: "approve" | "reject"; reason?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); validateSubscriptionModerationInput(input.action, input.reason); const nextStatus = getSubscriptionModerationStatus(input.action); await db.update(employerSubscriptions).set({ status: nextStatus, rejectionReason: input.reason ?? null, startedAt: input.action === "approve" ? new Date() : null }).where(eq(employerSubscriptions.id, input.subscriptionId)); return { subscriptionId: input.subscriptionId, status: nextStatus, adminUserId: input.adminUserId }; }

const defaultSeekerNotificationPreferences = { emailReviewing: 1, emailShortlisted: 1, emailInterview: 1, emailOffered: 1, emailHired: 1, emailRejected: 1, inAppReviewing: 1, inAppShortlisted: 1, inAppInterview: 1, inAppOffered: 1, inAppHired: 1, inAppRejected: 1, vacancyAlertsEnabled: 1, emailVacancyAlerts: 1, inAppVacancyAlerts: 1, vacancyAlertKeywordsEnabled: 1, vacancyAlertRegionsEnabled: 1, vacancyAlertCategoriesEnabled: 1, vacancyAlertKeywords: null, vacancyAlertRegions: null, vacancyAlertCategories: null } as const;

type SeekerNotificationPreferencePatch = Partial<typeof defaultSeekerNotificationPreferences>;

export async function saveVacancyAlertPreferences(seekerUserId: number, patch: { vacancyAlertsEnabled?: number; emailVacancyAlerts?: number; inAppVacancyAlerts?: number; vacancyAlertKeywordsEnabled?: number; vacancyAlertRegionsEnabled?: number; vacancyAlertCategoriesEnabled?: number; vacancyAlertKeywords?: string | null; vacancyAlertRegions?: string | null; vacancyAlertCategories?: string | null }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(seekerNotificationPreferences).values({ seekerUserId, ...defaultSeekerNotificationPreferences, ...patch }).onDuplicateKeyUpdate({ set: patch }); return getSeekerNotificationPreferences(seekerUserId); }

function splitAlertValues(value: string | null | undefined) { return (value ?? "").split(",").map(item => item.trim().toLowerCase()).filter(Boolean); }

export function vacancyAlertDeliveryChannels(preferences: { emailVacancyAlerts?: number; inAppVacancyAlerts?: number }) { return { email: preferences.emailVacancyAlerts !== 0, inApp: preferences.inAppVacancyAlerts !== 0 }; }

export function vacancyMatchesAlertPreferences(vacancy: Pick<typeof vacancies.$inferSelect, "title" | "company" | "category" | "location" | "description">, preferences: { vacancyAlertsEnabled?: number; vacancyAlertKeywordsEnabled?: number; vacancyAlertRegionsEnabled?: number; vacancyAlertCategoriesEnabled?: number; vacancyAlertKeywords?: string | null; vacancyAlertRegions?: string | null; vacancyAlertCategories?: string | null }) { if (!preferences.vacancyAlertsEnabled) return false; const keywords = splitAlertValues(preferences.vacancyAlertKeywords); const regions = splitAlertValues(preferences.vacancyAlertRegions); const categories = splitAlertValues(preferences.vacancyAlertCategories); if ((!keywords.length || preferences.vacancyAlertKeywordsEnabled === 0) && (!regions.length || preferences.vacancyAlertRegionsEnabled === 0) && (!categories.length || preferences.vacancyAlertCategoriesEnabled === 0)) return false; const haystack = `${vacancy.title} ${vacancy.company} ${vacancy.category} ${vacancy.location} ${vacancy.description}`.toLowerCase(); return (preferences.vacancyAlertKeywordsEnabled === 0 || !keywords.length || keywords.some(keyword => haystack.includes(keyword))) && (preferences.vacancyAlertRegionsEnabled === 0 || !regions.length || regions.some(region => vacancy.location.toLowerCase().includes(region))) && (preferences.vacancyAlertCategoriesEnabled === 0 || !categories.length || categories.some(category => vacancy.category.toLowerCase().includes(category))); }

export function buildVacancyAlertContent(input: { title: string; company: string; location: string; urgent?: boolean | number }) { const urgent = input.urgent === true || input.urgent === 1; return { type: urgent ? "urgent_vacancy" : "new_vacancy_match", title: urgent ? "Urgent vacancy: apply early" : "A new vacancy matches your interests", message: urgent ? `Urgent opportunity: ${input.title} at ${input.company} in ${input.location}. Apply as soon as possible before the deadline.` : `${input.title} at ${input.company} is now live in ${input.location}.`, emailSubject: urgent ? `Urgent vacancy: ${input.title}` : `New vacancy match: ${input.title}` }; }

export async function notifyMatchingSeekersForVacancy(vacancyId: number) { const db = await getDb(); if (!db) return { notified: 0 }; const vacancy = await getPublicLiveVacancy(vacancyId); if (!vacancy || vacancy.isTest === 1) return { notified: 0 }; const seekers = await db.select({ userId: seekerNotificationPreferences.seekerUserId, email: users.email, phone: users.phone, vacancyAlertsEnabled: seekerNotificationPreferences.vacancyAlertsEnabled, emailVacancyAlerts: seekerNotificationPreferences.emailVacancyAlerts, inAppVacancyAlerts: seekerNotificationPreferences.inAppVacancyAlerts, vacancyAlertKeywordsEnabled: seekerNotificationPreferences.vacancyAlertKeywordsEnabled, vacancyAlertRegionsEnabled: seekerNotificationPreferences.vacancyAlertRegionsEnabled, vacancyAlertCategoriesEnabled: seekerNotificationPreferences.vacancyAlertCategoriesEnabled, vacancyAlertKeywords: seekerNotificationPreferences.vacancyAlertKeywords, vacancyAlertRegions: seekerNotificationPreferences.vacancyAlertRegions, vacancyAlertCategories: seekerNotificationPreferences.vacancyAlertCategories }).from(seekerNotificationPreferences).innerJoin(users, eq(users.id, seekerNotificationPreferences.seekerUserId)); let notified = 0; for (const preferences of seekers) { const channels = vacancyAlertDeliveryChannels(preferences); if (!vacancyMatchesAlertPreferences(vacancy, preferences) || (!channels.inApp && !channels.email)) continue; const existing = await db.select({ id: notifications.id }).from(notifications).where(and(eq(notifications.userId, preferences.userId), eq(notifications.vacancyId, vacancyId))).limit(1); if (existing[0]) continue; const alert = buildVacancyAlertContent({ title: vacancy.title, company: vacancy.company, location: vacancy.location, urgent: vacancy.urgent }); const notificationType = channels.inApp ? alert.type : `${alert.type}_email_only`; const notificationId = await createNotification({ userId: preferences.userId, vacancyId, type: notificationType, title: alert.title, message: alert.message }); if (channels.email) { const result = await sendPostmarkEmail({ to: preferences.email ?? "", subject: alert.emailSubject, text: `${alert.message} View it at ${ENV.appBaseUrl}/vacancies/${vacancy.id}`, html: `<p>${alert.message}</p><p><a href="${ENV.appBaseUrl}/vacancies/${vacancy.id}">View vacancy</a></p>`, idempotencyKey: `kazipoa-vacancy-alert-${notificationId}` }); await db.update(notifications).set({ emailStatus: result.status, emailSentAt: result.status === "sent" ? new Date() : null, emailError: result.status === "sent" ? null : result.reason }).where(eq(notifications.id, notificationId)); } if (vacancy.urgent === 1) { const sms = await sendSms({ to: preferences.phone, message: `${alert.message} View it at ${ENV.appBaseUrl}/vacancies/${vacancy.id}`, idempotencyKey: `kazipoa-urgent-sms-${notificationId}` }); await db.update(notifications).set({ smsStatus: sms.status, smsSentAt: sms.status === "sent" ? new Date() : null, smsError: sms.status === "sent" ? null : sms.reason }).where(eq(notifications.id, notificationId)); } notified += 1; } return { notified }; }

export async function getSeekerNotificationPreferences(seekerUserId: number) { const db = await getDb(); if (!db) return { seekerUserId, ...defaultSeekerNotificationPreferences }; const rows = await db.select().from(seekerNotificationPreferences).where(eq(seekerNotificationPreferences.seekerUserId, seekerUserId)).limit(1); return rows[0] ?? { seekerUserId, ...defaultSeekerNotificationPreferences }; }

export async function saveSeekerNotificationPreferences(seekerUserId: number, patch: SeekerNotificationPreferencePatch) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(seekerNotificationPreferences).values({ seekerUserId, ...defaultSeekerNotificationPreferences, ...patch }).onDuplicateKeyUpdate({ set: patch }); return getSeekerNotificationPreferences(seekerUserId); }

export function notificationPreferenceKey(channel: "email" | "inApp", status: "reviewing" | "shortlisted" | "interview" | "offered" | "hired" | "rejected") { return `${channel}${status.charAt(0).toUpperCase()}${status.slice(1)}` as keyof typeof defaultSeekerNotificationPreferences; }

export async function updateApplicationStatus(input: { applicationId: number; employerUserId: number; status: "reviewing" | "shortlisted" | "interview" | "offered" | "hired" | "rejected"; note?: string; interviewAt?: Date }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const rows = await db.select().from(applications).where(and(eq(applications.id, input.applicationId), eq(applications.employerUserId, input.employerUserId))).limit(1); if (!rows[0]) throw new Error("Application not found or not owned by employer"); if (rows[0].status === input.status && !input.note && !input.interviewAt) return { ...rows[0], status: input.status }; if (rows[0].status !== input.status || input.interviewAt) await db.update(applications).set({ status: input.status, interviewAt: input.status === "interview" ? input.interviewAt ?? rows[0].interviewAt : null, interviewNote: input.status === "interview" ? input.note ?? rows[0].interviewNote : null, interviewResponse: input.status === "interview" ? "pending" : rows[0].interviewResponse }).where(eq(applications.id, input.applicationId)); await db.insert(applicationStatusHistory).values({ applicationId: input.applicationId, seekerUserId: rows[0].seekerUserId, employerUserId: input.employerUserId, previousStatus: rows[0].status, nextStatus: input.status, note: input.note ?? null, interviewAt: input.interviewAt ?? null }); const preferences = await getSeekerNotificationPreferences(rows[0].seekerUserId); const statusKey = input.status; const inAppEnabled = Boolean(preferences[notificationPreferenceKey("inApp", statusKey)]); const emailEnabled = Boolean(preferences[notificationPreferenceKey("email", statusKey)]); if (inAppEnabled || emailEnabled) { const notification = buildApplicationStatusNotification(rows[0].status, input.status); const notificationId = await createNotification({ ...notification, type: inAppEnabled ? notification.type : "application_status_email_only", userId: rows[0].seekerUserId, applicationId: input.applicationId }); if (emailEnabled) void deliverNotificationEmail(notificationId, rows[0].seekerEmail, { previousStatus: rows[0].status, nextStatus: input.status, applicationId: input.applicationId, interviewAt: input.interviewAt, interviewNote: input.note }).catch(error => console.warn("[Notification] Email delivery update failed", error)); if (input.status === "interview") void recordInterviewSmsDelivery(notificationId).catch(error => console.warn("[Notification] SMS delivery update failed", error)); } return { ...rows[0], status: input.status }; }

export async function listEmployerApplications(employerUserId: number, input: { keyword?: string; status?: string } = {}) { const db = await getDb(); if (!db) return []; const criteria = [eq(applications.employerUserId, employerUserId)]; if (input.status && input.status !== "all") criteria.push(eq(applications.status, input.status as any)); if (input.keyword?.trim()) { const pattern = `%${input.keyword.trim()}%`; criteria.push(or(like(applications.seekerEmail, pattern), like(users.name, pattern), like(vacancies.title, pattern))!); } const rows = await db.select({ applicationId: applications.id, seekerUserId: applications.seekerUserId, seekerEmail: applications.seekerEmail, seekerName: users.name, profilePhotoUrl: users.profilePhotoUrl, vacancyId: applications.vacancyId, status: applications.status, appliedAt: applications.createdAt, title: vacancies.title, location: vacancies.location, interviewAt: applications.interviewAt, interviewNote: applications.interviewNote, interviewResponse: applications.interviewResponse }).from(applications).leftJoin(vacancies, eq(applications.vacancyId, vacancies.id)).leftJoin(users, eq(users.id, applications.seekerUserId)).where(and(...criteria)).orderBy(desc(applications.createdAt)); if (!rows.length) return rows.map(row => ({ ...row, skills: [] as string[], experienceTitles: [] as string[], experienceYears: 0 })); const seekerIds = Array.from(new Set(rows.map(row => row.seekerUserId))); const skillRows = await db.select({ seekerUserId: seekerSkills.seekerUserId, name: seekerSkills.name }).from(seekerSkills).where(inArray(seekerSkills.seekerUserId, seekerIds)); const experienceRows = await db.select({ seekerUserId: seekerExperience.seekerUserId, jobTitle: seekerExperience.jobTitle, startDate: seekerExperience.startDate, endDate: seekerExperience.endDate, currentRole: seekerExperience.currentRole }).from(seekerExperience).where(inArray(seekerExperience.seekerUserId, seekerIds)); const skillsBySeeker = new Map<number, string[]>(); for (const row of skillRows) { const current = skillsBySeeker.get(row.seekerUserId) ?? []; current.push(row.name); skillsBySeeker.set(row.seekerUserId, current); } const experienceBySeeker = new Map<number, typeof experienceRows>(); for (const row of experienceRows) { const current = experienceBySeeker.get(row.seekerUserId) ?? []; current.push(row); experienceBySeeker.set(row.seekerUserId, current); } const experienceYears = (records: typeof experienceRows) => Math.round(records.reduce((total, record) => { const start = new Date(record.startDate).getTime(); const end = record.currentRole ? Date.now() : new Date(record.endDate ?? record.startDate).getTime(); return Number.isFinite(start) && Number.isFinite(end) ? total + Math.max(0, end - start) : total; }, 0) / (365.25 * 24 * 60 * 60 * 1000) * 10) / 10; return rows.map(row => ({ ...row, skills: skillsBySeeker.get(row.seekerUserId) ?? [], experienceTitles: (experienceBySeeker.get(row.seekerUserId) ?? []).map(record => record.jobTitle), experienceYears: experienceYears(experienceBySeeker.get(row.seekerUserId) ?? []) })); }

export async function getEmployerCandidateDocument(employerUserId: number, applicationId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select({ application: applications, document: seekerDocuments }).from(applications).leftJoin(seekerDocuments, eq(seekerDocuments.id, applications.cvDocumentId)).where(and(eq(applications.id, applicationId), eq(applications.employerUserId, employerUserId))).limit(1); return rows[0]?.document ? { ...rows[0].document, seekerUserId: rows[0].application.seekerUserId, vacancyId: rows[0].application.vacancyId } : undefined; }

export async function getEmployerCandidateProfile(employerUserId: number, applicationId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select({ application: applications, seeker: users }).from(applications).innerJoin(users, eq(users.id, applications.seekerUserId)).where(and(eq(applications.id, applicationId), eq(applications.employerUserId, employerUserId))).limit(1); return rows[0] ? { application: rows[0].application, seeker: rows[0].seeker } : undefined; }

export async function recordSeekerAccessEvent(input: { seekerUserId: number; employerUserId: number; vacancyId?: number; documentId?: number; accessType: "profile" | "cv" }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); const recent = await db.select({ id: seekerAccessEvents.id }).from(seekerAccessEvents).where(and(eq(seekerAccessEvents.seekerUserId, input.seekerUserId), eq(seekerAccessEvents.employerUserId, input.employerUserId), eq(seekerAccessEvents.accessType, input.accessType), input.documentId ? eq(seekerAccessEvents.documentId, input.documentId) : isNull(seekerAccessEvents.documentId), input.vacancyId ? eq(seekerAccessEvents.vacancyId, input.vacancyId) : isNull(seekerAccessEvents.vacancyId), gt(seekerAccessEvents.createdAt, cutoff))).limit(1); if (recent[0]) return { recorded: false, notificationId: null }; await db.insert(seekerAccessEvents).values({ ...input, vacancyId: input.vacancyId ?? null, documentId: input.documentId ?? null }); const notificationId = await createNotification({ userId: input.seekerUserId, type: input.accessType === "cv" ? "cv_viewed" : "profile_viewed", title: input.accessType === "cv" ? "An employer viewed your CV" : "An employer viewed your profile", message: input.accessType === "cv" ? "An employer has viewed the CV attached to your application." : "An employer has opened your seeker profile while reviewing applications.", vacancyId: input.vacancyId }); return { recorded: true, notificationId }; }

export async function getEmployerApplicationTrend(employerUserId: number, period: "week" | "month" = "week") { const db = await getDb(); if (!db) return []; const rows = await db.select({ createdAt: applications.createdAt }).from(applications).where(eq(applications.employerUserId, employerUserId)); const buckets = new Map<string, number>(); for (const row of rows) { const date = new Date(row.createdAt); const key = period === "month" ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}` : (() => { const day = date.getUTCDay() || 7; const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - day + 1)); return monday.toISOString().slice(0, 10); })(); buckets.set(key, (buckets.get(key) ?? 0) + 1); } return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([label, applicationsCount]) => ({ label, applications: applicationsCount })); }

export async function createApplication(input: { vacancyId: number; seekerUserId: number; seekerEmail?: string; coverNote?: string; cvDocumentId?: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const vacancyRows = await db.select().from(vacancies).where(eq(vacancies.id, input.vacancyId)).limit(1); const vacancy = vacancyRows[0]; if (!vacancy || vacancy.status !== "live" || vacancy.deadline.getTime() < Date.now()) throw new Error("This vacancy is not available for applications"); if (vacancy.isTest === 1) throw new Error("This test vacancy uses the original source application route and cannot receive internal applications"); if (input.cvDocumentId) { const cv = await getSeekerCvById(input.seekerUserId, input.cvDocumentId); if (!cv) throw new Error("Selected CV was not found in your private portfolio"); } const existing = await db.select().from(applications).where(and(eq(applications.vacancyId, input.vacancyId), eq(applications.seekerUserId, input.seekerUserId))).limit(1); if (existing[0]) return existing[0]; const result = await db.insert(applications).values({ vacancyId: input.vacancyId, employerUserId: vacancy.employerUserId, seekerUserId: input.seekerUserId, seekerEmail: input.seekerEmail ?? null, coverNote: input.coverNote?.trim() || null, cvDocumentId: input.cvDocumentId ?? null, status: "applied" }); const rows = await db.select().from(applications).where(eq(applications.id, Number(result[0].insertId))).limit(1); return rows[0]; }

export async function verifyEmployerVacancies(employerUserId: number, adminUserId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(employerProfiles).set({ verified: 1 }).where(eq(employerProfiles.userId, employerUserId)); const result = await db.update(vacancies).set({ employerVerified: 1 }).where(eq(vacancies.employerUserId, employerUserId)); return { employerUserId, adminUserId, updatedVacancies: Number(result[0].affectedRows ?? 0) }; }

export async function listSeekerApplications(seekerUserId: number) { const db = await getDb(); if (!db) return []; return db.select({ applicationId: applications.id, vacancyId: applications.vacancyId, status: applications.status, appliedAt: applications.createdAt, title: vacancies.title, company: vacancies.company, location: vacancies.location, interviewAt: applications.interviewAt, interviewNote: applications.interviewNote, interviewResponse: applications.interviewResponse }).from(applications).leftJoin(vacancies, eq(applications.vacancyId, vacancies.id)).where(eq(applications.seekerUserId, seekerUserId)).orderBy(desc(applications.createdAt)); }

export async function listSeekerApplicationHistory(seekerUserId: number) { const db = await getDb(); if (!db) return []; return db.select().from(applicationStatusHistory).where(eq(applicationStatusHistory.seekerUserId, seekerUserId)).orderBy(desc(applicationStatusHistory.createdAt)); }
export async function respondToInterview(input: { applicationId: number; seekerUserId: number; response: "accepted" | "declined" }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const rows = await db.select().from(applications).where(and(eq(applications.id, input.applicationId), eq(applications.seekerUserId, input.seekerUserId))).limit(1); const application = rows[0]; if (!application || application.status !== "interview" || !application.interviewAt) throw new Error("Interview invitation not found or no longer available"); if (application.interviewResponse === input.response) return application; await db.update(applications).set({ interviewResponse: input.response }).where(eq(applications.id, input.applicationId)); await db.insert(applicationStatusHistory).values({ applicationId: input.applicationId, seekerUserId: input.seekerUserId, employerUserId: application.employerUserId, previousStatus: "interview", nextStatus: `interview_${input.response}`, note: input.response === "accepted" ? "Candidate accepted the interview invitation." : "Candidate declined the interview invitation.", interviewAt: application.interviewAt }); await createNotification({ userId: application.employerUserId, type: "interview_response", title: input.response === "accepted" ? "Candidate accepted interview" : "Candidate declined interview", message: `A candidate has ${input.response} your interview invitation.`, applicationId: input.applicationId, vacancyId: application.vacancyId }); return { ...application, interviewResponse: input.response }; }



export function hashInterviewAccessToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

export function isInterviewAccessTokenExpired(expiresAt: Date, now = new Date()) { return expiresAt.getTime() <= now.getTime(); }

export async function scheduleEmployerInterview(input: { applicationId: number; employerUserId: number; scheduledAt: Date; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); if (input.scheduledAt.getTime() <= Date.now()) throw new Error("Interview time must be in the future"); const rows = await db.select({ application: applications, vacancyTitle: vacancies.title, vacancyCompany: vacancies.company, seekerEmail: users.email, seekerPhone: users.phone, seekerName: users.name }).from(applications).innerJoin(vacancies, eq(vacancies.id, applications.vacancyId)).leftJoin(users, eq(users.id, applications.seekerUserId)).where(and(eq(applications.id, input.applicationId), eq(applications.employerUserId, input.employerUserId))).limit(1); const row = rows[0]; if (!row) throw new Error("Application not found or not owned by Employer"); if (!["shortlisted", "interview"].includes(row.application.status)) throw new Error("Only shortlisted candidates can be invited to an interview"); const inviteToken = randomBytes(32).toString("hex"); const accessTokenExpiresAt = new Date(input.scheduledAt.getTime() + 24 * 60 * 60 * 1000); const insertResult = await db.insert(interviewSessions).values({ applicationId: row.application.id, vacancyId: row.application.vacancyId, employerUserId: row.application.employerUserId, seekerUserId: row.application.seekerUserId, scheduledAt: input.scheduledAt, note: input.note?.trim() || null, provider: "pending", accessTokenHash: hashInterviewAccessToken(inviteToken), accessTokenExpiresAt, status: "scheduled", emailStatus: "not_attempted", smsStatus: "not_attempted" }); const sessionId = Number(insertResult[0].insertId); await db.update(applications).set({ status: "interview", interviewAt: input.scheduledAt, interviewNote: input.note?.trim() || null, interviewResponse: "pending" }).where(eq(applications.id, row.application.id)); const inviteUrl = new URL(`/interview-invite/${sessionId}?token=${encodeURIComponent(inviteToken)}`, ENV.appBaseUrl).toString(); const notificationId = await createNotification({ userId: row.application.seekerUserId, type: "interview_invitation", title: "Interview invitation received", message: `You have been invited to interview for ${row.vacancyTitle} at ${row.vacancyCompany}. Sign in to review the schedule and respond.`, applicationId: row.application.id, vacancyId: row.application.vacancyId }); const invitationEmail = buildInterviewInvitationEmail({ vacancyTitle: row.vacancyTitle, company: row.vacancyCompany, scheduledAt: input.scheduledAt, note: input.note, inviteUrl }); const emailResult = await sendPostmarkEmail({ to: row.seekerEmail ?? "", ...invitationEmail, idempotencyKey: `kazipoa-interview-invitation-${notificationId}` }); const smsResult = await sendSms({ to: row.seekerPhone, message: `${invitationEmail.text}`, idempotencyKey: `kazipoa-interview-sms-${notificationId}` }); await db.update(interviewSessions).set({ emailStatus: emailResult.status, smsStatus: smsResult.status }).where(eq(interviewSessions.id, sessionId)); const sessionRows = await db.select().from(interviewSessions).where(eq(interviewSessions.id, sessionId)).limit(1); return { session: sessionRows[0], inviteToken, emailStatus: emailResult.status, emailError: emailResult.status === "sent" ? null : emailResult.reason, smsStatus: smsResult.status, smsError: smsResult.status === "sent" ? null : smsResult.reason }; }

export async function listEmployerInterviewSessions(employerUserId: number) { const db = await getDb(); if (!db) return []; return db.select({ session: interviewSessions, application: applications, vacancyTitle: vacancies.title, vacancyCompany: vacancies.company, seekerName: users.name, seekerEmail: users.email }).from(interviewSessions).innerJoin(applications, eq(applications.id, interviewSessions.applicationId)).innerJoin(vacancies, eq(vacancies.id, interviewSessions.vacancyId)).leftJoin(users, eq(users.id, interviewSessions.seekerUserId)).where(eq(interviewSessions.employerUserId, employerUserId)).orderBy(desc(interviewSessions.scheduledAt)); }

export async function listSeekerInterviewSessions(seekerUserId: number) { const db = await getDb(); if (!db) return []; return db.select({ session: interviewSessions, application: applications, vacancyTitle: vacancies.title, vacancyCompany: vacancies.company }).from(interviewSessions).innerJoin(applications, eq(applications.id, interviewSessions.applicationId)).innerJoin(vacancies, eq(vacancies.id, interviewSessions.vacancyId)).where(eq(interviewSessions.seekerUserId, seekerUserId)).orderBy(desc(interviewSessions.scheduledAt)); }

export async function getInterviewSessionByToken(sessionId: number, token: string) { const db = await getDb(); if (!db) return null; const rows = await db.select({ session: interviewSessions, vacancyTitle: vacancies.title, vacancyCompany: vacancies.company }).from(interviewSessions).innerJoin(vacancies, eq(vacancies.id, interviewSessions.vacancyId)).where(eq(interviewSessions.id, sessionId)).limit(1); const row = rows[0]; const session = row?.session; if (!session || session.accessTokenHash !== hashInterviewAccessToken(token)) return null; if (isInterviewAccessTokenExpired(session.accessTokenExpiresAt)) { if (session.status === "scheduled") await db.update(interviewSessions).set({ status: "expired" }).where(eq(interviewSessions.id, session.id)); return null; } const { accessTokenHash: _accessTokenHash, ...safeSession } = session; return { ...safeSession, vacancyTitle: row.vacancyTitle, vacancyCompany: row.vacancyCompany }; }

export async function listAdminUsers(filters?: { search?: string; role?: "all" | "admin" | "user"; accountType?: "all" | "seeker" | "employer"; blocked?: "all" | "blocked" | "active" }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.search?.trim()) { const term = `%${filters.search.trim()}%`; conditions.push(or(like(users.name, term), like(users.email, term))); }
  if (filters?.role && filters.role !== "all") conditions.push(eq(users.role, filters.role));
  if (filters?.accountType && filters.accountType !== "all") conditions.push(eq(users.accountType, filters.accountType));
  if (filters?.blocked === "blocked") conditions.push(eq(users.isBlocked, true));
  if (filters?.blocked === "active") conditions.push(eq(users.isBlocked, false));
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, accountType: users.accountType, accountTypeLocked: users.accountTypeLocked, isBlocked: users.isBlocked, loginMethod: users.loginMethod, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(users.createdAt));
}

export async function getAdminUserMetrics() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, employers: 0, seekers: 0, admins: 0 };
  const [totalRows, employerRows, seekerRows, adminRows] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(users).where(and(eq(users.role, "user"), eq(users.accountType, "employer"))),
    db.select({ total: count() }).from(users).where(and(eq(users.role, "user"), eq(users.accountType, "seeker"))),
    db.select({ total: count() }).from(users).where(eq(users.role, "admin")),
  ]);
  return { totalUsers: Number(totalRows[0]?.total ?? 0), employers: Number(employerRows[0]?.total ?? 0), seekers: Number(seekerRows[0]?.total ?? 0), admins: Number(adminRows[0]?.total ?? 0) };
}


export async function setAdminUserRole(actorUserId: number, targetUserId: number, role: "admin" | "user") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (actorUserId === targetUserId) throw new Error("You cannot change your own Admin role");
  const target = await db.select({ id: users.id, role: users.role, email: users.email }).from(users).where(eq(users.id, targetUserId)).limit(1);
  if (!target[0]) throw new Error("User not found");
  if (target[0].role === role) return { userId: targetUserId, role };
  if (target[0].role === "admin" && role === "user") {
    const adminRows = await db.select({ total: count() }).from(users).where(and(eq(users.role, "admin"), eq(users.isBlocked, false)));
    if (Number(adminRows[0]?.total ?? 0) <= 1) throw new Error("At least one active Admin account must remain");
  }
  await db.update(users).set({ role }).where(eq(users.id, targetUserId));
  await db.insert(authEvents).values({ userId: targetUserId, eventType: role === "admin" ? "admin_role_granted" : "admin_role_revoked", success: true, metadata: JSON.stringify({ actorUserId, targetEmail: target[0].email }) });
  return { userId: targetUserId, role };
}

async function autoArchiveAdminNotifications() {
  const db = await getDb();
  if (!db) return;
  const settings = await getPlatformSettings();
  const days = Math.max(1, Math.min(365, Number(settings.notificationAutoArchiveDays) || 30));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const criteria = [isNull(notifications.archivedAt), lt(notifications.createdAt, cutoff)];
  if (settings.notificationAutoArchiveType === "admin_new_registration") criteria.push(eq(notifications.type, "admin_new_registration"));
  await db.update(notifications).set({ archivedAt: new Date(), readAt: new Date() }).where(and(...criteria));
}

export async function listAdminNotifications(adminUserId: number, input: { status?: "all" | "unread" | "read"; search?: string; archived?: boolean } = {}) {
  const db = await getDb();
  if (!db) return [];
  await autoArchiveAdminNotifications();
  const conditions = [eq(notifications.userId, adminUserId), eq(notifications.type, "admin_new_registration")];
  if (input.status === "unread") conditions.push(isNull(notifications.readAt));
  if (input.status === "read") conditions.push(isNotNull(notifications.readAt));
  if (input.search?.trim()) { const term = `%${input.search.trim()}%`; conditions.push(or(like(notifications.title, term), like(notifications.message, term))!); }
  if (input.archived) conditions.push(isNotNull(notifications.archivedAt)); else conditions.push(isNull(notifications.archivedAt));
  return db.select().from(notifications).where(and(...conditions)).orderBy(desc(notifications.createdAt)).limit(100);
}

export async function archiveAdminNotification(adminUserId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(notifications).set({ archivedAt: new Date(), readAt: new Date() }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, adminUserId), eq(notifications.type, "admin_new_registration")));
}

export async function restoreAdminNotification(adminUserId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(notifications).set({ archivedAt: null }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, adminUserId), eq(notifications.type, "admin_new_registration")));
}

export async function deleteAdminNotification(adminUserId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(notifications).where(and(eq(notifications.id, notificationId), eq(notifications.userId, adminUserId), eq(notifications.type, "admin_new_registration")));
}

export async function markAdminNotificationRead(adminUserId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, adminUserId), eq(notifications.type, "admin_new_registration"), isNull(notifications.archivedAt)));
}

export async function markAllAdminNotificationsRead(adminUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, adminUserId), eq(notifications.type, "admin_new_registration"), isNull(notifications.readAt)));
}

export async function setAdminUserBlocked(actorUserId: number, targetUserId: number, blocked: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (actorUserId === targetUserId) throw new Error("You cannot block your own Admin account");
  const target = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, targetUserId)).limit(1);
  if (!target[0]) throw new Error("User not found");
  if (target[0].role === "admin") throw new Error("Admin accounts cannot be blocked from this panel");
  await db.update(users).set({ isBlocked: blocked }).where(eq(users.id, targetUserId));
  await db.insert(authEvents).values({ userId: targetUserId, eventType: blocked ? "admin_blocked_user" : "admin_unblocked_user", success: true, metadata: JSON.stringify({ actorUserId }) });
  return { userId: targetUserId, isBlocked: blocked };
}

export async function deleteAdminUser(actorUserId: number, targetUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (actorUserId === targetUserId) throw new Error("You cannot delete your own Admin account");
  const target = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, targetUserId)).limit(1);
  if (!target[0]) throw new Error("User not found");
  if (target[0].role === "admin") throw new Error("Admin accounts cannot be deleted from this panel");
  const linkedCounts = await Promise.all([
    db.select({ total: count() }).from(authCredentials).where(eq(authCredentials.userId, targetUserId)),
    db.select({ total: count() }).from(authTokens).where(eq(authTokens.userId, targetUserId)),
    db.select({ total: count() }).from(authSessions).where(eq(authSessions.userId, targetUserId)),
    db.select({ total: count() }).from(authEvents).where(eq(authEvents.userId, targetUserId)),
    db.select({ total: count() }).from(employerProfiles).where(eq(employerProfiles.userId, targetUserId)),
    db.select({ total: count() }).from(employerSubscriptions).where(eq(employerSubscriptions.employerUserId, targetUserId)),
    db.select({ total: count() }).from(vacancies).where(eq(vacancies.employerUserId, targetUserId)),
    db.select({ total: count() }).from(applications).where(or(eq(applications.seekerUserId, targetUserId), eq(applications.employerUserId, targetUserId))),
    db.select({ total: count() }).from(notifications).where(eq(notifications.userId, targetUserId)),
    db.select({ total: count() }).from(supportTickets).where(eq(supportTickets.requesterUserId, targetUserId)),
    db.select({ total: count() }).from(seekerDocuments).where(eq(seekerDocuments.seekerUserId, targetUserId)),
    db.select({ total: count() }).from(seekerEducation).where(eq(seekerEducation.seekerUserId, targetUserId)),
    db.select({ total: count() }).from(seekerExperience).where(eq(seekerExperience.seekerUserId, targetUserId)),
    db.select({ total: count() }).from(seekerSkills).where(eq(seekerSkills.seekerUserId, targetUserId)),
    db.select({ total: count() }).from(seekerCertifications).where(eq(seekerCertifications.seekerUserId, targetUserId)),
    db.select({ total: count() }).from(savedVacancies).where(eq(savedVacancies.seekerUserId, targetUserId)),
  ]);
  const linkedRecords = linkedCounts.reduce((total, rows) => total + Number(rows[0]?.total ?? 0), 0);
  if (linkedRecords > 0) throw new Error("This account has linked records; block it instead of permanently deleting it");
  await db.insert(authEvents).values({ userId: targetUserId, eventType: "admin_deleted_user", success: true, metadata: JSON.stringify({ actorUserId }) });
  await db.delete(users).where(eq(users.id, targetUserId));
  return { userId: targetUserId, deleted: true };
}


export async function getAdminRegistrationTrends(months = 12) {
  const db = await getDb();
  if (!db) return [];
  const safeMonths = Math.min(24, Math.max(3, months));
  const rows = await db.select({ createdAt: users.createdAt, role: users.role, accountType: users.accountType }).from(users).orderBy(asc(users.createdAt));
  const now = new Date();
  const buckets = Array.from({ length: safeMonths }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (safeMonths - 1 - index), 1);
    return { month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, label: date.toLocaleDateString("en-TZ", { month: "short", year: "numeric" }), employers: 0, seekers: 0 };
  });
  const byMonth = new Map(buckets.map(bucket => [bucket.month, bucket]));
  for (const row of rows) {
    if (row.role === "admin") continue;
    const date = new Date(row.createdAt);
    const bucket = byMonth.get(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    if (!bucket) continue;
    if (row.accountType === "employer") bucket.employers += 1;
    else bucket.seekers += 1;
  }
  return buckets;
}


export async function listAdminRecentActivitiesPage(input: { search?: string; eventType?: string; startDate?: string; endDate?: string; sortBy?: "createdAt" | "eventType" | "userName"; sortDir?: "asc" | "desc"; page?: number; pageSize?: number } = {}) {
  const db = await getDb();
  if (!db) return { items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 };
  const pageSize = Math.min(50, Math.max(5, input.pageSize ?? 20));
  const page = Math.max(1, input.page ?? 1);
  const conditions = [];
  const search = input.search?.trim();
  if (search) { const term = `%${search}%`; conditions.push(or(like(authEvents.eventType, term), like(users.name, term), like(users.email, term))); }
  if (input.eventType && input.eventType !== "all") conditions.push(eq(authEvents.eventType, input.eventType));
  if (input.startDate) conditions.push(gte(authEvents.createdAt, new Date(`${input.startDate}T00:00:00.000Z`)));
  if (input.endDate) conditions.push(lte(authEvents.createdAt, new Date(`${input.endDate}T23:59:59.999Z`)));
  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, totalRows] = await Promise.all([
    db.select({ id: authEvents.id, eventType: authEvents.eventType, success: authEvents.success, createdAt: authEvents.createdAt, userId: authEvents.userId, userName: users.name, userEmail: users.email, profilePhotoUrl: users.profilePhotoUrl }).from(authEvents).leftJoin(users, eq(authEvents.userId, users.id)).where(where).orderBy((input.sortBy === "eventType" ? (input.sortDir === "asc" ? asc(authEvents.eventType) : desc(authEvents.eventType)) : input.sortBy === "userName" ? (input.sortDir === "asc" ? asc(users.name) : desc(users.name)) : (input.sortDir === "asc" ? asc(authEvents.createdAt) : desc(authEvents.createdAt)))).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: count() }).from(authEvents).leftJoin(users, eq(authEvents.userId, users.id)).where(where),
  ]);
  const total = Number(totalRows[0]?.total ?? 0);
  const items = rows.map(row => ({ ...row, label: row.eventType === "admin_deleted_user" ? "User account deleted" : row.eventType === "admin_blocked_user" ? "User account blocked" : row.eventType === "admin_unblocked_user" ? "User account unblocked" : row.eventType === "admin_role_granted" ? "Admin role granted" : row.eventType === "admin_role_revoked" ? "Admin role revoked" : row.eventType === "custom_register_success" ? "New account registered" : row.eventType === "oauth_login_success" ? "Google sign-in completed" : row.eventType.replaceAll("_", " ") }));
  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getAdminActivitySummary(range: "week" | "month" | "year" = "week") {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const days = range === "week" ? 7 : range === "month" ? 30 : 12;
  const since = new Date(now);
  if (range === "year") since.setMonth(now.getMonth() - 11); else since.setDate(now.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);
  const rows = await db.select({ createdAt: authEvents.createdAt }).from(authEvents).where(gte(authEvents.createdAt, since));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(since);
    if (range === "year") date.setMonth(since.getMonth() + index); else date.setDate(since.getDate() + index);
    const key = range === "year" ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : date.toISOString().slice(0, 10);
    const total = rows.filter(row => { const created = new Date(row.createdAt); const rowKey = range === "year" ? `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}` : created.toISOString().slice(0, 10); return rowKey === key; }).length;
    return { date: key, label: range === "year" ? date.toLocaleDateString("en-TZ", { month: "short" }) : date.toLocaleDateString("en-TZ", { weekday: "short" }), total };
  });
}

export async function getAdminActivityComparison(range: "week" | "month" | "year" = "week") {
  const current = await getAdminActivitySummary(range);
  const periodUnits = range === "week" ? 7 : range === "month" ? 30 : 12;
  const now = new Date();
  const currentStart = new Date(now);
  if (range === "year") currentStart.setMonth(now.getMonth() - 11); else currentStart.setDate(now.getDate() - (periodUnits - 1));
  currentStart.setHours(0, 0, 0, 0);
  const previousStart = new Date(currentStart);
  if (range === "year") previousStart.setMonth(currentStart.getMonth() - periodUnits); else previousStart.setDate(currentStart.getDate() - periodUnits);
  const previousRows = await (await getDb())?.select({ createdAt: authEvents.createdAt }).from(authEvents).where(and(gte(authEvents.createdAt, previousStart), lt(authEvents.createdAt, currentStart))) ?? [];
  const previous = Array.from({ length: periodUnits }, (_, index) => {
    const point = new Date(previousStart);
    if (range === "year") point.setMonth(previousStart.getMonth() + index); else point.setDate(previousStart.getDate() + index);
    const key = range === "year" ? `${point.getFullYear()}-${String(point.getMonth() + 1).padStart(2, "0")}` : point.toISOString().slice(0, 10);
    const total = previousRows.filter(row => { const created = new Date(row.createdAt); const rowKey = range === "year" ? `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}` : created.toISOString().slice(0, 10); return rowKey === key; }).length;
    return { date: key, label: range === "year" ? point.toLocaleDateString("en-TZ", { month: "short" }) : point.toLocaleDateString("en-TZ", { weekday: "short" }), total };
  });
  const currentTotal = current.reduce((sum, point) => sum + point.total, 0);
  const previousTotal = previous.reduce((sum, point) => sum + point.total, 0);
  return { current, previous, currentTotal, previousTotal, changePercent: previousTotal === 0 ? (currentTotal > 0 ? 100 : 0) : Math.round((currentTotal - previousTotal) / previousTotal * 100) };
}

export async function listAdminActivityEventsForExport(input: { search?: string; eventType?: string; startDate?: string; endDate?: string; sortBy?: "createdAt" | "eventType" | "userName"; sortDir?: "asc" | "desc" } = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (input.search?.trim()) { const term = `%${input.search.trim()}%`; conditions.push(or(like(authEvents.eventType, term), like(users.name, term), like(users.email, term))); }
  if (input.eventType && input.eventType !== "all") conditions.push(eq(authEvents.eventType, input.eventType));
  if (input.startDate) conditions.push(gte(authEvents.createdAt, new Date(`${input.startDate}T00:00:00.000Z`)));
  if (input.endDate) conditions.push(lte(authEvents.createdAt, new Date(`${input.endDate}T23:59:59.999Z`)));
  const order = input.sortBy === "eventType" ? (input.sortDir === "asc" ? asc(authEvents.eventType) : desc(authEvents.eventType)) : input.sortBy === "userName" ? (input.sortDir === "asc" ? asc(users.name) : desc(users.name)) : (input.sortDir === "asc" ? asc(authEvents.createdAt) : desc(authEvents.createdAt));
  const rows = await db.select({ id: authEvents.id, eventType: authEvents.eventType, success: authEvents.success, createdAt: authEvents.createdAt, userId: authEvents.userId, userName: users.name, userEmail: users.email }).from(authEvents).leftJoin(users, eq(authEvents.userId, users.id)).where(conditions.length ? and(...conditions) : undefined).orderBy(order).limit(5000);
  return rows.map(row => ({ ...row, label: row.eventType === "admin_deleted_user" ? "User account deleted" : row.eventType === "admin_blocked_user" ? "User account blocked" : row.eventType === "admin_unblocked_user" ? "User account unblocked" : row.eventType === "admin_role_granted" ? "Admin role granted" : row.eventType === "admin_role_revoked" ? "Admin role revoked" : row.eventType === "custom_register_success" ? "New account registered" : row.eventType === "oauth_login_success" ? "Google sign-in completed" : row.eventType.replaceAll("_", " ") }));
}

export async function getAdminActivityLastSevenDays() {
  const db = await getDb();
  if (!db) return [];
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);
  const rows = await db.select({ createdAt: authEvents.createdAt }).from(authEvents).where(gte(authEvents.createdAt, since));
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(since);
    day.setDate(since.getDate() + index);
    const key = day.toISOString().slice(0, 10);
    const total = rows.filter(row => new Date(row.createdAt).toISOString().slice(0, 10) === key).length;
    return { date: key, label: day.toLocaleDateString("en-TZ", { weekday: "short" }), total };
  });
}

export async function listAdminRecentActivities(input: { search?: string; eventType?: string; limit?: number } = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  const search = input.search?.trim();
  if (search) {
    const term = `%${search}%`;
    conditions.push(or(like(authEvents.eventType, term), like(users.name, term), like(users.email, term)));
  }
  if (input.eventType && input.eventType !== "all") conditions.push(eq(authEvents.eventType, input.eventType));
  const rows = await db.select({ id: authEvents.id, eventType: authEvents.eventType, success: authEvents.success, createdAt: authEvents.createdAt, userId: authEvents.userId, userName: users.name, userEmail: users.email }).from(authEvents).leftJoin(users, eq(authEvents.userId, users.id)).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(authEvents.createdAt)).limit(Math.min(100, Math.max(1, input.limit ?? 30)));
  return rows.map(row => ({ ...row, label: row.eventType === "admin_deleted_user" ? "User account deleted" : row.eventType === "admin_blocked_user" ? "User account blocked" : row.eventType === "admin_unblocked_user" ? "User account unblocked" : row.eventType === "admin_role_granted" ? "Admin role granted" : row.eventType === "admin_role_revoked" ? "Admin role revoked" : row.eventType === "custom_register_success" ? "New account registered" : row.eventType === "oauth_login_success" ? "Google sign-in completed" : row.eventType.replaceAll("_", " ") }));
}

export async function getAdminVacancyPaymentAnalytics() {
  const db = await getDb();
  const empty = { vacancies: { total: 0, live: 0, pending: 0, rejected: 0, urgent: 0 }, payments: { total: 0, successful: 0, pending: 0, failed: 0, refunded: 0, totalAmountTzs: 0, successfulAmountTzs: 0 }, monthly: [], source: "persisted database" as const };
  if (!db) return empty;
  const vacancyRows = await db.select({ status: vacancies.status, urgent: vacancies.urgent, createdAt: vacancies.createdAt }).from(vacancies);
  const paymentRows = await db.select({ state: payments.state, amountTzs: payments.amountTzs, createdAt: payments.createdAt }).from(payments);
  const vacancyCounts = { total: vacancyRows.length, live: 0, pending: 0, rejected: 0, urgent: vacancyRows.filter(row => row.urgent === 1).length };
  for (const row of vacancyRows) {
    const status = String(row.status);
    if (status === "live" || status === "approved") vacancyCounts.live += 1;
    else if (status === "rejected" || status === "changes_requested") vacancyCounts.rejected += 1;
    else vacancyCounts.pending += 1;
  }
  const paymentCounts = { total: paymentRows.length, successful: 0, pending: 0, failed: 0, refunded: 0, totalAmountTzs: paymentRows.reduce((sum, row) => sum + (row.amountTzs ?? 0), 0), successfulAmountTzs: 0 };
  for (const row of paymentRows) {
    const state = String(row.state);
    if (state === "successful") { paymentCounts.successful += 1; paymentCounts.successfulAmountTzs += row.amountTzs ?? 0; }
    else if (state === "pending" || state === "initiated") paymentCounts.pending += 1;
    else if (state === "refunded") paymentCounts.refunded += 1;
    else paymentCounts.failed += 1;
  }
  const now = new Date();
  const monthly = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - index), 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const vacancyTotal = vacancyRows.filter(row => { const created = new Date(row.createdAt); return `${created.getUTCFullYear()}-${String(created.getUTCMonth() + 1).padStart(2, "0")}` === key; }).length;
    const paymentTotal = paymentRows.filter(row => { const created = new Date(row.createdAt); return `${created.getUTCFullYear()}-${String(created.getUTCMonth() + 1).padStart(2, "0")}` === key; }).length;
    return { month: key, label: date.toLocaleDateString("en-TZ", { month: "short", year: "numeric" }), vacancies: vacancyTotal, payments: paymentTotal };
  });
  return { vacancies: vacancyCounts, payments: paymentCounts, monthly, source: "persisted database" as const };
}

export function decideExpiredVacancyCleanup(input: { applications: number; payments: number; views: number; saved: number; notifications: number; accessEvents: number }) {
  const hasProtectedHistory = Object.values(input).some(value => value > 0);
  return hasProtectedHistory ? "mark_expired" as const : "delete" as const;
}

export async function cleanupExpiredVacancies(now = new Date()) {
  const db = await getDb();
  if (!db) return { scanned: 0, deleted: 0, markedExpired: 0 };
  const candidates = await db.select({ id: vacancies.id, employerUserId: vacancies.employerUserId, title: vacancies.title, company: vacancies.company }).from(vacancies).where(and(or(eq(vacancies.status, "live"), eq(vacancies.status, "approved")), lte(vacancies.deadline, now)));
  let deleted = 0;
  let markedExpired = 0;
  for (const candidate of candidates) {
    const [applicationRows, paymentRows, viewRows, savedRows, notificationRows, accessEventRows] = await Promise.all([
      db.select({ total: count() }).from(applications).where(eq(applications.vacancyId, candidate.id)),
      db.select({ total: count() }).from(payments).where(eq(payments.vacancyId, candidate.id)),
      db.select({ total: count() }).from(vacancyViews).where(eq(vacancyViews.vacancyId, candidate.id)),
      db.select({ total: count() }).from(savedVacancies).where(eq(savedVacancies.vacancyId, candidate.id)),
      db.select({ total: count() }).from(notifications).where(eq(notifications.vacancyId, candidate.id)),
      db.select({ total: count() }).from(seekerAccessEvents).where(eq(seekerAccessEvents.vacancyId, candidate.id)),
    ]);
    const action = decideExpiredVacancyCleanup({ applications: Number(applicationRows[0]?.total ?? 0), payments: Number(paymentRows[0]?.total ?? 0), views: Number(viewRows[0]?.total ?? 0), saved: Number(savedRows[0]?.total ?? 0), notifications: Number(notificationRows[0]?.total ?? 0), accessEvents: Number(accessEventRows[0]?.total ?? 0) });
    if (action === "delete") {
      await db.delete(vacancies).where(and(eq(vacancies.id, candidate.id), lte(vacancies.deadline, now), or(eq(vacancies.status, "live"), eq(vacancies.status, "approved"))));
      try {
        await createNotification({ userId: candidate.employerUserId, type: "vacancy_auto_deleted", title: "Vacancy removed after deadline", message: `Your vacancy “${candidate.title}” for ${candidate.company} was automatically deleted after its deadline passed.` });
      } catch (notificationError) {
        console.error(`[Expiry cleanup] employer notification failed for vacancy ${candidate.id}`, notificationError);
      }
      deleted += 1;
    } else {
      await db.update(vacancies).set({ status: "expired", publicationStatus: "expired" }).where(and(eq(vacancies.id, candidate.id), lte(vacancies.deadline, now), or(eq(vacancies.status, "live"), eq(vacancies.status, "approved"))));
      markedExpired += 1;
    }
  }
  return { scanned: candidates.length, deleted, markedExpired };
}


export function shouldWarnSavedVacancyExpiry(deadline: Date, now = new Date(), windowMs = 24 * 60 * 60 * 1000) {
  const remaining = deadline.getTime() - now.getTime();
  return remaining > 0 && remaining <= windowMs;
}

export async function notifySavedVacanciesNearExpiry(now = new Date()) {
  const db = await getDb();
  if (!db) return { scanned: 0, notified: 0 };
  const warningWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const rows = await db.select({ seekerUserId: savedVacancies.seekerUserId, vacancyId: vacancies.id, title: vacancies.title, company: vacancies.company, deadline: vacancies.deadline }).from(savedVacancies).innerJoin(vacancies, eq(savedVacancies.vacancyId, vacancies.id)).where(and(eq(vacancies.status, "live"), gt(vacancies.deadline, now), lte(vacancies.deadline, warningWindow)));
  let notified = 0;
  for (const row of rows) {
    if (!shouldWarnSavedVacancyExpiry(new Date(row.deadline), now)) continue;
    const existing = await db.select({ id: notifications.id }).from(notifications).where(and(eq(notifications.userId, row.seekerUserId), eq(notifications.vacancyId, row.vacancyId), eq(notifications.type, "saved_vacancy_expiring"))).limit(1);
    if (existing[0]) continue;
    await createNotification({ userId: row.seekerUserId, vacancyId: row.vacancyId, type: "saved_vacancy_expiring", title: "Saved vacancy expires soon", message: `Your saved vacancy “${row.title}” at ${row.company} expires within 24 hours.` });
    notified += 1;
  }
  return { scanned: rows.length, notified };
}

export async function renewEmployerVacancy(input: { vacancyId: number; employerUserId: number; deadline: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (input.deadline.getTime() <= Date.now()) throw new Error("Renewal deadline must be in the future");
  const rows = await db.select().from(vacancies).where(and(eq(vacancies.id, input.vacancyId), eq(vacancies.employerUserId, input.employerUserId))).limit(1);
  const vacancy = rows[0];
  if (!vacancy) throw new Error("Vacancy not found");
  if (vacancy.status !== "expired") throw new Error("Only an expired vacancy can be renewed");
  await db.update(vacancies).set({ deadline: input.deadline, status: "submitted", publicationStatus: "renewal_pending" }).where(and(eq(vacancies.id, input.vacancyId), eq(vacancies.employerUserId, input.employerUserId), eq(vacancies.status, "expired")));
  return { vacancyId: input.vacancyId, status: "submitted" as const, deadline: input.deadline };
}

export async function listAdminActiveCandidates(input: { keyword?: string; status?: string } = {}) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    applicationId: applications.id,
    seekerUserId: applications.seekerUserId,
    seekerName: users.name,
    seekerEmail: applications.seekerEmail,
    profilePhotoUrl: users.profilePhotoUrl,
    vacancyId: applications.vacancyId,
    vacancyTitle: vacancies.title,
    vacancyCategory: vacancies.category,
    vacancyDeadline: vacancies.deadline,
    status: applications.status,
    appliedAt: applications.createdAt,
    interviewAt: applications.interviewAt,
    interviewResponse: applications.interviewResponse,
  }).from(applications)
    .leftJoin(users, eq(users.id, applications.seekerUserId))
    .leftJoin(vacancies, eq(vacancies.id, applications.vacancyId))
    .orderBy(desc(applications.createdAt));
  const keyword = input.keyword?.trim().toLowerCase();
  return rows.filter(row => {
    const searchable = [row.seekerName, row.seekerEmail, row.vacancyTitle, row.vacancyCategory].filter(Boolean).join(" ").toLowerCase();
    const matchesKeyword = !keyword || searchable.includes(keyword);
    const matchesStatus = !input.status || input.status === "all" || (input.status === "active" ? !["rejected", "hired"].includes(row.status) : input.status === "evaluated" ? ["shortlisted", "interview", "offered", "hired", "rejected"].includes(row.status) : row.status === input.status);
    return matchesKeyword && matchesStatus;
  });
}

export async function getAdminCandidateProfile(applicationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select({ application: applications, seeker: users, vacancy: vacancies })
    .from(applications)
    .innerJoin(users, eq(users.id, applications.seekerUserId))
    .leftJoin(vacancies, eq(vacancies.id, applications.vacancyId))
    .where(eq(applications.id, applicationId))
    .limit(1);
  return rows[0];
}

export async function listEmployerVacancies(employerUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vacancies).where(eq(vacancies.employerUserId, employerUserId)).orderBy(desc(vacancies.createdAt));
}

export async function updateEmployerVacancy(input: { vacancyId: number; employerUserId: number; company: string; title: string; category: string; location: string; contractType?: string; salary?: string | null; description: string; deadline: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const current = await db.select().from(vacancies).where(and(eq(vacancies.id, input.vacancyId), eq(vacancies.employerUserId, input.employerUserId))).limit(1);
  if (!current[0]) throw new Error("Vacancy not found or not owned by Employer");
  if (input.deadline.getTime() <= Date.now()) throw new Error("Choose a future deadline");
  const nextStatus = current[0].status === "live" ? "changes_requested" : ["rejected", "changes_requested"].includes(current[0].status) ? (current[0].paymentRequired ? "paid_pending_review" : "submitted") : current[0].status;
  await db.update(vacancies).set({ company: input.company, title: input.title, category: input.category, location: input.location, contractType: input.contractType ?? current[0].contractType, salary: input.salary?.trim() || null, description: input.description, deadline: input.deadline, status: nextStatus }).where(and(eq(vacancies.id, input.vacancyId), eq(vacancies.employerUserId, input.employerUserId)));
  const updated = await db.select().from(vacancies).where(eq(vacancies.id, input.vacancyId)).limit(1);
  return updated[0];
}

export async function deleteEmployerVacancy(input: { vacancyId: number; employerUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const current = await db.select({ id: vacancies.id }).from(vacancies).where(and(eq(vacancies.id, input.vacancyId), eq(vacancies.employerUserId, input.employerUserId))).limit(1);
  if (!current[0]) throw new Error("Vacancy not found or not owned by Employer");
  const linkedApplications = await db.select({ id: applications.id }).from(applications).where(eq(applications.vacancyId, input.vacancyId)).limit(1);
  if (linkedApplications.length) throw new Error("This vacancy has applications and cannot be permanently deleted. Use the vacancy status workflow instead.");
  const linkedPayments = await db.select({ id: payments.id }).from(payments).where(eq(payments.vacancyId, input.vacancyId)).limit(1);
  if (linkedPayments.length) throw new Error("This vacancy has payment records and cannot be permanently deleted. Contact support if it should be withdrawn.");
  await db.delete(savedVacancies).where(eq(savedVacancies.vacancyId, input.vacancyId));
  await db.delete(vacancyViews).where(eq(vacancyViews.vacancyId, input.vacancyId));
  await db.delete(notifications).where(eq(notifications.vacancyId, input.vacancyId));
  await db.delete(vacancies).where(and(eq(vacancies.id, input.vacancyId), eq(vacancies.employerUserId, input.employerUserId)));
  return { vacancyId: input.vacancyId, deleted: true };
}
