export type SafetyReportKind = "job" | "employer";

export function safetyReportSupportMessage(kind: SafetyReportKind): string {
  return kind === "job"
    ? "I would like to report a suspicious job. Please share the vacancy title, employer name, and what concerned you."
    : "I would like to report a suspicious employer. Please share the employer name, vacancy title, and what concerned you.";
}
