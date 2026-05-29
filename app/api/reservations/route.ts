import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getReservationsForUser,
  insertMeetingInvite,
  insertRoomReservation,
  hasRoomConflict,
} from "@/lib/db";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const reservations = await getReservationsForUser(user.email);
    return NextResponse.json(reservations);
  } catch (err) {
    console.error("[GET /api/reservations]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const { type, date, startTime, endTime, title, description, inviteeEmail, room, location } = body;

    const slotStart = `${date}T${startTime}:00Z`;
    const slotEnd   = `${date}T${endTime}:00Z`;
    const id        = `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (type === "bilateral") {
      if (!inviteeEmail) {
        return NextResponse.json({ error: "Email de l'invité requis" }, { status: 400 });
      }

      if (room && room !== "visio") {
        const conflict = await hasRoomConflict(room, slotStart, slotEnd);
        if (conflict) {
          return NextResponse.json({ error: "Cette salle est déjà réservée sur ce créneau." }, { status: 409 });
        }
      }

      await insertMeetingInvite({
        id,
        title: title || `Rencontre avec ${inviteeEmail}`,
        description: description || "",
        initiatorEmail: user.email,
        initiatorName:  user.name,
        inviteeEmail,
        slotStart,
        slotEnd,
        location: room && room !== "visio"
          ? { type: "room", name: location, roomId: room }
          : { type: "visio", name: location || "Visio" },
      });
    } else {
      if (!room) {
        return NextResponse.json({ error: "Salle requise" }, { status: 400 });
      }

      const conflict = await hasRoomConflict(room, slotStart, slotEnd);
      if (conflict) {
        return NextResponse.json({ error: "Cette salle est déjà réservée sur ce créneau." }, { status: 409 });
      }

      await insertRoomReservation({
        id,
        title: title || `Réservation de salle`,
        description: description || "",
        organizerEmail: user.email,
        organizerName:  user.name,
        slotStart,
        slotEnd,
        room: { id: room, name: location, capacity: body.capacity },
      });
    }

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reservations]", err);
    return NextResponse.json({ error: "Erreur serveur inattendue." }, { status: 500 });
  }
}
