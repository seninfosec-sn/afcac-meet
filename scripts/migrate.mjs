// scripts/migrate.mjs
// Run: node scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";
import { createRequire } from "module";
import { readFileSync } from "fs";

// Load .env.local manually
const env = readFileSync(".env.local", "utf-8");
for (const line of env.split("\n")) {
  const [k, ...v] = line.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("🚀 Running migrations on Neon PostgreSQL...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_initials TEXT NOT NULL DEFAULT '',
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ Table: users");

  await sql`
    CREATE TABLE IF NOT EXISTS rooms (
      id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name      TEXT NOT NULL,
      capacity  INTEGER NOT NULL,
      floor     TEXT NOT NULL,
      equipment TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ Table: rooms");

  await sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type          TEXT NOT NULL CHECK (type IN ('bilateral', 'salle')),
      title         TEXT NOT NULL,
      date          DATE NOT NULL,
      start_time    TIME NOT NULL,
      end_time      TIME NOT NULL,
      location      TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('confirmed','pending','cancelled','proposed')),
      creator_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      invited_email TEXT,
      room_id       UUID REFERENCES rooms(id) ON DELETE SET NULL,
      description   TEXT,
      qr_token      TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ Table: reservations");

  await sql`
    CREATE INDEX IF NOT EXISTS idx_reservations_creator ON reservations(creator_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_reservations_room ON reservations(room_id, date, start_time)
  `;
  console.log("✅ Indexes created");

  // Seed rooms
  await sql`
    INSERT INTO rooms (name, capacity, floor, equipment)
    VALUES
      ('Salle A', 20, '2ème étage', ARRAY['Vidéoprojecteur','Tableau blanc','Visio']),
      ('Salle B', 12, '2ème étage', ARRAY['Télévision','Tableau blanc']),
      ('Salle C',  6, '3ème étage', ARRAY['Tableau blanc']),
      ('Salle D', 30, '1er étage',  ARRAY['Vidéoprojecteur','Micro','Visio','Tableau blanc'])
    ON CONFLICT DO NOTHING
  `;
  console.log("✅ Rooms seeded");

  // Seed demo user (password: demo1234)
  await sql`
    INSERT INTO users (name, email, password_hash, avatar_initials)
    VALUES (
      'Amadou Diallo',
      'amadou@exemple.sn',
      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lkHy',
      'AD'
    )
    ON CONFLICT (email) DO NOTHING
  `;
  console.log("✅ Demo user seeded (email: amadou@exemple.sn / password: demo1234)");

  // Seed sample reservations for demo user
  await sql`
    INSERT INTO reservations (type, title, date, start_time, end_time, location, status, creator_id, invited_email)
    SELECT
      'bilateral',
      'Réunion avec Fatou Diallo',
      CURRENT_DATE,
      '14:00', '15:00',
      'Visio — Google Meet',
      'confirmed',
      u.id,
      'fatou@exemple.sn'
    FROM users u WHERE u.email = 'amadou@exemple.sn'
    ON CONFLICT DO NOTHING
  `;

  await sql`
    INSERT INTO reservations (type, title, date, start_time, end_time, location, status, creator_id, room_id)
    SELECT
      'salle',
      'Salle A — Formation RH',
      CURRENT_DATE + INTERVAL '5 days',
      '09:00', '12:00',
      'Salle A',
      'confirmed',
      u.id,
      r.id
    FROM users u, rooms r
    WHERE u.email = 'amadou@exemple.sn' AND r.name = 'Salle A'
    ON CONFLICT DO NOTHING
  `;

  await sql`
    INSERT INTO reservations (type, title, date, start_time, end_time, location, status, creator_id, invited_email)
    SELECT
      'bilateral',
      'Entretien avec Moussa Konaté',
      CURRENT_DATE + INTERVAL '2 days',
      '10:00', '11:00',
      'Salle C',
      'pending',
      u.id,
      'moussa@exemple.sn'
    FROM users u WHERE u.email = 'amadou@exemple.sn'
    ON CONFLICT DO NOTHING
  `;
  console.log("✅ Sample reservations seeded");

  console.log("\n🎉 Migration complete!");
  process.exit(0);
}

migrate().catch(e => { console.error("❌ Migration failed:", e); process.exit(1); });
