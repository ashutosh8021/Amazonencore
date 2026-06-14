# HackOn with Amazon — Solution Document
**Team Name:** [Your Team Name]
**Hackathon Theme:** Second Life Commerce: AI-Powered Returns & Sustainable Resale
**Date:** June 15, 2026

---

## Team Members

| Name | College / University | Role | Email |
|---|---|---|---|
| Ashutosh Kumar | [College] | Full-Stack + AI Engineer | ashutoshkumarr802152@gmail.com |
| [Member 2] | [College] | [Role] | [Email] |
| [Member 3] | [College] | [Role] | [Email] |
| [Member 4] | [College] | [Role] | [Email] |

---

## 1. Problem Statement & Relevance

### The Problem

Every year, over **5 billion products are returned globally** in e-commerce — most of them perfectly functional. In India alone, Amazon processes millions of returns annually, yet the vast majority of returned items are either landfilled or liquidated at 5–15% of their original value because no intelligent system exists to assess condition, match buyers, or make the right routing decision. This costs sellers an estimated **₹42,000 crore ($5B) per year** in lost value and reverse logistics.

### Why It Matters

**For customers:** A returned AirPods Pro might be in "Like New" condition — but there is no way to know that without an honest condition report. Customers struggle to trust second-hand products, so they buy new, creating more waste.

**For sellers:** Reverse logistics costs approximately 59% of the original item value. A ₹500 shoe returned in "Good" condition costs ₹250 to process — meaning reselling it loses money. No current system tells the seller this upfront.

**For the planet:** E-waste from discarded electronics contributes 80–120 kg CO₂ per item. With 5B+ annual returns globally, the environmental cost is catastrophic. The cost of inaction is continued landfill overflow and accelerating carbon emissions from avoidable manufacturing.

**Scale:** Amazon India serves 500M+ customers. Even routing 10% of returns correctly represents ₹4,200 crore in recovered value and tens of thousands of tons of CO₂ prevented.

### Theme Alignment

Amazon Encore directly implements the "Second Life Commerce" theme by building an intelligent ecosystem where every returned product — rather than going to a landfill or a liquidation bin — is automatically assessed by AI and routed to its best second life: resale, refurbishment, donation, trade-in, or responsible recycling.

Our unique angle: **Encore is the first return platform where the AI only does perception (grading), and a deterministic engine does the business decision** — making every routing decision transparent, auditable, and reproducible. Customers can see exactly why their item was or was not relisted.

### What Makes This Novel

Existing solutions (Amazon Renewed, Back Market, thredUP) are binary: sell or trash. They have no:
- Transparent value-vs-cost math visible to the customer
- Intelligent routing between 5 distinct outcome pathways
- Green credits or trade-in credits for non-resale outcomes
- Honest "we chose NOT to relist because..." explanation

Encore's insight: **"Not relisting" is sometimes the right answer** — and showing the customer exactly why (₹200 resale − ₹250 cost = −₹50 net) builds more trust than pretending everything can be resold. No platform has done this before.

---

## 2. Customer & Solution

### Target Customer

**Primary — Individual sellers / consumers:** Anyone with a returned or unused product who wants to know its real second-life value. Example: Priya has gently-used Nike shoes. She doesn't know if they're worth listing. Encore tells her in 30 seconds.

**Secondary — Amazon Marketplace sellers:** Sellers with returned inventory who need intelligent routing at scale. Encore can process thousands of items/day via the same API.

**Tertiary — Buyers seeking certified refurbished:** Budget-conscious buyers who want an honest, AI-verified condition report before purchasing second-hand — with the same Amazon trust layer they already rely on.

### How We Solve It

Amazon Encore is an AI-powered second-life commerce platform built as a native Amazon program. Upload a photo of any returned or unused item — Encore does the rest.

**Key features:**

1. **AI condition grading via AWS Bedrock** — Upload a photo; Kimi K2 (Moonshot AI) multimodal vision returns a structured condition grade (Like New / Very Good / Good / Acceptable / Not Sellable), confidence score (0–100%), and observed flaws. No manual inspection required.

2. **Deterministic disposition engine with visible math** — Our own code (not the AI) makes the business decision. For every item: `Expected Resale Value − Processing Cost = Net Resell`. If net is negative and refurbishment also loses money, the engine routes to Donate, Exchange, or Recycle — and shows the customer the exact calculation.

3. **Five routing outcomes** — Resell (AI-generated listing published to marketplace), Refurbish (item flagged for professional refurbishment, higher net recovery), Donate (item donated to NGO partner, customer earns green credits ≈ Amazon Pay), Exchange (trade-in for Acceptable-grade electronics — customer gets ₹100–₹500 Amazon Pay credit immediately), Recycle (responsible recycling, CO₂ saved tracked).

