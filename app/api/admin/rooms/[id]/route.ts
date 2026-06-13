import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateRoom, setRoomLocked, deleteRoom } from "@/lib/db";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "afcacexpo@gmail.com,sfall@afcac.org")
  .split(",").map(e => e.trim().toLowerCase());

async function requireAdmin() {
  const user = await getSession();
  if (!user || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  if (typeof body.locked === "boolean") {
    const ok = await setRoomLocked(id, body.locked);
    if (!ok) return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  const { name, capacity, floor, equipment } = body;
  if (!name?.trim() || !floor?.trim())
    return NextResponse.json({ error: "Nom et étage requis" }, { status: 400 });

  const ok = await updateRoom(id, {
    name: name.trim(),
    capacity: Number(capacity) || 0,
    floor: floor.trim(),
    equipment: Array.isArray(equipment) ? equipment.filter(Boolean) : [],
  });
  if (!ok) return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { id } = await params;
  await deleteRoom(id);
  return NextResponse.json({ ok: true });
}
