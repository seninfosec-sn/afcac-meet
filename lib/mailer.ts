import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER || "afcacexpo@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || "";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

export const FROM = `Afcac-expo-meet <${GMAIL_USER}>`;
