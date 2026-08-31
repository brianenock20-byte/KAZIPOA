import { ENV } from "./_core/env";

export type PostmarkEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey: string;
};

export type PostmarkEmailResult =
  | { status: "sent"; providerId: string | null }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value: string) => value.replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[character] ?? character));

export function buildApplicationStatusEmail(input: { previousStatus: string; nextStatus: string; applicationId: number; interviewAt?: Date | string | null; interviewNote?: string | null }) {
  const isInterview = input.nextStatus.toLowerCase() === "interview";
  const interviewDate = input.interviewAt ? new Date(input.interviewAt).toLocaleString("en-TZ", { timeZone: "Africa/Dar_es_Salaam", dateStyle: "medium", timeStyle: "short" }) : null;
  const scheduleText = isInterview && interviewDate ? `\n\nInterview schedule: ${interviewDate}${input.interviewNote ? `\nMessage from the employer: ${input.interviewNote}` : ""}` : "";
  const scheduleHtml = isInterview && interviewDate ? `<p><strong>Interview schedule:</strong> ${escapeHtml(interviewDate)}</p>${input.interviewNote ? `<p><strong>Message from the employer:</strong> ${escapeHtml(input.interviewNote)}</p>` : ""}` : "";
  const subject = isInterview ? `Kazipoa interview invitation for application #${input.applicationId}` : `Kazipoa application update: ${input.nextStatus}`;
  const text = `Hello,\n\nYour application (#${input.applicationId}) status changed from ${input.previousStatus} to ${input.nextStatus}.${scheduleText}\n\nSign in to Kazipoa to view your application history.\n${ENV.appBaseUrl}/dashboard\n\nKazipoa`;
  const html = `<p>Hello,</p><p>Your application <strong>#${input.applicationId}</strong> status changed from <strong>${escapeHtml(input.previousStatus)}</strong> to <strong>${escapeHtml(input.nextStatus)}</strong>.</p>${scheduleHtml}<p><a href="${ENV.appBaseUrl}/dashboard">Sign in to Kazipoa to view your application history</a>.</p><p>Kazipoa</p>`;
  return { subject, text, html };
}

export function buildCustomAuthVerificationEmail(input: { name: string; token: string }) {
  const verifyUrl = `${ENV.appBaseUrl}/verify-email?token=${encodeURIComponent(input.token)}`;
  const safeName = escapeHtml(input.name || "there");
  return {
    subject: "Verify your Kazipoa email",
    text: `Hello ${input.name || "there"},\n\nVerify your Kazipoa email within 24 hours:\n${verifyUrl}\n\nIf you did not create this account, you can ignore this message.\n\nKazipoa`,
    html: `<p>Hello ${safeName},</p><p>Verify your Kazipoa email within 24 hours:</p><p><a href="${verifyUrl}">Verify email</a></p><p>If you did not create this account, you can ignore this message.</p><p>Kazipoa</p>`,
  };
}

export function buildCustomAuthPasswordResetEmail(input: { name: string; token: string }) {
  const resetUrl = `${ENV.appBaseUrl}/reset-password?token=${encodeURIComponent(input.token)}`;
  const safeName = escapeHtml(input.name || "there");
  return {
    subject: "Reset your Kazipoa password",
    text: `Hello ${input.name || "there"},\n\nReset your Kazipoa password within 30 minutes:\n${resetUrl}\n\nIf you did not request this, you can ignore this message.\n\nKazipoa`,
    html: `<p>Hello ${safeName},</p><p>Reset your Kazipoa password within 30 minutes:</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this message.</p><p>Kazipoa</p>`,
  };
}

export function buildSupportTicketEmail(input: { ticketReference: string; requesterName: string; requesterEmail: string; message: string }) { const subject = `Kazipoa support ticket ${input.ticketReference}`; const text = `New Kazipoa support ticket\n\nReference: ${input.ticketReference}\nFrom: ${input.requesterName} <${input.requesterEmail}>\n\n${input.message}`; const html = `<p>New Kazipoa support ticket</p><p><strong>Reference:</strong> ${input.ticketReference}<br><strong>From:</strong> ${input.requesterName} &lt;${input.requesterEmail}&gt;</p><p>${input.message.replace(/\n/g, "<br>")}</p>`; return { subject, text, html }; }

export function buildSupportTicketAutoReplyEmail(input: { ticketReference: string; requesterName: string }) { const name = escapeHtml(input.requesterName || "there"); const reference = escapeHtml(input.ticketReference); const subject = `We received your Kazipoa support request ${input.ticketReference}`; const text = `Hello ${input.requesterName || "there"},\n\nThank you for contacting Kazipoa. We received your support request and recorded it under reference ${input.ticketReference}. Our team will review it and reply using the contact details you provided.\n\nKazipoa Support`; const html = `<p>Hello ${name},</p><p>Thank you for contacting Kazipoa. We received your support request and recorded it under reference <strong>${reference}</strong>.</p><p>Our team will review it and reply using the contact details you provided.</p><p>Kazipoa Support</p>`; return { subject, text, html }; }

