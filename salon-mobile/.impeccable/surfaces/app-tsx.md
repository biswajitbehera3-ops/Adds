---
version: 1
slug: "app-tsx"
primary_target: "App.tsx"
related_targets: []
---

## Scope

The whole phone app: Home hub, Counter, Customers (+ profile), Reminders, Refer & Earn, Owner Dashboard.
Visitor mode: Operate. Users: counter staff mid-shift in bright light; the owner checking money.

## Direction contract

THESIS: A salon's customer memory set as Indian grooming packaging — every customer is a sealed label with a balance — refusing the default fintech grid of grey cards with one accent.

OWN-WORLD: Chocolate (#2A1710) drenched shell; cream label paper (#F3E8D6) inside fine double-rule frames in chocolate ink; burnt-orange (#B9531C) wax seal reserved for money and the one primary action. Rozha One for names and amounts, Hind for everything operable. Authored line icons, 1.75 stroke.

STORY: Staff see the hub, tap Counter, key ten digits, instantly see new or returning, pick service and stylist, log; the receipt is stamped. The owner reads today's money and who earned it at a glance.

FIRST VIEWPORT: Chocolate ground; greeting and date top-left; a full-width cream Counter label with its orange seal; below, a two-column row of labels: Today's takings (rolling ₹) and Due reminders; then Customers, Refer & Earn, Dashboard labels. Primary action = Counter label, thumb-reachable.

FORM: Grooming-tin label, candidate 3 of 7 (chai & kulhad, teak & brass chair, grooming-tin label, shop signboard, mehndi linework, mithai box, cinema poster). Seed e9d5d924 (degraded roll). Signature: the seal travels — card morphs into screen (container transform), seal stamps the receipt.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

Counter walk-in under 15 seconds; keypad and taps instant. Reduce-motion respected. Business rules shared with ../salon-app, unchanged.

## Unresolved

App name/logo (placeholder "Salon"); dashboard PIN; real rule values.
