const MAX_CV_BYTES = 8 * 1024 * 1024;
const ALLOWED_CV_TYPES = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

export function validateCvInput(input: { base64: string; name: string; mimeType: string }) {
  if (!input.name.trim() || input.name.length > 180) throw new Error("CV filename is required and must be 180 characters or fewer");
  if (!ALLOWED_CV_TYPES.has(input.mimeType)) throw new Error("CV must be a PDF, DOC, or DOCX file");
  const payload = input.base64.includes(",") ? input.base64.slice(input.base64.indexOf(",") + 1) : input.base64;
  if (!payload || !/^[A-Za-z0-9+/=\r\n]+$/.test(payload)) throw new Error("Invalid CV file payload");
  const bytes = Buffer.from(payload, "base64");
  if (!bytes.length || bytes.length > MAX_CV_BYTES) throw new Error("CV must be between 1 byte and 8 MB");
  return { bytes, size: bytes.length };
}

export const cvUploadLimits = { maxBytes: MAX_CV_BYTES, mimeTypes: Array.from(ALLOWED_CV_TYPES) } as const;
