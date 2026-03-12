-- ConcretePOA Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- BANKS
-- ============================================================
create table public.banks (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  website text,
  poa_phone text,
  poa_email text,
  processing_time_days integer,
  accepts_springing_poa boolean default false,
  accepts_durable_poa boolean default true,
  requires_notarization boolean default true,
  requires_medallion boolean default false,
  allows_remote_submission boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- BANK REQUIREMENTS (per-bank checklist items)
-- ============================================================
create table public.bank_requirements (
  id uuid primary key default uuid_generate_v4(),
  bank_id uuid references public.banks(id) on delete cascade not null,
  category text not null, -- 'document', 'form', 'identification', 'other'
  title text not null,
  description text,
  is_required boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text default 'user', -- 'user', 'attorney', 'admin'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- POA SUBMISSIONS (user's tracker)
-- ============================================================
create table public.submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  bank_id uuid references public.banks(id) on delete cascade not null,
  principal_name text not null,
  agent_name text not null,
  poa_type text not null default 'durable', -- 'durable', 'springing', 'limited'
  status text not null default 'preparing', -- 'preparing','submitted','under_review','approved','rejected'
  submitted_at timestamptz,
  reviewed_at timestamptz,
  expires_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SUBMISSION CHECKLIST (tracks which requirements user completed)
-- ============================================================
create table public.submission_checklist (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid references public.submissions(id) on delete cascade not null,
  requirement_id uuid references public.bank_requirements(id) on delete cascade not null,
  is_completed boolean default false,
  completed_at timestamptz,
  notes text
);

-- ============================================================
-- REJECTION REPORTS (community reports)
-- ============================================================
create table public.rejection_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  bank_id uuid references public.banks(id) on delete cascade not null,
  rejection_reason text not null,
  details text,
  poa_type text,
  reported_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- REJECTION VOTES
-- ============================================================
create table public.rejection_votes (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid references public.rejection_reports(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamptz default now(),
  unique(report_id, user_id)
);

-- ============================================================
-- RENEWAL ALERTS
-- ============================================================
create table public.renewal_alerts (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid references public.submissions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  alert_date timestamptz not null,
  message text,
  is_dismissed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Banks: readable by everyone
alter table public.banks enable row level security;
create policy "Banks are viewable by everyone" on public.banks for select using (true);

-- Bank requirements: readable by everyone
alter table public.bank_requirements enable row level security;
create policy "Requirements are viewable by everyone" on public.bank_requirements for select using (true);

-- Profiles: users can read/update their own
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Submissions: users manage their own
alter table public.submissions enable row level security;
create policy "Users can view own submissions" on public.submissions for select using (auth.uid() = user_id);
create policy "Users can create own submissions" on public.submissions for insert with check (auth.uid() = user_id);
create policy "Users can update own submissions" on public.submissions for update using (auth.uid() = user_id);
create policy "Users can delete own submissions" on public.submissions for delete using (auth.uid() = user_id);

-- Submission checklist: users manage their own
alter table public.submission_checklist enable row level security;
create policy "Users can view own checklist" on public.submission_checklist for select
  using (exists (select 1 from public.submissions s where s.id = submission_id and s.user_id = auth.uid()));
create policy "Users can manage own checklist" on public.submission_checklist for insert
  with check (exists (select 1 from public.submissions s where s.id = submission_id and s.user_id = auth.uid()));
create policy "Users can update own checklist" on public.submission_checklist for update
  using (exists (select 1 from public.submissions s where s.id = submission_id and s.user_id = auth.uid()));

-- Rejection reports: anyone can view, authenticated users can create
alter table public.rejection_reports enable row level security;
create policy "Reports are viewable by everyone" on public.rejection_reports for select using (true);
create policy "Authenticated users can create reports" on public.rejection_reports for insert with check (auth.uid() = user_id);
create policy "Users can delete own reports" on public.rejection_reports for delete using (auth.uid() = user_id);

-- Rejection votes: viewable by all, manageable by owner
alter table public.rejection_votes enable row level security;
create policy "Votes are viewable by everyone" on public.rejection_votes for select using (true);
create policy "Authenticated users can vote" on public.rejection_votes for insert with check (auth.uid() = user_id);
create policy "Users can update own votes" on public.rejection_votes for update using (auth.uid() = user_id);
create policy "Users can delete own votes" on public.rejection_votes for delete using (auth.uid() = user_id);

-- Renewal alerts: users manage their own
alter table public.renewal_alerts enable row level security;
create policy "Users can view own alerts" on public.renewal_alerts for select using (auth.uid() = user_id);
create policy "Users can create own alerts" on public.renewal_alerts for insert with check (auth.uid() = user_id);
create policy "Users can update own alerts" on public.renewal_alerts for update using (auth.uid() = user_id);
create policy "Users can delete own alerts" on public.renewal_alerts for delete using (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Vote count function
create or replace function public.get_vote_counts(report_uuid uuid)
returns table(upvotes bigint, downvotes bigint) as $$
begin
  return query
  select
    count(*) filter (where vote_type = 'up') as upvotes,
    count(*) filter (where vote_type = 'down') as downvotes
  from public.rejection_votes
  where report_id = report_uuid;
end;
$$ language plpgsql;