4. **AI-generated marketplace listings** — For Resell/Refurbish outcomes, Bedrock writes a condition-accurate listing title and description that discloses flaws honestly. No wishful thinking.

5. **Peer-to-peer Encore marketplace** — All listed items appear in a searchable, condition-filterable marketplace with personalized category recommendations based on browse history. Every listing has an "Encore Verified" badge and a visible AI condition report.

**Bonus features:** Green credits dashboard, three pre-loaded personas (Priya, Rahul, Small Seller) running through the real engine, and a "Return Prevention" section showing buyers certified refurbished alternatives before they buy new.

### User Workflow

```
Step 1 — Upload
Customer uploads a photo of the returned/unused item on the Encore intake page.
Optionally adds: product name, original price, category.

Step 2 — AI Grades
POST /api/grade → AWS Bedrock (Kimi K2 — Moonshot AI)
Returns: grade, confidence, observations, condition report
Example: "Good · 87% confidence · [Sole worn at heel, Minor scuffs on toe cap]"

Step 3 — Engine Decides
POST /api/decide → disposition.js (our deterministic code)
Math: Expected Resale Value − Processing Cost = Net Resell
Example: ₹200 − ₹250 = −₹50 → Decision: DONATE (not a loss to customer; earns green credits)

Step 4 — Outcome
RESELL → POST /api/listing → Bedrock writes listing → Published to marketplace
REFURBISH → Flagged for professional refurb; projected net shown
DONATE → Green credits earned (≈ Amazon Pay); CO₂ saved shown
EXCHANGE → Trade-in Amazon Pay credit issued (₹100–₹500)
RECYCLE → Responsible recycler assigned; CO₂ impact shown
```

**The key differentiator shown in the demo:** A ₹500 running shoe at "Good" condition:
- Expected resale: ₹200
- Processing cost: ₹250
- Net resell: **−₹50**
- Decision: **Donate** (+ 24 green credits ≈ ₹48 Amazon Pay)
- Versus AirPods Pro at "Very Good" → **Resell at ₹12,500**

This contrast (the same platform correctly choosing NOT to relist a cheap item) is the core differentiator.

### Working Prototype

**Live App:** [Amplify URL — add before submission]

**Demo Video:** [Link — add before submission]

**Screenshots:** [Add 2-3 screenshots from the live app — landing page, intake flow with grading result + math, marketplace]

The end-to-end flow runs on real AWS Bedrock (Kimi K2 by Moonshot AI). Judges can upload any product photo and watch the full pipeline in real time.

---

