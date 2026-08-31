import { describe, expect, it } from "vitest";
import { vacancyTheme } from "./PublicVacancy";

describe("vacancyTheme", () => {
  it("maps vacancy signals to workplace themes", () => {
    expect(vacancyTheme({ category: "Accounting & Finance", title: "Accountant" })).toBe("finance");
    expect(vacancyTheme({ category: "IT & Cybersecurity", title: "Software Developer" })).toBe("technology");
    expect(vacancyTheme({ category: "Education", title: "Teacher" })).toBe("education");
    expect(vacancyTheme({ category: "Healthcare", title: "Clinical Officer" })).toBe("healthcare");
    expect(vacancyTheme({ category: "Hospitality", title: "Chef" })).toBe("hospitality");
  });

  it("uses a stable general theme for unmatched content", () => {
    expect(vacancyTheme({ category: "Other", title: "Community Liaison" })).toBe("general");
  });
});
