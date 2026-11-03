# Graph Report - salon-mobile  (2026-11-03)

## Corpus Check
- 197 files · ~370,317 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .log 1)

## Summary
- 1561 nodes · 4389 edges · 119 communities (88 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 219 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `61d47e61`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- glass.tsx
- Staff.tsx
- film.py
- Earnings.tsx
- Live.tsx
- App.tsx
- Counter.tsx
- earnings.ts
- os
- types.ts
- Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)
- GT
- emptyData
- Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)
- day.mjs
- checks.ts
- engine.ts
- expo
- UserError
- store.ts
- istDate
- Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)
- LoadFailed.tsx
- assertClockNotBehind
- build-legal.mjs
- harness.mjs
- dependencies
- salon.ts
- lib.mjs
- package.json
- refundableBalance
- Salon App: Master Build Checklist
- Launch video, documentary version: director's plan (v4, 29 Oct 2026)
- C. A customer arrives
- Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)
- Launch video: director's plan (v3, 29 Oct 2026)
- build.test.ts
- ref_fs
- calendar.ts
- Privacy Policy — {{salonName}}
- Product
- Terms of Service — Salon App
- Security check: salon app (run 2)
- BookSheet.tsx
- Live sync plan: every phone in the salon shares the same data (22 Oct)
- Salon day test: 20 customers, 4 stylists, 1 owner (25 Oct)
- rules.ts
- Launch video: Higgsfield assets and credit log
- Live Floor redesign — shared spec (all three directions use only this)
- scripts
- Security check: salon app (run 1)
- 4. Staff app
- live-floor-3d/package.json
- Live floor in 3D (three.js): build plan
- Salon app redesign: shared design spec (input for all three directions)
- share.ts
- xlsx.ts
- Security check: salon app (run 3)
- customers.ts
- Design system: grooming-tin label
- Direction B: the apothecary label (real-world reference)
- Fair Marketing, Pricing and Dark-Pattern Checklist
- Confirmed app style: liquid glass over the salon (22 Oct)
- photos.ts
- Live floor: Higgsfield assets (16 Oct 2026)
- Direction A · Warm Editorial: "The Register"
- Direction C · The Register
- Founder decisions, 24 Oct: help to Claude, one-tap WhatsApp only, APK and demo first
- contrast-check.mjs
- AGENTS.md
- Review: the "apple-design" skill vs our app (24 Oct)
- Data Deletion and Other Privacy Requests
- A. Customers of {{salonName}}
- Third-Party SDK, Permission and Data-Flow Audit
- receiptMessage
- devDependencies
- Beating the competitors: their complaints fixed, their features bettered (24 Oct)
- Prompt Motion research notes (saved for later)
- app-tsx.md
- Licences for Fonts, Images, Video and Code
- Motion spec (approved)
- tsconfig.json
- New salon: what to collect, and what stays fixed
- Security checks
- Findings detail (confirmed medium and above)
- Accessibility Statement and Audit
- Needs validation
- Findings detail (confirmed medium and above), run 2
- Findings detail (confirmed medium and above), run 3
- App sounds (24 Oct): plan, build later
- brand/README.md
- FRESH-START-CHECK.md
- breach-response-plan.md
- cookie-policy.md
- data-processing-agreement.md
- privacy-notice-counter-card.md
- staff-data-notice.md
- expo-haptics
- react-native-web@~0.21.0
- run-1/sbx.sh
- run-2/NEEDS-VALIDATION.md
- run-2/sbx.sh
- run-3/NEEDS-VALIDATION.md
- r3-clock.md
- r3-money.md
- r3-privacy.md
- r3-restore.md
- v1.md
- v2.md
- v3.md
- v4.md
- v5.md
- run-3/sbx.sh

## God Nodes (most connected - your core abstractions)
1. `GT()` - 156 edges
2. `UserError` - 78 edges
3. `istDate()` - 73 edges
4. `useData()` - 65 edges
5. `useNav()` - 62 edges
6. `commit()` - 57 edges
7. `useToast()` - 53 edges
8. `GlassCard()` - 52 edges
9. `GoldButton()` - 52 edges
10. `inr()` - 49 edges

