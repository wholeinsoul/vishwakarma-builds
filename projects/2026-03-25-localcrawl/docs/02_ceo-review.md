# CEO Review — LocalCrawl (2026-03-25)
## Themed Neighborhood Crawls for Local Businesses

**Mode: SCOPE REDUCTION assessment | Quality: 3x Ralph Loop**

---

# PASS 1: Full CEO Review

## Who Has This Problem?

**Persona A (Business):** Small business owner on a commercial strip — coffee shop, bookstore, gallery — who sees foot traffic cluster at the anchor store while their end of the block gets scraps.

**Persona B (Visitor):** Tourist or local explorer looking for a curated walkable experience in a neighborhood. Wants more than Yelp's list — wants a routed experience.

**JTBD:** "I want to bring foot traffic from the busy end of the strip to my shop" (business) / "I want a fun, curated neighborhood walk this Saturday" (visitor).

**Current workarounds:** Google Maps (no curation), Yelp (list, not route), Eventbrite (events, not walking routes), self-guided tour apps (Detour/VoiceMap — mostly for tourist cities), chamber of commerce printed maps (static, no data).

## Premise Challenge

**Is this the right problem?** The problem exists but it's fundamentally a **local, physical, relationship-driven business.** The MVP strategy says it plainly: "Print route cards and leave them at the first stop, the nearest hotel lobby, and the local tourism office." This is not a software problem — it's a community organizing problem with a software layer on top.

The tech (QR check-ins, GPS routing, timestamped visits) is buildable. But the tech is the easy 20%. The hard 80% is: walking into 5 shops in a neighborhood, convincing each owner to put a QR code at their register, coordinating a themed route, and getting tourists/locals to use it.

## What Happens If We Do Nothing?

Business districts continue marketing door-by-door. The ones with active chambers of commerce do printed walking maps. Some cities have bar crawl apps. Most neighborhood strips just... exist, without coordinated marketing. The world keeps turning.

## Dream State Mapping

```
CURRENT STATE                    THIS PLAN (MVP)                   12-MONTH IDEAL
─────────────────────────────    ──────────────────────────────    ──────────────────────────
Printed chamber maps.            QR check-in walking routes        Multi-city platform with
Yelp lists. Google Maps.         in one neighborhood.              analytics dashboards for
No coordinated marketing         Free month for 5 businesses.      business districts + tourism
across neighboring shops.        Print route cards manually.        boards. $200-500/mo per biz.
No foot traffic data.            Timestamp visit data.              Grant-ready reports.
```

**Does the MVP move toward the 12-month ideal?** Technically yes, but the MVP requires **physical presence, in-person sales, and printed materials in one specific city.** We're in a remote overnight build pipeline. This is a fundamentally different kind of business.

## Existing Solutions

| Tool | What | Relevance |
|------|------|-----------|
| **VoiceMap** | Self-guided audio walking tours | Direct competitor for the visitor side. Has tours in 200+ cities. |
| **Detour (Bose)** | Location-triggered audio walks | Was acquired, now defunct. Validated the concept then died. |
| **Eventzee** | Scavenger hunt / check-in platform | Similar QR check-in mechanics for business promotions |
| **Driftmap** | Self-guided walking tours | Active competitor |
| **GPSmyCity** | Self-guided city walks + tours | 1,000+ city walks worldwide |
| **Questo** | Gamified city exploration app | 300+ cities, quests/challenges |

Multiple self-guided walking tour apps exist. The "themed business crawl" angle is narrower, but the underlying tech (GPS + check-ins + routes) is well-trodden.

## Overnight Build Test

The **software** is buildable: route builder, QR generator, check-in tracker, map display. But the **product** requires:
- Walking into shops in a specific neighborhood
- Convincing 5 business owners to participate
- Printing physical route cards
- Placing them in hotel lobbies and tourism offices
- Being physically present during the first crawl

None of this is overnight-buildable. The software without the local partnerships is an empty shell.

## Pass 1 Verdict: SKIP

Feasibility 4 is a hard fail. The idea requires local physical presence, in-person B2B sales, and printed materials — fundamentally incompatible with our remote overnight build pipeline.

---

# PASS 2: Challenge — Strongest Argument FOR Building

**Counter-argument:** "Build the route builder tool and let LOCAL PEOPLE create their own crawls. Don't sell to businesses — let neighborhood enthusiasts/bloggers/tourism influencers build routes for free. Monetize later with business placements."

This reframes LocalCrawl as a **user-generated walking route platform** — more like AllTrails for urban neighborhoods. Build the tool, let creators make routes, viewers use them. No physical presence needed.

**Does this save it?**

Partially. An AllTrails-for-neighborhoods tool IS buildable overnight. But:
1. AllTrails itself already exists ($150M+ revenue) and includes urban walks
2. Google Maps has "walking directions" and curated neighborhood guides
3. The QR check-in / business analytics layer — which is the REAL value — still requires in-person business partnerships
4. Without businesses paying, it's a free tool looking for a business model

**Verdict:** The reframe makes it buildable but removes the revenue model. A free walking route builder with no business monetization is a hobby project, not a business.

---

# PASS 3: Final Review — Would I Bet the Night?

No.

**Feasibility 4** is the lowest IdeaBrowser score we've ever seen. Our data over 14 days:
- Feasibility 4: SKIP (today)
- Feasibility 6: SKIP (Reroute, Lineage AI, Talktrack) — 3/3 SKIP'd
- Feasibility 8: BUILD or SKIP depending on other criteria
- Feasibility 9: BUILD or SKIP depending on other criteria

**Every idea with Feasibility ≤ 6 has been SKIP'd. Feasibility 4 doesn't even merit the full analysis.**

Additional kill signals:
- Value Equation 6/10 (our BUILDs: 8-10)
- Revenue $$ (our BUILDs: $$-$$$)
- B2B2C requiring local partnerships (can't do overnight)
- Keywords are consumer-intent ("city walking" = people wanting walks, not businesses wanting a crawl platform)
- Self-guided tour apps already exist (VoiceMap, GPSmyCity, Questo, Driftmap)
- IdeaBrowser itself rated this "Tough"

---

DECISION: SKIP

**Feasibility 4 (Tough) — lowest IdeaBrowser score we've ever seen, far below our ≥8 BUILD threshold. The idea fundamentally requires physical presence in a specific neighborhood (walking into shops, printing route cards, placing materials in hotel lobbies), which is incompatible with our overnight remote build pipeline. Value Equation 6/10 also below threshold. Multiple self-guided walking tour apps already exist (VoiceMap, GPSmyCity, Questo).**
