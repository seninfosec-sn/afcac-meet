import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date      = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime   = searchParams.get("endTime");

  if (!date || !startTime || !endTime) {
    return NextResponse.json({ error: "date, startTime et endTime requis" }, { status: 400 });
  }

  const slotStart = `${date}T${startTime}:00Z`;
  const slotEnd   = `${date}T${endTime}:00Z`;

  // Rooms occupied by room_reservations (type "salle")
  const roomRows = await sql`
    SELECT room_ref->>'id' AS room_id
    FROM room_reservations
    WHERE status != 'cancelled'
      AND slot_start_at < ${slotEnd}
      AND slot_end_at   > ${slotStart}
  `;

  // Rooms occupied by meeting_invites (type "bilateral")
  const meetingRows = await sql`
    SELECT location->>'roomId' AS room_id
    FROM meeting_invites
    WHERE status != 'cancelled'
      AND location->>'roomId' IS NOT NULL
      AND slot_start_at < ${slotEnd}
      AND slot_end_at   > ${slotStart}
  `;

  // Rooms blocked by admin slot locks
  const lockRows = await sql`
    SELECT room_id
    FROM room_slot_locks
    WHERE date = ${date}
      AND start_time < ${endTime}
      AND (end_time = '' OR end_time > ${startTime})
  `;

  const occupied: Record<string, true> = {};
  for (const r of roomRows)    if (r.room_id) occupied[r.room_id as string] = true;
  for (const r of meetingRows) if (r.room_id) occupied[r.room_id as string] = true;
  for (const r of lockRows)    if (r.room_id) occupied[r.room_id as string] = true;

  return NextResponse.json({ occupiedRoomIds: Object.keys(occupied) });
}