## Surprising Connections (you probably didn't know these)
- `Signature components` --references--> `Stamp()`  [INFERRED]
  DESIGN.md → src/components/Stamp.tsx
- `Gaps in the fixes above, found by run 3's first pass (27 Oct)` --references--> `clock()`  [INFERRED]
  SECURITY-LESSONS.md → src/domain/calendar.ts
- `1. What was checked and how` --references--> `expectedCash()`  [INFERRED]
  security/run-1/REPORT.md → src/domain/checks.ts
- `3.1 Clock forward wipes records (medium)` --references--> `purgeExpired()`  [INFERRED]
  security/run-2/REPORT.md → src/domain/engine.ts
- `3.2 Pre-marking tomorrow's attendance (medium)` --references--> `markAttendance()`  [INFERRED]
  security/run-2/REPORT.md → src/domain/engine.ts

## Import Cycles
- 2-file cycle: `src/nav/OwnerTabs.tsx -> src/screens/Customers.tsx -> src/nav/OwnerTabs.tsx`
- 2-file cycle: `src/nav/StaffTabs.tsx -> src/screens/Customers.tsx -> src/nav/StaffTabs.tsx`
- 2-file cycle: `src/nav/OwnerTabs.tsx -> src/screens/owner/Live.tsx -> src/nav/OwnerTabs.tsx`
- 2-file cycle: `src/nav/OwnerTabs.tsx -> src/screens/owner/Staff.tsx -> src/nav/OwnerTabs.tsx`
- 2-file cycle: `src/nav/OwnerTabs.tsx -> src/screens/owner/Earnings.tsx -> src/nav/OwnerTabs.tsx`
- 2-file cycle: `src/nav/StaffTabs.tsx -> src/screens/Calendar.tsx -> src/nav/StaffTabs.tsx`
- 2-file cycle: `src/nav/StaffTabs.tsx -> src/screens/Me.tsx -> src/nav/StaffTabs.tsx`
- 2-file cycle: `src/nav/StaffTabs.tsx -> src/screens/Home.tsx -> src/nav/StaffTabs.tsx`
- 4-file cycle: `src/nav/OwnerTabs.tsx -> src/screens/owner/Earnings.tsx -> src/nav/StaffTabs.tsx -> src/screens/Customers.tsx -> src/nav/OwnerTabs.tsx`
- 4-file cycle: `src/nav/OwnerTabs.tsx -> src/screens/owner/Live.tsx -> src/nav/StaffTabs.tsx -> src/screens/Customers.tsx -> src/nav/OwnerTabs.tsx`
- 4-file cycle: `src/nav/OwnerTabs.tsx -> src/screens/owner/Staff.tsx -> src/nav/StaffTabs.tsx -> src/screens/Customers.tsx -> src/nav/OwnerTabs.tsx`

## Communities (119 total, 31 thin omitted)

### Community 0 - "glass.tsx"
Cohesion: 0.10
Nodes (41): expo-linear-gradient, react, react-native, react-native-reanimated, react-native-safe-area-context, easeOut, STATE_LABEL, Weight (+33 more)

### Community 1 - "Staff.tsx"
Cohesion: 0.09
Nodes (54): GhostButton(), GlassSheet(), GoldButton(), OwnerApproval(), useToast(), commit(), photoUri(), savePhoto() (+46 more)

### Community 2 - "film.py"
Cohesion: 0.08
Nodes (38): audio(), B(), build(), chair(), friends(), C(), calendar_card(), chunks() (+30 more)

### Community 3 - "Earnings.tsx"
Cohesion: 0.11
Nodes (47): react-native-svg, Backdrop(), Icon(), IconName, P, NumberRoll(), AnimatedPressable, Press() (+39 more)

### Community 4 - "Live.tsx"
Cohesion: 0.06
Nodes (45): expo-crypto@~57.0.3, expo-crypto, Letter(), LetterReveal(), Hasher, makeSecret(), MIN_PASSWORD, Chair (+37 more)

