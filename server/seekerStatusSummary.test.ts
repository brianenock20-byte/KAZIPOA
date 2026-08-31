import { describe, expect, it } from "vitest";
import { summarizeSeekerApplicationStatuses } from "../shared/marketplaceView";

describe("seeker application status summary", () => {
  it("detects shortlist and interview signals from current status and history", () => {
    const result = summarizeSeekerApplicationStatuses(
      [
        { applicationId: 1, status: "reviewing", title: "Designer", company: "Studio", location: "Dar es Salaam" },
        { applicationId: 2, status: "interview", title: "Engineer", company: "Labs", location: "Arusha" },
        { applicationId: 3, status: "hired", title: "Analyst", company: "Works", location: "Dodoma" },
        { applicationId: 4, status: "rejected", title: "Assistant", company: "Office", location: "Mwanza" },
      ],
      [
        { applicationId: 1, nextStatus: "shortlisted", createdAt: "2026-08-20T10:00:00.000Z" },
        { applicationId: 2, nextStatus: "interview", interviewAt: "2026-08-30T09:00:00.000Z", note: "Bring your portfolio", createdAt: "2026-08-25T10:00:00.000Z" },
      ],
    );

    expect(result.shortlisted.map(item => item.applicationId)).toEqual([1, 2, 3]);
    expect(result.interviews.map(item => item.applicationId)).toEqual([2, 3]);
    expect(result.interviews[0]).toMatchObject({ interviewAt: "2026-08-30T09:00:00.000Z", note: "Bring your portfolio" });
  });

  it("prefers persisted invitation details and preserves the candidate response", () => {
    const result = summarizeSeekerApplicationStatuses(
      [{ applicationId: 12, status: "interview", title: "Nurse", company: "Clinic", interviewAt: "2026-09-01T11:30:00.000Z", interviewNote: "Use the east entrance", interviewResponse: "accepted" }],
      [{ applicationId: 12, nextStatus: "interview", interviewAt: "2026-09-01T10:00:00.000Z", note: "Older note", createdAt: "2026-08-25T10:00:00.000Z" }],
    );

    expect(result.interviews[0]).toMatchObject({ interviewAt: "2026-09-01T11:30:00.000Z", note: "Use the east entrance", response: "accepted" });
  });

  it("does not promote rejected or still-reviewing applications without a signal", () => {
    const result = summarizeSeekerApplicationStatuses(
      [{ applicationId: 8, status: "reviewing", title: "Intern", company: "Team" }, { applicationId: 9, status: "rejected", title: "Clerk", company: "Office" }],
      [{ applicationId: 8, nextStatus: "reviewing", createdAt: "2026-08-25T10:00:00.000Z" }],
    );

    expect(result.shortlisted).toHaveLength(0);
    expect(result.interviews).toHaveLength(0);
  });
});
