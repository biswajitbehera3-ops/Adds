# Salon app redesign: shared design spec (input for all three directions)

Written 21 Oct 2026 for the user's request: "use the installed design skills (impeccable, huashu-design, ui-ux-pro-max, taste-skill) and make a more polished app, not a generic random app; show me the designs as images first, do not build the app."

## What the product is
A per-salon phone app for small Indian salons (one salon = one app with its own name, logo and prices). Two kinds of user, each on their own Android phone:
- **Stylists (staff)**: check in each morning with a selfie, take walk-in customers (type the customer's mobile number on a keypad), bill them (services, add-ons, wallet, cash/UPI/card), see their own earnings today, their own bookings calendar, the salon's customers (with spending), reminders to send, and their own profile (attendance, leave).
- **The owner**: watches the salon live from anywhere (an illustrated clay-3D salon floor where customers walk to chairs), earnings, staff (attendance, leave approvals), customers (top spenders, bills, cancel bill), and "Today's checks" (staff undos, customers who left without service, cash count).

It replaces a paper register. The people using it are stylists between customers (busy hands, 5–10 seconds per glance, often standing) and an owner glancing at the phone several times a day. Hindi/English Indian context: ₹ amounts with Indian digit grouping (₹4,850, ₹1,00,000), Indian names, WhatsApp is the messaging channel, UPI is the common payment.

## Current state (what exists and is approved in function, but looks "generic")
Brown "glass" look: radial brown backdrop (#8E5B4E → #4A3029 → #1A1210), frosted cards rgba(255,244,236,.10–.16), gold #E4A67B for money and the main action, cream #FFF8F1 text, Urbanist font everywhere, rounded 20–24px cards, a floating 5-slot tab bar. The user says it now feels like a generic AI app. The redesign must feel like a specific, crafted product for a salon, not a fintech template with brown paint.

## Brand assets (real, use them; paths relative to `salon-mobile/`)
- Logo: `assets/brand/logo-clean.png` (black circle, white barber tools: crossed scissors, comb, razor blade, shaving brush; 1:1).
- Intro video (not needed in stills): `assets/brand/intro-clean.mp4`.
- Live floor: `assets/live/plate2.webp` (1000×565 clay-3D isometric salon interior: front desk with receptionist, three styling chairs with mirrors, warm wood floor, plants); stylist sprites `assets/live/s0.webp`–`s2.webp`, seated caped customers `s3`–`s5.webp` (transparent, 180px tall). The owner already approved this clay salon; keep it as the Live hero, but the framing around it may change.
- Current screenshots for context: `design-studies/app-owner-*-built.png`, `design-studies/app-calendar-built.png`.
- Colour: gold #E4A67B / cream #FFF8F1 / brown family are the current brand; a direction may reinterpret them (e.g. cream base with brown/gold ink) but should stay recognisably this salon's warm barber-shop world. Forbidden: purple/blue gradients, neon glow, GitHub-dark navy, emoji icons, rounded card + coloured left border.

## The five screens every direction must show (same content, so the three can be compared)
Phone size: 390 × 844 CSS px per screen, Android (status bar time 11:40, battery), shown inside a clean phone frame, all five side by side in one row.
1. **Login**: logo, "Welcome back", live date/time (Wednesday, 21 October · 11:40 AM), mobile number field, password field, "Log in", "Owner? Sign in here", "Privacy & terms". First thing every stylist sees; must feel like the salon's own app.
2. **Staff Home** (stylist Imran Khan, Chair 1): a "customer walked in" mobile-number entry at the top (the most-used action); **My earnings today ₹1,350** split Cash/UPI/card ₹900 and Wallet ₹450 (this month ₹8,150); My customers today: 4 handled · 3 paid · 1 in chair · 1 new; My chair: Karan Mehta, Haircut + Beard trim, since 11:10, button "Pay ₹450"; "Your bookings today · 3 — Salon: 2 on-the-day reminders to send". Bottom bar: Home · Customers · (+ walk-in) · Calendar · Profile.
3. **Bill / Collect** (customer Aditya Rao, returning, wallet ₹4,850): lines Hair colour ₹1,200; Keratin touch-up ₹800 "owner approved" (a service not in the list that the owner approved); Total ₹2,000; "Pay from wallet" switch on (₹2,000 of ₹4,850); "✓ Number confirmed ••••• •5028" (WhatsApp code check for big wallet spends); primary button "Collect ₹2,000"; quiet link "Customer left without a service".
4. **My calendar** (staff): October 2026 month grid, Monday first, Tuesdays are the salon's weekly off (greyed), each day with bookings shows its load (e.g. a ring or fill: 21 Oct = today, 3 bookings; 17 Oct 8; 24 Oct 8; 25 Oct 7; 31 Oct 7; others 2–5); a Today card: "Today · Wed 21 — 3 bookings · 3 left", next "10:30 AM Varun Malhotra · Hair colour", "Your day is 35% booked · 10:00 am – 8:00 pm"; "+ Book" action. Same bottom bar.
5. **Owner · Live floor**: title "Live floor" with a LIVE indicator, "Wed 21 Oct · 11:40 AM", "Today ₹6,800"; the clay salon plate with chair labels (1 Karan · 18 min, 2 Priya · 33 min, 3 Free); chair list: 1 Karan Mehta · Haircut + Beard trim · Imran · ₹450 · 12 min left; 2 Priya Patel · Facial · Sunita · ₹900 · 33 min left; 3 Free · next Dev Arora 12:30 · Rakesh; "Today's checks · 2 to look at": "Imran undid a ₹300 bill — Rohan Gupta · 'Wrong service'", "Cash in the drawer should be ₹2,400 · Count the cash". Owner bottom bar: Live · Earnings · Staff · Customers.

## Tone and qualities
Warm, crafted, confident, calm; the feel of a well-run neighbourhood salon that is proud of its trade (barber tools, mirrors, capes, wood, brass), not a bank. Money must be the clearest thing on any screen. Readable at arm's length by a busy stylist: body ≥14px, labels ≥12px, contrast ≥4.5:1, touch targets ≥44px. One main action per screen. Indian number formatting.

## Visual motif to find (each direction answers this its own way)
What only a salon has: the mirror (an arch/frame), the barber pole stripe, the cape, scissors/comb, the till/receipt, brass and wood, the appointment book. The best direction turns one of these into the structural idea of the whole app (e.g. the mirror arch as the frame for key numbers, the receipt as the bill, the appointment book as the calendar).

## Output (each direction)
- One self-contained HTML file at `design-studies/redesign/<direction-slug>.html` showing the five screens side by side in phone frames on a neutral canvas, with a small caption row under each phone (screen name). Pure HTML/CSS (no CDN scripts: unpkg is blocked; Google Fonts CSS works). Images by relative path to the real assets (`../../assets/...`).
- Screenshots: `design-studies/redesign/<slug>.png` (whole row, deviceScaleFactor 2) and `<slug>-1.png` … `<slug>-5.png` (each phone alone, readable size).
- A short `design-studies/redesign/<slug>.md`: which logic, which style/reference/designer, the palette (hex), fonts, the motif and "where the form comes from in the content", and what would change in the app if chosen.
