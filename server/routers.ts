import { COOKIE_NAME, CUSTOM_AUTH_COOKIE } from "@shared/const";
import { randomBytes } from "node:crypto";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { parse as parseCookieHeader } from "cookie";
import { sanitizeStorageFileName, storageGetSignedUrl, storagePut } from "./storage";
import { PLAN_LIMITS, canCreateVacancy, canManageCandidate, getVacancyPostingPolicy } from "./subscriptionLimits";
import { validateReceiptInput } from "./receiptValidation";
import { validateCvInput } from "./cvValidation";
import { validateProfilePhotoInput } from "./profilePhotoValidation";
import { validateCertificateInput } from "./certificateValidation";
import { z } from "zod";
import { extractSkillsFromCv } from "./cvAi";
import { validateEducationPeriod } from "./portfolioValidation";
import { canViewSeekerDocument } from "./cvAccess";
import { ENV } from "./_core/env";
import { getProviderReadiness, isProviderConfigured } from "./providerReadiness";
import { createMpesaPaymentIntent } from "./db";
import { createMpesaProviderReference, pendingMpesaInitiation } from "./mpesaContract";
import { TEST_VACANCY_BATCH_ID } from "../shared/testVacancy";
import { buildCustomAuthPasswordResetEmail, buildCustomAuthVerificationEmail, buildEmployerPaymentStatusEmail, buildEmployerSupportTicketUpdateEmail, buildSupportTicketAutoReplyEmail, buildSupportTicketEmail, sendPostmarkEmail } from "./postmarkEmail";
import { checkAuthRateLimit, consumeAuthToken, createAuthToken, createCustomSession, createOrAttachCredential, customAuthConfig, getAuthSubjectKey, getCredentialByEmail, getCredentialByUserId, hashCustomPassword, isCustomAuthEnabled, markCredentialVerified, normalizeEmail, recordAuthAttempt, recordAuthEvent, revokeAllCustomSessions, revokeCustomSession, updateCredentialPassword, validateCustomPassword, verifyCustomPassword } from "./customAuth";

const seekerProcedure = protectedProcedure.use(async ({ ctx, next }) => { if (await getAccountType(ctx.user.id) !== "seeker") throw new TRPCError({ code: "FORBIDDEN", message: "This feature is available only in the Job Seeker workspace" }); return next({ ctx }); });
const employerProcedure = protectedProcedure.use(async ({ ctx, next }) => { if (await getAccountType(ctx.user.id) !== "employer") throw new TRPCError({ code: "FORBIDDEN", message: "This feature is available only in the Employer workspace" }); return next({ ctx }); });
import { createEmployerSubscription, createEmployerVacancy, resubmitEmployerVacancy, getActiveSubscription, getEmployerProfile, upsertEmployerProfile, updateEmployerProfileImage, getEmployerUsage, getLatestSubscription, getMarketplaceMetrics, getPublicLiveVacancy, listLiveVacancies, listIndexableLiveVacancies, listSearchSuggestions, listSavedVacancies, listSavedVacanciesPage, listSavedVacancyIds, saveVacancy, updateSavedVacancyOrganization, removeSavedVacancy, getPaymentReceipt, listPaymentReviews, listPendingSubscriptions, listPendingVacancies, getAdminVacancyReview, listTestVacancies, getSeekerNotificationPreferences, deleteTestVacancyBatch, listEmployerApplications, listSeekerApplications, listSeekerApplicationHistory, listUserNotifications, getLatestSeekerCv, getSeekerCvById, listSeekerCvs, saveSeekerCv, getSeekerPortfolio, createSeekerEducation, deleteSeekerEducation, createSeekerExperience, deleteSeekerExperience, createSeekerSkill, deleteSeekerSkill, createSeekerCertification, updateSeekerCertification, deleteSeekerCertification, createApplication, createSupportTicket, getAccountType, getPlatformSettings, savePlatformSettings, listEmployerPayments, listSupportTickets, listUserSupportTickets, replyToSupportTicket, setAccountType, updateSupportTicket, verifyEmployerVacancies, saveSeekerNotificationPreferences, saveVacancyAlertPreferences, markAllNotificationsRead, markNotificationRead, moderateSubscription, moderateVacancy, recordPayment, requestEmployerSubscription, updateApplicationStatus, respondToInterview, updatePaymentState, setVacancyUrgency, renewEmployerVacancy, upsertUser, getUserById, updateUserPhone, scheduleEmployerInterview, listEmployerInterviewSessions, listSeekerInterviewSessions, getInterviewSessionByToken, recordVacancyView, getEmployerVacancyMetrics, listEmployerVacancies, updateEmployerVacancy, deleteEmployerVacancy, updateUserProfilePhoto, getEmployerCandidateDocument, getEmployerCandidateProfile, recordSeekerAccessEvent, getEmployerApplicationTrend, listAdminUsers, getAdminUserMetrics, getAdminRegistrationTrends, listAdminRecentActivities, listAdminRecentActivitiesPage, getAdminActivityLastSevenDays, getAdminActivitySummary, getAdminActivityComparison, getAdminVacancyPaymentAnalytics, listAdminActivityEventsForExport, setAdminUserBlocked, deleteAdminUser, setAdminUserRole, listAdminActiveCandidates, getAdminCandidateProfile, listAdminNotifications, archiveAdminNotification, restoreAdminNotification, deleteAdminNotification, markAdminNotificationRead, markAllAdminNotificationsRead, notifyAdminsOfNewRegistration } from "./db";

