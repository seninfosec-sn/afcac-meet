import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllRooms } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const rooms = await getAllRooms();
  return NextResponse.json({ rooms });
}
