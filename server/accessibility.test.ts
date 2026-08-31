import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("keyboard navigation contract", () => {
  const root = resolve(process.cwd());
  const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
  const dashboard = readFileSync(resolve(root, "client/src/components/DashboardLayout.tsx"), "utf8");
  const css = readFileSync(resolve(root, "client/src/index.css"), "utf8");

  it("provides a skip link in public and authenticated shells", () => {
    expect(home).toContain('<a className="skip-link" href="#main-content">Skip to main content</a>');
    expect(dashboard).toContain('<a className="skip-link" href="#main-content">Skip to main content</a>');
  });

  it("provides a focusable main-content target for both shells", () => {
    expect(home).toContain('<main id="main-content" tabIndex={-1}');
    expect(dashboard).toContain('<main id="main-content" tabIndex={-1} className="flex-1 p-4">');
  });

  it("keeps the skip link visually hidden until keyboard focus", () => {
    expect(css).toContain(".skip-link { position:fixed;");
    expect(css).toContain("transform:translateY(-180%)");
    expect(css).toContain(".skip-link:focus { transform:translateY(0);");
  });
});
