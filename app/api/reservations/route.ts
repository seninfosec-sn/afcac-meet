import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getReservationsForUser,
  insertMeetingInvite,
  insertRoomReservation,
  hasRoomConflict,
  countRoomUsageForDay,
  insertNotification,
  isRoomLocked,
} from "@/lib/db";

const EXPO_DATES = new Set(["2026-06-15","2026-06-16","2026-06-17","2026-06-18","2026-06-19"]);
const MAX_SLOTS_PER_DAY = 32;

function parseMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isValidSlot(startTime: string, endTime: string): boolean {
  const start = parseMinutes(startTime);
  const end   = parseMinutes(endTime);
  if (end - start !== 45) return false;
  if (start < 8 * 60 || start > 17 * 60) return false;
  if ((start - 8 * 60) % 45 !== 0) return false;
  return true;
}

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

    if (!EXPO_DATES.has(date)) {
      return NextResponse.json({ error: "Les réservations sont uniquement autorisées du 15 au 19 juin 2026." }, { status: 400 });
    }
    if (!isValidSlot(startTime, endTime)) {
      return NextResponse.json({ error: "Créneau invalide. Les réservations sont de 45 min, de 08h00 à 17h45." }, { status: 400 });
    }

    const slotStart = `${date}T${startTime}:00Z`;
    const slotEnd   = `${date}T${endTime}:00Z`;
    const id        = `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (type === "bilateral") {
      if (!inviteeEmail) {
        return NextResponse.json({ error: "Email de l'invité requis" }, { status: 400 });
      }

      if (room && room !== "visio") {
        if (await isRoomLocked(room))
          return NextResponse.json({ error: "Cette salle est verrouillée par l'administrateur." }, { status: 403 });
        const conflict = await hasRoomConflict(room, slotStart, slotEnd);
        if (conflict)
          return NextResponse.json({ error: "Cette salle est déjà réservée sur ce créneau." }, { status: 409 });
        const dayCount = await countRoomUsageForDay(room, date);
        if (dayCount >= MAX_SLOTS_PER_DAY)
          return NextResponse.json({ error: "Cette salle a atteint le maximum de 13 réservations pour cette journée." }, { status: 409 });
      }

      const meetingTitle = title || `Rencontre avec ${inviteeEmail}`;
      await insertMeetingInvite({
        id,
        title: meetingTitle,
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
      await insertNotification({
        userEmail: inviteeEmail,
        type: "invitation",
        title: "Nouvelle invitation de réunion",
        message: `${user.name} vous invite à "${meetingTitle}" le ${date} de ${startTime} à ${endTime}.`,
        reservationId: id,
      });
    } else {
      if (!room) {
        return NextResponse.json({ error: "Salle requise" }, { status: 400 });
      }

      if (await isRoomLocked(room))
        return NextResponse.json({ error: "Cette salle est verrouillée par l'administrateur." }, { status: 403 });

      const conflict = await hasRoomConflict(room, slotStart, slotEnd);
      if (conflict) {
        return NextResponse.json({ error: "Cette salle est déjà réservée sur ce créneau." }, { status: 409 });
      }
      const dayCount = await countRoomUsageForDay(room, date);
      if (dayCount >= MAX_SLOTS_PER_DAY) {
        return NextResponse.json({ error: "Cette salle a atteint le maximum de 13 réservations pour cette journée." }, { status: 409 });
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
