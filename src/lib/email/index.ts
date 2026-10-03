import { Resend } from "resend";
import https from "https";

function getResendApiKey() {
  return process.env.RESEND_API_KEY;
}

function getFromEmail() {
  return process.env.EMAIL_FROM || "QuerySonar <onboarding@resend.dev>";
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export interface SendInviteEmailParams {
  to: string;
  inviterName: string;
  brandName: string;
  role: "admin" | "editor" | "viewer" | "owner";
  inviteToken: string;
}

export function getRoleDisplayName(role: string): string {
  switch (role.toLowerCase()) {
    case "admin":
      return "Brand Lead (Admin)";
    case "editor":
      return "GEO Analyst (Editor)";
    case "viewer":
      return "Viewer (Read Only)";
    case "owner":
      return "Workspace Owner";
    default:
      return role;
  }
}

export function getRoleDescription(role: string): string {
  switch (role.toLowerCase()) {
    case "admin":
      return "Full access to run audits, configure tracked queries, and manage workspace team members.";
    case "editor":
      return "Access to run multi-engine AI audits, track buyer prompts, and execute defense tactics.";
    case "viewer":
      return "Read-only access to view AI consensus scores, citations, radar charts, and export reports.";
    default:
      return "Access to collaborate on brand intelligence.";
  }
}

export function buildInviteEmailHtml({
  inviterName,
  brandName,
  role,
  inviteUrl,
}: {
  inviterName: string;
  brandName: string;
  role: string;
  inviteUrl: string;
}): string {
  const roleName = getRoleDisplayName(role);
  const roleDesc = getRoleDescription(role);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to join ${brandName} on QuerySonar</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f17; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1f2937; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 6px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; color: #10b981; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      ✦ QuerySonar Team Workspace
                    </div>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 8px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                You've been invited to collaborate
              </h1>
              <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                <strong style="color: #f1f5f9;">${inviterName}</strong> has invited you to join the <strong style="color: #10b981;">${brandName}</strong> workspace on QuerySonar.
              </p>
            </td>
          </tr>

          <!-- Workspace & Role Info Card -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="background-color: #1a2234; border: 1px solid #2d3748; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-bottom: 12px; border-bottom: 1px solid #2d3748;">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Workspace Brand</span>
                      <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-top: 2px;">${brandName}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 12px;">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Assigned Role</span>
                      <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-top: 2px;">${roleName}</div>
                      <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.4;">${roleDesc}</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Primary Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${inviteUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 700; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39); text-align: center;">
                      Accept Invitation &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; word-break: break-all;">
                If the button above does not work, copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #10b981; text-decoration: underline;">${inviteUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                This invitation was sent specifically to you. If you were not expecting this invitation, you can safely ignore this email.<br>
                &copy; ${new Date().getFullYear()} QuerySonar AI Search & Brand Surveillance. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function sendViaDirectHttps({
  apiKey,
  from,
  to,
  subject,
  html,
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    });

    const req = https.request(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[EmailService] Resend email dispatched successfully. ID: ${parsed.id}`);
              resolve({ success: true, id: parsed.id });
            } else {
              console.error("[EmailService] Resend API error response:", data);
              resolve({
                success: false,
                error: parsed.message || parsed.error || `HTTP ${res.statusCode}`,
              });
            }
          } catch {
            resolve({ success: false, error: data || `HTTP ${res.statusCode}` });
          }
        });
      }
    );

    req.on("error", (err) => {
      console.error("[EmailService] Direct HTTPS error:", err);
      resolve({ success: false, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

export async function sendWorkspaceInviteEmail({
  to,
  inviterName,
  brandName,
  role,
  inviteToken,
}: SendInviteEmailParams): Promise<{ success: boolean; id?: string; error?: string; simulated?: boolean; inviteUrl: string }> {
  const appUrl = getAppUrl();
  const inviteUrl = `${appUrl}/invite/${inviteToken}`;
  const apiKey = getResendApiKey();
  const fromEmail = getFromEmail();

  // If no API key configured in dev, simulate cleanly
  if (!apiKey) {
    console.log(`\n======================================================`);
    console.log(`📨 [EmailService] Resend API key not set in .env`);
    console.log(`✉️  Simulating invitation email to: ${to}`);
    console.log(`🏢  Workspace: ${brandName} | Role: ${role}`);
    console.log(`🔗  Acceptance URL: ${inviteUrl}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: true,
      inviteUrl,
    };
  }

  try {
    const html = buildInviteEmailHtml({
      inviterName,
      brandName,
      role,
      inviteUrl,
    });

    const resendResult = await sendViaDirectHttps({
      apiKey,
      from: fromEmail,
      to,
      subject: `You've been invited to join ${brandName} on QuerySonar`,
      html,
    });

    if (!resendResult.success) {
      return {
        success: false,
        error: resendResult.error,
        inviteUrl,
      };
    }

    return {
      success: true,
      id: resendResult.id,
      inviteUrl,
    };
  } catch (err: unknown) {
    console.error("[EmailService] Failed to dispatch invite email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch email",
      inviteUrl,
    };
  }
}

