# CLAUDE.md — Operating instructions for Claude Code

This is the build contract for **Amazon Encore**. Read [`README.md`](./README.md) for product context and [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the technical design before writing code. This file governs *how* you build and *in what order*.

---

## Hard rules (never violate)

1. **Frontend is presentation only.** Nothing under `src/` may hold an API key, AWS credential, model ID, or any business logic. No resell/donate math in React. The frontend only calls our own `/api/*` endpoints and renders results.
2. **Backend is the only thing that holds secrets and the only thing that talks to the AI.** All AI calls go through `server/`. Secrets come from `.env`.
3. **Perception and decision are separate.** The AI (`server/services/bedrock.js`) only grades the item — condition, flaws, confidence. The decision (resell/refurbish/donate/recycle) is made by our own deterministic code in `server/lib/disposition.js` using value-vs-cost-vs-carbon math. **The AI never makes the business decision.**
4. **Never commit `.env`.** Add it to `.gitignore` in Phase 0.
5. **No new dependencies without reason.** The stack is Vite + React + Tailwind v3 + lucide-react + Express + the AWS Bedrock SDK. Do not add Redux, Next.js, shadcn, Prisma, Framer Motion, etc.
6. **Build one phase at a time.** Confirm each phase runs before starting the next. Do not scaffold the whole tree at once — that is how this project broke before.
7. **When a Bedrock call fails, surface the real AWS error.** Never swallow it in a generic catch.

---

## Style rules

- Tailwind v3 utility classes for layout; inline `style` for the exact Amazon brand hex values in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §5 (Tailwind has no JIT here for arbitrary colors).
- Amazon look: navy `#131921` top nav with a centered search bar, secondary nav `#232F3E`, orange `#FF9900` accent, yellow `#FFD814` action buttons with dark text, teal `#007185` links, white background, soft-gray `#F3F3F3` alternating sections, rounded cards, card borders `#D5D9D9`.
- Copy is customer-facing and reassuring, sentence case, **no emojis**. Icons come from `lucide-react`.
- Responsive: works on mobile (stack columns) and desktop.

---

## Build plan — follow in order

### Phase 0 — Setup
Confirm the Vite + React scaffold runs. Install `lucide-react` and Tailwind v3 (`tailwindcss postcss autoprefixer`), init Tailwind, set `content` to `./index.html` and `./src/**/*.{js,jsx}`, put the three `@tailwind` directives in `src/index.css`. Create `.gitignore` (include `.env`, `node_modules`, `dist`) and `.env.example`. Confirm `npm run dev` shows a blank styled page.

### Phase 1 — Landing page (frontend only, mock everything)
Build the full landing page in `src/`:
- `TopNav` — navy bar, "amazon encore" wordmark (encore in orange), centered search bar with an orange search button, "Deliver to India", nav links (How it works / Marketplace / Impact), a yellow "Get started" button.
- `SubNav` — `#232F3E` strip of quick links.
- `Hero` — soft-gray section, headline "Every product deserves another chance", customer-facing subheading, a "Product → AI analysis → New owner" flow graphic, primary yellow "Sell a product" button + secondary "Explore Encore deals", reassurance chips (free to list / instant AI offer / no haggling).
- `HowItWorks` — three rounded cards: Upload your product, AI assessment, Second-life decision.
- "See the AI decide" — TWO contrasting cards: AirPods Pro → **Resell** (₹12,500), and a ₹500 running shoe → **Donate** with the reasoning that relisting costs more than it recovers and the customer still earns green credits. This contrast is the differentiator — do not cut it.
- `Impact` — four stat cards (12K+ rescued, 48 tons waste prevented, ₹1.8 Cr recovered, 96% matches), with a note that numbers tie to real items.
- `Marketplace` — three product cards with an "Encore Verified" badge, condition score, price + struck-through original, "View details" button.
- `Trust` — four reasons (AI-verified listings, honest condition reports, secure transactions, sustainable by default) + a "Powered by Amazon Bedrock" line.
- `FinalCTA` — navy section, "Ready to give your product a second life?".
- `Footer` — wordmark, Company links (About/Privacy/Terms/Contact), a "Coming soon" roadmap of chips (AI pricing engine, instant buyback, green credits, product verification, carbon savings dashboard, seller trust score).

**Stop. Show me the landing page running before Phase 2.**

### Phase 2 — Backend skeleton (mock responses)
Create `server/` with Express, `cors`, `dotenv`. Add `POST /api/grade`, `/api/decide`, `/api/listing` returning hardcoded mock JSON matching the contracts in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §8. Add a `vite.config.js` proxy so `/api` → `http://localhost:3001` in dev. Add an `npm run server` script. Confirm the frontend can call `/api/grade` and log a mock response.

### Phase 3 — Decision engine (our code, not the AI)
Implement `server/lib/disposition.js` exactly per [`ARCHITECTURE.md`](./ARCHITECTURE.md) §7. Put constants in `server/data/categories.json` and `carbon-factors.json`. Write a quick unit test (or a script) proving the ₹500 shoe at "Good" returns **Donate** with `netResell = -50`. Wire `/api/decide` to it.

### Phase 4 — Bedrock (real AI)
Implement `server/services/bedrock.js` with `@aws-sdk/client-bedrock-runtime`. `gradeImage()` sends the base64 image + prompt, returns strict JSON (parse defensively — strip code fences, slice first `{` to last `}`, try/catch). `generateListing()` writes the condition-accurate listing. Wire `/api/grade` and `/api/listing` to Bedrock. Keep `/api/decide` on `disposition.js`. Read `BEDROCK_MODEL_ID`/region from `.env`. On failure, return the real AWS error message.

### Phase 5 — Real intake flow
Make the landing page "Sell a product" button open `Intake.jsx`: photo upload (drag-drop + base64) + optional price/category → call grade → decide → listing → render the condition report, the decision **with its visible math** (show `expectedResaleValue − processingCost = netResell`), and either the generated listing or the green-credit reward + "we chose not to relist, here's why".

### Phase 6 — Supporting evidence (only if Phases 1–5 are solid)
`Personas.jsx` — three pre-loaded scenarios (Priya, Rahul, Small Seller) each run through the real engine. Then optionally `Dashboard.jsx` — running totals of value recovered + kg CO2 saved.

### Phase 7 — Deploy
Per [`ARCHITECTURE.md`](./ARCHITECTURE.md) §9: frontend on Amplify, backend on App Runner, AI on Bedrock. **Deploy Phases 1–2 early with mocks** to prove the pipe end-to-end, then ship the real version. Cache responses for 4–5 curated demo items as a live-demo fallback.

---

## Definition of done for the demo

A judge can: open the live landing page, click "Sell a product", upload a photo of a real worn item, and watch Encore grade it, show the value-vs-cost-vs-carbon math, make the routing call (including choosing NOT to resell a cheap item), and either generate a listing or award green credits — all running on Bedrock. Then we click through the three personas. Five minutes, customer-first story, metrics, close on Think Big.

When in doubt, prioritize: **one polished end-to-end loop > many half-built features.**
