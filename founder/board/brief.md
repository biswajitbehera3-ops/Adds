# Board brief, round 3 (7 Nov 2026)

You have not seen any earlier conversation. Everything you need is here; the files named below are in the same `founder/` folder and you may read them for detail.

## The business
A phone app made for one salon at a time (its name, logo and prices inside), used by the owner and each stylist on their own phones:
- walk-in billing in about a minute, cash / UPI / card, prepaid customer wallet
- one-tap WhatsApp bills and "due back" reminders (sent by staff tap, never automatic, so ₹0 messaging cost)
- referrals: a friend joins with a customer's code; on the friend's first paid visit both get ₹100 wallet credit
- staff attendance with selfie check-in, leave requests and approval, earnings per stylist
- owner checks against cash leakage ("Today's checks": undone bills, walk-outs, cash in drawer)
- a "live salon" view: the owner sees who is in which chair right now
- set up in person in one visit (services, prices, staff entered; the app installed on every phone), with a named person who answers 7 days a week

**Who it is for:** established salons with 5 or more chairs, 4.3★+ and 150+ Google reviews, starting in Bhubaneswar (Odisha, India). Not chains (their head office has software).

**Price (decided 24 Oct, confirmed 31 Oct):** ₹10,000 setup in two halves (₹5,000 on setup day; ₹5,000 at day 30 only if stylists bill in the app on 20+ working days, else fix it or refund the first ₹5,000) + ₹699 a month, locked 2 years. First 5 salons get 3 months free as references. One plan only. GST is added on top only once registered.

**Delivery:** Android phones get a branded APK file (no Play Store); iPhone users get the same app as a home-screen web app (decided 3 Nov). Salons pay outside any app store, so no store commission.

## Where it stands (facts)
- **Built:** the full app on one phone (demo data), web preview, three security-check rounds with all confirmed findings fixed, 113 automated tests.
- **Not built:** live sync between phones (Firebase, Mumbai). The "live salon" across phones, the online backup and the iPhone web app all depend on it. It is the next build and must come before any real salon goes live.
- **No paying salon yet.** No real owner has used it.
- **Sales material ready:** a 95-second launch film (story: the customer who never comes back → reminder → referral → owner's live view), a phone-friendly list of the first 20 Bhubaneswar salons to visit (86 salons passed the filters out of 232 found on Google Maps), and an outreach plan: walk-in demo first, WhatsApp the film only afterwards, Instagram DMs, product distributors.
- **Founder:** one person, no salary taken (founder pay ₹0, 31 Oct), does sales, setup and support.

## Numbers (from `cfo.md`, `RUNNING-COSTS.md`, `pricing.md`; estimates marked)
- Running cost per salon about ₹167 a month (server ₹20, payment fee ~₹16.5, AI help ~₹30 est., support helper ₹100 est.) → each salon leaves ~₹532 a month (76%).
- Each setup leaves ~₹7,500 (₹10,000 minus an estimated ₹1,500 visit cost and expected guarantee refunds).
- Fixed costs ~₹3,600 a month (domain/phone ₹600, local travel ₹3,000 est.). Break-even on monthly fees: **7 salons**.
- Startup cash needed: about ₹24,000.
- Year 1 plan (estimate: 0 new salons in months 1–2, then about 3 a month; 3% leave each month): ~₹2.88 lakh from setups + ~₹71,000 monthly fees → profit ≈ **₹2.49 lakh** with no founder pay.
- Competitors' plans for a 5–10 staff salon cost ₹1,249–₹4,000 a month (Zylu, MioSalon, Salonist, Invoay and others; `competitors.md`); none found offers in-person setup with a named person; at least two show live chairs.
- Simulated buyer panel: 9 of 100 bought at an older ₹4,999 + ₹999 offer (all-India, all sizes); a re-test on 20 simulated Bhubaneswar 5+ chair owners went from 3 to 12 of 20 with the founding plan at ₹500 a month (not re-run at ₹699). Simulated, not real buyers.
- Unknown: real conversion from visits, real churn, how many 5+ chair salons exist in each Indian city, cost to win a salon outside Bhubaneswar.

## The founder's questions for this meeting (answer them inside your lens)
1. What do you think of the app, and what could it become in 3–5 years?
2. How will it earn, and how far can the earnings realistically go?
3. How do software/app businesses reach "millions" (₹1 crore+ a year, or $1 million), and can this one? Show the arithmetic from the numbers above (e.g. how many paying salons a given yearly revenue needs at ₹699 a month plus setups), and say what would have to be true. Do not invent a market size: name it as an open question.

## Earlier board rounds
Round 2 (22 Oct, at ₹10,000 + ₹500): 3 fund if, average 4.3/10. Its conditions included: build live sync first and prove the floor matches real chairs; time real barbers at rush hour; give the barber a reason to enter data; check competitors (done since: `competitors.md`); pick one city (done: Bhubaneswar); test one sales channel and record the real cost to win a salon; an affordable guarantee (done: the two-half setup).
