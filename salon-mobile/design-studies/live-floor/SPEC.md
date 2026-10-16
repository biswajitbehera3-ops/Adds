# Live Floor redesign — shared spec (all three directions use only this)

## What it is
The **owner's Live tab** in a per-salon CRM phone app (India). The owner opens it from anywhere (home, another branch) to see **what is happening on the salon floor right now**. It is the first tab in the owner's bottom bar: Live · Earnings · Attendance · Staff · Visits.

## Who and where
Salon owner, glancing at a phone (10 cm viewing distance), for 5–20 seconds at a time, several times a day. They want to know at a glance: which chairs are busy, who is in each chair, what service, which stylist is in charge, how far along, who is waiting, and money coming in. It should feel calm, premium and alive, never like a game HUD or a spreadsheet.

## Fixed brand look (must keep)
- Brown studio backdrop: radial gradient #8E5B4E (glow, top-left) → #4A3029 → #1A1210 (deep), subtle film grain.
- Frosted glass cards: rgba(255,244,236,.12–.2), 1px border rgba(255,244,236,.28), soft inner highlight, 20–26px radius.
- Gold #E4A67B only for money and the single main emphasis. Cream #FFF8F1 text; soft text rgba(255,248,241,.72). Status colours: on-time/ok green #9CCB8F, late/alert #F08C6A.
- Font: "Urbanist" (fall back to system sans; do NOT load from the network — the file must work offline).
- Text contrast ≥ 4.5:1 for body text, labels ≥ 12px.

## Content (use exactly this data)
Salon has 3 chairs (design must also work for 4–6), a waiting bench, a counter (cash/UPI), a door.
- Chair 1 · stylist **Imran** · customer **Karan Mehta** · Haircut + Beard trim · ₹450 · 18 of 30 min done
- Chair 2 · stylist **Sunita** · customer **Priya Patel** · Facial · ₹900 · 12 of 45 min done
- Chair 3 · stylist **Rakesh** · customer **Rahul Jain** · Haircut · ₹300 · 26 of 30 min done
- Waiting: **Dev Arora** (Beard trim, ₹150, booked 11:40)
- Today so far: **₹6,800**, 10 visits. Time now 11:38 AM, Wednesday 14 Oct.

## The animation (must loop seamlessly, ~20–25 s)
1. Progress advances on each chair (1 s ≈ 1 min is fine).
2. **Chair 3 finishes** → Rahul stands, walks to the **counter** → a gold "₹300 PAID" moment → today's total ticks to ₹7,100 → Rahul walks out the **door**.
3. Chair 3 is free for a beat → **Dev** gets up from the waiting bench and walks to chair 3 → chair 3 shows Dev · Beard trim · Rakesh · 0 of 15 min.
4. A **new customer walks in the door** and sits on the waiting bench ("Neha Singh · walk-in").
5. Loop back cleanly.
Customers move on curved paths, ease in/out, never teleport. Stylists stay at their chairs (subtle idle/working motion OK). Reduced-motion: show the state without movement.

## People
Draw people as **abstract tokens** (top-down head + shoulders shapes, or simple figures/initial badges) — no detailed faces, no emoji, no cartoon mascots. Differentiate customer vs stylist clearly.

## Screen layout requirements
- Phone screen 390 × 844 CSS px (render the page at that viewport; no device frame needed, rounded screen corners optional).
- Header: "Owner · from anywhere" + title "Live floor" + a LIVE indicator.
- The floor visual is the hero (roughly the upper half).
- Per-chair status list or cards: chair no., customer, service, stylist, progress, amount, minutes left; free chair state; waiting count.
- Today's total ₹ visible.
- Bottom bar: Live (active) · Earnings · Attendance · Staff · Visits.
- Tapping a chair (on the floor or in the list) highlights the other.

## Deliverable
One self-contained HTML file (inline CSS/JS/SVG, no network requests, no frameworks needed), plus 3 screenshots at 390×844 (deviceScaleFactor 2) at different moments: (1) start, (2) the PAID moment at the counter, (3) Dev seated + new walk-in on the bench. Playwright: `import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";`. Check there are no page errors.
