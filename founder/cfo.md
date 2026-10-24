# CFO note (24 Oct): Bhubaneswar Founding Salon Plan

**Inputs** (`numbers.json`, sources in `cfo-sources.md`): ₹500 a month per salon; setup ₹10,000 paid in two halves (`offer.md`); first 5 salons get 3 months free; WhatsApp by one tap (₹0); running cost ₹162 per salon a month (server ₹20, payment fee ₹12, Help with Claude ~₹30, support helper ₹100). **Estimates, to replace with real numbers:** founder pay ₹40,000 a month, 3 new salons a month from month 3 (`marketing.md`: ~40 visits × 40% demos × 15% yes ≈ 2.4, rounded up because the re-test was strong), 1 in 5 new salons fails the 20-day check and gets the first ₹5,000 back, 3% of salons leave each month, setup visit ₹1,500. Not financial, tax or legal advice: a CA should check the structure, GST (18% on software and setup is added on top of these prices) and how refunds are invoiced before money moves.

The tool below counts only the monthly fee. The setup fee is added by hand in the year-1 table (same inputs).

- **The margin:** each paying salon leaves **₹338 a month (68%)** after its own costs at ₹500. Each new salon's setup leaves about **₹7,500** (₹9,000 expected after refunds − ₹1,500 visit).
- **What the business really is at ₹500:** a **setup-fee business**. In year 1, setup fees bring ₹2.88 lakh and monthly fees only ₹51,000. If sales stopped at month 12, ~23 salons at ₹500 would leave **₹4,100 a month** after running costs, before any founder pay.
- **Year 1:**
  - Without founder pay: profit **₹2.29 lakh**; cash never goes below **−₹23,600** (startup ₹20,000 + month 1). That is the cash needed.
  - With ₹40,000 a month founder pay: loss **₹2.51 lakh**; cash needed **₹2.71 lakh**.
- **Break-even on monthly fees alone** (fixed ₹43,600 with founder pay): **129 salons at ₹500**; 68 at ₹799; 52 at ₹999. Without founder pay: 11 salons at ₹500.
- **The line to watch: the monthly price and the pace of new salons.** ₹500 → ₹999 drops break-even from 129 to 52 salons (tool what-if). Selling 20% fewer salons removes about ₹58,000 of year-1 setup income.
- **Three ways to improve:**
  1. **Price by salon size** (pricing.md): Salon ₹799 and Salon Plus ₹1,299 after the founding 5 → year-1 profit without pay ₹2.29 L → ₹3.02 L; 3-year cash with ₹40,000 pay −₹4.66 L → **+₹0.63 L**.
  2. **Keep founder pay low in year 1** (side income from setup fees): −₹2.51 L → +₹2.29 L in year 1.
  3. **Yearly prepay** (10 months' price for 12): cash up front, fewer salons leave in slow months; costs 2 months' fee per yearly salon.
- **Board money conditions (board.md):** "monthly price covers monthly cost" → **met** (₹500 vs ₹162 a salon, because WhatsApp is one-tap). Still open: real cost to win a salon, churn, the founder's budget.

---

# Unit economics: Salon app, Bhubaneswar Founding Salon Plan: ₹500 a month per salon (setup fee shown separately in the CFO note)

Every number below comes from the input file. Nothing is looked up or guessed.

## One paying salon-day (₹500 a month / 30)

| line | per paying salon-day (₹500 a month / 30) |
| --- | ---: |
| Price | ₹16.67 |
| Server and database, Firebase (₹20/salon/month; RUNNING-COSTS.md) | -₹0.67 |
| Payment collection fee ~2.36% incl. GST (₹12/month) | -₹0.40 |
| Help with Claude, ~5 requests/salon/month at ~₹6 (estimate; PLAN-24-OCT.md) | -₹1.00 |
| Support helper time (estimate ₹100/salon/month) | -₹3.33 |
| **Contribution** (what each paying salon-day (₹500 a month / 30) leaves to pay the fixed costs) | **₹11.27** (68%) |

## The margin that matters

Fixed costs: ₹43,600 a month (Founder pay (estimate; founder to confirm) ₹40,000, Domain, email, support phone number (RUNNING-COSTS.md) ₹600, Phone and local travel in Bhubaneswar, not counting setup visits (estimate) ₹3,000).

- **Break-even: 129 paying salon-day (₹500 a month / 30)s a day.** Below that you lose money every month.
- **Profit margin at your plan** (60 a day): **-78%** of every sale, after every cost.
- Capacity: 60 a day.

## Year 1, month by month

| month | paying salon-day (₹500 a month / 30)s a day | revenue | profit | cumulative (after ₹20,000 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | ₹0 | -₹43,600 | -₹63,600 |
| 2 | 0 | ₹0 | -₹43,600 | -₹107,200 |
| 3 | 0 | ₹0 | -₹43,600 | -₹150,800 |
| 4 | 0 | ₹0 | -₹43,600 | -₹194,400 |
| 5 | 2 | ₹1,200 | -₹42,789 | -₹237,189 |
| 6 | 6 | ₹3,101 | -₹41,504 | -₹278,692 |
| 7 | 11 | ₹5,301 | -₹40,016 | -₹318,708 |
| 8 | 13 | ₹6,351 | -₹39,306 | -₹358,015 |
| 9 | 15 | ₹7,351 | -₹38,630 | -₹396,645 |
| 10 | 17 | ₹8,352 | -₹37,954 | -₹434,598 |
| 11 | 19 | ₹9,302 | -₹37,311 | -₹471,910 |
| 12 | 20 | ₹10,202 | -₹36,703 | -₹508,612 |

- **Year 1 operating profit: -₹488,612** on ₹51,160 of revenue.
- After the ₹20,000 startup spend: -₹508,612.
- Startup money earned back: not within year 1.
- Cash you need before it pays for itself: **₹508,612**.

## What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | -78% | 129 | -₹488,612 |
| Price -10% | -97% | 152 | -₹493,728 |
| Volume -20% | -114% | 129 | -₹495,530 |
| Unit costs +15% | -83% | 139 | -₹491,098 |

## Red flags

- Break-even needs 129 paying salon-day (₹500 a month / 30)s a day but capacity is 60.
- Year 1 loses money on operations (-₹488,612).
- The startup spend is not earned back within year 1.
