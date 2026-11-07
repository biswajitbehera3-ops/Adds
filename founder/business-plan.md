# Salon app (working name; no business name chosen yet) · Business plan

**Verdict: Not yet**

- ✓ Each paying salon-day (₹699 a month / 30) earns $17.75 before fixed costs (76% contribution).
- ✗ Year 1 operating LOSS: $468,725.
- ✗ Break-even is 82 paying salon-day (₹699 a month / 30)s a day against a capacity of 60.
- ✗ 9 of 100 simulated buyers buy (9%, the bar is 25%).

| key number | |
| --- | ---: |
| Price | $23.30 a paying salon-day (₹699 a month / 30) |
| Profit margin at plan | -28% per paying salon-day (₹699 a month / 30) |
| Break-even | 82 paying salon-day (₹699 a month / 30)s a day |
| Year 1 operating profit | $-468,725 |
| Startup spend | $20,000 |
| Cash needed before it pays for itself | $488,725 |
| Startup money earned back | not in year 1 |
| Buyer panel | 9 buy · 91 pass |

## The idea

- What it is: a phone app made for one salon at a time (its name, logo and prices inside), used by the owner and each stylist on their own phones: walk-in billing in about a minute, prepaid wallet, one-tap WhatsApp bills and reminders, referrals, staff attendance (selfie off by default), owner checks against cash leakage, Google review requests, and a "live salon" view where the owner sees who is in which chair right now; set up in person in one visit, with a named person who answers 7 days a week.
- Who it is for: established salons with 5 or more chairs that have good Google reviews and are popular in local search, starting in Bhubaneswar (Odisha).
- What it sells, at what price: ₹10,000 setup (paid in two halves; the second only if stylists bill in the app on 20+ working days) + ₹699 a month, locked 2 years; first 5 Bhubaneswar salons get 3 months free as references (`offer.md`, `pricing.md`).
- Where and how: Bhubaneswar first; salons found on Google Maps and Instagram, won by walk-in demos on the founder's phone, installed by the founder as a branded APK per salon (no Play Store); WhatsApp sent by staff tap only (`marketing.md`, `salon-mobile/PLAN-24-OCT.md`).
- Budget and constraints: about ₹24,000 to start (`cfo.md`); founder pay not yet set (₹40,000 a month assumed); one founder for sales, setup and support; the one-phone demo APK comes first, live sync between phones after the first sale.

## Summary

**Verdict: Not yet** (computed by `compile.py`). Three of its four checks fail. What has to change:

1. **Year 1 is a loss in the computed numbers (−₹4.69 lakh)** because the tool counts only the ₹699 monthly fee against an estimated ₹40,000 a month founder pay. Adding the setup fees by hand (`cfo.md`), year 1 is **−₹2.31 lakh with founder pay** and **+₹2.49 lakh without it**. To change it: keep founder pay out of year 1 (or pay it only from setup fees), or sell faster. → `/founder-cfo` once the real founder pay is known.
2. **Break-even needs 82 paying salons; one founder can support about 60** (capacity is an estimate). → A support helper before ~40 salons (`/founder-ops`), or Salon Plus at ₹1,299 for big salons (`pricing.md`).
3. **Buyer panel: 9 of 100 bought (bar 25%).** That panel was all-India, 1–8 chairs, at the old ₹4,999 + ₹999 offer. The target-specific re-test (20 simulated Bhubaneswar 5+ chair owners, same cards) went from **3 to 12 of 20 (60%)** with the Founding Salon Plan, at ₹500 a month; it was not re-run at ₹699. → Re-run `/founder-consumer --quick` at ₹699 before Day 0.

**What it is:** a phone app made for each salon (its name and logo) that lets the owner see the salon live, catch missing cash and bring customers back, set up in person in one visit with a person who answers 7 days a week. For salons with 5+ chairs and good Google reviews in Bhubaneswar.

**The three numbers:** each salon leaves **₹532 a month (76%)** after its costs, plus **~₹7,500** at setup; break-even on monthly fees **82 salons** (with ₹40,000 founder pay; 7 without); year 1 **+₹2.49 lakh without founder pay / −₹2.31 lakh with it** (setup fees included).

**Where the board and the buyers agreed:** big salons and owners who are often away want it; staff not entering data is the real risk; "it's one person" and "nobody I know uses it" stop the rest. **Where they differed:** the board wanted the app cut to one promise and live sync proven first; the buyers cared most about the guarantee, support and their language.

**Biggest risk:** stylists stop billing in the app, and the owner sees wrong numbers. **What's done about it:** one-minute billing, training in Odia/Hindi/English, selfie check-in off by default, and the guarantee (the second ₹5,000 only when stylists bill on 20+ days), which makes the risk ours and shows it early.

