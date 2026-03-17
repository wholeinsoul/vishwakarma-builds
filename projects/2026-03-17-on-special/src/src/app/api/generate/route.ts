import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const TEMPLATE_PROMPTS: Record<string, string> = {
  happy_hour:
    "Focus on time-limited deals, urgency, FOMO. Mention start/end times if provided.",
  live_music:
    "Lead with the performer/genre. Build excitement. Mention cover charge if provided.",
  sports_night:
    "Reference the game/sport if mentioned. Focus on watch party vibe, food/drink deals during the game.",
  themed_event:
    "Play up the theme. Be creative with language matching the theme.",
  daily_special: "Straightforward. Lead with the deal. Make it appetizing.",
  weekend_brunch:
    "Relaxed vibe. Focus on brunch cocktails (mimosas, bloody marys) and food.",
  late_night:
    "Night owl energy. Focus on late-night bites and drinks. Mention hours.",
};

const VALID_TEMPLATES = Object.keys(TEMPLATE_PROMPTS);

export async function POST(request: Request) {
  const startTime = Date.now();
  const warnings: string[] = [];

  try {
    // 1. Auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    // 2. Parse & validate input
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const specialsText = (String(body.specials_text || "")).trim();
    const templateType = String(body.template_type || "daily_special");

    if (!specialsText) {
      return NextResponse.json(
        { error: "Please enter tonight's specials" },
        { status: 400 }
      );
    }
    if (specialsText.length > 2000) {
      return NextResponse.json(
        { error: "Specials text too long (max 2000 chars)" },
        { status: 400 }
      );
    }
    if (!VALID_TEMPLATES.includes(templateType)) {
      return NextResponse.json(
        { error: "Invalid template type" },
        { status: 400 }
      );
    }

    // 3. Check subscription
    const serviceClient = createServiceClient();
    const { data: subscription } = await serviceClient
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single();

    const isSubscribed = subscription?.status === "active" || subscription?.status === "trialing";

    // 4. Rate limit check
    const today = new Date().toISOString().split("T")[0];
    const { data: rateLimit } = await serviceClient
      .from("rate_limits")
      .select("generation_count")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    const currentCount = rateLimit?.generation_count || 0;
    const dailyLimit = isSubscribed ? 50 : 3;

    if (currentCount >= dailyLimit) {
      if (!isSubscribed) {
        return NextResponse.json(
          { error: "subscription_required", message: "Free tier limit reached. Upgrade to generate more content." },
          { status: 403 }
        );
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return NextResponse.json(
        { error: "Daily limit reached", reset_at: tomorrow.toISOString() },
        { status: 429 }
      );
    }

    // 5. Fetch bar profile
    const { data: barProfile } = await supabase
      .from("bar_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const barName = barProfile?.bar_name || "Our Bar";
    const brandVoice = barProfile?.brand_voice || "casual";
    const hashtags = barProfile?.default_hashtags?.length
      ? barProfile.default_hashtags.map((h: string) =>
          h.startsWith("#") ? h : `#${h}`
        )
      : [];
    const handles = barProfile?.social_handles || {};

    if (!barProfile || !barProfile.bar_name) {
      warnings.push(
        "Set up your bar profile for better results → Settings"
      );
    }

    // 6. Build prompts & call OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `You are a social media expert for bars and restaurants.
Generate content for tonight's specials.
Match the brand voice: ${brandVoice}.
Bar name: ${barName}.
Include relevant emojis.
NEVER mention competitor bars.
Keep Instagram captions under 2200 chars.
Keep Facebook posts under 500 chars.
Keep Google updates under 1500 chars.
Match the language of the input.`;

    const templateContext = TEMPLATE_PROMPTS[templateType] || "";

    const userPrompt = `Template: ${templateType}
${templateContext}

Tonight's specials:
${specialsText}

${hashtags.length ? `Default hashtags to include: ${hashtags.join(" ")}` : ""}
${handles.instagram ? `Instagram handle: ${handles.instagram}` : ""}
${handles.facebook ? `Facebook page: ${handles.facebook}` : ""}

Generate JSON with this exact structure:
{
  "instagram": { "caption": "string", "hashtags": ["string"] },
  "facebook": { "post": "string" },
  "google": { "update": "string" }
}`;

    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.8,
      },
    );

    const generationTimeMs = Date.now() - startTime;
    const tokensUsed = completion.usage?.total_tokens || null;

    // 7. Parse response
    const rawContent = completion.choices[0]?.message?.content || "";
    let parsed: {
      instagram?: { caption?: string; hashtags?: string[] };
      facebook?: { post?: string };
      google?: { update?: string };
    };

    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse OpenAI response:", rawContent);
      return NextResponse.json(
        { error: "Content generation failed. Please try again." },
        { status: 500 }
      );
    }

    const instagramCaption = parsed.instagram?.caption || null;
    const instagramHashtags = parsed.instagram?.hashtags || null;
    const facebookPost = parsed.facebook?.post || null;
    const googleUpdate = parsed.google?.update || null;

    if (!instagramCaption && !facebookPost && !googleUpdate) {
      return NextResponse.json(
        { error: "Content generation failed. Please try again." },
        { status: 500 }
      );
    }

    if (!instagramCaption) warnings.push("Couldn't generate Instagram content. Try regenerating.");
    if (!facebookPost) warnings.push("Couldn't generate Facebook content. Try regenerating.");
    if (!googleUpdate) warnings.push("Couldn't generate Google content. Try regenerating.");

    // 8. Store in history (don't block on failure)
    let generationId = "";
    try {
      const { data: gen } = await serviceClient.from("generations").insert({
        user_id: user.id,
        bar_profile_id: barProfile?.id || null,
        specials_text: specialsText,
        template_type: templateType,
        instagram_caption: instagramCaption,
        instagram_hashtags: instagramHashtags,
        facebook_post: facebookPost,
        google_update: googleUpdate,
        model_used: "gpt-4o-mini",
        tokens_used: tokensUsed,
        generation_time_ms: generationTimeMs,
      }).select("id").single();
      generationId = gen?.id || "";
    } catch (err) {
      console.error("Failed to save generation:", err);
    }

    // 9. Increment rate limit (atomic upsert)
    await serviceClient.rpc("increment_rate_limit", {
      p_user_id: user.id,
      p_date: today,
    }).then(({ error }) => {
      if (error) {
        // Fallback: try upsert directly
        return serviceClient.from("rate_limits").upsert(
          { user_id: user.id, date: today, generation_count: currentCount + 1 },
          { onConflict: "user_id,date" }
        );
      }
    });

    return NextResponse.json({
      instagram: {
        caption: instagramCaption || "",
        hashtags: instagramHashtags || [],
      },
      facebook: { post: facebookPost || "" },
      google: { update: googleUpdate || "" },
      generation_id: generationId,
      warnings,
    });
  } catch (err) {
    console.error("Generate error:", err);

    if (err instanceof Error && err.message?.includes("timeout")) {
      return NextResponse.json(
        { error: "Content generation timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Content service temporarily unavailable." },
      { status: 503 }
    );
  }
}
