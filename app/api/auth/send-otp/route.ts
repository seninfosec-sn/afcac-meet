import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { transporter, FROM } from "@/lib/mailer";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "afcac-expo-meet-super-secret-jwt-key-change-in-production-2026"
);
const IS_DEV = process.env.NODE_ENV !== "production";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  const otp = generateOtp();

  const otpToken = await new SignJWT({ email, otp })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(SECRET);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://afcac-meet-main.vercel.app";

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Votre code de connexion Afcac-expo-meet",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="background: #145847; padding: 20px 28px; border-radius: 10px 10px 0 0; text-align: center;">
            <img src="${appUrl}/afcac_logo.png" alt="AFCAC" style="height: 64px; max-width: 220px; object-fit: contain; display: block; margin: 0 auto;" />
          </div>
          <div style="background: white; padding: 32px 28px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
            <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">Votre code de connexion :</p>
            <div style="background: #f3faf7; border: 2px solid #145847; border-radius: 12px; padding: 20px; margin: 0 auto 24px; display: inline-block; min-width: 180px;">
              <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #145847;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Ce code expire dans <strong>10 minutes</strong>.</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("[Gmail] Erreur envoi OTP:", err);
    if (!IS_DEV) {
      return NextResponse.json(
        { error: "Impossible d'envoyer le code. Vérifiez votre adresse email." },
        { status: 500 }
      );
    }
    console.log(`[DEV] OTP pour ${email} : ${otp}`);
  }

  const payload: Record<string, unknown> = { success: true };
  if (IS_DEV) payload.dev_otp = otp;

  const response = NextResponse.json(payload);
  response.cookies.set("afcac_expo_meet_otp", otpToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
