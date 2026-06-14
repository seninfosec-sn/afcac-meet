import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllSlotLocks, insertSlotLock } from "@/lib/db";

const ADMIN_EMAILS = ["afcacexpo@gmail.com", "sfall@afcac.org"];

async function requireAdmin() {
  const user = await getSession();
  return user && ADMIN_EMAILS.includes(user.email.toLowerCase()) ? user : null;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const locks = await getAllSlotLocks();
  return NextResponse.json({ locks });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { roomId, date, startTime, endTime, reason } = await req.json();
  if (!roomId || !date || !startTime) {
    return NextResponse.json({ error: "roomId, date et startTime sont requis" }, { status: 400 });
  }
  const lock = await insertSlotLock({ roomId, date, startTime, endTime, reason });
  return NextResponse.json({ lock }, { status: 201 });
}
