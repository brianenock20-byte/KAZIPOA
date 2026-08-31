import { describe, expect, it } from "vitest";
import { nextTheme, resolveStoredTheme } from "./ThemeContext";

describe("theme preference helpers", () => {
  it("accepts only valid stored theme values", () => {
    expect(resolveStoredTheme("dark", "light")).toBe("dark");
    expect(resolveStoredTheme("light", "dark")).toBe("light");
    expect(resolveStoredTheme("system", "light")).toBe("light");
    expect(resolveStoredTheme(null, "dark")).toBe("dark");
  });

  it("toggles between light and dark", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });
});
