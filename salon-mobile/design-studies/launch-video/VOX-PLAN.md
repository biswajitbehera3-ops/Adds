# Launch video, documentary version: director's plan (v4, 29 Oct 2026)

**Status:** assets made (faces, 12 collage pictures, clips A–D, narration in Andre's voice) and the real app screens recorded; the edit timeline below waits for the user's approval before editing. Nothing is generated until the user says so, and every Higgsfield run is quoted first and needs its own yes (`CLAUDE.md`, generation and cost policy).
**Brief (user, 29 Oct):** keep the v3 story (`PLAN.md`), but make it a Vox-style animated documentary: a narrator explains it, with animation made with Higgsfield.

## The idea

**Title: "Why don't they come back?"**

The film is a short Vox-style explainer. A calm narrator walks the owner through a mystery every salon has, the customer who never returns, then shows the fix as if laying out evidence on a desk. The **real app screens** are the "documents" in this investigation: pinned to the board, circled, highlighted. Higgsfield makes the people and the world around them; the app itself is never faked.

## Style bible (the look every shot follows)

- **The board.** Every shot sits on one surface: warm off-white paper with grain, like a desk covered in clippings. The camera moves across it in slow push-ins and parallax, the way a Vox explainer moves across a collage.
- **People as cut-outs.** Priya, Anjali, the stylists and the owner appear as photo cut-outs with a thin white paper border, in muted colour with a light halftone. Each is made once with a locked face so they look the same in every shot.
- **One accent colour: the app's gold.** It is used like a highlighter: it sweeps across a name, circles a number, or draws an arrow. Everything else stays paper, black ink and muted photo colour.
- **Hand-made marks.** Red string pinned between people (Priya → her friend), hand-drawn circles, sticky notes, torn edges, a stamp for "PAID".
- **The app as evidence.** Real screens appear inside a phone placed on the board, or as a "print-out" pinned beside the cut-outs. The highlighter moves on top of them, never inside them.
- **Type.** Bold kinetic captions, a strong sans for headlines and a typewriter-style face for labels. English only, no Hindi font.
- **Motion rules.** Smooth and deliberate: no bounce, no shake, no flashy transitions. Whip pans only between the three chapters.

## Sound
- **Narrator:** one voice, calm, warm and curious, Indian English, about 140 words a minute, like a documentary host explaining something interesting to a friend. Made as an original AI voice with Higgsfield's voice tools: **not** a copy of any real person's voice.
- **Music:** none (user, 29 Oct). The film runs on the narrator, sound effects and short silences.
- **Sound effects:** paper rustle on every new page, pin taps when the string goes up, a highlighter squeak, a WhatsApp whoosh, coin drops, and the app's own payment chime (`SOUNDS.md`).
- Every sound is checked by listening (earshot) before it goes in.

## Length
75–80 seconds for the full film, plus a 25-second cut (the mystery and the fix, shots 1–11) for WhatsApp status and Reels. Vertical 1080×1920. An optional 16:9 version for YouTube can be made from the same assets.

## The script and shot list

Key: **H-img** = still made on Higgsfield (Nano Banana Pro, via `banana-pro-director-30`); **H-vid** = still animated on Higgsfield (Seedance, prompt by `cinema-director-v3`); **App** = real screen recorded from the current build; **Code** = paper board, highlighter, string and type, animated in code at no credit cost.

### Chapter 1: the mystery (0:00–0:21)
| # | Time | Narrator says | Picture | Made with |
|---|---|---|---|---|
| 1 | 0:00–0:04 | "Every salon has a customer like Priya." | Push in on the paper board to Priya's cut-out, freshly cut hair, smiling. The gold highlighter circles her. | H-img + Code |
| 2 | 0:04–0:10 | "She came in once. She loved her haircut. And then… she never came back." | Priya, as a short live clip, turns and walks out of a salon doorway. Her cut-out peels off the board and leaves an empty salon chair behind. | H-vid + Code |
| 3 | 0:10–0:16 | "Was it the haircut? No. It's simpler than that. Nobody reminded her." | Calendar pages flip across the board, 1… 15… 30 days. A red string from Priya's empty chair leads to a sticky note: "Nobody reminded her." | Code |
| 4 | 0:16–0:21 | "In a lot of salons, customers live in a notebook, or in someone's memory." | A worn register notebook, pages flicking, names crossed out and fading. | H-img + Code |

**Title card (whip pan):** "WHY DON'T THEY COME BACK?"

### Chapter 2: the fix (0:21–0:50)
| # | Time | Narrator says | Picture | Made with |
|---|---|---|---|---|
| 5 | 0:21–0:25 | "So we built an app that remembers for you." | A phone drops onto the board and lands with a paper thud. The app opens. | Code + App |
| 6 | 0:25–0:31 | "Thirty days after her visit, Priya shows up on a list: due back this week." | Real **Reminders** screen. The gold highlighter sweeps across "Priya". | App + Code |
| 7 | 0:31–0:35 | "One tap, and she gets a reminder on WhatsApp." | Real WhatsApp reminder. Cut to a short live clip of Priya at home, glancing at her phone as it buzzes, and smiling. | App + H-vid |
| 8 | 0:35–0:39 | "She books. And she comes back." | Real **Calendar** booking, Saturday 4:30 PM. Her cut-out slides back onto the board, into the chair. | App + Code |
| 9 | 0:39–0:44 | "Then something better happens. Priya tells a friend." | A red string pins from Priya across the board to a new cut-out: **Anjali**. Real **Refer a friend** screen with Priya's code. | H-img + App + Code |
| 10 | 0:44–0:48 | "And both of them get a hundred rupees in their salon wallet." | Two paper wallets; a ₹100 coin drops into each. | H-img + Code |
| 11 | 0:48–0:50 | "One customer back. One brand-new customer." | A short live clip: Priya and Anjali side by side in salon chairs, laughing. Freeze, then it becomes a cut-out. **Hold.** | H-vid + Code |

**Title card (whip pan):** "AND EVERY DAY…"

### Chapter 3: what the owner sees (0:50–1:12)
| # | Time | Narrator says | Picture | Made with |
|---|---|---|---|---|
| 12 | 0:50–0:55 | "Meanwhile, you can see your whole salon, live." | Real **Live floor**: the 3D salon, every chair and who's in it. Push in; Priya's and Anjali's chairs are highlighted. | App + Code |
| 13 | 0:55–1:00 | "Every chair. Every bill. What each stylist earned today." | A bill is paid (PAID stamp, payment chime), then **Earnings**: "Today ₹9,100" and each stylist's bar, highlighted one by one. | App + Code |
| 14 | 1:00–1:05 | "Who came in late. Who asked for leave." | Real **Staff** screen ("came in late" circled), then a **Leave request** approved. | App + Code |
| 15 | 1:05–1:12 | "And if a bill quietly gets undone, you'll know." | Real **Today's checks**, "Rashmita undid a ₹150 bill", stamped with a red "FOUND" mark. | App + Code |

### Ending (1:12–1:20)
| # | Time | Narrator says | Picture | Made with |
|---|---|---|---|---|
| 16 | 1:12–1:16 | "We set it up with your prices and your stylists. So the customers who left quietly… start coming back." | The board pulls back to show the whole collage: dozens of customer cut-outs pinned back into chairs, gold strings everywhere. | H-img + Code |
| 17 | 1:16–1:20 | (music only) | End card on paper: "Bring them back. See it all." / "Ask for a free 10-minute demo." | Code |

**Script length:** about 180 words at 140 words a minute, which leaves room for pauses and the title cards.

## Production plan (skills in order)
1. **Angle:** `ad-strategist` (done: pain first, the owner's own question as the hook, no product in the first 10 seconds).
2. **Characters:** `banana-pro-director-30` Mode 0 locks faces for Priya and Anjali, then Mode 1 sets their outfits. Both are invented people.
3. **Cut-out stills:** `banana-pro-director-30` Mode 3 makes the paper-collage stills: Priya and Anjali cut-outs, the empty chair, the notebook, the wallets and the final collage. About 10–12 images.
4. **Live clips:** `cinema-director-v3` writes Seedance prompts for 3–4 short clips: Priya walking out, Priya's phone buzzing, the two friends in chairs. About 5 seconds each, animated from the locked stills so the faces match.
5. **Narrator:** an original AI voice made on Higgsfield, the script read in pieces, then timed to the picture.
6. **App screens:** recorded from the current build with the invented "Your Salon" data (Priya, Anjali and 4 stylists), so every app moment is real.
7. **Assembly in code:** the paper board, highlighter, strings, stamps, type and camera moves, cut to the narration, then mixed with music and sound effects and rendered as MP4.
8. **Review:** watch every frame and listen to the full mix. Check faces stay the same, hands and text in the AI clips aren't garbled, and the voice is in sync. Report any problems honestly before you see it.

## Cost and the generation rule
- **What costs Higgsfield credits:** about 2 face locks, 2 outfit images, 10–12 stills, 3–4 short video clips, and the narration audio, plus a few retries for any that come out wrong.
- **What is free:** everything else (screens, paper board, type, editing).
- **Quotes first:** before each batch I check the balance and post a quote (model, length, quality, number of runs, estimated credits), and generate only after your yes for that batch. After each run I check the result and log the real credits spent.
- Higgsfield gives no fixed price list, so the first quote is an estimate, tightened after the first batch.

## Honesty rules for a documentary format
- **No invented statistics.** Vox films lean on numbers; this one uses none unless they come from a real, cited source. There are no real salon results yet.
- **The app is never faked.** Every app moment is a real screen. AI makes only people and places.
- **Invented people.** Priya and Anjali are AI-made; no real person's face or voice is used. If the film is ever shown as an ad, it does not present them as real customers giving a testimonial.
- **"Live" wording.** "See your whole salon, live" is true on the salon's phone today. "From your own phone, anywhere" waits for live sync (BUILD-SPEC 11.0 a).
- **No logo** until its licence is confirmed (BUILD-SPEC 9.6).

## Decided (user, 29 Oct)
- **Narrator:** male, calm, warm, Indian English.
- **End card:** "Bring them back. See it all. Ask for a free 10-minute demo." No phone number.
- **Format:** vertical 1080×1920 only.
- **Salon name:** "Your Salon" for everyone.

## Credit estimate (29 Oct)
Balance **521 credits** (Pro plan). Credits reset to 600 on the 16th of each month, and unused credits are lost at the reset, so this film fits inside this month's credits.

Prices come from this account's own charge history where known; the video price at 720p is an estimate, checked on the first clip before the rest are made.

| Item | Model | Count (incl. retries) | Credits each | Credits |
|---|---|---|---|---|
| Face locks: Priya, Anjali (2 options each) | Nano Banana Pro | 4 | 2 (charged before) | 8 |
| Outfits on the locked faces | Nano Banana Pro | 2 | 2 | 4 |
| Collage stills (cut-outs, chair, notebook, wallets, final board) | Nano Banana Pro | 12 + 4 retries | 2 | 32 |
| Live clips, 5 s, silent: Priya leaves, phone buzzes, two friends in chairs, (+1 spare) | Seedance 2.5, 480p draft first | 4 + 2 retries = 6 drafts | ~15 (12 charged for 4 s) | ~90 |
| Final versions of the 4 chosen clips | Seedance 2.5, finalised from draft | 4 | ~25–35 (estimate) | ~100–140 |
| Narration, about 180 words, 2 takes | Higgsfield text-to-speech, male preset voice | 2 | ~2–5 (estimate) | ~5–10 |
| **Total** | | | | **about 240–285** |

- **Lowest likely:** about 180, if the stills and clips work first time.
- **Ceiling I'd ask for:** **300 credits**, which leaves about 220 of this month's balance.
- **Free:** the app screens, paper board, highlighter, type, editing and sound effects (no music).
- **Batches:** each one is quoted again with the live balance just before it runs, and needs its own yes. Order: faces → stills → one clip (to get the real price) → the other clips → narration. Real spend is logged after each batch.

## Edit timeline (v5, 29 Oct, waits for approval)

User, 29 Oct: no music; the app pictures are recorded from the real app; show what comes when before editing.

**App screens:** recorded from the current build (security check run 3 code), as "Your Salon", with invented data made by the app's own engine: 4 stylists (Imran, Sunita, Rakesh, Neha), 196 invented customers, two months of visits. Thursday 29 Oct 4:10 PM for the reminder; Saturday 31 Oct 4:45 PM for the rest. Anjali's first bill was paid on camera, so the "₹100 each" line is the app's own message. Scripts: `screens/scripts/` (data builder + Playwright). Contact sheet: `screens/contact-sheet.jpg`.

**Timing:** from the measured narration lines (Andre, levelled, pauses as in the preview). Total **about 95 s**, longer than the 75–80 s planned because the lines were kept at a normal pace.

| # | Time | Narrator | Picture | Captions / marks | Sound |
|---|---|---|---|---|---|
| 1 | 0:00.5–0:03.7 | "Every salon has a customer like Priya." | Collage 1: Priya cut-out on the paper board, slow push in | Gold circle draws round her | Paper rustle |
| 2 | 0:04.3–0:10.7 | "She came in once. She loved her haircut. And then… she never came back." | Clip A: Priya glances back and walks to the door; on "never came back" cut to collage 3, the empty chair | Ghost outline holds on the chair | Door bell, then quiet |
| 3 | 0:11.9–0:17.8 | "Was it the haircut? No. It's simpler than that. Nobody reminded her." | Board: calendar pages flip 1 → 15 → 30 days; red string from the empty chair to a sticky note | Sticky note: "Nobody reminded her." | Page flips, pin tap |
| 4 | 0:18.7–0:24.5 | "In a lot of salons, customers live in a notebook, or in someone's memory." | Collage 4: the register book, names fading | | Pages flicking |
| T1 | 0:25.1–0:26.7 | (silence) | Whip pan to title card | **WHY DON'T THEY COME BACK?** | Whoosh |
| 5 | 0:26.7–0:30.5 | "So we built an app that remembers for you." | Phone drops onto the board; screen: Customers, "3 customers to remind" | | Paper thud |
| 6 | 0:31.4–0:37.6 | "Thirty days after her visit, Priya shows up on a list: due back this week." | App: Reminders, Priya at the top ("due 3 days ago · last 26 Sep") | Highlighter sweeps "Priya Sharma" | Highlighter squeak |
| 7 | 0:38.2–0:42.2 | "One tap, and she gets a reminder on WhatsApp." | App: the reminder message and "Send on WhatsApp" (1.5 s) → "Opened WhatsApp for Priya" → clip B: Priya at home smiles at her phone | Tap ring on the button | Tap, WhatsApp whoosh |
| 8 | 0:42.8–0:45.9 | "She books. And she comes back." | App: Calendar, Sat 31, "Priya Sharma" at 4:30 PM → collage 6 (mirror crop): Priya back in the chair | Gold circle on the booking | Pin tap |
| 9 | 0:46.7–0:50.9 | "Then something better happens. Priya tells a friend." | Collage 7: red string from Priya to Anjali → App: Refer & earn, Priya's code | String draws across | String pull, pin tap |
| 10 | 0:51.5–0:55.9 | "And both of them get a hundred rupees in their salon wallet." | App: Anjali's paid bill, "Referral reward paid: ₹100 to Anjali and ₹100 to their friend" → collage 8: two wallets, coins drop | Highlighter on the reward line; PAID stamp lands | Two coin drops |
| 11 | 0:56.5–0:60.5 | "One customer back. One brand-new customer." | Clip C: Priya and Anjali laughing in the chairs; freeze on the last good frame (before the face drift) and it becomes a cut-out | Hold | Soft paper settle |
| T2 | 1:01.5–1:03.1 | (silence) | Whip pan to title card | **AND EVERY DAY…** | Whoosh |
| 12 | 1:03.1–1:07.6 | "Meanwhile, you can see your whole salon, live." | Clip D (owner at the desk, 2 s) → App: Live floor, 4 of 4 chairs busy, Priya in chair 2, Anjali in chair 1 | Gold circles on chairs 1 and 2 | |
| 13 | 1:08.2–1:13.7 | "Every chair. Every bill. What each stylist earned today." | App: Rakesh's cash bill, ₹450, PAID → Earnings: Today ₹7,200 and the four stylists | Highlighter runs down the stylist bars one by one | Payment chime (`SOUNDS.md`) |
| 14 | 1:14.3–1:17.8 | "Who came in late. Who asked for leave." | App: Staff, "Late 10:24" on Neha → Leave requests: Rakesh, Fri 6 Nov, "Sister's wedding" | Circle on "Late 10:24"; tap ring on Approve | Pen circle |
| 15 | 1:18.4–1:22.2 | "And if a bill quietly gets undone, you'll know." | App: Today's checks, "Rakesh undid a ₹300 bill · Wrong service" | Red "FOUND" stamp | Stamp thud |
| 16 | 1:23.2–1:30.8 | "We set it up with your prices and your stylists. So the customers who left quietly… start coming back." | App: Services & prices → collage 10 (the four stylists) → collage 12, the final board, pull back | | Soft ticks, paper settle |
| End | 1:31.4–1:35.4 | (silence) | End card on paper | **Bring them back. See it all.** / Ask for a free 10-minute demo. | |

**Honesty notes for this cut**
- Every app moment is a real screen from the current build; only the invented salon data is staged.
- The Earnings screen shows the app's own comparison with last Saturday (▲ 9%, from invented history). It is not a result claim; the narrator says no numbers and no caption repeats it.
- Line 15 now shows Rakesh (the invented stylist) undoing a ₹300 bill, not "Rashmita ₹150" from the v4 plan.
- The 25-second cut in the v4 plan no longer fits (lines 1–11 alone run 60 s); a short cut needs its own shorter script.
