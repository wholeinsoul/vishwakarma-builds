export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  sendCheckInReminder,
  sendUrgentReminder,
  sendTriggerNotification,
} from '@/lib/resend';

/**
 * GET /api/cron/switches
 * Daily dead man's switch check, invoked by Vercel Cron.
 * Checks all active plans whose next_check_in has passed and
 * sends reminders, urgent warnings, or triggers the switch.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the CRON_SECRET from the Authorization header
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all active plans where next_check_in has passed
    const { data: expiredPlans, error: queryError } = await supabaseAdmin
      .from('plans')
      .select('id, user_id, title, next_check_in, check_in_interval_days')
      .eq('status', 'active')
      .lt('next_check_in', new Date().toISOString());

    if (queryError) {
      console.error('[CRON /api/cron/switches] query error:', queryError);
      return NextResponse.json(
        { error: queryError.message },
        { status: 500 },
      );
    }

    if (!expiredPlans || expiredPlans.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cryptolegacy.app';
    let processed = 0;

    for (const plan of expiredPlans) {
      try {
        const now = new Date();
        const nextCheckIn = new Date(plan.next_check_in);
        const daysOverdue = Math.floor(
          (now.getTime() - nextCheckIn.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Get plan owner's email from auth.users
        const { data: ownerData, error: userError } =
          await supabaseAdmin.auth.admin.getUserById(plan.user_id);

        if (userError || !ownerData?.user?.email) {
          console.error(
            `[CRON] Could not fetch owner for plan ${plan.id}:`,
            userError,
          );
          continue;
        }

        const ownerEmail = ownerData.user.email;
        const ownerName =
          ownerData.user.user_metadata?.full_name ??
          ownerData.user.email ??
          'A CryptoLegacy user';
        const checkInUrl = `${appUrl}/api/check-in?plan=${plan.id}`;

        if (daysOverdue < 7) {
          // Send a standard reminder
          await sendCheckInReminder(ownerEmail, plan.title, checkInUrl);
        } else if (daysOverdue >= 7 && daysOverdue < 14) {
          // Send urgent reminder
          await sendUrgentReminder(ownerEmail, plan.title, checkInUrl);
        } else {
          // daysOverdue >= 14 — TRIGGER the switch
          // Update plan status to triggered
          const { error: triggerError } = await supabaseAdmin
            .from('plans')
            .update({ status: 'triggered' })
            .eq('id', plan.id);

          if (triggerError) {
            console.error(
              `[CRON] Failed to trigger plan ${plan.id}:`,
              triggerError,
            );
            continue;
          }

          // Get all beneficiaries for this plan
          const { data: beneficiaries, error: benError } = await supabaseAdmin
            .from('beneficiaries')
            .select('id, name, email, notify_token')
            .eq('plan_id', plan.id);

          if (benError) {
            console.error(
              `[CRON] Failed to fetch beneficiaries for plan ${plan.id}:`,
              benError,
            );
            continue;
          }

          // Notify each beneficiary
          for (const ben of beneficiaries ?? []) {
            const decryptUrl = `${appUrl}/decrypt?token=${ben.notify_token}`;

            try {
              await sendTriggerNotification(
                ben.email,
                ben.name,
                ownerName,
                decryptUrl,
              );

              // Mark beneficiary as notified
              await supabaseAdmin
                .from('beneficiaries')
                .update({ notified: true })
                .eq('id', ben.id);
            } catch (emailErr) {
              console.error(
                `[CRON] Failed to notify beneficiary ${ben.id}:`,
                emailErr,
              );
            }
          }
        }

        processed++;
      } catch (planErr) {
        console.error(`[CRON] Error processing plan ${plan.id}:`, planErr);
      }
    }

    return NextResponse.json({ processed });
  } catch (err) {
    console.error('[GET /api/cron/switches]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
