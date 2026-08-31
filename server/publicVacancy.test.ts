import { describe, expect, it } from "vitest";
import { canonicalOrigin, publicVacancyMetadata, publicVacancyPath, renderPublicVacancyMetadata } from "./publicVacancy";
import { TEST_VACANCY_BATCH_ID } from "../shared/testVacancy";

const vacancy = { id: 17, title: "Legal Officer <Senior>", company: "A&B Tanzania", location: "Dar es Salaam", salary: "TZS 2,000,000", description: "A trusted role for a qualified professional.", deadline: new Date("2026-09-30T00:00:00.000Z"), createdAt: new Date("2026-08-20T00:00:00.000Z") };

describe("public vacancy social metadata", () => {
  it("builds canonical public vacancy paths", () => {
    expect(publicVacancyPath(17)).toBe("/vacancies/17");
    expect(publicVacancyMetadata(vacancy, "https://kazipoa.co.tz/").canonical).toBe("https://kazipoa.co.tz/vacancies/17");
  });

  it("falls back to the public Kazipoa domain for internal deployment hosts", () => {
    expect(canonicalOrigin("https://itc3flvoi3-4c2qlj7g3a-uk.a.run.app")).toBe("https://kazijob-fjgmdyye.manus.space");
    expect(canonicalOrigin("https://3000-example.manus.computer")).toBe("https://kazijob-fjgmdyye.manus.space");
  });

  it("escapes database content in title and social metadata", () => {
    const template = '<head><title>Kazipoa — Find Work. Find Talent.</title><meta name="description" content="Kazipoa connects job seekers and verified employers across Tanzania with clearer, safer opportunities." /><link rel="canonical" href="https://portol.kazipoa.co.tz/" /><meta property="og:type" content="website" /><meta property="og:title" content="Kazipoa — Find Work. Find Talent." /><meta property="og:description" content="Find clearer, safer private-sector opportunities across Tanzania." /><meta property="og:url" content="https://portol.kazipoa.co.tz/" /><meta name="twitter:title" content="Kazipoa — Find Work. Find Talent." /><meta name="twitter:description" content="Find clearer, safer private-sector opportunities across Tanzania." /></head>';
    const rendered = renderPublicVacancyMetadata(template, vacancy, "https://kazipoa.co.tz");
    expect(rendered).toContain("Legal Officer &lt;Senior&gt; at A&amp;B Tanzania | Kazipoa");
    expect(rendered).toContain("https://kazipoa.co.tz/vacancies/17");
    expect(rendered).toContain('property="og:image"');
    expect(rendered).not.toContain("<Senior>");
    const jsonLd = rendered.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    expect(jsonLd).toBeTruthy();
    const structuredData = JSON.parse(jsonLd!);
    expect(structuredData).toMatchObject({ "@context": "https://schema.org", "@type": "JobPosting", title: "Legal Officer <Senior>", url: "https://kazipoa.co.tz/vacancies/17", validThrough: "2026-09-30T00:00:00.000Z", hiringOrganization: { name: "A&B Tanzania" }, jobLocation: { address: { addressLocality: "Dar es Salaam", addressCountry: "TZ" } } });
  });
});


describe("test vacancy indexing safeguards", () => {
  it("marks imported test vacancies noindex and omits JobPosting JSON-LD", () => {
    const testRecord = { ...vacancy, isTest: 1, testBatchId: TEST_VACANCY_BATCH_ID };
    const template = '<head><title>Kazipoa — Find Work. Find Talent.</title><meta name="description" content="Kazipoa connects job seekers and verified employers across Tanzania with clearer, safer opportunities." /><link rel="canonical" href="https://portol.kazipoa.co.tz/" /><meta property="og:type" content="website" /><meta property="og:title" content="Kazipoa — Find Work. Find Talent." /><meta property="og:description" content="Find clearer, safer private-sector opportunities across Tanzania." /><meta property="og:url" content="https://portol.kazipoa.co.tz/" /><meta name="twitter:title" content="Kazipoa — Find Work. Find Talent." /><meta name="twitter:description" content="Find clearer, safer private-sector opportunities across Tanzania." /></head>';
    const rendered = renderPublicVacancyMetadata(template, testRecord, "https://kazipoa.co.tz");
    expect(rendered).toContain('name="robots" content="noindex, nofollow, noarchive"');
    expect(rendered).not.toContain('type="application/ld+json"');
    expect(publicVacancyMetadata(testRecord, "https://kazipoa.co.tz").description).toContain("TEST VACANCY");
  });
});
