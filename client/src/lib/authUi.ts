export type CapsLockEventLike = {
  getModifierState: (key: "CapsLock") => boolean;
};

export function passwordInputType(visible: boolean): "text" | "password" {
  return visible ? "text" : "password";
}

export function normalizeEmailInput(value: string): string {
  return value.trim().toLowerCase();
}

export function passwordToggleLabel(label: string, visible: boolean): string {
  return `${visible ? "Hide" : "Show"} ${label.toLowerCase()}`;
}

export function capsLockEnabled(event: CapsLockEventLike): boolean {
  return event.getModifierState("CapsLock");
}

export function nextCapsLockState(current: boolean, event: CapsLockEventLike & { key?: string; type?: string }): boolean {
  if (event.key === "CapsLock") {
    return event.type === "keydown" ? !current : current;
  }
  return capsLockEnabled(event);
}

export type PasswordStrength = "empty" | "weak" | "fair" | "strong";

export function passwordStrength(password: string): PasswordStrength {
  if (!password) return "empty";
  let score = 0;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score >= 4) return "strong";
  if (score >= 2) return "fair";
  return "weak";
}

export function emailValidationMessage(email: string): string | null {
  if (!email.trim()) return "Weka barua pepe yako.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Weka barua pepe yenye muundo sahihi, mfano jina@example.com.";
  return null;
}

export function passwordValidationMessage(password: string, requiredLength = 12): string | null {
  if (!password) return "Weka nenosiri lako.";
  if (password.length < requiredLength) return `Nenosiri liwe na angalau herufi ${requiredLength}.`;
  return null;
}
