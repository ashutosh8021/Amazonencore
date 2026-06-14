# Architecture — Amazon Encore

Technical design. Read [`README.md`](./README.md) first for product context.

---

## 1. Guiding principle

**Perception and decision are separate.** The AI only *looks* at the product (grade, flaws, confidence). Our own deterministic code makes the *decision* (resell / refurbish / donate / recycle) with visible math. The LLM never makes the business decision. This is what keeps the system auditable, testable, and demoable.

---

## 2. System diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     React frontend (src/)                      │
│   Landing page · Intake flow · Marketplace · Report view       │
│   Presentation only — no secrets, no AI, no business logic     │
└────────────────────────────┬──────────────────────────────────┘
                             │ /api/*  (HTTPS, browser holds no keys)
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                Node + Express backend (server/)                │
│   Holds secrets · orchestrates · only layer that calls AI      │
│                                                                │
│   ┌──────────────┐   ┌─────────────────┐   ┌───────────────┐  │
│   │ /api/grade   │   │ /api/decide     │   │ /api/listing  │  │
│   │ → AI         │   │ → disposition   │   │ → AI          │  │
│   │ perception   │   │ engine (code)   │   │ listing gen   │  │
│   └──────┬───────┘   └────────┬────────┘   └───────┬───────┘  │
│          │                    │                    │          │
│          ▼                    ▼                    ▼          │
│   ┌─────────────────────┐  ┌──────────────────────────────┐  │
│   │ services/bedrock.js │  │ data/categories.json         │  │
│   │ AWS Bedrock (Claude)│  │ data/carbon-factors.json     │  │
│   └─────────────────────┘  └──────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Two brains, not one prompt:** AI perception (purple) answers "what is this and what shape is it in." The decision engine (our code) answers "what should we do with it." They never merge.

---

## 3. Request lifecycle (one return)

1. Browser sends the photo (+ optional price/category) to `POST /api/grade`.
2. Backend calls Bedrock → returns `{ grade, confidence, observations, conditionReport, co2SavedKgEstimate }`.
3. Backend sends `grade + price + category` to `POST /api/decide` → `disposition.js` returns `{ decision, math, greenCredits }`.
4. If decision is Resell/Refurbish → `POST /api/listing` → Bedrock writes the listing.
5. Frontend renders the condition report, the decision **with its visible math**, and the listing or the green-credit reward.

---

## 4. Tech stack

- **Frontend:** Vite + React + Tailwind v3 + `lucide-react` for icons. No UI library, no state library — React state + `fetch` only.
- **Backend:** Node + Express. `cors`, `dotenv`, `multer` (or base64 in JSON) for the image.
- **AI:** AWS Bedrock via `@aws-sdk/client-bedrock-runtime`, model = Claude (vision-capable). `BEDROCK_MODEL_ID` and region come from `.env`.
- **Storage:** in-memory for the prototype; SQLite only if the dashboard needs persistence. No Postgres/DynamoDB unless hours to spare.
- **Deploy:** frontend on AWS Amplify Hosting; backend on AWS App Runner; AI on Bedrock. (Fallback: Vercel + Render, keeping Bedrock — see section 9.)

---

## 5. Brand / styling tokens

| Token | Hex | Use |
|---|---|---|
| Navy | `#131921` | top nav, footer |
| Navy 2 | `#232F3E` | secondary nav, final CTA |
| Orange | `#FF9900` | primary accent, search button |
| Yellow | `#FFD814` | primary action buttons (dark text) |
| Link teal | `#007185` | links, product titles |
| Ink | `#0F1111` | body text |
| Gray | `#F3F3F3` | alternating section backgrounds |
| Border | `#D5D9D9` | card borders |
| Green | `#067D62` | verified / sustainability |

Font stack: `"Amazon Ember", -apple-system, "Segoe UI", Roboto, Arial, sans-serif`. Sentence case everywhere. No emojis. Rounded cards. White base, soft-gray sections.

---

## 6. File structure

```
amazon-encore/
├── README.md  ARCHITECTURE.md  CLAUDE.md
├── .env  .env.example  .gitignore
├── package.json  vite.config.js  tailwind.config.js  postcss.config.js  index.html
│
├── server/
│   ├── index.js                  express app, mounts routes
│   ├── routes/
│   │   ├── grade.js              POST /api/grade   → AI perception
│   │   ├── decide.js             POST /api/decide  → disposition engine
│   │   └── listing.js            POST /api/listing → AI listing gen
│   ├── services/
│   │   └── bedrock.js            AWS Bedrock client (grading + listing)
│   ├── lib/
│   │   ├── disposition.js        value vs cost vs carbon scoring (OUR code)
│   │   ├── pricing.js            resale-price suggestion
│   │   └── prompts.js            all prompt templates
│   └── data/
│       ├── categories.json       resale %, processing cost, refurbish cost
│       └── carbon-factors.json   kg CO2 per category (cite sources in comments)
│
├── src/
│   ├── main.jsx  App.jsx  index.css
│   ├── pages/
│   │   ├── Landing.jsx           the landing page
│   │   ├── Intake.jsx            Snap → Grade → Route → Reward
│   │   ├── Personas.jsx          Priya / Rahul / Seller, resolved live
│   │   └── Dashboard.jsx         aggregate value + CO2 (optional)
│   ├── components/
│   │   ├── TopNav.jsx  SubNav.jsx  Hero.jsx  HowItWorks.jsx
│   │   ├── PhotoDropzone.jsx  GradeCard.jsx  DecisionCard.jsx
│   │   ├── ListingPreview.jsx  StatTile.jsx  Footer.jsx
│   ├── hooks/
│   │   ├── useGrader.js          calls /api, manages loading/error
│   │   └── useImageUpload.js     drag-drop + base64
│   └── lib/
│       ├── api.js                fetch wrapper for /api/*
│       ├── constants.js          grade styles, decision metadata, tokens
│       └── formatters.js         ₹, kg, %
└── public/
```

---

## 7. Disposition engine — the most important code

Implement in `server/lib/disposition.js` as transparent code, **not** inside an LLM prompt, so the math is auditable on screen.

```
Inputs:  originalPrice (₹), grade, category, confidence

Lookups (from categories.json):
  resalePctByGrade = { "Like New":0.70, "Very Good":0.55, "Good":0.40,
                       "Acceptable":0.25, "Not Sellable":0 }
  processingCost   (per category — inspection + relist + storage, e.g. ₹150–400)
  refurbishCost    (per category)
  carbonSavedKg    (per category)

Compute:
  expectedResaleValue = originalPrice × resalePctByGrade[grade]
  netResell    = expectedResaleValue − processingCost
  netRefurbish = expectedResaleValue − processingCost − refurbishCost  (only if grade in {Good, Acceptable})

Decide:
  if grade == "Not Sellable":                         → Recycle
  elif netResell < 0 AND netRefurbish < 0:            → Donate (or Recycle if non-functional)
  elif netRefurbish > netResell AND grade in {Good,Acceptable}: → Refurbish
  else:                                                → Resell

  greenCredits = round(carbonSavedKg × 10)

Return: { decision, expectedResaleValue, processingCost, netResell, greenCredits }
```

Priya's ₹500 shoe: `0.40 × 500 − 250 = −50` → **Donate**. Render this calculation in the decision card. Calibrate constants with plausible, citable numbers — they must be reasonable and explainable, not perfect.

---

## 8. Prompt design + API contracts

All prompts live in `server/lib/prompts.js`. Always instruct: *"Output strictly valid JSON only, no markdown, no commentary."* Parse defensively — strip ` ```json ` fences, slice between first `{` and last `}`, wrap in try/catch.

**`POST /api/grade`** — body: `{ imageBase64, mediaType, name?, price?, category? }` → returns:
```json
{ "product": "...", "category": "...",
  "grade": "Like New|Very Good|Good|Acceptable|Not Sellable",
  "confidence": 0-100, "observations": ["scuff on heel", "box intact"],
  "conditionReport": "one sentence", "co2SavedKgEstimate": 2.4 }
```

**`POST /api/decide`** — body: `{ grade, price, category, confidence }` → returns:
```json
{ "decision": "Resell|Refurbish|Donate|Recycle",
  "expectedResaleValue": 200, "processingCost": 250, "netResell": -50,
  "greenCredits": 24, "reason": "human-readable summary" }
```

**`POST /api/listing`** — body: `{ product, grade, observations, price }` → returns:
```json
{ "title": "...", "description": "≤30 words, condition-accurate, names real flaws",
  "conditionLabel": "Very Good", "suggestedPrice": 200 }
```

The listing description must mention the actual observed flaws — that honesty is the trust signal.

---

## 9. AWS deployment

**Bedrock (the part judges care about):** in the AWS console, Bedrock → Model access → request the Claude (Anthropic) models. Do this FIRST; approval can take time. Use a region that has them (`us-east-1` is safe). Bedrock calls cost fractions of a cent — the $100 credit is ample.

**Frontend → AWS Amplify Hosting:** connect the GitHub repo, build command `npm run build`, output dir `dist`. Auto-deploys on push.

**Backend → AWS App Runner:** point it at the repo/container; it runs the Express server with HTTPS and scaling, minimal config.

**The pitch line:** *"Frontend on Amplify, backend on App Runner, AI on Bedrock — fully on Amazon's stack."*

**Fallback if AWS hosting fights you near the deadline:** deploy frontend on Vercel and backend on Render (one-click from GitHub), but keep **Bedrock** for the AI. Hosting platform is invisible in a demo; the Bedrock integration is the substance — never sink the submission over where static files live.

**Cost guardrail:** the $100 credit easily covers a hackathon. Amplify + App Runner on light traffic is a few dollars; Bedrock is usage-based and tiny per call. Tear down App Runner after the finale to stop charges.

---

## 10. Environment variables (`.env`, never commit)

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=        # exact ID of the Claude model enabled in your region
PORT=3001
```

Frontend never reads these. Commit `.env.example` with empty values; add `.env` to `.gitignore`.
