# Salon app — start Claude Code on your own computer

Two steps. Step 1 goes in your normal terminal. Step 2 goes into Claude Code once it opens.

---

## Step 1 — paste into your terminal (Mac/Linux, or Git Bash on Windows)

Needs Node.js 20+ and Git installed.

```bash
git clone https://github.com/biswajitbehera3-ops/Adds.git
cd Adds
git checkout claude/affectionate-rubin-demrze
cd salon-mobile && npm install && cd ..
cd salon-app && npm install && cp -n .env.example .env && cd ..
claude
```

---

## Step 2 — paste this into Claude Code

```text
You are continuing work on a salon loyalty / CRM app in this repo. Read before doing anything:
salon-mobile/PRODUCT.md, salon-mobile/DESIGN.md, salon-mobile/README.md,
salon-mobile/.impeccable/surfaces/app-tsx.md, and salon-app/CLAUDE.md.

WHAT IT IS
- An app I sell to local Indian salon owners. Each salon gets its OWN copy of the app,
  configured in salon-mobile/src/config/salon.ts (name, services, prices, stylists,
  top-up bonus tiers, referral rewards, reminder cycles, reminder message).
- Five areas from a home hub of cards: Counter, Customers (+ profile), Reminders,
  Refer & Earn, Owner Dashboard.

TWO FOLDERS
- salon-mobile/ = THE PRODUCT. Expo SDK 57, React Native 0.86, TypeScript, Reanimated 4.
  Phone-first. All data lives on the phone (AsyncStorage) — no server.
- salon-app/ = earlier Next.js + Prisma/SQLite backend with the same business rules.
  Not used by the mobile app today; keep it as the reference / future sync server.

LOCKED DECISIONS — do not change without asking me
- Look: "grooming-tin label" — Indian soap/hair-oil packaging. Chocolate brown shell,
  cream label paper with double-rule frames, burnt-orange wax seal ONLY for money and the
  one main action. Fonts: Rozha One (names, amounts) + Hind (everything else).
- Navigation: home hub of cards. Motion: the tapped card grows into the next screen
  (container transform, src/nav/Navigator.tsx); receipt gets a seal "stamp"; numbers roll.
- Counter keypad stays instant — a walk-in must be logged in well under 15 seconds.
- Reduce Motion must always turn transitions into short crossfades.

BUSINESS RULES — never change their behaviour, only how they look
(salon-mobile/src/domain/engine.ts + rules.ts, mirrored in salon-app/src/lib/)
- Wallet top-up gets a tiered bonus. Wallet can never go negative.
- Referral reward goes to BOTH people on the referred customer's FIRST PAID VISIT,
  never at sign-up, and only once.
- Reminders are overdue PER SERVICE, each service with its own cycle.
- Customer consent is required to save a customer (DPDP Act). Reminders only go to
  consented customers.
- Reminders open WhatsApp with the message prefilled (wa.me link) and are logged.

HOW TO RUN AND CHECK
- cd salon-mobile && npx expo start  → scan the QR with the Expo Go app on my phone
  (phone and computer on the same Wi-Fi). Press w for a browser preview.
- npm test (29 business-rule tests) and npm run typecheck must pass before you call
  anything done. salon-app: npm test (28 tests).
- After any UI change, actually look at it (run it, screenshot) before saying it's done.
- Web test link build: npx expo export -p web && python3 scripts/build-web-artifact.py

STILL OPEN — ask me, don't invent
- App name and logo (placeholder "Salon").
- Real values for bonus tiers, referral amounts, reminder cycles, and the referral link
  domain (placeholder https://salon.example/r).
- Whether the Owner Dashboard needs a PIN.
- Data backup: today all data is on one phone. This is the first thing owners will ask.
- Price I charge salons after a free 30-day pilot.

DESIGN SKILLS (optional, recommended): if these aren't installed yet, install them:
  npx impeccable install --providers=claude --scope=project
  npx skills add alchaincyf/huashu-design
  npx skills add nextlevelbuilder/ui-ux-pro-max-skill
  npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
  npx skills add kylezantos/design-motion-principles

FIRST: run the tests and typecheck in salon-mobile, start the app, and confirm it works.
Then tell me in a few lines what you checked, and ask me which open item to tackle first.
My suggestion is data backup (export/restore of each salon's data) so I can pitch owners.
Commit work on the branch claude/affectionate-rubin-demrze, never on main.
```

---

**Tip:** to test on your phone, install **Expo Go** from the Play Store / App Store first.
