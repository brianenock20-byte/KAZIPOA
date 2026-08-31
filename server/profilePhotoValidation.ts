const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateProfilePhotoInput(input: { base64: string; name: string; mimeType: string }) {
  if (!input.name.trim() || input.name.length > 180) throw new Error("Profile photo filename is required and must be 180 characters or fewer");
  if (!ALLOWED_PROFILE_PHOTO_TYPES.has(input.mimeType)) throw new Error("Profile photo must be a JPG, PNG, or WebP image");
  const payload = input.base64.includes(",") ? input.base64.slice(input.base64.indexOf(",") + 1) : input.base64;
  if (!payload || !/^[A-Za-z0-9+/=\r\n]+$/.test(payload)) throw new Error("Invalid profile photo payload");
  const bytes = Buffer.from(payload, "base64");
  if (!bytes.length || bytes.length > MAX_PROFILE_PHOTO_BYTES) throw new Error("Profile photo must be between 1 byte and 5 MB");
  return { bytes, size: bytes.length };
}

export const profilePhotoUploadLimits = { maxBytes: MAX_PROFILE_PHOTO_BYTES, mimeTypes: Array.from(ALLOWED_PROFILE_PHOTO_TYPES) } as const;
