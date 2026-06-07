import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllRooms, createRoom } from "@/lib/db";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "afcacexpo@gmail.com")
  .split(",").map(e => e.trim().toLowerCase());

async function requireAdmin() {
  const user = await getSession();
  if (!user || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
  return user;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const rooms = await getAllRooms();
  return NextResponse.json({ rooms });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { name, capacity, floor, equipment } = await req.json();
  if (!name?.trim() || !floor?.trim())
    return NextResponse.json({ error: "Nom et étage requis" }, { status: 400 });
  const room = await createRoom({
    name: name.trim(),
    capacity: Number(capacity) || 0,
    floor: floor.trim(),
    equipment: Array.isArray(equipment) ? equipment.filter(Boolean) : [],
  });
  return NextResponse.json({ room }, { status: 201 });
}
