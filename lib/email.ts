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

export const sendWelcomeEmail = async (
  to: string,
  name: string,
  referrerName: string,
  dashboardUrl: string
): Promise<void> => {
  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM!,
    to,
    subject: "Your BPLAY account is ready",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="margin-bottom:24px">
          <div style="display:inline-block;background:linear-gradient(135deg,#2563eb,#0ea5e9);
                      border-radius:10px;padding:10px 16px">
            <span style="color:#fff;font-weight:700;font-size:18px">BPLAY</span>
          </div>
        </div>
        <h1 style="font-size:22px;font-weight:700;margin-bottom:8px;color:#111827">
          Welcome, ${name}!
        </h1>
        <p style="color:#6b7280;margin-bottom:8px;line-height:1.6">
          Your BPLAY Partner Portal account has been created. You were referred by
          <strong style="color:#111827">${referrerName}</strong>.
        </p>
        <p style="color:#6b7280;margin-bottom:28px;line-height:1.6">
          You can now log in and purchase BPLAY tokens at any time.
        </p>
        <a href="${dashboardUrl}"
           style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;
                  padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px">
          Go to Dashboard
        </a>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb">
          <p style="color:#9ca3af;font-size:12px;margin:0">
            You're receiving this email because an account was created at BPLAY Partner Portal
            using this email address. If this wasn't you, please contact support.
          </p>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(`Failed to send welcome email: ${error.message}`);
};

export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetUrl: string
): Promise<void> => {
  const { error } = await resend.emails.send({
    from: process.env.MAIL_FROM!,
    to,
    subject: "Reset your BPLAY password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="margin-bottom:24px">
          <div style="display:inline-block;background:linear-gradient(135deg,#2563eb,#0ea5e9);
                      border-radius:10px;padding:10px 16px">
            <span style="color:#fff;font-weight:700;font-size:18px">BPLAY</span>
          </div>
        </div>
        <h1 style="font-size:22px;font-weight:700;margin-bottom:8px;color:#111827">
          Reset your password
        </h1>
        <p style="color:#6b7280;margin-bottom:8px;line-height:1.6">
          Hi ${name}, we received a request to reset your BPLAY Partner Portal password.
          Click the button below to choose a new one.
        </p>
        <p style="color:#6b7280;margin-bottom:28px;line-height:1.6">
          This link expires in <strong style="color:#111827">1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;
                  padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px">
          Reset Password
        </a>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb">
          <p style="color:#9ca3af;font-size:12px;margin:0">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will not change.
          </p>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(`Failed to send password reset email: ${error.message}`);
};
