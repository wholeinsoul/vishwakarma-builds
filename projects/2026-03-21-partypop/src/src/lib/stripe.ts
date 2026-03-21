import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export async function createCheckoutSession(partyId: string, userEmail: string) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/plan/${partyId}?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/plan/${partyId}`,
    customer_email: userEmail,
    metadata: {
      party_id: partyId,
    },
  });

  return session;
}
