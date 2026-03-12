export interface Bank {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  poa_phone: string | null;
  poa_email: string | null;
  processing_time_days: number | null;
  accepts_springing_poa: boolean;
  accepts_durable_poa: boolean;
  requires_notarization: boolean;
  requires_medallion: boolean;
  allows_remote_submission: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankRequirement {
  id: string;
  bank_id: string;
  category: "document" | "form" | "identification" | "other";
  title: string;
  description: string | null;
  is_required: boolean;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  bank_id: string;
  principal_name: string;
  agent_name: string;
  poa_type: "durable" | "springing" | "limited";
  status: "preparing" | "submitted" | "under_review" | "approved" | "rejected";
  submitted_at: string | null;
  reviewed_at: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  bank?: Bank;
}

export interface SubmissionChecklist {
  id: string;
  submission_id: string;
  requirement_id: string;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  requirement?: BankRequirement;
}

export interface RejectionReport {
  id: string;
  user_id: string;
  bank_id: string;
  rejection_reason: string;
  details: string | null;
  poa_type: string | null;
  reported_at: string;
  created_at: string;
  bank?: Bank;
  upvotes?: number;
  downvotes?: number;
}

export interface RejectionVote {
  id: string;
  report_id: string;
  user_id: string;
  vote_type: "up" | "down";
  created_at: string;
}

export interface RenewalAlert {
  id: string;
  submission_id: string;
  user_id: string;
  alert_date: string;
  message: string | null;
  is_dismissed: boolean;
  created_at: string;
  submission?: Submission;
}
