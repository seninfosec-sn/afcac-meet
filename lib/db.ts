import { neon } from "@neondatabase/serverless";
import { Reservation, ROOMS } from "./data";

const DB_URL = process.env.DATABASE_URL!;
export const sql = neon(DB_URL);

let schemaReady = false;
async function ensureSchema() {
  if (schemaReady) return;
  await sql`CREATE TABLE IF NOT EXISTS afcac_users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS meeting_invites (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    status TEXT NOT NULL DEFAULT 'pending', initiator JSONB NOT NULL, invitee JSONB,
    slot_start_at TIMESTAMPTZ NOT NULL, slot_end_at TIMESTAMPTZ NOT NULL,
    slot_timezone TEXT NOT NULL DEFAULT 'Africa/Dakar', location JSONB,
    chat_thread_id TEXT, proposed_slot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS room_reservations (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    status TEXT NOT NULL DEFAULT 'pending', organizer JSONB NOT NULL,
    attendees JSONB DEFAULT '[]', room_ref JSONB,
    slot_start_at TIMESTAMPTZ NOT NULL, slot_end_at TIMESTAMPTZ NOT NULL,
    slot_timezone TEXT NOT NULL DEFAULT 'Africa/Dakar', chat_thread_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  schemaReady = true;
}

// ── Users ────────────────────────────────────────────────────────

export async function upsertUser(email: string, name: string): Promise<string> {
  const id = email.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  await sql`
    INSERT INTO afcac_users (id, email, display_name)
    VALUES (${id}, ${email}, ${name})
    ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
  `;
  return id;
}

export async function getUserByEmail(email: string) {
  const rows = await sql`SELECT * FROM afcac_users WHERE email = ${email} LIMIT 1`;
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
  await ensureSchema();
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
  await ensureSchema();
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
  const rows = await sql`SELECT id, email, display_name, created_at FROM afcac_users ORDER BY created_at DESC`;
  return rows as { id: string; email: string; display_name: string; created_at: string }[];
}

export async function updateUserName(id: string, displayName: string): Promise<boolean> {
  const r = await sql`
    UPDATE afcac_users SET display_name = ${displayName}, updated_at = NOW()
    WHERE id = ${id} RETURNING id
  `;
  return r.length > 0;
}

export async function deleteUser(id: string): Promise<boolean> {
  const r = await sql`DELETE FROM afcac_users WHERE id = ${id} RETURNING id`;
  return r.length > 0;
}

export async function deleteReservation(id: string, type: "bilateral" | "salle"): Promise<boolean> {
  const r = type === "bilateral"
    ? await sql`DELETE FROM meeting_invites WHERE id = ${id} RETURNING id`
    : await sql`DELETE FROM room_reservations WHERE id = ${id} RETURNING id`;
  return r.length > 0;
}

export async function deleteAllReservations(): Promise<void> {
  await Promise.all([
    sql`DELETE FROM meeting_invites`,
    sql`DELETE FROM room_reservations`,
  ]);
}

// ── Notifications ────────────────────────────────────────────────

export type NotificationType =
  | "invitation"
  | "confirmed"
  | "cancelled"
  | "proposed"
  | "room_created";

export interface AppNotification {
  id: string;
  user_email: string;
  type: NotificationType;
  title: string;
  message: string;
  reservation_id: string | null;
  read: boolean;
  created_at: string;
}

async function ensureNotificationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      reservation_id TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function insertNotification(data: {
  userEmail: string;
  type: NotificationType;
  title: string;
  message: string;
  reservationId?: string;
}): Promise<void> {
  await ensureNotificationsTable();
  const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await sql`
    INSERT INTO notifications (id, user_email, type, title, message, reservation_id)
    VALUES (${id}, ${data.userEmail}, ${data.type}, ${data.title}, ${data.message}, ${data.reservationId ?? null})
  `;
}

export async function getNotificationsForUser(email: string): Promise<AppNotification[]> {
  await ensureNotificationsTable();
  const rows = await sql`
    SELECT * FROM notifications
    WHERE user_email = ${email}
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return rows as AppNotification[];
}

export async function markNotificationsRead(email: string, id?: string): Promise<void> {
  await ensureNotificationsTable();
  if (id) {
    await sql`UPDATE notifications SET read = TRUE WHERE id = ${id} AND user_email = ${email}`;
  } else {
    await sql`UPDATE notifications SET read = TRUE WHERE user_email = ${email}`;
  }
}

export async function getUnreadCount(email: string): Promise<number> {
  await ensureNotificationsTable();
  const rows = await sql`SELECT COUNT(*)::int AS cnt FROM notifications WHERE user_email = ${email} AND read = FALSE`;
  return Number((rows[0] as { cnt: number }).cnt);
}

