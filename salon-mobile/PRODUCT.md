# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

One Expo / React Native codebase running on iOS and Android phones, plus a web build used as the
shareable test link. One custom brand language across platforms, honouring each OS's native affordances
(safe areas, back gesture, haptics, system text scaling).

## Stack

Expo SDK 57 (React Native 0.86, React 19), TypeScript, Reanimated 4 for motion, AsyncStorage for on-device
data. Chosen by the user: React Native + Expo, data on the device, phone-first, web link for testing.

## Users

- **Counter staff** at a single local Indian salon, using their phone between customers, often mid-task,
  in bright shop lighting, with zero training. Job: log a walk-in in well under 15 seconds.
- **The salon owner**, checking the day's money, who earns what, best customers, and wallet liability.

## Product Purpose

Gives a single salon the customer memory it has never had: who its regulars are, how to bring back
customers who drift, an upsell prompt at checkout, a referral engine, and owner visibility into revenue
by stylist/chair. Success: walk-ins logged in under 15 seconds, lapsed customers reminded and returning,
referrals turning into paid first visits.

## Positioning

A salon's own loyalty wallet and win-back system that lives on the salon's own phone — no server, no
subscription platform in between. Each salon gets its own app, configured to its services and prices.

## Operating Context

- Home hub of cards is the entry point (user choice); Counter is the primary card.
- Five areas: Counter, Customers, Reminders, Refer & Earn, Owner Dashboard.
- Reminders go out over WhatsApp; demo mode simulates and logs the send until provider credentials exist.
- Data is on-device per salon (one device per salon for the MVP).

## Capabilities and Constraints

- **Counter:** phone in → instantly new vs returning; log service + add-ons + staff/chair; optionally pay
  from wallet; top up wallet from the same place; add-on upsell suggestions at checkout.
- **Wallet:** top-up earns a bonus tiered by deposit size. Wallet can never go negative.
- **Referral:** both referrer and new customer get wallet credit, awarded automatically on the referred
  customer's **first paid visit** — never at sign-up.
- **Reminders:** overdue computed **per service**, each service with its own cycle; editable message;
  one-tap WhatsApp send.
- **Dashboard:** today's revenue split by cash/UPI/card vs wallet; revenue by staff/chair; top 20 customers
  by lifetime spend; total wallet liability.
- Business rules are shared with `../salon-app` (the Next.js backend) and must not change in a redesign.
- **Undecided:** app name and branding (use neutral placeholder "Salon"); business/legal name; grievance
  officer; governing city; wallet expiry/closure policy; whether the owner dashboard needs a PIN.
- Placeholder rule values (bonus tiers 5/10/15% at ₹1000/2000/5000, referral ₹100 + ₹100, service cycles)
  are defaults, not confirmed.

## Brand Commitments

- Palette pinned by the user: **chocolate brown, burnt orange, cream**.
- Must feel high-end with rich, beautiful motion — explicitly not an ordinary app.
- Transitions: **shared-element morph** — elements travel and transform between screens.
- No final name or logo yet; placeholder branding only.

## Evidence on Hand

No real customer data, testimonials, photography, or logo. Demo data is synthetic and labelled as such.
Do not fabricate reviews, salon names, or statistics.

## Product Principles

1. The Counter's speed beats everything — no motion or ornament may slow a walk-in past 15 seconds.
2. Money is shown exactly and honestly: every rupee in a wallet is traceable to a transaction.
3. Rewards follow real visits, never sign-ups.
4. Customer data is sensitive by default (DPDP Act); collect nothing without a stated purpose, and
   record consent.
5. Luxury lives in restraint and precision — rich material, deliberate motion, nothing gratuitous.

## Accessibility & Inclusion

Bright-light legibility (strong contrast on cream), large touch targets for quick one-handed use,
respect system text scaling and reduce-motion settings. English UI for the MVP.
