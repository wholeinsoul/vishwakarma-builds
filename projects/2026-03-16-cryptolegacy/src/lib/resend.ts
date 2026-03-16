import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_ADDRESS ?? 'CryptoLegacy <noreply@cryptolegacy.app>';
}

/**
 * Remind the plan owner to check in before the dead-man's switch triggers.
 */
export async function sendCheckInReminder(
  email: string,
  planTitle: string,
  checkInUrl: string,
): Promise<void> {
  await getResend().emails.send({
    from: getFromAddress(),
    to: email,
    subject: `Reminder: Check in for "${planTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Check-In Reminder</h2>
        <p>
          Your CryptoLegacy plan <strong>${escapeHtml(planTitle)}</strong> is
          approaching its check-in deadline. Please confirm you still have
          access to your accounts.
        </p>
        <p style="margin: 24px 0;">
          <a href="${checkInUrl}"
             style="background: #2563eb; color: #fff; padding: 12px 24px;
                    border-radius: 6px; text-decoration: none; font-weight: 600;">
            Check In Now
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          If you do not check in before the deadline, your plan will be
          triggered and your beneficiaries will be notified.
        </p>
      </div>
    `,
  });
}

/**
 * Urgent final reminder sent shortly before the plan triggers.
 */
export async function sendUrgentReminder(
  email: string,
  planTitle: string,
  checkInUrl: string,
): Promise<void> {
  await getResend().emails.send({
    from: getFromAddress(),
    to: email,
    subject: `URGENT: "${planTitle}" will trigger soon`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Urgent: Final Check-In Warning</h2>
        <p>
          Your CryptoLegacy plan <strong>${escapeHtml(planTitle)}</strong> is
          about to trigger. If you do not check in now, your beneficiaries
          will receive access instructions.
        </p>
        <p style="margin: 24px 0;">
          <a href="${checkInUrl}"
             style="background: #dc2626; color: #fff; padding: 12px 24px;
                    border-radius: 6px; text-decoration: none; font-weight: 600;">
            Check In Immediately
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          This is your final reminder. If this plan triggers by mistake you
          can revoke access from your dashboard.
        </p>
      </div>
    `,
  });
}

/**
 * Notify a beneficiary that a plan has triggered and provide the
 * link to decrypt recovery instructions.
 */
export async function sendTriggerNotification(
  beneficiaryEmail: string,
  beneficiaryName: string,
  ownerName: string,
  decryptUrl: string,
): Promise<void> {
  await getResend().emails.send({
    from: getFromAddress(),
    to: beneficiaryEmail,
    subject: `${ownerName} has shared crypto recovery instructions with you`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Recovery Instructions Available</h2>
        <p>
          Hello ${escapeHtml(beneficiaryName)},
        </p>
        <p>
          <strong>${escapeHtml(ownerName)}</strong> designated you as a
          beneficiary of their CryptoLegacy plan. Their recovery
          instructions are now available for you to access.
        </p>
        <p style="margin: 24px 0;">
          <a href="${decryptUrl}"
             style="background: #2563eb; color: #fff; padding: 12px 24px;
                    border-radius: 6px; text-decoration: none; font-weight: 600;">
            View Recovery Instructions
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          You will need the passphrase that was shared with you separately
          to decrypt the instructions.
        </p>
      </div>
    `,
  });
}

/**
 * Welcome email sent on sign-up.
 */
export async function sendWelcomeEmail(email: string): Promise<void> {
  await getResend().emails.send({
    from: getFromAddress(),
    to: email,
    subject: 'Welcome to CryptoLegacy',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Welcome to CryptoLegacy</h2>
        <p>
          Thank you for signing up. CryptoLegacy helps you create a
          secure dead-man's switch for your crypto assets so your loved
          ones can recover them if something happens to you.
        </p>
        <h3>Getting started</h3>
        <ol>
          <li>Create your first recovery plan from the dashboard.</li>
          <li>Add your crypto platform credentials using our guided templates.</li>
          <li>Set a strong passphrase and share it with your beneficiaries.</li>
          <li>Configure your check-in interval &mdash; we'll remind you.</li>
        </ol>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="background: #2563eb; color: #fff; padding: 12px 24px;
                    border-radius: 6px; text-decoration: none; font-weight: 600;">
            Go to Dashboard
          </a>
        </p>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