export async function getMeetingById(id: string) {
  const rows = await sql`SELECT * FROM meeting_invites WHERE id = ${id} LIMIT 1`;
  return rows[0] as Record<string, unknown> | undefined;
}

// ── Rooms ────────────────────────────────────────────────────────

export interface DbRoom {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  equipment: string[];
  locked: boolean;
  created_at: string;
}

async function ensureRoomsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS rooms (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      capacity   INTEGER NOT NULL DEFAULT 0,
      floor      TEXT NOT NULL DEFAULT '',
      equipment  JSONB NOT NULL DEFAULT '[]',
      locked     BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  const cnt = await sql`SELECT COUNT(*)::int AS cnt FROM rooms`;
  if (Number((cnt[0] as { cnt: number }).cnt) === 0) {
    for (const room of ROOMS) {
      await sql`
        INSERT INTO rooms (id, name, capacity, floor, equipment)
        VALUES (${room.id}, ${room.name}, ${room.capacity}, ${room.floor}, ${JSON.stringify(room.equipment)}::jsonb)
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }
}

function rowToRoom(r: Record<string, unknown>): DbRoom {
  return {
    id:         r.id as string,
    name:       r.name as string,
    capacity:   Number(r.capacity),
    floor:      r.floor as string,
    equipment:  Array.isArray(r.equipment) ? (r.equipment as string[]) : [],
    locked:     Boolean(r.locked),
    created_at: r.created_at as string,
  };
}

export async function getAllRooms(): Promise<DbRoom[]> {
  await ensureRoomsTable();
  const rows = await sql`SELECT * FROM rooms ORDER BY name ASC`;
  return (rows as Record<string, unknown>[]).map(rowToRoom);
}

export async function createRoom(data: {
  name: string; capacity: number; floor: string; equipment: string[];
}): Promise<DbRoom> {
  await ensureRoomsTable();
  const slug = data.name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const id = `${slug}-${Date.now().toString(36)}`;
  await sql`
    INSERT INTO rooms (id, name, capacity, floor, equipment)
    VALUES (${id}, ${data.name}, ${data.capacity}, ${data.floor}, ${JSON.stringify(data.equipment)}::jsonb)
  `;
  const rows = await sql`SELECT * FROM rooms WHERE id = ${id}`;
  return rowToRoom(rows[0] as Record<string, unknown>);
}

export async function updateRoom(id: string, data: {
  name: string; capacity: number; floor: string; equipment: string[];
}): Promise<boolean> {
  await ensureRoomsTable();
  const r = await sql`
    UPDATE rooms
    SET name = ${data.name}, capacity = ${data.capacity},
        floor = ${data.floor}, equipment = ${JSON.stringify(data.equipment)}::jsonb,
        updated_at = NOW()
    WHERE id = ${id} RETURNING id
  `;
  return r.length > 0;
}

export async function setRoomLocked(id: string, locked: boolean): Promise<boolean> {
  await ensureRoomsTable();
  const r = await sql`
    UPDATE rooms SET locked = ${locked}, updated_at = NOW()
    WHERE id = ${id} RETURNING id
  `;
  return r.length > 0;
}

export async function deleteRoom(id: string): Promise<boolean> {
  await ensureRoomsTable();
  const r = await sql`DELETE FROM rooms WHERE id = ${id} RETURNING id`;
  return r.length > 0;
}

export async function isRoomLocked(id: string): Promise<boolean> {
  await ensureRoomsTable();
  const rows = await sql`SELECT locked FROM rooms WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return false;
  return Boolean((rows[0] as { locked: boolean }).locked);
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

// Count total room usage (room_reservations + meeting_invites) for a given day
export async function countRoomUsageForDay(roomId: string, date: string): Promise<number> {
  const dayStart = `${date}T00:00:00Z`;
  const dayEnd   = `${date}T23:59:59Z`;
  const [r1, r2] = await Promise.all([
    sql`SELECT COUNT(*)::int AS cnt FROM room_reservations
        WHERE room_ref->>'id' = ${roomId}
          AND status != 'cancelled'
          AND slot_start_at >= ${dayStart}
          AND slot_start_at <= ${dayEnd}`,
    sql`SELECT COUNT(*)::int AS cnt FROM meeting_invites
        WHERE location->>'roomId' = ${roomId}
          AND status != 'cancelled'
          AND slot_start_at >= ${dayStart}
          AND slot_start_at <= ${dayEnd}`,
  ]);
  return Number((r1[0] as { cnt: number }).cnt) + Number((r2[0] as { cnt: number }).cnt);
}
