import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteUser, updateUserName } from "@/lib/db";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "afcacexpo@gmail.com")
  .split(",").map(e => e.trim().toLowerCase());

async function requireAdmin() {
  const user = await getSession();
  if (!user) return null;
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
  return user;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const ok = await deleteUser(id);
  if (!ok) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const displayName = (body.displayName ?? "").trim();
  if (!displayName) return NextResponse.json({ error: "Nom invalide" }, { status: 400 });

  const ok = await updateUserName(id, displayName);
  if (!ok) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
