# CEO Review — Bordermath (2026-03-22)
## Visa Route Planner for Long-Term Travelers

**Mode: SCOPE REDUCTION** — One-night MVP build assessment.
**Quality: 3x Ralph Loop**

---

# PASS 1: Full CEO Review

## Who Has This Problem?

**Persona:** Digital nomad or long-term traveler (25-45, remote worker, $3K-8K/month income) stitching together 6-12 months across multiple countries.

**JTBD:** "I need to know: can I stay in Portugal for 3 months, then Croatia for 2 months, without exceeding my Schengen 90/180 days? And when can I re-enter?"

**Current workarounds:**
1. Free Schengen calculators (visa-calculator.com, schengencalculator.org, SchengenTrack) — handles Schengen but nothing else
2. Spreadsheets with manual date math
3. Reddit/Facebook group questions ("Will I be denied entry if I...")
4. NomadList ($100 lifetime) — city comparison tool, not a visa route planner
5. Sherpa — B2B visa API for airlines/travel agents, not consumer-facing route planning
6. iVisa — visa application service, not a route planning/sequencing tool
7. VisaList.io — static lookup of visa requirements by passport

## Premise Challenge

**Is this the right problem?**

Yes — with a narrow interpretation. The Schengen 90/180 day calculation is genuinely confusing. The rolling window means you can't just count from your entry date. Travelers DO get it wrong. Overstay fines range from €500-€1,000+, entry bans, and deportation in severe cases.

**But here's the critical split:**

**Problem A: Schengen day tracking** — well-defined, calculable, buildable tonight. Multiple free tools exist but they're basic (just enter dates, get remaining days). None do ROUTE OPTIMIZATION ("given these 5 destinations, what order maximizes your legal stay?").

**Problem B: Multi-region visa rule engine** — requires a comprehensive database of visa rules for every country pair (passport × destination). Thailand, Indonesia, Colombia, etc. all have different rules, different visa types, different entry limits. Building this database is a multi-month project even for one region.

**The overnight MVP can only do Problem A.** A Schengen-specific route optimizer that takes your planned destinations + dates and tells you if you're legal, plus suggests reordering to maximize time. That's scoped and buildable.

## What's the Actual User Outcome?

**User wants:** "I'm planning Portugal → Croatia → Thailand → Indonesia → back to Spain. Am I going to get denied entry anywhere? How should I sequence this to stay legal?"

**Most direct path for MVP:** User enters passport nationality + list of countries + planned durations. Tool calculates Schengen days remaining at each step, flags violations, and suggests legal alternatives.

## What Happens If We Do Nothing?

Travelers keep using free Schengen calculators (which only check one trip at a time) and Reddit for everything else. Some get it right. Some overstay unknowingly. The problem persists at the current level of pain.

## Dream State Mapping

```
CURRENT STATE                    THIS PLAN (MVP)                   12-MONTH IDEAL
─────────────────────────────    ──────────────────────────────    ──────────────────────────
Free Schengen calculators        Schengen-focused route optimizer  Multi-region visa engine
(enter dates, get days left).    that sequences countries for      with live policy tracking,
No multi-stop optimization.      maximum legal stays. Visual       community-reported border
Reddit for non-Schengen.         timeline. Flag violations.        data, flight cost integration.
NomadList doesn't do visas.      Schengen + basic non-Schengen    $15-50/month SaaS.
Spreadsheet chaos.               lookup. Free + $15/month.
```

## Existing Solutions — EXACT Competitor Check

| Tool | What It Does | Price | Gap vs. Bordermath |
|------|-------------|-------|-------------------|
| **visa-calculator.com** | Schengen 90/180 calculator | Free | Single-trip only. No multi-stop optimization. No route sequencing. |
| **schengencalculator.org** | Schengen 90/180 calculator | Free | Same — single-trip, no route planning. |
| **SchengenTrack** | Schengen day calculator + "Full Reset Date" | Free | Better than basic calculators but still no multi-stop routing. |
| **Schengen Visa Tracker (app)** | iOS/Android Schengen tracker | Free trial + paid | Mobile app for tracking, not route planning. |
| **NomadList** | City comparison for digital nomads | $100 lifetime | Has visa info per country but NO route optimization, NO Schengen calculation, NO sequencing. Controversial (Reddit: "overpriced, erroneous info"). |
| **Sherpa** | B2B visa API for airlines | B2B pricing | Not consumer-facing. API for booking systems. |
| **iVisa** | Visa application processing service | Per-visa fees | Helps you APPLY for visas. Doesn't plan routes. |
| **VisaList.io** | Static visa requirement lookup | Free | Lookup tool. No planning, no calculations, no routing. |
| **Wanderlog** | General trip planner (itinerary) | Free/premium | Itinerary planning. No visa calculations whatsoever. |

