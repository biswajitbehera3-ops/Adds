# CFO note (22 Oct)

**Most inputs are my estimates, marked "estimate" in `numbers.json`. Only you know your pay, budget and real costs; send them and I'll re-run.** Setup fee (₹4,999) is kept out: it roughly pays for the in-person setup visit, and the board wants it moved after the free month. One "unit" is one paying salon for one day, so "70 a day" means 70 paying salons. Not financial, tax or legal advice; an accountant should check structure and GST (18% on software is added on top of these prices).

- **The margin:** each paying salon leaves about ₹689 a month (69%) after server, WhatsApp, payment and support costs. At 80 salons the business keeps 9% after all costs.
- **Break-even: about 70 paying salons** at ₹999, if the founder takes ₹40,000 a month. Without founder pay it is **12 salons**.
- **The line to watch: the ramp.** At 2 new salons a month, year 1 ends at 22 salons and loses about ₹4.85 lakh; you would need about ₹5.2 lakh before it pays for itself. Even at 5 a month (55 by month 12) year 1 loses about ₹3.5 lakh.
- **Price:** at ₹499 break-even jumps to about 254 salons; at ₹1,499 it falls to about 41. A cheaper plan only works if it brings in far more salons.
- **Three ways to improve:**
  1. Keep founder pay low in year 1 (side project): break-even 70 → 12 salons, year 1 loss ₹4.85 lakh → about ₹5,000.
  2. Sell the higher-value plan to 5-8 chair / owner-away salons at ₹1,499: break-even 70 → 41.
  3. Win salons faster through a distributor or pilot referrals: 5 a month instead of 2 cuts year 1 loss by about ₹1.36 lakh.
- **Board money conditions:** not met yet. Running cost per salon (server, WhatsApp) is an estimate until sync is built; churn, cost to win a salon and your budget are unknown.

# Unit economics: Salon app: ₹999 a month per salon (setup fee kept out; see note)

Every number below comes from the input file. Nothing is looked up or guessed.

## One paying salon-day (₹999 a month / 30)

| line | per paying salon-day (₹999 a month / 30) |
| --- | ---: |
| Price | ₹33.30 |
| Server and database share (estimate ₹40/salon/month, after online sync) | -₹1.33 |
| WhatsApp messages sent by server (estimate ₹150/salon/month) | -₹5.00 |
| Payment collection fee ~2% (estimate) | -₹0.67 |
| Support time (estimate ₹100/salon/month) | -₹3.33 |
| **Contribution** (what each paying salon-day (₹999 a month / 30) leaves to pay the fixed costs) | **₹22.97** (69%) |

## The margin that matters

Fixed costs: ₹48,000 a month (Founder pay (estimate) ₹40,000, Tools: build service, domain, email (estimate) ₹3,000, Phone, travel to salons (estimate) ₹5,000).

- **Break-even: 70 paying salon-day (₹999 a month / 30)s a day.** Below that you lose money every month.
- **Profit margin at your plan** (80 a day): **9%** of every sale, after every cost.

## Year 1, month by month

| month | paying salon-day (₹999 a month / 30)s a day | revenue | profit | cumulative (after ₹32,100 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | ₹0 | -₹48,000 | -₹80,100 |
| 2 | 2 | ₹1,998 | -₹46,622 | -₹126,722 |
| 3 | 4 | ₹3,996 | -₹45,244 | -₹171,965 |
| 4 | 6 | ₹5,994 | -₹43,865 | -₹215,831 |
| 5 | 8 | ₹7,992 | -₹42,487 | -₹258,318 |
| 6 | 10 | ₹9,990 | -₹41,109 | -₹299,427 |
| 7 | 12 | ₹11,988 | -₹39,731 | -₹339,158 |
| 8 | 14 | ₹13,986 | -₹38,353 | -₹377,510 |
| 9 | 16 | ₹15,984 | -₹36,974 | -₹414,485 |
| 10 | 18 | ₹17,982 | -₹35,596 | -₹450,081 |
| 11 | 20 | ₹19,980 | -₹34,218 | -₹484,299 |
| 12 | 22 | ₹21,978 | -₹32,840 | -₹517,139 |

- **Year 1 operating profit: -₹485,039** on ₹131,868 of revenue.
- After the ₹32,100 startup spend: -₹517,139.
- Startup money earned back: not within year 1.
- Cash you need before it pays for itself: **₹517,139**.

## What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 9% | 70 | -₹485,039 |
| Price -10% | -1% | 82 | -₹498,226 |
| Volume -20% | -6% | 70 | -₹503,231 |
| Unit costs +15% | 4% | 75 | -₹491,175 |

## Red flags

- Year 1 loses money on operations (-₹485,039).
- The startup spend is not earned back within year 1.
