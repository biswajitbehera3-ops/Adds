# Launch video: plan (28 Oct 2026)

**Status:** planned, not built. Build only when the user says so (BUILD-SPEC 11.1).
**Angle:** the user's own, 28 Oct. Part 1: bring back customers who never return, and win new ones through referrals. Part 2: see the whole salon live, and what the owner gains every day.

## Format
- About 40 seconds, vertical 1080×1920, for WhatsApp and Instagram. English captions, music, no voice.
- Dark brown and gold like the app, Urbanist font, a phone in the centre playing **real app screens**. Calm, smooth movement: no bounce, no flashy effects.
- Dummy salon data from the salon-day test (4 stylists, invented customers), plus a few bookings and customers in chairs added so the screens look busy. No real customer data.
- No Higgsfield credits: everything is recorded from the app and edited in code. Music: a licensed track from the connected Epidemic Sound account.
- No logo until its commercial-use licence is confirmed (BUILD-SPEC 9.6).

## Storyboard

**Part 1: customers who never come back**

| Time | On screen | Caption |
|---|---|---|
| 0–3 s | Dark screen, gold text appears line by line (no app yet) | "She came once. Loved her haircut." |
| 3–5 s | Text holds | "You never saw her again." |
| 5–9 s | Phone slides in: **Reminders**, the list of customers due back this week | "Now the app tells you who's due back." |
| 9–12 s | Tap Send: the WhatsApp reminder message | "One tap. A WhatsApp reminder goes out." |
| 12–16 s | **Refer a friend** screen: her code, ₹100 for her, ₹100 for the friend | "She brings a friend. Both get ₹100 credit." |
| 16–19 s | The friend added as a new customer, "joined by referral", wallet credited | "New customers, from the ones you already have." |

**Part 2: your salon, live**

| Time | On screen | Caption |
|---|---|---|
| 19–24 s | **Live floor**: the 3D salon, chairs busy with each stylist and customer, timers running, "Today ₹9,100" | "See who's in every chair, right now." |
| 24–28 s | **Earnings**: today's total, then each stylist's takings | "Today's takings. What each stylist earned." |
| 28–31 s | **Staff**: check-in times, "came in late" | "Who came in, and when." |
| 31–34 s | **Leave requests**: approve in one tap | "Leave requests, sorted in a tap." |
| 34–37 s | **Today's checks**: a bill undone, a customer who left, cash over or short | "And if a bill is undone, you'll know." |
| 37–40 s | End card, gold on dark | "Bring them back. See it all." / call to action (to decide) |

## How it gets built
1. Record the real screens from the current build (the one that passed security check run 3) in a phone-sized browser, with the dummy salon loaded.
2. Put them in a phone frame, add captions and transitions with a script, render an MP4.
3. Add the music, then watch and listen to the whole thing and fix anything wrong before showing it.
4. Save the MP4 here and mark BUILD-SPEC 11.1 done.

## To decide before building
1. **"Live" wording.** The live floor works today on the salon's phone. Seeing it from the owner's own phone, synced live, needs live sync, which is planned but not built (BUILD-SPEC 11.0 a). Either the video says "See who's in every chair, right now" (true today), or live sync is built first and the video can say "from anywhere".
2. **End-card call to action:** "Ask for a 10-minute demo", or your WhatsApp number on screen.
3. **Length:** the 40-second version only, or also a 15-second cut (Part 1 or Part 2 alone) for status and Reels.