**The gap is real:** Nobody does multi-stop visa-compliant ROUTE OPTIMIZATION. Free calculators check one trip at a time. NomadList lists visa info but doesn't calculate anything. None of them answer "given these 5 destinations, what order keeps me legal?"

**However:** This gap may exist because the general travel population doesn't need it. Only long-term multi-country travelers (digital nomads) do. And that's a niche within a niche.

## Competitive Window Analysis

**Keywords are massive but misleading:**
- "trip planner" 450K LOW — this is Google Trips / general vacation planning. NOT visa compliance.
- "travel planning" 110K LOW — same. Generic travel, not visa math.
- "digital nomad visa" 40.5K — MORE relevant but informational (people researching specific visas, not looking for a route planner tool).

The keyword that matters is something like "schengen calculator" or "schengen visa days remaining" — and those are served by free tools. IdeaBrowser's keyword data is for general travel planning, not visa route optimization.

**Execution difficulty 5/10** — higher than our typical 3/10 BUILDs. The core Schengen calculator logic is buildable tonight. The multi-region visa database is NOT.

**Audience score 6/10** — weakest ACP signal. Digital nomads are a passionate but small community.

## The Overnight Build Test

| Capability | Buildable Tonight? | Notes |
|-----------|-------------------|-------|
| Schengen 90/180 calculator | ✅ Yes | Date math with rolling window logic |
| Multi-stop Schengen route check | ✅ Yes | Sequence of countries + dates, calculate cumulative days |
| Route reorder suggestions | ⚠️ Partial | Basic "swap non-Schengen break here" logic. Full optimization is complex. |
| Non-Schengen visa rules | ❌ No (partial) | Would need a database of rules per country/passport pair. Could hardcode top 10 nomad destinations. |
| Live policy tracking | ❌ No | Requires ongoing data maintenance |
| Visual timeline | ✅ Yes | Chart showing stays vs. legal limits |
| Passport-based filtering | ✅ Yes | Select passport → show visa-free vs. visa-required |
| User auth + saved plans | ✅ Yes | Supabase |
| Stripe subscription | ✅ Yes | Standard |

**Buildable MVP:** A Schengen-focused multi-stop calculator with visual timeline and a basic lookup for top 10 nomad destinations (Thailand, Indonesia, Mexico, Colombia, etc.). Not a comprehensive visa database — a curated tool for the most common routes.

---

## Pass 1 Decision: LEANING BUILD

The gap is real (no multi-stop route optimizer exists), the Schengen calculator is buildable tonight, and the user persona (digital nomads) is passionate and reachable. But execution difficulty is higher than typical, keywords don't directly match, and the market is niche.

---

# PASS 2: Challenge My Own Review

## What's the strongest argument AGAINST building?

### 1. The market is genuinely tiny
How many people need a multi-stop visa route optimizer? Let's estimate:
- ~35 million digital nomads worldwide (various estimates)
- Of those, maybe 10-20% do multi-country trips crossing visa zones = 3.5-7M
- Of those, maybe 5-10% would use a paid tool (vs. free calculators + Reddit) = 175K-700K addressable
- At $15/month, 1% conversion = 1,750-7,000 subscribers = $315K-$1.26M ARR

That's the best case. More realistically:
- Year 1: 200-500 subscribers × $15 = $3K-$7.5K/month = $36K-$90K ARR

This is Pumpline territory — a niche grind, not a rocketship. Viable but not exciting.

### 2. Free Schengen calculators are "good enough" for most people
Four free Schengen calculators already exist (visa-calculator.com, schengencalculator.org, SchengenTrack, iOS app). Most travelers check one trip at a time and adjust manually. The "route optimization" feature is cool but may be solving a problem only the top 1% of nomads actually have (the ones doing 5+ country trips with Schengen interleaving).

