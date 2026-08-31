const customAuthFlag = process.env.KAZIPOA_CUSTOM_AUTH_ENABLED;

export const parseCustomAuthEnabled = (flag: string | undefined) => {
  const normalized = flag?.trim().toLowerCase();
  return normalized === undefined || normalized === "" ? true : normalized === "true";
};

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  postmarkServerToken: process.env.POSTMARK_SERVER_TOKEN ?? "",
  postmarkFromEmail: process.env.POSTMARK_FROM_EMAIL ?? "notifications@portol.kazipoa.co.tz",
  postmarkMessageStream: process.env.POSTMARK_MESSAGE_STREAM ?? "outbound",
  appBaseUrl: process.env.APP_BASE_URL ?? "https://portol.kazipoa.co.tz",
  customAuthEnabled: parseCustomAuthEnabled(customAuthFlag),
  smsProviderEnabled: process.env.SMS_PROVIDER_ENABLED ?? "false",
  smsProviderBaseUrl: process.env.SMS_PROVIDER_BASE_URL ?? "",
  smsProviderApiKey: process.env.SMS_PROVIDER_API_KEY ?? "",
  smsProviderSenderId: process.env.SMS_PROVIDER_SENDER_ID ?? "",
  // Cloudflare R2 (S3-compatible) object storage — replaces the Manus Forge
  // storage proxy for self-hosted deployments. See server/storage.ts.
  r2AccountId: process.env.R2_ACCOUNT_ID ?? "",
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  r2BucketName: process.env.R2_BUCKET_NAME ?? "",
  // Optional: a public bucket/custom domain URL (e.g. a r2.dev URL or your
  // own CNAME). When set, public assets are served directly from it instead
  // of through the signed-URL proxy — cheaper and faster for public images.
  r2PublicUrl: (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, ""),
};
