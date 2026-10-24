# Consumer panel feedback: what to change in the app and the offer (22 Oct)

Source: `founder/panel/results.md` (100 simulated salon owners, seed 339387, pitch `founder/pitch.md`: ₹4,999 setup + ₹999/month, first month free) and `founder/panel/price-range.md`.
Simulated buyers, not customers: use this to choose what to fix and test, not as a sales forecast.

**Result: 9 buy, 91 pass (9%).**
- 5–8 chair salons: 20%. 2–4 chair: 10%. 1–2 chair barbers: 0 of 35.
- Owners who are often away: 33%. Young tech owners: 29%. Register loyalists, "counts every rupee", "asks other owners first" and "tried an app before": 0%.
- Price range from the four price answers: ₹206–₹1,003 a month, least resistance about ₹306, median "too expensive" ₹1,200. ₹999 sits at the top edge.

Counts are approximate (keyword match over the 100 answers' "objection" and "would change my mind" fields).

| # | What buyers said | How many | What to change | Where | Status |
|---|---|---:|---|---|---|
| 1 | ₹4,999 up front before seeing it work | ~65 named it in "what would change my mind" | Charge setup only after the free month, if the staff are still billing in the app; or drop it | Offer | Proposed |
| 2 | Staff won't take a selfie and type every walk-in at rush hour; the app will go unused like the last one | about two-thirds of objections | Faster walk-in: bill in under 30 s; "quick bill" without customer details; show the owner a "bills in the app vs. UPI received" match so drift is visible | App | Proposed |
| 3 | Built for bigger salons; a 1–2 chair barber already sees the chair and the drawer | 0 of 35 barbers buy; ~28 ask for a ₹299–499 plan | A small-shop plan: customer side only (WhatsApp reminders, wallet, referral, bills), no staff check-in, no setup fee, ₹299–399 | Offer + app (plan switch hides staff features) | Proposed |
| 4 | No owner I know / no distributor uses it | ~30 | Pilot 3–5 salons in one area free, then use them as references; distributor referral | Marketing | Proposed |
| 5 | Lose customer list and wallet balances if a phone breaks, a stylist leaves, or the company shuts | ~20 | Online backup + "download my data any time, even after I stop paying", in writing | App (BUILD-SPEC 3.4 sync) + offer | Backup file **built**; online sync not built |
| 6 | Selfie check-in tells staff they aren't trusted (several lost stylists last year) | ~10 want it optional | Owner switch: selfie check-in on/off; attendance by tap only | App | Proposed |
| 7 | English only | ~19 | Hindi screens (then other languages); WhatsApp messages in Hindi | App | Proposed |
| 8 | Who fixes it on a busy Sunday | ~18 | Sunday phone support in the offer; app keeps billing offline and syncs later | Offer + app | Offline works today (each phone keeps its data); support is an offer item |
| 9 | Many customers won't give a mobile number | frequent in objections | "Walk-in without number" bill (counts in cash and earnings, no reminders) | App | Proposed |
| 10 | No monthly fees, ever | ~14 | Yearly prepaid plan at a discount (e.g. 10 months' price) | Offer | Proposed |
| 11 | "Why switch from my current billing app?" | a few | Free data import from Zylu/MioSalon exports | App | Proposed |

What the buyers liked (keep and lead with it): the cash-drawer check, cancelled-bill and walk-out checks, seeing the salon from anywhere, a branded app, the free first month.

**One-line takeaway:** sell first to 5–8 chair salons and owners who are often away, take the setup fee only after the free month, and add a ₹299–399 customer-side plan for small shops. `/founder-offer` and `/founder-pricing` can turn this into the next pitch, then a quick 20-buyer re-run checks it.
