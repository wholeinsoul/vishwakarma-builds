# CEO Review — Fieldpin (2026-03-31)
## Offline Field Reporting Tool for Park Rangers and Wildlife Agencies

**Mode: SCOPE REDUCTION assessment | Quality: 3x Ralph Loop**

---

# PASS 1: Full CEO Review

## Who Has This Problem?

**Persona:** Park ranger or wildlife officer working in areas with no cell coverage. Currently fills out paper forms in the field, then re-enters data at the station. Data degrades between observation and entry.

**JTBD:** "I need to log a wildlife sighting with GPS coordinates, photos, and notes — right now, in the field — even though I have no signal. And it should automatically flow into our agency's reporting system when I'm back."

**Current workarounds:** Paper forms → manual desk entry, ArcGIS Field Maps (Esri's offline mobile app — already exists), Fulcrum (offline data collection app), Survey123 for ArcGIS (Esri's offline survey tool), KoboToolbox (free offline data collection for humanitarian/conservation).

## COMPETITOR KILL-SWITCH: Immediate Trigger

**Esri ArcGIS Field Maps** is EXACTLY this product. It's an offline-first mobile app that lets field workers drop pins, log observations, attach photos, and sync when connectivity returns — built by the $28B company that owns the GIS market.

| Competitor | What | Price | Exact Match? |
|-----------|------|-------|-------------|
| **ArcGIS Field Maps (Esri)** | Offline mobile field data collection with GPS, forms, photo attachment, auto-sync | Included with ArcGIS Online ($250/user/year) | ✅ **YES — exact product** |
| **Survey123 for ArcGIS** | Offline form-based data collection for field surveys | Included with ArcGIS | ✅ Yes — survey variant |
| **Fulcrum** | Mobile data collection platform with offline capability | $25-65/user/month | ✅ Yes — general field data collection |
| **KoboToolbox** | Free offline data collection for humanitarian/conservation | **Free** | ✅ Yes — free alternative used by conservation orgs |
| **Mergin Maps** | Mobile GIS data collection with offline sync | Free tier + $25/user/month | ✅ Yes |
| **QField** | Open-source mobile GIS field data collection | **Free (open source)** | ✅ Yes |

**Six products do exactly what Fieldpin proposes.** Two of them (KoboToolbox, QField) are FREE. One (ArcGIS Field Maps) is from the $28B market leader that conservation agencies already use. This is not a gap — it's a saturated category.

Per critical rule #2: identical products exist at similar or lower price points. **AUTOMATIC SKIP.**

## Why Feasibility 6 Confirms the Kill

IdeaBrowser itself rates this as "Challenging." Our data: every idea with Feasibility ≤ 6 has been SKIP'd (Reroute 6, Lineage AI 6, Talktrack 6, LocalCrawl 4, Barplay 5, Fieldpin 6). The pattern is 100% — 6 for 6.

## Additional Kill Signals

- **Execution 5/10** — requires offline-first native mobile with GPS, local SQLite/storage, background sync, Mapbox/tile caching. Not a web build.
- **Government procurement** — fiscal-year budget cycles, IT security reviews, FedRAMP-style compliance
- **Keywords: zero match** — every keyword is people searching for ArcGIS products
- **Community: 3 subreddits** — lowest in our entire pipeline (20+ ideas)
- **Domain expertise required** — GIS, conservation workflows, government agency IT standards

---

# PASS 2: Challenge — Strongest Argument FOR Building

**Counter-argument:** "ArcGIS is expensive ($250/user/year minimum, realistically much more for agencies). KoboToolbox is free but ugly and built for humanitarian aid, not conservation specifically. There's room for a modern, beautiful, conservation-specific tool at $10-50/user/month that's simpler than ArcGIS and more polished than KoboToolbox."

**Testing this:**

1. **Is the price gap real?** ArcGIS is expensive for small agencies. But conservation agencies that need GIS already have ArcGIS licenses — it's the industry standard. Adding Field Maps is incremental. The agencies that DON'T have ArcGIS use KoboToolbox (free) or paper.

2. **Is "simpler + prettier" a viable wedge?** Against a $28B incumbent with decades of agency relationships, government compliance certifications, and training ecosystems? No. Agencies don't switch GIS platforms because the new one has better CSS.

3. **Could we build an offline-first mobile app overnight?** No. Offline-first requires: local database (SQLite/Realm), background sync queue, conflict resolution, offline map tile caching, GPS with no network, photo storage with deferred upload. This is a 2-4 week mobile development project minimum, not an overnight web build.

**Verdict:** The counter-argument doesn't overcome: (a) 6 existing products including 2 free ones, (b) Esri's $28B market dominance, (c) the offline mobile app can't be built overnight, (d) government procurement kills overnight validation.

---

# PASS 3: Final Review — Would I Bet the Night?

No. Ten kill signals, six existing competitors (two free), Esri is a $28B incumbent, and the product requires native mobile development we can't do overnight.

| Kill Signal | Count |
|------------|-------|
| Feasibility ≤ 6 (auto-SKIP) | ✅ |
| Execution > 3/10 | ✅ |
| Exact competitors exist | ✅ (6 of them) |
| Free alternatives exist | ✅ (KoboToolbox, QField) |
| $28B incumbent | ✅ (Esri) |
| Government procurement | ✅ |
| Requires native mobile | ✅ |
| Keywords zero match | ✅ |
| Community below threshold | ✅ |
| Domain expertise required | ✅ |

---

DECISION: SKIP

**Feasibility 6 is an automatic SKIP (6/6 pattern). Six existing products do exactly this — including ArcGIS Field Maps from $28B Esri (the industry standard) and two free alternatives (KoboToolbox, QField). Offline-first native mobile app can't be built overnight. Government procurement cycles kill overnight validation. Keywords are all ArcGIS-related with zero match to the actual product.**
