import { describe, expect, it } from "vitest";
import { capsLockEnabled, nextCapsLockState, normalizeEmailInput, passwordInputType, passwordToggleLabel } from "./authUi";

describe("first-party authentication UI helpers", () => {
  it("normalizes email input without changing password semantics", () => {
    expect(normalizeEmailInput("  BrianEnock20@GMAIL.COM ")).toBe("brianenock20@gmail.com");
    expect(normalizeEmailInput("Candidate+Jobs@Example.org")).toBe("candidate+jobs@example.org");
  });

  it("switches the password input type without changing the value", () => {
    expect(passwordInputType(false)).toBe("password");
    expect(passwordInputType(true)).toBe("text");
  });

  it("uses accessible show/hide labels", () => {
    expect(passwordToggleLabel("Password", false)).toBe("Show password");
    expect(passwordToggleLabel("Password", true)).toBe("Hide password");
    expect(passwordToggleLabel("Confirm password", false)).toBe("Show confirm password");
  });

  it("reads Caps Lock on/off transitions from keyboard events", () => {
    const onEvent = { getModifierState: (key: "CapsLock") => key === "CapsLock" };
    const offEvent = { getModifierState: (_key: "CapsLock") => false };
    expect(capsLockEnabled(onEvent)).toBe(true);
    expect(capsLockEnabled(offEvent)).toBe(false);
  });

  it("does not infer Caps Lock from uppercase email text", () => {
    const email = "BRIANENOCK20@GMAIL.COM";
    expect(email).toContain("@");
    expect(capsLockEnabled({ getModifierState: () => false })).toBe(false);
  });

  it("toggles on keydown and preserves the new state through keyup", () => {
    const keydown = { key: "CapsLock", type: "keydown", getModifierState: () => true };
    const keyup = { key: "CapsLock", type: "keyup", getModifierState: () => true };
    expect(nextCapsLockState(false, keydown)).toBe(true);
    expect(nextCapsLockState(true, keyup)).toBe(true);
    expect(nextCapsLockState(true, { key: "CapsLock", type: "keydown", getModifierState: () => false })).toBe(false);
  });
});
