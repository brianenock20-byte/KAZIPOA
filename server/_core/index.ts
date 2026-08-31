import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { cleanupExpiredVacancies, expireTestVacancies, getDb, getSeekerCvById, getUserById, notifySavedVacanciesNearExpiry } from "../db";
import { storageGetSignedUrl } from "../storage";
import { sdk } from "./sdk";
import { applyVerifiedMpesaCallback } from "../db";
import { parseMpesaCallback, verifyMpesaCallbackSignature } from "../mpesaContract";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb", verify: (req, _res, buffer) => { if ((req as express.Request).originalUrl === "/api/payments/mpesa/callback") (req as express.Request & { rawBody?: string }).rawBody = buffer.toString("utf8"); } }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  const healthResponse = (_req: express.Request, res: express.Response) => res.status(200).json({ status: "ok", service: "kazipoa", checkedAt: new Date().toISOString() });
  app.get("/api/health", healthResponse);
  app.post("/api/payments/mpesa/callback", async (req, res) => {
    const rawBody = (req as express.Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body ?? {});
    const signature = req.header("x-mpesa-signature") ?? req.header("x-callback-signature");
    if (!verifyMpesaCallbackSignature(rawBody, signature, process.env.MPESA_CALLBACK_SECRET ?? "")) return res.status(401).json({ ok: false, error: "Invalid callback signature" });
    try {
      const callback = parseMpesaCallback(rawBody);
      const result = await applyVerifiedMpesaCallback({ callback, rawBody });
      return res.status(200).json({ ok: true, ...result });
    } catch (error) {
      console.error("[M-Pesa callback] rejected", error);
      return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : "Invalid M-Pesa callback" });
    }
  });
  app.get("/api/readiness", async (_req, res) => {
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ status: "not_ready", service: "kazipoa" });
      await db.execute("SELECT 1");
      return res.status(200).json({ status: "ready", database: "ok", checkedAt: new Date().toISOString() });
    } catch (error) {
      console.error("[Readiness] database check failed", error);
      return res.status(503).json({ status: "not_ready", database: "unavailable" });
    }
  });
  app.get("/api/seeker/cv/:documentId/preview", async (req, res) => {
    try {
      const context = await createContext({ req, res } as any);
      if (!context.user) return res.status(401).json({ error: "Authentication required" });
      const documentId = Number(req.params.documentId);
      if (!Number.isInteger(documentId) || documentId <= 0) return res.status(400).json({ error: "Invalid CV document" });
      const cv = await getSeekerCvById(context.user.id, documentId);
      if (!cv) return res.status(404).json({ error: "CV not found" });
      const signedUrl = await storageGetSignedUrl(cv.storageKey);
      const storageResponse = await fetch(signedUrl);
      if (!storageResponse.ok || !storageResponse.body) {
        console.error(`[CV preview] storage returned ${storageResponse.status} for document ${documentId}`);
        return res.status(502).json({ error: "CV file is unavailable. Please upload the CV again." });
      }
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("Content-Type", cv.mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${cv.fileName.replace(/[\\\"]+/g, "_")}"`);
      const contentLength = storageResponse.headers.get("content-length");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      const reader = storageResponse.body.getReader();
      res.on("close", () => reader.cancel().catch(() => undefined));
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      return res.end();
    } catch (error) {
      console.error("[CV preview] failed", error);
      return res.status(500).json({ error: "Unable to preview CV" });
    }
  });
  app.get("/api/seeker/profile-photo/preview", async (req, res) => {
    try {
      const context = await createContext({ req, res } as any);
      if (!context.user) return res.status(401).json({ error: "Authentication required" });
      const user = await getUserById(context.user.id);
      if (!user?.profilePhotoKey) return res.status(404).json({ error: "Profile photo not found" });
      const signedUrl = await storageGetSignedUrl(user.profilePhotoKey);
      const storageResponse = await fetch(signedUrl);
      if (!storageResponse.ok || !storageResponse.body) return res.status(502).json({ error: "Profile photo is unavailable. Please upload it again." });
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("Content-Type", user.profilePhotoMimeType ?? "image/jpeg");
      const contentLength = storageResponse.headers.get("content-length");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      const reader = storageResponse.body.getReader();
      res.on("close", () => reader.cancel().catch(() => undefined));
      while (true) { const { done, value } = await reader.read(); if (done) break; res.write(Buffer.from(value)); }
      return res.end();
    } catch (error) {
      console.error("[Profile photo preview] failed", error);
      return res.status(500).json({ error: "Unable to preview profile photo" });
    }
  });
  app.post("/api/scheduled/cleanup-expired-vacancies", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      const expiryWarnings = await notifySavedVacanciesNearExpiry();
      const result = await cleanupExpiredVacancies();
      return res.status(200).json({ ok: true, ...result, savedWarnings: expiryWarnings.notified });
    } catch (error) {
      console.error("[Scheduled cleanup] failed", error);
      return res.status(500).json({ error: String(error), context: { url: req.originalUrl }, timestamp: new Date().toISOString() });
    }
  });
  app.post("/api/scheduled/expire-test-vacancies", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      const result = await expireTestVacancies();
      return res.status(200).json({ ok: true, ...result });
    } catch (error) {
      return res.status(500).json({ error: String(error), context: { url: req.originalUrl }, timestamp: new Date().toISOString() });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
