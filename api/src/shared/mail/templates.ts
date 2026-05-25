const base = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Finance</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#18181b;border-radius:12px;padding:10px 20px;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">AI Finance</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                You received this email because an account action was requested.<br/>
                If you did not request this, you can safely ignore this email.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#d4d4d8;">
                &copy; ${new Date().getFullYear()} AI Finance. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const button = (href: string, label: string) => `
  <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td align="center" style="background-color:#18181b;border-radius:8px;">
        <a href="${href}"
           target="_blank"
           style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:-0.2px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`

const fallbackLink = (href: string) => `
  <p style="margin:20px 0 0;font-size:12px;color:#a1a1aa;text-align:center;">
    Button not working? Copy and paste this link into your browser:<br/>
    <a href="${href}" style="color:#3b82f6;word-break:break-all;">${href}</a>
  </p>`

export const verifyEmailTemplate = (url: string) => ({
    subject: 'Verify your email address',
    html: base(`
      <!-- Top accent bar -->
      <tr>
        <td style="background:linear-gradient(90deg,#18181b 0%,#3b82f6 100%);height:4px;"></td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:40px 48px 48px;">

          <!-- Icon -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="background-color:#eff6ff;border-radius:12px;padding:14px;width:48px;height:48px;text-align:center;">
                <span style="font-size:28px;line-height:1;">✉️</span>
              </td>
            </tr>
          </table>

          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#09090b;letter-spacing:-0.5px;">
            Verify your email
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
            Thanks for signing up! Click the button below to confirm your email address and activate your account.
            This link expires in <strong style="color:#18181b;">45 minutes</strong>.
          </p>

          ${button(url, 'Verify Email Address')}
          ${fallbackLink(url)}

        </td>
      </tr>
    `),
})

export const passwordResetTemplate = (url: string) => ({
    subject: 'Reset your password',
    html: base(`
      <!-- Top accent bar -->
      <tr>
        <td style="background:linear-gradient(90deg,#18181b 0%,#ef4444 100%);height:4px;"></td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:40px 48px 48px;">

          <!-- Icon -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="background-color:#fef2f2;border-radius:12px;padding:14px;width:48px;height:48px;text-align:center;">
                <span style="font-size:28px;line-height:1;">🔐</span>
              </td>
            </tr>
          </table>

          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#09090b;letter-spacing:-0.5px;">
            Reset your password
          </h1>
          <p style="margin:0 0 8px;font-size:15px;color:#71717a;line-height:1.6;">
            We received a request to reset the password for your account.
            Click the button below to choose a new password.
            This link expires in <strong style="color:#18181b;">1 hour</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:13px;color:#a1a1aa;line-height:1.5;">
            If you did not request a password reset, please ignore this email — your password will remain unchanged.
          </p>

          ${button(url, 'Reset Password')}
          ${fallbackLink(url)}

        </td>
      </tr>
    `),
})
