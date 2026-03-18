# 🏗️ Vishwakarma Builds

**One night. One problem. One working prototype.**

Vishwakarma is an AI builder agent that finds boring, real-world problems people actually complain about — and builds working solutions overnight. Named after the celestial architect of Hindu mythology who built the weapons of the gods and the cities of the heavens.

Every build goes through a rigorous 10-step pipeline: scrape → CEO review → analysis → eng review → build → code review → test → deploy → push → report.

---

## Builds

| Date | Project | Problem | Verdict |
|------|---------|---------|---------|
| Mar 12 | [**POA Toolkit**](projects/2026-03-12-poa-toolkit/) | Banks have unpublished POA acceptance rules. Families discover rejection when bills can't be paid. | ✅ BUILD |
| Mar 13 | [**PumpLine**](projects/2026-03-13-pumpline/) | Septic system fails, family can't use their bathroom. Finding a pumper in rural areas is a nightmare. | ✅ BUILD |
| Mar 14 | [**Reroute**](projects/2026-03-14-reroute/) | Airlines owe compensation for delays but make it impossible to collect. | ⏭️ SKIP |
| Mar 15 | [**Lineage AI**](projects/2026-03-15-lineage-ai/) | 7/10 at-risk family members never get genetic testing — outreach never reaches them. | ⏭️ SKIP |
| Mar 15 | [**Uma**](projects/2026-03-15-uma/) | Elderly parents in India can't manage their own medications. One WhatsApp photo should be enough. | ✅ BUILD |
| Mar 16 | [**CryptoLegacy**](projects/2026-03-16-cryptolegacy/) | $140B+ in crypto locked forever. Keys lost, holders died without sharing access. | ✅ BUILD |
| Mar 17 | [**On Special**](projects/2026-03-17-on-special/) | Bar owners spend St. Patrick's Day pouring drinks instead of posting specials to social media. | ✅ BUILD |

---

## Pipeline

Every project follows a mandatory 10-step pipeline:

```
 1 📥  SCRAPE         Archive idea data before it expires
 2 🎯  CEO REVIEW     Challenge the problem — BUILD / SKIP / PIVOT
 3 📊  ANALYSIS       Critical analysis + 60-second pitch
 4 🏗️  ENG REVIEW     Architecture, data flow, test plan
 5 🔨  BUILD          Working MVP — functional, not a mockup
 6 🔍  CODE REVIEW    Find bugs that pass CI but blow up in prod
 7 🧪  TEST           Run tests + QA pages in browser
 8 🚀  DEPLOY         Ship to Vercel / Railway
 9 📤  PUSH           Commit everything to this repo
10 📋  REPORT         Full summary + morning delivery
```

Each step has a hard file-based gate — the pipeline stops if any step fails.

## Project Structure

```
projects/YYYY-MM-DD-<slug>/
├── docs/                           # All documentation (numbered for reading order)
│   ├── 01_idea-data.md             # Raw idea data
│   ├── 02_ceo-review.md            # CEO-level challenge + decision
│   ├── 03_analysis.md              # Critical analysis + scores
│   ├── 04_pitch-60s.md             # 60-second investor pitch
│   ├── 05_eng-review.md            # Architecture + technical spec
│   ├── 06_architecture.html        # Visual diagrams (Mermaid.js)
│   ├── 07_test-plan.md             # Test plan matrix
│   ├── 08_code-review.md           # Code review findings
│   ├── 09_test-results.md          # QA test results
│   ├── 10_deploy.md                # Deployment info + live URL
│   └── 11_report.md                # Final summary
└── src/                            # Working MVP source code
```

## What Makes a Good Problem

✅ People actively complain about it online  
✅ Existing solutions are expensive, clunky, or nonexistent  
✅ Can be solved with a web app or CLI tool  
✅ Someone would pay $10–50/month for it  
✅ Can build an MVP in one night  

---

Built by [Vishwakarma](https://github.com/wholeinsoul) 🏗️
