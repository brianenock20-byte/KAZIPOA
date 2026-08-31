import { invokeLLM } from "./_core/llm";
import { storageGetSignedUrl } from "./storage";

const MAX_ANALYSIS_BYTES = 8_000_000;

export function normalizeSuggestedSkills(values: unknown) {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.filter((value): value is string => typeof value === "string").map(value => value.trim()).filter(value => value.length >= 2 && value.length <= 80))).slice(0, 30);
}

export async function extractSkillsFromCv(input: { storageKey: string; mimeType: string; fileSize: number }) {
  if (input.fileSize > MAX_ANALYSIS_BYTES) throw new Error("This CV is too large for AI analysis");
  if (input.mimeType !== "application/pdf") throw new Error("AI CV reading currently supports PDF files. You can still add skills manually for Word documents.");
  const signedUrl = await storageGetSignedUrl(input.storageKey);
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You extract only explicit professional, technical, language, and workplace skills from a CV. Do not infer protected characteristics, personality, seniority, salary, or eligibility. Return JSON only." },
      { role: "user", content: [
        { type: "text", text: "Read this CV and return the skills explicitly mentioned. Keep each skill short and deduplicate the list." },
        { type: "file_url", file_url: { url: signedUrl, mime_type: "application/pdf" } },
      ] },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "cv_skill_extraction",
        strict: true,
        schema: { type: "object", properties: { skills: { type: "array", items: { type: "string" } } }, required: ["skills"], additionalProperties: false },
      },
    },
  });
  const content = response.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("AI returned an unreadable result");
  const parsed = JSON.parse(content) as { skills?: unknown };
  return { skills: normalizeSuggestedSkills(parsed.skills), source: "cv" as const };
}