### Community 5 - "App.tsx"
Cohesion: 0.17
Nodes (44): MyProfileRoute(), render(), Root(), StatusBarForRoute(), useRootRoute(), GlassCard(), GlassScreen(), SectionLabel() (+36 more)

### Community 6 - "Counter.tsx"
Cohesion: 0.11
Nodes (33): GlassSwitch(), WalletBadge(), newCode(), WhatsAppCode(), Pill(), ServicePicker(), TopUpSheet(), getSession() (+25 more)

### Community 7 - "earnings.ts"
Cohesion: 0.15
Nodes (34): addDays(), addMonths(), dayNum(), isClosed(), addOnName(), between(), change(), clockOf() (+26 more)

### Community 8 - "os"
Cohesion: 0.10
Nodes (7): rep(), data_uri(), inline_font(), inline(), walk(), walk(), walk()

### Community 9 - "types.ts"
Cohesion: 0.08
Nodes (30): ChairState, liveFloor(), minutesOf(), DEMO_OWNER_PASSWORD, DEMO_STAFF_PASSWORD, NAMES, OWNER_SECRET, STAFF_NAMES (+22 more)

### Community 10 - "Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)"
Cohesion: 0.06
Nodes (33): 1. Architecture (verbatim), 2. Assigned coverage units (from coverage-ledger.json), 3. Selected blocks (verbatim), 4. Excluded blocks, 5. Core hunting method, 6. Core validation rules, 7. Prior findings, their fixes, and peers, 8. Your execution environment, sandbox and result contract (+25 more)

### Community 11 - "GT"
Cohesion: 0.13
Nodes (31): drawer, GT(), StatusChip(), Intro(), ToastHost(), AnimatedCircle, Appt, Block() (+23 more)

### Community 12 - "emptyData"
Cohesion: 0.09
Nodes (22): vitest, exportBackup(), Data, emptyData(), NOW, SECRET, setup(), hasher (+14 more)

### Community 13 - "Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)"
Cohesion: 0.06
Nodes (31): 1. Architecture (verbatim), 2. Assigned coverage units (from coverage-ledger.json), 3. Selected blocks (verbatim), 4. Excluded blocks, 5. Core hunting method, 6. Core validation rules, 7. Prior findings, their fixes, and peers, 8. Your execution environment, sandbox and result contract (+23 more)

### Community 14 - "day.mjs"
Cohesion: 0.14
Nodes (25): addNew(), as(), book(), bookingArrived(), C, collect(), firstShot, nextCustomer() (+17 more)

### Community 15 - "checks.ts"
Cohesion: 0.13
Nodes (27): Run 3 (27 Oct): the re-check of the fixes, backupProblem(), catalogOf(), CheckItem, customerName(), dayOf(), DEFAULT_ADDONS, DEFAULT_SERVICES (+19 more)

### Community 16 - "engine.ts"
Cohesion: 0.13
Nodes (23): Affected, at(), confirmClock(), customerDirectory(), CustomerFilter, CustomerSort, findByPhone(), getProfile() (+15 more)

### Community 17 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+18 more)

### Community 18 - "UserError"
Cohesion: 0.15
Nodes (26): Architecture (salon-mobile, run-1, quick profile), 3.3 Late undo by moving the clock back (medium), addStaff(), addVisitExtra(), applyDelta(), approveVisitExtras(), canStaffUndo(), checkoutVisit() (+18 more)

### Community 19 - "store.ts"
Cohesion: 0.20
Nodes (24): App(), checkSecret(), applyCatalog(), observeClock(), buildDemoData(), clearAll(), dropUnusedPhotos(), emit() (+16 more)

### Community 20 - "istDate"
Cohesion: 0.16
Nodes (25): A(), appointmentLoad(), appointmentMessage(), appointmentMinutes(), appointmentMonth(), appointmentRemindersDue(), appointmentSlots(), appointmentsOn() (+17 more)

### Community 21 - "Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)"
Cohesion: 0.09
Nodes (22): 1. Architecture (verbatim), 2. Assigned coverage units (from coverage-ledger.json), 3. Selected blocks (verbatim), 4. Excluded blocks, 5. Core hunting method, 6. Core validation rules, 7. Prior findings, their fixes, and peers, 8. Your execution environment, sandbox and result contract (+14 more)