export const appRouter = router({
  interviewInvite: publicProcedure.input(z.object({ sessionId: z.number().int().positive(), token: z.string().regex(/^[a-f0-9]{64}$/) })).query(async ({ input }) => {
    const session = await getInterviewSessionByToken(input.sessionId, input.token);
    if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "This interview invitation is invalid or expired" });
    return session;
  }),
  marketplace: router({
    metrics: publicProcedure.query(() => getMarketplaceMetrics()),
    liveVacancies: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(50).default(24), keyword: z.string().trim().max(120).optional(), location: z.string().trim().max(120).optional(), category: z.string().trim().max(120).optional(), contractType: z.string().trim().max(40).optional(), salaryRange: z.enum(["All salary ranges", "Not disclosed", "Under TZS 500,000", "TZS 500,000–1,000,000", "TZS 1,000,000–2,000,000", "Above TZS 2,000,000"]).optional(), sort: z.enum(["relevance", "newest", "deadline"]).default("newest") }).optional()).query(({ input }) => listLiveVacancies(input ?? {})),
    recordView: protectedProcedure.input(z.object({ vacancyId: z.number().int().positive() })).mutation(({ ctx, input }) => recordVacancyView(input.vacancyId, ctx.user.id)),
    suggestions: publicProcedure.input(z.object({ query: z.string().trim().max(80), limit: z.number().int().min(1).max(12).default(8) })).query(({ input }) => listSearchSuggestions(input.query, input.limit)),
    indexableVacancies: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(200).default(200) }).optional()).query(({ input }) => listIndexableLiveVacancies(input?.limit ?? 200)),
    vacancy: publicProcedure.input(z.object({ vacancyId: z.number().int().positive() })).query(async ({ input }) => { const vacancy = await getPublicLiveVacancy(input.vacancyId); if (!vacancy) throw new TRPCError({ code: "NOT_FOUND", message: "Vacancy not found or no longer live" }); return vacancy; }),
  }),
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    accountRole: protectedProcedure.query(async ({ ctx }) => ctx.user.role === "admin" ? "admin" : getAccountType(ctx.user.id)),
    updatePhone: protectedProcedure.input(z.object({ phone: z.string().trim().max(40).nullable() })).mutation(async ({ ctx, input }) => {
      try {
        return await updateUserPhone(ctx.user.id, input.phone);
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to update phone number" });
      }
    }),
    setAccountType: protectedProcedure.input(z.object({ accountType: z.enum(["seeker", "employer"]) })).mutation(({ ctx, input }) => setAccountType(ctx.user.id, input.accountType)),
    customStatus: publicProcedure.query(() => ({ enabled: isCustomAuthEnabled() })),
    emailVerificationStatus: protectedProcedure.query(async ({ ctx }) => {
      const credential = await getCredentialByUserId(ctx.user.id);
      if (!credential) return { hasCredential: false, verified: true } as const;
      return { hasCredential: true, verified: Boolean(credential.emailVerifiedAt), email: credential.emailNormalized } as const;
    }),
    customRegister: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(180), email: z.string().email().max(320), password: z.string().min(1).max(128), accountType: z.enum(["seeker", "employer"]) })).mutation(async ({ ctx, input }) => {
      if (!isCustomAuthEnabled()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Custom sign-in pilot is not enabled" });
      const passwordError = validateCustomPassword(input.password);
      if (passwordError) throw new TRPCError({ code: "BAD_REQUEST", message: passwordError });
      const email = normalizeEmail(input.email);
      const subjectKey = getAuthSubjectKey(email, ctx.req);
      const limit = await checkAuthRateLimit(subjectKey);
      if (!limit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." });
      try {
        const passwordHash = await hashCustomPassword(input.password);
        const user = await createOrAttachCredential({ name: input.name, email, passwordHash, accountType: input.accountType });
        await notifyAdminsOfNewRegistration({ userId: user.id, name: user.name, email, accountType: input.accountType });
        const token = await createAuthToken(user.id, "email_verification", new Date(Date.now() + customAuthConfig.emailVerificationTtlMs));
        const emailContent = buildCustomAuthVerificationEmail({ name: user.name ?? input.name, token });
        const delivery = await sendPostmarkEmail({ to: email, ...emailContent, idempotencyKey: `kazipoa-auth-verify-${user.id}-${token.slice(0, 12)}` });
        await recordAuthAttempt(subjectKey, true);
        await recordAuthEvent({ userId: user.id, eventType: "register", success: true, req: ctx.req, metadata: { emailDelivery: delivery.status } });
        return { success: true, requiresEmailVerification: true, emailDelivery: delivery.status } as const;
      } catch (error) {
        await recordAuthAttempt(subjectKey, false);
        await recordAuthEvent({ eventType: "register", success: false, req: ctx.req });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to create this account" });
      }
    }),
    customLogin: publicProcedure.input(z.object({ email: z.string().email().max(320), password: z.string().min(1).max(128), rememberMe: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      if (!isCustomAuthEnabled()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Custom sign-in pilot is not enabled" });
      const email = normalizeEmail(input.email);
      const subjectKey = getAuthSubjectKey(email, ctx.req);
      const limit = await checkAuthRateLimit(subjectKey);
      if (!limit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." });
      const credential = await getCredentialByEmail(email);
      const valid = credential ? await verifyCustomPassword(input.password, credential.passwordHash) : false;
      if (!credential || !valid) {
        await recordAuthAttempt(subjectKey, false);
        await recordAuthEvent({ eventType: "login", success: false, req: ctx.req });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect" });
      }
      const user = await getUserById(credential.userId);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect" });
      const session = await createCustomSession(user.id, input.rememberMe);
      await upsertUser({ openId: user.openId, lastSignedIn: new Date() });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(CUSTOM_AUTH_COOKIE, session.token, { ...cookieOptions, maxAge: session.expiresAt.getTime() - Date.now() });
      await recordAuthAttempt(subjectKey, true);
      await recordAuthEvent({ userId: user.id, eventType: "login", success: true, req: ctx.req });
      return { success: true, user, emailVerified: Boolean(credential.emailVerifiedAt) } as const;
    }),
    verifyEmail: publicProcedure.input(z.object({ token: z.string().min(20).max(200) })).mutation(async ({ ctx, input }) => {
      if (!isCustomAuthEnabled()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Custom sign-in pilot is not enabled" });
      const token = await consumeAuthToken(input.token, "email_verification");
      if (!token) throw new TRPCError({ code: "BAD_REQUEST", message: "This verification link is invalid or expired" });
      await markCredentialVerified(token.userId);
      const user = await getUserById(token.userId);
      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "This verification link is invalid or expired" });
      const session = await createCustomSession(user.id, false);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(CUSTOM_AUTH_COOKIE, session.token, { ...cookieOptions, maxAge: session.expiresAt.getTime() - Date.now() });
      await upsertUser({ openId: user.openId, lastSignedIn: new Date() });
      await recordAuthEvent({ userId: token.userId, eventType: "verify_email", success: true, req: ctx.req });
      return { success: true, authenticated: true } as const;
    }),
    resendVerification: publicProcedure.input(z.object({ email: z.string().email().max(320) })).mutation(async ({ ctx, input }) => {
      if (!isCustomAuthEnabled()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Custom sign-in pilot is not enabled" });
      const email = normalizeEmail(input.email);
      const subjectKey = getAuthSubjectKey(email, ctx.req);
      const limit = await checkAuthRateLimit(subjectKey);
      if (!limit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." });
      const credential = await getCredentialByEmail(email);
      if (!credential || credential.emailVerifiedAt) {
        await recordAuthAttempt(subjectKey, true);
        return { success: true, emailDelivery: "skipped", message: "If this account needs verification, a new email will be sent." } as const;
      }
      const user = await getUserById(credential.userId);
      if (!user) {
        await recordAuthAttempt(subjectKey, true);
        return { success: true, emailDelivery: "skipped", message: "If this account needs verification, a new email will be sent." } as const;
      }
      const token = await createAuthToken(user.id, "email_verification", new Date(Date.now() + customAuthConfig.emailVerificationTtlMs));
      const emailContent = buildCustomAuthVerificationEmail({ name: user.name ?? "there", token });
      const delivery = await sendPostmarkEmail({ to: email, ...emailContent, idempotencyKey: `kazipoa-auth-verify-resend-${user.id}-${token.slice(0, 12)}` });
      await recordAuthAttempt(subjectKey, true);
      await recordAuthEvent({ userId: user.id, eventType: "verification_resend", success: delivery.status === "sent", req: ctx.req, metadata: { emailDelivery: delivery.status } });
      return {
        success: delivery.status === "sent",
        emailDelivery: delivery.status,
        message: delivery.status === "sent"
          ? "A new verification email has been sent. Check your inbox and spam folder."
          : "We could not send the verification email yet. Please contact Kazipoa support while the email provider is being activated.",
      } as const;
    }),
    requestPasswordReset: publicProcedure.input(z.object({ email: z.string().email().max(320) })).mutation(async ({ ctx, input }) => {
      if (!isCustomAuthEnabled()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Custom sign-in pilot is not enabled" });
      const email = normalizeEmail(input.email);
      const subjectKey = getAuthSubjectKey(email, ctx.req);
      const limit = await checkAuthRateLimit(subjectKey);
      if (!limit.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." });
      const credential = await getCredentialByEmail(email);
      if (credential?.emailVerifiedAt) {
        const user = await getUserById(credential.userId);
        if (user) {
          const token = await createAuthToken(user.id, "password_reset", new Date(Date.now() + customAuthConfig.passwordResetTtlMs));
          const emailContent = buildCustomAuthPasswordResetEmail({ name: user.name ?? "there", token });
          await sendPostmarkEmail({ to: email, ...emailContent, idempotencyKey: `kazipoa-auth-reset-${user.id}-${token.slice(0, 12)}` });
          await recordAuthEvent({ userId: user.id, eventType: "password_reset_requested", success: true, req: ctx.req });
        }
      }
      await recordAuthAttempt(subjectKey, true);
      return { success: true, message: "If an account exists for that email, a reset link will be sent." } as const;
    }),
    resetPassword: publicProcedure.input(z.object({ token: z.string().min(20).max(200), password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      if (!isCustomAuthEnabled()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Custom sign-in pilot is not enabled" });
      const passwordError = validateCustomPassword(input.password);
      if (passwordError) throw new TRPCError({ code: "BAD_REQUEST", message: passwordError });
      const token = await consumeAuthToken(input.token, "password_reset");
      if (!token) throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link is invalid or expired" });
      await updateCredentialPassword(token.userId, await hashCustomPassword(input.password));
      await revokeAllCustomSessions(token.userId);
      await recordAuthEvent({ userId: token.userId, eventType: "password_reset_completed", success: true, req: ctx.req });
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      const cookies = parseCookieHeader(ctx.req.headers.cookie ?? "");
      await revokeCustomSession(cookies[CUSTOM_AUTH_COOKIE]);
      ctx.res.clearCookie(CUSTOM_AUTH_COOKIE, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  vacancies: router({
    adminQueue: adminProcedure.query(() => listPendingVacancies()),
    detail: adminProcedure.input(z.object({ vacancyId: z.number().int().positive() })).query(({ input }) => getAdminVacancyReview(input.vacancyId)),
    moderate: adminProcedure.input(z.object({ vacancyId: z.number(), action: z.enum(["approve", "reject", "request_changes"]), reason: z.string().optional() }).refine(value => !["reject", "request_changes"].includes(value.action) || Boolean(value.reason?.trim()), { message: "A moderation reason is required", path: ["reason"] })).mutation(({ ctx, input }) => moderateVacancy({ ...input, adminUserId: ctx.user.id })),
    verifyEmployer: adminProcedure.input(z.object({ employerUserId: z.number().int().positive() })).mutation(({ ctx, input }) => verifyEmployerVacancies(input.employerUserId, ctx.user.id)),
    setUrgency: adminProcedure.input(z.object({ vacancyId: z.number().int().positive(), urgent: z.boolean() })).mutation(({ input }) => setVacancyUrgency(input.vacancyId, input.urgent)),
    testBatch: adminProcedure.input(z.object({ batchId: z.literal(TEST_VACANCY_BATCH_ID) }).optional()).query(({ input }) => listTestVacancies(input?.batchId ?? TEST_VACANCY_BATCH_ID)),
    deleteTestBatch: adminProcedure.input(z.object({ batchId: z.literal(TEST_VACANCY_BATCH_ID), confirmation: z.literal("DELETE_TEST_BATCH") })).mutation(({ ctx, input }) => deleteTestVacancyBatch(input.batchId, ctx.user.id)),
  }),
  interviews: router({
    employerList: employerProcedure.query(({ ctx }) => listEmployerInterviewSessions(ctx.user.id)),
    seekerList: seekerProcedure.query(({ ctx }) => listSeekerInterviewSessions(ctx.user.id)),
    schedule: employerProcedure.input(z.object({ applicationId: z.number().int().positive(), scheduledAt: z.coerce.date(), note: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      try {
        return await scheduleEmployerInterview({ applicationId: input.applicationId, employerUserId: ctx.user.id, scheduledAt: input.scheduledAt, note: input.note });
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to schedule interview" });
      }
    }),
  }),
  payments: router({
    initiateMpesa: employerProcedure.input(z.object({ vacancyId: z.number().int().positive(), amountTzs: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const providerReference = createMpesaProviderReference(input.vacancyId, randomBytes(16).toString("hex")); const payment = await createMpesaPaymentIntent({ vacancyId: input.vacancyId, employerUserId: ctx.user.id, amountTzs: input.amountTzs, providerReference }); if (!payment) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not create the M-Pesa payment intent" }); return pendingMpesaInitiation(payment.id, payment.providerReference ?? providerReference, isProviderConfigured("mpesa")); }),
    adminReviews: adminProcedure.query(() => listPaymentReviews()),
    adminReceipt: adminProcedure.input(z.object({ paymentId: z.number() })).query(async ({ input }) => { const payment = await getPaymentReceipt(input.paymentId); if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" }); return { paymentId: payment.id, receiptUrl: payment.receiptUrl, receiptName: payment.receiptName, receiptMimeType: payment.receiptMimeType, providerReference: payment.providerReference, amountTzs: payment.amountTzs }; }),
    createManual: protectedProcedure.input(z.object({ vacancyId: z.number(), method: z.string(), provider: z.string(), amountTzs: z.number().int().positive(), providerReference: z.string().min(3), evidenceNote: z.string().optional(), receiptBase64: z.string().max(7_000_000).optional(), receiptName: z.string().max(180).optional(), receiptMimeType: z.enum(["image/jpeg", "image/png", "application/pdf"]).optional() })).mutation(async ({ ctx, input }) => { let receipt; if (input.receiptBase64) { try { const validated = validateReceiptInput({ base64: input.receiptBase64, name: input.receiptName, mimeType: input.receiptMimeType }); if (validated.hasReceipt) receipt = await storagePut(`receipts/${ctx.user.id}/${Date.now()}-${sanitizeStorageFileName(input.receiptName ?? "receipt")}`, validated.bytes, input.receiptMimeType); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Invalid receipt" }); } } return recordPayment({ ...input, employerUserId: ctx.user.id, receiptKey: receipt?.key, receiptUrl: receipt?.url }); }),
    updateState: adminProcedure.input(z.object({ paymentId: z.number(), state: z.enum(["successful", "failed", "cancelled", "refunded"]), providerReference: z.string().optional(), adminNote: z.string().max(2000).optional() })).mutation(async ({ input }) => { const payment = await getPaymentReceipt(input.paymentId); if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" }); await updatePaymentState(input.paymentId, input.state, input.providerReference, input.adminNote); return { ...payment, state: input.state, providerReference: input.providerReference ?? payment.providerReference, adminNote: input.adminNote ?? null }; }),
  }),
  admin: router({
    users: adminProcedure.input(z.object({ search: z.string().optional(), role: z.enum(["all", "admin", "user"]).default("all"), accountType: z.enum(["all", "seeker", "employer"]).default("all"), blocked: z.enum(["all", "blocked", "active"]).default("all") }).optional()).query(({ input }) => listAdminUsers(input)),
    userMetrics: adminProcedure.query(() => getAdminUserMetrics()),
    recentActivities: adminProcedure.input(z.object({ search: z.string().trim().max(120).optional(), eventType: z.string().trim().max(80).optional(), startDate: z.string().date().optional(), endDate: z.string().date().optional(), sortBy: z.enum(["createdAt", "eventType", "userName"]).default("createdAt"), sortDir: z.enum(["asc", "desc"]).default("desc"), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(5).max(50).default(20) }).optional()).query(({ input }) => listAdminRecentActivitiesPage(input ?? {})),
    registrationTrends: adminProcedure.query(() => getAdminRegistrationTrends(12)),
    vacancyPaymentAnalytics: adminProcedure.query(() => getAdminVacancyPaymentAnalytics()),
    activityLastSevenDays: adminProcedure.input(z.object({ range: z.enum(["week", "month", "year"]).default("week") }).optional()).query(({ input }) => getAdminActivitySummary(input?.range ?? "week")),
    activityComparison: adminProcedure.input(z.object({ range: z.enum(["week", "month", "year"]).default("week") }).optional()).query(({ input }) => getAdminActivityComparison(input?.range ?? "week")),
    activityEventsForExport: adminProcedure.input(z.object({ search: z.string().trim().max(120).optional(), eventType: z.string().trim().max(80).optional(), startDate: z.string().date().optional(), endDate: z.string().date().optional(), sortBy: z.enum(["createdAt", "eventType", "userName"]).default("createdAt"), sortDir: z.enum(["asc", "desc"]).default("desc") }).optional()).query(({ input }) => listAdminActivityEventsForExport(input ?? {})),
    activeCandidates: adminProcedure.input(z.object({ keyword: z.string().trim().max(120).optional(), status: z.enum(["all", "active", "evaluated", "applied", "reviewing", "shortlisted", "interview", "offered", "hired", "rejected"]).default("all") }).optional()).query(({ input }) => listAdminActiveCandidates(input ?? {})),
    candidateDetail: adminProcedure.input(z.object({ applicationId: z.number().int().positive() })).query(({ input }) => getAdminCandidateProfile(input.applicationId)),
    notifications: adminProcedure.input(z.object({ status: z.enum(["all", "unread", "read"]).default("all"), search: z.string().trim().max(120).optional(), archived: z.boolean().default(false) }).optional()).query(({ ctx, input }) => listAdminNotifications(ctx.user.id, input ?? {})),
    markNotificationRead: adminProcedure.input(z.object({ notificationId: z.number().int().positive() })).mutation(({ ctx, input }) => markAdminNotificationRead(ctx.user.id, input.notificationId)),
    archiveNotification: adminProcedure.input(z.object({ notificationId: z.number().int().positive() })).mutation(({ ctx, input }) => archiveAdminNotification(ctx.user.id, input.notificationId)),
    restoreNotification: adminProcedure.input(z.object({ notificationId: z.number().int().positive() })).mutation(({ ctx, input }) => restoreAdminNotification(ctx.user.id, input.notificationId)),
    deleteNotification: adminProcedure.input(z.object({ notificationId: z.number().int().positive() })).mutation(({ ctx, input }) => deleteAdminNotification(ctx.user.id, input.notificationId)),
    markAllNotificationsRead: adminProcedure.mutation(({ ctx }) => markAllAdminNotificationsRead(ctx.user.id)),
    setUserRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), role: z.enum(["admin", "user"]), confirmation: z.literal("CHANGE_ROLE") })).mutation(({ ctx, input }) => setAdminUserRole(ctx.user.id, input.userId, input.role)),
    setUserBlocked: adminProcedure.input(z.object({ userId: z.number().int().positive(), blocked: z.boolean() })).mutation(({ ctx, input }) => setAdminUserBlocked(ctx.user.id, input.userId, input.blocked)),
    deleteUser: adminProcedure.input(z.object({ userId: z.number().int().positive(), confirmation: z.literal("DELETE_USER") })).mutation(({ ctx, input }) => deleteAdminUser(ctx.user.id, input.userId)),
    settings: adminProcedure.query(() => getPlatformSettings()),
    providerReadiness: adminProcedure.query(() => getProviderReadiness()),
    saveSettings: adminProcedure.input(z.object({ categories: z.string().trim().min(2).max(5000), regions: z.string().trim().min(2).max(5000), supportPhoneNumbers: z.string().trim().min(5).max(300), publicationReviewHours: z.string().trim().min(2).max(300), seekerStatusEmailNotifications: z.enum(["enabled", "disabled"]), employerStatusEmailNotifications: z.enum(["enabled", "disabled"]), notificationAutoArchiveType: z.enum(["admin_new_registration", "all_admin_notifications"]), notificationAutoArchiveDays: z.coerce.number().int().min(1).max(365).transform(String) })).mutation(({ ctx, input }) => savePlatformSettings(input, ctx.user.id)),
  }),
  support: router({
    create: publicProcedure.input(z.object({ ticketReference: z.string().regex(/^KZP-[A-Z0-9]+$/), requesterName: z.string().trim().min(2).max(180), requesterEmail: z.string().email().max(320), message: z.string().trim().min(10).max(5000), attachmentBase64: z.string().max(7_000_000).optional(), attachmentName: z.string().max(180).optional(), attachmentMimeType: z.string().max(120).optional() })).mutation(async ({ ctx, input }) => { let attachment; if (input.attachmentBase64) { try { const validated = validateReceiptInput({ base64: input.attachmentBase64, name: input.attachmentName, mimeType: input.attachmentMimeType }); if (validated.hasReceipt) { const stored = await storagePut(`support/${ctx.user?.id ?? "guest"}/${Date.now()}-${sanitizeStorageFileName(input.attachmentName ?? "attachment")}`, validated.bytes, input.attachmentMimeType); attachment = { ...stored, size: validated.bytes.byteLength }; } } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Invalid support attachment" }); } } const ticket = await createSupportTicket({ ticketReference: input.ticketReference, requesterUserId: ctx.user?.id, requesterName: input.requesterName, requesterEmail: input.requesterEmail, message: input.message, attachmentKey: attachment?.key, attachmentUrl: attachment?.url, attachmentName: input.attachmentName, attachmentMimeType: input.attachmentMimeType, attachmentSize: attachment?.size }); const email = buildSupportTicketEmail(input); const delivery = await sendPostmarkEmail({ to: ENV.postmarkFromEmail, ...email, idempotencyKey: `kazipoa-support-${ticket.id}` }); const autoReply = buildSupportTicketAutoReplyEmail({ ticketReference: ticket.ticketReference, requesterName: input.requesterName }); const autoReplyDelivery = await sendPostmarkEmail({ to: input.requesterEmail, ...autoReply, idempotencyKey: `kazipoa-support-auto-reply-${ticket.id}` }); return { ticketReference: ticket.ticketReference, status: ticket.status, emailStatus: delivery.status, autoReplyStatus: autoReplyDelivery.status }; }),
    mine: protectedProcedure.query(({ ctx }) => listUserSupportTickets(ctx.user.id)),
    reply: protectedProcedure.input(z.object({ ticketId: z.number().int().positive(), message: z.string().trim().min(2).max(5000), attachmentBase64: z.string().max(7_000_000).optional(), attachmentName: z.string().max(180).optional(), attachmentMimeType: z.string().max(120).optional() })).mutation(async ({ ctx, input }) => { let attachment; if (input.attachmentBase64) { try { const validated = validateReceiptInput({ base64: input.attachmentBase64, name: input.attachmentName, mimeType: input.attachmentMimeType }); if (validated.hasReceipt) { const stored = await storagePut(`support/${ctx.user.id}/${Date.now()}-${sanitizeStorageFileName(input.attachmentName ?? "reply-attachment")}`, validated.bytes, input.attachmentMimeType); attachment = { ...stored, size: validated.bytes.byteLength }; } } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Invalid support attachment" }); } } return replyToSupportTicket(input.ticketId, ctx.user.id, input.message, attachment ? { key: attachment.key, url: attachment.url, name: input.attachmentName ?? "Attachment", mimeType: input.attachmentMimeType ?? "application/octet-stream", size: attachment.size } : undefined); }),
    adminQueue: adminProcedure.input(z.object({ status: z.enum(["all", "open", "in_progress", "resolved"]).default("all"), sort: z.enum(["priority", "newest"]).default("priority") }).optional()).query(({ input }) => listSupportTickets(input?.status === "all" ? undefined : input?.status, input?.sort ?? "priority")),
    adminUpdate: adminProcedure.input(z.object({ ticketId: z.number().int().positive(), status: z.enum(["open", "in_progress", "resolved"]), priority: z.enum(["low", "normal", "high", "urgent"]), adminNote: z.string().max(2000).optional() })).mutation(async ({ input }) => { const ticket = await updateSupportTicket(input.ticketId, input.status, input.priority, input.adminNote); if (ticket?.requesterEmail) { const email = buildEmployerSupportTicketUpdateEmail({ ticketReference: ticket.ticketReference, status: ticket.status, priority: ticket.priority, adminNote: ticket.adminNote }); await sendPostmarkEmail({ to: ticket.requesterEmail, ...email, idempotencyKey: `kazipoa-ticket-status-${ticket.id}-${ticket.status}-${Date.now()}` }); } return ticket; }),
  }),

  seeker: router({
    applications: seekerProcedure.query(({ ctx }) => listSeekerApplications(ctx.user.id)),
    interviewSessions: seekerProcedure.query(({ ctx }) => listSeekerInterviewSessions(ctx.user.id)),
    submitApplication: seekerProcedure.input(z.object({ vacancyId: z.number().int().positive(), cvDocumentId: z.number().int().positive(), coverNote: z.string().max(3000).optional() })).mutation(({ ctx, input }) => createApplication({ vacancyId: input.vacancyId, seekerUserId: ctx.user.id, seekerEmail: ctx.user.email ?? undefined, cvDocumentId: input.cvDocumentId, coverNote: input.coverNote })),
    cv: seekerProcedure.query(async ({ ctx }) => { const cv = await getLatestSeekerCv(ctx.user.id); if (!cv || !canViewSeekerDocument(cv.seekerUserId, ctx.user.id)) return null; return { ...cv, storageUrl: `/api/seeker/cv/${cv.id}/preview`, requiresReupload: /\s/.test(cv.storageKey) }; }),
    profilePhoto: seekerProcedure.query(({ ctx }) => getUserById(ctx.user.id).then(user => user?.profilePhotoKey ? { storageUrl: `/api/seeker/profile-photo/preview`, mimeType: user.profilePhotoMimeType, fileSize: user.profilePhotoSize } : null)),
    uploadProfilePhoto: seekerProcedure.input(z.object({ base64: z.string().max(8_000_000), fileName: z.string().min(1).max(180), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]) })).mutation(async ({ ctx, input }) => { try { const validated = validateProfilePhotoInput({ base64: input.base64, name: input.fileName, mimeType: input.mimeType }); const uploaded = await storagePut(`profile-photos/${ctx.user.id}/${Date.now()}-${sanitizeStorageFileName(input.fileName)}`, validated.bytes, input.mimeType); const user = await updateUserProfilePhoto(ctx.user.id, { profilePhotoKey: uploaded.key, profilePhotoUrl: uploaded.url, profilePhotoMimeType: input.mimeType, profilePhotoSize: validated.size }); return { success: true, storageUrl: `/api/seeker/profile-photo/preview`, mimeType: input.mimeType, fileSize: validated.size, user }; } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Profile photo upload failed" }); } }),
    portfolio: seekerProcedure.query(({ ctx }) => getSeekerPortfolio(ctx.user.id)),
    addEducation: seekerProcedure.input(z.object({ institution: z.string().trim().min(2).max(180), qualification: z.string().trim().min(2).max(180), fieldOfStudy: z.string().trim().max(180).optional(), startYear: z.number().int().min(1950).max(2100).optional(), endYear: z.number().int().min(1950).max(2100).optional(), currentlyStudying: z.boolean().default(false), description: z.string().trim().max(2000).optional() })).mutation(({ ctx, input }) => { validateEducationPeriod(input.startYear, input.endYear, input.currentlyStudying); return createSeekerEducation(ctx.user.id, input); }),
    removeEducation: seekerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteSeekerEducation(ctx.user.id, input.id)),
    addExperience: seekerProcedure.input(z.object({ employer: z.string().trim().min(2).max(180), jobTitle: z.string().trim().min(2).max(180), location: z.string().trim().max(120).optional(), startDate: z.string().trim().min(4).max(30), endDate: z.string().trim().max(30).optional(), currentRole: z.boolean().default(false), description: z.string().trim().max(2000).optional() })).mutation(({ ctx, input }) => createSeekerExperience(ctx.user.id, input)),
    removeExperience: seekerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteSeekerExperience(ctx.user.id, input.id)),
    addSkill: seekerProcedure.input(z.object({ name: z.string().trim().min(2).max(120), level: z.string().trim().max(40).optional() })).mutation(({ ctx, input }) => createSeekerSkill(ctx.user.id, input)),
    removeSkill: seekerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteSeekerSkill(ctx.user.id, input.id)),
    addCertification: seekerProcedure.input(z.object({ name: z.string().trim().min(2).max(180), issuer: z.string().trim().max(180).optional(), issueDate: z.string().trim().max(30).optional(), expiryDate: z.string().trim().max(30).optional(), credentialId: z.string().trim().max(120).optional(), credentialUrl: z.string().url().max(500).optional(), attachmentBase64: z.string().max(7_000_000).optional(), attachmentName: z.string().max(180).optional(), attachmentMimeType: z.enum(["image/jpeg", "image/png", "application/pdf"]).optional() })).mutation(async ({ ctx, input }) => { if (!input.attachmentBase64) return createSeekerCertification(ctx.user.id, input); if (!input.attachmentName || !input.attachmentMimeType) throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a certificate file before saving" }); try { const validated = validateCertificateInput({ base64: input.attachmentBase64, name: input.attachmentName, mimeType: input.attachmentMimeType }); const uploaded = await storagePut(`certificates/${ctx.user.id}/${Date.now()}-${sanitizeStorageFileName(input.attachmentName)}`, validated.bytes, input.attachmentMimeType); return createSeekerCertification(ctx.user.id, { name: input.name, issuer: input.issuer, issueDate: input.issueDate, expiryDate: input.expiryDate, credentialId: input.credentialId, credentialUrl: input.credentialUrl, attachmentName: input.attachmentName, attachmentMimeType: input.attachmentMimeType, attachmentSize: validated.size, attachmentStorageKey: uploaded.key, attachmentStorageUrl: uploaded.url }); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Certificate upload failed" }); } }),
    updateCertification: seekerProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().trim().min(2).max(180) })).mutation(({ ctx, input }) => updateSeekerCertification(ctx.user.id, input.id, { name: input.name })),
    removeCertification: seekerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteSeekerCertification(ctx.user.id, input.id)),
    analyzeCvSkills: seekerProcedure.input(z.object({ cvId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const cv = await getSeekerCvById(ctx.user.id, input.cvId); if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found in your private portfolio" }); try { return await extractSkillsFromCv({ storageKey: cv.storageKey, mimeType: cv.mimeType, fileSize: cv.fileSize }); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "CV analysis failed" }); } }),
    cvs: seekerProcedure.query(async ({ ctx }) => { const cvs = await listSeekerCvs(ctx.user.id); return Promise.all(cvs.filter(cv => canViewSeekerDocument(cv.seekerUserId, ctx.user.id)).map(async cv => ({ ...cv, storageUrl: await storageGetSignedUrl(cv.storageKey) }))); }),
    uploadCv: seekerProcedure.input(z.object({ base64: z.string().max(12_000_000), fileName: z.string().min(1).max(180), mimeType: z.enum(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]) })).mutation(async ({ ctx, input }) => { const validated = validateCvInput({ base64: input.base64, name: input.fileName, mimeType: input.mimeType }); const uploaded = await storagePut(`cvs/${ctx.user.id}/${Date.now()}-${sanitizeStorageFileName(input.fileName)}`, validated.bytes, input.mimeType); const documentId = await saveSeekerCv({ seekerUserId: ctx.user.id, fileName: input.fileName, mimeType: input.mimeType, fileSize: validated.size, storageKey: uploaded.key, storageUrl: uploaded.url }); return { id: documentId, fileName: input.fileName, mimeType: input.mimeType, fileSize: validated.size, storageUrl: uploaded.url }; }),
    saved: seekerProcedure.query(({ ctx }) => listSavedVacancies(ctx.user.id)),
    savedPage: seekerProcedure.input(z.object({ page: z.number().int().positive().default(1), pageSize: z.number().int().min(1).max(50).default(12), keyword: z.string().max(120).optional(), region: z.string().max(120).optional(), sort: z.enum(["recent", "deadline", "title"]).default("recent") })).query(({ ctx, input }) => listSavedVacanciesPage(ctx.user.id, input.page, input.pageSize, { keyword: input.keyword, region: input.region, sort: input.sort })),
    savedIds: seekerProcedure.query(({ ctx }) => listSavedVacancyIds(ctx.user.id)),
    saveVacancy: seekerProcedure.input(z.object({ vacancyId: z.number().int().positive() })).mutation(({ ctx, input }) => saveVacancy(ctx.user.id, input.vacancyId)),
    removeSavedVacancy: seekerProcedure.input(z.object({ vacancyId: z.number().int().positive() })).mutation(({ ctx, input }) => removeSavedVacancy(ctx.user.id, input.vacancyId)),
    updateSavedVacancyOrganization: seekerProcedure.input(z.object({ vacancyId: z.number().int().positive(), folder: z.string().max(80), tags: z.string().max(500).nullable() })).mutation(({ ctx, input }) => updateSavedVacancyOrganization(ctx.user.id, input.vacancyId, { folder: input.folder, tags: input.tags })),
    notificationPreferences: seekerProcedure.query(({ ctx }) => getSeekerNotificationPreferences(ctx.user.id)),
    saveNotificationPreferences: seekerProcedure.input(z.object({ emailReviewing: z.boolean(), emailShortlisted: z.boolean(), emailInterview: z.boolean(), emailOffered: z.boolean(), emailHired: z.boolean(), emailRejected: z.boolean(), inAppReviewing: z.boolean(), inAppShortlisted: z.boolean(), inAppInterview: z.boolean(), inAppOffered: z.boolean(), inAppHired: z.boolean(), inAppRejected: z.boolean() })).mutation(({ ctx, input }) => saveSeekerNotificationPreferences(ctx.user.id, Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value ? 1 : 0])))),
    saveVacancyAlertPreferences: seekerProcedure.input(z.object({ vacancyAlertsEnabled: z.boolean(), emailVacancyAlerts: z.boolean().default(true), inAppVacancyAlerts: z.boolean().default(true), vacancyAlertKeywordsEnabled: z.boolean().default(true), vacancyAlertRegionsEnabled: z.boolean().default(true), vacancyAlertCategoriesEnabled: z.boolean().default(true), vacancyAlertKeywords: z.string().max(500).nullable().optional(), vacancyAlertRegions: z.string().max(500).nullable().optional(), vacancyAlertCategories: z.string().max(500).nullable().optional() })).mutation(({ ctx, input }) => saveVacancyAlertPreferences(ctx.user.id, { vacancyAlertsEnabled: input.vacancyAlertsEnabled ? 1 : 0, emailVacancyAlerts: input.emailVacancyAlerts ? 1 : 0, inAppVacancyAlerts: input.inAppVacancyAlerts ? 1 : 0, vacancyAlertKeywordsEnabled: input.vacancyAlertKeywordsEnabled ? 1 : 0, vacancyAlertRegionsEnabled: input.vacancyAlertRegionsEnabled ? 1 : 0, vacancyAlertCategoriesEnabled: input.vacancyAlertCategoriesEnabled ? 1 : 0, vacancyAlertKeywords: input.vacancyAlertKeywords ?? null, vacancyAlertRegions: input.vacancyAlertRegions ?? null, vacancyAlertCategories: input.vacancyAlertCategories ?? null })),
    applicationHistory: seekerProcedure.query(({ ctx }) => listSeekerApplicationHistory(ctx.user.id)),
    respondToInterview: seekerProcedure.input(z.object({ applicationId: z.number().int().positive(), response: z.enum(["accepted", "declined"]) })).mutation(({ ctx, input }) => respondToInterview({ applicationId: input.applicationId, seekerUserId: ctx.user.id, response: input.response })),
    notifications: seekerProcedure.query(({ ctx }) => listUserNotifications(ctx.user.id)),
    employerNotifications: employerProcedure.query(({ ctx }) => listUserNotifications(ctx.user.id)),
    markNotificationRead: seekerProcedure.input(z.object({ notificationId: z.number() })).mutation(({ ctx, input }) => markNotificationRead(ctx.user.id, input.notificationId)),
    markAllNotificationsRead: seekerProcedure.mutation(({ ctx }) => markAllNotificationsRead(ctx.user.id)),
  }),

  employer: router({
    applications: employerProcedure.input(z.object({ keyword: z.string().trim().max(120).optional(), status: z.string().trim().max(40).optional() }).optional()).query(({ ctx, input }) => listEmployerApplications(ctx.user.id, input ?? {})),
    applicationTrend: employerProcedure.input(z.object({ period: z.enum(["week", "month"]).default("week") }).optional()).query(({ ctx, input }) => getEmployerApplicationTrend(ctx.user.id, input?.period ?? "week")),
    viewCandidateProfile: employerProcedure.input(z.object({ applicationId: z.number().int().positive() })).query(async ({ ctx, input }) => { const result = await getEmployerCandidateProfile(ctx.user.id, input.applicationId); if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Candidate application not found" }); await recordSeekerAccessEvent({ seekerUserId: result.application.seekerUserId, employerUserId: ctx.user.id, vacancyId: result.application.vacancyId, accessType: "profile" }); return result; }),
    viewCandidateCv: employerProcedure.input(z.object({ applicationId: z.number().int().positive() })).query(async ({ ctx, input }) => { const document = await getEmployerCandidateDocument(ctx.user.id, input.applicationId); if (!document) return { available: false as const, previewUrl: null }; const previewUrl = await storageGetSignedUrl(document.storageKey); await recordSeekerAccessEvent({ seekerUserId: document.seekerUserId, employerUserId: ctx.user.id, vacancyId: document.vacancyId, documentId: document.id, accessType: "cv" }); return { available: true as const, previewUrl, mimeType: document.mimeType, fileName: document.fileName }; }),
    vacancyMetrics: employerProcedure.query(({ ctx }) => getEmployerVacancyMetrics(ctx.user.id)),
    vacancies: employerProcedure.query(({ ctx }) => listEmployerVacancies(ctx.user.id)),
    updateVacancy: employerProcedure.input(z.object({ vacancyId: z.number().int().positive(), company: z.string().min(2).max(180), title: z.string().min(3).max(180), category: z.string().min(2), location: z.string().min(2), contractType: z.string().min(2).max(40).optional(), salary: z.string().trim().max(120).optional(), description: z.string().min(20), deadline: z.coerce.date() })).mutation(({ ctx, input }) => updateEmployerVacancy({ ...input, employerUserId: ctx.user.id })),
    deleteVacancy: employerProcedure.input(z.object({ vacancyId: z.number().int().positive() })).mutation(({ ctx, input }) => deleteEmployerVacancy({ vacancyId: input.vacancyId, employerUserId: ctx.user.id })),
    editVacancy: employerProcedure.input(z.object({ vacancyId: z.number().int().positive(), company: z.string().min(2).max(180), title: z.string().min(3).max(180), category: z.string().min(2), location: z.string().min(2), contractType: z.string().min(2).max(40).optional(), salary: z.string().trim().max(120).optional(), description: z.string().min(20), deadline: z.coerce.date() })).mutation(({ ctx, input }) => resubmitEmployerVacancy({ ...input, employerUserId: ctx.user.id })),
    renewVacancy: employerProcedure.input(z.object({ vacancyId: z.number().int().positive(), deadline: z.coerce.date() })).mutation(({ ctx, input }) => renewEmployerVacancy({ vacancyId: input.vacancyId, employerUserId: ctx.user.id, deadline: input.deadline })),
    submitVacancy: employerProcedure.input(z.object({ company: z.string().min(2).max(180), title: z.string().min(3).max(180), category: z.string().min(2), location: z.string().min(2), contractType: z.string().min(2).max(40).optional(), salary: z.string().trim().max(120).optional(), description: z.string().min(20), deadline: z.coerce.date(), method: z.string().min(2).optional(), amountTzs: z.number().int().positive().optional(), providerReference: z.string().min(3).optional(), evidenceNote: z.string().optional(), receiptBase64: z.string().max(7_000_000).optional(), receiptName: z.string().max(180).optional(), receiptMimeType: z.enum(["image/jpeg", "image/png", "application/pdf"]).optional(), urgent: z.boolean().optional() })).mutation(async ({ ctx, input }) => { const employerProfile = await getEmployerProfile(ctx.user.id); if (!employerProfile) throw new TRPCError({ code: "FORBIDDEN", message: "Complete your employer profile before using employer tools" }); const subscription = await getActiveSubscription(ctx.user.id); const usage = await getEmployerUsage(ctx.user.id); const hasPaymentEvidence = Boolean(input.method && input.amountTzs && input.providerReference); const policy = getVacancyPostingPolicy({ usage: usage.vacancies, plan: subscription?.plan, employerVerified: employerProfile.verified === 1, hasPaymentEvidence }); if (!policy.allowed) throw new TRPCError({ code: "FORBIDDEN", message: policy.message ?? "This vacancy cannot be submitted yet" }); if (policy.paymentRequired && (!input.method || !input.amountTzs || !input.providerReference)) throw new TRPCError({ code: "BAD_REQUEST", message: "Payment method, amount, and transaction reference are required for this posting" }); if (input.urgent && input.amountTzs !== 30000) throw new TRPCError({ code: "BAD_REQUEST", message: "Urgent vacancies require the configured TZS 30,000 urgent posting fee" }); const method = input.method!; const amountTzs = input.amountTzs!; const providerReference = input.providerReference!; const vacancyId = await createEmployerVacancy({ employerUserId: ctx.user.id, company: input.company, title: input.title, category: input.category, location: input.location, salary: input.salary, description: input.description, deadline: input.deadline, contractType: input.contractType, paymentRequired: policy.paymentRequired, urgent: input.urgent ?? false }); if (!policy.paymentRequired) return { vacancyId, paymentId: null, status: "submitted_free_allowance", paymentRequired: false, remainingFree: policy.remainingFree, receiptUrl: null }; let receipt; if (input.receiptBase64) { try { const validated = validateReceiptInput({ base64: input.receiptBase64, name: input.receiptName, mimeType: input.receiptMimeType }); if (validated.hasReceipt) receipt = await storagePut(`receipts/${ctx.user.id}/${Date.now()}-${sanitizeStorageFileName(input.receiptName ?? "receipt")}`, validated.bytes, input.receiptMimeType); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Invalid receipt" }); } } const paymentId = await recordPayment({ vacancyId, employerUserId: ctx.user.id, method, provider: "manual-lipa-namba", amountTzs, providerReference, evidenceNote: input.evidenceNote, receiptKey: receipt?.key, receiptUrl: receipt?.url, receiptName: input.receiptName, receiptMimeType: input.receiptMimeType }); return { vacancyId, paymentId, status: "paid_pending_review", paymentRequired: true, remainingFree: 0, receiptUrl: receipt?.url ?? null }; }),
    profile: employerProcedure.query(async ({ ctx }) => (await getEmployerProfile(ctx.user.id)) ?? null),
    saveProfile: employerProcedure.input(z.object({ companyName: z.string().min(2).max(180), registrationNumber: z.string().max(120).optional(), industry: z.string().max(120).optional(), location: z.string().max(120).optional(), email: z.string().email().optional(), phone: z.string().max(40).optional() })).mutation(async ({ ctx, input }) => { await upsertEmployerProfile({ userId: ctx.user.id, ...input }); return (await getEmployerProfile(ctx.user.id)) ?? null; }),
    uploadProfileImage: employerProcedure.input(z.object({ base64: z.string().max(7_000_000), name: z.string().max(180), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]) })).mutation(async ({ ctx, input }) => { try { const validated = validateProfilePhotoInput(input); const stored = await storagePut(`employer-profile-images/${ctx.user.id}/${Date.now()}-${sanitizeStorageFileName(input.name)}`, validated.bytes, input.mimeType); await updateEmployerProfileImage({ userId: ctx.user.id, profileImageKey: stored.key, profileImageUrl: stored.url, profileImageMimeType: input.mimeType, profileImageSize: validated.size }); return (await getEmployerProfile(ctx.user.id)) ?? null; } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Could not upload company profile image" }); } }),
    usage: employerProcedure.query(({ ctx }) => getEmployerUsage(ctx.user.id)),
    postingPolicy: employerProcedure.query(async ({ ctx }) => { const profile = await getEmployerProfile(ctx.user.id); const subscription = await getActiveSubscription(ctx.user.id); const usage = await getEmployerUsage(ctx.user.id); if (!profile) return { allowed: false, paymentRequired: true, remainingFree: 0, vacanciesUsed: usage.vacancies, message: "Complete your employer profile before posting" }; return { ...getVacancyPostingPolicy({ usage: usage.vacancies, plan: subscription?.plan, employerVerified: profile.verified === 1, hasPaymentEvidence: false }), vacanciesUsed: usage.vacancies }; }),
    paymentStatus: employerProcedure.query(({ ctx }) => listEmployerPayments(ctx.user.id)),
    manageCandidate: employerProcedure.input(z.object({ applicationId: z.number(), status: z.enum(["reviewing", "shortlisted", "interview", "offered", "hired", "rejected"]), note: z.string().max(1000).optional(), interviewAt: z.coerce.date().optional() }).superRefine((value, refinement) => { if (value.status === "interview" && (!value.interviewAt || value.interviewAt.getTime() <= Date.now())) refinement.addIssue({ code: z.ZodIssueCode.custom, path: ["interviewAt"], message: "Choose a future date and time for the interview" }); })).mutation(async ({ ctx, input }) => { const employerProfile = await getEmployerProfile(ctx.user.id); if (!employerProfile) throw new TRPCError({ code: "FORBIDDEN", message: "Employer profile required" }); const subscription = await getActiveSubscription(ctx.user.id); const usage = await getEmployerUsage(ctx.user.id); if (!canManageCandidate(usage.candidates, subscription?.plan)) throw new TRPCError({ code: "FORBIDDEN", message: "Your current employer plan has reached its candidate-management limit" }); return updateApplicationStatus({ ...input, employerUserId: ctx.user.id }); }),
  }),

  subscriptions: router({
    adminQueue: adminProcedure.query(() => listPendingSubscriptions()),
    adminModerate: adminProcedure.input(z.object({ subscriptionId: z.number(), action: z.enum(["approve", "reject"]), reason: z.string().optional() }).refine(value => value.action !== "reject" || Boolean(value.reason?.trim()), { message: "A rejection reason is required", path: ["reason"] })).mutation(({ ctx, input }) => moderateSubscription({ ...input, adminUserId: ctx.user.id })),
    me: employerProcedure.query(async ({ ctx }) => ({ subscription: await getLatestSubscription(ctx.user.id), usage: await getEmployerUsage(ctx.user.id) })),
    requestManual: employerProcedure.input(z.object({ plan: z.enum(["starter", "business", "enterprise"]), paymentReference: z.string().min(3), paymentAmountTzs: z.number().int().positive() })).mutation(({ ctx, input }) => { const limits = PLAN_LIMITS[input.plan]; return requestEmployerSubscription({ employerUserId: ctx.user.id, plan: input.plan, ...limits, paymentReference: input.paymentReference, paymentAmountTzs: input.paymentAmountTzs }); }),
    activateManual: employerProcedure.input(z.object({ plan: z.enum(["starter", "business", "enterprise"]), paymentReference: z.string().min(3) })).mutation(({ ctx, input }) => { const limits = PLAN_LIMITS[input.plan]; return createEmployerSubscription({ employerUserId: ctx.user.id, plan: input.plan, ...limits, startedAt: new Date() }); }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
