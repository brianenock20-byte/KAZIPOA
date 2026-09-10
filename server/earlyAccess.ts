// Early-access waitlist: a lightweight, separate signup for people to
// register interest before full public launch. Intentionally NOT the same
// as a real account — no password, no login, just name/email/phone/intent
// captured for outreach later. Lives in its own table (waitlistSignups),
// completely separate from users/authCredentials.

import { desc, eq, sql } from "drizzle-orm";
import { waitlistSignups } from "../drizzle/schema";
import { getDb } from "./db";

export type WaitlistIntent = "seeker" | "employer" | "not_sure";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function joinWaitlist(input: { name: string; email: string; phone?: string | null; intent: WaitlistIntent }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const name = input.name.trim();
  const email = input.email.trim();
  const emailNormalized = normalizeEmail(email);
  const phone = input.phone?.trim() || null;

  if (!name) throw new Error("Please enter your name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) throw new Error("Please enter a valid email address");

  const existing = await db.select({ id: waitlistSignups.id }).from(waitlistSignups).where(eq(waitlistSignups.emailNormalized, emailNormalized)).limit(1);
  if (existing[0]) {
    return { alreadyJoined: true as const };
  }

  await db.insert(waitlistSignups).values({ name, email, emailNormalized, phone, intent: input.intent, source: "early_access_page" });
  return { alreadyJoined: false as const };
}

export async function listWaitlistSignups(limit = 500) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waitlistSignups).orderBy(desc(waitlistSignups.createdAt)).limit(limit);
}

export async function countWaitlistSignups() {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ value: sql<number>`count(*)` }).from(waitlistSignups);
  return Number(rows[0]?.value ?? 0);
}