### Community 22 - "LoadFailed.tsx"
Cohesion: 0.16
Nodes (19): Also fixed while doing this, Before the first real salon goes live (locked, user 28 Oct), Gaps in the fixes above, found by run 3's first pass (27 Oct), Run 1 (26 Oct), Security lessons: the problems found, their fixes, and the rules that follow, Still open (detail), The problems and their fixes, The rules (+11 more)

### Community 23 - "assertClockNotBehind"
Cohesion: 0.16
Nodes (21): Run 2 (27 Oct), Architecture (salon-mobile, run-2, scoped quick run), closeDay(), appointmentArrived(), approveLeave(), assertClockNotBehind(), cancelAppointment(), cancelOpenVisit() (+13 more)

### Community 24 - "build-legal.mjs"
Cohesion: 0.12
Nodes (15): args, d, DOCS, esc(), groups, index, inline(), md() (+7 more)

### Community 25 - "harness.mjs"
Cohesion: 0.14
Nodes (9): at(), istToDate(), L(), shot(), start(), tap(), task(), text() (+1 more)

### Community 26 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, expo-blur@~57.0.3, expo-linear-gradient@~57.0.2, @expo/metro-runtime@~57.0.16, expo-status-bar@~57.0.1, expo-video@~57.0.5, react@19.2.3, react-dom@19.2.3 (+11 more)

### Community 27 - "salon.ts"
Cohesion: 0.12
Nodes (14): AddOn, config, SalonConfig, Service, Staff, TopUpTier, at(), NOW (+6 more)

### Community 29 - "package.json"
Cohesion: 0.11
Nodes (16): expo@~57.0.27, expo-clipboard@~57.0.2, expo-document-picker@~57.0.3, expo-font@~57.0.4, @expo-google-fonts/urbanist@^0.4.2, react-native-gesture-handler@~2.32.0, main, name (+8 more)

### Community 30 - "refundableBalance"
Cohesion: 0.16
Nodes (17): Checklist: where each item is handled, Every new salon: the standard steps, Legal and Compliance Pack — Salon App, 3.4 Wallet close overpays bonus (low), closeWallet(), createCustomer(), customerDataExport(), deleteCustomer() (+9 more)

### Community 31 - "Salon App: Master Build Checklist"
Cohesion: 0.12
Nodes (15): 10. Open decisions (must be answered before the build), 11. After the app is built, 1. Look and feel, 2. Opening the app, 3. Who uses the app, 5. Appointments / Calendar, 6. Owner app — **CONFIRMED by user, 19 Oct** (demo: `design-studies/owner-demo/owner-app-demo.html`), 7. Motion (from `MOTION.md`) (+7 more)

### Community 32 - "Launch video, documentary version: director's plan (v4, 29 Oct 2026)"
Cohesion: 0.12
Nodes (16): Chapter 1: the mystery (0:00–0:21), Chapter 2: the fix (0:21–0:50), Chapter 3: what the owner sees (0:50–1:12), Cost and the generation rule, Credit estimate (29 Oct), Decided (user, 29 Oct), Edit timeline (v5, 29 Oct, waits for approval), Ending (1:12–1:20) (+8 more)

### Community 33 - "C. A customer arrives"
Cohesion: 0.12
Nodes (16): A. Delivery day (one visit, about 1 hour), B. Opening the shop (every morning), C1. Regular customer (most common — target under 15 seconds), C2. First-time customer (about 30 seconds), C3. Referrals: sharing a code, and checking one (user asked for the whole workflow, 21 Oct), C4. Customer wants to add money to their wallet, C5. Customer pays partly from wallet, partly cash, C6. Customer won't give their number (+8 more)

### Community 34 - "Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)"
Cohesion: 0.12
Nodes (15): 1. Architecture (verbatim), 2. Assigned coverage units (from coverage-ledger.json), 3. Selected blocks (verbatim), 4. Excluded blocks, 5. Core hunting method, 6. Core validation rules, 7. Prior findings, their fixes, and peers, 8. Your execution environment, sandbox and result contract (+7 more)

