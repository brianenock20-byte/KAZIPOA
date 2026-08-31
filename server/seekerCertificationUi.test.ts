import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const previewSource = readFileSync(resolve(process.cwd(), "client/src/components/SecureCvPreview.tsx"), "utf8");

describe("Job Seeker certification and CV access contracts", () => {
  it("exposes an Add certificate action with a pending state and success feedback", () => {
    expect(homeSource).toContain('{addCertification.isPending ? "Adding certificate…" : "Add certificate"}');
    expect(homeSource).toContain('"Certificate added successfully"');
  });

  it("supports ownership-scoped certificate edit and delete actions", () => {
    expect(routerSource).toContain("updateCertification: seekerProcedure");
    expect(dbSource).toContain("updateSeekerCertification(seekerUserId: number, id: number");
    expect(dbSource).toContain("eq(seekerCertifications.id, id), eq(seekerCertifications.seekerUserId, seekerUserId)");
    expect(homeSource).toContain('onClick={() => beginCertificationEdit(item.id, item.name)}');
    expect(homeSource).toContain('onClick={() => void deleteCertification(item.id, item.name)}');
    expect(homeSource).toContain("Delete certificate");
  });

  it("keeps certificate proof optional and limited to supported private uploads", () => {
    expect(homeSource).toContain('Certificate proof (optional)');
    expect(homeSource).toContain('accept="image/jpeg,image/png,application/pdf"');
    expect(homeSource).toContain('maximum 5 MB. It stays private in your portfolio.');
  });

  it("renders a private in-app preview for the seeker CV and employer candidate CV", () => {
    expect(homeSource).toContain('<SecureCvPreview previewUrl={seekerCvQuery.data.storageUrl}');
    expect(homeSource).toContain('audience="seeker"');
    expect(homeSource).toContain('audience="employer"');
    expect(homeSource).toContain('candidateCvQuery.data.previewUrl');
    expect(previewSource).toContain('className="cv-inline-frame"');
    expect(previewSource).not.toContain('target="_blank"');
  });
});
