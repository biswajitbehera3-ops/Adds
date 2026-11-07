# Operations: how the business runs day to day (7 Nov 2026)

From `idea.md`, `offer.md`, `numbers.json`, `cfo.md`, `RUNNING-COSTS.md`, `marketing.md`, `board.md` and the salon app's own docs (`salon-mobile/SALON-ONBOARDING.md`, `SYNC-PLAN.md`, `SECURITY-LESSONS.md`). One founder, no pay taken (31 Oct), Bhubaneswar first. Not legal, tax or financial advice.

## 1. The daily cycle (the founder's day)
✱ = the salon owner or staff see this step.

| Time | Step |
|---|---|
| 9:00 | **Health check** (10 min): every live salon billed yesterday? Any salon with zero bills, a sync error, or a Help request waiting → call first. |
| 9:15 | **Support** ✱: answer Help-button requests the AI helper forwarded; WhatsApp/phone calls from owners. |
| 10:00–11:00 | Admin: payments due, follow-ups, Instagram post (Mon/Wed/Fri). |
| 11:00–16:00 | **Tue–Thu: 4 demo visits** ✱ (salons are quiet then) · **Fri: setup visit** ✱ (half a day) · **Mon: price changes, staff changes, small fixes** ✱ requested by owners. |
| 16:00–17:00 | WhatsApp the film + price sheet to owners seen today ✱; day-2 / day-7 calls to new salons ✱. |
| Evening | Answer urgent support only ✱. Sundays: support phone on (it's the salons' busiest day), no visits. |

Weekly: Saturday morning, the three marketing numbers (`marketing.md` §7) and the build list for the app.

## 2. Suppliers and tools (what the business pays for)
| Need | Supplier | Price (public) | Notes |
|---|---|---|---|
| Live sync, database, photos, notifications | **Google Firebase** (Firestore, Auth, Storage, Messaging), Mumbai region | Free daily allowance, then list price ($0.03 / 100k reads, $0.09 / 100k writes); budget **₹20 per salon a month** | cloud.google.com/firestore/pricing; free tier covers ~15–20 salons. Alternative: Supabase Pro $25/month (supabase.com/pricing) |
| App builds + in-app updates | **Expo EAS** | Free up to 15 Android builds a month and 1,000 monthly update users; Starter **$19/month** (~₹1,700) up to 3,000 users | expo.dev/pricing; paid tier only past ~200 salons |
| Help button (AI first answer) | **Anthropic API** (Claude) | ~₹6 per request, ~5 per salon a month (estimate) → ~₹30 | Per `PLAN-24-OCT.md`; replace with real use after the first salons |
| Monthly fee collection | **Razorpay** Subscriptions with UPI AutoPay (alternatives: Cashfree, PhonePe for Business) | ~2% + 18% GST on the fee → ~₹16.5 on ₹699; no setup fee | razorpay.com pricing. Plain UPI to your account costs ₹0 but means chasing 5–100 salons every month |
| Domain + business email | Any registrar + Zoho Mail or Google Workspace | ~₹300 a month together | Quote needed for the exact plan |
| Support phone + WhatsApp Business | Jio / Airtel / Vi prepaid SIM | ~₹300 a month | A separate number from your personal one |
| Demo phone | Mid-range Android (₹10,000–15,000) | ₹10,000 (estimate in `cfo.md`) | ₹0 if you use your own phone |
| Print (price sheets, cards, the salon list) | Local print shop | ~₹1,500 a month at launch | `marketing.md` §7 |
| Lawyer (terms, privacy, DPDP review) + CA (GST, books) | Local professionals | **Quote needed** | Open question; one-off, then yearly |

Not needed now: Google Play account ($25, APK is sideloaded), Apple Developer ($99/yr, iPhones get the web app), WhatsApp API provider (staff tap only).

**`numbers.json` is unchanged:** the costs above match it (₹167 per salon a month, ₹3,600 fixed). The CFO doesn't need to re-run.

## 3. People
| Role | Who | Hours | Pay |
|---|---|---|---|
| Sales, setup, support, product | **Founder** | ~6 days a week | ₹0 (31 Oct) |
| Support helper | Part-time, from about **40 salons** (`cfo.md`: one person supports ~60) | ~2–3 hours a day + Sundays | Budgeted at ₹100 per salon a month (estimate) |
| Local setter (later) | Commission-based, after the routine in §4 is written down (board condition) | Per setup | A fee per salon set up, to decide |

**First month (slow):** founder only. **At ~40 salons:** add the part-time helper for Sunday and evening support. **At ~60:** a second person who can do setups.
Payroll costs beyond pay (PF, ESI, Odisha professional tax) apply once you employ people. Ask the CA.

## 4. Routines (one page each)
**A. Demo visit (10 minutes)**
1. Arrive Tue–Thu, 11 am–4 pm. Ask for the owner by name (from the list).
2. Opening line (`marketing.md` §4). If the owner is busy, ask for a day and time and leave.
3. Demo on the demo phone: reminder → referral → owner's view → price and guarantee.
4. Close: "Which day suits you for setup?" Write the answer on the list card.
5. Same evening: WhatsApp the film + price sheet. Day 3: one follow-up. Then stop.