### Community 35 - "Launch video: director's plan (v3, 29 Oct 2026)"
Cohesion: 0.13
Nodes (14): Close (0:55–1:00), Director's rules for the edit, Every day: you see everything (0:24–0:49), Fix 1: the reminder brings her back (0:05–0:15), Fix 2: she brings a friend, you get a new customer (0:15–0:24), Format, How it gets built, Launch video: director's plan (v3, 29 Oct 2026) (+6 more)

### Community 36 - "build.test.ts"
Cohesion: 0.14
Nodes (8): Ev, FIRST, LAST, METHODS, pick(), POOL, rand(), SERVICES

### Community 38 - "calendar.ts"
Cohesion: 0.19
Nodes (9): BookingState, clock(), dayOfWeek(), monthGrid(), MONTHS, shortDay(), utc(), WEEKDAYS (+1 more)

### Community 39 - "Privacy Policy — {{salonName}}"
Cohesion: 0.15
Nodes (12): 10. Changes, 11. Language, 1. Who we are, 2. What we collect, and why, 3. WhatsApp reminders and offers (optional), 4. Children, 5. Who can see your data, 6. How long we keep it (+4 more)

### Community 40 - "Product"
Cohesion: 0.15
Nodes (12): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+4 more)

### Community 41 - "Terms of Service — Salon App"
Cohesion: 0.17
Nodes (11): 1. The service, 2. Fees — all stated up front, 3. Term and cancellation, 4. Data ownership and privacy, 5. The Salon's responsibilities, 6. Brand assets and licences, 7. Service level and support, 8. Claims and liability (+3 more)

### Community 42 - "Security check: salon app (run 2)"
Cohesion: 0.17
Nodes (11): 1. What was checked and how, 2. Security posture in one paragraph, 3.1 Clock forward wipes records (medium), 3.2 Pre-marking tomorrow's attendance (medium), 3.3 to 3.6 (low), 3. Confirmed findings, 4. What was checked and held, 5. Needs validation (+3 more)

### Community 43 - "BookSheet.tsx"
Cohesion: 0.29
Nodes (11): BookSheet(), card, field(), Found, nextOpen(), ordinal(), Section(), Tag() (+3 more)

### Community 44 - "Live sync plan: every phone in the salon shares the same data (22 Oct)"
Cohesion: 0.17
Nodes (11): How the app changes, How the data is laid out online, How the live part works, step by step, Live sync plan: every phone in the salon shares the same data (22 Oct), Order of work, Three decisions to make first, What runs on the server (Cloud Functions), What "synced" means for this app (+3 more)

### Community 45 - "Salon day test: 20 customers, 4 stylists, 1 owner (25 Oct)"
Cohesion: 0.18
Nodes (10): Files, Findings: what the app misses or can't handle, How honest is this test, Salon day test: 20 customers, 4 stylists, 1 owner (25 Oct), The answer in short, The cast, The money at closing, Time on the phone (+2 more)

### Community 46 - "rules.ts"
Cohesion: 0.31
Nodes (9): overdueReminders(), daysBetween(), dueDate(), priceVisit(), renderReminder(), startOfIstDay(), topUpBonus(), upsellsFor() (+1 more)

### Community 47 - "Launch video: Higgsfield assets and credit log"
Cohesion: 0.20
Nodes (9): 29 Oct: #5 redo + pictures 10–12, 29 Oct: collage pictures 1–9 (Banana Pro, 9:16, 2K), 29 Oct: face locks (Banana Pro, Mode 0), 29 Oct: full narration, voice 4 (Andre) chosen by the user, 29 Oct: moving clips A–D (Seedance 2.5, 5 s, 720p, silent, 9:16; prompts by cinema-director-v3), 29 Oct: narrator voice tests (Qwen Audio 3.0 TTS Flash), 29 Oct: outfits (Banana Pro, Mode 1A, locked face as reference), 30 Oct: the finished film (edit, no credits) (+1 more)

