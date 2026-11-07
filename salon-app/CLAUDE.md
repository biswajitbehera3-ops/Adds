# Salon App — Project Brief for Claude Code

This file is project memory. Read it in full before touching any code. It describes what the app needs to
do and why — not how it currently looks. The frontend design is intentionally open: don't assume or carry
forward any prior visual direction. Your job is to use the design skills below to decide the look and feel
from these ideas, then build the frontend to match.

## Who you are on this project

Work this codebase the way a senior full-stack product engineer with real shipping experience would —
someone who has built and maintained production apps for small businesses for years, not someone writing a
one-off demo. Concretely, that means:

- Prefer the considered, correct solution over the clever one. This is a counter app a salon staff member
  uses between customers — every screen has to survive bad lighting, a shared tablet, and zero training.
- Never guess at behavior you can verify. Run the dev server, hit the API routes, read the actual Prisma
  schema — don't assume.
- Don't touch the business logic described below without a reason tied to an actual request. The wallet
  math, the referral-reward timing, and the per-service reminder cycles are correct and already relied on —
  a frontend redesign should present them faithfully, not change when or how they fire.
- Treat customer data (name, phone, spend, wallet balance) as sensitive by default — this app exists partly
  to be DPDP Act–ready ahead of its 2027 enforcement deadline. Don't add new data collection without a
  stated purpose.
- Favor small, verifiable steps. After any UI change, actually look at the result (screenshot or run it)
  before calling it done.

## What this project is — the ideas, not a prescribed look

A single-salon pilot app built around five screens that fix a specific, real problem: a salon with no record
of who its regular customers are, no way to bring back a customer who drifts to another salon, no upsell
prompt at checkout, no referral mechanism, and an owner with zero visibility into which chair/stylist earns
what.

The five screens, and the idea behind each — treat these as requirements, not layout instructions:

1. **Counter** — the screen staff use all day, between every single customer. Phone number in, the app
   should make it immediately obvious whether this is a new or returning customer, then let staff log the
   service + add-ons + staff/chair, optionally paying from wallet, and top up a wallet from the same place.
   The non-negotiable constraint: a walk-in should be loggable in well under 15 seconds. Whatever the new
   design looks like, it must not add friction here — this screen's speed matters more than how it looks.
2. **Customers** — a searchable directory; each customer's profile needs to surface their wallet balance,
   full visit history, wallet transaction history, referral code, and when they're next due for a reminder.
3. **Reminders** — a list of customers overdue for a repeat visit, computed **per service** (a haircut has a
   shorter natural cycle than a hair color, for example — see the business rules below), with an editable
   message and a one-tap way to send it over WhatsApp.
4. **Refer & Earn** — a way to look up a customer, get their referral code, and a ready-to-share link. Both
   the referrer and the new customer get wallet credit, awarded automatically the moment the referred
   friend's **first paid visit** is logged — deliberately not at sign-up, to prevent free-credit abuse with
   no real visit behind it.
5. **Owner Dashboard** — the view the owner has never had: today's revenue split by cash vs wallet, revenue
   by staff/chair, the top 20 customers by lifetime spend, and total wallet liability (money sitting in the
   shop as future visits).

The wallet top-up bonus (a deposit earns a bonus credited to the balance, tiered by deposit size) and the
add-on upsell prompts during checkout are real business rules, not sample data — whatever the new design
looks like, it needs to represent these faithfully.

## Current status (read this first)

- **Built fresh in this folder** (`Adds/salon-app/`) — there was no earlier codebase. The backend described
  below now exists here and is covered by tests (`npm test`), so the "keep as-is" rules apply to it from now on.
- **One deployment per salon.** Each salon gets its own copy of this app with its own SQLite database and its own
  `salon.config.ts` (display name, services + prices + reminder cycles, add-ons + upsell mapping, staff/chairs,
  top-up bonus tiers, referral reward amounts, reminder message). Nothing salon-specific is hard-coded elsewhere.
- **Business-rule numbers in `salon.config.ts` are placeholder defaults**, not confirmed rules — top-up bonus
  5% / 10% / 15% at ₹1000 / ₹2000 / ₹5000, referral ₹100 + ₹100, cycles haircut 30d, beard 14d, colour 45d,
  facial 30d, hair spa 60d. Set real values per salon before go-live.
- **Frontend not built yet.** `src/app/page.tsx` is a placeholder. Phase 1 skill installs were blocked in the
  first session (Impeccable's bundle download returned 403; the other installs need the user's permission) —
  see Phase 1 below.
