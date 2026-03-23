# DAILY-PROCESS.md — Vishwakarma Build Pipeline

**This is the mandatory process for every build. No skipping steps. No exceptions.**
**Referenced by: SOUL.md, AGENTS.md, daily cron job, and every isolated build session.**
**Orchestrated by: `scripts/daily-build.sh` (bash script with verdict-based gates)**

---

## Source

Ideas come from one of:
1. **IdeaBrowser** (https://www.ideabrowser.com/idea-of-the-day) — free Idea of the Day, expires midnight UTC (5 PM PDT)
2. **PB-provided idea** — a problem description, URL, or brief passed directly
3. **External link** — any URL pointing to a problem/opportunity worth evaluating

Default source is IdeaBrowser unless PB provides an alternative.

## Core Principle: Difficulty = Moat

**Never skip an idea because it's hard to build.** Opportunity identification, business validation, and implementation feasibility are independent evaluations — not one gate.

- Hard to build = hard to copy = competitive moat
- Some nights produce a shipped MVP → small, fast revenue potential
- Some nights produce a validated opportunity with a serious build plan → potentially much larger business
- **Both are valuable outputs of this process**

The nightly cycle is a **research and validation engine**, not just a shipping pipeline. A validated opportunity with a phased build plan is a legitimate, high-value output — not a failure.

**NEVER use build complexity as a reason to SKIP during CEO Review.** Complexity belongs in Eng Review (Step 7), where it informs the plan, not the go/no-go decision.

---

## Quality Rule: Ralph Loop (3x) — Targeted

**3 passes on HIGH-JUDGMENT steps only:**
1. **Pass 1:** Do the work, produce the output
2. **Pass 2:** Challenge it — what's missing, wrong, or lazy? Fix it.
3. **Pass 3:** Final review — would you bet the whole night on this being right?

**Apply 3x Ralph Loop to:**
- 🔴 **Step 2: CEO Review** — bad call here wastes the whole night or skips a winner
- 🔴 **Step 4: User Journey** — wrong product definition = building the wrong thing
- 🔴 **Step 7: Eng Review** — architecture mistakes compound into the build

**All other steps:** do it well once, move on. They're execution, not judgment. Code Review (Step 9) and QA (Step 10) have their own fix-and-retry loops (up to 3×) which serve the same quality purpose.

---

## Pipeline (13 Steps — All Mandatory)

Each step is a **separate sub-agent** with clean context.
Each step checks TWO things before proceeding:
1. **File gate:** Previous step's output file exists with >100 bytes
2. **Verdict gate:** File contains the required explicit verdict string (DECISION, VERDICT, PASS/FAIL, etc.)

If either gate fails → pipeline STOPS and reports the failure.
A half-assed file that's technically >100 bytes but missing the verdict will NOT pass.

**Framework:** WHO + WHY → WORTH → WHAT → RISK → VERIFY → HOW → BUILD → CHECK → TEST → SHIP

---

### Step 1: SCRAPE 📥
**Priority: URGENT — data expires at midnight UTC (5 PM PDT)**
**Role: Research Analyst**

- Open IdeaBrowser in vishwakarma browser profile
- Archive ALL data to `projects/YYYY-MM-DD-<slug>/docs/01_idea-data.md`
- Capture EVERYTHING:
  - Problem description + solution
  - MVP strategy + revenue model + growth strategy
  - Scores (Opportunity, Problem, Feasibility, Why Now)
  - Business fit (revenue potential, execution difficulty, GTM)
  - Keywords with volumes + growth rates
  - Community signals (Reddit, Facebook, YouTube)
  - Value ladder (lead magnet → frontend → core → backend)
  - Why Now details (market timing, tech enablers, regulatory catalysts)
  - Execution plan (phases, pricing, success metrics)
  - Competitor landscape
  - All citations/sources
- Close browser tabs when done

✅ **Gate:** `docs/01_idea-data.md` exists with >100 bytes

---

### Step 2: CEO REVIEW 🎯 — WHO has this problem + WHY are we building this?
**Role: CEO / Founder — Rethink the problem. Find the 10-star product.**
**Framework:** `skills/gstack/plan-ceo-review/SKILL.md`
**Amazon LP:** Customer Obsession, Are Right A Lot, Ownership

- **Step 0: WHO (define first, before anything else)**
  - Who specifically has this problem? Name the persona(s) — age, role, context, constraints.
  - What is their Job To Be Done (JTBD)? Not features — the outcome they're hiring a product for.
  - How are they solving it today? (Workarounds, competitors, or suffering in silence?)
  - How often do they hit this problem? Daily? Weekly? Once a year?
  - How painful is it? (1-10, with evidence — real complaints, not assumptions)
- **Step 1: Nuclear Scope Challenge**
  - Is this the right problem? Could a different framing yield a simpler/more impactful solution?
  - What's the actual user outcome? Is IdeaBrowser's plan the most direct path?
  - What would happen if we did nothing?
  - Dream State Mapping: Current → This Plan → 12-month ideal
  - 10x check: What's 10x more ambitious for 2x effort?
- **Customer Obsession:** Who is the customer? Name them specifically. What is their pain? Quote real complaints, not assumptions.
- **Are Right A Lot:** What's the strongest argument AGAINST building this? Seek to disconfirm, not confirm.
- **Premise Challenge:** Who actually has this problem? How often? How painful (1-10)?
- **Existing Solutions:** What exists today? Why isn't it good enough?
- **Revenue Reality Check:** Would someone actually pay $10-50/month for this?
- **Decision: BUILD / SKIP / PIVOT**
  - If SKIP: explain why, update `research/problems-log.md`, pipeline STOPS
  - If PIVOT: describe the pivot and continue

✅ **Gate:** `docs/02_ceo-review.md` exists with >100 bytes AND contains `DECISION: BUILD`, `DECISION: SKIP`, or `DECISION: PIVOT`
🛑 **Kill gate:** `DECISION: SKIP` → pipeline stops, research committed to GitHub

**CRITICAL RULES:**
- Do NOT factor in how long it has been since the last BUILD. Whether we built yesterday or haven't built in 30 days is IRRELEVANT. A SKIP is the correct decision when the idea doesn't pass the bar.
- **COMPETITOR KILL-SWITCH:** If an identical or near-identical product already exists at a similar price point with similar features AND there is no clear differentiation gap we can exploit, the idea is an AUTOMATIC SKIP.
- High IdeaBrowser scores mean big MARKET, not good POSITION for us. Score ≥8 with >3 funded competitors in the exact feature space = almost certainly SKIP.

---

### Step 3: ANALYSIS + PITCH 📊 — WORTH building?
**Role: Chief Strategy Officer — Market sizing, competitive positioning, go/no-go.**
**Framework:** `skills/business-idea-research/SKILL.md`
**Amazon LP:** Think Big, Are Right A Lot

**Analysis (`docs/03_analysis.md`):**
- What works (with evidence from IdeaBrowser data)
- What doesn't work / pitfalls (be brutally honest)
- Market sizing: TAM / SAM / SOM
- Competitive landscape matrix
- Business model evaluation
- Risks & moats
- GTM strategy assessment
- Scores (1-10): Market Size, Timing, Feasibility, Revenue Potential, MVP Fit
- Overall verdict with reasoning
- **Think Big:** Is this a band-aid or a real solution? What's the ambitious version?
- **Are Right A Lot:** What data supports this? What data contradicts it?

**60-Second Pitch (`docs/04_pitch-60s.md`):**
- Hook (5 sec) — one attention-grabbing line
- Problem (10 sec) — specific pain with numbers
- Solution (15 sec) — what we built and how it's different
- Traction (10 sec) — market signals, comparable companies
- Market (5 sec) — size + growth
- Team (5 sec) — why we can build this
- Ask (10 sec) — investment/next step + first revenue target

✅ **Gate:** `docs/03_analysis.md` AND `docs/04_pitch-60s.md` exist with >100 bytes each. Analysis must contain `VERDICT: GO` or `VERDICT: NO-GO`
🛑 **Kill gate:** `VERDICT: NO-GO` → pipeline stops, research committed to GitHub

---

### Step 4: USER JOURNEY 🧭 — WHAT are we building?
**Role: Chief Product Officer — Defines WHAT we build. Highest product authority.**
**Amazon LP:** Customer Obsession, Working Backwards (PRFAQ), Invent & Simplify

**PRFAQ (`docs/05_user-journey.md` — first section):**
```
PRESS RELEASE (1 paragraph)
- What is it? (one sentence)
- Who is it for?
- What problem does it solve?
- How does the customer benefit?
- Quote from a (hypothetical) customer

FAQ — Customer Questions
1. How does it work?
2. How much does it cost?
3. What if [common objection]?
4. How is this different from [competitor/alternative]?

FAQ — Internal/Technical Questions
1. How will we measure success?
2. What are the biggest risks?
3. What's the simplest MVP?
4. What does v2 look like?
```

**Personas:**
- Who are the primary users? Name them, give them context.
- Secondary users / stakeholders?
- Anti-personas — who is this NOT for?

**User Flows (step-by-step):**
- Entry point: how does the user first encounter the product?
- Onboarding: first-time experience
- Core flow: the main thing they came to do (happy path)
- Secondary flows: other key actions
- Error paths: what happens when things go wrong?
- Edge cases: unusual but valid scenarios

**For each step in each flow:**
- What the user sees
- What the user does
- What the system does
- Emotional state (especially for trust-sensitive products)

**Invent & Simplify:** What's the simplest version that solves the problem? Can anything be removed?

✅ **Gate:** `docs/05_user-journey.md` exists with >100 bytes AND ends with `JOURNEY COMPLETE`

---

### Step 5: RISKIEST ASSUMPTIONS 🎲 — What must be true for this to work?
**Role: Chief Risk Officer — Find what could kill the product before we build it.**
**Amazon LP:** Are Right A Lot (seek to disconfirm), Dive Deep

For every product, some assumptions are load-bearing — if they're wrong, the product fails regardless of how well it's built. Identify and plan to validate them BEFORE investing in architecture and code.

**Assumption Inventory (`docs/06_assumptions.md`):**

1. **List every assumption** the product depends on — technical, market, user behavior, regulatory, economic
2. **Classify each:**
   - **Impact if wrong:** 🔴 Kills product | 🟡 Degrades it | 🟢 Minor inconvenience
   - **Certainty:** ✅ Proven (data/evidence) | ⚠️ Believed (strong signal) | ❌ Hope (untested)
3. **Rank by risk:** 🔴+❌ = existential risk, must validate first
4. **Top 3-5 riskiest: write a validation plan for each:**
   - What's the cheapest, fastest experiment to test this?
   - Can it be tested BEFORE building? (prototype, survey, manual test, desk research)
   - Or only tested BY building? (mark for inclusion in test plan)
   - What result would make us STOP or PIVOT?
   - Timeline and cost to validate

**Example format:**
```
ASSUMPTION: AI can read Indian handwritten prescriptions at >90% accuracy
IMPACT IF WRONG: 🔴 Kills product
CERTAINTY: ❌ Hope — academic benchmarks show 82% on curated data, real-world unknown
VALIDATION: Test 50 real prescriptions from different doctors through GPT-4o + PaddleOCR pipeline
KILL CRITERIA: If accuracy <80% after drug DB validation + user confirmation, need pharmacist-in-the-loop for ALL prescriptions (changes cost structure)
TIMELINE: 2 days
COST: ~$5 in API calls
```

**For nightly MVPs:** Lightweight — 3-5 assumptions, quick validation notes. Don't overengineer.
**For production projects:** Thorough — validate existential risks before proceeding. May pause pipeline to run experiments.

✅ **Gate:** `docs/06_assumptions.md` exists with >100 bytes AND ends with `ASSUMPTIONS LOGGED`

---

### Step 6: TEST PLAN ✅ — HOW do we verify we built it right?
**Role: Principal QA Architect — Designs the test strategy, defines what 'done' means.**
**Amazon LP:** Insist on Highest Standards, Dive Deep

Derived from **user journey** (Step 4) and **riskiest assumptions** (Step 5), NOT architecture. Tests verify user outcomes and validate assumptions.

**Acceptance Tests (`docs/07_test-plan.md`):**
- For each user flow from Step 4:
  - Happy path → expected outcome
  - Error path → expected error handling
  - Edge cases → expected behavior
- **Test Matrix** — table format: User Flow × Scenario × Expected Result × Priority (P0/P1/P2)
- **Performance Targets** — response times, load thresholds from user's perspective
- **Security Tests** — from user's perspective (what shouldn't be possible)
- **Highest Standards:** "Would I be comfortable if this was the only thing a customer saw?"
- **Dive Deep:** edge cases, failure modes, what happens under load

