import { NextRequest, NextResponse } from "next/server";
import { sendMail, FROM } from "@/lib/mailer";

const SFALL = "sfall@afcac.org";

export async function POST(req: NextRequest) {
  const { date, time, location, message, senderEmail, contactLabel, meetingTitle, firstName, lastName, organization, jobTitle, requesterCountry, whatsapp } = await req.json();

  if (!date || !time) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meet.afcac.org";

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || senderEmail || "—";

  const textBody = [
    `New bilateral meeting request received via the AFCAC EXPO 2026 platform.`,
    "",
    `Name         : ${fullName}`,
    organization     ? `Company      : ${organization}` : "",
    jobTitle         ? `Title        : ${jobTitle}` : "",
    requesterCountry ? `Country      : ${requesterCountry}` : "",
    `Email        : ${senderEmail || "—"}`,
    whatsapp         ? `WhatsApp     : ${whatsapp}` : "",
    "",
    `Wants to meet : ${contactLabel || meetingTitle || "—"}`,
    `Date          : ${date}`,
    `Time          : ${time}`,
    `Room          : ${location || "—"}`,
    message ? `\nMessage       : ${message}` : "",
    "",
    `Access administration : ${appUrl}/admin`,
    "",
    "---",
    "AFCAC Official Bilateral Meetings Platform — AFCAC EXPO 2026",
  ].filter(Boolean).join("\n");

  try {
    await sendMail({
      from: FROM,
      to: SFALL,
      replyTo: senderEmail || SFALL,
      subject: `[MEETING REQUEST] ${meetingTitle || contactLabel || "New request"} — ${date} ${time}`,
      text: textBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="background: #145847; padding: 24px 32px; border-radius: 10px 10px 0 0; text-align: center;">
            <img src="${appUrl}/afcac_logo.png" alt="AFCAC" style="height: 64px; max-width: 220px; object-fit: contain; display: block; margin: 0 auto;" />
            <p style="color: #a7d4c6; margin: 8px 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">New Bilateral Meeting Request</p>
          </div>
          <div style="background: white; padding: 32px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">
              A new bilateral meeting request has been submitted via the platform. Please review it and confirm the meeting.
            </p>

            <div style="background: #f3faf7; border: 1px solid #d1e9e2; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px; width: 130px; vertical-align: top;">Name</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px; font-weight: 600;">${fullName}</td>
                </tr>
                ${jobTitle ? `<tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px;">Title</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px;">${jobTitle}</td>
                </tr>` : ""}
                ${requesterCountry ? `<tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px;">Country</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px;">${requesterCountry}</td>
                </tr>` : ""}
                ${organization ? `<tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px;">Company</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px;">${organization}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Email</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px; font-weight: 600;">
                    <a href="mailto:${senderEmail}" style="color: #145847;">${senderEmail || "—"}</a>
                  </td>
                </tr>
                ${whatsapp ? `<tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px;">WhatsApp</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px;">${whatsapp}</td>
                </tr>` : ""}
                <tr><td colspan="2" style="padding: 10px 0 2px; border-top: 1px solid #e5e7eb;"></td></tr>
                <tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Wants to meet</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px; font-weight: 600;">${contactLabel || meetingTitle || "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px;">Date</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px; font-weight: 600;">${date}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px;">Time</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px; font-weight: 600;">${time}</td>
                </tr>
                ${location ? `<tr>
                  <td style="padding: 7px 0; color: #6b7280; font-size: 13px;">Room</td>
                  <td style="padding: 7px 0; color: #111827; font-size: 14px; font-weight: 600;">${location}</td>
                </tr>` : ""}
              </table>
            </div>

            ${message ? `
            <div style="border-left: 3px solid #145847; padding-left: 16px; margin-bottom: 24px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.05em;">Requester's message</p>
              <p style="color: #374151; font-size: 14px; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            ` : ""}

            <a href="${appUrl}/admin"
               style="display: inline-block; background: #145847; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">
              Manage in administration →
            </a>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
              AFCAC Official Bilateral Meetings Platform — AFCAC EXPO 2026<br>
              Once confirmed, the requester will automatically receive a confirmation email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-invitation] Send error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
