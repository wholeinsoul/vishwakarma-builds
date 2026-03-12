# Schema Application Guide — ConcretePOA

## Supabase Database Setup

**Project:** rptejtlnpscsimhpqwlt.supabase.co  
**Status:** ⚠️ Schema not yet applied  
**Required:** Apply `supabase/schema.sql` + `supabase/seed.sql` before deployment

---

## Method 1: Supabase SQL Editor (Recommended)

### Step 1: Open Supabase SQL Editor

1. Go to [https://supabase.com/dashboard/project/rptejtlnpscsimhpqwlt](https://supabase.com/dashboard/project/rptejtlnpscsimhpqwlt)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Apply Schema

1. Copy the contents of `src/supabase/schema.sql`
2. Paste into the SQL Editor
3. Click **Run** (or press `Cmd+Enter`)
4. Wait for "Success. No rows returned" message

### Step 3: Apply Seed Data

1. Copy the contents of `src/supabase/seed.sql`
2. Paste into a new SQL Editor tab
3. Click **Run**
4. Verify: Should see "Success" and 10 rows inserted into banks

### Step 4: Verify Schema

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- banks
- bank_requirements
- profiles
- rejection_reports
- rejection_votes
- renewal_alerts
- submission_checklist
- submissions

---

## Method 2: psql Command Line

If you have `psql` installed:

```bash
# Combine schema + seed into one file
cat src/supabase/schema.sql src/supabase/seed.sql > /tmp/concretepoa_full.sql

# Apply to Supabase database
psql "postgresql://postgres.rptejtlnpscsimhpqwlt:oioA50tB6wf563OQ@aws-0-us-east-1.pooler.supabase.com:6543/postgres" < /tmp/concretepoa_full.sql
```

---

## Method 3: Supabase CLI

If you have Supabase CLI installed:

```bash
cd projects/2026-03-12-poa-toolkit/src

# Link to project
supabase link --project-ref rptejtlnpscsimhpqwlt

# Push migrations
supabase db push
```

---

## Verification Checklist

After applying schema, verify:

- [ ] ✅ All 8 tables exist in `public` schema
- [ ] ✅ RLS policies are enabled on all tables
- [ ] ✅ 10 banks inserted (run `SELECT COUNT(*) FROM banks;` → should return 10)
- [ ] ✅ Bank requirements exist (run `SELECT COUNT(*) FROM bank_requirements;` → should return ~70)
- [ ] ✅ `handle_new_user()` trigger exists
- [ ] ✅ `get_vote_counts()` function exists

---

## Troubleshooting

### "relation already exists"
**Cause:** Schema already applied  
**Fix:** Either:
1. Drop all tables first: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
2. Or modify schema.sql to use `CREATE TABLE IF NOT EXISTS`

### "permission denied"
**Cause:** Using anon key instead of service role key  
**Fix:** Ensure you're logged into Supabase dashboard or using service role key

### "function handle_new_user() does not exist"
**Cause:** Trigger creation failed  
**Fix:** Manually create the trigger:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## Database Indexes (Apply After Schema)

**CRITICAL:** These indexes are not in schema.sql but should be added for performance:

```sql
-- Foreign key indexes
CREATE INDEX idx_bank_requirements_bank_id ON public.bank_requirements(bank_id);
CREATE INDEX idx_rejection_reports_bank_id ON public.rejection_reports(bank_id);
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submission_checklist_submission_id ON public.submission_checklist(submission_id);
CREATE INDEX idx_rejection_votes_report_id ON public.rejection_votes(report_id);

-- Composite index for common queries
CREATE INDEX idx_submissions_user_status ON public.submissions(user_id, status);
CREATE INDEX idx_rejection_reports_bank_recent ON public.rejection_reports(bank_id, reported_at DESC);
```

---

## Current Status

**As of 2026-03-12 12:35 PDT:**
- ❌ Schema NOT applied (fresh database)
- ❌ Seed data NOT loaded
- ❌ Indexes NOT created
- ✅ Supabase project active
- ✅ Environment variables configured in `.env.local`

**Next step:** Apply schema via Supabase SQL Editor (Method 1)
