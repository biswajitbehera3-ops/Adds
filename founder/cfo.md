# CFO note (24 Oct, updated): ₹10,000 setup + ₹699 a month, Bhubaneswar

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

# Unit economics: Salon app, Bhubaneswar: ₹10,000 setup (two halves) + ₹699 a month per salon (setup fee shown separately in the CFO note)

Every number below comes from the input file. Nothing is looked up or guessed.

## One paying salon-day (₹699 a month / 30)

| line | per paying salon-day (₹699 a month / 30) |
| --- | ---: |
| Price | ₹23.30 |
| Server and database, Firebase (₹20/salon/month; RUNNING-COSTS.md) | -₹0.67 |
| Payment collection fee ~2.36% incl. GST (₹16.5/month on ₹699) | -₹0.55 |
| Help with Claude, ~5 requests/salon/month at ~₹6 (estimate; PLAN-24-OCT.md) | -₹1.00 |
| Support helper time (estimate ₹100/salon/month) | -₹3.33 |
| **Contribution** (what each paying salon-day (₹699 a month / 30) leaves to pay the fixed costs) | **₹17.75** (76%) |

## The margin that matters

Fixed costs: ₹43,600 a month (Founder pay (estimate; founder to confirm) ₹40,000, Domain, email, support phone number (RUNNING-COSTS.md) ₹600, Phone and local travel in Bhubaneswar, not counting setup visits (estimate) ₹3,000).

- **Break-even: 82 paying salon-day (₹699 a month / 30)s a day.** Below that you lose money every month.
- **Profit margin at your plan** (60 a day): **-28%** of every sale, after every cost.
- Capacity: 60 a day.

## Year 1, month by month

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

## What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | -28% | 82 | -₹468,725 |
| Price -10% | -42% | 95 | -₹475,876 |
| Volume -20% | -54% | 82 | -₹479,620 |
| Unit costs +15% | -31% | 86 | -₹471,280 |

## Red flags

- Break-even needs 82 paying salon-day (₹699 a month / 30)s a day but capacity is 60.
- Year 1 loses money on operations (-₹468,725).
- The startup spend is not earned back within year 1.
