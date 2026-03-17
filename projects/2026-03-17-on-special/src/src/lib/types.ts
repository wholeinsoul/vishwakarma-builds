export interface BarProfile {
  id: string;
  user_id: string;
  bar_name: string;
  brand_voice: string;
  default_hashtags: string[];
  social_handles: Record<string, string>;
  logo_url: string | null;
  location_city: string | null;
  location_state: string | null;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  bar_profile_id: string | null;
  specials_text: string;
  template_type: string;
  instagram_caption: string | null;
  instagram_hashtags: string[] | null;
  facebook_post: string | null;
  google_update: string | null;
  model_used: string;
  tokens_used: number | null;
  generation_time_ms: number | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface GenerateRequest {
  specials_text: string;
  template_type: string;
}

export interface GenerateResponse {
  instagram: { caption: string; hashtags: string[] };
  facebook: { post: string };
  google: { update: string };
  generation_id: string;
  warnings: string[];
}

export const TEMPLATE_TYPES = [
  { value: "daily_special", label: "Daily Special" },
  { value: "happy_hour", label: "Happy Hour" },
  { value: "live_music", label: "Live Music" },
  { value: "sports_night", label: "Sports Night" },
  { value: "themed_event", label: "Themed Event" },
  { value: "weekend_brunch", label: "Weekend Brunch" },
  { value: "late_night", label: "Late Night" },
] as const;

export const BRAND_VOICES = [
  { value: "casual", label: "Casual" },
  { value: "upscale", label: "Upscale" },
  { value: "fun", label: "Fun" },
  { value: "edgy", label: "Edgy" },
  { value: "classic", label: "Classic" },
] as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[number]["value"];
export type BrandVoice = (typeof BRAND_VOICES)[number]["value"];
