import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { createCheckoutSession } from "@/lib/stripe";
import { checkoutInputSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Cookie: request.headers.get("cookie") || "",
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const adminSupabase = createServerSupabaseClient();

    // Verify party ownership
    const { data: party } = await adminSupabase
      .from("parties")
      .select("id, user_id")
      .eq("id", parsed.data.party_id)
      .single();

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    if (party.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const session = await createCheckoutSession(parsed.data.party_id, user.email!);

    // Store stripe session ID
    await adminSupabase
      .from("parties")
      .update({ stripe_session: session.id })
      .eq("id", parsed.data.party_id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Payment service unavailable. Please try again." },
      { status: 500 }
    );
  }
}
