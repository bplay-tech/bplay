import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInvitationEmail = async (
  to: string,
  name: string,
  inviteUrl: string
): Promise<void> => {
  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM!,
    to,
    subject: "You've been invited to BPLAY Partner Portal",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Welcome to BPLAY, ${name}!</h1>
        <p style="color:#6b7280;margin-bottom:24px">
          You've been invited to join the BPLAY Partner Portal. Click the button below to set your password and activate your account.
        </p>
        <a href="${inviteUrl}"
           style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;
                  padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">
          Set My Password
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          This link expires in 72 hours. If you did not expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) throw new Error(`Failed to send invitation email: ${error.message}`);
};
