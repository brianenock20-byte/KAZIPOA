import { describe, expect, it } from "vitest";
import { profilePhotoUploadLimits, validateProfilePhotoInput } from "./profilePhotoValidation";

describe("profile photo validation", () => {
  it("accepts bounded JPEG, PNG, and WebP payloads", () => {
    const payload = Buffer.from("valid-image-bytes").toString("base64");
    expect(validateProfilePhotoInput({ base64: `data:image/png;base64,${payload}`, name: "portrait.png", mimeType: "image/png" }).size).toBeGreaterThan(0);
    expect(profilePhotoUploadLimits.mimeTypes).toEqual(expect.arrayContaining(["image/jpeg", "image/png", "image/webp"]));
  });

  it("rejects non-image files and malformed payloads", () => {
    expect(() => validateProfilePhotoInput({ base64: "abc", name: "cv.pdf", mimeType: "application/pdf" })).toThrow(/JPG, PNG, or WebP/);
    expect(() => validateProfilePhotoInput({ base64: "not-base64!", name: "portrait.png", mimeType: "image/png" })).toThrow(/Invalid profile photo payload/);
  });

  it("rejects oversized payloads", () => {
    const payload = Buffer.alloc(profilePhotoUploadLimits.maxBytes + 1).toString("base64");
    expect(() => validateProfilePhotoInput({ base64: payload, name: "portrait.png", mimeType: "image/png" })).toThrow(/5 MB/);
  });
});
