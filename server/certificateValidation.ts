const MAX_CERTIFICATE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CERTIFICATE_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);

export function validateCertificateInput(input: { base64: string; name: string; mimeType: string }) {
  if (!input.name.trim()) throw new Error("Certificate file name is required");
  if (!ALLOWED_CERTIFICATE_TYPES.has(input.mimeType)) throw new Error("Certificate must be JPG, PNG, or PDF");
  const raw = input.base64.replace(/^data:[^;]+;base64,/, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) throw new Error("Invalid certificate file payload");
  const bytes = Buffer.from(raw, "base64");
  if (!bytes.length || bytes.byteLength > MAX_CERTIFICATE_BYTES) throw new Error("Certificate must be between 1 byte and 5 MB");
  return { bytes, size: bytes.byteLength };
}

export const certificateUploadLimits = { maxBytes: MAX_CERTIFICATE_BYTES, mimeTypes: Array.from(ALLOWED_CERTIFICATE_TYPES) } as const;
