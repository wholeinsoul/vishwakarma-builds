# CEO Review — Reroute (2026-03-14)
## Flight Compensation Recovery Agent for Frequent Flyers

**Mode: SCOPE REDUCTION** — One-night MVP build. Strip to essentials.

---

## Step 0: Nuclear Scope Challenge

### 0A. Premise Challenge

**Is this the right problem?**

The problem is real. EU261/2004 mandates €250–€600 for qualifying delays/cancellations. Airlines systematically reject first claims counting on passengers to give up. Business travelers waste 45+ minutes on hold per disruption. The pain is documented and quantifiable.

**But here's the hard truth: this problem is already solved — expensively and at scale.**

AirHelp has €48.8M annual revenue, 10+ million customers, $22M+ in funding, and just launched a mobile app (May 2025). ClaimCompass, Flightright, Refund.me, AirRefund, EUclaim, MyFlightRefund, FlightDelayed, ClaimFlight, TravelRight, DelayFix, SkyRefund — the flight compensation market has **at least 12 funded competitors**. This isn't a gap. This is a bloodbath.

The IdeaBrowser pitch frames this as "no competitor combines rebooking + claims + monitoring." That's technically true. But it's also misleading:

- **Flighty** ($49.99/year) does real-time flight monitoring + proactive alerts exceptionally well
- **AirHelp** ($24.99/year for AirHelp+) does claims + monitoring
- **Airlines themselves** (United, Delta, American) increasingly offer auto-rebooking
- **Google Flights** provides free disruption alerts

The "integration gap" is narrower than it appears. And the hardest piece — **actually rebooking flights automatically** — requires airline API partnerships or GDS access that a solo founder cannot get overnight, or possibly ever.

**Alternative framings:**

1. **Claims-only bot (EU focus):** Strip rebooking entirely. Build an AI agent that monitors flights, detects qualifying delays, auto-generates claims with the right documentation, and files them. Commission-only model. This is AirHelp but cheaper and AI-native.
2. **Disruption intelligence dashboard:** Skip claims entirely. Build a dashboard for corporate travel managers showing disruption frequency by route, cost-per-disruption analytics, and predictive risk scoring. B2B SaaS play.
3. **Compensation calculator + claim template generator:** The lead magnet IS the product. Free tool that tells you exactly what you're owed and gives you a pre-filled claim letter. Monetize with ads or upsell to a paid claim-filing service.

### 0B. What's the Actual User Outcome?

The user outcome depends on the persona:

**Persona 1: Disrupted traveler at the airport (emergency)**
- "I need to get on the next flight, RIGHT NOW."
- Most direct path: Call the airline. Use the airline's app. Go to the gate agent.
- A third-party app is not what you reach for in an emergency. You reach for the airline's own tools.

**Persona 2: Post-disruption traveler (compensation recovery)**
- "That delay cost me half a day. Does the airline owe me money?"
- Most direct path: Check if the delay qualifies under EU261 → File a claim → Follow up.
- THIS is where automation helps. The filing, documentation, and follow-up.

**Persona 3: Corporate travel manager (cost visibility)**
- "How much are disruptions costing us across 200 employees?"
- Most direct path: Dashboard with disruption analytics and compensation recovery.
- This is the most defensible play but requires enterprise sales.

The IdeaBrowser plan tries to serve all three simultaneously. That's a startup, not an overnight MVP.

**Most honest assessment of the user outcome:** The real job-to-be-done for most people is **Persona 2 — "get me the money the airline owes me without me having to think about it."** Everything else (rebooking, monitoring, predictive scoring) is nice-to-have.

### 0C. What Happens If We Do Nothing?

The world continues just fine. AirHelp collects €48.8M/year. ClaimCompass, Flightright, and 10+ other companies handle claims for millions of passengers. Travelers who don't use these services either file claims themselves (5-10 minute process for EU flights) or leave money on the table.

**The honest answer:** The market works. It's expensive (25-35% commission), but it works. The question isn't "does someone need to solve this?" — it's "can we solve it meaningfully better than 12 funded competitors?"

### 0D. Dream State Mapping

```
CURRENT STATE                    THIS PLAN (MVP)                   12-MONTH IDEAL
─────────────────────────────    ──────────────────────────────    ──────────────────────────
AirHelp dominates with 10M+     ???                                Full-stack travel
customers. Flighty handles       What can a solo founder           disruption platform
monitoring. Airlines improving   build in one night that           competing with AirHelp.
auto-rebooking. 12+ funded      competes with a €48.8M/yr         Requires airline
competitors in claims space.     company with 10M users?           partnerships, legal
                                                                   team, GDS access,
                                                                   and millions in funding.
```

