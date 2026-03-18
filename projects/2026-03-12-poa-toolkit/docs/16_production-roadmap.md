# Production Roadmap — ConcretePOA / POA Autopilot

**Status:** Working MVP with fake data. NOT production-ready.
**Last Updated:** 2026-03-12

---

## What We Have Today

A fully functional Next.js + Supabase app deployed at https://src-alpha-eight.vercel.app with:
- Landing page selling $399 concierge service
- 6-step intake wizard
- Simulated payment page
- Auth (sign up / sign in)
- Dashboard with submission tracking
- Interactive document checklist
- 10 banks with 71 requirements
- 28 automated tests passing

**The critical problem:** All bank data is AI-generated. None of it has been verified against actual bank policies. We cannot charge money for unverified information.

---

## What Must Be Done Before Charging Money

### 🔴 P0: Data Integrity (BLOCKS EVERYTHING)

**The product's entire value is accurate bank requirements. Without verified data, we have nothing.**

#### 1. Verify Bank Requirements Manually
- Call each bank's legal/POA department (all 10 banks)
- For each bank, confirm:
  - What POA types they accept (durable, springing, limited)
  - Required documents (original vs certified copy, notarization specifics)
  - Required identification (agent ID, principal ID, types accepted)
  - Required forms (bank-specific internal forms)
  - Processing time (actual, not estimated)
  - Submission method (in-branch only, mail, fax, online)
  - Phone number for POA department
  - Any state-specific variations
- Record the date of verification
- Record the name/title of person who confirmed (if given)
- Estimated time: 2-4 hours per bank = 20-40 hours total

#### 2. Add "Last Verified" to Every Requirement
- Schema change: add `verified_at` (timestamptz) and `verified_by` (text) to `bank_requirements` table
- Schema change: add `last_verified_at` to `banks` table
- Display "Last verified: March 2026" on every bank detail page
- If data is >90 days old, show warning: "This information may be outdated"

#### 3. Add Data Source Citations
- Schema change: add `source_url` and `source_note` to `bank_requirements`
- Where possible, link to the bank's actual POA policy page
- If sourced via phone call, note: "Verified via phone call to [bank] POA department on [date]"

#### 4. Add Disclaimer (Legal Protection)
- Already have basic disclaimer in footer
- Need more prominent disclaimer on bank detail pages:
  "Requirements are verified periodically but may change without notice. Always confirm directly with your bank before submitting."
- Terms of Service page with liability limitations
- Privacy Policy page

---

### 🟡 P1: Real Payment Integration

#### 5. Stripe Integration
- Create Stripe account (can use test mode first)
- Install `stripe` npm package
- Create API route: `/api/checkout` — creates Stripe Checkout Session
- Create API route: `/api/webhooks/stripe` — handles payment confirmation
- Only create submissions AFTER successful payment (not before like current simulation)
- Handle failed payments, refunds, disputes
- Add Stripe webhook secret to env vars
- Estimated time: 4-6 hours

#### 6. Payment Flow
- User completes intake → redirected to Stripe Checkout (hosted page)
- Stripe handles card processing, 3D Secure, etc.
- On success → webhook fires → create submissions → redirect to dashboard
- On cancel → back to intake review
- Receipt email sent automatically by Stripe

---

### 🟡 P2: Data Freshness System

#### 7. Quarterly Verification Workflow
- Cron job or reminder: every 90 days, re-verify all bank requirements
- Admin page (`/admin/verify`) showing:
  - Banks sorted by "days since last verification"
  - Red flag on anything >90 days old
  - Verification checklist per bank
  - Log of changes found
- Estimated time: 8-12 hours to build admin interface

#### 8. Community Corrections
- "Report an issue" button on each requirement
- User submits: "This requirement is wrong because [reason]"
- Corrections go into review queue (not auto-applied)
- Admin reviews and approves/rejects
- Schema: `requirement_corrections` table
- Estimated time: 6-8 hours

#### 9. Rejection Reports as Data Signal
- Already have rejection_reports table
- Add analytics: if 3+ users report rejection at same bank for same reason, flag that bank's requirements for re-verification
- This turns user pain into data quality improvement
- Estimated time: 4-6 hours

---

### 🟡 P3: Missing Features for Real Users

#### 10. Email Notifications
- Sign up for Resend (free tier: 3000 emails/month)
- Welcome email on signup
- Submission status updates (submitted → under review → approved/rejected)
- Renewal reminders (60 days before POA expiration)
- Estimated time: 4-6 hours

