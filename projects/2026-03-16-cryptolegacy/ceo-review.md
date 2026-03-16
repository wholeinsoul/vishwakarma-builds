# CEO Review — CryptoLegacy (2026-03-16)
## Crypto Inheritance Platform for Non-Technical Wallet Holders

**Mode: SCOPE REDUCTION** — One-night MVP build. Strip to essentials.

---

## Step 0: Nuclear Scope Challenge

### 0A. Premise Challenge

**Is this the right problem?**

Yes. Unambiguously yes. $140 billion in crypto is permanently inaccessible. People are dying without telling their families how to access their wallets. This is not a niche concern — it's an inevitability that affects every single crypto holder who doesn't have a plan.

And the existing solutions are either:
- **Way too expensive:** Casa Premium = $2,100/year. Casa Inheritance launched March 2024 — it's real, it works, but it's priced for people with $500K+ in crypto. The person with $30K in Bitcoin is priced out.
- **Way too technical:** Sarcophagus is a decentralized dead man's switch protocol on Ethereum — you need to understand smart contracts, Arweave, and cryptographic key splitting to use it. Exactly the kind of tool that the person who needs it most can't use.
- **Way too janky:** The current "solution" for most people: write your seed phrase on paper, put it in a safe deposit box, and hope your spouse figures it out. This fails constantly.

**The reframe that matters:** IdeaBrowser positions this as "a platform with wallet integrations." That's the complex version. The simple, buildable-tonight version is:

**CryptoLegacy doesn't need to touch wallets at all.**

Think about it. The user's problem isn't "I need software to manage my wallet inheritance." It's "I need a way to give my family instructions they can follow if I die." The MVP is an **encrypted instruction builder + dead man's switch delivery system.** No wallet APIs. No key management. No custody. Just:

1. User writes step-by-step instructions ("Go to Coinbase. Log in with email X. Here's my 2FA backup code. Transfer to your own account.")
2. Platform encrypts and stores the instructions
3. Dead man's switch: if user doesn't check in for X days, encrypted instructions are delivered to designated beneficiaries
4. Beneficiary decrypts using a key that was shared separately (or via security questions, or pre-shared passphrase)

This sidesteps the entire trust/custody problem. We never see the actual crypto. We never hold keys. We're a secure message delivery service with a dead man's switch. The liability profile is massively simpler.