**Note:** Eng Review (Step 7) may add implementation-specific tests (unit, integration) but acceptance criteria are locked here.

✅ **Gate:** `docs/07_test-plan.md` exists with >100 bytes AND ends with `TEST PLAN COMPLETE`

---

### Step 7: ENG REVIEW 🏗️ — HOW are we building it?
**Role: Chief Architect — The most consequential technical decision. Architecture only.**
**Framework:** `skills/gstack/plan-eng-review/SKILL.md`
**Amazon LP:** Invent & Simplify, Frugality, Think Big

**Architecture (`docs/08_eng-review.md`):**
- Tech stack decision with rationale (why X over Y)
- ASCII architecture diagram
- Database schema design (tables, relationships, indexes)
- API endpoints / pages mapped
- Data flow with shadow paths (nil, empty, error states)
- Failure modes mapped (what breaks, how we recover)
- Edge cases identified (with specific scenarios)
- Security considerations (auth, RLS, input validation, XSS, CSRF)
- Deployment plan (where, how, CI/CD)
- **Invent & Simplify:** Simplest version that solves it? Every abstraction must earn its place.
- **Frugality:** Do more with less. Fewer dependencies, smaller bundles, lower costs.
- **Think Big:** Will this approach scale to 10x? (Then ship the pragmatic version.)
- Implementation-specific tests (unit, integration) to supplement Step 6's acceptance tests

