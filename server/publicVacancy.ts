import type { Vacancy } from "../drizzle/schema";
import { isTestVacancy } from "../shared/testVacancy";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

export function publicVacancyPath(vacancyId: number | string) {
  return `/vacancies/${encodeURIComponent(String(vacancyId))}`;
}

const PUBLIC_SITE_ORIGIN = "https://kazijob-fjgmdyye.manus.space";

export function canonicalOrigin(requestOrigin?: string) {
  const candidate = process.env.CANONICAL_ORIGIN || requestOrigin;
  let isInternalHost = false;
  try {
    isInternalHost = candidate ? /(^|\.)a\.run\.app$|(^|\.)manus\.computer$/i.test(new URL(candidate).hostname) : false;
  } catch {
    isInternalHost = true;
  }
  const origin = candidate && !isInternalHost ? candidate : PUBLIC_SITE_ORIGIN;
  return origin.replace(/^http:\/\//i, "https://").replace(/\/$/, "");
}

export function publicVacancyJobPosting(vacancy: Pick<Vacancy, "id" | "title" | "company" | "location" | "salary" | "description" | "deadline" | "createdAt">, origin: string) {
  const canonical = `${canonicalOrigin(origin)}${publicVacancyPath(vacancy.id)}`;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description: vacancy.description,
    datePosted: new Date(vacancy.createdAt).toISOString(),
    validThrough: new Date(vacancy.deadline).toISOString(),
    hiringOrganization: { "@type": "Organization", name: vacancy.company },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: vacancy.location, addressCountry: "TZ" } },
    identifier: { "@type": "PropertyValue", name: "Kazipoa vacancy", value: String(vacancy.id) },
    url: canonical,
  };
}

export function publicVacancyJobPostingJsonLd(vacancy: Pick<Vacancy, "id" | "title" | "company" | "location" | "salary" | "description" | "deadline" | "createdAt">, origin: string) {
  return JSON.stringify(publicVacancyJobPosting(vacancy, origin)).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export function publicVacancyMetadata(vacancy: Pick<Vacancy, "id" | "title" | "company" | "location" | "salary" | "description"> & Partial<Pick<Vacancy, "isTest" | "testBatchId">>, origin: string) {
  const canonical = `${canonicalOrigin(origin)}${publicVacancyPath(vacancy.id)}`;
  const testOnly = isTestVacancy(vacancy);
  const title = `${vacancy.title} at ${vacancy.company} | Kazipoa`;
  const description = testOnly ? `TEST VACANCY: ${vacancy.company} listed ${vacancy.title} in ${vacancy.location}. Verify details and apply through the original source.` : `${vacancy.company} is hiring a ${vacancy.title} in ${vacancy.location}. ${vacancy.salary}. Find the full role details and apply on Kazipoa.`;
  return { title, description, canonical, siteName: "Kazipoa", type: "article", image: `${canonicalOrigin(origin)}/manus-storage/kazipoa-hero_3140ef94.jpg` };
}

export function renderPublicVacancyMetadata(template: string, vacancy: Pick<Vacancy, "id" | "title" | "company" | "location" | "salary" | "description" | "deadline" | "createdAt"> & Partial<Pick<Vacancy, "isTest" | "testBatchId">>, origin: string) {
  const meta = publicVacancyMetadata(vacancy, origin);
  const replacements: Record<string, string> = {
    "<title>Kazipoa | Tanzania Private-Sector Jobs &amp; Recruitment</title>": `<title>${escapeHtml(meta.title)}</title>`,
    "<title>Kazipoa — Find Work. Find Talent.</title>": `<title>${escapeHtml(meta.title)}</title>`,
    '<meta name="description" content="Find private-sector jobs in Tanzania and connect with verified employers through Kazipoa. Search jobs, build your professional profile and apply." />': `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    '<meta name="description" content="Kazipoa connects job seekers and verified employers across Tanzania with clearer, safer opportunities." />': `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    '<link rel="canonical" href="https://portol.kazipoa.co.tz/" />': `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
    '<meta property="og:type" content="website" />': `<meta property="og:type" content="${meta.type}" />`,
    '<meta property="og:title" content="Kazipoa | Tanzania Private-Sector Jobs &amp; Recruitment" />': `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    '<meta property="og:title" content="Kazipoa — Find Work. Find Talent." />': `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    '<meta property="og:description" content="Find private-sector jobs in Tanzania and connect with verified employers through Kazipoa. Search jobs, build your professional profile and apply." />': `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    '<meta property="og:description" content="Find clearer, safer private-sector opportunities across Tanzania." />': `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    '<meta property="og:url" content="https://portol.kazipoa.co.tz/" />': `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`,
    '<meta name="twitter:title" content="Kazipoa | Tanzania Private-Sector Jobs &amp; Recruitment" />': `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    '<meta name="twitter:title" content="Kazipoa — Find Work. Find Talent." />': `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    '<meta name="twitter:description" content="Find private-sector jobs in Tanzania and connect with verified employers through Kazipoa. Search jobs, build your professional profile and apply." />': `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    '<meta name="twitter:description" content="Find clearer, safer private-sector opportunities across Tanzania." />': `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  };
  let result = template;
  for (const [from, to] of Object.entries(replacements)) result = result.replace(from, () => to);
  const imageTags = `<meta property="og:image" content="${escapeHtml(meta.image)}" />\n    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />`;
  const testOnly = isTestVacancy(vacancy);
  const indexingTags = testOnly ? '<meta name="robots" content="noindex, nofollow, noarchive" />' : "";
  const structuredData = testOnly ? "" : `<script type="application/ld+json">${publicVacancyJobPostingJsonLd(vacancy, origin)}</script>`;
  return result.replace('<meta property="og:url"', `${imageTags}\n    <meta property="og:url"`).replace("</head>", `${indexingTags}\n    ${structuredData}\n  </head>`);
}

export function renderSiteMetadata(template: string, origin: string) {
  const canonical = `${canonicalOrigin(origin)}/`;
  return template
    .replace('<link rel="canonical" href="https://portol.kazipoa.co.tz/" />', `<link rel="canonical" href="${escapeHtml(canonical)}" />`)
    .replace('<meta property="og:url" content="https://portol.kazipoa.co.tz/" />', `<meta property="og:url" content="${escapeHtml(canonical)}" />`);
}
