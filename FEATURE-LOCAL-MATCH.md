# FEATURE — Encore Campus (location-aware marketplace)

> Read this before building. Follows CLAUDE.md: **AI perceives, code decides.**
> IMPORTANT: location is NOT part of the disposition decision. The engine decides an
> item's fate (Resell / Refurbish / Donate / Recycle) on condition + economics only.
> Location lives entirely in the MARKETPLACE layer.

---

## The idea in one line

Make the resale marketplace location-aware. Every resold item is tagged with where it
is; nearby people automatically see nearby listings in a "Campus / Near you" feed. No one
registers demand, no matching runs in the decision. If a neighbour buys it, fulfilment is
a local hand-to-hand / on-campus-locker handoff — instant, no warehouse, near-zero carbon.
If no neighbour buys it, it stays listed in the wider marketplace. It cannot break.

## Why this design (read carefully — this corrects an earlier idea)

An earlier version tried to make "Local Match" a branch in the disposition engine that
depended on a pre-registered local buyer. That is fragile: at the moment of a return there
usually is no specific local buyer, and nobody manually registers wants. So that approach
is wrong and is NOT what we build.

Correct design: demand is discovered passively by browsing, not matched at decision time.
A nearby buyer simply *sees* the nearby listing in their feed and buys it if they want it —
exactly like any marketplace, just filtered by location. This removes the cold-start
problem and the fragility entirely.

## Architecture (where each piece lives)

1. **Disposition engine (disposition.js)** — UNCHANGED. Decides Resell / Refurbish /
   Donate / Recycle on condition + value-vs-cost-vs-carbon. Knows nothing about location.
2. **Listing** — when the decision is Resell (or Refurbish), the generated listing is
   tagged with a `location` (campus / pincode). For the demo, default "IIT Patna".
3. **Marketplace (location-aware)** — a "Campus / Near you" tab filters listings to the
   user's location and shows them first. Local listings carry a "Local handoff" badge and
   the savings framing (instant, zero return miles).
4. **Fulfilment** — buying a nearby listing = local handoff (on-campus locker /
   hand-to-hand). Buying a distant listing = normal shipping. This is the only place the
   logistics win happens, and it happens organically.

## Graceful degradation (the whole point)

- Nearby buyer exists → bought locally → best case (instant, cheap, green).
- No nearby buyer → listing simply stays in the broader marketplace → normal resale.
- The system is never worse than today, and sometimes dramatically better. Nothing depends
  on a match existing.

## Amazon stays in control (reflect in copy, not heavy code)

Amazon sets the open-box discount price, the standard buyer guarantee applies, and the
condition report is AI-verified. That trust layer is what separates this from classifieds
like OLX — same location convenience, but verified condition and Amazon protection.

## The three-way win (must be visible on local listings)

- **Seller / returner:** faster, higher recovery (no reverse-logistics deduction)
- **Nearby buyer:** the item at a discount, with a verified condition report
- **Amazon:** zero reverse-logistics cost, near-zero carbon on locally-fulfilled items

## How this maps to the personas

This is Rahul's case solved structurally: a working item with nearby demand, but no trusted
bridge. The location-aware marketplace + Amazon's trust layer IS the bridge — no strangers,
no haggling, no shipping.

## Demo path (must work end to end)

- A "Campus — IIT Patna" tab shows several seeded nearby Encore listings with "Local
  handoff" badges.
- Process a return → engine decides Resell → the new listing is tagged location "IIT Patna"
  and AUTOMATICALLY appears in the Campus tab (no matching step).
- The listing shows the local-handoff badge + the three-way-win framing.

## Boundaries for the prototype

- Simulated only — no real geolocation, identity, payments, or locker integration. Use a
  fixed demo location ("IIT Patna") and seed listings.
- Do NOT add location logic to disposition.js. It is a marketplace-layer concern only.
- Keep all existing outcomes (Resell/Refurbish/Donate/Recycle) and AI grading unchanged.

## Future (roadmap, not the prototype)

Real geolocation / campus detection by college email; on-campus Amazon Hub lockers; expand
location granularity (pincode, neighbourhood, apartment complex, office campus); roll out
location-by-location like a network product.
