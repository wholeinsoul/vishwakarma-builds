import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("bar_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ profile: profile || null });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  const body = await request.json();

  // Validate
  const barName = (body.bar_name || "").trim().slice(0, 200);
  const brandVoice = ["casual", "upscale", "fun", "edgy", "classic"].includes(
    body.brand_voice
  )
    ? body.brand_voice
    : "casual";

  let defaultHashtags: string[] = [];
  if (Array.isArray(body.default_hashtags)) {
    defaultHashtags = body.default_hashtags
      .slice(0, 30)
      .map((h: string) => String(h).trim().slice(0, 100))
      .filter(Boolean);
  }

  // Sanitize social handles: only allow known keys with string values, strip HTML
  const allowedHandleKeys = ["instagram", "facebook", "twitter", "tiktok", "google"];
  const rawHandles =
    typeof body.social_handles === "object" && body.social_handles !== null
      ? body.social_handles
      : {};
  const socialHandles: Record<string, string> = {};
  for (const key of allowedHandleKeys) {
    if (typeof rawHandles[key] === "string") {
      socialHandles[key] = rawHandles[key].replace(/<[^>]*>/g, "").trim().slice(0, 100);
    }
  }

  const profileData = {
    user_id: user.id,
    bar_name: barName,
    brand_voice: brandVoice,
    default_hashtags: defaultHashtags,
    social_handles: socialHandles,
    location_city: (body.location_city || "").trim().slice(0, 100) || null,
    location_state: (body.location_state || "").trim().slice(0, 100) || null,
    updated_at: new Date().toISOString(),
  };

  // Upsert
  const { data: profile, error } = await supabase
    .from("bar_profiles")
    .upsert(profileData, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    console.error("Bar profile save error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile });
}
