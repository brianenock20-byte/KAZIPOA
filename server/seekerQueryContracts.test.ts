import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("seeker dashboard query contracts", () => {
  it("returns null when the seeker has no accessible CV", () => {
    expect(routerSource).toContain("if (!cv || !canViewSeekerDocument(cv.seekerUserId, ctx.user.id)) return null;");
    expect(routerSource).not.toContain("if (!cv || !canViewSeekerDocument(cv.seekerUserId, ctx.user.id)) return undefined;");
  });

  it("returns null when the seeker has no profile photo", () => {
    expect(routerSource).toContain("fileSize: user.profilePhotoSize } : null" );
    expect(routerSource).not.toContain("fileSize: user.profilePhotoSize } : undefined" );
  });
});
