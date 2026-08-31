import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("portal-wide dark theme contract", () => {
  const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
  const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

  it("scopes the screenshot palette to the active dark theme", () => {
    expect(css).toContain("html.dark body{background:#111612;color:#f4f7f4}");
    expect(css).toContain("html.dark .site-header{background:#0b132b");
    expect(css).toContain("html.dark .public-live-jobs");
    expect(css).toMatch(/html\.dark \.public-live-jobs \.job-card,html\.dark \.job-card,html\.dark \.company-card[^}]*background:#1b2e20/);
  });

  it("defaults new visitors to dark mode while retaining a switchable preference", () => {
    expect(app).toContain('<ThemeProvider defaultTheme="dark" switchable>');
  });

  it("keeps dark form controls and content states readable", () => {
    expect(css).toContain("html.dark .search-field input");
    expect(css).toContain("html.dark .application-flow select");
    expect(css).toContain("html.dark .empty-state");
    expect(css).toContain("html.dark .category-tile");
  });
});
