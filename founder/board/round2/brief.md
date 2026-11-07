# Board brief (round 2, 22 Oct): the salon app, new target and price

# Salon app (working name; no business name chosen yet)

- What it is: a phone app made for one salon at a time (its name, logo and prices inside), used by the owner and each barber/stylist on their own phones, live-synced between all phones: walk-in billing in about 1 minute per customer, prepaid wallet, WhatsApp bills and reminders, referrals, staff attendance, owner checks against cash leakage, and a "live salon" view: an illustrated floor where the owner sees from anywhere who is in which chair right now.
- Who it is for: established salons with 5 or more chairs that already have good online reviews and are popular in local search, in Indian tier-1, tier-2 and tier-3 cities, whose owners want to keep that standing up (repeat customers, service quality, staff discipline).
- What it sells, at what price: ₹10,000 one-time upfront (setup, salon's prices/staff/logo entered, team trained), then ₹500 a month or less.
- Where and how: India, tier 1, 2 and 3 cities; sold salon by salon (sales channel not decided); one Android app on Google Play for all salons, each salon unlocked by its salon code.
- Budget and constraints: budget, team size and launch date not given. App built as a working prototype by one founder with AI help; live sync is planned (Firebase, Mumbai) but not built; the liquid-glass design is confirmed and waiting to be built.

## What changed since the first board meeting (founder's decisions, 22 Oct)

| | Round 1 | Now |
|---|---|---|
| Customer | 1 to 8 chairs, any salon | 5+ chairs, good reviews, popular in search |
| Price | ₹4,999 setup + ₹999/month, first month free | ₹10,000 upfront + ₹500/month or less |
| Cities | tier 1 and 2 | tier 1, 2 and 3 |
| Live sync | not built, not planned | planned in detail (Firebase, Mumbai), to be built |
| Data entry | selfie + typing each walk-in | target: a barber enters a customer in 1 minute |
| Differentiator claimed | features | "live salon": owner sees the floor live from anywhere; founder says no one offers this today (not yet checked against competitors) |

## Facts on file

- Built today (prototype): owner app (Live floor, Earnings, Staff, Customers), staff app (walk-in counter, bill, wallet, calendar, profile, leave), misuse checks (bill paid once, itemised WhatsApp receipt, unusual-bill flag, cash count against expected cash, left-without-service and undo kept with reasons, WhatsApp codes for referrals and wallet spends above ₹500, clock check, owner approval for services not in the list, backup file), 83 automated tests. Each phone keeps its own data until sync is built.
- Running cost per salon per month, researched 22 Oct (`founder/RUNNING-COSTS.md`): for a 5-8 chair salon, automatic WhatsApp messages about ₹609 including GST (bills and booking messages at ₹0.115 each, "due back" reminders at ₹0.8631 each as marketing messages), server and sync about ₹20, payment collection about ₹12-24. Total about ₹640 a month with automatic WhatsApp; about ₹35-45 a month if WhatsApp is sent by one tap from the salon's own phone (free). Fixed costs about ₹600 a month plus a one-off $25 Google Play fee.
- Google Play does not allow many near-identical apps from one developer, so it is one app for all salons, branded inside after the salon code.
- Simulated buyer panel from round 1 (100 AI-simulated owners, old price; simulated, not real customers, likely overstates buying): 5-8 chair salons bought at 20% (of 20), owners often away from the salon 33%, overall 9%. Top objections then: staff won't enter data at rush hour, upfront fee before seeing results, no owner they know uses it, data loss, English only, Sunday support. The panel was not re-run for this round.
- Round 1 board: 2 fund if, 1 pass (average 3.7/10). Main risks then: live sync not built, staff do the work while the owner gets the benefit, no sales channel, price pressure, no clear edge over Zylu and MioSalon.
- Competitors buyers named: Zylu, MioSalon (still not researched).

## Open questions nobody has answered yet

Number of 5+ chair salons with good reviews in the target cities; what Zylu, MioSalon and others charge and whether any already show a live floor; cost to win one salon (in-person sales and setup across tier 1-3 cities); churn; founder's budget and time; who provides Sunday support.
