import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  updateMeetingStatus,
  updateRoomResStatus,
  proposeMeetingSlot,
  getMeetingById,
  insertNotification,
} from "@/lib/db";

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

      if (otherEmail) {
        if (status === "confirmed") {
          await insertNotification({
            userEmail: otherEmail,
            type: "confirmed",
            title: "Invitation acceptée",
            message: `${userName} a accepté votre invitation pour "${title}".`,
            reservationId: id,
          });
        } else if (status === "cancelled") {
          await insertNotification({
            userEmail: otherEmail,
            type: "cancelled",
            title: "Invitation refusée",
            message: `${userName} a refusé votre invitation pour "${title}".`,
            reservationId: id,
          });
        } else if (status === "proposed") {
          await insertNotification({
            userEmail: otherEmail,
            type: "proposed",
            title: "Nouveau créneau proposé",
            message: `${userName} propose un nouveau créneau pour "${title}" : le ${proposedDate} de ${proposedStartTime} à ${proposedEndTime}.`,
            reservationId: id,
          });
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
