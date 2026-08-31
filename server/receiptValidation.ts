export const RECEIPT_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
export const MAX_RECEIPT_BYTES = 5_000_000;

export type ReceiptInput = {
  base64?: string;
  name?: string;
  mimeType?: string;
};

export function validateReceiptInput(input: ReceiptInput) {
  if (!input.base64) return { hasReceipt: false as const };
  if (!input.name || !input.mimeType) throw new Error("Receipt name and type are required");
  if (!RECEIPT_MIME_TYPES.includes(input.mimeType as (typeof RECEIPT_MIME_TYPES)[number])) throw new Error("Receipt must be JPG, PNG, or PDF");
  const raw = input.base64.replace(/^data:[^;]+;base64,/, "");
  const bytes = Buffer.from(raw, "base64");
  if (bytes.byteLength > MAX_RECEIPT_BYTES) throw new Error("Receipt must be 5MB or smaller");
  return { hasReceipt: true as const, raw, bytes };
}