### Community 48 - "Live Floor redesign — shared spec (all three directions use only this)"
Cohesion: 0.20
Nodes (9): Content (use exactly this data), Deliverable, Fixed brand look (must keep), Live Floor redesign — shared spec (all three directions use only this), People, Screen layout requirements, The animation (must loop seamlessly, ~20–25 s), What it is (+1 more)

### Community 49 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, android, export:web, ios, legal, release-check, start, test (+2 more)

### Community 50 - "Security check: salon app (run 1)"
Cohesion: 0.20
Nodes (9): 1. What was checked and how, 2. Security posture in one paragraph, 3.1 Load error swaps in demo data (medium), 3. Confirmed findings, 4. What was checked and held, 5. Needs validation (not confirmed, no severity), 6. Hardening notes (not findings), 7. Coverage (+1 more)

### Community 51 - "4. Staff app"
Cohesion: 0.36
Nodes (9): 4. Staff app, dayAdd(), daysOf(), leaveImpact(), leaveUpdates(), leaveWorkingDays(), markLeaveSeen(), myLeave() (+1 more)

### Community 52 - "live-floor-3d/package.json"
Cohesion: 0.28
Nodes (8): dependencies, esbuild@0.24.0, three@0.170.0, name, private, type, esbuild, three

### Community 53 - "Live floor in 3D (three.js): build plan"
Cohesion: 0.22
Nodes (8): 1. What changes from the current page, 2. New floor plan, 3. People, 4. Technology, 5. Character models and licences (important), 6. Honest limits, 7. Steps once confirmed, Live floor in 3D (three.js): build plan

### Community 54 - "Salon app redesign: shared design spec (input for all three directions)"
Cohesion: 0.22
Nodes (8): Brand assets (real, use them; paths relative to `salon-mobile/`), Current state (what exists and is approved in function, but looks "generic"), Output (each direction), Salon app redesign: shared design spec (input for all three directions), The five screens every direction must show (same content, so the three can be compared), Tone and qualities, Visual motif to find (each direction answers this its own way), What the product is

### Community 55 - "share.ts"
Cohesion: 0.25
Nodes (7): expo-file-system@~57.0.7, expo-sharing@~57.0.22, expo-file-system, expo-sharing, shareTextFile(), shareXlsx(), toBase64()

### Community 56 - "xlsx.ts"
Cohesion: 0.36
Nodes (8): fflate@^0.8.2, fflate, buildXlsx(), colName(), esc(), safeName(), Sheet, sheetXml()

### Community 57 - "Security check: salon app (run 3)"
Cohesion: 0.22
Nodes (8): 1. What was checked and how, 2. Security posture in one paragraph, 3. Confirmed findings (all fixed 28 Oct), 4. What was checked and held, 5. Needs validation, 6. Hardening notes and what stays open, 7. Coverage, Security check: salon app (run 3)

### Community 58 - "customers.ts"
Cohesion: 0.36
Nodes (7): at(), billOf(), paid(), periodStart(), SpendPeriod, topSpenders(), NOW

### Community 59 - "Design system: grooming-tin label"
Cohesion: 0.25
Nodes (7): Colour (`color.*`), Design system: grooming-tin label, Motion grammar, Shape and space, Signature components, Type (`font.*`, variants in `components/T.tsx`), World

### Community 60 - "Direction B: the apothecary label (real-world reference)"
Cohesion: 0.25
Nodes (7): Direction B: the apothecary label (real-world reference), Fonts (Google Fonts), Layout skeleton (how it differs from a card stack), Motif: the apothecary label, Palette, Reference: Aesop's digital design, What would change in the app if chosen

### Community 61 - "Fair Marketing, Pricing and Dark-Pattern Checklist"
Cohesion: 0.25
Nodes (7): Claims when pitching the app, Dark patterns: audit of the app, Data minimisation, Fair Marketing, Pricing and Dark-Pattern Checklist, Messages and emails, Prices, Reviews and testimonials

