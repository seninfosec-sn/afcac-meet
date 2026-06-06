import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getNotificationsForUser, markNotificationsRead } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const notifications = await getNotificationsForUser(user.email);
  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  await markNotificationsRead(user.email, body.id);
  return NextResponse.json({ success: true });
}
