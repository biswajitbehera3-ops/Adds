# Founder decisions, 24 Oct: help to Claude, one-tap WhatsApp only, APK and demo first

User, 24 Oct: "1. Help button on Home screen only with a small tab icon; when it opens, whatever the error, it can screenshot and send; then it comes to Claude, and if Claude can solve it, send the solution, if not, send it to me. 2. Do not automate WhatsApp, only tap by staff. 3. Go by APK files and not through the Play Store, and get the accounts when we set up with a customer; till then we just need a demo app with everything working very well to show the owner, then we build with their service pricing and WhatsApp linking."
Status: **decided, build later** (BUILD-SPEC 10.12, 10.13, 10.14 and 11.0 h).

## 1. Help button → Claude → solution or the founder

**Where:** only on the Home screens (stylist Home, owner Live), a small round glass "?" tab in the top bar next to the bell.

**What happens:**
1. Tap "?". The app first takes a screenshot of the screen behind it, then opens the Help sheet.
2. The sheet shows the screenshot (tap to retake from another screen), a box "What went wrong?" (typing in Hindi or English is fine) and **Send**.
3. Customer mobile numbers in the screenshot are blurred automatically before sending (owner screens show full numbers; staff screens already show only the last 4 digits).
4. The app attaches, without asking: salon, who is signed in (owner or stylist), app version, which screen, sync state ("Synced" / "Offline · 2 bills waiting") and the last few errors the app recorded.
5. It goes to **Claude** (the Claude API, called from our server; not this chat). Claude has the app's help guide and the list of known problems. It decides:
   - **Can solve:** the answer comes back in the Help sheet and as a phone notification, in short steps in the user's language ("Turn on automatic date and time, then open the app again").
   - **Can't solve, or it is about money, missing data or a bug:** it is sent to **the founder** on WhatsApp/email with Claude's short summary, the screenshot and the app info, and the user sees "Sent to the team. You'll get a call." Money and data problems always go to the founder, even when Claude also answers.
6. Every request and answer is kept in the owner menu → **Help history**, so nothing is lost and the founder can see what Claude told the salon.

**What it needs (at build):** a small server function (Firebase Cloud Functions, which needs the paid "Blaze" plan) and an Anthropic API key on the server, never in the app.

**Cost per help request (estimate):** Claude Opus 5.5 at $4 per million tokens in and $20 out. One request ≈ 8,000 tokens in (screenshot, note, help guide) and ≈ 2,000 out → about $0.07, **about ₹6 per request**. A cheaper model (Claude Haiku 5.5, about ₹0.20 a request) is possible if the founder chooses it; the default is Opus 5.5 because a wrong answer to a salon costs more than ₹6.

**Privacy (DPDP):** screenshots can show customer names; numbers are blurred, and the privacy notice will say help requests are processed by our support provider (Anthropic) to answer them.

**In the demo:** the same Help sheet, but **Send** opens WhatsApp to the founder's number with the screenshot and note (one tap, free, no server needed). Claude answering in the app comes with the first real salon.

## 2. WhatsApp: only one tap by staff, never automatic

- Every WhatsApp message is opened by the app and sent by a staff tap (as the app works today): bills, reminders, booking messages, referral and wallet codes, leave notices.
- **No WhatsApp Business API, no Meta Business verification, no per-message charges.** WhatsApp cost per salon: **₹0**.
- Changes to earlier plans:
  - Owner's 9 pm day summary → a **phone notification** (free) instead of a WhatsApp message.
  - Google review request → a line with the salon's review link in the thank-you message the stylist sends.
  - The "message meter" and delivery status in COMPETITOR-FIXES #6 are dropped (nothing automatic to count).
  - Wallet and referral codes are still sent from the salon phone, so a staff member could see the code (the limit already written in MISUSE-CHECKS). The owner checks (codes logged, referral limits, Today's checks) stay.
- **Cost per salon a month now:** server and sync about ₹20 + payment collection about ₹12 (on ₹500) ≈ **₹32**. On ₹500 a month the business keeps about ₹468 per salon before fixed costs.

## 3. APK, not the Play Store; demo first, accounts at the first sale

### APK distribution
- The app is installed from an APK file we give the salon (link or file), not from Google Play. No Play Store account or listing needed now.
- **Each salon can get its own branded APK:** its name and logo as the icon on the phone's home screen (a Play Store listing per salon wasn't allowed; APKs are). Same code for everyone, built per salon.
- **Installing:** we install it on the owner's and every stylist's phone during the setup visit ("allow installs from this source" once per phone; Play Protect may show a warning for an unknown app, which we handle in person).
- **Updates:** small updates arrive inside the app (over-the-air updates, free up to 1,000 monthly users, then $19/month); bigger ones show "New version" in the app with one tap to download.
- **Android developer verification (Google):** from 30 Sep 2026 Google requires apps installed outside the Play Store to come from verified developers in Brazil, Indonesia, Singapore and Thailand, and **expands this globally in 2027**. Before it reaches India we must sign up as a developer distributing outside Google Play, verify identity, and register each app with its signing key ([developer.android.com/developer-verification/guides](https://developer.android.com/developer-verification/guides)). Sideloading still works for verified developers.

### Demo first
**Phase 1: Demo APK** (what we build first), shown to owners on 2–3 phones:
- Everything in V1 working smoothly with a demo salon (demo name, prices, stylists, customers) in the confirmed liquid glass design.
- **Live sync between the phones:** a stylist bills on one phone and the owner's live salon moves on the other. This needs a free Firebase project (just a Google login, no card, free "Spark" plan).
- One-tap WhatsApp working, Help sending to the founder's WhatsApp, demo reset button for the next visit.

**Phase 2: per salon, after the owner says yes:**
- Their services and prices, chairs, stylists, salon name, logo and colours entered in the setup visit; the salon's own WhatsApp on the salon phones (one-tap uses it).
- Their own branded APK, a fresh database, the demo removed.
- Accounts opened then: Firebase paid plan (for Help with Claude), Anthropic API key, payment collection (Razorpay / UPI AutoPay), Android developer verification (before 2027).