## 3. Tech Architecture & Scaling

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (AWS Amplify CDN)                       │
│    Vite + React + Tailwind v3                                        │
│    Intake → Grade → Decide → Listing → Marketplace                  │
│    No business logic, no secrets, no direct AI calls                │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ /api/* (HTTPS + X-Request-Id)
┌───────────────────────────▼─────────────────────────────────────────┐
│                    BACKEND (Railway — auto-scaling)                 │
│    Express.js + Node.js                                              │
│    ├── /api/grade   → bedrock.js → gradeImage()                     │
│    ├── /api/decide  → disposition.js (deterministic, no AI)         │
│    ├── /api/listing → bedrock.js → generateListing()                │
│    ├── /api/marketplace → Supabase (CRUD)                           │
│    └── /api/dashboard  → Supabase aggregate queries                 │
│    Middleware: rate limiter (10 req/IP/min), correlation IDs        │
└──────────┬────────────────────────┬────────────────────────────────┘
           │                        │
┌──────────▼──────────┐  ┌──────────▼──────────────────────────────┐
│  AWS Bedrock        │  │  Supabase (PostgreSQL)                  │
│  Kimi K2            │  │  marketplace_listings table             │
│  (Moonshot AI)      │  │  processed_items table                  │
│  - gradeImage()     │  │  Supabase Storage (product images)      │
│  - generateListing()│  │  Real-time polling every 5s             │
│  AbortSignal 30s    │  │                                         │
└─────────────────────┘  └─────────────────────────────────────────┘
Fallback: Groq (Llama 4 Scout) — activated via AI_PROVIDER env var
```

**Critical design decision:** Perception and decision are strictly separated.
- **AI (Bedrock)** only perceives: condition, flaws, confidence.
- **Our code (disposition.js)** only decides: resell/refurbish/donate/exchange/recycle using value-vs-cost-vs-carbon math.
- This means every routing decision is auditable, reproducible, and never a "black box."

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Vite + React + Tailwind v3 + lucide-react | Near-zero build overhead; Tailwind v3 utility classes match Amazon brand exactly; no Redux/Next.js bloat |
| Backend | Node.js + Express | Minimal, fast API gateway; handles AWS credential management securely server-side; no secrets in browser |
| AI / Vision (primary) | AWS Bedrock — Kimi K2 (Moonshot AI) | Frontier multimodal model available on Bedrock Marketplace; serverless; strong vision + structured JSON output |
| AI / Vision (fallback) | Groq — Llama 4 Scout (17B) | Zero-latency fallback when Bedrock is unavailable; switched via AI_PROVIDER env var; no code change needed |
| Database | Supabase (PostgreSQL) | Real-time listings sync; row-level security; Supabase Storage for product images; no ORM overhead |
| Infra — Frontend | AWS Amplify | CDN-backed; auto-deploys on git push; VITE_ env vars baked at build time |
| Infra — Backend | Railway | Auto-scales on traffic; SIGTERM graceful shutdown; zero-config TLS |
| Rate Limiting | In-memory Map (no Redis dep) | Sliding-window per-IP limiter; 10 req/IP/min on AI routes; cleanup every 5 min via setInterval().unref() |

### Key Algorithms & Complexity

**1. Condition grading (O(1) per call, bounded by Bedrock latency ~3-8s)**
```
gradeImage(base64, mediaType, prompt) →
  AWS Bedrock OpenAI-compatible endpoint (Kimi K2 — Moonshot AI) →
  raw text response →
  Defensive parse: strip code fences → slice first { to last } → JSON.parse →
  Validate required fields: grade, confidence, observations →
  Return structured GradeResult

  Fallback path (if AI_PROVIDER=groq):
  Same prompt → Groq API (Llama 4 Scout) → same defensive parse chain
```
Novel: the prompt forces the model to return only one of 5 exact grade labels. If confidence < 50%, the system refuses to route and asks for a clearer photo — preventing incorrect decisions on ambiguous input. Provider switching requires zero code change — only an env var.

**2. Disposition engine (O(1), pure deterministic)**
```javascript
expectedResaleValue = originalPrice × resalePctByGrade[grade]  // 0.70 → 0 by grade
netResell = expectedResaleValue − processingCost               // per-category cost table
netRefurbish = expectedResaleValue − processingCost − refurbishCost
netCarbonSavedKg = carbonSavedKg − returnShippingCo2Kg        // net environmental math

Decision tree (in priority order):
1. grade === 'Not Sellable'                          → Recycle
2. netResell < 0 AND netRefurbish < 0
   AND grade === 'Acceptable'
   AND category in EXCHANGE_ELIGIBLE                 → Exchange (₹100+ Amazon Pay)
3. netResell < 0 AND netRefurbish < 0               → Donate (green credits)
4. canRefurbish AND netRefurbish > netResell         → Refurbish
5. default                                           → Resell
```
Per-category constants (processingCost, refurbishCost, carbonSavedKg, returnShippingCo2Kg) live in `server/data/categories.json` — tunable by Amazon ops without code changes.

**3. Listing generation (O(1) per call)**
Kimi K2 (via Bedrock) receives: product name, grade, confidence, observations, price. Returns a listing title + description that discloses flaws upfront ("Minor scuffs on toe cap — photographed and verified by Encore AI"). Customers see exactly what they're buying.

**4. Rate limiter (O(1) amortized)**
In-memory sliding-window Map: `IP → {count, resetAt}`. Cleanup runs every 5 minutes via `setInterval().unref()` (non-blocking). No Redis, no external dependency — works at single-node scale and can be replaced with ElastiCache for multi-node.

### Scaling Strategy

| Tier | Component | How it scales |
|---|---|---|
| AI | AWS Bedrock (Kimi K2) + Groq fallback | Bedrock scales to millions of invocations/day; per-request billing means zero idle cost. Groq fallback prevents downtime. |
| Frontend | AWS Amplify + CloudFront | Global CDN; static assets served from edge. <50ms TTFB worldwide. Auto-scales with zero config. |
| Backend | Railway (Node.js) | Horizontal auto-scaling on CPU. SIGTERM handler drains in-flight requests (10s window) before shutdown. |
| Database | Supabase (PostgreSQL) | Scales to 500M+ rows; connection pooling via PgBouncer. Can migrate to Amazon Aurora for enterprise workloads. |
| Rate Limiting | In-memory → ElastiCache | Current single-node Map replaces with Redis cluster for multi-instance deployments without code changes. |
| Images | Supabase Storage → S3 | Direct swap to Amazon S3 + CloudFront for enterprise; same public URL pattern. |
| Caching | Response cache for 4-5 demo items | Extends to full Redis response cache for popular items; reduces Bedrock calls ~60% at scale. |

**At 100x scale (Amazon production):**
- Bedrock (Kimi K2): no change — scales natively; or swap model ID via env var as better models arrive
- Backend: add 10 Railway replicas behind ALB; swap in-memory rate limiter for ElastiCache
- DB: migrate to Aurora Serverless v2 (auto-scales 0.5–128 ACU)
- Cost at 1M items/month: ~$2,800 Bedrock + ~$400 infra = $3,200/month, recovering ₹100+ Cr in value

---

## 4. Future Vision

### Where This Goes

**Year 1:** Encore becomes Amazon India's native return-processing layer. Every item a seller marks as "returned" is automatically submitted to the Encore API — no manual action required. The AI grades it, the engine routes it, and the seller sees the decision with the math in their Seller Central dashboard.

**Year 3:** Encore expands globally. Predictive return prevention launches — a risk model trained on Encore's grading data flags product listings with a high return-probability before purchase ("78% of buyers who returned this reported condition mismatch — see certified refurbished alternatives"). This closes the loop entirely: Encore prevents the return before it happens.

### Roadmap

| Horizon | Milestone | Impact |
|---|---|---|
| 0–3 months | Green credits redeemable on Amazon Pay; video grading (not just images); Seller Central API integration pilot | 10,000 sellers onboarded; ₹50 lakh in value recovered; 20 tons CO₂ prevented |
| 3–6 months | Bulk warehouse processing API (batch grade 1,000 items/day); Seller Trust Score; carbon savings dashboard with verifiable offsets | 50,000 items/month routed; 200 tons CO₂ prevented; ₹2 Cr value recovered |
| 6–12 months | Predictive return prevention at product detail page; Encore SDK for D2C brands; green credits convertible across Amazon ecosystem | 500,000 items/year routed; ₹100 Cr value recovered; 2,000 tons CO₂ prevented |

### Multi-Segment Expansion

**Phase 1 — Amazon ecosystem**
- Amazon Renewed: Encore grades and certifies items that feed the Renewed catalog automatically
- Amazon Warehouse: bulk disposition for warehouse returns at seller level
- Amazon Pay: green credits convert to Pay balance, creating circular retention

**Phase 2 — Marketplace expansion**
- White-label Encore API for Flipkart, Meesho, Snapdeal — the disposition engine as a SaaS product
- D2C brands (Boat, Noise, Puma India) embed Encore SDK in their own return portals

**Phase 3 — Beyond retail**
- Insurance & asset management: AI condition assessment for valuation of returned electronics
- Municipal recycling partnerships: Encore routes Not Sellable items directly to certified recyclers with CO₂ tracking
- B2B: corporate IT asset disposal (laptops, phones) routed through Encore for maximum value recovery

### Value Impact

| Metric | Conservative (Year 1) | Optimistic (Year 3) |
|---|---|---|
| Items routed | 500,000 | 50,000,000 |
| Value recovered | ₹100 Cr | ₹8,400 Cr |
| CO₂ prevented (tons) | 2,000 | 200,000 |
| Green credits issued | ₹5 Cr Amazon Pay | ₹420 Cr Amazon Pay |
| Sellers onboarded | 10,000 | 5,00,000 |
| Buyers on marketplace | 50,000 | 10,000,000 |

**Amazon's direct benefit:** Reducing return-to-landfill rate from ~40% to <5% positions Amazon India as the sustainability leader in Indian e-commerce — a critical ESG metric as SEBI mandates sustainability reporting for large companies from FY2024.

---

## Links

| | |
|---|---|
| GitHub | https://github.com/ashutosh8021/[repo-name] |
| Demo Video | [Add before submission] |
| Live App | [Amplify URL — add before submission] |

---

## Appendix — API Contracts

### POST /api/grade
**Request:**
```json
{
  "imageBase64": "<base64>",
  "mediaType": "image/jpeg",
  "name": "Nike Air Max 90",
  "price": 8000,
  "category": "Footwear"
}
```
**Response:**
```json
{
  "product": "Nike Air Max 90",
  "category": "Footwear",
  "grade": "Good",
  "confidence": 87,
  "observations": ["Sole worn at heel", "Minor scuffs on toe cap", "Laces intact"],
  "conditionReport": "Gently used running shoe with visible wear...",
  "co2SavedKgEstimate": 2.4
}
```

### POST /api/decide
**Request:** `{ "grade": "Good", "price": 500, "category": "Footwear", "confidence": 87 }`

**Response:**
```json
{
  "decision": "Donate",
  "expectedResaleValue": 200,
  "processingCost": 250,
  "netResell": -50,
  "greenCredits": 24,
  "exchangeCredits": 100,
  "netCarbonSavedKg": 1.9,
  "reason": "Relisting recovers ₹200 but costs ₹250 — a ₹50 loss, so donating is the better outcome."
}
```

### POST /api/listing
**Request:** `{ "product": "Nike Air Max 90", "grade": "Good", "observations": [...], "price": 500 }`

**Response:**
```json
{
  "title": "Nike Air Max 90 — Good Condition | Encore Verified",
  "description": "Gently worn Nike Air Max 90. AI-assessed condition: Good...",
  "conditionLabel": "Good",
  "suggestedPrice": 3200
}
```
