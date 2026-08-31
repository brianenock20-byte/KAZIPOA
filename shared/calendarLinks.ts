export type InterviewCalendarEvent = {
  title: string;
  company?: string | null;
  note?: string | null;
  interviewAt: Date | string;
  location?: string | null;
};

function asDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function endDate(start: Date) {
  return new Date(start.getTime() + 60 * 60 * 1000);
}

export function googleCalendarUrl(event: InterviewCalendarEvent) {
  const start = asDate(event.interviewAt);
  const end = endDate(start);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Interview: ${event.title}`,
    dates: `${start.toISOString().replace(/[-:]/g, "").replace(/\.000Z$/, "Z")}/${end.toISOString().replace(/[-:]/g, "").replace(/\.000Z$/, "Z")}`,
    details: [event.company, event.note].filter(Boolean).join("\n\n"),
    location: event.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(event: InterviewCalendarEvent) {
  const start = asDate(event.interviewAt);
  const end = endDate(start);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: `Interview: ${event.title}`,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: [event.company, event.note].filter(Boolean).join("\n\n"),
    location: event.location ?? "",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
