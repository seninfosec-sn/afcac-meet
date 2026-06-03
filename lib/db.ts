import { neon } from "@neondatabase/serverless";
import { Reservation } from "./data";

const DB_URL = process.env.DATABASE_URL!;
export const sql = neon(DB_URL);

// ── Users ────────────────────────────────────────────────────────

export async function upsertUser(email: string, name: string): Promise<string> {
  const id = email.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  await sql`
    INSERT INTO users (id, email, display_name)
    VALUES (${id}, ${email}, ${name})
    ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
  `;
  return id;
}

export async function getUserByEmail(email: string) {
  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  return rows[0] ?? null;
}

// ── Reservations: normalize DB rows → Reservation ────────────────

function meetingToReservation(row: Record<string, unknown>): Reservation {
  const initiator = row.initiator as { email: string; name: string };
  const invitee   = row.invitee   as { email: string; name: string } | null;
  const location  = row.location  as { type: string; name?: string; roomId?: string } | null;
  const start     = new Date(row.slot_start_at as string);
  const end       = new Date(row.slot_end_at   as string);

  const proposed = row.proposed_slot as { date: string; startTime: string; endTime: string } | null;
  return {
    id:         row.id as string,
    type:       "bilateral",
    title:      row.title as string,
    date:       start.toISOString().slice(0, 10),
    startTime:  start.toTimeString().slice(0, 5),
    endTime:    end.toTimeString().slice(0, 5),
    location:   location?.name ?? "Visio",
    status:     row.status as Reservation["status"],
    description: row.description as string | undefined,
    room:       location?.roomId,
    participants: invitee ? [invitee.name || invitee.email] : [],
    creatorEmail: initiator.email,
    inviteeEmail: invitee?.email,
    proposedDate:    proposed?.date,
    proposedTime:    proposed?.startTime,
    proposedEndTime: proposed?.endTime,
  };
}

function roomResToReservation(row: Record<string, unknown>): Reservation {
  const organizer = row.organizer as { email: string; name: string };
  const roomRef   = row.room_ref  as { id?: string; name?: string; capacity?: number; floor?: string } | null;
  const start     = new Date(row.slot_start_at as string);
  const end       = new Date(row.slot_end_at   as string);

  return {
    id:         row.id as string,
    type:       "salle",
    title:      row.title as string,
    date:       start.toISOString().slice(0, 10),
    startTime:  start.toTimeString().slice(0, 5),
    endTime:    end.toTimeString().slice(0, 5),
    location:   roomRef?.name ?? "",
    status:     row.status as Reservation["status"],
    room:       roomRef?.id,
    capacity:   roomRef?.capacity,
    creatorEmail: organizer.email,
  };
}

// ── Queries ──────────────────────────────────────────────────────

export async function getReservationsForUser(email: string): Promise<Reservation[]> {
  const [meetings, rooms] = await Promise.all([
    sql`
      SELECT * FROM meeting_invites
      WHERE (initiator->>'email' = ${email} OR invitee->>'email' = ${email})
      ORDER BY slot_start_at DESC
    `,
    sql`
      SELECT * FROM room_reservations
      WHERE organizer->>'email' = ${email}
      ORDER BY slot_start_at DESC
    `,
  ]);

  return [
    ...meetings.map(r => meetingToReservation(r as Record<string, unknown>)),
    ...rooms.map(r => roomResToReservation(r as Record<string, unknown>)),
  ].sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
}

export async function insertMeetingInvite(data: {
  id: string;
  title: string;
  description: string;
  initiatorEmail: string;
  initiatorName: string;
  inviteeEmail: string;
  slotStart: string; // ISO
  slotEnd: string;   // ISO
  location: { type: "visio" | "room"; name: string; roomId?: string };
}): Promise<void> {
  await sql`
    INSERT INTO meeting_invites (
      id, title, description, status,
      initiator, invitee,
      slot_start_at, slot_end_at, slot_timezone,
      location, chat_thread_id,
      created_at, updated_at
    ) VALUES (
      ${data.id}, ${data.title}, ${data.description}, 'pending',
      ${JSON.stringify({ email: data.initiatorEmail, displayName: data.initiatorName })},
      ${JSON.stringify({ email: data.inviteeEmail,   displayName: data.inviteeEmail })},
      ${data.slotStart}, ${data.slotEnd}, 'Africa/Dakar',
      ${JSON.stringify(data.location)}, ${"thread_" + data.id},
      NOW(), NOW()
    )
  `;
}

