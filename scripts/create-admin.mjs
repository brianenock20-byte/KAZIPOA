// One-off admin account seeder. Run with:
//   DATABASE_URL=... node scripts/create-admin.mjs "email@example.com" "password"
//
// Creates (or promotes) a user with role="admin", attaches a password
// credential using the exact same scrypt format server/customAuth.ts
// verifies against, and marks the email as verified so it can log in
// immediately via /login (email + password).

import { randomBytes, scrypt } from "node:crypto";
import mysql from "mysql2/promise";

const SCRYPT_N = 1 << 17;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 256 * 1024 * 1024;

function scryptAsync(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: SCRYPT_MAX_MEMORY }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt);
  return `scrypt$N=${SCRYPT_N}$r=${SCRYPT_R}$p=${SCRYPT_P}$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

async function main() {
  const [, , emailArg, passwordArg] = process.argv;
  if (!emailArg || !passwordArg) {
    console.error('Usage: node scripts/create-admin.mjs "email@example.com" "password"');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const emailNormalized = emailArg.trim().toLowerCase();
  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });

  try {
    const [existingUsers] = await conn.execute("SELECT id, role FROM users WHERE email = ? LIMIT 1", [emailNormalized]);
    let userId;

    if (existingUsers.length === 0) {
      const openId = `custom_admin_${randomBytes(24).toString("hex")}`;
      const [result] = await conn.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, accountType, accountTypeLocked, lastSignedIn, createdAt, updatedAt)
         VALUES (?, ?, ?, 'custom_email', 'admin', 'employer', 1, NOW(), NOW(), NOW())`,
        [openId, "Kazipoa Admin", emailNormalized],
      );
      userId = result.insertId;
      console.log(`Created new user #${userId} (${emailNormalized}) with role=admin`);
    } else {
      userId = existingUsers[0].id;
      if (existingUsers[0].role !== "admin") {
        await conn.execute("UPDATE users SET role = 'admin' WHERE id = ?", [userId]);
        console.log(`Promoted existing user #${userId} (${emailNormalized}) to role=admin`);
      } else {
        console.log(`User #${userId} (${emailNormalized}) is already an admin`);
      }
    }

    const passwordHash = await hashPassword(passwordArg);
    const [existingCred] = await conn.execute("SELECT id FROM authCredentials WHERE userId = ? LIMIT 1", [userId]);

    if (existingCred.length > 0) {
      await conn.execute(
        "UPDATE authCredentials SET passwordHash = ?, emailVerifiedAt = NOW(), emailNormalized = ? WHERE userId = ?",
        [passwordHash, emailNormalized, userId],
      );
      console.log("Updated password credential and marked email verified.");
    } else {
      await conn.execute(
        "INSERT INTO authCredentials (userId, emailNormalized, passwordHash, emailVerifiedAt, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW(), NOW())",
        [userId, emailNormalized, passwordHash],
      );
      console.log("Created password credential and marked email verified.");
    }

    console.log("\nDone. Log in at /login with:");
    console.log(`  email:    ${emailNormalized}`);
    console.log(`  password: (as provided)`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
