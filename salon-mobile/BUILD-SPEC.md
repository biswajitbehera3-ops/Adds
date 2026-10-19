# Salon App: Master Build Checklist

**The single list of everything the app must contain.** Every request and decision goes here the moment it's made.
When the app is built, each line is ticked only once it works in the installed app.

The rule (from the user): **don't build the app until every component is complete.** Until then, design, decide and record here.

Status key: **Decided** = agreed, not built · **Designed** = shown in a demo/mock · **Logic** = rules written and tested in code · **Built** = in the installable app (none yet in the new look) · **Open** = waiting for a decision.

Where things live:
- Screens demo: `design-studies/app-interface.src.html` (published link: https://claude.ai/artifact/4uia3iM8nDTeofW7dMX8dr)
- Login demo: `design-studies/login-prototype.src.html` (https://claude.ai/artifact/YHAPPq7mSU9TsmyQuz5Tac)
- Rules: `src/domain/engine.ts`, with tests in `tests/`
- Flow details: `FLOW.md`
- Motions: `MOTION.md`
- Legal: `legal/`

---

## 1. Look and feel
| # | Item | Status |
|---|---|---|
| 1.1 | **Brown glass look** everywhere: brown studio backdrop, frosted-glass cards, gold only for money and the main button, cream text, Urbanist font. Replaces the old "grooming-tin" styling | Decided · Designed |
| 1.2 | Brand assets: salon logo + intro video (`assets/brand/`) | Have files; licence action pending (see 9.6) |
| 1.3 | Other style boards (Vulcanico/Noturno, the bold styles) were **explorations only**; not used | Decided |
| 1.4 | Text contrast passes WCAG AA (`node scripts/contrast-check.mjs`) | Logic |

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
| 3.4 | **Online sync**: all phones share the salon's data live; owner sees everything from anywhere; this is also the backup; works offline and catches up | Decided · not built |
| 3.5 | Each salon gets its **own app** (own name, logo, prices); no salon sees another's data | Decided |
| 3.6 | Delivered as an **APK file** (Android); Play Store optional later | Decided |

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
| 4.9 | Bottom bar: Home · Customers · gold **+** (customer walked in) · Reminders (with due count) · **Calendar** | Designed |
| 4.10 | **Refer** moved into each customer's profile (no longer in the bar) | Decided |
| 4.11 | Customers list + profile (visits, wallet history, referral code) | Logic |
| 4.12 | **Reminders** (per-service due dates, WhatsApp message, only to opted-in customers) | Logic |
| 4.13 | Wallet top-up with tiered bonus (5/10/15% at ₹1000/2000/5000), swipe-down sheet | Logic |
| 4.14 | Referrals by code or friend's phone; ₹100 + ₹100 on the first paid visit; reversed if that visit is voided | Logic |

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

## 6. Owner app
| # | Item | Status |
|---|---|---|
| 6.1 | Bottom bar: **Live** · Earnings · Attendance · Staff · Visits | Designed |
| 6.2 | **Live floor**: Higgsfield clay-3D salon (`design-studies/live-floor/final-live-floor.html`, https://claude.ai/artifact/7ezVmnK7b5bMkiWj6Snj4f). **Receptionist** (Meera) seated at the front desk; **no waiting area** (user, 19 Oct); 3 stylists working; chair labels with progress rings; cards below; "Front desk" status row. Customers walk with **real walk cycles** cut from Higgsfield video clips (frame chosen from distance walked, natural 24 fps pace). Loop ≈41 s: Dev checks in → chair 3 beard trim → pays ₹300 (total ₹6,800→₹7,100) → leaves; Neha wallet top-up (not counted as earnings); Rahul books a haircut for Sat 4:30 PM. Assets and credit log in `higgsfield-assets.md`. 3D/three.js rebuild shelved (`PLAN-3D.md`) | **Approved (19 Oct)** · build into the app as designed |
| 6.3 | **Earnings**: today's earnings ring (cash/UPI/wallet), vs last week; visits with a 7-day trend; staff ranking | Designed · Logic · **19 Oct: user asked to replace the earnings circle with something more stunning** — options A Gold pour, B Day curve, C Salon clock bloom in `design-studies/owner-earnings-options.html` · **Open: user to pick** |
| 6.4 | **Attendance**: today's selfies (green on time / orange late), month grid per person, **Excel export (one sheet per day + summary)** with barber-pole progress | Logic · Designed |
| 6.5 | **Staff**: add (name, mobile, chair, password), reset password, deactivate | Logic · Designed |
| 6.6 | **Visits**: every visit, **void with reason** (refunds wallet, reverses referral) | Logic · Designed |
| 6.7 | Customers list reachable from the owner area (for privacy requests) | Logic |
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
| 10.7 | Online sync provider (recommended: servers in India / Mumbai) | Decide at build |
| 10.8 | **Live floor ↔ real visits — DECIDED 19 Oct (user)**: staff enters customer + *Start visit* (or *Arrived*) → customer walks in to **that stylist's chair**; **timer starts then** and runs until **payment collected**; customer stays seated till paid → walks to desk, "₹ PAID", walks out → stylist's **next customer** arrives, and so on. Next customer entered while the chair is busy waits at the front desk. **All live, synced to the owner's app** (needs online sync 3.4). Uses existing visit fields `staffId`, `createdAt`, `paidAt`. Still to make: a matched set of customer figures (walk + seated) — to be quoted | Decided · needs sync + figure set |
| 10.9 | **Empty salon (asked 19 Oct)**: open with no customers → receptionist at desk, stylists idle at their stations, chair labels "Free", desk line "Ready"; outside opening hours or closed day (Tue) → lights dimmed, "Closed · opens 10:00 AM", nobody inside, today's total still shown. Needs idle stylist poses + an empty, no-receptionist salon picture | Approved (19 Oct): include at build |
| 10.10 | **Staff on leave (asked 19 Oct)**: owner marks leave (Staff/Attendance); that stylist's figure disappears and their chair shows "Off today", greyed, and no customer is sent there. No selfie by shift start + grace → chair shows "Not in yet". App has no leave record today (only check-in), so this adds one | Approved (19 Oct): include at build |
| 10.11 | **Per-salon Live floor (19 Oct, user)**: the approved Live page is the template. When a salon hands over its details, adjust it for that salon: number of chairs, stylist names and chairs, receptionist, opening hours / closed day, salon picture and figures if needed. All rules in 6.2 and 10.8–10.10 stay | Decided · done per salon at delivery |

## 11. After the app is built
| # | Item | Status |
|---|---|---|
| 11.1 | **Launch / promo video** of the app to pitch salon owners (Remotion-style, dark and gold, real screens; see `design-studies/prompt-motion-notes.md`) | Decided: after the app |

---

## How to add a new request
Add a row in the right section with status **Decided** (or **Open** if it needs an answer), plus a line in `FLOW.md` under Decisions if it changes how the salon works. Commit and push straight away.
