import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  updateMeetingStatus,
  updateRoomResStatus,
  proposeMeetingSlot,
  getMeetingById,
  insertNotification,
} from "@/lib/db";
import { sendMail, FROM } from "@/lib/mailer";

function formatDateTime(isoString: string) {
  const d = new Date(isoString);
  const date = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "Africa/Dakar" });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dakar" });
  return { date, time };
}

async function sendConfirmationEmail(to: string, opts: {
  status: "confirmed" | "cancelled" | "proposed";
  userName: string;
  title: string;
  slotStart: string;
  slotEnd: string;
  location: string;
  reservationId: string;
  proposedDate?: string;
  proposedStartTime?: string;
  proposedEndTime?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://afcac-meet-main.vercel.app";
  const { date, time: startTime } = formatDateTime(opts.slotStart);
  const { time: endTime } = formatDateTime(opts.slotEnd);

  const isConfirmed = opts.status === "confirmed";
  const isCancelled = opts.status === "cancelled";
  const isProposed  = opts.status === "proposed";

  const subject = isConfirmed
    ? `Reunion confirmee - ${opts.title}`
    : isCancelled
    ? `Invitation refusee - ${opts.title}`
    : `Nouveau creneau propose - ${opts.title}`;

  const statusColor  = isConfirmed ? "#145847" : isCancelled ? "#dc2626" : "#d97706";
  const statusBadge  = isConfirmed ? "Reunion confirmee" : isCancelled ? "Invitation refusee" : "Nouveau creneau propose";
  const statusMsgTxt = isConfirmed
    ? `${opts.userName} a accepte votre invitation.`
    : isCancelled
    ? `${opts.userName} a refuse votre invitation.`
    : `${opts.userName} propose un nouveau creneau.`;
  const statusMsg    = isConfirmed
    ? `<strong>${opts.userName}</strong> a <strong>accepte</strong> votre invitation.`
    : isCancelled
    ? `<strong>${opts.userName}</strong> a <strong>refuse</strong> votre invitation.`
    : `<strong>${opts.userName}</strong> propose un <strong>nouveau creneau</strong>.`;

  const slotTxt = isProposed && opts.proposedDate
    ? `Nouveau creneau : ${opts.proposedDate} de ${opts.proposedStartTime} a ${opts.proposedEndTime}`
    : `Date    : ${date}\nHoraire : ${startTime} - ${endTime}`;

  const slotBlock = isProposed && opts.proposedDate
    ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:110px;">Nouveau creneau</td>
       <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${opts.proposedDate} - ${opts.proposedStartTime} a ${opts.proposedEndTime}</td></tr>`
    : `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:110px;">Date</td>
       <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${date}</td></tr>
       <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Horaire</td>
       <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${startTime} - ${endTime}</td></tr>`;

  const textBody = [
    statusMsgTxt,
    "",
    `Reunion : ${opts.title}`,
    slotTxt,
    `Lieu    : ${opts.location}`,
    "",
    `Consultez vos reservations : ${appUrl}/reservations`,
    "",
    "---",
    "AFCAC Official Bilateral Meetings Platform — AFCAC EXPO 2026",
  ].join("\n");

  await sendMail({
    from: FROM,
    to,
    replyTo: FROM,
    subject,
    text: textBody,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <div style="background:${statusColor};padding:24px 32px;border-radius:10px 10px 0 0;text-align:center;">
          <img src="${appUrl}/afcac_logo.png" alt="AFCAC" style="height:64px;max-width:220px;object-fit:contain;display:block;margin:0 auto;" />
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px;">${statusBadge}</p>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 10px 10px;border:1px solid #e5e7eb;border-top:none;">
          <p style="color:#374151;font-size:15px;margin:0 0 24px;">${statusMsg}</p>
          <div style="background:#f3faf7;border:1px solid #d1e9e2;border-radius:8px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:110px;">Reunion</td>
                  <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${opts.title}</td></tr>
              ${slotBlock}
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Lieu</td>
                  <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${opts.location}</td></tr>
            </table>
          </div>
          <a href="${appUrl}/reservations"
             style="display:inline-block;background:${statusColor};color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
            Voir mes réservations →
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:32px;padding-top:20px;border-top:1px solid #f3f4f6;">
            Official Bilateral Meetings Platform — AFCAC EXPO 2026
          </p>
        </div>
      </div>
    `,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const { status, tableType, proposedDate, proposedStartTime, proposedEndTime } = await req.json();

  if (!["confirmed", "cancelled", "pending", "proposed"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  let updated = false;

  if (status === "proposed" && proposedDate && proposedStartTime && proposedEndTime) {
    updated = await proposeMeetingSlot(id, proposedDate, proposedStartTime, proposedEndTime);
  } else {
    updated = tableType === "salle"
      ? await updateRoomResStatus(id, status)
      : await updateMeetingStatus(id, status);
  }

  if (!updated) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  // Notify the other party for bilateral meetings
  if (tableType === "bilateral" || status === "proposed") {
    const meeting = await getMeetingById(id);
    if (meeting) {
      const initiator = meeting.initiator as { email: string; name?: string; displayName?: string };
      const invitee   = meeting.invitee   as { email: string; name?: string; displayName?: string } | null;
      const title     = meeting.title as string;

      const isInitiator = user.email.toLowerCase() === initiator.email.toLowerCase();
      const otherEmail  = isInitiator ? invitee?.email : initiator.email;
      const userName    = user.name || user.email;
      const slotStart   = meeting.slot_start_at as string;
      const slotEnd     = meeting.slot_end_at as string;
      const loc         = (meeting.location as { name?: string })?.name || "Non précisé";

      if (otherEmail) {
        if (status === "confirmed") {
          await insertNotification({
            userEmail: otherEmail,
            type: "confirmed",
            title: "Invitation acceptée",
            message: `${userName} a accepté votre invitation pour "${title}".`,
            reservationId: id,
          });
          await sendConfirmationEmail(otherEmail, {
            status: "confirmed",
            userName,
            title,
            slotStart,
            slotEnd,
            location: loc,
            reservationId: id,
          }).catch(console.error);
        } else if (status === "cancelled") {
          await insertNotification({
            userEmail: otherEmail,
            type: "cancelled",
            title: "Invitation refusée",
            message: `${userName} a refusé votre invitation pour "${title}".`,
            reservationId: id,
          });
          await sendConfirmationEmail(otherEmail, {
            status: "cancelled",
            userName,
            title,
            slotStart,
            slotEnd,
            location: loc,
            reservationId: id,
          }).catch(console.error);
        } else if (status === "proposed") {
          await insertNotification({
            userEmail: otherEmail,
            type: "proposed",
            title: "Nouveau créneau proposé",
            message: `${userName} propose un nouveau créneau pour "${title}" : le ${proposedDate} de ${proposedStartTime} à ${proposedEndTime}.`,
            reservationId: id,
          });
          await sendConfirmationEmail(otherEmail, {
            status: "proposed",
            userName,
            title,
            slotStart,
            slotEnd,
            location: loc,
            reservationId: id,
            proposedDate,
            proposedStartTime,
            proposedEndTime,
          }).catch(console.error);
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