export function buildPasswordResetEmailHtml({
  resetUrl,
}: {
  resetUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - QuerySonar</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f17; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1f2937; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 6px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; color: #10b981; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      ✦ QuerySonar Security
                    </div>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 8px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Password Reset Request
              </h1>
              <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                We received a request to reset the password for your QuerySonar account.
              </p>
            </td>
          </tr>

          <!-- Action CTA Box -->
          <tr>
            <td style="padding: 32px; text-align: center;">
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6; text-align: left;">
                Click the button below to choose a new password. For security, this link will expire in <strong>1 hour</strong>.
              </p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #022c22; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); transition: background-color 0.2s;">
                      Reset My Password →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5; text-align: left;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Direct Link Fallback -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: left;">
              <div style="background-color: #0b0f17; border: 1px solid #1f2937; border-radius: 8px; padding: 12px 16px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Alternative link:
                </p>
                <p style="margin: 0; font-size: 12px; word-break: break-all;">
                  <a href="${resetUrl}" style="color: #10b981; text-decoration: underline;">
                    ${resetUrl}
                  </a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0d131f; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                QuerySonar · Generative Engine Optimization & AI Intelligence
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendPasswordResetEmail({
  to,
  resetToken,
}: {
  to: string;
  resetToken: string;
}): Promise<{ success: boolean; id?: string; error?: string; simulated?: boolean; resetUrl: string }> {
  const appUrl = getAppUrl();
  const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;
  const apiKey = getResendApiKey();
  const fromEmail = getFromEmail();

  // If no API key configured in dev, simulate cleanly
  if (!apiKey) {
    console.log(`\n======================================================`);
    console.log(`📨 [EmailService] Resend API key not set in .env`);
    console.log(`✉️  Simulating password reset email to: ${to}`);
    console.log(`🔗  Reset URL: ${resetUrl}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: true,
      resetUrl,
    };
  }

  try {
    const html = buildPasswordResetEmailHtml({ resetUrl });

    const resendResult = await sendViaDirectHttps({
      apiKey,
      from: fromEmail,
      to,
      subject: `Reset your QuerySonar password`,
      html,
    });

    if (!resendResult.success) {
      return {
        success: false,
        error: resendResult.error,
        resetUrl,
      };
    }

    return {
      success: true,
      id: resendResult.id,
      resetUrl,
    };
  } catch (err: unknown) {
    console.error("[EmailService] Failed to dispatch password reset email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch email",
      resetUrl,
    };
  }
}

export function buildVerificationOtpEmailHtml({
  code,
}: {
  code: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your QuerySonar Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f17; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1f2937; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 6px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; color: #10b981; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      ✦ Account Verification
                    </div>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 20px 0 8px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Verify Your Email Address
              </h1>
              <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                Welcome to QuerySonar! Use the 6-digit verification code below to complete your registration.
              </p>
            </td>
          </tr>

          <!-- OTP Code Display Card -->
          <tr>
            <td style="padding: 36px 32px; text-align: center;">
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                Your Verification Code
              </p>
              
              <div style="display: inline-block; background-color: #06090e; border: 2px solid #10b981; border-radius: 16px; padding: 18px 36px; letter-spacing: 8px; font-size: 32px; font-weight: 900; font-family: monospace; color: #10b981; box-shadow: 0 0 25px rgba(16, 185, 129, 0.25);">
                ${code}
              </div>

              <p style="margin: 24px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                This code will expire in <strong style="color: #e2e8f0;">15 minutes</strong>.<br>If you didn't create a QuerySonar account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0d131f; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                QuerySonar · Generative Engine Optimization & AI Search Intelligence
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendVerificationOtpEmail({
  to,
  code,
}: {
  to: string;
  code: string;
}): Promise<{ success: boolean; id?: string; error?: string; simulated?: boolean }> {
  const apiKey = getResendApiKey();
  const fromEmail = getFromEmail();

  // If no API key configured in dev, simulate cleanly in logs
  if (!apiKey) {
    console.log(`\n======================================================`);
    console.log(`📨 [EmailService] Resend API key not set in .env`);
    console.log(`✉️  Simulating Email Verification OTP to: ${to}`);
    console.log(`🔑  Verification Code: ${code}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const html = buildVerificationOtpEmailHtml({ code });

    const resendResult = await sendViaDirectHttps({
      apiKey,
      from: fromEmail,
      to,
      subject: `${code} is your QuerySonar verification code`,
      html,
    });

    if (!resendResult.success) {
      return {
        success: false,
        error: resendResult.error,
      };
    }

    return {
      success: true,
      id: resendResult.id,
    };
  } catch (err: unknown) {
    console.error("[EmailService] Failed to dispatch verification OTP email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to dispatch email",
    };
  }
}