**Visual Architecture Diagram (`docs/09_architecture.html`):**
- Self-contained HTML with Mermaid.js (CDN)
- System architecture diagram (frontend → API → DB)
- Data flow diagram
- Component hierarchy
- Database ERD
- Professional look — openable in any browser

✅ **Gate:** `docs/08_eng-review.md` AND `docs/09_architecture.html` exist with >100 bytes each. Eng review must end with `ARCHITECTURE APPROVED`

---

### Step 8: BUILD 🔨
**Role: Principal Engineer — Most senior IC who still writes code.**
**Amazon LP:** Bias for Action, Frugality, Dive Deep

- Create working MVP in `projects/YYYY-MM-DD-<slug>/src/`
- Follow the architecture from `08_eng-review.md` exactly
- Must be **FUNCTIONAL** — not a mockup, not a wireframe
- Real authentication (Supabase Auth or equivalent)
- Real data persistence (Supabase DB or equivalent)
- Pre-seeded data where applicable
- **Bias for Action:** Reversible decisions → decide fast. Irreversible → slow down, get data.
- **Frugality:** Ship the 80% solution. Don't gold-plate.
- **Dive Deep:** "It works on my machine" is not a valid test.
- README.md with:
  - What it does
  - How to install dependencies
  - How to configure env vars
  - How to run locally
  - How to deploy
