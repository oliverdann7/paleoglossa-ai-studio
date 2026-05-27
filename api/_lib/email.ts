import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — emails disabled');
    return null;
  }
  _resend = new Resend(key);
  return _resend;
}

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Paleoglossa <noreply@paleoglossa.com>';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    return true;
  } catch (err) {
    console.error('[email] Failed to send:', err);
    return false;
  }
}

export function sendWelcomeEmail(to: string, displayName?: string) {
  const name = displayName || 'Scholar';
  return sendEmail({
    to,
    subject: 'Welcome to Paleoglossa',
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #2c2c2c;">
        <h1 style="font-size: 24px; color: #1E3D6E;">Welcome, ${name}!</h1>
        <p>Thank you for joining <strong>Paleoglossa</strong> — your companion for reading ancient texts in the original languages.</p>
        <p>Here's how to get started:</p>
        <ol>
          <li><strong>Pick a text</strong> from the library that matches your level</li>
          <li><strong>Tap any word</strong> to see its gloss, morphology, and parsing</li>
          <li><strong>Save words</strong> you want to learn — they'll appear in your review queue</li>
        </ol>
        <p style="margin-top: 24px;">
          <a href="https://paleoglossa.com/app" style="background: #1E3D6E; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Start Reading</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e0dcd4; margin: 32px 0 16px;" />
        <p style="font-size: 13px; color: #888;">If you have any questions, reply to this email or visit our <a href="https://paleoglossa.com/support" style="color: #1E3D6E;">support page</a>.</p>
      </div>
    `,
    replyTo: 'support@paleoglossa.com',
  });
}

export function sendPaymentReceiptEmail(
  to: string,
  planName: string,
  amountFormatted: string,
  receiptUrl?: string
) {
  const receiptLink = receiptUrl
    ? `<p><a href="${receiptUrl}" style="color: #1E3D6E;">View your receipt on Stripe</a></p>`
    : '';
  return sendEmail({
    to,
    subject: 'Payment confirmed — Paleoglossa',
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #2c2c2c;">
        <h1 style="font-size: 24px; color: #1E3D6E;">Payment Received</h1>
        <p>Your subscription to <strong>${planName}</strong> is active.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #888;">Plan</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${planName}</td></tr>
          <tr><td style="padding: 8px 0; color: #888;">Amount</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${amountFormatted}</td></tr>
        </table>
        ${receiptLink}
        <p>You now have full access to the entire library. Happy reading!</p>
        <hr style="border: none; border-top: 1px solid #e0dcd4; margin: 32px 0 16px;" />
        <p style="font-size: 13px; color: #888;">Manage your subscription anytime from your <a href="https://paleoglossa.com/app/subscription" style="color: #1E3D6E;">account settings</a>.</p>
      </div>
    `,
  });
}

export function sendPaymentFailedEmail(to: string, portalUrl?: string) {
  const portalLink = portalUrl
    ? `<p><a href="${portalUrl}" style="background: #1E3D6E; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Update Payment Method</a></p>`
    : `<p>Please update your payment method in your <a href="https://paleoglossa.com/app/subscription" style="color: #1E3D6E;">subscription settings</a>.</p>`;
  return sendEmail({
    to,
    subject: 'Payment failed — action required',
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #2c2c2c;">
        <h1 style="font-size: 24px; color: #c0392b;">Payment Failed</h1>
        <p>We were unable to process your latest payment for Paleoglossa. Your access may be interrupted if this is not resolved.</p>
        ${portalLink}
        <hr style="border: none; border-top: 1px solid #e0dcd4; margin: 32px 0 16px;" />
        <p style="font-size: 13px; color: #888;">If you believe this is an error, please contact <a href="mailto:support@paleoglossa.com" style="color: #1E3D6E;">support@paleoglossa.com</a>.</p>
      </div>
    `,
  });
}
