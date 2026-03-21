import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { FALLBACK_THEMES } from "@/lib/themes";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("theme_templates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      // Return hardcoded fallback themes
      return NextResponse.json(FALLBACK_THEMES);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_THEMES);
  }
}