**B. Setup visit (half a day)**
1. Before: build the salon's branded APK, with name, logo, services and prices from the owner's rate card.
2. Collect the first ₹5,000 (UPI); give a receipt.
3. Install on the owner's and every stylist's Android phone; iPhone users get the home-screen web app.
4. Owner sets the owner password; add each stylist (photo, mobile, chair, shift, weekly off, first password).
5. Teach each stylist one bill; make the first real bill together.
6. Show the owner Today's checks, Earnings and the Help button.
7. Leave the support number on a card at the counter.
8. Calls on day 2 and day 7; on day 30, check the 20-day billing guarantee and collect the second ₹5,000, or fix it, or refund.

**C. Support request**
1. The Help button → the AI helper answers how-to questions; anything else is forwarded to you.
2. Reply within 1 hour (9 am–9 pm, Sundays included); visit within 2 days if a salon stops billing.
3. Log it (salon, problem, fix). The same problem twice → onto the app's build list.

**D. Price or staff change**
- The owner can change prices themselves (owner menu → Services & prices). If they ask you, do it remotely the same day; paid bills keep their old price.

**E. Monthly fee**
1. Razorpay sends the ₹699 UPI AutoPay request on the salon's day.
2. If it fails: WhatsApp reminder on day 1, a call on day 5.
3. Day 15: the app shows a payment notice to the owner. Data is never deleted or locked away for non-payment; the owner can always download it.

**F. Salon leaves or asks for its data (DPDP)**
1. Export everything (owner menu → Back up data) and send it to the owner.
2. Delete the salon's data from the server within 30 days, and confirm in writing.

**G. App update**
1. Every build goes through the security check, then the code map refresh, then the tests (`CLAUDE.md`).
2. Release small fixes as in-app updates; bigger ones as a new APK, installed on the next visit or through the "New version" button.

## 5. Licences, registrations and insurance (confirm each yourself)
| Item | Needed? | Where to check |
|---|---|---|
| PAN + a current bank account in the business name | Yes (to take payments) | Your bank |
| **Udyam (MSME) registration** | Recommended, free | udyamregistration.gov.in |
| **GST registration** | Required once turnover exceeds **₹20 lakh a year** for services (₹10 lakh in special-category states; Odisha is not one); voluntary below it | cbic-gst.gov.in FAQ; gstcouncil.gov.in "Registration under GST Law" |
| **Odisha Shops & Commercial Establishments registration** | Usually yes once you have an office or employees; check whether a home-based sole proprietor needs it | labourdirectorate.odisha.gov.in (Act and rules); apply via investodisha.gov.in (GO SWIFT) |
| Odisha professional tax | When you employ people (and possibly for yourself) | Ask the CA |
| Data protection (DPDP Act 2023) | Yes: privacy notice, consent, deletion on request (already in the app's legal pack) | `salon-mobile/legal/` and a lawyer's review |
| Business name / trademark | Before the brand is public | ipindia.gov.in (after `/founder-brand`) |
| Insurance: cyber or professional liability | Optional at the start; worth a quote at ~20 salons | Quote from an insurer |

Rules differ by place and change; confirm each with the authority or a CA or lawyer before you rely on it.

## 6. Risk register
| # | What goes wrong | Likely | How bad | Plan |
|---|---|---|---|---|
| 1 | **Stylists stop entering bills at rush hour** | High | High (wrong numbers, owner loses trust) | One-minute billing; the day-30 guarantee shows it early; health check each morning; visit within 2 days |
| 2 | **Live sync has a bug that loses or doubles a bill** | Medium | Very high | Test on 2 phones offline/online before Day 0; the server checks money rules; daily server backups; run one salon for 30 days before scaling (board) |
| 3 | **You're ill or away** | Medium | High (only person) | The Help button's AI answers how-to questions; a written routine (§4); a backup contact from ~20 salons |
| 4 | **Android blocks installing the APK** (Play Protect warning; Google's developer verification for sideloaded apps, expected to reach India in 2027) | Medium | High | Show owners how to allow the install; register for developer verification before it applies; the web app as fallback |
| 5 | **A phone is lost or broken** | High | Low once sync exists | Sync = online backup; sign in on a new phone |
| 6 | **A salon doesn't pay** | Medium | Low (₹699) | UPI AutoPay; reminders (§4 E); never hold the salon's data hostage |
| 7 | **A data leak or wrong access** | Low | Very high (customer phone numbers) | Security check every build; masked numbers for staff; per-salon server rules; DPDP process |
| 8 | **Firebase costs jump** | Low | Medium | Budget alert at ₹20/salon; the free tier covers the first ~15–20 salons |
| 9 | **A bad review or angry owner** | Medium | Medium (small market, word travels) | Reply the same day; fix or refund under the guarantee; ask what went wrong |
| 10 | **A competitor cuts price or copies the live view** | Medium | Medium | Compete on the person who answers and on proven results, not price (board, marketing) |

## Open questions
- Lawyer and CA quotes (terms, privacy, GST, books).
- Whether a home-based sole proprietor in Bhubaneswar needs the Shops & Establishments registration.
- Real AI-helper cost per salon and real support hours per salon (after the first 5).
- The setter's fee per salon (after the routine is written down).
