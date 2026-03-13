export interface County {
  id: string;
  name: string;
  state: string;
  state_full: string;
  slug: string;
  description: string | null;
  population: number | null;
  septic_pct: number | null;
  meta_title: string | null;
  meta_desc: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  county_id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  description: string | null;
  services: string[];
  service_area: string | null;
  pricing_range: string | null;
  response_time: string | null;
  years_in_biz: number | null;
  license_number: string | null;
  is_verified: boolean;
  is_premium: boolean;
  is_claimed: boolean;
  claim_email: string | null;
  photo_urls: string[];
  avg_rating: number;
  review_count: number;
  sort_order: number;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
  county?: County;
}

export interface Review {
  id: string;
  provider_id: string;
  author_name: string;
  author_city: string | null;
  rating: number;
  title: string | null;
  body: string;
  service_type: string | null;
  service_date: string | null;
  is_verified: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  ip_hash: string | null;
  created_at: string;
  provider?: Provider;
}

export interface Lead {
  id: string;
  email: string;
  name: string | null;
  source: string;
  county_slug: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'moderator' | 'admin';
  created_at: string;
}
