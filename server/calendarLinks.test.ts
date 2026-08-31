import { describe, expect, it } from "vitest";
import { googleCalendarUrl, outlookCalendarUrl } from "../shared/calendarLinks";

describe("interview calendar links", () => {
  const event = { title: "Legal Officer", company: "Mwangaza Advisory", note: "Bring your portfolio", interviewAt: new Date("2026-09-10T09:00:00Z"), location: "Dar es Salaam" };

  it("creates Google Calendar and Outlook links with the interview details", () => {
    const google = googleCalendarUrl(event);
    const outlook = outlookCalendarUrl(event);
    expect(google).toContain("calendar.google.com/calendar/render");
    expect(google).toContain("Interview%3A+Legal+Officer");
    expect(outlook).toContain("outlook.live.com/calendar/0/deeplink/compose");
    expect(outlook).toContain("startdt=2026-09-10T09%3A00%3A00.000Z");
  });
});
