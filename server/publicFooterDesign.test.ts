import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("public footer reference design contract", () => {
  const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
  const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("keeps the original footer hierarchy and real contact destinations", () => {
    expect(home).toContain('<footer className="site-footer">');
    expect(home).toContain('className="container footer-grid"');
    expect(home).toContain("Find work. Find talent. Move forward.");
    expect(home).toContain('href="mailto:infokazipoasupport@gmail.com?subject=Kazipoa%20Support%20Request"');
    expect(home).toContain("kazipoaSocialLinks.whatsapp");
    expect(home).toContain("kazipoaSocialLinks.instagram");
    expect(home).toContain("kazipoaSocialLinks.tiktok");
    expect(home).toContain("Join our WhatsApp Channel");
  });

  it("uses the supplied Deep Midnight Navy footer treatment and responsive columns", () => {
    expect(css).toContain(".site-footer {\n  background: #070d21;");
    expect(css).toContain("grid-template-columns: 1.45fr .82fr 1.15fr 1fr;");
    expect(css).toContain("border-top: 1px solid rgba(123,220,177,.10);");
    expect(css).toContain(".site-footer .footer-bottom { display:flex; justify-content:space-between;");
    expect(css).toContain(".site-footer .footer-grid { grid-template-columns:1fr; gap:28px; }");
  });
});