### Community 62 - "Confirmed app style: liquid glass over the salon (22 Oct)"
Cohesion: 0.25
Nodes (7): 1. The background (every screen), 2. The glass (one recipe, used everywhere), 3. Colour, 4. Type (Urbanist), 5. Building blocks, 6. Building it in the app (notes for build day), Confirmed app style: liquid glass over the salon (22 Oct)

### Community 63 - "photos.ts"
Cohesion: 0.25
Nodes (6): expo-image-picker@~57.0.20, @react-native-async-storage/async-storage@2.2.0, expo-image-picker, @react-native-async-storage/async-storage, pickPhoto(), takeSelfie()

### Community 64 - "Live floor: Higgsfield assets (16 Oct 2026)"
Cohesion: 0.29
Nodes (6): 19 Oct: final changes (user decisions), 19 Oct: salon edit + walk sheets (13.75 credits, approved), Background plate: chosen = Image 2, Character sprites (transparent PNG, 1k; style-referenced to the chosen plate), Checked (19 Oct), Live floor: Higgsfield assets (16 Oct 2026)

### Community 65 - "Direction A · Warm Editorial: "The Register""
Cohesion: 0.29
Nodes (6): Direction A · Warm Editorial: "The Register", Fonts, Logic and style, Palette, The motif, and where its form comes from, What would change in the app if chosen

### Community 66 - "Direction C · The Register"
Cohesion: 0.29
Nodes (6): Direction C · The Register, Fonts, Palette, Phone frame, The structural idea: the salon's register (khata), What would change in the app if this were chosen

### Community 67 - "Founder decisions, 24 Oct: help to Claude, one-tap WhatsApp only, APK and demo first"
Cohesion: 0.29
Nodes (6): 1. Help button → Claude → solution or the founder, 2. WhatsApp: only one tap by staff, never automatic, 3. APK, not the Play Store; demo first, accounts at the first sale, APK distribution, Demo first, Founder decisions, 24 Oct: help to Claude, one-tap WhatsApp only, APK and demo first

### Community 68 - "contrast-check.mjs"
Cohesion: 0.48
Nodes (6): hex(), lin(), lum(), mix(), pairs, ratio()

### Community 69 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 70 - "Review: the "apple-design" skill vs our app (24 Oct)"
Cohesion: 0.33
Nodes (5): Already in our app, Review: the "apple-design" skill vs our app (24 Oct), Verdict, What it would make better (apply in the build), What the skill is

### Community 71 - "Data Deletion and Other Privacy Requests"
Cohesion: 0.33
Nodes (5): Data Deletion and Other Privacy Requests, How a customer can ask, Request form (print or send as a message), What deletion does, What staff and the owner do (all in the app)

### Community 72 - "A. Customers of {{salonName}}"
Cohesion: 0.33
Nodes (5): A. Customers of {{salonName}}, B. Salons paying for the app, Refund Policy, Services, Wallet money

### Community 73 - "Third-Party SDK, Permission and Data-Flow Audit"
Cohesion: 0.33
Nodes (5): Android permissions, Data that leaves the phone, Re-run before every release, SDKs in the app, Third-Party SDK, Permission and Data-Flow Audit

### Community 74 - "receiptMessage"
Cohesion: 0.40
Nodes (5): Built (21 Oct, user: "build all"), Misuse and mistakes: what the app stops, and what still needs building, The original list (21 Oct), billLines(), receiptMessage()

### Community 75 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, @types/react@~19.2.2, typescript@~6.0.3, vitest@^3.2.7, @types/react, typescript

### Community 76 - "Beating the competitors: their complaints fixed, their features bettered (24 Oct)"
Cohesion: 0.40
Nodes (4): Beating the competitors: their complaints fixed, their features bettered (24 Oct), Part A. Every complaint in their reviews, and how we make it right, Part B. Their features and ours, and how ours will be better, What this changes in the offer (for /founder-offer)

### Community 77 - "Prompt Motion research notes (saved for later)"
Cohesion: 0.40
Nodes (4): For a sales/promo video of the app (to show salon owners), Prompt Motion research notes (saved for later), Skills from the link the user sent, Techniques worth using inside the app (Reanimated)