- `npm run build` MUST succeed with zero errors

✅ **Gate:** `src/` has ≥10 files AND `npm run build` succeeds

---

### Step 9: CODE REVIEW 🔍
**Role: Distinguished Engineer — The one who catches what everyone else missed.**
**Framework:** `skills/gstack/review/SKILL.md`
**Amazon LP:** Full 7-point review checklist from `skills/amazon-lp/SKILL.md`

Write `docs/10_code-review.md` with findings. For each finding:
- **Severity:** CRITICAL / WARNING / INFO
- **File:** exact path
- **Line:** line number(s)
- **Issue:** what's wrong
- **Fix:** how to fix it

**Standard checks:**
1. DRY violations (duplicated logic)
2. Error handling gaps (unhandled exceptions, missing try/catch)
3. Security issues (hardcoded secrets, SQL injection, XSS, missing auth checks)
4. Missing edge cases (empty arrays, null values, network failures)
5. Dead code
6. Performance issues (N+1 queries, unbounded loops, missing pagination)
7. Type safety issues
8. Missing input validation

**Amazon LP Review Checklist:**
1. **Customer Impact** — Does this change make the customer's life better? How?
2. **Simplicity** — Is this the simplest solution? Can anything be removed?
3. **Ownership** — Does the author own the full lifecycle? Tests? Error handling? Monitoring?
4. **Dive Deep** — Are edge cases handled? What happens when it fails?
5. **Highest Standards** — Would you ship this to your most important customer today?
6. **Bias for Action** — Is this blocked by a perfect-is-the-enemy-of-good decision? Ship it.
7. **Earn Trust** — Is the code honest about its limitations? Are errors surfaced, not swallowed?

