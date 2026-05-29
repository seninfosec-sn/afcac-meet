import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { upsertUser } from "@/lib/db";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "afcac-expo-meet-super-secret-jwt-key-change-in-production-2026"
);

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json({ error: "Email et code requis" }, { status: 400 });
  }

  // Read the OTP cookie
  const otpToken = req.cookies.get("afcac_expo_meet_otp")?.value;

  if (!otpToken) {
    return NextResponse.json(
      { error: "Session expirée. Veuillez demander un nouveau code." },
      { status: 401 }
    );
  }

  // Verify and decode the OTP token
  let payload: { email: string; otp: string };
  try {
    const { payload: p } = await jwtVerify(otpToken, SECRET);
    payload = p as { email: string; otp: string };
  } catch {
    return NextResponse.json(
      { error: "Code expiré. Veuillez demander un nouveau code." },
      { status: 401 }
    );
  }

  // Validate email and OTP match
  if (payload.email !== email || payload.otp !== otp) {
    return NextResponse.json({ error: "Code invalide." }, { status: 401 });
  }

  // Upsert user in DB
  const name = email.split("@")[0];
  const initials = name.slice(0, 2).toUpperCase();
  await upsertUser(email, name).catch(() => {}); // non-blocking

  const sessionToken = await new SignJWT({
    id: `user_${Buffer.from(email).toString("base64url")}`,
    name,
    email,
    avatarInitials: initials,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  const response = NextResponse.json({ success: true });

  // Set session cookie
  response.cookies.set("afcac_expo_meet_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // Clear OTP cookie
  response.cookies.set("afcac_expo_meet_otp", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