**Alternative framings:**
1. **Full wallet integration platform** (IdeaBrowser's vision) — Requires API partnerships with Coinbase, Trust Wallet, etc. Months of work. Skip for MVP.
2. **Encrypted instruction vault + dead man's switch** (our version) — Buildable tonight. No wallet API needed. The "guide builder" is the product.
3. **Simple checklist/PDF generator** — Too basic. No recurring revenue. No moat.

### 0B. What's the Actual User Outcome?

**The crypto holder wants:** "If I get hit by a bus tomorrow, my wife can access our $47K in Bitcoin without hiring a crypto consultant."

**Most direct path:**

1. Holder answers guided questions about their wallets (what platform, what type, how to access)
2. Platform generates a step-by-step recovery guide tailored to their specific setup
3. Guide is encrypted and stored
4. Dead man's switch monitors for inactivity (configurable: 30/60/90 days)
5. If triggered, beneficiary receives decryption access + the guide
6. Non-technical spouse follows numbered steps to access the crypto

**This is basically a "break glass in case of death" envelope — but digital, encrypted, and automated.**

The key insight: the guide builder can be templated. Most crypto is on Coinbase, Binance, Kraken, or in MetaMask/Ledger. That's maybe 10 platform-specific templates. The user picks their platform(s), fills in their specific details, and the guide assembles itself.

### 0C. What Happens If We Do Nothing?

People keep writing seed phrases on Post-it notes. $140B stays locked. Every year, more crypto gets permanently lost as holders die or become incapacitated. Casa serves the high-net-worth segment. Everyone else is on their own.

The market grows (28.9% CAGR to $69B by 2030) and the inheritance gap widens. Someone will build the affordable version. The question is whether it's us.

### 0D. Dream State Mapping

```
CURRENT STATE                    THIS PLAN (MVP)                   12-MONTH IDEAL
─────────────────────────────    ──────────────────────────────    ──────────────────────────
$140B locked. Casa at $2,100/yr  Encrypted guide builder +         Multi-wallet platform with
serves HNW only. Sarcophagus     dead man's switch delivery.       auto-detection, beneficiary
requires technical expertise.    Templates for top 10 platforms.   portal, legal document
Most people: seed phrase on      $9-29/month subscription.         generation, attorney
paper in a drawer.               No wallet API needed.             partnerships, white-label
                                 Functional MVP tonight.           for exchanges. $500K+ ARR.
```

**Does the MVP move toward the 12-month ideal?** Yes, directly. The guide builder IS the core product. Wallet integrations, auto-detection, and legal docs are all additive features on top of the same foundation. The dead man's switch is the mechanism that creates recurring revenue (you pay to keep it active).

### 0E. 10x Check

**10x more ambitious for 2x effort:** Instead of just instruction delivery, build **CryptoWill** — a legally-binding digital crypto estate plan generator. Partner with estate planning attorneys to generate state-specific crypto trust documents alongside the technical recovery guide. Bundle legal + technical inheritance in one product.

**Verdict:** Great Phase 2 play. For tonight, the encrypted guide + dead man's switch is the right scope. The legal layer adds weeks of attorney consultation and state-by-state compliance research.

### 0F. Existing Solutions Assessment

| Solution | Pricing | What It Does | Why There's Still a Gap |
|----------|---------|-------------|------------------------|
| **Casa Premium** | **$2,100/year** | Multi-sig custody + inheritance planning | Priced for $500K+ portfolios. The $30K holder is priced out by 7x. Requires Casa's own wallet ecosystem. |
| **Casa Standard** | **$248/year** | 2-of-3 multisig custody | Has inheritance features but limited. Still expensive relative to casual holders. |
| **Sarcophagus** | Free (gas fees) | Decentralized dead man's switch on Ethereum | Requires understanding smart contracts, Arweave, and key splitting. Non-technical users can't use it. |
| **Ledger Recover** | $9.99/month | Seed phrase backup via social recovery | Only works with Ledger hardware wallets. Controversial (many crypto purists hate it). Not inheritance-specific. |
| **Cardano Dead Man Switch** | Proposal stage | On-chain dead man's switch for Cardano | Academic/proposal. Not built. Cardano-only. |
| **Paper/safe deposit box** | Free | Write seed phrase on paper | Fails when: spouse can't find it, doesn't know what it is, bank restricts access, fire/flood destroys it |
| **Shared password manager** | $3-5/month (1Password) | Share vault with family member | Not crypto-specific. No guided recovery. No dead man's switch. Requires technical family member. |

**The gap is clear and massive:**

| Feature | Casa | Sarcophagus | Ledger Recover | CryptoLegacy (Our MVP) |
|---------|------|-------------|----------------|----------------------|
| Affordable (<$30/mo) | ❌ | ✅ | ✅ | ✅ |
| Non-technical user friendly | ⚠️ | ❌ | ⚠️ | ✅ |
| Wallet-agnostic | ❌ | ❌ | ❌ | ✅ |
| Dead man's switch | ✅ | ✅ | ❌ | ✅ |
| Guided recovery for beneficiary | ✅ | ❌ | ❌ | ✅ |
| No seed phrase custody | N/A | ✅ | ❌ | ✅ |
| Works tonight | ✅ | ✅ | ✅ | 🔨 Building it |

**Our differentiators:**
1. **Price:** $9-29/month vs. $248-2,100/year
2. **Wallet-agnostic:** Works with any exchange, any wallet, any blockchain
3. **Non-technical UX:** Guided wizard, not smart contracts
4. **No custody:** We never see your keys or crypto. We just deliver encrypted instructions.

### Competitive Window Analysis

**Why now specifically:**

1. **Keywords are ALL LOW competition.** "Dead mans switch" = 33.1K/month, LOW competition. "Coinbase wallet recovery phrase" = 4.4K, LOW. "My recovery phrase" = +2,614% growth. This is a Pumpline-like SEO goldmine.

2. **Casa just raised prices and went upmarket.** Casa Premium at $2,100/year signals they're pursuing HNW clients. The $30K-$200K segment is getting LEFT BEHIND. Classic market bifurcation — incumbent goes upmarket, opening the bottom.

3. **Crypto adoption is mainstream now.** Wallet market $25B → $69B by 2030. More non-technical holders = more people who need inheritance planning = more people priced out of Casa.

4. **No incumbent in the affordable segment.** Sarcophagus is too technical. Ledger Recover is wallet-specific. Nobody is building the "$9/month crypto inheritance plan" for regular people.

5. **Trust window:** The crypto community is increasingly aware of inheritance risk (post-FTX, post-Mt. Gox). Articles about "lost Bitcoin" are everywhere. People are ready to act but have no affordable option.

---

## Revenue Reality Check

**Would someone pay $10-50/month for this?**

**YES.** And here's why this is different from the last two SKIPs:

1. **The asset at risk is 100-1000x the subscription cost.** Someone with $30K in Bitcoin will absolutely pay $120/year ($10/month) to ensure their family can access it. That's 0.4% of the portfolio value. Casa charges ~7% of a $30K portfolio ($2,100). We're 17x cheaper.

2. **The pain is permanent and recurring.** Unlike septic service (every 3-5 years) or flight delays (episodic), crypto inheritance risk is **always on**. As long as you hold crypto, you need a plan. This supports subscription revenue naturally.

3. **The dead man's switch requires ongoing service.** Check-in monitoring, encrypted storage, beneficiary notification — these are legitimate recurring services, not artificial subscription padding.

4. **Comparable pricing exists and is accepted.** 1Password: $3-5/month. Ledger Recover: $10/month. Casa Standard: $21/month. Our $9-29/month range fits the market.

**Revenue projections (conservative):**
| Timeframe | Subscribers | Avg MRR/user | MRR | ARR |
|-----------|------------|-------------|-----|-----|
| Month 6 | 100 | $15 | $1,500 | $18K |
| Month 12 | 500 | $18 | $9,000 | $108K |
| Month 24 | 2,000 | $20 | $40,000 | $480K |
| Month 36 | 5,000 | $22 | $110,000 | $1.3M |

---

## The Overnight Build Test

| Capability | Buildable Tonight? | Notes |
|-----------|-------------------|-------|
| Guided instruction builder (wizard) | ✅ Yes | Multi-step form with platform-specific templates |
| Encryption of instructions | ✅ Yes | AES-256-GCM client-side encryption (Web Crypto API) |
| Secure storage | ✅ Yes | Store encrypted blob in Supabase. We never see plaintext. |
| Dead man's switch (check-in timer) | ✅ Yes | Cron job / scheduled function. Email check-in link. If no response in X days, trigger notification. |
| Beneficiary notification | ✅ Yes | Email delivery via Resend when switch triggers |
| Decryption by beneficiary | ✅ Yes | Beneficiary enters pre-shared passphrase in browser → decrypts locally |
| User authentication | ✅ Yes | Supabase Auth (email/password + magic link) |
| Subscription payments | ⚠️ Partial | Stripe Checkout link. Not fully integrated but functional. |
| Wallet API integrations | ❌ Not tonight | Phase 2. Not needed for MVP — the guide builder is wallet-agnostic |

**Every core feature is buildable tonight.** This is the first idea since Pumpline where that's true.

---

## Honest Assessment

### Strengths
1. **All scores above 8.** Opportunity 9, Problem 9, Feasibility 8, Why Now 9. First idea with Feasibility ≥ 8.
2. **LOW competition keywords.** "Dead mans switch" = 33.1K/month, LOW. SEO goldmine like Pumpline.
3. **Clear revenue model.** Subscription makes sense (ongoing service, not one-time use).
4. **Asset-at-risk pricing psychology.** People protect $30K+ portfolios with $10/month insurance-like payments.
5. **No custody = no liability nightmare.** We encrypt on the client. We never see keys. This is a messaging/delivery service, not a custody platform.
6. **Every core feature buildable tonight.** No regulatory blockers, no partnership dependencies, no API requirements.
7. **Natural moat:** Data (encrypted recovery guides) creates switching costs once set up.

### Weaknesses
1. **Trust is the #1 barrier.** Asking someone to put crypto recovery instructions into a web app requires immense trust. Mitigation: client-side encryption (we literally cannot read them), open-source the crypto, third-party audits.
2. **Dead man's switch has edge cases.** What if the user just forgot to check in? What if they're in a hospital? Need configurable grace periods, multiple notification steps, and a "false alarm" recovery flow.
3. **Execution difficulty 6/10.** Not trivial — encryption, key management UX, dead man's switch timing logic all need careful implementation.
4. **Crypto market volatility.** Bear markets reduce new crypto holders = fewer potential subscribers. But existing holders still need inheritance planning regardless of price.
5. **Privacy/security audit expectations.** Crypto users will demand proof of security. Open-sourcing the client-side encryption code is table stakes.

### Risks
1. **Casa launches a $10/month tier.** Possible but unlikely given their upmarket trajectory ($2,100/year Premium). Their brand is "premium security for serious holders."
2. **Major exchange adds inheritance natively.** Coinbase or Binance could build this. But they'd only cover their own platform — not wallet-agnostic like us.
3. **Security breach / data leak.** Even encrypted data leaking would be catastrophic for trust. Mitigation: zero-knowledge architecture, client-side encryption only.
4. **Legal issues around "digital estate planning."** We're NOT providing legal advice. We're a secure document delivery service. Clear disclaimers needed.

---

## MVP Scope (Tonight)

**BUILD this:**
1. **Guided recovery plan builder** — Multi-step wizard: "What platforms do you use?" → platform-specific templates → user fills in details → generates complete recovery guide
2. **Client-side encryption** — AES-256-GCM via Web Crypto API. User sets a passphrase. We store only the encrypted blob. Zero-knowledge.
3. **Dead man's switch** — Configurable check-in interval (30/60/90 days). Email check-in link. Escalation chain: reminder → urgent → trigger.
4. **Beneficiary management** — Name + email for up to 3 beneficiaries
5. **Switch trigger flow** — When activated: email beneficiaries with link to decryption page + instructions for getting the passphrase
6. **Beneficiary decryption page** — Enter passphrase → decrypt guide locally in browser → display step-by-step recovery instructions
7. **User auth** — Supabase Auth (email/password + magic link)
8. **Landing page** — Clear value prop, pricing, trust signals (client-side encryption, zero-knowledge, open-source)
9. **Stripe Checkout** — Simple payment link for $9/month and $29/month plans

**DO NOT BUILD this:**
- ❌ Wallet API integrations
- ❌ Automatic asset detection
- ❌ Legal document generation
- ❌ Hardware wallet support
- ❌ Multi-sig/social recovery
- ❌ Mobile app
- ❌ Biometric features
- ❌ NFT/DeFi coverage (Phase 2)

---

## Decision Gate

**The question: Is this worth a night of building?**

**For:**
- All scores ≥ 8 (first time in our pipeline)
- LOW competition keywords with strong volume (33.1K)
- Every core feature buildable tonight — no regulatory blockers, no API dependencies
- Clear subscription revenue model with natural recurring need
- No custody / no key management = simple liability profile
- $140B locked problem with $2,100/year incumbent leaving the bottom open
- Strong community signals (Reddit 8/10, YouTube 7/10, Other 8/10)
- Crypto wallet market growing 28.9% CAGR

**Against:**
- Trust barrier is real (mitigated by client-side encryption)
- Execution difficulty 6/10 (encryption + dead man's switch need care)
- Crypto market cyclicality affects new user acquisition

**The honest take:** This is the best idea since Pumpline. It's the FIRST idea where:
1. Feasibility is ≥ 8
2. All keywords are LOW competition
3. Every core feature is buildable overnight
4. Revenue model naturally supports subscriptions
5. The incumbent (Casa at $2,100/yr) is going upmarket, leaving the bottom open

The no-custody, encrypted-instruction-delivery approach is the key insight. We're not building a crypto wallet or custody platform. We're building a "digital safety deposit box for crypto instructions" with a dead man's switch. That's fundamentally simpler and more buildable than what IdeaBrowser described.

After two consecutive SKIPs (Reroute, Lineage AI), this passes every gate.

---

DECISION: BUILD

**Build an encrypted crypto inheritance guide builder with a dead man's switch delivery system. Zero-knowledge architecture — client-side AES-256-GCM encryption, we never see plaintext instructions. Guided wizard with platform-specific templates (Coinbase, Binance, MetaMask, Ledger, etc.). Dead man's switch with configurable check-in intervals. Beneficiary decryption portal. $9-29/month subscription via Stripe. The MVP avoids wallet integrations entirely — we deliver encrypted instructions, not crypto. Ship tonight.**