**CRITICAL issues must be fixed directly in the code.** Not just noted — actually fixed.

✅ **Gate:** `docs/10_code-review.md` exists with >100 bytes AND contains `REVIEW VERDICT: PASS` or `REVIEW VERDICT: FAIL`. Must also contain `REVIEW SUMMARY: X critical, Y warnings, Z info`
🔄 **Retry gate:** `REVIEW VERDICT: FAIL` → fix issues and re-review (up to 3 attempts). Only escalates to human after all retries exhausted.

---

### Step 10: TEST + QA 🧪 — Did we build what we intended?
**Role: Principal QA Engineer — Hands-on. Runs every test. Breaks the app.**

- Run all tests: `npm test`
- Run the dev server: `npm run dev`
- **Execute acceptance tests from `docs/07_test-plan.md`:**
  - Verify each user flow from Step 4 works as specified
  - Validate riskiest assumptions from Step 5 with real data
  - Check happy paths, error paths, edge cases
  - Compare actual behavior against expected outcomes
- Verify pages load:
  - Landing page (/)
  - Core feature pages
  - Auth flow (/auth, /login, /signup)
  - Dashboard (if applicable)
- Document results in `docs/11_test-results.md`:
  - Which acceptance tests passed / failed
  - Which unit/integration tests passed / failed
  - Which pages render correctly
  - Screenshots or descriptions of any visual issues
  - Any runtime errors in console
  - **Gaps:** anything in the user journey (Step 4) that doesn't work as specified

**If using gstack /browse:** Launch browser, click through the app, take screenshots, catch breakage. Full QA pass.

✅ **Gate:** `docs/11_test-results.md` exists with >100 bytes AND contains `QA VERDICT: PASS`, `QA VERDICT: PASS WITH ISSUES`, or `QA VERDICT: FAIL`
🔄 **Retry gate:** `QA VERDICT: FAIL` → fix bugs and retest (up to 3 attempts). Only escalates to human after all retries exhausted.

---

### Step 11: DEPLOY 🚀
**Role: Principal SRE — Owns production reliability.**

- Deploy to Vercel (or equivalent free hosting)
- Verify the live URL works
- Run the database schema + seed data on Supabase (if not already done)
- Document the live URL in `docs/12_deploy.md`

✅ **Gate:** `docs/12_deploy.md` exists with >100 bytes AND contains `DEPLOY STATUS: LIVE` or `DEPLOY STATUS: FAILED`

---

### Step 12: PUSH TO GITHUB 📤
**Role: Principal SRE**
**Framework:** `skills/gstack/ship/SKILL.md`

- Repo: `wholeinsoul/vishwakarma-builds`
- `rsync` the entire project directory (exclude node_modules, .next, .git)
- `git add -A && git commit && git push`
- Include ALL files: docs/ (all numbered docs), src/ (all source code)

