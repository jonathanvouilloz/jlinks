import { Resend } from 'resend';

// Resend is optional - if no API key, emails won't be sent
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'jLinks <noreply@jonlabs.ch>';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173';

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${ADMIN_URL}/reset-password?token=${token}`;

  // If Resend is not configured, log the reset URL for development
  if (!resend) {
    console.log('=== PASSWORD RESET (Resend not configured) ===');
    console.log(`Email: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('=============================================');
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Réinitialisation de votre mot de passe jLinks',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h1 style="margin: 0 0 24px 0; font-size: 24px; color: #1a1a1a;">Réinitialisation du mot de passe</h1>
            <p style="margin: 0 0 16px 0; color: #4a4a4a; line-height: 1.5;">
              Vous avez demandé à réinitialiser votre mot de passe jLinks.
            </p>
            <p style="margin: 0 0 24px 0; color: #4a4a4a; line-height: 1.5;">
              Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
            </p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #00D9A3; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
              Réinitialiser mon mot de passe
            </a>
            <p style="margin: 24px 0 0 0; color: #888; font-size: 14px; line-height: 1.5;">
              Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}
