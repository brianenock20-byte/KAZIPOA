import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNull, lte, or } from "drizzle-orm";
import type { Request } from "express";
import { authCredentials, authEvents, authRateLimits, authSessions, authTokens, users } from "../drizzle/schema";
import { getDb, getUserById } from "./db";
import { ENV } from "./_core/env";

const SCRYPT_N = 1 << 17;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 256 * 1024 * 1024;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
const CUSTOM_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CUSTOM_SESSION_SHORT_TTL_MS = 8 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

export type CustomAccountType = "seeker" | "employer";
export type CustomTokenPurpose = "email_verification" | "password_reset";

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export function validateCustomPassword(password: string) {
  if (password.length < 12) return "Use at least 12 characters. A longer passphrase is safer.";
  if (password.length > 128) return "Password must be 128 characters or fewer.";
  return null;
}

function scryptAsync(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_LENGTH, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      maxmem: SCRYPT_MAX_MEMORY,
    }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey as Buffer);
    });
  });
}

export async function hashCustomPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt);
  return `scrypt$N=${SCRYPT_N}$r=${SCRYPT_R}$p=${SCRYPT_P}$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

export async function verifyCustomPassword(password: string, storedHash: string) {
  const match = /^scrypt\$N=(\d+)\$r=(\d+)\$p=(\d+)\$([^$]+)\$([^$]+)$/.exec(storedHash);
  if (!match) return false;
  const [, n, r, p, saltEncoded, keyEncoded] = match;
  const salt = Buffer.from(saltEncoded, "base64url");
  const expected = Buffer.from(keyEncoded, "base64url");
  if (!salt.length || !expected.length) return false;

  return new Promise<boolean>((resolve, reject) => {
    scrypt(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: SCRYPT_MAX_MEMORY,
    }, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      const actual = derivedKey as Buffer;
      resolve(actual.length === expected.length && timingSafeEqual(actual, expected));
    });
  });
}

export const createOpaqueToken = () => randomBytes(32).toString("base64url");
export const hashOpaqueToken = (token: string) => createHash("sha256").update(token).digest("hex");

function hashRequestValue(value: string | undefined) {
  if (!value) return null;
  return createHmac("sha256", ENV.cookieSecret || "custom-auth-audit").update(value).digest("hex");
}

function getRequestMetadata(req?: Request) {
  return {
    ipHash: hashRequestValue(req?.ip),
    userAgentHash: hashRequestValue(req?.get("user-agent") ?? undefined),
    requestId: typeof req?.headers["x-request-id"] === "string" ? req.headers["x-request-id"] : null,
  };
}

export async function recordAuthEvent(input: {
  userId?: number | null;
  eventType: string;
  success: boolean;
  req?: Request;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) return;
  try {
    const request = getRequestMetadata(input.req);
    await db.insert(authEvents).values({
      userId: input.userId ?? null,
      eventType: input.eventType,
      success: input.success,
      requestId: request.requestId,
      ipHash: request.ipHash,
      userAgentHash: request.userAgentHash,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    });
  } catch (error) {
    console.error("[CustomAuth] Failed to record audit event", error);
  }
}

async function getRateLimit(subjectKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(authRateLimits).where(eq(authRateLimits.subjectKey, subjectKey)).limit(1);
  return rows[0];
}

export function getAuthRateLimitDecision(input: { attemptCount: number; windowStartedAt: Date; blockedUntil?: Date | null }, now = new Date()) {
  if (input.blockedUntil && input.blockedUntil > now) return { allowed: false, remaining: 0, retryAt: input.blockedUntil };
  if (now.getTime() - input.windowStartedAt.getTime() >= RATE_WINDOW_MS) return { allowed: true, remaining: MAX_ATTEMPTS_PER_WINDOW };
  return { allowed: input.attemptCount < MAX_ATTEMPTS_PER_WINDOW, remaining: Math.max(0, MAX_ATTEMPTS_PER_WINDOW - input.attemptCount) };
}

export function isAuthTokenActive(input: { consumedAt?: Date | null; expiresAt: Date }, now = new Date()) {
  return !input.consumedAt && input.expiresAt > now;
}

export function isCustomSessionActive(input: { revokedAt?: Date | null; expiresAt: Date }, now = new Date()) {
  return !input.revokedAt && input.expiresAt > now;
}

export async function checkAuthRateLimit(subjectKey: string, now = new Date()) {
  const row = await getRateLimit(subjectKey);
  if (!row) return { allowed: true, remaining: MAX_ATTEMPTS_PER_WINDOW };
  return getAuthRateLimitDecision(row, now);
}

export async function recordAuthAttempt(subjectKey: string, success: boolean, now = new Date()) {
  const db = await getDb();
  if (!db) return;
  const current = await getRateLimit(subjectKey);
  if (success) {
    if (current) {
      await db.update(authRateLimits).set({ attemptCount: 0, windowStartedAt: now, blockedUntil: null }).where(eq(authRateLimits.id, current.id));
    }
    return;
  }

  if (!current || now.getTime() - current.windowStartedAt.getTime() >= RATE_WINDOW_MS) {
    if (current) {
      await db.update(authRateLimits).set({ attemptCount: 1, windowStartedAt: now, blockedUntil: null }).where(eq(authRateLimits.id, current.id));
    } else {
      await db.insert(authRateLimits).values({ subjectKey, attemptCount: 1, windowStartedAt: now });
    }
    return;
  }

  const attemptCount = current.attemptCount + 1;
  const blockedUntil = attemptCount >= MAX_ATTEMPTS_PER_WINDOW ? new Date(now.getTime() + RATE_WINDOW_MS) : null;
  await db.update(authRateLimits).set({ attemptCount, blockedUntil }).where(eq(authRateLimits.id, current.id));
}

export async function getCredentialByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(authCredentials).where(eq(authCredentials.emailNormalized, normalizeEmail(email))).limit(1);
  return rows[0];
}

export async function getCredentialByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(authCredentials).where(eq(authCredentials.userId, userId)).limit(1);
  return rows[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1);
  return rows[0];
}

export async function createOrAttachCredential(input: {
  name: string;
  email: string;
  passwordHash: string;
  accountType: CustomAccountType;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const emailNormalized = normalizeEmail(input.email);
  const existingCredential = await getCredentialByEmail(emailNormalized);
  if (existingCredential) throw new Error("Unable to create this account");

  let user = await getUserByEmail(emailNormalized);
  if (user?.role === "admin") throw new Error("Unable to create this account");
  if (!user) {
    const openId = `custom_${createOpaqueToken().slice(0, 48)}`;
    await db.insert(users).values({
      openId,
      name: input.name.trim(),
      email: emailNormalized,
      loginMethod: "custom_email",
      accountType: input.accountType,
      accountTypeLocked: true,
      lastSignedIn: new Date(),
    });
    const createdRows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    user = createdRows[0];
  }
  if (!user) throw new Error("Unable to create this account");

  await db.insert(authCredentials).values({
    userId: user.id,
    emailNormalized,
    passwordHash: input.passwordHash,
  });
  return user;
}

export async function createAuthToken(userId: number, purpose: CustomTokenPurpose, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const token = createOpaqueToken();
  await db.insert(authTokens).values({ userId, purpose, tokenHash: hashOpaqueToken(token), expiresAt });
  return token;
}

export async function consumeAuthToken(token: string, purpose: CustomTokenPurpose, now = new Date()) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(authTokens).where(and(eq(authTokens.tokenHash, hashOpaqueToken(token)), eq(authTokens.purpose, purpose), isNull(authTokens.consumedAt), gt(authTokens.expiresAt, now))).limit(1);
  const row = rows[0];
  if (!row || !isAuthTokenActive(row, now)) return undefined;
  await db.update(authTokens).set({ consumedAt: now }).where(and(eq(authTokens.id, row.id), isNull(authTokens.consumedAt)));
  return row;
}

export async function createCustomSession(userId: number, rememberMe = false) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + (rememberMe ? CUSTOM_SESSION_TTL_MS : CUSTOM_SESSION_SHORT_TTL_MS));
  await db.insert(authSessions).values({ tokenHash: hashOpaqueToken(token), userId, expiresAt, lastSeenAt: new Date() });
  return { token, expiresAt };
}

export async function getUserByCustomSessionToken(token: string) {
  if (!ENV.customAuthEnabled) return undefined;
  const db = await getDb();
  if (!db) return undefined;
  const now = new Date();
  const rows = await db.select({ session: authSessions, user: users }).from(authSessions).innerJoin(users, eq(authSessions.userId, users.id)).where(and(eq(authSessions.tokenHash, hashOpaqueToken(token)), isNull(authSessions.revokedAt), gt(authSessions.expiresAt, now))).limit(1);
  const row = rows[0];
  if (!row || row.user.isBlocked || !isCustomSessionActive(row.session, now)) return undefined;
  await db.update(authSessions).set({ lastSeenAt: now }).where(eq(authSessions.id, row.session.id));
  return row.user;
}

export async function revokeCustomSession(token: string | undefined) {
  if (!token) return;
  const db = await getDb();
  if (!db) return;
  await db.update(authSessions).set({ revokedAt: new Date() }).where(and(eq(authSessions.tokenHash, hashOpaqueToken(token)), isNull(authSessions.revokedAt)));
}

export async function revokeAllCustomSessions(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(authSessions).set({ revokedAt: new Date() }).where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)));
}

export async function markCredentialVerified(userId: number, now = new Date()) {
  const db = await getDb();
  if (!db) return;
  await db.update(authCredentials).set({ emailVerifiedAt: now }).where(eq(authCredentials.userId, userId));
}

export async function updateCredentialPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(authCredentials).set({ passwordHash }).where(eq(authCredentials.userId, userId));
}

export async function getCustomAuthUserByEmail(email: string) {
  const credential = await getCredentialByEmail(email);
  if (!credential) return undefined;
  return getUserById(credential.userId);
}

export const customAuthConfig = {
  emailVerificationTtlMs: EMAIL_VERIFICATION_TTL_MS,
  passwordResetTtlMs: PASSWORD_RESET_TTL_MS,
  sessionTtlMs: CUSTOM_SESSION_TTL_MS,
  rateWindowMs: RATE_WINDOW_MS,
  maxAttemptsPerWindow: MAX_ATTEMPTS_PER_WINDOW,
};

export const getAuthSubjectKey = (email: string, req?: Request) => {
  const ip = req?.ip ?? "unknown";
  return `custom-auth:${normalizeEmail(email)}:${ip}`;
};

export const isCustomAuthEnabled = () => ENV.customAuthEnabled;