### 3. Visa data accuracy is a LIABILITY
If someone uses our tool, plans a route we say is legal, and gets denied entry or fined — that's a real problem. Visa rules change constantly. Thailand changed entry limits without notice (as IdeaBrowser mentions). We'd need ironclad disclaimers + constantly updated data. Building a tool that people RELY ON for legal compliance, with data we scraped from government websites, is a liability landmine.

### 4. The keywords don't match the product
"Trip planner" 450K and "travel planning" 110K are general travel keywords. People searching these want Google Trips or Wanderlog — not visa compliance tools. The actual relevant keyword ("schengen calculator") is served by free tools. There's no untapped SEO goldmine here like Pumpline had.

### 5. NomadList is the natural home for this feature
NomadList already has visa info per country and a massive nomad user base. If Pieter Levels (NomadList founder, famous indie hacker) decided to add a route optimizer, he could do it with his existing data and distribution. We'd be building a feature that a well-known competitor could absorb.

## What did I miss in Pass 1?

I was too generous with the keywords. "Trip planner" 450K LOW sounds incredible but has zero relevance to visa route planning. The actual market keyword ("schengen calculator") is already dominated by free tools. The IdeaBrowser keyword data is misleading here — same pattern as Coinstack where "apps for budgeting" 165K didn't translate to actual demand for the specific product.

I also underweighted the liability risk. Visa compliance tools carry real responsibility. If our data is wrong and someone overstays, that's on us (morally if not legally). Free tools with disclaimers can get away with this. A $15/month paid tool raises expectations.

---

# PASS 3: Final Review — Would I Bet the Night?

## Updated Assessment

| Criterion | Bordermath | Pass? |
|-----------|-----------|-------|
| Feasibility ≥ 8 | 8 | ✅ |
| Execution ≤ 3/10 | **5/10** — higher than our BUILD threshold | ⚠️ |
| Keywords match buyer intent | ❌ "Trip planner" 450K is generic. Relevant keywords served by free tools. | ❌ |
| No dominant incumbent | ⚠️ 4 free Schengen calculators + NomadList could add this feature | ⚠️ |
| B2C self-serve | ✅ Digital nomads | ✅ |
| MVP differentiated | ⚠️ Multi-stop route check is differentiated, but it's a feature, not a product | ⚠️ |
| Value Equation ≥ 8 | 9/10 | ✅ |
| Audience score | ⚠️ **6/10** — weakest signal | ⚠️ |

**Failed/marginal on 4 of 8 criteria.** Our BUILDs pass 7-8 of 8.

## The Final Honest Take

This idea has a real gap (multi-stop route optimization doesn't exist), a passionate niche audience (digital nomads), and buildable core logic (Schengen math). On those merits alone, it's tempting.

But it fails our pattern test:
- **Keywords don't match** — the big numbers (450K "trip planner") are irrelevant. Relevant keywords are served by free tools.
- **Execution difficulty 5/10** — our BUILDs are all 3/10. This is almost 2x harder.
- **Audience 6/10** — weakest ACP score. Digital nomads are niche.
- **Free competitors serve 80% of the need.** The multi-stop optimization is the 20% extra — nice to have, not need to have for most travelers.
- **Liability risk.** Visa compliance tools carry real responsibility we can't disclaim away easily at $15/month.
- **NomadList could eat this.** Pieter Levels has the data, the users, and the brand.

Compare to yesterday's Partypop: emotional product, massive addressable market (every parent), no direct competitor doing planning + RSVP, execution 3/10, keywords match buyer intent. Bordermath is a harder sell on every dimension.

The strongest argument FOR building: the gap genuinely exists and nobody is filling it. But a gap can exist because the market doesn't want it filled badly enough. Free Schengen calculators + Reddit + spreadsheets are "good enough" for most nomads.

---

DECISION: SKIP

**The multi-stop visa route optimization gap is real but the market is too niche (digital nomads doing 5+ country Schengen-interleaved trips), keywords don't match buyer intent (450K "trip planner" is generic travel, not visa compliance), execution difficulty 5/10 exceeds our BUILD threshold of 3/10, four free Schengen calculators serve 80% of the need, and NomadList could absorb this as a feature. Visa data accuracy creates liability risk at $15/month. Fails 4 of 8 BUILD criteria.**
