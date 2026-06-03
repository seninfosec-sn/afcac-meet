import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllReservations, getAllUsers } from "@/lib/db";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "seninfosec@gmail.com")
  .split(",").map(e => e.trim().toLowerCase());

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase()))
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const [reservations, users] = await Promise.all([getAllReservations(), getAllUsers()]);
  return NextResponse.json({ reservations, users });
}
