export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

/**
 * POST /api/webhook/stripe
 * Handle incoming Stripe webhook events.
 * Verifies the signature, then processes subscription lifecycle events.
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 },
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Stripe Webhook] Signature verification failed:', message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 },
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[POST /api/webhook/stripe]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

/**
 * checkout.session.completed
 * A customer has successfully completed a Stripe Checkout session.
 * Create or update their subscription record.
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.userId;
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !customerId) {
    console.error(
      '[Stripe Webhook] checkout.session.completed missing userId or customerId',
    );
    return;
  }

  // Check if subscription record already exists for this user
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update the existing record
    await supabaseAdmin
      .from('subscriptions')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId ?? null,
        status: 'active',
      })
      .eq('user_id', userId);
  } else {
    // Insert a new subscription record
    await supabaseAdmin.from('subscriptions').insert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId ?? null,
      status: 'active',
    });
  }
}

/**
 * customer.subscription.updated
 * A subscription's status or details have changed.
 * Sync the status in our database.
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const subscriptionId = subscription.id;
  const status = mapStripeStatus(subscription.status);
  const currentPeriodEnd = new Date(
    subscription.current_period_end * 1000,
  ).toISOString();

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status, current_period_end: currentPeriodEnd })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error(
      '[Stripe Webhook] Failed to update subscription:',
      error,
    );
  }
}

/**
 * customer.subscription.deleted
 * The subscription has been canceled and is no longer active.
 * Mark as canceled and pause all user's plans.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const subscriptionId = subscription.id;

  // Get the subscription record to find the user_id
  const { data: sub, error: fetchError } = await supabaseAdmin
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (fetchError || !sub) {
    console.error(
      '[Stripe Webhook] Subscription not found for deletion:',
      subscriptionId,
    );
    return;
  }

  // Mark subscription as canceled
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('id', sub.id);

  // Pause all active plans for this user
  await supabaseAdmin
    .from('plans')
    .update({ status: 'paused' })
    .eq('user_id', sub.user_id)
    .eq('status', 'active');
}

/**
 * invoice.payment_failed
 * A payment attempt has failed. Mark the subscription as past_due.
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) {
    return;
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error(
      '[Stripe Webhook] Failed to mark subscription as past_due:',
      error,
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a Stripe subscription status to our internal status enum.
 */
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status,
): string {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    case 'trialing':
      return 'trialing';
    default:
      return 'active';
  }
}