export async function insertRoomReservation(data: {
  id: string;
  title: string;
  description: string;
  organizerEmail: string;
  organizerName: string;
  slotStart: string;
  slotEnd: string;
  room: { id: string; name: string; capacity?: number; floor?: string };
}): Promise<void> {
  await sql`
    INSERT INTO room_reservations (
      id, title, description, status,
      organizer, attendees, room_ref,
      slot_start_at, slot_end_at, slot_timezone,
      chat_thread_id, created_at, updated_at
    ) VALUES (
      ${data.id}, ${data.title}, ${data.description}, 'pending',
      ${JSON.stringify({ email: data.organizerEmail, displayName: data.organizerName })},
      '[]',
      ${JSON.stringify(data.room)},
      ${data.slotStart}, ${data.slotEnd}, 'Africa/Dakar',
      ${"thread_" + data.id}, NOW(), NOW()
    )
  `;
}

export async function updateMeetingStatus(id: string, status: string): Promise<boolean> {
  const r = await sql`
    UPDATE meeting_invites SET status = ${status}, updated_at = NOW()
    WHERE id = ${id} RETURNING id
  `;
  return r.length > 0;
}

export async function proposeMeetingSlot(
  id: string,
  proposedDate: string,
  proposedStartTime: string,
  proposedEndTime: string
): Promise<boolean> {
  const slot = JSON.stringify({ date: proposedDate, startTime: proposedStartTime, endTime: proposedEndTime });
  const r = await sql`
    UPDATE meeting_invites
    SET status = 'proposed', proposed_slot = ${slot}::jsonb, updated_at = NOW()
    WHERE id = ${id} RETURNING id
  `;
  return r.length > 0;
}

export async function updateRoomResStatus(id: string, status: string): Promise<boolean> {
  const r = await sql`
    UPDATE room_reservations SET status = ${status}, updated_at = NOW()
    WHERE id = ${id} RETURNING id
  `;
  return r.length > 0;
}

export async function getAllReservations(): Promise<Reservation[]> {
  const [meetings, rooms] = await Promise.all([
    sql`SELECT * FROM meeting_invites ORDER BY slot_start_at DESC`,
    sql`SELECT * FROM room_reservations ORDER BY slot_start_at DESC`,
  ]);
  return [
    ...meetings.map(r => meetingToReservation(r as Record<string, unknown>)),
    ...rooms.map(r => roomResToReservation(r as Record<string, unknown>)),
  ].sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
}

export async function getAllUsers(): Promise<{ id: string; email: string; display_name: string; created_at: string }[]> {
  const rows = await sql`SELECT id, email, display_name, created_at FROM users ORDER BY created_at DESC`;
  return rows as { id: string; email: string; display_name: string; created_at: string }[];
}

// Conflict check for room bookings
export async function hasRoomConflict(
  roomId: string, slotStart: string, slotEnd: string
): Promise<boolean> {
  const rows = await sql`
    SELECT id FROM room_reservations
    WHERE room_ref->>'id' = ${roomId}
      AND status != 'cancelled'
      AND slot_start_at < ${slotEnd}
      AND slot_end_at   > ${slotStart}
    LIMIT 1
  `;
  return rows.length > 0;
}

// Conflict check for bilateral meeting room usage
export async function hasMeetingRoomConflict(
  roomId: string, slotStart: string, slotEnd: string
): Promise<boolean> {
  const rows = await sql`
    SELECT id FROM meeting_invites
    WHERE location->>'roomId' = ${roomId}
      AND status != 'cancelled'
      AND slot_start_at < ${slotEnd}
      AND slot_end_at   > ${slotStart}
    LIMIT 1
  `;
  return rows.length > 0;
}
