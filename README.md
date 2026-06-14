# Amazon Encore

> AI-powered recommerce platform that gives returned and unused products a meaningful second life.
> Built for **HackOn with Amazon Season 6.0** — theme: *Second Life Commerce — AI-Powered Returns & Sustainable Resale.*

This file explains **what** we're building and **why**. For the technical design see [`ARCHITECTURE.md`](./ARCHITECTURE.md). For how Claude Code should build it (rules + phased plan) see [`CLAUDE.md`](./CLAUDE.md).

---

## 1. The problem (verbatim from Amazon)

> Millions of products bought online are returned, underused, or discarded despite being perfectly usable. Returns are expensive for customers, sellers, and the planet. Customers also struggle to trust refurbished or second-hand products.
>
> What if Amazon could create an intelligent ecosystem where returned or unused products automatically find their next best owner?
>
> Imagine: AI deciding whether an item should be resold, refurbished, donated, recycled, or exchanged · smart quality grading through image/video analysis · personalized recommendations for certified refurbished products · sustainable incentives and "green credits" · easy peer-to-peer resale inside Amazon's trusted ecosystem · predictive return prevention before a purchase is even made.

Amazon's own kickoff framing of the gap: **"Millions of products. No intelligent bridge. The system works for premium. For the long tail — it breaks."** Illustrated with three personas (see section 6).

---

## 2. Our thesis (this is what wins)

Amazon **already** has the marketplace, the warehouses, and a returns program (FBA Grade and Resell, Amazon Renewed, Amazon Warehouse, Amazon Outlet, FBA Donations via Good360). Today, when a return arrives, a **human manually inspects it**, assigns one of four conditions, and decides what happens to it. That manual decision is slow, costs ₹800–5,000+ per return in labor and reverse logistics, and happens millions of times.

**We are not building another marketplace.** Building one would duplicate what Amazon runs and signal we didn't do our homework.

**We are building the AI intelligence layer that automates the decision** — the "intelligent bridge" Amazon's slide says is missing. The instant a return arrives: grade condition from a photo, weigh recovered value vs. processing cost vs. carbon, pick the best disposition (resell / refurbish / donate / recycle), and — only if resale wins — auto-generate the used-condition listing.

**The single insight to internalize:** for a low-value item like a ₹500 shoe, the *correct* AI decision is often **NOT to resell**, because inspection + relisting costs more than it recovers. *That judgment is the product.* Most teams will build "AI grades item, AI lists item." We build "AI decides whether listing it is even worth it." That reframe directly answers the "long tail breaks" line.

---

## 3. The product

**Tagline:** *Every product deserves another chance.*

**Core loop — Snap → Grade → Route → Reward:**

1. **Snap** — a photo of the returned/unused item (customer, warehouse associate, or seller).
2. **Grade** — vision AI produces an explainable condition report and assigns Amazon's actual four-tier grade (Like New / Very Good / Good / Acceptable), plus a fifth "Not Sellable" outcome, with a confidence score.
3. **Route** — a deterministic decision engine picks the optimal fate by transparently scoring value vs. cost vs. carbon. The math is shown on screen.
4. **Reward** — the customer earns quantified green credits; if resale is chosen, an LLM auto-writes the condition-accurate listing.

Use Amazon's exact four-grade taxonomy — judges notice the homework.

---

## 4. Research and numbers (cite these in the pitch)

**Global returns problem**
- US retail returns ~$890B in 2024; ~$849.9B in 2025 (~15.8% of sales).
- Online return rate ~19–20% of orders.
- Per-return processing cost: $10–65.
- ~9.5 billion pounds of returned goods reach US landfills annually.

**India context (judges care most)**
- India e-commerce: $125B (2024) → projected $345B (2030).
- Fashion/apparel return rates: **25–40%**.
- COD orders have far higher return-to-origin rates (no financial commitment to refuse).
- Reverse logistics can cost up to 1.5× the original delivery.
- **67% of customers avoid a brand after a poor return experience** — the Customer Obsession headline.

**Recommerce demand exists**
- Global recommerce ~$89B in 2025, growing ~11%/yr.
- 93% of US consumers bought secondhand in the last year.
- ~68% prefer pre-owned where available; ~57% actively compare refurbished vs. new.
- The bottleneck is **trust in condition** — exactly what explainable AI grading solves.

**What Amazon already runs (so we don't reinvent it)**
- FBA Grade and Resell — manual inspection, four condition grades, electronics powered on/tested/reset.
- Amazon Renewed / Warehouse / Outlet — existing recommerce surfaces.
- FBA Donations + Good360 — 67M+ products redirected to charities.

---

## 5. Why this wins (judging lens)

The finale panel spans AWS, Amazon Pay, Amazon Devices. They judge on Customer Obsession, real pain solved, Leadership Principles fit, feasibility in 48h, a polished end-to-end demo (not sprawl), innovation, scalability, storytelling, and competitive advantage.

Our edge: high business relevance (a real Amazon cost center), a memorable reframe (decide, don't just list), a live demo on a real object, and the long-tail insight no other team will lead with. We deliver **one polished loop deeply** plus supporting evidence — never six shallow features.

---

## 6. The three personas (resolve all three live in the demo)

From Amazon's kickoff slide:

- **Priya** — returns a ₹500 shoe; 600km back to warehouse; costs more to relist than it's worth; today it's written off. → Encore routes to **Donate**, math shown. This is the headline moment.
- **Rahul** — baby monitor works perfectly; won't list on classifieds; 50 nearby parents want it. → trusted peer-to-peer resale with an AI trust report.
- **Small Seller** — 200 returns/month, manually inspects and re-photographs each. → batch view; AI grades and lists in seconds.

---

## 7. The win condition

If a judge remembers one thing tomorrow, make it this:

> *"The team that showed an AI deciding NOT to resell a ₹500 shoe — and explaining why, in money and carbon, on screen — was Amazon Encore."*

Everything else is supporting evidence.