✅ **Gate:** Commit exists on GitHub

---

### Step 13: REPORT 📋
**Role: VP Engineering — Owns the full picture. Reports to the board.**
**Amazon LP:** Earn Trust, Ownership

**Write `docs/13_report.md`** — full summary covering:
- Problem discovered
- CEO review verdict + reasoning
- Analysis highlights (scores, key risks)
- User journey summary (key personas, core flows)
- What was built (tech stack, features, architecture)
- Code review findings (X critical, X warnings, X info)
- Test results (X acceptance passed/failed, X unit passed/failed)
- Live URL
- GitHub link
- **Earn Trust:** Honest assessment — is this viable? What's broken? What would you do differently?
- **Ownership:** What would you do next? What's the path to revenue?

**Update tracking files:**
- `research/problems-log.md` — add this problem with outcome
- `memory/YYYY-MM-DD.md` — today's work summary

**Update repo README:**
- Add today's build to the Builds table in `vishwakarma-builds/README.md`
- Format: `| Mon DD | [**Name**](projects/YYYY-MM-DD-slug/) | One-line problem | ✅ BUILD or ⏭️ SKIP |`
- Do NOT include private/personal projects (e.g. Uma) — only public builds
- Commit and push the README update

**Deliver morning report to PB** in Telegram topic 4111:
```
🏗️ Vishwakarma Daily Build — YYYY-MM-DD

🔍 Problem: [one line]
🎯 CEO Verdict: BUILD/SKIP/PIVOT + one line why
📊 Scores: Market X/10 | Timing X/10 | Feasibility X/10 | Revenue X/10
🧭 User Journey: [key persona + core flow in one line]
🎲 Top Risk: [#1 riskiest assumption + validation status]
🔨 Built: [what + tech stack]
🧪 Tests: X acceptance passed, X failed | X unit passed, X failed
🔍 Code Review: X critical, X warnings, X info
🚀 Live: [URL]
📤 GitHub: [link]
💡 Honest Take: [2-3 sentences]
```

✅ **Gate:** `docs/13_report.md` exists AND morning report delivered

---

## Project Directory Structure

```
projects/YYYY-MM-DD-<slug>/
├── docs/                           # All documentation (numbered for reading order)
│   ├── 01_idea-data.md             # Raw data (Step 1)
│   ├── 02_ceo-review.md            # WHO+WHY build? (Step 2)
│   ├── 03_analysis.md              # WORTH building? (Step 3)
│   ├── 04_pitch-60s.md             # 60-sec pitch (Step 3)
│   ├── 05_user-journey.md          # WHAT are we building? PRFAQ + flows (Step 4)
│   ├── 06_assumptions.md           # RISK — riskiest assumptions + validation plans (Step 5)
│   ├── 07_test-plan.md             # VERIFY — acceptance criteria from user journey (Step 6)
│   ├── 08_eng-review.md            # HOW to build? Architecture (Step 7)
│   ├── 09_architecture.html        # Visual diagrams — Mermaid.js (Step 7)
│   ├── 10_code-review.md           # Code review findings (Step 9)
│   ├── 11_test-results.md          # QA test results (Step 10)
│   ├── 12_deploy.md                # Deployment info + live URL (Step 11)
│   └── 13_report.md               # Final summary (Step 13)
└── src/                            # Working MVP code (Step 8)
    ├── README.md                   # Setup instructions
    ├── __tests__/                  # Actual test files
    └── ...
```

## Orchestration

