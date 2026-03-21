export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface Party {
  id: string;
  user_id: string;
  title: string;
  child_name: string;
  child_age: number;
  theme: string;
  headcount: number;
  budget: number | null;
  venue_type: "backyard" | "park" | "indoor" | "venue" | "restaurant";
  party_date: string | null;
  dietary_notes: string | null;
  plan_data: PlanData | null;
  plan_generated: boolean;
  is_premium: boolean;
  stripe_session: string | null;
  rsvp_enabled: boolean;
  rsvp_slug: string | null;
  rsvp_deadline: string | null;
  status: "draft" | "generated" | "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface PlanData {
  party_title: string;
  timeline: TimelineItem[];
  activities: Activity[];
  food_menu: FoodItem[];
  decorations: DecorationItem[];
  shopping_list: ShoppingItem[];
  tips: string[];
  estimated_total: number;
}

export interface TimelineItem {
  time: string;
  duration_min: number;
  activity: string;
  description: string;
  supplies_needed: string[];
}

export interface Activity {
  name: string;
  description: string;
  age_appropriate: boolean;
  duration_min: number;
  supplies: string[];
  instructions: string;
}

export interface FoodItem {
  item: string;
  quantity: string;
  notes: string;
}

export interface DecorationItem {
  item: string;
  quantity: number;
  estimated_cost: number;
}

export interface ShoppingItem {
  item: string;
  quantity: string;
  category: "food" | "decoration" | "activity" | "supplies";
  estimated_cost: number;
}

export interface Rsvp {
  id: string;
  party_id: string;
  guest_name: string;
  guest_email: string | null;
  attending: "yes" | "no" | "maybe" | "pending";
  num_children: number;
  dietary_needs: string | null;
  notes: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface ThemeTemplate {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string | null;
  color_primary: string;
  color_secondary: string;
  prompt_context: string;
  age_min: number;
  age_max: number;
  is_active: boolean;
  sort_order: number;
}

export interface PlanWizardData {
  theme: string;
  child_name: string;
  child_age: number;
  title: string;
  headcount: number;
  budget: number | null;
  venue_type: "backyard" | "park" | "indoor" | "venue" | "restaurant";
  party_date: string | null;
  dietary_notes: string | null;
}
