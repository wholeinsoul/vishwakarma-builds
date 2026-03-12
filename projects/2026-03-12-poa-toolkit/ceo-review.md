# CEO Review — ConcretePOA (POA Bank Requirements Tracker)
## Retroactive gstack /plan-ceo-review
### 2026-03-12

**Mode: HOLD SCOPE** (this is a one-night MVP, not a cathedral)

---

## PRE-REVIEW: System Audit

No prior codebase — this is greenfield. The build is currently in progress via Claude Code. This review is retroactive, evaluating the idea *and* the build plan.

---

## Step 0: Nuclear Scope Challenge

### 0A. Premise Challenge

**1. Is this the right problem to solve?**

Mixed. The *pain* is real — caregivers get POA documents rejected by banks, causing frozen accounts during crises. But the *solution path* is tricky:

- The core value proposition ("we know what each bank requires") depends on data we don't have on day one.
- Building a database of bank-specific POA requirements is a *data collection* problem, not a *software* problem. The software is a thin layer on top of institutional knowledge that takes months to years to accumulate.
- **Alternative framing:** Instead of "we track bank requirements," what about "we connect caregivers with elder law paralegals who already know this stuff"? That's a marketplace play, not a SaaS play. Faster to validate, less cold-start risk.

**2. What is the actual user/business outcome?**

The outcome is: "My parent's POA is accepted by their bank without rejection." The plan builds a *tracker* that helps with the process, but doesn't guarantee the outcome. The most direct path to the outcome would be a *done-for-you service* (concierge model), not a self-service tool.

**Key insight: IdeaBrowser's own MVP strategy says "start manual with 20 families."** They know the software isn't the first step. But we're building the software first. That's backwards.

**3. What would happen if we did nothing?**

People would continue calling bank POA departments, getting rejected, going to forums, and eventually figuring it out. This has been the status quo for decades. The problem is painful but episodic — most families deal with it once or twice in a lifetime. That means:
- Low repeat usage (churn risk)
- Narrow window to acquire each customer (during crisis)
- Customer lifetime value may be low ($20-50/month × 2-3 months)

### 0B. Existing Code Leverage

Nothing exists — greenfield. But there IS existing *information*:
- Reddit threads documenting bank-specific POA requirements
- Elder law firm blog posts with tips
- CFPB complaints about bank POA handling
- State-by-state POA statute databases

The real "existing code" is the scattered knowledge online. Our value add is aggregation + verification.

### 0C. Dream State Mapping

```
CURRENT STATE                    THIS PLAN                      12-MONTH IDEAL
Caregivers call banks,     →    Self-service tracker      →    Platform that handles
get rejected, go to              with pre-populated             full POA lifecycle:
forums, figure it out             bank requirements,             creation, submission,
over days/weeks.                  submission tracking,           tracking, acceptance,
                                  community reports.             renewal, with verified
                                                                 bank integrations.
```

**The gap:** This plan gets us to a *useful reference tool* but NOT to a *problem-solving platform*. The 12-month ideal requires actual bank partnerships and verified data — things software alone can't provide.

### 0D. Mode-Specific Analysis (HOLD SCOPE)

**Complexity check:** The plan touches ~40+ files across a full Next.js + Supabase stack. For a one-night build, this is at the upper edge of feasible. The core value could be delivered with:
- A static site with bank requirement data (no auth needed)
- A simple form for community submissions
- That's it. 2 files instead of 40.

**Minimum viable version:**
1. ✅ Bank requirements database (static, pre-researched)
2. ✅ Document checklist per bank
3. ⚠️ Submission tracker (nice but not core — could be a spreadsheet)
4. ⚠️ Renewal alerts (nice but low-urgency feature for MVP)
5. ✅ Community rejection reports (this IS the data flywheel)

**What could be deferred:** Auth, submission tracker, renewal alerts. The core product is: "Here's what Bank X requires for POA, here's what people report getting rejected for."

### 0E. Temporal Interrogation

```
HOUR 1 (foundations):    What bank data do we pre-seed? How accurate is it?
                         → This is THE question. Bad seed data = worthless product.
                         → Researching each bank's actual requirements takes time.

HOUR 2-3 (core logic):  How does community data get verified?
                         → Unverified crowd-sourced data in a legal context = liability.
                         → Need at minimum: upvote/downvote + "last verified" dates.

HOUR 4-5 (integration): Supabase setup, auth flow, RLS policies.
                         → Standard but time-consuming. Worth it for MVP?

HOUR 6+ (polish):       Testing the app actually works end-to-end.
                         → Must leave time for this. Broken demo = worse than no demo.
```

---

## Verdict

### Decision: 🟡 BUILD (with caveats)

The build is already in progress, so we proceed. But I want to be honest about what we're building vs. what the market needs:

**What we're building:** A well-designed reference + tracking tool for POA bank requirements.

**What the market actually needs:** A concierge service backed by data. The software is necessary but not sufficient.

**What makes this MVP actually valuable despite the above:**
1. The bank requirements database itself — if well-researched — is useful content
2. Community rejection reports create a data flywheel
3. It validates whether people will actually use a digital tool for this
4. It's a credible demo for elder law firm partnerships

### Key Risks Flagged
1. **Data accuracy** — Pre-seeded bank data must be realistic. If it's obviously made up, it destroys trust in a trust-dependent product.
2. **Cold start** — No community data on day one means the community features are empty.
3. **Legal liability** — "Reformatting" POA docs = legal advice. Our tool should guide, not modify documents.
4. **Low repeat usage** — Most users need this once. LTV may not support SaaS pricing.

### What I'd Do Differently Next Time
1. Start with the CEO review BEFORE the build, not after
2. Consider a simpler build (static site + Airtable) for faster validation
3. Spend more time researching actual bank requirements for seed data accuracy
4. Talk to 3 elder law firms before writing code

---

## NOT in Scope
- Actual bank API integrations (don't exist)
- Document modification/reformatting (legal liability)
- Mobile app (web-first is correct)
- Payment processing (free MVP for validation)

## What Already Exists
- IdeaBrowser's research: scores, market sizing, competitive landscape → leveraged
- Reddit threads on POA issues → could be scraped for seed data (not done yet)
- LegalZoom/Nolo for POA creation → we're in the post-creation gap they ignore
- CFPB complaint database → potential data source for bank rejection patterns

## Dream State Delta
This plan gets us to **reference tool** (10% of 12-month ideal). Full platform with verified data, firm partnerships, and bank integrations is 12+ months away.
