// scripts/migrate-v2.mjs — schéma utilisé par lib/db.ts
import { neon } from "@neondatabase/serverless";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("DATABASE_URL manquant"); process.exit(1); }

const sql = neon(DB_URL);

async function migrate() {
  console.log("Connexion à Neon...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id           TEXT PRIMARY KEY,
      email        TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Table users OK");

  await sql`
    CREATE TABLE IF NOT EXISTS meeting_invites (
      id             TEXT PRIMARY KEY,
      title          TEXT NOT NULL,
      description    TEXT NOT NULL DEFAULT '',
      status         TEXT NOT NULL DEFAULT 'pending',
      initiator      JSONB NOT NULL,
      invitee        JSONB,
      slot_start_at  TIMESTAMPTZ NOT NULL,
      slot_end_at    TIMESTAMPTZ NOT NULL,
      slot_timezone  TEXT NOT NULL DEFAULT 'UTC',
      location       JSONB,
      chat_thread_id TEXT,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Table meeting_invites OK");

  await sql`
    CREATE TABLE IF NOT EXISTS room_reservations (
      id             TEXT PRIMARY KEY,
      title          TEXT NOT NULL,
      description    TEXT NOT NULL DEFAULT '',
      status         TEXT NOT NULL DEFAULT 'pending',
      organizer      JSONB NOT NULL,
      attendees      JSONB NOT NULL DEFAULT '[]',
      room_ref       JSONB,
      slot_start_at  TIMESTAMPTZ NOT NULL,
      slot_end_at    TIMESTAMPTZ NOT NULL,
      slot_timezone  TEXT NOT NULL DEFAULT 'UTC',
      chat_thread_id TEXT,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Table room_reservations OK");

  await sql`CREATE INDEX IF NOT EXISTS idx_mi_initiator ON meeting_invites USING gin(initiator)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mi_invitee   ON meeting_invites USING gin(invitee)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mi_slot      ON meeting_invites(slot_start_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rr_organizer ON room_reservations USING gin(organizer)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rr_room      ON room_reservations USING gin(room_ref)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rr_slot      ON room_reservations(slot_start_at)`;
  console.log("Index OK");

  console.log("Migration terminee avec succes !");
  process.exit(0);
}

migrate().catch(e => { console.error("Echec migration:", e); process.exit(1); });
