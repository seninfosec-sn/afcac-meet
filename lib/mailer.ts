import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER || "afcacexpo@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || "";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  pool: true,
  maxConnections: 3,
  rateDelta: 1000,
  rateLimit: 5,
});

export const FROM       = `AFCAC Bilateral Meetings <${GMAIL_USER}>`;
export const REPLY_TO   = GMAIL_USER;
export const GMAIL_ADDR = GMAIL_USER;
