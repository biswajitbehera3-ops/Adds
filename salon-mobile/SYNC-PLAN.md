# Live sync plan: every phone in the salon shares the same data (22 Oct)

Asked by the user, 22 Oct: "The app will be synced with each other, so make a plan to do the live syncing." BUILD-SPEC 3.4 (decided, not built) and 10.7 (provider).
Running costs and the monthly price are in `../founder/RUNNING-COSTS.md`.

## What "synced" means for this app

- The owner's phone and every stylist's phone show the same salon: a bill paid on Imran's phone appears on the owner's Live floor and Earnings within a second or two.
- Works with no internet. Billing keeps going; the phone catches up when the network is back. A busy Sunday with bad signal must never stop billing.
- The online copy is also the backup. A lost or broken phone loses nothing: sign in on a new phone and everything comes back.
- Rules that protect money are checked on the server too, not only on the phone (bill paid once, wallet never below zero, check-in time).

## Three decisions to make first

| # | Decision | Recommended | Why |
|---|---|---|---|
| A | One app on Google Play for all salons, or a separate Play listing per salon? | **One app.** At first launch the owner types the salon code; the app then shows that salon's name, logo, colours and prices everywhere inside. | Google Play's spam policy does not allow "creating multiple apps with highly similar functionality, content, and user experience" and tells developers to make a single app instead. A listing per salon from our account risks every app being removed. The icon on the phone would be ours, not the salon's; everything inside stays the salon's. |
| B | Which sync service? | **Firebase (Cloud Firestore), Mumbai region (asia-south1)**, with Firebase Auth, Cloud Functions, Storage for photos and Cloud Messaging for notifications. | Offline work and catch-up are built in, so we don't write our own sync engine. Live updates to every phone are built in. A free daily allowance covers the first salons, and per-salon cost stays at a few rupees (see costs). Alternative: Supabase (Postgres, also has Mumbai): about $25 a month flat, but offline catch-up would have to be built or bought. |
| C | WhatsApp sent automatically by the server, or one tap from the salon phone (as today)? | **Both, by plan.** Small plan keeps one-tap (free). Main plans send automatically from the salon's own number through Meta's WhatsApp Cloud API. | Automatic messages cost money per message (₹0.115 utility, ₹0.8631 marketing) but don't need anyone to tap, and the codes for wallet and referral checks can't be seen by staff. One-tap costs nothing. |

## How the data is laid out online

```
salons/{salonId}                     name, logo, prices, check limits, plan
salons/{salonId}/staff/{id}          stylist profile, chair, shift, weekly off
salons/{salonId}/customers/{id}      name, masked number (••••• •5028), visits, wallet total
salons/{salonId}/contacts/{id}       full mobile number: owner and server only
salons/{salonId}/visits/{id}         bills: services, extras, payment, who, when
salons/{salonId}/walletTxs/{id}      every top-up and spend, never edited, only added
salons/{salonId}/appointments/{id}
salons/{salonId}/attendance/{id}     check-in with server time and selfie path
salons/{salonId}/leaves/{id}
salons/{salonId}/dayClosings/{id}    owner cash counts
salons/{salonId}/reminders/{id}      what was sent to whom, and when
salons/{salonId}/privacyLog/{id}
```

- Each record is its own document, so two stylists billing at the same time never overwrite each other.
- The wallet is a list of entries that are only ever added, and the balance is their sum. Two phones offline at once can't corrupt it.
- Full customer numbers live in `contacts`, which staff phones can't read at all. The server sends WhatsApp messages, so staff never need the number. This closes the gap in MISUSE-CHECKS ("masking stops casual copying, not a determined person").

## Who can see what (server rules)

| | Owner | Stylist | Server |
|---|---|---|---|
| Salon settings, prices | read, change | read | read |
| Customers (masked) | read, change | read, add | read, change |
| Full mobile numbers | read | no | read |
| Bills | read all, cancel | add own, undo own within 2 minutes with a reason | checks every bill |
| Wallet entries | read, top up | read, spend (code above ₹500) | checks balance never goes below zero |
| Attendance | read all | add own (server time) | stamps the time |
| Other stylists' earnings | read | no | |