#### 11. Document Upload
- Intake step 5 currently has no actual upload functionality
- Need Supabase Storage bucket for POA document uploads
- File type restrictions (PDF, JPG, PNG only)
- Max file size (10MB)
- Secure access (only the user + admins can view)
- Estimated time: 3-4 hours

#### 12. Concierge Operations Dashboard
- `/admin` — internal tool for managing concierge submissions
- View all paid submissions
- Update submission status (triggers email to user)
- Notes/comments per submission
- Assignment to team members (when team grows)
- For now, Supabase dashboard can serve as admin tool
- Estimated time: 8-12 hours (or skip and use Supabase dashboard)

#### 13. Missing Auth Routes
- Password reset flow
- Email change
- Account deletion
- Estimated time: 2-3 hours

---

### 🟢 P4: Polish & Trust

#### 14. SEO + Content
- Blog posts targeting keywords: "power of attorney bank requirements [bank name]"
- Individual landing pages per bank (e.g., /banks/chase should be SEO-optimized)
- FAQ page addressing common POA questions
- "How it works" detailed page with real examples

#### 15. Trust Signals
- Testimonials (need real users first)
- "As seen in" (need press)
- Security badges (SSL, Supabase encryption, RLS)
- Attorney partnership disclosure
- BBB listing / Trust Pilot

#### 16. Analytics
- Vercel Analytics (free, already available)
- PostHog or Mixpanel for user behavior tracking
- Conversion funnel: landing → intake → payment → dashboard
- Track which banks are most searched

#### 17. Error Handling & Edge Cases
- What happens when Supabase is down? (graceful degradation)
- Rate limiting on auth attempts
- Input sanitization (XSS prevention)
- CSRF protection
- Session timeout handling

---

## Launch Checklist

Before flipping the switch and accepting real money:

- [ ] All 10 banks verified via phone calls (P0)
- [ ] "Last verified" dates displayed (P0)
- [ ] Source citations on requirements (P0)
- [ ] Legal disclaimer prominent on all pages (P0)
- [ ] Terms of Service page (P0)
- [ ] Privacy Policy page (P0)
- [ ] Stripe integration (test mode verified) (P1)
- [ ] Stripe integration (live mode) (P1)
- [ ] Welcome email on signup (P3)
- [ ] Payment confirmation email (P3)
- [ ] At least 3 real users have tested the full flow (manual QA)
- [ ] Attorney review of ToS + disclaimer language
- [ ] E&O insurance policy obtained (CEO review recommendation)
- [ ] Domain purchased (e.g., poaautopilot.com or concretepoa.com)
- [ ] Custom domain on Vercel

---

## Estimated Timeline

| Phase | Work | Time Estimate | Dependency |
|-------|------|---------------|------------|
| **P0: Data** | Verify 10 banks + schema changes + citations | 30-50 hours | Human phone calls |
| **P1: Payment** | Stripe integration | 4-6 hours | Stripe account |
| **P2: Freshness** | Admin panel + community corrections | 18-26 hours | P0 complete |
| **P3: Features** | Email + upload + ops dashboard | 17-25 hours | P1 complete |
| **P4: Polish** | SEO + trust + analytics | 20-30 hours | P3 complete |

**Total to production:** ~90-140 hours of work + bank verification calls

**Fastest path to revenue:**
1. Verify 3 banks manually (Chase, BofA, Wells Fargo) — 6-12 hours
2. Add Stripe — 4-6 hours
3. Add basic email notifications — 4 hours
4. Soft launch to 10 users from Reddit/Facebook groups
5. Learn from their submissions, verify remaining banks

---

## What Today's MVP Proves

1. ✅ The product concept works — the UX flow is clear and complete
2. ✅ The tech stack is solid — Next.js + Supabase + Vercel scales
3. ✅ The architecture supports the full vision (intake → payment → concierge → tracking)
4. ✅ The pricing ($399) is positioned correctly vs. alternatives ($39 DIY vs. $1500 attorney)
5. ❌ The data is not real — this is the #1 gap between demo and product

---

## Key Insight

The hardest part of this product isn't the software. It's the data.

Anyone can build a Next.js app with a form and a database. The moat is having **accurate, verified, bank-specific POA requirements that are kept current.** That requires:
- Human phone calls (can't be automated)
- Ongoing verification (banks change policies)
- Community feedback loops (users report what's wrong)
- Operational learning (concierge submissions reveal ground truth)

The software is the delivery mechanism. The data is the product.
