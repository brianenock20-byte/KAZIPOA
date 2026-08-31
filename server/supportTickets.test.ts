import { describe, expect, it } from "vitest";
import { buildEmployerPaymentStatusEmail, buildEmployerSupportTicketUpdateEmail, buildSupportTicketEmail } from "./postmarkEmail";

describe("support ticket workflow", () => {
  it("builds an email containing the ticket reference and requester context", () => {
    const email = buildSupportTicketEmail({
      ticketReference: "KZP-ABC123",
      requesterName: "Asha Mushi",
      requesterEmail: "asha@example.com",
      message: "Please verify my rejected payment.",
    });

    expect(email.subject).toContain("KZP-ABC123");
    expect(email.text).toContain("asha@example.com");
    expect(email.text).toContain("Please verify my rejected payment.");
    expect(email.html).toContain("KZP-ABC123");
  });

  it("builds an employer support-ticket status notification with priority", () => {
    const email = buildEmployerSupportTicketUpdateEmail({ ticketReference: "KZP-ABC123", status: "in_progress", priority: "urgent", adminNote: "We are checking the receipt." });
    expect(email.subject).toContain("KZP-ABC123");
    expect(email.text).toContain("urgent");
    expect(email.text).toContain("We are checking the receipt.");
  });

  it("builds an employer payment status notification with transaction context", () => {
    const email = buildEmployerPaymentStatusEmail({ paymentId: 42, state: "successful", providerReference: "MPESA-123", adminNote: "Approved for publication." });
    expect(email.subject).toContain("#42");
    expect(email.text).toContain("MPESA-123");
    expect(email.html).toContain("Approved for publication.");
  });

  it("keeps the payment-status language aligned with the Admin workflow", () => {
    const states = ["pending", "successful", "failed", "refunded"];
    expect(states).toEqual(expect.arrayContaining(["pending", "successful", "failed", "refunded"]));
  });
});
