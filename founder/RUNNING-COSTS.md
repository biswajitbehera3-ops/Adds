# What the app costs to run after it is published (22 Oct)

For setting the monthly price. Prices checked on 22 Oct 2026; sources at the end. Rates before GST unless said; Meta and Google add 18% GST on Indian bills (claimable if you are GST-registered). The sync plan these costs belong to is `salon-mobile/SYNC-PLAN.md`.

## 1. WhatsApp (the biggest cost per salon)

Meta charges per delivered message, by type (India):

| Type | Rate | What we would send |
|---|---:|---|
| Utility | ₹0.115 | Bill/receipt, booking confirmation, on-the-day booking reminder, leave notice, wallet top-up confirmation |
| Authentication | ₹0.115 | 4-digit codes for wallet spends and referrals |
| Marketing | ₹0.8631 | "Due back for a haircut" reminders, offers, birthday wishes |
| Service (replies when the customer writes first) | ₹0.115 | First 1,000 a month per salon number are free (from 1 Oct 2026) |

Meta's own sending service (Cloud API) has no monthly fee. A WhatsApp provider (AiSensy, Interakt, Wati) adds about ₹1,500–3,200 a month **per number**, so we go direct as a Meta Tech Provider (free).

**Per salon per month (estimate):**

| Salon | Bills | Bookings (×2 messages) | Due-back reminders | Codes | WhatsApp cost | with 18% GST |
|---|---:|---:|---:|---:|---:|---:|
| 1–2 chairs | 300 | 40 | 80 | 10 | ₹114 | ₹134 |
| 2–4 chairs | 650 | 120 | 180 | 30 | ₹261 | ₹308 |
| 5–8 chairs | 1,300 | 250 | 350 | 60 | ₹516 | ₹609 |

The due-back reminders are about 60% of the cost while being under a quarter of the messages: they count as marketing. **One-tap sending from the salon's phone (how the app works today) costs ₹0**, because the salon's own WhatsApp sends it.

## 2. Server and sync (Firebase, Mumbai)

| Item | Price | Per salon |
|---|---|---:|
| Firestore reads / writes | free 50,000 reads and 20,000 writes a day, then $0.03 per 100,000 reads, $0.09 per 100,000 writes (list price) | about 3,000 writes and 30,000 reads a month: under ₹5 |
| Storage for selfies and photos | a few MB per salon a month | under ₹5 |
| Cloud Functions (WhatsApp sending, checks) | free allowance, then per call | under ₹5 |
| Phone notifications (Cloud Messaging) | free | ₹0 |
| Crash reports (Crashlytics) | free | ₹0 |

Budget **₹20 per salon a month**. The free allowance covers roughly the first 15–20 salons.

## 3. Fixed costs whatever the number of salons

| Item | Cost | When |
|---|---:|---|
| Google Play developer account | $25 (about ₹2,200) | once |
| Meta Business verification, Tech Provider, Cloud API | free | once |
| Expo builds and app updates (EAS) | free up to 15 Android builds a month and 1,000 monthly users of updates; then Starter $19 (~₹1,700) a month up to 3,000 users | monthly, past ~200 salons |
| Domain and business email | about ₹300 a month | monthly |
| Support phone number (SIM / WhatsApp for support) | about ₹300 a month | monthly |
| Privacy policy and terms pages | free (hosted with Firebase) | — |
| Lawyer (terms, privacy, DPDP) and CA (GST) | quote needed | once, then yearly |

No Apple account is needed while the app is Android only.

## 4. Collecting your monthly fee

Razorpay Subscriptions with UPI AutoPay: no setup fee; about 2% per payment plus 18% GST on the fee. On ₹999 that is **about ₹24**. Plain UPI to your account costs ₹0, but someone has to chase each salon every month.

## 5. What one salon costs you each month

| | 1–2 chairs | 2–4 chairs | 5–8 chairs |
|---|---:|---:|---:|
| WhatsApp automatic (with GST) | ₹134 | ₹308 | ₹609 |
| Server and sync | ₹20 | ₹20 | ₹20 |
| Payment fee (on ₹999) | ₹24 | ₹24 | ₹24 |
| **Total with automatic WhatsApp** | **₹178** | **₹352** | **₹653** |
| Total with one-tap WhatsApp | ₹44 | ₹44 | ₹44 |

Not included: your own time for support and setup visits, and the fixed costs above (about ₹600 a month until ~200 salons).

## 6. What this means for the monthly price (for discussion)

- At **₹999 for every salon size**, you keep about ₹650 from a 2–4 chair salon but only about ₹350 from a 5–8 chair salon, because big salons send more WhatsApp messages. Sizing the plan by chairs or by messages fixes that.
- One option, based on these costs and the buyer panel:

| Plan | For | WhatsApp | Price | Your cost (all messages used, GST, server, payment fee) | You keep |
|---|---|---|---:|---:|---:|
| Small | 1–2 chairs, customer side only, no staff features | one-tap from salon phone | ₹399–499 | ~₹30–35 | ~₹365–465 |
| Salon | up to 4 chairs | automatic, includes 1,000 utility + 200 due-back messages | ₹999 | up to ~₹385 | ~₹615 |
| Pro | 5–8 chairs or 2 branches | automatic, includes 2,000 utility + 400 due-back messages | ₹1,499 | up to ~₹735 | ~₹765 |
| Extra messages | any plan | beyond the allowance | ₹1.25 per due-back, ₹0.20 per utility | ₹1.02 / ₹0.14 | small margin |

- The buyer panel's acceptable range was about ₹206–1,003 a month; the board and CFO said ₹1,499 for big salons helps break-even (about 41 salons instead of 70). Both point to a price by salon size.
- The setup fee question (the panel's top objection) is separate: costs here don't depend on it.

## Sources (checked 22 Oct 2026)

- WhatsApp rates: Meta pricing page (developers.facebook.com/documentation/business-messaging/whatsapp/pricing) for service messages charged after 1,000 free per number from 1 Oct 2026; India per-message rates ₹0.8631 marketing and ₹0.115 utility/authentication/service as listed by Flowcall (Oct 2026), Wati and Ominiflow. Meta's own INR rate card (CSV) could not be opened from here: check it before signing up.
- WhatsApp providers: AiSensy, Interakt, Wati published plans (₹1,500–3,200/month entry).
- Firestore: cloud.google.com/firestore/pricing (list price; Mumbai may differ slightly).
- Supabase (alternative): supabase.com/pricing, Pro $25/month.
- Expo EAS: expo.dev/pricing.
- Google Play spam policy (one app, not one per salon): support.google.com/googleplay/android-developer/answer/9899034.
- Razorpay: razorpay.com pricing and Subscriptions pages (2% + GST; no subscription setup fee).
- Message counts per salon are estimates from typical bills per chair; replace them with real counts from the pilot salons.
