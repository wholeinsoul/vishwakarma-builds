# 🏗️ Vishwakarma Builds

**One night. One problem. One working prototype.**

Vishwakarma is an AI builder agent that finds boring, real-world problems people actually complain about — and builds working solutions overnight. Named after the celestial architect of Hindu mythology who built the weapons of the gods and the cities of the heavens.

Every build goes through a rigorous 13-step pipeline with verdict-based gates. The framework that drives this pipeline lives in a [separate repository](https://github.com/wholeinsoul/build-pipeline) — the process is the product, the builds are the output.

---

## Builds

| Date | Project | Problem | Verdict |
|------|---------|---------|---------|
| Mar 12 | [**POA Toolkit**](projects/2026-03-12-poa-toolkit/) | Banks have unpublished POA acceptance rules. Families discover rejection when bills can't be paid. | ✅ BUILD |
| Mar 13 | [**PumpLine**](projects/2026-03-13-pumpline/) | Septic system fails, family can't use their bathroom. Finding a pumper in rural areas is a nightmare. | ✅ BUILD |
| Mar 14 | [**Reroute**](projects/2026-03-14-reroute/) | Airlines owe compensation for delays but make it impossible to collect. | ⏭️ SKIP |
| Mar 15 | [**Lineage AI**](projects/2026-03-15-lineage-ai/) | 7/10 at-risk family members never get genetic testing — outreach never reaches them. | ⏭️ SKIP |
| Mar 16 | [**CryptoLegacy**](projects/2026-03-16-cryptolegacy/) | $140B+ in crypto locked forever. Keys lost, holders died without sharing access. | ✅ BUILD |
| Mar 17 | [**On Special**](projects/2026-03-17-on-special/) | Bar owners spend St. Patrick's Day pouring drinks instead of posting specials to social media. | ✅ BUILD |
| Mar 18 | [**Coinstack**](projects/2026-03-18-coinstack/) | Gen Z knows finance concepts but can't execute behaviors. Knowledge-action gap. | ⏭️ SKIP |
| Mar 19 | [**Prepitch**](projects/2026-03-19-prepitch/) | Sales reps practice on live prospects instead of simulators. No flight simulator for sales. | ⏭️ SKIP |
| Mar 20 | [**Talktrack**](projects/2026-03-20-talktrack/) | New managers avoid difficult conversations. No safe practice environment. | ⏭️ SKIP |
| Mar 21 | [**Partypop**](projects/2026-03-21-partypop/) | Planning a kid's birthday party takes weeks. Pinterest gives ideas without execution. | ✅ BUILD |

**Scorecard:** 5 BUILDs, 5 SKIPs across 10 days. A SKIP is a correct decision — not building something that doesn't make business sense is a win.

---

## Pipeline

Every project follows a mandatory 13-step pipeline with verdict-based gates:

```
WHO + WHY → WORTH → WHAT → RISK → VERIFY → HOW → BUILD → CHECK → TEST → SHIP

 1 📥  SCRAPE              Archive idea data before it expires
 2 🎯  CEO REVIEW          WHO has this problem + WHY build? → DECISION: BUILD/SKIP/PIVOT
 3 📊  ANALYSIS + PITCH    WORTH building? Market sizing, scores → VERDICT: GO/NO-GO
 4 🧭  USER JOURNEY        WHAT are we building? PRFAQ, personas, flows
 5 🎲  RISKIEST ASSUMPTIONS What must be true? Rank by impact × uncertainty
 6 ✅  TEST PLAN           HOW do we verify? Acceptance criteria from user journey
 7 🏗️  ENG REVIEW          HOW are we building? Architecture, schema, data flow
 8 🔨  BUILD               Code it. Functional, not a mockup.
 9 🔍  CODE REVIEW         Find bugs that pass CI but blow up in prod → REVIEW VERDICT: PASS/FAIL
10 🧪  TEST + QA           Execute test plan against built product → QA VERDICT: PASS/FAIL
11 🚀  DEPLOY              Ship to Vercel / Railway
12 📤  PUSH                Commit everything to this repo
13 📋  REPORT              Full summary + morning delivery
```

**Key gates:**
- 🛑 **Kill gates** (bad idea, stop): CEO SKIP, Analysis NO-GO
- 🔄 **Retry gates** (bugs, fix them): Code Review FAIL, QA FAIL → fix and retry up to 3×

Each step checks TWO things: file exists with >100 bytes AND contains the required verdict string. No more half-assed files sneaking through.

## Project Structure

```
projects/YYYY-MM-DD-<slug>/
├── docs/
│   ├── 01_idea-data.md         # Raw idea data (Step 1)
│   ├── 02_ceo-review.md        # CEO review + BUILD/SKIP decision (Step 2)
│   ├── 03_analysis.md          # Critical analysis + scores (Step 3)
│   ├── 04_pitch-60s.md         # 60-second pitch (Step 3)
│   ├── 05_user-journey.md      # PRFAQ + user flows (Step 4)
│   ├── 06_assumptions.md       # Riskiest assumptions (Step 5)
│   ├── 07_test-plan.md         # Acceptance criteria (Step 6)
│   ├── 08_eng-review.md        # Architecture spec (Step 7)
│   ├── 09_architecture.html    # Visual diagrams — Mermaid.js (Step 7)
│   ├── 10_code-review.md       # Code review findings (Step 9)
│   ├── 11_test-results.md      # QA results (Step 10)
│   ├── 12_deploy.md            # Deployment + live URL (Step 11)
│   └── 13_report.md            # Final summary (Step 13)
└── src/                        # Working MVP source code
```

## What Makes a Good Problem

✅ People actively complain about it online
✅ Existing solutions are expensive, clunky, or nonexistent
✅ Can be solved with a web app or CLI tool
✅ Someone would pay $10–50/month for it
✅ Can build an MVP in one night

❌ Already solved well by identical products at the same price (competitor kill-switch)
❌ High IdeaBrowser scores with >3 funded competitors (big market ≠ good position)

---

## How It Works

This is a **human-in-the-loop AI build system**. [PB](https://github.com/wholeinsoul) designed the pipeline, orchestration flow, and quality gates — and stays in the loop to guide every build. Vishwakarma is the AI builder agent that executes the pipeline under PB's direction.

The pipeline itself — the 13-step process, the verdict-based gates, the CEO/Eng review frameworks, the retry logic, the sub-agent architecture — that's all PB's design. Vishwakarma builds what PB architects.

---

Built by **PB** (human architect) + **Vishwakarma** (AI builder) 🏗️
