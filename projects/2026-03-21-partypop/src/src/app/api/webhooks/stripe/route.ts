import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const partyId = session.metadata?.party_id;

    if (!partyId) {
      console.warn("Stripe webhook: no party_id in metadata");
      return NextResponse.json({ received: true });
    }

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("parties")
      .update({
        is_premium: true,
        stripe_session: session.id,
        status: "active",
      })
      .eq("id", partyId);

    if (error) {
      console.error("Failed to update party premium status:", error);
    }
  }

  return NextResponse.json({ received: true });
}
