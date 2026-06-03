import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateMeetingStatus, updateRoomResStatus, proposeMeetingSlot } from "@/lib/db";

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

  return NextResponse.json({ success: true });
}
