# Final Report — On Special
## AI Specials-to-Content Tool for Bars & Restaurants
**Date:** 2026-03-17

---

## Problem Discovered
Bar owners don't post their daily specials consistently — not because they don't want to, but because they're literally behind the bar pouring drinks during peak hours. The bar with the packed crowd isn't serving better drinks; someone is managing their social media presence with consistency. IdeaBrowser surfaced this as "AI Hype Agent for Bars and Restaurants" with scores of 8/8/8/9 (Opportunity/Problem/Feasibility/Why Now).

## CEO Review Verdict
**DECISION: BUILD** (Scope Reduction mode)

Stripped the IdeaBrowser pitch from 4 products (AI posting + weather integration + POS integration + event detection) down to one: "Type tonight's specials → get ready-to-post content for Instagram, Facebook, and Google in 30 seconds." No weather, no POS, no auto-posting in V1. Just solve the first problem: creating the content.

## Analysis Highlights
- **Market:** 700K+ restaurants, 60K+ bars in the US. Hospitality software market growing rapidly.
- **Threat:** Toast launched ToastIQ (AI marketing) in May 2025 — closing window for standalone tools.
- **Pricing adjustment:** Dropped from $99/mo to $49/mo based on competitive analysis (Buffer at $6/mo, Toast bundled free).
- **Verdict:** 🟡 EXPLORE MORE — Build the MVP but auto-posting needs to ship within 2 weeks or the value delta vs. ChatGPT is too thin.

| Score | Rating |
|-------|--------|
| Market Size | 8/10 |
| Timing | 7/10 |
| Feasibility | 9/10 |
| Revenue Potential | 6/10 |
| MVP Fit | 8/10 |
| **Weighted Average** | **7.4/10** |

## What Was Built

**Tech Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase (Auth + Postgres + RLS) + OpenAI GPT-4o-mini + Stripe

**Features:**
- Landing page with hero, features, pricing, CTA
- Email/password auth via Supabase
- Dashboard: specials input textarea + 7 template types (happy hour, live music, sports night, etc.)
- AI content generation: 3 platform-specific posts (Instagram, Facebook, Google Business)
- Copy-to-clipboard buttons per platform
- Generation history page
- Bar profile settings (name, voice, hashtags, cuisine, neighborhood)
- Stripe checkout ($49/mo subscription)
- Rate limiting (50 generations/day)
- Full RLS security on all database tables
- 58 source files, clean TypeScript build

## Code Review Findings
- **3 CRITICAL** (all fixed): Missing rate limit RPC function, overly permissive RLS on subscriptions, unsanitized social handles JSON
- **8 WARNING**: Open redirect in auth callback (fixed), missing request body error handling (fixed), boilerplate metadata (fixed), plus non-blocking items
- **6 INFO**: DRY improvements possible (Stripe init, auth checks, hashtag parsing)

## Test Results
- **Build:** ✅ Compiles successfully, 18 routes generated
- **TypeScript:** ✅ No type errors
- **Security:** ✅ 3 critical issues patched
- **QA Verdict:** PASS WITH ISSUES (no live e2e testing — requires Supabase + Stripe + OpenAI keys)

## Deployment
- **Status:** Not yet live (Vercel CLI not authenticated on this machine)
- **Ready for:** One-click Vercel deployment via GitHub import
- **Requires:** Supabase project, Stripe product/price, OpenAI key

## GitHub
https://github.com/wholeinsoul/vishwakarma-builds/tree/main/projects/2026-03-17-on-special

## Honest Assessment

This is a solid MVP skeleton. The architecture is clean, the security is tight (after review), and the code compiles. But let's be honest about what it is: a content generation wrapper around OpenAI with auth and payments bolted on.

**What works:** The UX flow is right. Bar owner opens dashboard → types specials → gets 3 platform-ready posts → copies and pastes. That's genuinely useful and saves 15-20 minutes per day.

**What doesn't work yet:** Without auto-posting (connecting to Instagram/Facebook/Google APIs), this is competing with "paste your specials into ChatGPT" — which is free. The $49/mo pricing only makes sense if the bar owner never has to leave the dashboard. V1.5 needs auto-posting or this is dead on arrival.

**The real question:** Is it worth continuing? Toast's ToastIQ exists and is bundled with POS. The window for standalone tools is narrowing. The path forward is either (a) nail auto-posting + POS-agnostic positioning within 2 weeks, or (b) pivot to a feature of a larger hospitality platform. Standing alone at $49/mo with copy-paste-only is not a business.