**Does the MVP move toward the 12-month ideal?** This is where it falls apart. The 12-month ideal requires airline partnerships, a legal compliance framework across multiple jurisdictions, GDS/NDC API access for rebooking, and a claims processing engine that can handle airline pushback. None of that is achievable overnight, and the MVP won't meaningfully demonstrate traction toward any of it.

### 0E. 10x Check

**10x more ambitious for 2x effort:** Build a WhatsApp/Telegram bot that travelers text their booking reference to. The bot monitors the flight, detects disruptions, instantly tells them what they're owed under EU261, and generates a ready-to-send claim email. No app to install. No account to create. Just text a number.

**Verdict:** This is actually more achievable than the IdeaBrowser plan and more differentiated than building another web app. But it still faces the core problem: competing with funded incumbents on claims processing.

### 0F. Existing Solutions Assessment

| Solution | What It Does | Revenue/Scale | Why We Can't Beat It Overnight |
|----------|-------------|---------------|-------------------------------|
| **AirHelp** | Claims + monitoring + mobile app | €48.8M/yr, 10M+ customers | 10+ years of airline relationship data, legal teams in multiple jurisdictions, massive brand |
| **AirHelp+** | Subscription monitoring + auto-claims | $24.99/year | Already the "subscription monitoring" product |
| **Flighty** | Flight tracking + proactive alerts | $49.99/year, Apple Design Award winner | Best-in-class UX, deep airline data integration |
| **ClaimCompass** | EU flight compensation claims | Funded competitor | Specialized claims engine with legal expertise |
| **Flightright** | Claims + monitoring (German market) | Major European player | Years of case law knowledge baked in |
| **Google Flights** | Free disruption alerts | Free, unlimited scale | Can't compete with free |
| **Airline apps** | Auto-rebooking, disruption alerts | Built-in, no install | First-party data advantage |

**The gap IdeaBrowser identifies ("no one combines all three") exists for a reason:** combining rebooking + claims + monitoring requires airline API partnerships, legal expertise in multiple jurisdictions, and significant capital. It's not a technical gap — it's a business capability gap.

### Competitive Window Analysis

**Why the window is CLOSED:**

1. **Keywords are HIGH competition:** Unlike Pumpline (LOW competition, 110K volume), Reroute's keywords are all HIGH competition. "Flight delay compensation eu" — HIGH, 18.1K. You're fighting AirHelp, Flightright, and ClaimCompass for every click. SEO is not a viable growth channel here without massive content investment.

2. **AirHelp just launched a mobile app (May 2025):** They're actively expanding their product to cover more of the value chain. The "integration gap" is closing from the incumbent side.

3. **Airlines are adding auto-rebooking:** Delta, United, and American are all investing in proactive rebooking. The rebooking piece of the value prop is getting eaten by the airlines themselves.

4. **Commission compression:** Competition among claims companies has driven commissions from 35% down toward 15-25%. Margins are shrinking.

5. **Regulatory risk:** If the EU or US simplifies the claims process (making it easy for travelers to file directly), the entire claims industry contracts.

---

## Revenue Reality Check

**Would someone pay $10-50/month for this?**

**Individuals: Maybe $29/month, but only if it works flawlessly.** The problem is that Flighty offers monitoring for $49.99/YEAR ($4.17/month). AirHelp+ offers monitoring + claims for $24.99/YEAR ($2.08/month). Pricing at $29/MONTH is 7-14x more expensive than existing solutions. You'd need to deliver 7-14x more value. How?

**The commission model is the only viable path:** 25% of successful claims means you get paid only when the traveler does. This aligns incentives. But it also means: (a) you need a claims engine that actually works, (b) you need to handle airline pushback and legal follow-up, (c) your revenue is unpredictable and dependent on disruption frequency.

**Corporate teams at $10-30/user/month:** This could work if you build disruption intelligence/analytics. But corporate travel managers already use SAP Concur, AmEx GBT, and TripActions (Navan). Getting enterprise contracts as a one-night MVP is fantasy.

**Realistic overnight MVP revenue: $0.** There is no path to revenue from an overnight build in this space. The claims engine needs to actually process claims and receive payouts — that takes months of legal setup and airline negotiation.

---

## The Overnight Build Test

This is the critical question for our pipeline. Can we build a **functional, non-mockup MVP** in one night?