export function buildEmployerSupportTicketUpdateEmail(input: { ticketReference: string; status: string; priority: string; adminNote?: string | null }) { const subject = `Kazipoa ticket ${input.ticketReference} update`; const text = `Your Kazipoa support ticket ${input.ticketReference} is now ${input.status}.\nPriority: ${input.priority}.\n${input.adminNote ? `Admin note: ${input.adminNote}\n` : ""}Sign in to review your support request.`; const html = `<p>Your Kazipoa support ticket <strong>${input.ticketReference}</strong> is now <strong>${input.status}</strong>.</p><p>Priority: ${input.priority}</p>${input.adminNote ? `<p><strong>Admin note:</strong> ${input.adminNote}</p>` : ""}`; return { subject, text, html }; }

export function buildEmployerPaymentStatusEmail(input: { paymentId: number; state: string; providerReference?: string | null; adminNote?: string | null }) { const subject = `Kazipoa payment #${input.paymentId} status update`; const text = `Your Kazipoa payment #${input.paymentId} is now ${input.state}.\nTransaction reference: ${input.providerReference || "Not provided"}.\n${input.adminNote ? `Admin note: ${input.adminNote}\n` : ""}Sign in to review your payment timeline.`; const html = `<p>Your Kazipoa payment <strong>#${input.paymentId}</strong> is now <strong>${input.state}</strong>.</p><p>Transaction reference: ${input.providerReference || "Not provided"}</p>${input.adminNote ? `<p><strong>Admin note:</strong> ${input.adminNote}</p>` : ""}`; return { subject, text, html }; }

export function buildEmployerVacancyDecisionEmail(input: { vacancyId: number; title: string; action: "approve" | "reject" | "request_changes"; reason?: string | null }) { const labels = { approve: "approved and published", reject: "rejected", request_changes: "returned for changes" } as const; const label = labels[input.action]; const subject = `Kazipoa vacancy #${input.vacancyId} ${input.action === "approve" ? "approved" : input.action === "reject" ? "rejected" : "needs changes"}`; const text = `Your vacancy "${input.title}" (#${input.vacancyId}) was ${label} by Admin.\n${input.reason ? `Admin note: ${input.reason}\n` : ""}Sign in to review the decision: ${ENV.appBaseUrl}/dashboard`; const html = `<p>Your vacancy <strong>${escapeHtml(input.title)}</strong> (#${input.vacancyId}) was <strong>${label}</strong> by Admin.</p>${input.reason ? `<p><strong>Admin note:</strong> ${escapeHtml(input.reason)}</p>` : ""}<p><a href="${ENV.appBaseUrl}/dashboard">Sign in to review the decision</a>.</p>`; return { subject, text, html }; }

export async function sendPostmarkEmail(input: PostmarkEmailInput): Promise<PostmarkEmailResult> {
  if (!EMAIL_PATTERN.test(input.to)) return { status: "skipped", reason: "Recipient email is missing or invalid" };
  if (!ENV.postmarkServerToken || !ENV.postmarkFromEmail) return { status: "skipped", reason: "Postmark is not configured" };
  try {
    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "X-Postmark-Server-Token": ENV.postmarkServerToken, "X-Postmark-Message-Stream": ENV.postmarkMessageStream, "Idempotency-Key": input.idempotencyKey },
      body: JSON.stringify({ From: ENV.postmarkFromEmail, To: input.to, Subject: input.subject, TextBody: input.text, HtmlBody: input.html, MessageStream: ENV.postmarkMessageStream }),
    });
    const body = await response.json().catch(() => ({})) as { MessageID?: string; Message?: string };
    if (!response.ok) return { status: "failed", reason: body.Message ?? `Postmark returned ${response.status}` };
    return { status: "sent", providerId: body.MessageID ?? null };
  } catch (error) {
    return { status: "failed", reason: error instanceof Error ? error.message : "Postmark request failed" };
  }
}


export function buildInterviewInvitationEmail(input: { vacancyTitle: string; company: string; scheduledAt: Date | string; note?: string | null; inviteUrl: string }) {
  const date = new Date(input.scheduledAt).toLocaleString("en-TZ", { timeZone: "Africa/Dar_es_Salaam", dateStyle: "medium", timeStyle: "short" });
  const title = escapeHtml(input.vacancyTitle);
  const company = escapeHtml(input.company);
  const note = input.note?.trim() ? `<p><strong>Message from the employer:</strong> ${escapeHtml(input.note.trim())}</p>` : "";
  const subject = `Interview invitation: ${input.vacancyTitle}`;
  const text = `You have been invited to interview for ${input.vacancyTitle} at ${input.company}.\n\nInterview schedule: ${date}${input.note?.trim() ? `\nMessage from the employer: ${input.note.trim()}` : ""}\n\nReview the invitation and respond using this secure link. It expires after the scheduled interview window:\n${input.inviteUrl}\n\nKazipoa`;
  const html = `<p>You have been invited to interview for <strong>${title}</strong> at ${company}.</p><p><strong>Interview schedule:</strong> ${escapeHtml(date)}</p>${note}<p><a href="${input.inviteUrl}">Review invitation and respond securely</a></p><p>The link expires after the scheduled interview window. A live video room will only be available after a provider is configured.</p><p>Kazipoa</p>`;
  return { subject, text, html };
}
