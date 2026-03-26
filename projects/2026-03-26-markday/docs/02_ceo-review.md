# CEO Review — Markday (2026-03-26)
## Learn-to-Draw App with AI Feedback on Every Sketch

**Mode: SCOPE REDUCTION assessment | Quality: 3x Ralph Loop**

---

# PASS 1: Full CEO Review

## Who Has This Problem?

**Persona:** 30-45 year old hobbyist parent who watches drawing tutorials on YouTube but never sticks with practice. Has 20 minutes after the kids are in bed. Wants to get better at drawing but is intimidated by full courses and has no feedback mechanism.

**JTBD:** "I want to learn to draw without committing to a 40-hour course. Something I can do in 10 minutes that actually tells me what I'm doing wrong."

**Current workarounds:**
- YouTube drawing tutorials (free, massive library, no feedback)
- Skillshare / Udemy courses ($15-30/month, long-form, no AI feedback)
- r/learntoart Reddit (free community feedback, slow and inconsistent)
- ChatGPT with photo upload (free, instant AI feedback, already being used — Reddit threads confirm this)
- Coartist app (Google Play — AI art feedback, already exists)
- Drawalong / Sketchar (AR-based drawing assistance apps)

## Premise Challenge

**Is this the right problem?** The insight is solid — people want bite-sized art practice with feedback. But three issues:

**1. ChatGPT already does this.** r/learntodraw users are ALREADY uploading sketches to ChatGPT and getting detailed proportion/shading feedback for free. The reddit thread from Jan 2025 shows this is a known workaround. Our AI feedback feature is competing with a free tool 300M+ people already have.

**2. Coartist already exists.** "Get instant AI art feedback & critiques to improve your skills faster" — that's Coartist on Google Play. It does the EXACT core feature (AI sketch critique) that Markday proposes.

**3. The "Duolingo for X" pattern has a graveyard.** Duolingo for math, Duolingo for music, Duolingo for cooking, Duolingo for drawing — the app stores are littered with streak-based learning apps that launched, failed to retain, and died. The Duolingo model works for languages because of spaced repetition on verifiable facts. Drawing is fundamentally subjective — AI "correctness" scoring for art is philosophically questionable and technically unreliable.

**4. IdeaBrowser categorizes this as "mobile_app."** Our overnight builds are web apps. Daily habit apps need push notifications, offline capability, and camera integration for sketch upload — all mobile-native features that a web MVP can't match. A web-only "daily drawing app" would feel like a demo, not a product.

## Existing Solutions — COMPETITOR KILL-SWITCH Check

| Tool | What | Price | Gap? |
|------|------|-------|------|
| **Coartist** | AI art feedback app (Google Play) | Free/paid | Does the EXACT AI feedback feature. Already in app stores. |
| **ChatGPT (GPT-4o)** | Upload sketch → get AI feedback | $0-20/mo | Free, already being used by the target audience, no app needed |
| **Skillshare** | Drawing courses (video-based) | $14/mo | No AI feedback, but massive course library and brand. 12M+ users. |
| **Udemy** | Drawing courses | One-time $10-50 | Huge library, no AI feedback, established. |
| **Proko** | Figure drawing education | Free-$25/mo | Niche but established in figure drawing education. |
| **Drawabox** | Free structured drawing course | Free | Popular structured drawing curriculum. 50+ lessons. Free. |
| **QuickPoses** | Timed gesture drawing practice | Free | Daily practice tool for gesture drawing. |

**COMPETITOR KILL-SWITCH:** Coartist does AI art feedback at a similar price. ChatGPT does it for free. Drawabox offers structured drawing lessons for free. The core features (structured lessons + AI feedback) are served by existing tools.

## Keywords Analysis

"How to draw" 673K LOW is the biggest keyword we've ever seen — but it's the same trap as Coinstack's "apps for budgeting" 165K. People searching "how to draw" are looking for YouTube tutorials, not apps to buy. The search intent is informational (learn via free content), not transactional (purchase a product).

