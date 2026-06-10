import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM     = "AFCAC Bilateral Meetings <noreply@afcac.org>";
export const REPLY_TO = "afcacexpo@gmail.com";

export async function sendMail(opts: {
  from?: string;
  to: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const { error } = await resend.emails.send({
    from:    opts.from    ?? FROM,
    to:      [opts.to],
    replyTo: opts.replyTo ?? REPLY_TO,
    subject: opts.subject,
    text:    opts.text,
    html:    opts.html,
  });
  if (error) throw new Error(error.message);
}