| Capability | Buildable Overnight? | Why/Why Not |
|-----------|---------------------|-------------|
| Flight monitoring (status alerts) | ⚠️ Partially | Public APIs exist (FlightAware, AviationStack) but cost money. Free tiers are very limited. |
| EU261 eligibility checker | ✅ Yes | Rule engine: distance + delay duration + airline + departure airport = eligible/not. Static logic. |
| Pre-filled claim letter generator | ✅ Yes | Template engine with booking details → formatted claim letter/email. |
| Auto-file claims with airlines | ❌ No | Airlines don't have public APIs for claims. Each airline has different submission processes (web forms, email, postal mail). |
| Auto-rebook flights | ❌ No | Requires GDS/NDC API access (Amadeus, Sabre, Travelport). Partnership agreements needed. |
| Compensation calculator | ✅ Yes | Distance calculator + EU261 rules → compensation amount. |
| Dashboard/analytics | ✅ Yes | Standard web app. |

**Honest buildable scope:** A compensation calculator + eligibility checker + claim letter generator. That's it. And that's what already exists in dozens of free online tools.

---

## Honest Assessment: Strengths & Weaknesses

### Strengths
1. **Real, quantifiable pain.** €250-€600 per qualifying delay is real money.
2. **Large market.** $1.67 trillion in global travel bookings.
3. **High IdeaBrowser scores.** Opportunity 9, Problem 9, Why Now 9.
4. **Community demand is genuine.** Reddit, Facebook discussions validate the pain.

### Weaknesses (deal-breakers for overnight build)
1. **12+ funded competitors.** AirHelp alone has €48.8M/year revenue and 10M+ customers. This is a mature market, not a gap.
2. **HIGH keyword competition.** No SEO shortcut. Every relevant keyword is contested by well-funded companies.
3. **Core features aren't buildable overnight.** Auto-rebooking requires airline partnerships. Claims filing requires legal infrastructure. The MVP would be a calculator — which already exists for free.
4. **Revenue requires legal/operational infrastructure.** You can't process claims or collect commissions without legal entities, airline relationships, and payment processing for compensation payouts.
5. **Pricing doesn't work.** $29/month vs. $2/month (AirHelp+) or free (Google Flights). No room.
6. **The 12-month path requires capital.** Airline partnerships, legal teams, GDS access — this is a venture-funded startup, not a bootstrapped overnight build.

### Risks
- **Build a pretty calculator that nobody uses** because AirHelp already exists and is trusted
- **Invest a night building something that can never reach revenue** without months of legal/partnership work
- **Compete on features against a company with €48.8M/yr and 10M users** — this is not a fight we win

---

## What Would I Build Instead?

If I were forced to build something in the travel disruption space overnight, I'd build:

**Option A: "Am I Owed?" — Instant EU261 Checker (PIVOT)**
A dead-simple, beautifully designed single-page app. Enter your flight number + date. Instantly tells you: (1) if the flight was delayed/cancelled, (2) how much you're owed under EU261, (3) a pre-written claim email ready to copy and send. Monetize with affiliate links to AirHelp/ClaimCompass for people who don't want to file themselves. SEO target: "am I owed compensation for my flight" and similar long-tail queries.

**Option B: Skip this idea entirely (SKIP)**
The travel compensation space is too crowded, too capital-intensive, and too dependent on partnerships for an overnight build. Pick a different idea tomorrow.

---

## Decision Gate

**The question: Is this worth a night of building?**

**For:**
- Real, quantifiable pain with strong emotional signals
- Large market with proven willingness to pay
- High IdeaBrowser scores across the board

**Against (overwhelming):**
- 12+ funded competitors including AirHelp (€48.8M/yr, 10M+ customers)
- HIGH keyword competition — no SEO shortcut
- Core value props (rebooking, claims filing) are unbuildable overnight
- Revenue requires legal infrastructure, airline partnerships, and months of setup
- Pricing is 7-14x higher than existing solutions
- The overnight MVP would be a compensation calculator — which is a commodity
- Feasibility score of 6 (the lowest score) confirms this is too complex

**The honest take:** IdeaBrowser's scores are high because the *problem* is real and the *market* is big. But those scores don't account for competitive density. This is like looking at "food delivery" in 2024 and saying "Opportunity: 10, Problem: 10, Why Now: 10" — technically true, but good luck competing with DoorDash, Uber Eats, and Grubhub.

The Pumpline build yesterday worked because it entered a **fragmented market with LOW competition keywords and no dominant incumbent.** Reroute is the opposite: a **consolidated market with HIGH competition keywords and a dominant incumbent (AirHelp).**

We don't bring a knife to a gunfight. We find a fight where nobody's armed.

---

DECISION: SKIP

**This idea fails the overnight build test. The core value props (rebooking, claims filing) require airline partnerships and legal infrastructure that cannot be built in one night. The market has 12+ funded competitors with AirHelp at €48.8M/yr. All keywords are HIGH competition. The achievable overnight MVP (a compensation calculator) is a commodity that already exists for free. Skip and wait for tomorrow's idea.**