## How the app changes

The engine (`src/domain/engine.ts`) stays as it is: pure rules, 83 tests. Only the store changes.

1. `store.ts`: after each `commit`, work out which records changed and write just those to Firestore. The Firestore cache on the phone keeps them while offline and sends them later.
2. Live listeners per collection update the in-memory `Data` and redraw the screens, so the Live floor moves when another phone bills.
3. Sign-in: salon code → owner or stylist number and password (checked by a Cloud Function, which returns a sign-in token with the salon and role). The selfie stays once a day.
4. Existing data on a phone (pilot salons) is uploaded once, on the owner's first online sign-in.
5. A small "Synced" or "Offline: 3 bills waiting" line in the header, so nobody wonders whether a bill was saved.

## What runs on the server (Cloud Functions)

- **Bill paid once**: payment is confirmed in a transaction. If two offline phones paid the same visit, the second is marked a duplicate and shows in the owner's Today's checks.
- **Server time** for check-in and bills (fixes the clock check's limit in MISUSE-CHECKS #9).
- **WhatsApp sending** through the Cloud API from the salon's number: receipt, booking confirmation, on-the-day reminder, due-back reminder, wallet and referral codes, leave notices. Meta's delivery reports are counted per salon to check the monthly message allowance.
- **Phone notifications** (Firebase Cloud Messaging, free): leave requests and answers, owner alerts (cash difference, undo, left without service).
- **Nightly**: retention purge (DPDP), totals for Earnings, and a daily export the owner can download.

## WhatsApp setup per salon

1. We register once as a Meta **Tech Provider** (free, needs our Meta Business verification).
2. Each salon connects its number in the app through Meta's Embedded Signup. With **coexistence** the salon keeps using the same number in the WhatsApp Business app for chats, while our server sends the automatic messages.
3. Message templates are approved by Meta once and shared by all salons: receipt (utility), booking confirm and day reminder (utility), code (authentication), due-back and offers (marketing).
4. Without the Tech Provider route, a WhatsApp provider such as AiSensy charges about ₹1,500–3,200 a month per number. That is more than our whole price per salon, so going direct is part of the plan.

## Order of work

| Step | Work | Done when |
|---|---|---|
| 1 | Firebase project in Mumbai, data layout, server rules, and tests for the rules | Rules tests pass: stylist can't read numbers or others' earnings |
| 2 | Salon code + sign-in through a Cloud Function | Owner and stylist sign in on two phones into the same salon |
| 3 | Store writes changed records; listeners update screens | Bill on phone 1 shows on phone 2's Live floor |
| 4 | Offline test: both phones offline, bill on each, back online | Both bills arrive; nothing lost or doubled |
| 5 | Server checks: bill paid once, wallet never below zero, server time | Duplicate payment shows in Today's checks |
| 6 | Photos to Storage (staff photo, check-in selfie) | Selfie seen on owner's phone |
| 7 | Phone notifications | Leave request pings the owner |
| 8 | WhatsApp Cloud API, Tech Provider, templates, embedded signup | Receipt arrives from the salon's number |
| 9 | Restore on a new phone; daily export | Phone wiped, sign in, all data back |
| 10 | Pilot in 1–3 salons for a month, then Play Store release | Staff still billing after the free month |

Steps 1–7 need nothing from Meta and can start right away. Step 8 waits for Meta's business verification, which can take days to weeks, so it should be applied for at the start.

## What we need from you before building

- A Google account for Firebase with billing turned on (a card; it stays inside the free allowance at first).
- Google Play developer account (one-off $25) in your name or your company's.
- A Meta Business account and documents for business verification (for example GST or Udyam registration and a business address), needed for WhatsApp.
- Choices on A, B and C above.
