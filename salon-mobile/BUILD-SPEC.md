# Salon App: Master Build Checklist

**The single list of everything the app must contain.** Every request and decision goes here the moment it's made.
When the app is built, each line is ticked only once it works in the installed app.

The rule (from the user): **don't build the app until every component is complete.** Until then, design, decide and record here.

Status key: **Decided** = agreed, not built · **Designed** = shown in a demo/mock · **Logic** = rules written and tested in code · **Built** = in the app code (see the status check below) · **Open** = waiting for a decision.

Where things live:
- **Owner app demo (all 4 tabs, clickable):** `design-studies/owner-demo/owner-app-demo.html` (built by `build-owner-demo.py` from the approved tab pages)
- Screens demo: `design-studies/app-interface.src.html` (published link: https://claude.ai/artifact/4uia3iM8nDTeofW7dMX8dr)
- Login demo: `design-studies/login-prototype.src.html` (https://claude.ai/artifact/YHAPPq7mSU9TsmyQuz5Tac)
- Rules: `src/domain/engine.ts`, with tests in `tests/`
- Flow details: `FLOW.md`
- New salon checklist (what to collect, what stays fixed): `SALON-ONBOARDING.md`
- Motions: `MOTION.md`
- Legal: `legal/`

## Build status check (20 Oct, evening: everything decided is now built, old look removed)

**Open the app:** https://claude.ai/artifact/7mTfhB77daaW4jfEGupVUs (the real app, demo data; staff 98111 00001 / 1234, owner password owner1234). Rebuild it with `EXPO_OFFLINE=1 npx expo export -p web --output-dir dist-web && python3 scripts/web-single-file.py dist-web salon-app.html`.

**Built, in the brown glass look (the old grooming-tin look is deleted):**
- Opening: intro video every launch with Skip (2.1) · glass Login with logo, live clock, drifting tools, shake on a wrong password, owner sign-in (2.2, 2.3, 2.5) · first-time owner setup (2.4) · check-in selfie: "First login today", circle, big time, On time / Late against the stylist's own shift (4.1).
- Staff app: bottom bar Home · Customers · + · Calendar · Profile (4.9) · Home with earnings ring (wallet vs cash/UPI/card), my customers today, my chair with Pay, salon chairs busy, today's bookings (4.2–4.4) · My customers list + month chart (4.3) · on-the-day booking reminders screen: Send / Sent, Arrived, No-show (5.4) · walk-in counter, new customer with consent, visit bill, payment, receipt with PAID stamp and 2-minute undo (4.5–4.7) · wallet top-up (4.13) · referrals (4.14) · Calendar with booking rings, fold into the day, + Book (4.10, 5.1, 5.5, 5.6, 5.8) · Customers with spending, filters, profile, reminders ladder (4.11, 4.12, 4.17) · Profile tab: attendance, leave, change password, privacy, log out, owner-uploaded photo (4.15) · leave flow (4.16).
- Owner app, 4 tabs (6.1): **Live** clay salon driven by real visits: customer walks in to the stylist's chair on Start visit, sits till paid, walks to the desk, "₹ PAID", walks out; chairs show Free / next booking, Off today (leave or weekly off), Not in yet, Closed today; owner menu with Leave requests, Privacy, data on this phone, Sign out; demo button plays one visit (6.2, 10.8, 10.10) · **Earnings** Today / 7 days / Month cards, bars, stylists ranked, stylist page with Day / Week / Month line graphs (6.3) · **Staff** photo cards with today's badge and leave flag, Leave requests bar, + Add a stylist with photo upload, shift start and weekly off, stylist profile with Attendance (calendar, selfie, Excel export), Leave, Shift & weekly off, Performance, Account, Deactivate (6.4, 6.5) · **Customers** with Top spenders screen (Top 20/30, periods) and bills with Cancel bill + reason, cancelled bills struck through (6.6, 6.7).
- Each stylist's own shift start and weekly off count for late / off in attendance, the Excel export, leave days and booking.

**Not possible yet, and why:**
- **APK (3.6):** this build machine has no Android SDK and the network blocks `dl.google.com`, where it comes from. Either allow that host in the environment's network settings (then the APK can be built here), or build with EAS on your own computer: `npx eas build -p android --profile preview`.
- **Online sync and phone notifications (3.4):** each phone keeps its own data for now. The Live floor moves when visits change on the same phone (and with the demo button); live across phones needs the sync service chosen in 10.7.
- **App icon from the salon logo (9.7):** waits for the logo licence (9.6).
- Inside the published web page, the Excel export and "send their data" can't save files (the viewer blocks downloads); on the phone they use the share sheet.
- The web page's intro video needs a browser that plays H.264 (Chrome, Safari, Edge; phones all do); otherwise it skips straight to the login.

**Still open (your decision):** 5.7 / 10.1 automatic vs one-tap WhatsApp · 10.2 waiting bench · 10.3 chairs per salon · 10.4 top-stylist bonus · 10.5–10.7 per-salon prices, app name, sync provider · 10.12 one Play app vs per salon · 10.13 automatic vs one-tap WhatsApp by plan · 9.5–9.6 lawyer, CA, logo licence.

---

## 1. Look and feel
| # | Item | Status |
|---|---|---|
| 1.1 | **Brown glass look** everywhere: brown studio backdrop, frosted-glass cards, gold only for money and the main button, cream text, Urbanist font. Replaces the old "grooming-tin" styling | Decided · Designed |
| 1.2 | Brand assets: salon logo + intro video (`assets/brand/`) | Have files; licence action pending (see 9.6) |
| 1.3 | Other style boards (Vulcanico/Noturno, the bold styles) were **explorations only**; not used | Decided |
| 1.4 | Text contrast passes WCAG AA (`node scripts/contrast-check.mjs`) | Logic |
| 1.5 | **Liquid glass look (user, 22 Oct: "the glass is perfect")**: clear neutral glass with a bevelled rim over the blurred salon picture under a fading brown wash; white text, small CAPITAL labels with one big number per card, thin gold line charts, glass pills inside cards, gold-outline glass button for the main action, glass bottom menu with a brighter glass pill for the current page. Reference: `design-studies/glass-home/staff-home-liquid-v4.png`. Replaces the brown glass look and redesign directions A/B/C. **Full style guide: `LIQUID-GLASS-STYLE.md`.** Build later (11.0) | **Confirmed for the whole app (user, 22 Oct)** · build later |

## 2. Opening the app
| # | Item | Status |
|---|---|---|
| 2.1 | **Intro video** plays **every time** the app opens, **muted**, watermark cropped, centred on black, then hands over to login | Decided · Designed (login demo) |
| 2.2 | **Login page**: glass capsule over the brown poster, logo window, "Welcome back", live date and time, mobile number + password, Log in, "Owner? Sign in here", drifting scissors/brush/comb, shake on a wrong password | Approved · Designed |
| 2.3 | Log in button becomes a spinner, then ✓ (motion P1) | Designed |
| 2.4 | First launch: owner sets the owner password, then adds staff | Logic |
| 2.5 | "Privacy & terms" link on the login screen | Logic |

## 3. Who uses the app
| # | Item | Status |
|---|---|---|
| 3.1 | **Every person installs the app on their own phone**: the owner, and each stylist | Decided |
| 3.2 | Staff sign in with their own mobile number + password | Logic |
| 3.3 | Owner signs in with the owner password into a **separate owner area** | Logic |
| 3.4 | **Online sync**: all phones share the salon's data live; owner sees everything from anywhere; this is also the backup; works offline and catches up. **Plan written 22 Oct: `SYNC-PLAN.md`** (Firebase Firestore in Mumbai, per-record documents, server checks, full numbers owner/server only, WhatsApp Cloud API from the salon's number); running costs in `../founder/RUNNING-COSTS.md` | Decided · planned · not built |
| 3.5 | Each salon gets its **own app** (own name, logo, prices); no salon sees another's data | Decided |
| 3.6 | Delivered as an **APK file** (Android); Play Store optional later | Decided |
| 3.7 | **The built app is the frame (user, 20 Oct).** When a salon gives its data we fill the frame and make their live app. The looks and designs may still change, but the kinds of data the app keeps stay the same. What to collect from a salon and what stays fixed: `SALON-ONBOARDING.md` | Decided |

## 4. Staff app
| # | Item | Status |
|---|---|---|
| 4.1 | **Attendance selfie with time**, only at the **first login of the day**; late after shift start + grace | Logic · Designed |
| 4.2 | **Home**: number search first → **my earnings ring** (only my own; cash/wallet split; month total) → **my customers today** table → **my chair** now | Designed |
| 4.3 | **My customers** list (from the table): today's customers one by one, with services, amount and paid/in chair; month bar chart | Designed |
| 4.4 | Staff never see other stylists' earnings | Decided |
| 4.5 | **Customer walks in**: 10 digits → new/returning, last service, wallet; pick services; suggested add-ons; Start visit | Logic · Designed |
| 4.6 | **After the service**: add extras, pay from wallet / cash / UPI / card, Collect | Logic · Designed |
| 4.7 | **Receipt**: PAID stamp, WhatsApp thank-you (with referral code only if opted in), Next customer, **Undo for 2 minutes** | Logic · Designed |
| 4.8 | **No "walk-in without number"** | Decided |
| 4.9 | **Staff bottom bar (user, 20 Oct): Home · Customers · gold + (customer walked in) · Calendar · Profile.** Home unchanged. **Customers = same design as the owner's Customers tab**, with **Reminders inside it** (no separate Reminders tab). New **Calendar** tab and new **own Profile** tab. Design: `design-studies/staff-tabs.html` | Decided · Designed · **bottom bar built 20 Oct** (`src/nav/StaffTabs.tsx`: tabs stay mounted, + opens the walk-in counter, badges for reminders to do and leave news) |
| 4.10 | **Staff Calendar tab — FINAL (user, 20 Oct) and built in the app** (`src/screens/Calendar.tsx`, reached from the staff home's Calendar tile until the new bottom bar is built): **opens on the month** (booking count per day, today ringed, Tuesday faded, Today card with bookings left and who's next). **Tapping a day folds the month into that week's strip and opens the day as a timeline** (setup B: hours down the side, blocks sized to length, current-time line; swipe for next day/week). My bookings / Whole salon on both; Whole salon day = one column per stylist. Tap a booking → bottom sheet with Mark arrived. "‹ October" unfolds back to the month. Motion: fold 340 ms, day enters 260 ms, no loops, reduce-motion = instant. **Booking effects (user, 20 Oct):** every day with bookings gets a gold ring that fills to how booked it is (booked minutes ÷ 10 a.m.–8 p.m.; Whole salon = all stylists), a warm glow that grows with load, and the count in the corner; 75%+ days turn solid gold. Rings sweep in once when the month opens, rippling out from today (700 ms, 24 ms per day). Week strip shows a small load bar per day; Today card shows "Your day is N% booked". Design: `design-studies/staff-calendar-final.html` (options considered: `staff-calendar-motion.html`) | Decided · Designed |
| 4.10 | **Refer** moved into each customer's profile (no longer in the bar) | Decided |
| 4.11 | Customers list + profile (visits, wallet history, referral code) | Logic |
| 4.12 | **Reminders** (per-service due dates, only to opted-in customers), **one salon-wide list with a 3-step ladder (user, 20 Oct)**: **1** WhatsApp message when the customer is due → **2** WhatsApp message 2, **30 days after message 1**, if they haven't come → **3** no more messages: a **phone call by the stylist who served them last** (30 days after message 2; only that stylist sees the Call button, others see "Sunita calls") → after the call, **never reminded again** until they visit. Each step is done once for the whole salon: once anyone does it, it is locked for everyone (Send greyed, "Sent by Rakesh", and the app refuses a second send). A visit resets the ladder. Days are per-salon settings (`reminderLadder`). Built: `overdueReminders` (step, lock, caller), `logReminder`, `logReminderCall`, Reminders screen | Logic · built |
| 4.17 | **Staff Customers tab (user, 20 Oct): staff see ALL the salon's customers, with spending** (total spent, wallet, ⭐ Top spenders, sort by highest spending), same as the owner's list. Reason: any stylist may serve any customer, take a walk-in or a booking for them. Added: a **"My customers"** filter (customers this stylist has served) next to All. Cancel bill and Delete stay owner-only. **Built in the app, brown glass (20 Oct)**: `src/screens/Customers.tsx` (search, reminders-to-do bar, filters All / My customers / ⭐ Top spenders (top 20) / Regulars (5+ visits) / Not seen 30+ / Wallet balance / New (30 days), sort Highest spending / Recent visit / Name, rows with last visit · stylist · visits, spent, wallet), `Profile.tsx` (Call / WhatsApp / Book with the number filled in, wallet + Top up, spent / visits / next due, next booking, due back, visits & bills and wallet history, referral code, reminders on/off, send their data; owner-only close wallet and delete), `Reminders.tsx` (To do / Waiting, the 3-step ladder). Engine: `customerDirectory` | Decided · **built** |
| 4.18 | **Staff app fixes (user, 21 Oct)**: (1) check-in selfie only on the first login of the day, then straight to Home (logic was right; the web preview lost its saved data when closed, now kept in the viewer's claude.ai account) · (2) My earnings starts the day at ₹0 and rises as customers pay (demo data no longer puts paid visits into today) · (3) My customers month chart: tap a day's bar to see that day's customers and earnings · (4) Calendar shows only the stylist's own bookings ("My calendar"; Whole salon removed for staff) · (5) staff can't top up a wallet: Top up removed from the customer profile, walk-in card and bill for staff; only the owner tops up (Customers tab → profile) | **Built** |
| 4.19 | **Misuse checks (user, 21 Oct: "build all")**: itemised WhatsApp receipt; left-without-service kept on record; undo needs a reason and names the stylist; WhatsApp code for referrals and for wallet spends above an owner-set amount; referral rewards capped per month; check-in refused when the phone clock is set back; "Not in the list?" items need the owner's password; owner's Today's checks card (undos, left, bookings not closed, unusual bills, Other items, referral bursts, cash difference) with Count the cash; owner edits Services & prices and Check limits; Back up / Restore; staff see customers' numbers masked. Details and limits: `MISUSE-CHECKS.md` | **Built** |
| 4.13 | Wallet top-up with tiered bonus (5/10/15% at ₹1000/2000/5000), swipe-down sheet | Logic |
| 4.14 | Referrals by code or friend's phone; ₹100 + ₹100 on the first paid visit; reversed if that visit is voided. **Full workflow (21 Oct): `FLOW.md` C3**: code on the thank-you WhatsApp / Refer → Share; friend gives code or the customer's mobile at the counter; **checked as typed** (green: first name, last initial, last 3 digits of the mobile; red: no match or own number; Add stays off while wrong); new numbers only, once per new customer, no self-referral | Logic · **Built** |
| 4.15 | **Staff Profile tab (user, 20 Oct): own details only, no business numbers** (no attendance grid and no customers/earnings stats on the main page). Top: photo (owner uploads), name, chair, today's check-in; details: mobile (login), chair, shift, weekly off, joined date, time with the salon. Sections: **Attendance** (joined date and how long, month totals present/late/leave/absent, calendar of present/late/leave/weekly off back to the joining month, last check-ins) · **Leave** (next approved leave, + Request leave, days taken this year, requests: Waiting for owner (withdraw) / Approved / Declined with owner's reason) · **Request leave** (dates, Casual/Sick/Other, half day, note, working days without the weekly off) · **Change password** (current + new twice, rules, owner resets if forgotten) · **Privacy & terms** (staff data notice first, customer-data rules, full policies, credits) · **Log out** (confirm sheet). Design: `design-studies/staff-profile.html`. **Built in the app (20 Oct)**: `src/screens/Me.tsx` (MyProfile, MyAttendance, MyLeave + request sheet, ChangePassword, StaffPrivacy, log-out sheet) | Designed · approved · **built** |
| 4.16 | **Leave approval flow (user, 20 Oct)**: stylist requests from Profile → Leave → owner's **Staff tab gets a Leave option**: badge on the Staff button, gold "Leave requests · N waiting" bar, flagged stylist card; Leave requests screen (Waiting / Approved / Declined) shows dates, type, working days, note, the stylist's bookings on those days and who else is working. **Approve**: if the stylist has bookings, owner picks "give them to a free stylist" (customers told on WhatsApp who will serve them) or "ask customers to rebook" (cancelled + WhatsApp). **Decline**: reason chips + text, sent to the stylist. **Stylist is notified** (phone notification, opens Profile → Leave). **On approval, automatically**: stylist's Calendar day turns blue "Leave" and he can't be booked that day (+ Book, Whole salon column "On leave"); his Attendance and the owner's attendance sheet / Excel show the day as leave (not absent, no selfie asked); Live floor chair shows "Off today". Phone notifications need the online sync (each person on their own phone); until then the stylist sees it in the app at next sign-in. Design: `design-studies/staff-leave-flow.html`. **Built in the app (20 Oct)**: engine `requestLeave` / `withdrawLeave` / `leaveImpact` / `approveLeave` (REASSIGN to a free stylist, or cancel for rebooking, with a WhatsApp message per customer) / `declineLeave` / `leaveUpdates` / `markLeaveSeen` / `myLeave` / `myAttendance`; leave blocks booking that stylist and counts as leave (not absent) in attendance and the Excel export, weekly off stays \"Weekly off\"; `LeaveRequests.tsx` for the owner (banner on the owner screen); in-app notification on the stylist's Home and Profile (phone push waits for online sync); Calendar shows LEAVE days and \"You're on leave\" | Designed · approved · **built** |

## 5. Appointments / Calendar
| # | Item | Status |
|---|---|---|
| 5.1 | **Calendar tab**: month view with gold booking counts, today ringed, closed days faded; tap a day → bookings in time order with status | Designed · Logic |
| 5.2 | **Book from a WhatsApp reply**: day, free slots (taken greyed out), services, stylist; the customer's reply saved as a note | Designed · Logic |
| 5.3 | **Confirmation message** after booking ("Booked! … Reply C to cancel") | Logic |
| 5.4 | **On-the-day reminder at 9:00** ("your haircut is today at 5:00 PM with Imran") | Logic · Designed |
| 5.5 | **Arrived** → opens the visit with the booked services; cancel; no-show | Logic · Designed |
| 5.6 | Rules: 10:00–20:00, 30-minute slots, Tuesday closed, no double-booking a stylist, no past times (all per-salon settings) | Logic |
| 5.7 | **Automatic sending**: one-tap (free) vs fully automatic (WhatsApp Business, paid per message) | **Open: ask the user** |
| 5.8 | **+ Book sheet — FINAL (user, 20 Oct), built in the app** (`src/components/BookSheet.tsx`; a new customer is saved only with their consent, reminders opt-in separate): one tall sheet, 5 parts unlocking in order: **1 Customer** (10-digit mobile → returning: name, visit no., last service, wallet, reminders status; new: name required + WhatsApp-reminders consent tick) · **2 Services** (multi-pick chips with min and ₹, last-time service pre-picked, running total) · **3 Stylist** (you by default; stylists who can't do all picked services greyed; "Any free" picks the first free one) · **4 Day and time** (next 14 days, closed days off; 30-min slots open only where the whole service length fits, no past times, no double-booking; "No room on … try another day or Any free") · **5 Note + WhatsApp confirmation toggle with message preview**. Sticky summary + Book. After Book: the day opens, the new block scales in with a gold halo, toast "Booked · … WhatsApp confirmation sent". Tapping an empty spot on your own timeline opens Book at that time. Design: `design-studies/staff-calendar-final.html` | Designed · Logic |

## 6. Owner app — **CONFIRMED by user, 19 Oct** (demo: `design-studies/owner-demo/owner-app-demo.html`)
| # | Item | Status |
|---|---|---|
| 6.1 | **Bottom bar = 4 tabs (user, 19 Oct): Live · Earnings · Staff · Customers.** Attendance tab removed; attendance moves inside **Staff**. Visits tab replaced by **Customers** (where void-a-bill goes: to decide). Tab map: `design-studies/owner-map/owner-app-map.html` (to update to 4 tabs) | Decided |
| 6.2 | **Live floor**: Higgsfield clay-3D salon (`design-studies/live-floor/final-live-floor.html`, https://claude.ai/artifact/7ezVmnK7b5bMkiWj6Snj4f). **Receptionist** (Meera) seated at the front desk; **no waiting area** (user, 19 Oct); 3 stylists working; chair labels with progress rings; cards below; "Front desk" status row. Customers walk with **real walk cycles** cut from Higgsfield video clips (frame chosen from distance walked, natural 24 fps pace). Loop ≈41 s: Dev checks in → chair 3 beard trim → pays ₹300 (total ₹6,800→₹7,100) → leaves; Neha wallet top-up (not counted as earnings); Rahul books a haircut for Sat 4:30 PM. Assets and credit log in `higgsfield-assets.md`. 3D/three.js rebuild shelved (`PLAN-3D.md`) | **Approved (19 Oct)** · build into the app as designed |
| 6.3 | **Earnings** (user, 19 Oct): earnings circle dropped. **Chosen: Layout 2 kept as it is + Layout 3's three comparison cards** (Today / 7 days / Month, each with its change and its own trend line; tap a card to switch period) at the top. Below: total vs previous period, bar chart (last 7 days / 8 weeks / 6 months, current in gold, previous marked), stylists ranked with customers and earnings; **tap a stylist → full page**: their total and change vs before, a **line graph that follows the page's switch** (user, 19 Oct, replaces the Now/Before bars): **Day** = each day of the last 7 days (closed day marked, dashed daily average, today = so far); **Week** = each week of the current month (upcoming weeks empty) with last month's weeks as a dashed line, badge **"vs September"** = this week vs the same week last month; **Month** = the last 12 months (current month = so far, best month labelled, dashed monthly average), Day/Week/Month switch, customers with time, service, amount, payment type (week/month: day-by-day / week-by-week + top services). `design-studies/owner-earnings-final.html` | **Approved (19 Oct)** |
| 6.4 | **Attendance**: today's selfies (green on time / orange late), month grid per person, **Excel export (one sheet per day + summary)** with barber-pole progress | Logic · Designed · **19 Oct: moves into the Staff tab** (no separate Attendance tab) |
| 6.5 | **Staff tab** (user, 19 Oct): grid of **rectangular photo cards** (profile photo, name, chair, today's attendance badge In/Late/On leave/Not in yet, today's customers + earnings); **gold + button lower right** opens *Add a stylist* (**owner uploads the photo** from gallery or camera, name, mobile = login, chair, shift start, weekly off, first password). **Tap a card → profile**: photo, contact, today's status, October at a glance (present/late/leave/customers), options: Attendance (calendar, selfie, export), Leave, Shift & weekly off, Performance, Account (photo, mobile, chair, reset password), Deactivate. **Salary & commission and Advances removed (user, 19 Oct).** `design-studies/owner-staff-tab.html` | **Approved / final (19 Oct)** |
| 6.6 | **Visits**: every visit, **void with reason** (refunds wallet, reverses referral) | Logic · Designed · **19 Oct: voiding a bill moves to the Customers tab** (open the customer → their bill → Void with reason) |
| 6.7 | **Customers tab** (19 Oct): search name/mobile; counts (customers, new this month, not seen 30+ days); filters All · **⭐ Top spenders** · Regulars · Not seen 30+ · Wallet balance · New; list **sorted by highest spending** (Sort control); **Top spenders** screen (user, 19 Oct): Top 20 / Top 30 switch, All time / This year / Last 3 months, ranked highest first with spend bar, visits and main stylist, total and share of all earnings; rows: name, tag, last visit + stylist, visits, total spent, wallet. **Tap → profile**: Call, WhatsApp, Book; wallet + Top up; visits & bills (tap a bill); next booking; reminders on/off; send their data; delete. **Tap a bill → Cancel bill** with reason (wrong customer / wrong service / entered twice / didn't pay / other) and a plain list of what happens; cancelled bills stay struck through. `design-studies/owner-customers-tab.html` | **Approved (19 Oct)** |
| 6.8 | Wallet money held, top customers (scroll down on Earnings) | Logic |

## 7. Motion (from `MOTION.md`)
| # | Item | Status |
|---|---|---|
| 7.1 | Approved set: press squeeze, card morph, fade, letter reveal, grid pop-in, list stagger, materialize, exit, icon swap, tabs, swipe sheet, receipt print, barber pole. **The keypad never animates.** Reduced-motion respected | Decided |
| 7.2 | **P1** button → spinner → ✓ · **P2** stretchy tab pill · **P3** charts draw while numbers count up · **P4** export status pill · **P5** gold flood into the PAID stamp · **P6** staggered stops | Designed |
| 7.3 | P7 tilting gold badge: only if the top-stylist bonus is approved | Open (see 10) |

## 8. Privacy (DPDP Act) — standard in every salon
| # | Item | Status |
|---|---|---|
| 8.1 | Two separate **unticked** consents: keep details (required) · WhatsApp reminders & offers (optional); proof saved (time, notice version, staff) | Logic · Designed |
| 8.2 | **Under 18** → parent/guardian consent, guardian's number | Logic · Designed |
| 8.3 | **STOP** / one-tap stop messages; every marketing message ends "Reply STOP" | Logic · Designed |
| 8.4 | **Send the customer their data** on WhatsApp | Logic · Designed |
| 8.5 | **Delete**: owner only; close the wallet first (paid-in money refunded, bonus cancelled), then two taps; bills kept without name or number | Logic · Designed |
| 8.6 | **Automatic retention**: inactive customers 3 years, selfies 1 year, message copies and old bookings 1 year | Logic |
| 8.7 | **Privacy & terms screen**: business details, rights, grievance officer, retention, policy links, credits | Logic · Designed |
| 8.8 | No cookies, ads, analytics or trackers; camera is the only permission | Audited |

## 9. Legal pack and release (every salon)
| # | Item | Status |
|---|---|---|
| 9.1 | Salon details in **`src/config/salon-details.json`** (one file per salon) | Logic |
| 9.2 | `npm run legal` → filled policies + cookie-free brown glass web pages | Logic |
| 9.3 | Documents: privacy policy, terms, refund, cookie policy (+ banner, kept off), DPA, staff notice, deletion process, breach plan, SDK audit, licences, accessibility, fair-marketing checklist, counter card (English + Hindi) | Done (templates) |
| 9.4 | `npm run release-check` **blocks the APK** while any detail is unfilled, any contrast check fails, or tests/types fail | Logic |
| 9.5 | Lawyer review of templates (once); CA on GST for wallet top-ups | To do (user) |
| 9.6 | Logo and intro: confirm the AI tool allows commercial use without its mark, or regenerate | To do (user) |
| 9.7 | Replace the Expo placeholder app icons with the salon logo | To do at build |

## 10. Open decisions (must be answered before the build)
| # | Question | Notes |
|---|---|---|
| 10.1 | Appointment reminders: one-tap (free), fully automatic (WhatsApp Business), or one-tap with automatic as an upgrade? | Recommended: one-tap, automatic as a paid upgrade |
| 10.2 | Waiting bench on the Live floor: add a "Customer waiting" step when all chairs are busy? | Asked 15 Oct |
| 10.3 | Number of chairs per salon (drawing grows to 4/6/8) set on delivery day? | Asked 15 Oct |
| 10.4 | F5: monthly bonus for the top stylist? | Ask the owner |
| 10.5 | Real prices, bonus tiers, referral amounts, service due-back days per salon | Per salon |
| 10.6 | App name and referral link domain | Per salon |
| 10.7 | Online sync provider (recommended: servers in India / Mumbai). **22 Oct recommendation: Firebase (Firestore asia-south1), see `SYNC-PLAN.md` decision B** | Waiting for user |
| 10.12 | **Decided 24 Oct (user): APK files, not the Play Store; a branded APK per salon; demo APK first (`PLAN-24-OCT.md` §3).** Earlier option: one Play Store app for all salons (salon code at first launch, salon's name/logo inside) vs a listing per salon** — Google Play's spam policy disallows many near-identical apps; recommended: one app (`SYNC-PLAN.md` decision A) | **Decided** |
| 10.13 | **Decided 24 Oct (user): WhatsApp only by staff tap, never automatic (`PLAN-24-OCT.md` §2).** Earlier option: WhatsApp automatic (Cloud API, paid per message) vs one-tap from the salon phone (free), by plan — `SYNC-PLAN.md` decision C, prices in `../founder/RUNNING-COSTS.md` | **Decided** |
| 10.8 | **Live floor ↔ real visits — DECIDED 19 Oct (user)**: staff enters customer + *Start visit* (or *Arrived*) → customer walks in to **that stylist's chair**; **timer starts then** and runs until **payment collected**; customer stays seated till paid → walks to desk, "₹ PAID", walks out → stylist's **next customer** arrives, and so on. Next customer entered while the chair is busy waits at the front desk. **All live, synced to the owner's app** (needs online sync 3.4). Uses existing visit fields `staffId`, `createdAt`, `paidAt`. Still to make: a matched set of customer figures (walk + seated) — to be quoted | Decided · needs sync + figure set |
| 10.9 | **Empty salon (asked 19 Oct)**: open with no customers → receptionist at desk, stylists idle at their stations, chair labels "Free", desk line "Ready"; outside opening hours or closed day (Tue) → lights dimmed, "Closed · opens 10:00 AM", nobody inside, today's total still shown. Needs idle stylist poses + an empty, no-receptionist salon picture | Approved (19 Oct): include at build |
| 10.10 | **Staff on leave (asked 19 Oct)**: owner marks leave (Staff/Attendance); that stylist's figure disappears and their chair shows "Off today", greyed, and no customer is sent there. No selfie by shift start + grace → chair shows "Not in yet". App has no leave record today (only check-in), so this adds one | Approved (19 Oct): include at build |
| 10.11 | **Per-salon Live floor (19 Oct, user)**: the approved Live page is the template. When a salon hands over its details, adjust it for that salon: number of chairs, stylist names and chairs, receptionist, opening hours / closed day, salon picture and figures if needed. All rules in 6.2 and 10.8–10.10 stay | Decided · done per salon at delivery |

## 11. After the app is built
| # | Item | Status |
|---|---|---|
| 11.0 | **Build later, all together (user, 22 Oct: "do not build now, just plan and record; it will be built once after everything I told")**. Planned, not started; build only when the user says so: (a) live sync between phones, backup and server checks: `SYNC-PLAN.md` (decisions 10.7, 10.12, 10.13 first); (b) WhatsApp Cloud API sending and plans/prices: `../founder/RUNNING-COSTS.md`; (c) buyer-panel app changes: `../founder/PANEL-FEEDBACK.md` (quick bill, selfie on/off, bill without mobile number, Hindi, data import); (d) fresh-start fixes: `FRESH-START-CHECK.md`; (e) liquid glass look across all screens (1.5): `design-studies/glass-home/`; (f) **board round 2 conditions (user, 22 Oct: "mind these while rebuilding")**, `../founder/board.md`: build live sync first and prove the owner's live floor matches the real chairs; one-minute walk-in entry timed with real barbers, with a missed-entry check; something in it for the barber (own earnings, bookings); ₹500 plan uses one-tap WhatsApp, automatic WhatsApp as a paid add-on; Hindi/local language; every handoff mapped with what the user sees when it fails; Sunday support owned; first version says one thing: see your salon live from anywhere; (i) **app sounds (24 Oct)**: `SOUNDS.md`, 11 sounds made with the earshot skill; payment sound = option C, chime run (founder, 24 Oct); (h) **founder decisions 24 Oct**: `PLAN-24-OCT.md` (Help button on Home → Claude answers or forwards to the founder; one-tap WhatsApp only; APK distribution; demo APK first, real salon setup after the sale); (g) **competitor complaints fixed and features bettered (user, 24 Oct)**: `COMPETITOR-FIXES.md`, 13 complaint fixes and 17 features, marked V1 (first salons) or V2; (j) **salon-day test fixes (25 Oct)**: `SALON-DAY-TEST.md`, a full Saturday with 20 customers, 4 stylists and the owner on the real app: bill without a mobile number in V1; UPI check next to the cash count; owner approval of off-list services from the owner's own phone or with a limit; staff wallet top-up with WhatsApp receipt (owner setting); top-up sheet with no payment method pre-picked + receipt; ignore taps for half a second after Collect; salon name asked in setup and used in every message; booking message wording (no "Reply C"); missed-entry signals; quick name + PIN switch on a shared phone; (k) **BUILT 27 Oct (user: "rectify that in app"): all confirmed security findings fixed, lessons in `SECURITY-LESSONS.md`, tests in `tests/security.test.ts` and `tests/store.test.ts`.** Security check run 1 (26 Oct): `SECURITY-CHECKS.md`, `security/run-1/REPORT.md`: fail closed on a load error (no demo data, recovery screen); validate restored backups and ask the owner password before restore; no staff undo when the clock is behind; wallet refund in time order; hardening list in report section 6; plus run 2 (27 Oct, `security/run-2/REPORT.md`): no purge when the phone clock is far ahead of saved data, no future-dated check-in (save order flagged to the owner), cash check against a fresh total and no backdated checkout, who/when on booking no-show and cancel shown to the owner, clock guard over all saved records, no customer name in referral notes; then re-run the security check on all 10 confirmed findings and the backup-restore-after-deletion area | Planned · waiting for the user's go |
| 11.1 | **Launch / promo video** of the app to pitch salon owners (Remotion-style, dark and gold, real screens; see `design-studies/prompt-motion-notes.md`) | Decided: after the app |

---

## How to add a new request
Add a row in the right section with status **Decided** (or **Open** if it needs an answer), plus a line in `FLOW.md` under Decisions if it changes how the salon works. Commit and push straight away.
