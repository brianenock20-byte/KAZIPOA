import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getPublicLiveVacancy, listIndexableLiveVacancies } from "../db";
import { canonicalOrigin, renderPublicVacancyMetadata, renderSiteMetadata } from "../publicVacancy";

export const SPA_CLIENT_ROUTES = ["/jobs", "/urgent-jobs", "/dashboard", "/preferences", "/companies", "/verified-companies", "/safety", "/safety-centre"] as const;
export const PUBLIC_SITEMAP_ROUTES = ["/", "/jobs", "/urgent-jobs", "/verified-companies", "/safety-centre"] as const;
export const isSpaClientPath = (requestUrl: string) => {
  try {
    return SPA_CLIENT_ROUTES.includes(new URL(requestUrl, "http://localhost").pathname as (typeof SPA_CLIENT_ROUTES)[number]);
  } catch {
    return false;
  }
};

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.get("/robots.txt", async (req, res) => {
    const origin = canonicalOrigin();
    res.type("text/plain").set("Cache-Control", "public, no-store").send(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /preferences\n\nSitemap: ${origin}/sitemap.xml\n`);
  });

  app.get("/sitemap.xml", async (req, res, next) => {
    try {
      const origin = canonicalOrigin();
      const vacancies = await listIndexableLiveVacancies(200);
      const urls = [...PUBLIC_SITEMAP_ROUTES, ...vacancies.map(vacancy => `/vacancies/${vacancy.id}`)];
      const body = urls.map(location => `<url><loc>${origin}${location}</loc></url>`).join("");
      res.type("application/xml").set("Cache-Control", "public, no-store").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
    } catch (error) {
      next(error);
    }
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const requestOrigin = process.env.CANONICAL_ORIGIN || `${req.protocol}://${req.get("host")}`;
      if (new URL(`http://localhost${url}`).pathname === "/robots.txt") {
        const origin = canonicalOrigin(requestOrigin);
        return res.status(200).type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /preferences\n\nSitemap: ${origin}/sitemap.xml\n`);
      }
      if (new URL(`http://localhost${url}`).pathname === "/sitemap.xml") {
        const origin = canonicalOrigin(requestOrigin);
        const vacancies = await listIndexableLiveVacancies(200);
        const urls = [...PUBLIC_SITEMAP_ROUTES, ...vacancies.map(vacancy => `/vacancies/${vacancy.id}`)];
        const body = urls.map(location => `<url><loc>${origin}${location}</loc></url>`).join("");
        return res.status(200).type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
      }
      const publicVacancyMatch = new URL(`http://localhost${url}`).pathname.match(/^\/vacancies\/(\d+)$/);
      if (publicVacancyMatch) {
        const vacancy = await getPublicLiveVacancy(Number(publicVacancyMatch[1]));
        if (vacancy) template = renderPublicVacancyMetadata(template, vacancy, requestOrigin);
      } else {
        template = renderSiteMetadata(template, requestOrigin);
      }
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.get("/robots.txt", async (req, res) => {
    const origin = canonicalOrigin();
    res.type("text/plain").set("Cache-Control", "public, no-store").send(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /preferences\n\nSitemap: ${origin}/sitemap.xml\n`);
  });

  app.get("/sitemap.xml", async (req, res, next) => {
    try {
      const origin = canonicalOrigin();
      const vacancies = await listIndexableLiveVacancies(200);
      const urls = [...PUBLIC_SITEMAP_ROUTES, ...vacancies.map(vacancy => `/vacancies/${vacancy.id}`)];
      const body = urls.map(location => `<url><loc>${origin}${location}</loc></url>`).join("");
      res.type("application/xml").set("Cache-Control", "public, no-store").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
    } catch (error) {
      next(error);
    }
  });

  app.use(express.static(distPath, { index: false }));

  // Explicitly serve the SPA shell for client-side routes. Some hosting edges
  // do not apply the wildcard fallback consistently on direct refreshes.
  app.use(async (req, res, next) => {
    if (!isSpaClientPath(req.originalUrl)) return next();
    try {
      const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      const origin = process.env.CANONICAL_ORIGIN || `${req.protocol}://${req.get("host")}`;
      return res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).send(renderSiteMetadata(template, origin));
    } catch (error) {
      return next(error);
    }
  });

  // Emit vacancy-specific social metadata before the generic SPA shell.
  app.use("*", async (req, res, next) => {
    const publicVacancyMatch = req.path.match(/^\/vacancies\/(\d+)$/);
    if (!publicVacancyMatch) return next();
    try {
      const vacancy = await getPublicLiveVacancy(Number(publicVacancyMatch[1]));
      if (!vacancy) return next();
      const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      const html = renderPublicVacancyMetadata(template, vacancy, process.env.CANONICAL_ORIGIN || `${req.protocol}://${req.get("host")}`);
      return res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).send(html);
    } catch (error) {
      return next(error);
    }
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res, next) => {
    try {
      const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      const origin = process.env.CANONICAL_ORIGIN || `${req.protocol}://${req.get("host")}`;
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-store" }).send(renderSiteMetadata(template, origin));
    } catch (error) {
      next(error);
    }
  });
}
