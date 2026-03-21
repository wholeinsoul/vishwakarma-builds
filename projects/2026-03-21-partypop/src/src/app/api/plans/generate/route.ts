import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { planInputSchema } from "@/lib/validation";
import { generatePartyPlan } from "@/lib/openai";
import { getThemeBySlug } from "@/lib/themes";
import { generateRsvpSlug } from "@/lib/slug";

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie");

    // Create client with user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            ...(authHeader ? { Authorization: authHeader } : {}),
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = planInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const theme = getThemeBySlug(input.theme);
    if (!theme) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    // Check free plan limit: 1 free plan, then $4.99
    const adminSupabase = createServerSupabaseClient();
    const { count } = await adminSupabase
      .from("parties")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("plan_generated", true);

    if ((count ?? 0) >= 1) {
      // Check if this is a premium-flagged request (user already paid for a party)
      // If not, they need to pay
      return NextResponse.json(
        { error: "Free plan limit reached. Upgrade to Party Pass.", needs_payment: true },
        { status: 402 }
      );
    }

    // Generate AI plan
    const planData = await generatePartyPlan({
      theme: input.theme,
      prompt_context: theme.prompt_context,
      child_name: input.child_name,
      child_age: input.child_age,
      headcount: input.headcount,
      budget: input.budget ?? null,
      venue_type: input.venue_type,
      dietary_notes: input.dietary_notes ?? null,
    });

    // Create party with generated plan
    const rsvpSlug = generateRsvpSlug();
    const { data: party, error: insertError } = await adminSupabase
      .from("parties")
      .insert({
        user_id: user.id,
        title: input.title,
        child_name: input.child_name,
        child_age: input.child_age,
        theme: input.theme,
        headcount: input.headcount,
        budget: input.budget,
        venue_type: input.venue_type,
        party_date: input.party_date,
        dietary_notes: input.dietary_notes,
        plan_data: planData,
        plan_generated: true,
        rsvp_slug: rsvpSlug,
        rsvp_enabled: true,
        status: "generated",
      })
      .select()
      .single();

    if (insertError) {
      console.error("DB insert error:", insertError);
      return NextResponse.json({ error: "Failed to save plan" }, { status: 500 });
    }

    return NextResponse.json({ party_id: party.id, plan: planData });
  } catch (error) {
    console.error("Plan generation error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      return NextResponse.json(
        { error: "Taking longer than expected. Please try again." },
        { status: 504 }
      );
    }

    if (message.includes("429") || message.includes("rate")) {
      return NextResponse.json(
        { error: "Service is busy. Please try again in a moment." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate plan. Please try again." },
      { status: 500 }
    );
  }
}
