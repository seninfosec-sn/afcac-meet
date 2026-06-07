import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllReservations, getAllUsers, deleteReservation, deleteAllReservations } from "@/lib/db";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "afcacexpo@gmail.com")
  .split(",").map(e => e.trim().toLowerCase());

async function requireAdmin() {
  const user = await getSession();
  if (!user) return null;
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const [reservations, users] = await Promise.all([getAllReservations(), getAllUsers()]);
  return NextResponse.json({ reservations, users });
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { id, type } = body as { id?: string; type?: "bilateral" | "salle" };

  if (id && type) {
    const ok = await deleteReservation(id, type);
    if (!ok) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  await deleteAllReservations();
  return NextResponse.json({ success: true });
}
