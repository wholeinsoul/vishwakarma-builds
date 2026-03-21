import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { rsvpInputSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateRsvpSlug } from "@/lib/slug";

// POST: Submit RSVP (public, rate-limited)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { success, remaining } = checkRateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }

    const body = await request.json();
    const parsed = rsvpInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const supabase = createServerSupabaseClient();

    // Verify party exists and has RSVP enabled
    const { data: party } = await supabase
      .from("parties")
      .select("id, rsvp_enabled, rsvp_deadline")
      .eq("id", input.party_id)
      .single();

    if (!party || !party.rsvp_enabled) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    // Check deadline
    if (party.rsvp_deadline) {
      const deadline = new Date(party.rsvp_deadline + "T23:59:59");
      if (new Date() > deadline) {
        return NextResponse.json({ error: "RSVPs are closed" }, { status: 400 });
      }
    }

    // Upsert if email provided (update existing RSVP)
    if (input.guest_email) {
      const { data: existing } = await supabase
        .from("rsvps")
        .select("id")
        .eq("party_id", input.party_id)
        .eq("guest_email", input.guest_email)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from("rsvps")
          .update({
            guest_name: input.guest_name,
            attending: input.attending,
            num_children: input.num_children,
            dietary_needs: input.dietary_needs,
            notes: input.notes,
            responded_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("RSVP update error:", updateError);
          return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
        }

        return NextResponse.json({ message: "RSVP updated" }, { status: 200 });
      }
    }

    // Insert new RSVP
    const { error: insertError } = await supabase
      .from("rsvps")
      .insert({
        party_id: input.party_id,
        guest_name: input.guest_name,
        guest_email: input.guest_email,
        attending: input.attending,
        num_children: input.num_children,
        dietary_needs: input.dietary_needs,
        notes: input.notes,
        responded_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("RSVP insert error:", insertError);
      return NextResponse.json({ error: "Failed to submit RSVP" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "RSVP submitted" },
      { status: 201, headers: { "X-RateLimit-Remaining": remaining.toString() } }
    );
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// PUT: Enable RSVP for a party (auth required)
export async function PUT(request: NextRequest) {
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
    const partyId = body.party_id;
    if (!partyId) {
      return NextResponse.json({ error: "party_id required" }, { status: 400 });
    }

    const adminSupabase = createServerSupabaseClient();

    // Verify ownership
    const { data: party } = await adminSupabase
      .from("parties")
      .select("id, user_id, rsvp_slug")
      .eq("id", partyId)
      .single();

    if (!party || party.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rsvpSlug = party.rsvp_slug || generateRsvpSlug();

    await adminSupabase
      .from("parties")
      .update({ rsvp_enabled: true, rsvp_slug: rsvpSlug })
      .eq("id", partyId);

    return NextResponse.json({ rsvp_slug: rsvpSlug });
  } catch (error) {
    console.error("Enable RSVP error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
