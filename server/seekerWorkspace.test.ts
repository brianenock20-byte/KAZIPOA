import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Seeker workspace clarity", () => {
  it("keeps portfolio summary actions connected to the live editors", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).toContain('onClick={() => jumpToSeekerSection("seeker-education")}');
    expect(source).toContain('onClick={() => jumpToSeekerSection("seeker-experience")}');
    expect(source).toContain('onClick={() => jumpToSeekerSection("seeker-skills")}');
    expect(source).toContain('onClick={() => jumpToSeekerSection("seeker-certifications")}');
    expect(source).toContain('const firstField = section.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>');
    expect(source).toContain('type="button" className="outline-button small" onClick={() => jumpToSeekerSection("seeker-education")}');
    expect(source).toContain('type="button" className="outline-button small" onClick={() => jumpToSeekerSection("seeker-experience")}');
    expect(source).toContain('type="button" className="outline-button small" onClick={() => jumpToSeekerSection("seeker-skills")}');
    expect(source).toContain('type="button" className="outline-button small" onClick={() => jumpToSeekerSection("seeker-certifications")}');
    expect(source).toContain('seekerName={user?.name ?? registeredName}');
    expect(source).toContain('value={seekerEmail} readOnly');
    expect(source).toContain('O Level / Form Four');
    expect(source).toContain('Advanced Level / Form Six');
    expect(source).toContain('accept="image/jpeg,image/png,application/pdf"');
    expect(source).toContain('certificateAttachment?.base64');
    expect(source).toContain('View certificate proof');
    expect(source).not.toContain('onClick={() => toast("Education entries are saved to your secure seeker portfolio")}');
    expect(source).not.toContain('onClick={() => toast("Skills and certifications are saved to your secure seeker portfolio")}');
  });
});
