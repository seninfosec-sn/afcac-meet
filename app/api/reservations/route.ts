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
  if (start < 0 || start > 23 * 60) return false;
  if (start % 45 !== 0) return false;
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
      return NextResponse.json({ errorKey: "errorInvalidDate" }, { status: 400 });
    }
    if (!isValidSlot(startTime, endTime)) {
      return NextResponse.json({ errorKey: "errorInvalidSlot" }, { status: 400 });
    }

    const slotStart = `${date}T${startTime}:00Z`;
    const slotEnd   = `${date}T${endTime}:00Z`;
    const id        = `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (type === "bilateral") {
      if (!inviteeEmail) {
        return NextResponse.json({ errorKey: "errorNoRoom" }, { status: 400 });
      }

      if (room) {
        if (await isRoomLocked(room))
          return NextResponse.json({ errorKey: "errorRoomLocked" }, { status: 403 });
        const conflict = await hasRoomConflict(room, slotStart, slotEnd);
        if (conflict)
          return NextResponse.json({ errorKey: "errorSlotTaken" }, { status: 409 });
        const dayCount = await countRoomUsageForDay(room, date);
        if (dayCount >= MAX_SLOTS_PER_DAY)
          return NextResponse.json({ errorKey: "errorMaxSlots" }, { status: 409 });
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
        return NextResponse.json({ errorKey: "errorNoRoom" }, { status: 400 });
      }

      if (await isRoomLocked(room))
        return NextResponse.json({ errorKey: "errorRoomLocked" }, { status: 403 });

      const conflict = await hasRoomConflict(room, slotStart, slotEnd);
      if (conflict) {
        return NextResponse.json({ errorKey: "errorSlotTaken" }, { status: 409 });
      }
      const dayCount = await countRoomUsageForDay(room, date);
      if (dayCount >= MAX_SLOTS_PER_DAY) {
        return NextResponse.json({ errorKey: "errorMaxSlots" }, { status: 409 });
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
    return NextResponse.json({ errorKey: "errorCreation" }, { status: 500 });
  }
}
