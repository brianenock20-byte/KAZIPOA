// Object storage backed by Cloudflare R2 (S3-compatible).
//
// Uploads go straight from the server to R2 via the AWS S3 SDK (R2 speaks
// the S3 API). Downloads are served through /manus-storage/{key}, which
// redirects to a short-lived signed GET URL — the route name is kept as
// "manus-storage" purely for backward compatibility with existing hardcoded
// asset references in the client (branding images, payment logos); it has
// no dependency on Manus itself.
//
// Required env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
// R2_BUCKET_NAME. Optional: R2_PUBLIC_URL (see .env.example for details).

import { randomUUID } from "node:crypto";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

let _client: S3Client | null = null;

function getR2Client(): S3Client {
  if (_client) return _client;

  if (!ENV.r2AccountId || !ENV.r2AccessKeyId || !ENV.r2SecretAccessKey || !ENV.r2BucketName) {
    throw new Error(
      "Storage config missing: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME (see .env.example)",
    );
  }

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${ENV.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ENV.r2AccessKeyId,
      secretAccessKey: ENV.r2SecretAccessKey,
    },
  });
  return _client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export function sanitizeStorageFileName(fileName: string): string {
  const normalized = fileName.normalize("NFKD");
  const safe = normalized
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return safe || "document";
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

/** Uploads a file to R2 and returns its storage key plus a proxy URL. */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const client = getR2Client();
  const key = appendHashSuffix(normalizeKey(relKey));

  const body =
    typeof data === "string" ? Buffer.from(data, "utf8") : Buffer.from(data);

  await client.send(
    new PutObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  const url = ENV.r2PublicUrl ? `${ENV.r2PublicUrl}/${key}` : `/manus-storage/${key}`;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const url = ENV.r2PublicUrl ? `${ENV.r2PublicUrl}/${key}` : `/manus-storage/${key}`;
  return { key, url };
}

/** Returns a short-lived signed URL for privately stored files (CVs, receipts, etc). */
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const client = getR2Client();
  const key = normalizeKey(relKey);

  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: ENV.r2BucketName, Key: key }),
    { expiresIn: 900 }, // 15 minutes
  );
}