**What the founder needs to start:** about **₹24,000** (demo phone, first month's print and travel, contingency) if not drawing pay in year 1; the one-phone demo APK; the first 40 Google Maps leads in one Bhubaneswar area.

**This week:** finish the one-phone demo APK, and build the 40-salon Bhubaneswar lead sheet (5+ chairs, 4.3★, 150+ reviews) so the first visits can start the day it's ready.

_The buyers are simulated and the numbers are projections from estimates; real owners and real quotes confirm them. Not financial, legal or tax advice._

## What the board said

**Vote: 3 fund if, 0 pass. Average score 4.3 / 10** (Offers 4 · Monopoly 4 · Product 5). Round 1 was 2 fund if, 1 pass, 3.7 (`board/round1/`).
The lenses apply published frameworks; they are not the authors' opinions.

### What got better
- The narrower buyer (5+ chairs, good reviews, popular in search) is a defined group with money and something to protect (all three).
- "See your salon live from anywhere" is a clear one-line promise (Offers, Product).
- One-minute entry answers round 1's biggest objection, if it is real (Product).
- Monopoly moved from pass to fund if because of the narrower market.

### Risks more than one member raised
1. **Live sync is not built, so the "live salon" doesn't exist yet** (all three). One wrong number on the owner's floor and trust is gone.
2. **The barber does the work, the owner gets the benefit** (all three). If walk-ins aren't entered at rush hour, the floor and the cash checks are wrong. One minute is a target, not a measured result.
3. **"No one offers a live floor" is unchecked** against Zylu, MioSalon and others; even if true it is easy to copy (Monopoly, Offers, Product).
4. **No sales channel and no cost to win a salon** across tier 1-3 cities (Monopoly, Offers).

Only Offers raised it, but it is a number, not an opinion: **₹500 a month or less is below the ~₹640 a month running cost with automatic WhatsApp** (RUNNING-COSTS.md). With one-tap WhatsApp the cost is ~₹35-45, so ₹500 works only that way, or with automatic messages as a paid add-on.

Where they disagree: Product wants the app cut to one job and the redesign to wait until sync works; Offers keeps the wide stack but wants a guarantee and proof; Monopoly cares most about one city, one channel and a long-term advantage nobody can copy.

### Conditions (checklist)
- [ ] Monthly price covers monthly cost: one-tap WhatsApp in the ₹500 plan, automatic WhatsApp as a paid add-on or a higher plan (Offers) → /founder-pricing, /founder-cfo
- [ ] Build live sync first, before new features or the redesign; prove the owner's floor matches the real chairs in at least one real 5+ chair salon (all three)
- [ ] Time real barbers at rush hour: one-minute entry met; show what happens when an entry is missed (Product, Offers)
- [ ] Give the barber a reason to enter data (their earnings, tips, bookings) (Offers)
- [ ] Research Zylu, MioSalon and others with sources: does anyone show a live floor, at what price? (all three) → /founder-competitors
- [ ] Pick one city first; count its 5+ chair salons with good reviews (Monopoly)
- [ ] Test one sales channel; record the real cost to win and set up a salon against ₹10,000 (Monopoly, Offers)
- [ ] A guarantee on the ₹10,000 the business can afford (Offers) → /founder-offer
- [ ] Pre-sell at the real price to real owners before more building (Offers)
- [ ] Say the one thing in one sentence; hide what doesn't serve it in version 1 (Product)
- [ ] Map every handoff (barber → owner, app → WhatsApp, payment, setup) and what the user sees when it fails; Sunday support owned (Product)
- [ ] Name the long-term advantage a copycat can't match (data lock-in, a network of top salons, brand) (Monopoly)
- [ ] Hindi / local language for barbers in tier-3 cities (Product)

### The strongest version the board can see
A "live salon" control app for well-reviewed 5+ chair salons, started in one city: the owner sees from anywhere who is in which chair, what was billed and what cash should be in the drawer, and it is true because sync works and barbers enter a walk-in in under a minute (with something in it for them). ₹10,000 upfront with a guarantee, ₹500 a month with one-tap WhatsApp, automatic WhatsApp as a paid add-on. Proven first in a handful of real salons whose owners then sell it to the next ones. This is close to what the founder pitched; the differences are the price structure (₹500 can't include automatic WhatsApp), building sync before the redesign, and one city before tier 1-3 all at once.

## The competition

Public sources only, seen 22 Oct 2026. Every price, tagline and rating has its link in `competitors.csv`; feature proof in `competitors-features.md`; customer complaints (about 157 public reviews) in `competitors-complaints.md`.
Our offer for comparison: ₹10,000 upfront + ₹500/month → **₹16,000 in year 1, ₹6,000 a year after**.

### 1. Who is there (most direct first)

| Competitor | Base | Price of the plan a 5–10 staff salon would need | Live chair / floor view? |
|---|---|---|---|
| **AXOIX** | New Delhi | $18/month (~₹1,500) for 8 chairs; free up to 3 chairs | **Yes**: "Real-time salon floor display showing chair occupancies and active timers" |
| **SalonLux** (RMG Softech) | Jaipur | Quote only (enterprise) | **Yes**: "Live chair occupancy meters" on an owner command dashboard, plus offline billing |
| **BookB** | UK pricing | £65/month (15 staff) | Partly: a live walk-in queue ("which staff member is free"), not a chair map |
| **Zylu** | India | Standard ₹1,999/mo (yearly) for WhatsApp API + attendance; Grow ₹1,249/mo without; setup optional ₹1,999 | No |
| **DINGG** | India | No public price; IndiaMART listing ₹20,000 a year | No (owner app shows "live sales by branch and stylist") |
| **Invoay** | India | Grow ₹1,499/mo yearly; WhatsApp API platform ₹7,999 extra | No (owner "real time business tracking", offline billing) |
| **SalonBoost** | India | ₹1,499/mo + ~₹500/mo WhatsApp to Meta | No |
| **Salonior** | India | ₹15,000 a year per location, everything included | No ("Daily revenue, live from anywhere") |
| **Salonist** | India / global | Advance ₹4,000/mo (first plan with WhatsApp + clock-in) | No (waitlist, kiosk check-in) |
| **MioSalon** | India | "49/month/outlet" (currency not shown; Capterra says $49) | No (staff occupancy calendar) |
| **Zenoti** | US / India | Quote only; enterprise | No |
| **Fresha** | Global | Free subscription; fees on new marketplace clients and messages | No |
| ReSpark | India | $270 a year (Capterra) | No |
| TrimBrim (indirect) | India | Free for shops | Customer-facing count of free chairs, updated by hand |
| myBillBook, Vyapar (indirect) | India | ₹3,490–4,319 a year (billing only) | No |
| WhatsApp Business + paper register (substitute) | — | Free | No |

### 2. Price range (plan a 5–10 staff salon needs, per month)

- **Lowest:** Fresha ₹0 (paid per new client and message); lowest paid: Zylu Grow ₹1,249, Salonior ~₹1,250.
- **Median of published paid plans:** about **₹1,500 a month** (Invoay, SalonBoost, AXOIX ~₹1,500; Zylu Standard ₹1,999).
- **Highest published:** Salonist ₹4,000; Zylu Premium ₹4,999; Zenoti and SalonLux by quote.
- **Upfront fees:** none of the direct rivals asks for more than an optional ₹1,999 setup. **Our ₹10,000 upfront is the only large upfront fee in the market.**
- Year 1 total: ours ₹16,000 vs Zylu Standard ~₹24,000, Invoay ~₹18,000 (+₹7,999 for WhatsApp), Salonior ₹15,000, DINGG ~₹20,000, Salonist ₹48,000. From year 2 we are the cheapest paid option (₹6,000).

### 3. Positioning map (price per year × how much the owner sees live)

```
 owner sees the salon LIVE (chairs, cash)
        ▲
        │  SalonLux (quote, enterprise)        ★ US: animated live floor on the owner's phone,
        │  AXOIX (~₹18k/yr, free ≤3 chairs)       cash checks, ₹6k/yr after year 1
        │  BookB (queue, £)
        │  DINGG · Invoay · Salonior (live sales numbers, not chairs)
        │  Zylu · SalonBoost · Salonist · MioSalon (reports, calendars)
        │  Fresha (free) · billing apps · WhatsApp + register
        └──────────────────────────────────────────────────────────▶ price per year
          ₹0            ₹6k          ₹15–20k            ₹24k        ₹48k+
```

### 4. What their customers complain about (ranked; quotes and links in `competitors-complaints.md`)

1. **Support disappears after the sale: 26 reviews** (Salonist 14, Invoay 8, MioSalon 2, Zylu 1, DINGG 1)
2. Setup or migration drags or never finishes: 10
3. Complex, clunky or outdated screens: 10
4. Bugs, crashes, downtime, sync failures: 9
5. Sales promised features that never came: 8
6. WhatsApp/SMS reminders unreliable or cost extra: 7
7. Wrong bills, commissions or reports: 6
8. Weak or no mobile app: 5 · no offline mode: 4 · price/add-ons: 4
- Thin (under 3): data loss (1); staff won't use it (0; several reviews say staff learn quickly).

Limits: Reddit could not be reached; Zylu and DINGG have few public negative reviews (and many vendor-solicited positive ones), so few complaints there does not mean happy customers.

### 5. The gap

- **"Nobody offers a live salon" is not true.** AXOIX (New Delhi, ~₹1,500/month) already sells a real-time floor display with chair status and timers; SalonLux sells live chair occupancy to chains. The claim must come out of the pitch.
- What nobody does well, from the evidence:
  1. **Support that stays after the sale** (26 complaints, the biggest theme by far), including setup that actually finishes.
  2. **Simple, beautiful, phone-first screens** (10 complaints about clunky UI; 5 about weak mobile apps).
  3. **Numbers the owner can trust**, including when the internet drops (bugs/sync 9, wrong numbers 6, no offline 4).
- Our edge is the **combination**: an animated live salon on the owner's phone, the cash-leakage checks (bill paid once, drawer count, undo and walk-out records, wallet codes), works offline and catches up, set up in person with support that answers, at ₹500 a month after setup. Each piece exists somewhere; nobody found sells all of it together, in this design, at this monthly price.

### 6. The threat

- **AXOIX** is closest: it already has the live floor, a free tier and a low price. If it reaches the same salons first, our story is "a nicer version of AXOIX".
- **Zylu, DINGG, Invoay** have sales teams, thousands of salons and owner apps; adding a chair-status screen is weeks of work for them.
- **Fresha** is free; any salon that only wants booking and billing goes there.
- What protects us: the salons we set up and support well (data and habit), the owners' word of mouth in one city, and the design.

## The buyer panel

**9 buy · 91 pass** (9% buy) out of 100 simulated buyers. Seed 339387, so the same cards can be dealt again.

These are simulated buyers, not customers. Use this to find objections and weak spots, then confirm the big ones with real people before you spend.

### By segment

| group | buyers | buy rate |
| --- | ---: | ---: |
| Established salon with 5 to 8 chairs and 5 to 10 staff | 20 | 20% |
| Premium or franchise salon outlet owner, sometimes 2 outlets | 5 | 20%  (thin) |
| Neighbourhood unisex salon or ladies' parlour with 2 to 4 chairs and 2 to 4 staff | 40 | 10% |
| One-chair or two-chair men's salon or barber shop, owner also cuts hair | 35 | 0% |

### By buying behaviour

| group | buyers | buy rate |
| --- | ---: | ---: |
| Owner who isn't always at the salon | 12 | 33% |
| Young owner who likes tech | 14 | 29% |
| Runs everything on WhatsApp | 15 | 7% |
| Asks other owners first | 12 | 0% |
| Counts every rupee | 15 | 0% |
| Paper register loyalist | 20 | 0% |
| Tried an app before and stopped | 12 | 0% |

### By income

| group | buyers | buy rate |
| --- | ---: | ---: |
| ₹1,310,000 and up | 34 | 18% |
| ₹631,000 to ₹1,310,000 | 33 | 6% |
| under ₹631,000 | 33 | 3% |

### Why they pass

| reason | buyers | in their words |
| --- | ---: | --- |
| habit | 31 | "My whole salon already runs on WhatsApp on one phone and it works; asking 5 to 10 stylists to take selfies and type every walk-in's number in an English app is a fight I don't want in a normal week. The cash-drawer and cancelled-bill checks do interest me, but not enough to pay ₹4,999 upfront for software my staff may quietly stop using." (P002) · "I have one or two chairs and I count the drawer myself every night, so I already know what came in. My bookings and customers are all on WhatsApp and it works; ₹999 every month plus ₹4,999 upfront is a lot from what I earn for something I mostly do with my own eyes." (P004) |
| price | 24 | "Five thousand rupees up front and then a thousand every month, forever, for something my register and WhatsApp already do for free. I avoid monthly payments, and twelve thousand a year is real money for a small parlour like mine." (P005) · "I run one or two chairs and cut most of the hair myself, so I already know who is in the chair and what is in the drawer. ₹4,999 upfront plus ₹999 every month forever is too much for something my notebook and WhatsApp already do for free." (P012) |
| trust | 22 | "I have one or two chairs and I cut hair myself, so I already know who is in the chair and what is in the drawer. No owner I know uses this, and I am not paying ₹4,999 plus ₹999 every month for an app nobody around me has tried." (P001) · "My register has never crashed on a Sunday with ten customers waiting. ₹999 a month is nothing for me, but if the app stops billing in the rush and nobody picks up the phone, I lose money and face in front of customers." (P006) |
| need | 13 | "I cut hair myself in a one or two chair shop and count my own drawer every night, so the stylist check-ins, attendance and 'see from anywhere' parts are for a bigger salon than mine. ₹4,999 upfront plus ₹999 every month is real money on what I earn, for things my notebook and WhatsApp already do." (P007) · "I'm standing at my own chair all day and I count the drawer myself every night, so I already know who's in which chair and what the takings are. ₹999 every month plus ₹4,999 upfront is a lot to pay to watch a shop I'm already standing in, and WhatsApp does my bookings for free." (P008) |
| convenience | 1 | "₹999 a month is not the issue for a salon my size, but half my staff will not work in an English app, and my whole business already runs fine on WhatsApp. If my stylists fumble at the counter, I end up back on WhatsApp and the register anyway." (P027) |

### Why they buy

| reason | buyers | in their words |
| --- | ---: | --- |
| need | 6 | "With 8 staff I honestly don't know if the cash in the drawer matches the bills or if someone is doing customers off the book, and ₹999 a month is nothing next to that leak. The first month is free, so I'd try it, though the ₹4,999 setup only feels fair if they actually train my people in the salon." (P003) · "I count the drawer myself every night with 5 to 10 staff, so seeing cancelled bills, walk-outs and what cash should be there, from my phone, is exactly the leak I worry about. With the first month free I'll try it, and a branded app makes the salon look modern." (P020) |
| convenience | 3 | "An app with my salon's name, WhatsApp bills and a prepaid wallet makes my place look modern next to the other parlours, and I could finally see the takings and the drawer cash without standing at the counter. The first month is free, so I can test it, but I'd make the selfie check-in optional for my staff." (P036) · "My own branded app on the stylists' phones, WhatsApp bills and the cash-drawer check would make the parlour look modern and stop me chasing the register, and with the first month free I can test it properly. ₹999 is one or two haircuts a month, so if the wallet and reminders bring even a few customers back it pays for itself." (P052) |

### What would flip a no

- If another salon owner I know, or my product distributor, was already using it and showed me it keeps the data safe even when the phone is lost.
- Seeing it actually running in another salon of my size nearby, with the setup fee charged only after the free month if my staff are still using it.
- If it worked inside WhatsApp itself with no typing for the staff, and cost a few hundred rupees a month with no setup fee.
- No setup fee, a one-time price or a yearly plan under ₹5,000, a Hindi/local-language option, and a phone number that is actually answered on Sundays.
- A written promise of same-day phone support on Sundays and holidays, plus seeing it running smoothly in another salon owner's shop near me for a few months.
- No setup fee and a cheaper solo plan around ₹299 a month, so I can try it on my own shop first and see if regulars actually come back from the WhatsApp reminders.
- No setup fee and around ₹299 a month, with proof that my customer list is backed up and I can download it any time, even if the phone breaks or I stop paying.
- A small-shop plan around ₹299-399 a month with no setup fee, just billing on WhatsApp, reminders and the wallet, with proof that my data is backed up online and comes back on a new phone.
- If it was only the customer side, the WhatsApp reminders, wallet and referral, for around ₹299-399 a month with no setup fee, and someone showed me it actually brings old customers back.
- A cheaper version for a one-chair shop with no setup fee, only the WhatsApp reminders and customer list, and proof that my data stays safe if the phone is lost.
- A one-time price with no monthly fee, around ₹3,000, with a phone number that actually answers on Sundays.
- No setup fee and pay only after my stylists have actually used it every day for a full month, so I see it working in my own salon before any money goes out.

Buyers say they would buy **1.0 times** in the first month on average.

100 buyers gave all four price answers. Run founder-pricing's van_westendorp.py on the answers folder.

## Pricing

Basis: `cfo.md` (24 Oct), `offer.md` (re-test 3/20 → 12/20), `competitors.md` (prices seen 22 Oct), the re-test's price answers, the founder's decisions (₹10,000 setup, ₹500 a month, one-tap WhatsApp, APK, Bhubaneswar first). **Recommendation for the founder to decide;** simulated buyers, not real ones.

### What the numbers say

- At ₹500 a month the business lives on **setup fees**: year 1 brings ₹2.88 lakh from setups and ₹51,000 from monthly fees. Monthly fees alone cover a ₹40,000 founder pay only at **129 salons**, more than one person can support.
- At ₹799 that falls to **68 salons**; at ₹999 to **52** (cfo.md).
- Competitors' plans for a 5–10 staff salon cost **₹1,249–₹4,000 a month** (Zylu Standard ₹1,999 is the first Zylu plan with WhatsApp and attendance). Ours at ₹799 is still below every paid rival found, with no WhatsApp charges and setup done in person.
- The re-test owners who priced the monthly fee put "a bargain" at about ₹300–500 and "getting expensive" at ₹800–1,500. One 9+ chair studio owner said ₹500 sounded "too cheap to be serious" (his bargain: ₹800). So small and large salons should not pay the same.

### Draft tiers (updated 24 Oct to ₹699)

| Plan | For | Setup | Monthly | What's extra |
|---|---|---:|---:|---|
| **Founding Salon Plan** | First 5 Bhubaneswar salons only (5+ chairs) | ₹10,000 in two halves | **₹699, locked 2 years**; first 3 months free | Everything in `offer.md`; in return the owner lets 1–2 nearby owners see it (a phone call is fine) |
| **Salon** | 5–8 chairs | ₹10,000 in two halves | **₹699** | Everything in the founding plan: live salon, cash checks, unlimited staff, one-tap WhatsApp, backup and download, training in Odia/Hindi/English, a person who answers 7 days |
| **Salon Plus** | 9+ chairs, bridal studios | ₹15,000 in two halves | **₹1,299** | A second training visit on day 15, a monthly 20-minute review call with the owner (what the cash checks found, which stylists bring customers back), a same-day visit if billing stops |
| **Extra outlet** | Second branch of either plan | ₹5,000 | **₹500** | Its own app on its own phones; one combined live view comes later (V2), not promised now |
| **Yearly** | Any plan | same | **10 months' price for 12**: Salon ₹6,990/yr, Salon Plus ₹12,990/yr | Fewer bills in slow months (the panel's "monthly fee in slow months" objection) |

The guarantee (second half of the setup only if stylists bill on 20+ working days, else fix or refund the first half) applies to every plan.

Not offered: plans for 1–4 chair salons (0% bought in the panel; not the target).

### The price (decided 24 Oct)

**Founder, 24 Oct: "use 10000 for app, 699 monthly".**

- **₹10,000 setup** (two halves, with the guarantee) **+ ₹699 a month**, locked for 2 years. The first 5 Bhubaneswar salons keep the founding extra: first 3 months free in return for being a reference.
- Why it holds: ₹699 is below every paid competitor found (₹1,249–₹4,000), inside the re-test owners' "getting expensive but would buy" band (₹800–1,500 for most), and each salon leaves ₹532 a month instead of ₹338 at ₹500.
- Year 1 (cfo.md): **₹2.49 lakh profit without founder pay**; break-even on monthly fees with ₹40,000 founder pay at **82 salons**.
- Still to decide: Salon Plus (₹15,000 + ₹1,299) for 9+ chair and bridal salons, the extra-outlet price, yearly prepay, and whether prices include GST.

### Next

Test ₹699 and Salon Plus on the first real owners. If more than 1 in 3 demos stall on the price, look at the setup fee first (it's the bigger number) before cutting ₹699.

## The offer

City: **Bhubaneswar** (founder, 24 Oct). Target: salons with 5+ chairs, good Google reviews, popular in local search.
Inputs: `panel/results.md` (100 simulated owners, earlier price), `competitors-complaints.md` (~157 real reviews), `board.md` (round 2), `RUNNING-COSTS.md` (24 Oct), `marketing.md`.
New pitch: `pitch.md` (old one kept as `pitch-v1.md`; today's plain offer before this work: `pitch-v1b-current.md`).

### 1. The problem list (in the buyer's words)

**Before buying**
1. "₹10,000 before I've seen it work." (panel's top flip: setup only after it works, ~65)
2. "Nobody I know uses it." (0% of "asks other owners first" bought)
3. "Will this small company be here next year with my data?"
4. "My register / WhatsApp / Zylu works. Why switch?"
5. "Moving my customers and wallet balances is a headache."
6. "Sales people promise things that never come." (8 real reviews)
7. "Monthly fee in slow months, and it'll go up later." (price rises, 4 reviews)
8. "Hidden WhatsApp charges." (Zylu review)

**During setup and use**
9. "Setup drags on for weeks." (10 real reviews)
10. "My stylists won't type every walk-in at rush hour." (panel's biggest objection)
11. "Selfie check-in and bill checks will make my staff feel watched." (stylists lost last year)
12. "My stylists speak Odia and Hindi, not English."
13. "Many customers won't give their mobile number."
14. "The internet drops."
15. "It crashes with a customer waiting." (9 real reviews)

**After**
16. "Support disappears once I've paid." (26 real reviews, the top complaint)
17. "Who helps on a packed Durga Puja or wedding Sunday?"
18. "Phone breaks or a stylist leaves → data gone."
19. "Commission or cash numbers come out wrong." (6 reviews)
20. "I'll be charged after I cancel / locked in." (3 reviews)
21. "Will it actually bring customers back?"
22. "My Google rating matters; will this help or hurt it?"

### 2. Solutions, scored (value 1–5 to the buyer; cost 1–5 to us)

| Problem | Solution | Value | Cost | Keep |
|---|---|---:|---:|---|
| 1 | **Pay setup in two halves: ₹5,000 now, ₹5,000 at day 30 only if stylists bill on 20+ working days; if not, we fix it or refund the first ₹5,000** | 5 | 2 | ✅ guarantee |
| 2 | First 5 salons become references (owner lets 1–2 nearby owners see it) | 4 | 1 | ✅ |
| 3, 18 | Online backup + download everything any time, even after stopping | 5 | 1 | ✅ |
| 4, 5 | We type in the existing customer list (register or old app), with wallet balances | 4 | 2 | ✅ bonus |
| 6 | Only demo what's built; written list of what's included | 3 | 1 | ✅ |
| 7, 20 | ₹500 locked 2 years; cancel inside the app | 4 | 1 | ✅ |
| 8 | One-tap WhatsApp: no WhatsApp charges ever | 4 | 1 | ✅ |
| 9 | Setup in one half-day visit at a quiet time | 5 | 2 | ✅ core |
| 10, 12 | Walk-in in about a minute; training in Odia, Hindi or English + one-page guide | 5 | 2 | ✅ bonus |
| 11 | Selfie check-in off by default; owner chooses | 4 | 1 | ✅ (built into the app plan) |
| 13 | Bill a customer without a mobile number | 4 | 1 | ✅ |
| 14, 15 | Works offline; saves the bill first | 4 | 1 | ✅ |
| 16, 17 | A named person, phone + WhatsApp, 7 days, festival weeks included | 5 | 3 | ✅ bonus |
| 19 | Barber sees each bill's earning live; daily totals check | 3 | 1 | ✅ (app) |
| 21 | Due-back reminders and referral reward (one tap) | 4 | 1 | ✅ |
| 22 | Google review request in the thank-you message | 4 | 1 | ✅ |
| — | Odia/Hindi app screens | 4 | 3 | ❌ not now: founder said no extra fonts; see open question |
| — | Free trial month, no money down | 4 | 4 | ❌ the half-payment guarantee gives most of the safety for less risk |
| — | Second support person | 4 | 5 | ❌ not yet affordable; revisit at 10 salons |

### 3. The stack

- **Name:** *The Bhubaneswar Founding Salon Plan*.
- **Core:** "Your salon, live on your phone, set up in one visit, with a person who answers." The branded app on every phone, a walk-in billed in about a minute, the live salon and the cash checks for the owner, works offline, unlimited staff.
- **Bonus 1: Done in one visit.** Half-day setup at a quiet time; we type in your existing customers (up to 500, with wallet balances). Kills: setup drags, switching pain.
- **Bonus 2: Your stylists, trained in their language.** Odia, Hindi or English training at the salon + a one-page guide. Kills: "staff won't use it", "English only".
- **Bonus 3: A person who answers.** Named, 7 days, festival weeks included. Kills: support disappears.
- **Guarantee: Pay half when it works.** ₹5,000 on setup day; ₹5,000 at day 30 only if stylists billed on 20+ working days; if not, we come back to fix it, or you stop and get your ₹5,000 back.
- **Promises:** ₹699 a month locked 2 years (founder, 24 Oct: "use 10000 for app, 699 monthly"; the re-test below was run at ₹500); no WhatsApp charges; cancel in the app; take all your data any time.
- **True scarcity:** the first 5 Bhubaneswar salons (as many as one person can set up and support well in a month) get the first 3 months' monthly fee free, in return for letting 1–2 nearby owners see it running. No countdown; when 5 are set up, it ends.

### 4. What it costs us

| Item | Per salon |
|---|---:|
| Setup visit, travel, typing in customers (estimate) | ₹1,500 |
| Guarantee: assume 1 in 5 salons fails the 20-day check and asks for the ₹5,000 back (estimate) | ₹1,000 expected (+ ₹5,000 not collected from those salons) |
| 3 free months for the first 5 salons: ₹468 kept per month × 3 | ₹1,404 forgone (first 5 only) |
| Running cost (server, payment fee) | ₹32 a month |

Cash on setup day: ₹5,000 − ₹1,500 = **₹3,500**, enough for the marketing plan's target of under ₹3,000 to win a salon. At day 30, +₹5,000 from each salon whose staff are using it.
The claim rate (1 in 5) is a guess; the first 5 salons will give the real number. Have a CA check GST on the setup fee and how a refund is invoiced.

### 5. Value equation (1–10, before → after)

| | Before (₹10,000 + ₹500, plain) | After (this offer) | What moved it |
|---|---:|---:|---|
| Dream outcome | 6 | 7 | "Your salon, live on your phone" + Google reviews + customers coming back |
| Perceived likelihood | 3 | 6 | Pay-half guarantee, references, named support, data backup, training in their language |
| Time to result | 5 | 7 | Done in one visit, existing customers typed in |
| Effort and sacrifice | 4 | 7 | We do setup and import; one-minute billing; bill without a number; works offline |

### 6. Re-test: same 20 simulated owners, Bhubaneswar, 5+ chairs (seed 339387)

**Before (plain ₹10,000 + ₹500): 3 of 20 buy (15%). After (this offer): 12 of 20 buy (60%).** Nine owners moved from no to yes and none from yes to no.

| | Before | After |
|---|---:|---:|
| 5–8 chair salons | 2 of 12 | 8 of 12 |
| 9+ chairs / bridal studios | 1 of 5 | 2 of 5 |
| Owners of 2 outlets | 0 of 3 | 2 of 3 |
| Pass reasons | habit 8, trust 5, other 2, convenience 2 | habit 5, trust 2, timing 1 |

What dropped: "₹10,000 wasted if staff don't use it" (the half-payment guarantee was named by most of the 9 who flipped), data-loss fears (backup and download), "staff don't speak English" (training in Odia/Hindi), customers without numbers.

**What is still left (fix these next):**
1. **"It's one person."** The most repeated new doubt: what if he's sick or busy at another salon during Durga Puja or wedding season. → Name a backup person (even part-time) before the 3rd salon; publish the support hours.
2. **App screens in English only.** Three buyers said they'd turn to no on finding the screens are English-only (training in Odia isn't enough for them). → Founder decision needed (see below).
3. **Staff feeling watched** by the live view and bill checks (still raised by buyers who said yes). → Selfie check-in off by default; show staff their own earnings first in the demo.
4. **Paper-register loyalists and "asks other owners first" still 0%.** Only real nearby salons will move them; the first 5 references are the plan.
5. **Timing:** don't sell setup during Durga Puja, Diwali or the wedding season; book it for the quiet weeks after.
6. **500-customer import cap** was too low for one large salon. → Import everything from Excel or the old app; type in from the register up to 500.
7. One buyer disliked showing the salon to nearby competitors for the 3 free months → let the reference be a phone call instead of a visit.

**Limits:** simulated buyers, not real owners; they lean agreeable, so 60% is an upper bound. The price answers this time mix the setup fee and the monthly fee (the brief didn't say which), so they can't be used for a price range.

### Open question for the founder

The founder said "do not add any Hindi fonts". Android already has Odia and Hindi fonts built in, so the **stylist screens could show Odia or Hindi words without adding any font to the app**. Is that wanted? It's the biggest remaining reason buyers would say no.

## The numbers

**Inputs** (`numbers.json`, sources in `cfo-sources.md`): **₹699 a month per salon** (founder, 24 Oct); setup ₹10,000 in two halves (`offer.md`); first 5 salons get 3 months free; WhatsApp by one tap (₹0); running cost ₹167 per salon a month (server ₹20, payment fee ₹16.5, Help with Claude ~₹30, support helper ₹100). **Estimates to replace with real numbers:** founder pay ₹40,000 a month, 3 new salons a month from month 3, 1 in 5 new salons fails the 20-day check and gets the first ₹5,000 back, 3% of salons leave each month, setup visit ₹1,500. Not financial, tax or legal advice: a CA should check the structure, GST (18% on top of these prices unless they are set as GST-inclusive) and how refunds are invoiced before money moves.

The tool below counts only the monthly fee; the setup fee is added by hand (same inputs):

- **The margin:** each paying salon leaves **₹532 a month (76%)** after its own costs. Each new setup leaves about **₹7,500** (₹9,000 expected after refunds − ₹1,500 visit).
- **Year 1:** setup fees ₹2.88 lakh + monthly fees ₹71,000.
  - Without founder pay: **profit ₹2.49 lakh**; lowest cash point **−₹23,600** (the cash needed).
  - With ₹40,000 a month founder pay: **loss ₹2.31 lakh**; cash needed **₹2.51 lakh**.
  - The tool's year-1 line (−₹4.69 lakh) leaves out the setup income, so `compile.py` will mark year 1 as a loss either way while founder pay is in.
- **Break-even on monthly fees alone:** **82 salons** with ₹40,000 founder pay (129 at ₹500); **7 salons** without founder pay.
- **Once sales stop**, ~23 salons at ₹699 leave **₹8,500 a month** (₹4,100 at ₹500).
- **Three years** (3 new salons a month, ~51 salons by month 36): cash **+₹11.7 lakh** without founder pay; **−₹2.7 lakh** with ₹40,000 pay from day one.
- **The line to watch:** new salons a month. Every salon set up brings ~₹7,500 at once and ₹532 a month after; 20% fewer setups costs ~₹58,000 of year-1 setup income.
- **Three ways to improve:** (1) Salon Plus at ₹15,000 + ₹1,299 for 9+ chair and bridal salons (`pricing.md`); (2) keep founder pay low until ~80 salons, or take it from setup fees only; (3) yearly prepay (10 months' price for 12) for cash up front and fewer leavers in slow months.
- **Board money condition** ("monthly price covers monthly cost"): **met** (₹699 against ₹167).

---

## Unit economics: Salon app, Bhubaneswar: ₹10,000 setup (two halves) + ₹699 a month per salon (setup fee shown separately in the CFO note)

Every number below comes from the input file. Nothing is looked up or guessed.

### One paying salon-day (₹699 a month / 30)

| line | per paying salon-day (₹699 a month / 30) |
| --- | ---: |
| Price | ₹23.30 |
| Server and database, Firebase (₹20/salon/month; RUNNING-COSTS.md) | -₹0.67 |
| Payment collection fee ~2.36% incl. GST (₹16.5/month on ₹699) | -₹0.55 |
| Help with Claude, ~5 requests/salon/month at ~₹6 (estimate; PLAN-24-OCT.md) | -₹1.00 |
| Support helper time (estimate ₹100/salon/month) | -₹3.33 |
| **Contribution** (what each paying salon-day (₹699 a month / 30) leaves to pay the fixed costs) | **₹17.75** (76%) |

### The margin that matters

Fixed costs: ₹43,600 a month (Founder pay (estimate; founder to confirm) ₹40,000, Domain, email, support phone number (RUNNING-COSTS.md) ₹600, Phone and local travel in Bhubaneswar, not counting setup visits (estimate) ₹3,000).

- **Break-even: 82 paying salon-day (₹699 a month / 30)s a day.** Below that you lose money every month.
- **Profit margin at your plan** (60 a day): **-28%** of every sale, after every cost.
- Capacity: 60 a day.

### Year 1, month by month

| month | paying salon-day (₹699 a month / 30)s a day | revenue | profit | cumulative (after ₹20,000 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | ₹0 | -₹43,600 | -₹63,600 |
| 2 | 0 | ₹0 | -₹43,600 | -₹107,200 |
| 3 | 0 | ₹0 | -₹43,600 | -₹150,800 |
| 4 | 0 | ₹0 | -₹43,600 | -₹194,400 |
| 5 | 2 | ₹1,678 | -₹42,322 | -₹236,722 |
| 6 | 6 | ₹4,334 | -₹40,298 | -₹277,020 |
| 7 | 11 | ₹7,409 | -₹37,956 | -₹314,976 |
| 8 | 13 | ₹8,877 | -₹36,837 | -₹351,813 |
| 9 | 15 | ₹10,275 | -₹35,772 | -₹387,586 |
| 10 | 17 | ₹11,673 | -₹34,707 | -₹422,293 |
| 11 | 19 | ₹13,001 | -₹33,696 | -₹455,988 |
| 12 | 20 | ₹14,260 | -₹32,737 | -₹488,725 |

- **Year 1 operating profit: -₹468,725** on ₹71,508 of revenue.
- After the ₹20,000 startup spend: -₹488,725.
- Startup money earned back: not within year 1.
- Cash you need before it pays for itself: **₹488,725**.

### What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | -28% | 82 | -₹468,725 |
| Price -10% | -42% | 95 | -₹475,876 |
| Volume -20% | -54% | 82 | -₹479,620 |
| Unit costs +15% | -31% | 86 | -₹471,280 |

### Red flags

- Break-even needs 82 paying salon-day (₹699 a month / 30)s a day but capacity is 60.
- Year 1 loses money on operations (-₹468,725).
- The startup spend is not earned back within year 1.

## Marketing

Question from the founder: "How will the app be distributed to the owners, how will we find them, and on what media?"

**Evidence used:** `panel/results.md` (100 simulated owners, old ₹4,999 + ₹999 price: research, not customers), `competitors.md` and `competitors-complaints.md` (~157 real public reviews), `board.md` (round 2), `RUNNING-COSTS.md` (24 Oct update), `salon-mobile/PLAN-24-OCT.md`.
**Update 24 Oct:** city = **Bhubaneswar**; offer = `offer.md` (the Bhubaneswar Founding Salon Plan: ₹5,000 now, ₹5,000 at day 30 only if staff use it, ₹699 a month locked 2 years, first 5 salons get 3 months free as references); prices in `pricing.md`.
**Launch date:** not set. "Day 0" below = the day the one-phone demo APK is ready; dates are counted from it.

### 1. Who we go after first

From the evidence:
- Salons with **5–8 chairs**: 20% bought in the panel (1–2 chair barbers: 0%). The founder's target (5+ chairs, good reviews, popular in search) matches.
- **Owners who are often away** from the salon (second outlet, another job): 33%, the highest of any group.
- **Young owners who like tech**: 29%.
- Nobody bought among "asks other owners first" (0%), but their flip was "show me a salon near me that uses it". So the first 5 salons are the marketing.

**Where to find them:** Google Maps. Search "unisex salon", "salon", "beauty parlour", "men's salon" in the chosen area; keep salons with **rating 4.3+ and 150+ reviews** (popular and protective of their rating), a photo showing **5+ chairs**, and open 7 days. Their Google listing also gives the phone number, Instagram and the busy hours (so we visit when they're quiet).

**One city first** (board condition): the founder's own city, or the nearest tier-1/2 city, so the founder can visit and support in person.

### 2. Positioning (three versions)

1. **"The salon app that comes with a person."** For owners of busy 5+ chair salons who can't trust that software support will answer after they pay, ours is the salon app set up in your salon in one visit, with a person who answers 7 days a week, and you see your salon live from your phone. Unlike Zylu, Salonist or Invoay, whose reviews say support disappears after the sale.
   Evidence: support vanishing is the top complaint in real reviews (26 of ~157); setup never finishing is next (10).
2. **"See your salon live, wherever you are."** For owners who are often away, who worry what happens to the cash and the chairs, ours shows every chair, every bill and the cash that should be in the drawer, live on your phone.
   Evidence: owners often away bought most (33%); the cash-drawer and cancelled-bill checks were the most-liked features.
3. **"Keep your 4.5 stars."** For top-rated salons, ours brings customers back on time and asks every happy customer for a Google review.
   Evidence: the founder's target is salons with good reviews; Zylu is the only competitor found doing review requests.

**Recommended: 1 as the promise, 2 as the demo.** Version 1 answers the biggest real complaint, and nobody can copy a person quickly. The live salon (version 2) is what makes the owner say "show me" on the visit, but it can't be the whole pitch: AXOIX and SalonLux already show live chairs, so we never say "only we have this".

### 3. How the app reaches the owner (distribution)

1. **First contact:** walk-in visit with the demo phone (main channel), or an Instagram/WhatsApp message asking for 10 minutes.
2. **10-minute demo on our phone:** stylist view: bill a walk-in in under a minute → switch to owner view → the live salon moves, PAID stamp, cash in the drawer updates. Leave a one-page sheet with the price and the founder's number.
3. **Yes → setup visit (half a day, at a quiet time):** enter their services and prices, chairs and stylists, logo and colours; install **their own branded APK** on the owner's and every stylist's phone; teach each stylist one bill; first real bill together.
4. **After:** a call on day 2 and day 7; the Help "?" button goes to the founder; the alert when a salon stops billing for a day.

No Play Store: the founder installs it. That's part of the promise ("we come to you"), and it lets each salon have its own app icon.

### 4. Channels (where these owners spend attention)

| Channel | Why it fits | Rough cost | How we know it worked |
|---|---|---|---|
| **Walk-in visits with the demo phone** (main) | Owners buy from people they've met; the demo sells itself; panel: "show me in a salon near me" | Travel ₹100–300 a visit; founder's time | Demos given ÷ visits; yes ÷ demos |
| **Google Maps as the lead list** | Finds exactly the target (5+ chairs, 4.3+, 150+ reviews) and when they're quiet | Free | Leads that match all three filters |
| **Instagram DMs + following** | Most popular salons post daily before/afters; a DM with a 30-second screen recording of the live salon gets a look | Free | Replies ÷ DMs; visits booked from DMs |
| **WhatsApp follow-up** | Every owner's real inbox; send the demo video and the one-pager after the visit | Free | Replies within 2 days |
| **Product distributors** (L'Oréal/Matrix/Schwarzkopf dealers who visit salons monthly) | Panel: the "asks others first" group would flip on a distributor's word; one dealer reaches 50–200 salons | A referral fee per salon won (to agree, e.g. ₹1,000) | Salons introduced per distributor |
| **The first 5 salons** | The "owner near me who uses it" that every doubter asked for | Their setup free or discounted (decide in /founder-offer) | Owners who agree to take a call or a visit |

**Not doing now:**
- **Google Search ads:** competitors bid on "salon software"; costly per click and attracts all salon sizes.
- **Facebook/Instagram paid ads:** wait until the first 5 salons give us real screens and real words (with permission). Then a small test in one city only.
- **Justdial/IndiaMART listings:** competitors are there; it brings price-shoppers.
- **Trade shows and expos:** costly and slow for one founder; revisit with 20+ salons.

### 5. The 30-day campaign (Day −14 to Day +16)

**Day 0 = demo APK ready.** Weekdays only for visits (Tuesday to Thursday, 11 am–4 pm, when salons are quiet); never Sundays or festival weeks (their busiest days).

| Day | Channel | What goes out | Message |
|---|---|---|---|
| −14 | Google Maps | Build the lead sheet: 60 salons in one area that match the filters, with phone, Instagram and quiet hours | — |
| −13 | Instagram | Set up the business account: name, the live-salon screen as the first post, "set up in your salon, support 7 days" | Hook 1 |
| −12 | Print | One-page sheet + business card (price, what's included, founder's number) | Positioning 1 |
| −11 | Instagram | Follow the 60 salons; like and comment genuinely on 2 posts each over the week | — |
| −10 | Instagram | Post: 15-second screen recording of a walk-in billed in under a minute | Hook 2 |
| −9 | Distributors | Find 2–3 product distributors in the area (ask any salon "who supplies your colour?") and call them | "Your salons, a tool that keeps them busy" |
| −8 | Instagram | Post: the live salon moving as a bill is paid | Hook 3 |
| −7 | Visits | Practise the 10-minute demo on 3 friendly salons (not selling): fix what confuses them | — |
| −6 | Instagram DM | First 15 DMs: 1-line intro + the live-salon video, ask for 10 minutes Tue–Thu | Hook 4 |
| −5 | Instagram | Post: "What happens to your data": backup, take it with you any time | Hook 5 |
| −4 | Instagram DM | Next 15 DMs | Hook 4 |
| −3 | WhatsApp | Follow up DMs that replied: book visit times | — |
| −2 | Distributors | Meet 1–2 distributors; leave the one-pager and the demo video | — |
| −1 | All | Charge the demo phone, reset the demo data, print 30 sheets | — |
| **0** | Visits | **Demo APK ready.** First 4 booked visits | Promise + demo |
| +1 | Visits + WhatsApp | 4 walk-in visits; WhatsApp the video and sheet to every owner seen the same evening | Hook 6 |
| +2 | Visits | 4 visits | — |
| +3 | Instagram | Post: "Support that picks up": who answers when you press "?" | Hook 7 |
| +4 | Visits | 4 visits; ask every interested owner "which day can I set it up?" | — |
| +5 | WhatsApp | Follow up everyone seen this week | Hook 8 |
| +6 | Rest | Weekly numbers (section 7) | — |
| +7 | Setup | **First setup visit** (aim: first yes by now) | — |
| +8 | Visits | 4 visits; tell owners a salon nearby is starting this week (only if true) | — |
| +9 | Setup | Second setup visit; call the first salon (day-2 call) | — |
| +10 | Instagram | Post: behind the scenes of a setup visit (no customer data, with the owner's permission) | Hook 9 |
| +11 | Visits | 4 visits in a second area | — |
| +12 | Distributors | Second round: report back; agree the referral fee | — |
| +13 | WhatsApp | Follow up | Hook 10 |
| +14 | Setup | Setup visits 3–4; day-7 call to the first salon | — |
| +15 | First salons | Ask the first salon if the owner will take a call from a nearby owner (never fake it) | — |
| +16 | Review | 30-day review: what worked (section 7), set the next month | — |

**When there is nothing new to post:** a setup visit (with permission), the making of a screen, a sound or design choice, "what the cash-drawer check caught today" (only real, with permission), a tip for owners (how to count the drawer, how to remind customers to come back).

**Launch offer:** the Founding Salon Plan (`offer.md`): first 5 Bhubaneswar salons, ends when 5 are set up. Don't announce a deadline that isn't real.

### 6. Ten hooks

Each answers a real complaint or a panel objection. Never quote panel answers as customer words.

| # | Format | Hook | Answers |
|---|---|---|---|
| 1 | Instagram bio / sign | "Set up in your salon in one visit. A person answers 7 days a week." | Support disappears (26 reviews) |
| 2 | Video, first 3 seconds | "One walk-in, one minute, billed." | "Staff won't type at rush hour" (panel) |
| 3 | Video, first 3 seconds | "This is my salon. Live. I'm not there." | Owner often away (33% bought) |
| 4 | DM opening line | "You have 4.6 stars and 300 reviews. Can I show you how to keep them, in 10 minutes?" | Target is top-rated salons |
| 5 | Post headline | "Your customers, your data. Download everything, any time, even if you leave." | Data loss / lock-in (panel) |
| 6 | WhatsApp after the visit | "Here's the 1-minute video of what you saw today. Which day suits you for setup?" | Follow-up |
| 7 | Post headline | "Press '?' and we pick up. Sundays too." | Who helps on a busy Sunday (panel) |
| 8 | WhatsApp | "Cash in the drawer should be ₹2,400. Your app tells you before you count." | Cash leakage (most-liked feature) |
| 9 | Video, first 3 seconds | "What setup looks like: half a day, every stylist trained." | Setup never finishes (10 reviews) |
| 10 | Sign / one-pager | "₹699 a month. No WhatsApp charges, no staff limits, cancel in the app." | Hidden charges, price rises, staff limits (reviews) |

### 7. Budget and numbers

**First 30 days (estimate):** print ₹2,000 (30 sheets, 200 cards) · travel ₹6,000 (≈40 visits) · Instagram ads ₹0 (organic only until real salons exist) · distributor referral fees paid only per salon won. **Total ≈ ₹8,000** plus the founder's time.

**The most we can pay to win one salon:**
- Each salon pays ₹10,000 upfront; setup visit and travel cost us about ₹1,500 (estimate) → **₹8,500 left on day one**.
- Each month after: ₹699 − ₹167 running cost = **₹532** (cfo.md, 24 Oct).
- The panel's buyers bought 1.0 time in the first month (one salon = one sale).
- So winning a salon can cost **up to ₹8,500 and still be cash-positive on the day it starts**. Aim for **under ₹3,000** (travel for ~10 visits + print + a ₹1,000 distributor fee), leaving room to discount the first 5.

**Watch weekly:**

| Number | Healthy | Change something if |
|---|---|---|
| Demos given ÷ visits | 40%+ | Under 25% two weeks running → change the opening line or the visit time |
| Yes (setup booked) ÷ demos | 15%+ (the panel's 20% for 5–8 chairs is an upper bound) | Under 10% after 20 demos → fix the offer (/founder-offer: guarantee, upfront fee) |
| Salons still billing every day after 14 days | 100% of the first 5 | Any salon stops → visit within 2 days; that's the product, not marketing |

### Rules kept

- No fake reviews, follower counts, testimonials or "as seen on". Real salons are named only with the owner's written OK.
- Panel quotes are research only.
- We don't claim to be the only live-salon app (AXOIX and SalonLux have live chair views).
- Distributor referral fees are told to the salon if asked.
- Not legal advice: check GST on the ₹10,000 setup (18% on services) with a CA before the first invoice.

## Not done yet

- Brand: run /founder-brand
- Operations: run /founder-ops
- Launch plan: run /founder-launch

_The panel is simulated buyers and the numbers are projections from your inputs. Confirm demand with real customers and costs with real quotes before you spend. Not financial, legal or tax advice._