### Community 78 - "app-tsx.md"
Cohesion: 0.40
Nodes (4): Constraints, Direction contract, Scope, Unresolved

### Community 79 - "Licences for Fonts, Images, Video and Code"
Cohesion: 0.40
Nodes (4): Code, Fonts, Images, icons, video, Licences for Fonts, Images, Video and Code

### Community 80 - "Motion spec (approved)"
Cohesion: 0.40
Nodes (4): Accessibility, Motion spec (approved), Never animated, Rejected (and why)

### Community 81 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

### Community 82 - "New salon: what to collect, and what stays fixed"
Cohesion: 0.40
Nodes (4): 1. What stays fixed (the data every salon's app keeps), 2. What each salon gives us (fill before go-live), 3. Making their live app, New salon: what to collect, and what stays fixed

### Community 83 - "Security checks"
Cohesion: 0.40
Nodes (4): Run 1 in plain words, Run 2 in plain words, Run 3 in plain words, Security checks

### Community 84 - "Findings detail (confirmed medium and above)"
Cohesion: 0.40
Nodes (4): A load error makes the app overwrite real salon data with demo data whose owner password is the public 'owner1234', Backup restore replaces the owner password and all state from an untrusted file with no content validation or re-authentication, Findings detail (confirmed medium and above), Staff can undo a paid bill long after the 2-minute window by setting the phone clock back, and the undo is missing from the owner's checks for the real day

### Community 85 - "Accessibility Statement and Audit"
Cohesion: 0.50
Nodes (3): Accessibility Statement and Audit, Checked and passing, Known gaps (to fix in the app build)

### Community 86 - "Needs validation"
Cohesion: 0.50
Nodes (3): Needs validation, Restored backup photoKey is joined unconfined into the native retention-delete path (traversal within the app's own storage), The WhatsApp confirmation code goes to the same staff member it is meant to check, so big wallet spends and referral sign-ups could be self-approved

### Community 87 - "Findings detail (confirmed medium and above), run 2"
Cohesion: 0.50
Nodes (3): A stylist can mark tomorrow's attendance as present and on time the evening before by moving the phone clock forward, Findings detail (confirmed medium and above), run 2, Setting the phone clock forward and reopening the app permanently deletes recent attendance selfies, upcoming bookings and active customers' records

### Community 88 - "Findings detail (confirmed medium and above), run 3"
Cohesion: 0.50
Nodes (3): Clock-jump hold bypassed: one save made with the clock ahead, or app starts under 30 days apart, let automatic clean-up erase customers, selfies and bookings, Findings detail (confirmed medium and above), run 3, One record saved with the clock far ahead blocks every bill, top-up, check-in, void and cash count at the real date

### Community 89 - "App sounds (24 Oct): plan, build later"
Cohesion: 0.50
Nodes (3): App sounds (24 Oct): plan, build later, Rules (from the apple-design skill: causality, harmony, utility), Which moment gets which sound

## Knowledge Gaps
- **1 isolated node(s):** `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 704 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `emptyData` to `build.test.ts`, `earnings.ts`, `types.ts`, `devDependencies`, `rules.ts`, `customers.ts`, `salon.ts`, `package.json`, `photos.ts`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `glass.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09661016949152543 - nodes in this community are weakly interconnected._
- **Why does `commit()` connect `Staff.tsx` to `glass.tsx`, `Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)`, `Live.tsx`, `App.tsx`, `Counter.tsx`, `Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)`, `BookSheet.tsx`, `GT`, `Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)`, `Live sync plan: every phone in the salon shares the same data (22 Oct)`, `checks.ts`, `store.ts`, `Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)`, `LoadFailed.tsx`, `assertClockNotBehind`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `Staff.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09461152882205513 - nodes in this community are weakly interconnected._
- **Why does `Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)` connect `Architecture (salon-mobile, run 3, scoped re-check of fixed code, commit 1fe98d0)` to `Staff.tsx`, `checks.ts`, `engine.ts`, `UserError`, `store.ts`, `LoadFailed.tsx`, `assertClockNotBehind`, `refundableBalance`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `film.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08417508417508418 - nodes in this community are weakly interconnected._