- **ECC: skipped** by default — only install it if the user asks for it.
- **No auth yet.** Every route is open, including the Owner Dashboard. Before any real salon uses this, decide on
  at least an owner PIN for the dashboard (open decision — flag it, don't invent it).

### Where the logic lives

| Rule | File |
|---|---|
| Phone normalisation, top-up bonus, pricing, upsells, due dates, IST day | `src/lib/rules.ts` (pure) |
| Customer create/lookup/search/profile, referral codes & links | `src/lib/customers.ts` |
| Top-up with bonus | `src/lib/wallet.ts` |
| Log visit, wallet spend, referral reward on first paid visit | `src/lib/visits.ts` |
| Per-service overdue reminders, send + log | `src/lib/reminders.ts` |
| WhatsApp demo mode / real send | `src/lib/whatsapp.ts` |
| Owner dashboard aggregates | `src/lib/dashboard.ts` |

API: `GET /api/config`, `GET|POST /api/customers`, `GET /api/customers/lookup?phone=`, `GET /api/customers/:id`,
`POST /api/visits`, `POST /api/wallet/topup`, `GET /api/reminders`, `POST /api/reminders/send`,
`GET /api/dashboard?range=today|7d|30d`.

## Backend & business logic — correct, keep as-is

This is about logic, not visual design — it exists so a frontend rebuild doesn't accidentally change *when*
or *how* something happens while changing how it *looks*:

- Wallet top-up bonus math, referral-reward timing (on first visit, not sign-up), and per-service reminder
  cycle calculations are implemented and verified end-to-end. A redesign should call the same underlying
  logic/API routes, not reimplement these rules in the frontend.
- WhatsApp reminders support a "demo mode" (simulated send, logged) that automatically switches to real
  sending once provider credentials are configured — no code change required for that switch. Preserve this
  behavior.
- Backend stack: Next.js (App Router, TypeScript) API routes + Prisma/SQLite. Don't upgrade the Next.js major
  version as a side effect of a frontend task — it's tracked separately as a pre-public-launch item due to a
  breaking API change in newer versions.

## Open decisions — don't invent answers, flag them

- **App name and branding** — not finalized. Use neutral placeholder branding in the new design rather than
  guessing a final name or logo.
- **Business/legal name, grievance officer, governing city, wallet expiry/closure policy** — all still TBD,
  unrelated to frontend work but worth knowing if copy/legal text appears anywhere in the UI (e.g. a footer).

## Task for this session: design and build the frontend from scratch

Nothing about the current frontend's look should carry forward. Use the ideas above as the requirements, and
the skills below to arrive at an actual design direction, then build it.

### Phase 1 — install the design skills

Install these, in this order, and verify each one actually installed (check the target folder exists, e.g.
`~/.claude/skills/<name>/`) before moving to the next:

1. **Impeccable** — `npx impeccable install --providers=claude --scope=project`, then run `/impeccable init`.
   (github.com/pbakaus/impeccable)
2. **huashu-design** — `npx skills add alchaincyf/huashu-design`. If the installed folder is missing
   `references/`, `assets/`, `scripts/`, `demos/` subfolders, reinstall with `npx skills@latest add
   alchaincyf/huashu-design`. (github.com/alchaincyf/huashu-design)
3. **ui-ux-pro-max-skill** — use `nextlevelbuilder/ui-ux-pro-max-skill`, **not** any other repo with a similar
   name (there's an unrelated near-empty clone under a different username — don't use it). Install via
   `npm install -g ui-ux-pro-max-cli && uipro init --ai claude`, or the plugin marketplace:
   `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` then
   `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`. (github.com/nextlevelbuilder/ui-ux-pro-max-skill)
4. **taste-skill** — `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"`.
   (github.com/Leonxlnx/taste-skill)
5. **design-motion-principles** — `npx skills add kylezantos/design-motion-principles`.
   (github.com/kylezantos/design-motion-principles)
6. **Everything Claude Code (ECC)** — this one is a much bigger harness than the other five (68 agents, ~286
   skills, hooks, rules, a security scanner), not just a design skill. Install only from
   `github.com/affaan-m/ECC` (the canonical repo — many same-named forks exist under other usernames; ignore
   those). Install via `/plugin marketplace add https://github.com/affaan-m/ECC` then
   `/plugin install ecc@ecc`. **Before installing, confirm with the person running this session that they
   actually want the full harness** — for this project, only its design/review-related skills and agents are
   relevant; the rest (TDD workflows, Go-specific rules, the AgentShield scanner, etc.) can be skipped rather
   than fully adopted.

### Phase 2 — use the skills to decide the design, then build it

1. Use ui-ux-pro-max's design-system generator against the actual brief: "a loyalty/CRM counter app for a
   local Indian salon, used on a shared tablet, by non-technical staff, in bright shop lighting." Let it
   propose the color palette, type pairing, and spacing system — this is the design direction, decided fresh,
   not an evolution of anything that existed before.
2. Run that proposed direction through taste-skill and Impeccable's critique/audit commands before building
   anything, to catch generic "AI-app" defaults early — cheaper to fix a described direction than a built one.
3. Build the five screens from the ideas above against that design system. Use huashu-design where an
   interactive prototype pass helps before committing to final code.
4. Apply design-motion-principles only where motion earns its place — e.g. the Counter screen's step
   transitions (phone lookup → booking → receipt) and the Dashboard's staff-performance bars — never motion
   for its own sake, and never anything that slows down the Counter screen's 15-second target.
5. After each screen is built, actually look at it (screenshot or run the dev server) before moving to the
   next — don't batch all five screens into one unverified pass.
6. Do not change the wallet math, referral-reward timing, reminder-cycle logic, or any API route's behavior
   while doing this. This is a frontend design-and-build task, not a feature or business-logic change.

When you're done, explain the design direction you landed on and why, screen by screen, and flag anything
from Phase 1 that didn't install cleanly rather than silently skipping it.
