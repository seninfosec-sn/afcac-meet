import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteSlotLock } from "@/lib/db";

const ADMIN_EMAILS = ["afcacexpo@gmail.com", "sfall@afcac.org"];

async function requireAdmin() {
  const user = await getSession();
  return user && ADMIN_EMAILS.includes(user.email.toLowerCase()) ? user : null;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { id } = await params;
  const ok = await deleteSlotLock(id);
  if (!ok) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ success: true });
}
