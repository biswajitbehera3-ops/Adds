# Decisions (founder, 31 Oct)

1. **Founder pay: none.** `numbers.json` now has ₹0, so the monthly fees alone break even at **7 salons** (it was 82 with ₹40,000 pay).
2. **Salon Plus: not offered.** One price for every salon in the target: **₹10,000 setup in two halves + ₹699 a month**. The first 5 salons get 3 months free.
3. **GST is not included in the price.** If the business registers for GST, 18% is added on top: ₹699 becomes ₹825 and ₹10,000 becomes ₹11,800. Below the registration limit (usually ₹20 lakh a year; year 1 is about ₹3.6 lakh), no GST is charged. A CA confirms before the first invoice.

**Year 1 with no founder pay** (same inputs as 24 Oct):
- From the tool, monthly fees only: **+₹11,275** operating profit; −₹8,725 after the ₹20,000 startup spend.
- Adding the setup fees by hand (24 Oct note below, unchanged): **+₹2.49 lakh** profit.
- Lowest cash point: **about ₹24,000**, which is the money needed to start.
- Red flag the tool still raises: on monthly fees alone, the startup spend is not earned back in year 1. Setup fees cover it by month 5–6.

---

# CFO update (30 Oct): the price holds at ₹10,000 setup + ₹699 a month

Re-run on 30 Oct with the same inputs (`numbers.json`). Every number below matches 24 Oct. (The tool prints "$"; every figure is in rupees.) Nothing in the cost base changed: WhatsApp is still ₹0 (staff tap), and the launch film is already paid for from this month's Higgsfield credits (178.86 credits; no new cash).

**The price to quote owners**

| Plan | Setup | Monthly | Status |
|---|---:|---:|---|
| Founding Salon (first 5 salons in Bhubaneswar, 5+ chairs) | ₹10,000 in two halves | ₹699, locked 2 years, first 3 months free | decided 24 Oct |
| Salon (5–8 chairs) | ₹10,000 in two halves | ₹699 | decided 24 Oct |
| Yearly prepay | same | ₹6,990 a year (10 months' price for 12) | draft, not decided |

The two halves: ₹5,000 on setup day; ₹5,000 at day 30 only if stylists bill on 20+ working days. If they don't, we come back to fix it, or the owner stops and gets the first ₹5,000 back.

**Your own pay decides the break-even** (same file; only founder pay changed):

| Founder pay a month | Paying salons needed to cover monthly costs |
|---:|---:|
| ₹0 | 7 |
| ₹15,000 | 35 |
| ₹25,000 | 54 |
| ₹40,000 | 82 (above the ~60 one person can support) |

- **The margin:** each paying salon leaves **₹532 a month (76%)**; each new setup leaves about **₹7,500** at once.
- **The line to watch:** new salons a month. Price −10% moves the break-even from 82 to 95 salons; costs +15% only to 86.
- **What finding a salon may cost:** the ₹7,500 a setup leaves pays for up to **25 visits at ₹300** (75 at ₹100) before it turns negative. So walk-in visits pay for themselves as long as about 1 visit in 25 becomes a setup.
- **Cash before it pays for itself:** about ₹24,000 if you take no pay in year 1 (demo phone, first month of print and travel, contingency). With ₹40,000 pay from day one it is ₹2.51 lakh.
- **Decided 31 Oct:** no founder pay, no Salon Plus, GST on top if registered (see Decisions).
- **GST:** if you register, 18% goes on top: ₹699 becomes ₹825 and ₹10,000 becomes ₹11,800. Registration is usually required only above ₹20 lakh a year of turnover (year 1 here is about ₹3.6 lakh). A CA should confirm this before the first invoice.

Not financial, tax or legal advice. A CA should check the structure, GST and how guarantee refunds are invoiced before money moves.

---

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

Fixed costs: ₹3,600 a month (Founder pay (founder, 31 Oct: none) ₹0, Domain, email, support phone number (RUNNING-COSTS.md) ₹600, Phone and local travel in Bhubaneswar, not counting setup visits (estimate) ₹3,000).

- **Break-even: 7 paying salon-day (₹699 a month / 30)s a day.** Below that you lose money every month.
- **Profit margin at your plan** (60 a day): **68%** of every sale, after every cost.
- Capacity: 60 a day.

## Year 1, month by month

| month | paying salon-day (₹699 a month / 30)s a day | revenue | profit | cumulative (after ₹20,000 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | ₹0 | -₹3,600 | -₹23,600 |
| 2 | 0 | ₹0 | -₹3,600 | -₹27,200 |
| 3 | 0 | ₹0 | -₹3,600 | -₹30,800 |
| 4 | 0 | ₹0 | -₹3,600 | -₹34,400 |
| 5 | 2 | ₹1,678 | -₹2,322 | -₹36,722 |
| 6 | 6 | ₹4,334 | -₹298 | -₹37,020 |
| 7 | 11 | ₹7,409 | ₹2,044 | -₹34,976 |
| 8 | 13 | ₹8,877 | ₹3,163 | -₹31,813 |
| 9 | 15 | ₹10,275 | ₹4,228 | -₹27,586 |
| 10 | 17 | ₹11,673 | ₹5,293 | -₹22,293 |
| 11 | 19 | ₹13,001 | ₹6,304 | -₹15,988 |
| 12 | 20 | ₹14,260 | ₹7,263 | -₹8,725 |

- **Year 1 operating profit: ₹11,275** on ₹71,508 of revenue.
- After the ₹20,000 startup spend: -₹8,725.
- Startup money earned back: not within year 1.
- Cash you need before it pays for itself: **₹37,020**.

## What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 68% | 7 | ₹11,275 |
| Price -10% | 64% | 8 | ₹4,124 |
| Volume -20% | 65% | 7 | ₹380 |
| Unit costs +15% | 64% | 8 | ₹8,720 |

## Red flags

- The startup spend is not earned back within year 1.