- **Cron job** fires at 10 AM PDT daily
- **`scripts/daily-build.sh`** runs the pipeline:
  - Each step = separate `openclaw agent` sub-agent with clean context
  - **Verdict-based gates** between steps (file must exist + >100 bytes + explicit verdict string)
  - Pipeline stops on gate failure OR kill verdict (SKIP, NO-GO, FAIL)
  - 2 kill gates: CEO SKIP, Analysis NO-GO (idea isn't worth building)
  - 2 retry gates: Code Review FAIL, QA FAIL (fix and retry up to 3×, then escalate)
- **Repo:** https://github.com/wholeinsoul/build-pipeline

## Production Mode (ECC-Enhanced)

**When to use:** Production-grade projects (e.g., UMA) or any project PB flags as production.
**NOT for:** Nightly MVP builds (speed > rigor).

Production mode adds ECC commands at specific points in the pipeline. The base pipeline stays the same — these layer on top.

### ECC Commands (7 total)

| Command | When | What it does |
|---------|------|--------------|
| `/plan` | **After Step 7 (Eng Review), before Step 8 (Build)** | Structured implementation plan: task breakdown, build order, dependencies, complexity estimates. Builder follows this instead of improvising from architecture doc. |
| `/tdd` | **During Step 8 (Build)** | Test-first development. Scaffold interfaces → write tests → implement. Enforces 80%+ coverage. |
| `/code-review` | **Step 9 (Code Review) — replaces our current review** | Deeper review with built-in security scanning. Covers auth bypass, injection, XSS, CSRF beyond what our manual checklist catches. |
| `/verify` | **After Step 9 (Code Review)** | Verification loop — runs checks, catches regressions, validates fixes from code review actually work. |
| `/e2e` | **Step 10 (Test + QA) — supplements manual QA** | Playwright E2E tests with screenshots, videos, traces. Automates the "click through the app" work. |
| `/checkpoint` | **Mid-build (Step 8) as needed** | Save build state during long implementations. Resume without losing context. Use when build exceeds ~2 hours. |
| `/learn-eval` | **After Step 13 (Report)** | Extract reusable patterns from the session, self-evaluate quality, save to skills. Compounds — project #3 benefits from project #1's learnings. |

### Modified Pipeline Flow (Production)

```
Steps 1-7: Same as base pipeline
    ↓
Step 7.5: /plan → Implementation plan (docs/08b_impl-plan.md)
    ↓
Step 8: /tdd → Build with test-first discipline, /checkpoint as needed
    ↓
Step 9: /code-review → Enhanced review with security scanning
    ↓
Step 9.5: /verify → Verification loop
    ↓
Step 10: /e2e → Automated E2E tests + manual QA
    ↓
Steps 11-13: Same as base pipeline
    ↓
Step 13.5: /learn-eval → Extract and save patterns
```

### Activating Production Mode

PB will flag projects as production. When flagged:
- Sub-agents running Claude Code invoke the ECC commands above
- Implementation plan becomes a hard gate (must exist before build starts)
- Test coverage target increases to 80%+ (vs "tests pass" for MVPs)
- E2E tests are mandatory (vs optional manual QA for MVPs)
- `/learn-eval` runs post-build to capture patterns

---

## Amazon Leadership Principles — Per-Step Reference

| Step | Key LPs |
|------|---------|
| 2. CEO Review | Customer Obsession, Are Right A Lot, Ownership |
| 3. Analysis | Think Big, Are Right A Lot |
| 4. User Journey | Customer Obsession, Working Backwards (PRFAQ), Invent & Simplify |
| 5. Riskiest Assumptions | Are Right A Lot (seek to disconfirm), Dive Deep |
| 6. Test Plan | Insist on Highest Standards, Dive Deep |
| 7. Eng Review | Invent & Simplify, Frugality, Think Big |
| 8. Build | Bias for Action, Frugality, Dive Deep |
| 9. Code Review | Full 7-point LP review checklist |
| 13. Report | Earn Trust, Ownership |

Full LP reference: `skills/amazon-lp/SKILL.md`

---

## Tools & Accounts

- **Credentials:** See `credentials.md` (local only, never committed)
- **GitHub:** wholeinsoul (gh CLI authenticated)
- **Repos:** `wholeinsoul/vishwakarma-builds` (output), `wholeinsoul/build-pipeline` (framework)
- **Search priority:** Browser → SearXNG → Brave API (last resort)
- **Skills:** gstack (plan-ceo-review, plan-eng-review, review, ship, browse, retro), business-idea-research, amazon-lp
