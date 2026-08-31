import { describe, expect, it } from "vitest";
import { filterSeekerInterviews, interviewResponseLabel, interviewResponseTone, unreadNotificationCount } from "../shared/marketplaceView";
import { kazipoaSocialLinks } from "../shared/socialLinks";

describe("Kazipoa social links", () => {
  it("uses the official WhatsApp, Instagram, and normalized TikTok destinations", () => {
    expect(kazipoaSocialLinks).toEqual({
      whatsapp: "https://whatsapp.com/channel/0029Vb8zG5PBvvsn15pQas15",
      instagram: "https://www.instagram.com/kazipoa_platform/",
      tiktok: "https://www.tiktok.com/@kazipoa_platform",
    });
  });
});

describe("notification bell and interview response presentation", () => {
  it("counts only unread persisted notifications", () => {
    expect(unreadNotificationCount([{ readAt: null }, { readAt: new Date() }, { readAt: null }])).toBe(2);
  });

  it("maps every interview response to a clear label and tone", () => {
    expect(interviewResponseLabel("accepted")).toBe("Accepted");
    expect(interviewResponseTone("accepted")).toBe("accepted");
    expect(interviewResponseLabel("declined")).toBe("Declined");
    expect(interviewResponseTone("declined")).toBe("declined");
    expect(interviewResponseLabel("pending")).toBe("Pending");
    expect(interviewResponseTone(null)).toBe("pending");
  });
});

describe("seeker interview filter", () => {
  const now = new Date("2026-08-26T12:00:00.000Z");
  const interviews = [
    { applicationId: 1, interviewAt: "2026-08-27T09:00:00.000Z" },
    { applicationId: 2, interviewAt: "2026-08-20T09:00:00.000Z" },
    { applicationId: 3, interviewAt: null },
  ];

  it("returns scheduled interviews from now onward for upcoming", () => {
    expect(filterSeekerInterviews(interviews, "upcoming", now).map(item => item.applicationId)).toEqual([1, 3]);
  });

  it("returns only scheduled interviews before now for past", () => {
    expect(filterSeekerInterviews(interviews, "past", now).map(item => item.applicationId)).toEqual([2]);
  });
});
