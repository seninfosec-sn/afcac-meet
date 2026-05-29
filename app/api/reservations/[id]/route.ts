import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateMeetingStatus, updateRoomResStatus } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const { status, tableType } = await req.json();

  if (!["confirmed", "cancelled", "pending"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const updated = tableType === "salle"
    ? await updateRoomResStatus(id, status)
    : await updateMeetingStatus(id, status);

  if (!updated) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
