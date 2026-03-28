import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { to, date, time, location, message, senderName } = await req.json();

  if (!to || !date || !time || !location) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const { data, error } = await resend.emails.send({
    from: "ResaMeet <onboarding@resend.dev>",
    to,
    subject: `Invitation à une rencontre bilatérale — ${date} à ${time}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <div style="background: #145847; padding: 24px 32px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">ResaMeet</h1>
          <p style="color: #a7d4c6; margin: 4px 0 0; font-size: 13px;">Invitation à une rencontre bilatérale</p>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">
            ${senderName ? `<strong>${senderName}</strong> vous invite à une rencontre bilatérale.` : "Vous avez reçu une invitation à une rencontre bilatérale."}
          </p>

          <div style="background: #f3faf7; border: 1px solid #d1e9e2; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 110px;">📅 Date</td>
                <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">🕐 Heure</td>
                <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">📍 Lieu</td>
                <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${location}</td>
              </tr>
            </table>
          </div>

          ${message ? `
          <div style="border-left: 3px solid #145847; padding-left: 16px; margin-bottom: 24px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
            <p style="color: #374151; font-size: 14px; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          ` : ""}

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/reservations"
             style="display: inline-block; background: #145847; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Voir la réservation →
          </a>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
            Cet email a été envoyé via ResaMeet. Si vous n'êtes pas concerné, ignorez ce message.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data?.id });
}