"Drawing app" 165K LOW is closer to product intent — but people searching this want Procreate, Photoshop, or Ibis Paint (drawing TOOLS), not drawing EDUCATION. The keyword serves a different product category.

## Framework Scores Tell the Story

- Value Equation: **6** (our BUILDs: 8-10)
- Community: **6/10** (our BUILDs: 8-10)
- Product: **6/10** (our BUILDs: 8-10)

Triple-6 is the weakest framework profile we've seen on any idea with all-9 IdeaBrowser scores. This confirms the pattern: **IdeaBrowser's 4 scores measure market size; the framework scores measure product-market fit.** When they diverge this sharply (9/9/9/9 vs 6/6), the market is big but the specific product isn't well-positioned.

---

# PASS 2: Challenge — Strongest Argument FOR Building

**Counter-argument:** "Nobody combines STRUCTURED DAILY LESSONS with AI FEEDBACK in one app. Coartist does feedback. Drawabox does structure. Neither does both. The Duolingo-style streak + daily lesson + instant AI critique on YOUR specific sketch is genuinely novel."

**Testing this:**

1. **Is structured lessons + AI feedback genuinely novel?** Coartist provides AI feedback. Adding a lesson library on top is a feature, not a moat. Any of the existing structured courses (Drawabox, Proko) could add AI feedback as a feature — and they already have the curriculum.

2. **Would the overnight MVP actually deliver good AI feedback?** GPT-4o vision can analyze sketches and give feedback. But the quality is... mixed. It's good for obvious proportion issues but poor for nuanced art critique. The feedback quality IS the product — if it's not significantly better than "upload to ChatGPT," there's no reason to pay $5/month.

3. **Is the habit loop strong enough?** Duolingo retains ~27% DAU/MAU (best in class). Drawing practice requires physical materials (pencil + paper), uploading a photo, and receiving subjective feedback. The friction is higher than tapping through language flashcards. Retention would likely be worse than Duolingo, not better.

**Verdict:** The combination is novel-ish but thin. The overnight MVP would be: web-based lesson library + sketch upload + GPT-4o feedback. That's a ChatGPT wrapper with drawing prompts. The structural lesson progression is content work (20 lessons), not technical innovation. And the AI feedback quality wouldn't be better than what you get for free from ChatGPT.

---

# PASS 3: Final Review — Would I Bet the Night?

No.

| Criterion | Value | Threshold | Pass? |
|-----------|-------|-----------|-------|
| Feasibility | 9 | ≥ 8 | ✅ |
| Execution | 3/10 | ≤ 3 | ✅ |
| Value Equation | **6** | ≥ 8 | ❌ |
| Community | **6/10** | ≥ 8 | ❌ |
| Product | **6/10** | ≥ 8 | ❌ |
| Revenue | $$ ($5/mo) | $$ | ⚠️ Coinstack graveyard |
| Keywords match intent | ❌ | Buyer intent | ❌ Informational |
| No exact competitor | ❌ | Required | ❌ Coartist + ChatGPT |
| MVP differentiated | ⚠️ | Required | ⚠️ ChatGPT wrapper with lesson prompts |
| Mobile-native needed | ❌ | Web OK | ❌ Habit apps need mobile |

**Fails 5 of 10 criteria. Our BUILDs pass 7-8 of 8.**

This is the Coinstack pattern again: all-9 IdeaBrowser scores, massive keywords, easy to build — but the product position is weak because free alternatives exist (ChatGPT), a direct competitor exists (Coartist), the pricing tier ($5/month consumer) is a graveyard, and the keywords are informational intent.

---

DECISION: SKIP

**Triple-6 framework scores (Value Equation 6, Community 6, Product 6) are the weakest profile we've seen on any all-9 idea. Coartist already provides AI art feedback on Google Play. ChatGPT gives free sketch feedback that r/learntodraw users already use. $5/month consumer subscription competes with free alternatives. Keywords ("how to draw" 673K) are informational intent (YouTube tutorials), not product purchases. Mobile app categorization but web-only MVP can't match the daily habit UX. The overnight MVP would be a ChatGPT wrapper with drawing lesson prompts — not meaningfully differentiated.**
