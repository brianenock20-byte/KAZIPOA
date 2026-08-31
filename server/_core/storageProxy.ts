import type { Express } from "express";
import { storageGetSignedUrl } from "../storage";
import { ENV } from "./env";

// Route path kept as "/manus-storage" for backward compatibility with
// existing hardcoded asset paths in the client (branding images, payment
// logos) — it now serves files from Cloudflare R2, not Manus.
export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.r2AccountId || !ENV.r2BucketName) {
      res.status(500).send("Storage not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.");
      return;
    }

    try {
      const url = await storageGetSignedUrl(key);
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
