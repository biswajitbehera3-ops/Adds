# 006 — 10 Hidden Details in GTA 6 That Will Get You Caught — Production script v1

**Standard:** `production/style-guide.md` + `yt-script` shape · **Runtime:** ~6:10–6:40 (≈770 spoken words ≈ 5:10 of voice at 150 wpm,
plus number cards, stings and held reveals; the timecodes below are a guide) · **Format:** 4K 30 fps, voiceover only, official Rockstar footage + our own motion graphics.

**Overlap warning:** `003` ("10 GTA 5 habits…") uses the same police system. This video uses different details (the stars' colours,
the icons as a police report, trackers, the owner calling it in, armed victims, radio-coordinated cops, the witness trick). Don't
publish both in the same week. This one is the stronger video: post it first and hold 003 until after launch, rewritten as
"I tested it".

---

## Packaging (linted with `yt-package/title.py`)
- **Title A:** `10 Hidden Details in GTA 6 That Will Get You Caught` — 51 chars · **100/100**
- **Title B:** `GTA 6's Cops Know More Than You Think (10 Details)` — 50 chars · **100/100**
- **Thumbnail A:** `YOUR CAR SNITCHED` · **Thumbnail B:** `THEY KNOW` — both 100 with Title A, no repeated words.

## Hook (scored with `yt-script/hookscore.py`)
| | Hook (as scored; spoken with numbers written out) | Score |
|---|---|---|
| **Use** | "Before you rob your first store in GTA 6, you need to know which 10 hidden details get you caught, and how 1 Rockstar developer got around the biggest one." | **71 · WORKABLE** (The Warning) |
| Backup | "You think you got away in GTA 6, but 10 hidden details can still get you caught, and number 1 starts before the crime." | **74 · STRONG** (The Insider) |

The 75-point version said the developer "beat them", which overclaims: he got around one detail (witnesses), not all ten. The
honest wording costs 4 points. Fits the idea because the payoff (#1) is a real Rockstar developer's trick, so the promise is provable.

---

## Style reference — what we take from the top channels, and where we beat them
| Channel | What works (from our breakdowns) | What we take | Where we beat it |
|---|---|---|---|
| **T5G** (1.51M) | Narrator over official trailers, paused and zoomed frame by frame; fast cuts; punchy caps titles | The **freeze → zoom → callout** rhythm on trailer frames | Animated callouts instead of static red circles, and a source on screen for every claim |
| **BreeZe GTA** (20K subs, 1.2M views) | A numbered countdown, the biggest item last; names sources out loud ("Rockstar told Edge") | The **#10 → #1 countdown** and **naming the source in the voiceover** | Named sources *plus* on-screen `SourceTag`s; no unverified claims |
| **Hazard** (720K) | Curiosity titles ("…"), long trailer holds, deep detail | The curiosity tone in titles | **No shot held over 4 s**, a re-hook every 60–90 s, music changes per chapter |

**Signature look for this video — "DISPATCH":** a dark police-dispatch screen in our brand colours. A Leonida map (from Rockstar's
official map image) with a pulsing red **search radius**; a dispatch log on the right where each detail types in as an entry
("REPORT #10 · WEAPON SEEN"); a radio waveform at the bottom that pulses with the SFX. Every chapter starts and ends on this screen,
so the whole video feels like one investigation closing in on you.

---

## Legends (used in every beat)

**B-roll types**
- **[B1] Trailer clip:** an official clip (Launch Trailer, Trailer 2, Extended Look) played at speed, 1–3 s.
- **[B2] Freeze + zoom:** a frame frozen with a camera-shutter flash, a Ken Burns push to the detail, then pull back (T5G style, our
  motion).
- **[B3] Screenshot parallax:** an official Rockstar screenshot split into 2–3 depth layers that drift (2.5D).
- **[B4] Illustration:** our own motion graphic recreating something only described in print (Edge's demo has no public footage).
  Always carries a small label "ILLUSTRATION · based on Edge's description". Never pass unrelated footage off as that moment.
- **[B5] Split screen:** two frames side by side (e.g. "GTA 5 vs GTA 6", or "what you do vs what the cops see").

**Animation styles** (Remotion components in `remotion-overlays/`; ✅ built, 🛠 to build)
- **[A1] NumberCard 🛠** — "#7" slams in at 120% and settles at 100% with a whoosh; the title types in under it. The Dispatch log
  adds the entry at the same moment.
- **[A2] DetailCallout 🛠** — a ring draws on around the detail (0.4 s), a label types in, and a thin line connects them.
- **[A3] SourceTag 🛠** — a lower-third that slides in from the left: CONFIRMED (green) / REPORTED (blue) / THEORY (amber) + outlet.
  Bottom-left, clear of the bottom-right end-screen zone.
- **[A4] IconPanel 🛠** — the heat icons (face, hanger, CCTV, two people, weapon, car) in a row; each lights red, then gets crossed
  out green when you learn the fix.
- **[A5] QuoteCard 🛠** — the quote types in word by word, with the speaker and outlet below.
- **[A6] Keyword caption ✅ (`MrBeastCaptions`)** — 2–4 words, Anton, white with a black outline, one word in a brand colour.
- **[A7] Stamp ✅ (`ResultStamp`)** — a red or gold stamp hit with a small screen shake.
- **[A8] ZoomPunch ✅** — a fast 8% punch-in on a beat.
- **[A9] ProgressBar 🛠** — the top bar "3 / 10" that fills each chapter.

**Music (licensed only: Epidemic Sound / YouTube Audio Library):** dark tension pulse (hook) → percussive chase (#10–#6) → slowed,
filtered pulse (#5–#3, "they're closing in") → big lift into #2 → minimal heartbeat under #1 → soft pads (close).

**SFX kit:** police-radio squelch (on every dispatch entry), keyboard typing (log + labels), camera shutter (freezes), whoosh (cards),
riser → hit (re-hooks), stamp hit, siren swell (sparingly), map ping (search radius).

**Footage rules:** no violence or gunfire in the first 7 s (advertiser-friendly); no civilian-rampage clips; mute trailer music
(Content ID), and keep only short dialogue if it's needed; Rockstar official material only, no leaks.

---

## Facts (all Tier 1–2)
- **Edge preview, 90-min demo** (via GTAVice summary, 29 Oct 2026), REPORTED · Edge:
  - Heat tracks description, one vs two suspects, clothing, CCTV, weapons; shown as **icons at the top of the screen,
    representing the police report**. Reduce it by splitting up, changing clothes, abandoning a weapon.
  - NPCs react to weapons; they tell **on your back vs in your hands** apart. Carrying doesn't automatically mean a wanted level;
    you can put it away before it escalates. Rob Nelson's shotgun quote.
  - A robbed pedestrian **may cooperate, then attack when your back is turned**; a store customer may intervene.
  - Carjacked drivers may flee, or fight back with a weapon.
  - **Expensive cars can have trackers** that keep broadcasting after the theft. Even without one, **the owner may report the
    theft**. Fences have signal-blocking at drop-off, and **pay depends on the car's condition**.
  - **Police helicopters use searchlights.** Rockstar wants escapes via back alleys and abandoned vehicles.
  - **Cops talk over the radio** and deploy a **stinger strip**; at night Nelson missed it, the tyre burst, and both were thrown;
    then **a police dog pinned Jason**.
  - **NPCs track what they've witnessed and how you've treated them.**
  - **Phil Hooker** cleared a store of customers by **picking fights and immediately defusing them**, then robbed it "more cleanly".
    Quote: "I basically started picking fights with them, provoking them and then immediately defusing it… Then they would leave
    the store, so that would clear them out and I could rob it more cleanly."
- **GameSpot** (wanted levels, from the Extended Look), REPORTED · GameSpot:
  - Six-star wanted level returns.
  - **Stars:** solid white = cops can see you; flashing = you broke line of sight; solid red = near the scene, they don't know
    where you are; **hollow = they don't know who they're looking for**. In the Extended Look, Lucia flips off police while
    driving past with hollow stars, and they do nothing.
  - Police cast a wider net across Leonida.
  - CCTV icon: destroy the evidence. Hanger icon: change clothes ("it seems" you can store them in your car — as long as nobody sees
    you changing). Face icon: a mask (GameSpot's suggestion; the facial-hair idea is speculation).
  - **A crime is reported only if an NPC sees it or an alarm goes off.** Also said by Rob Nelson (Inven Global).

**Do NOT say:** that a mask is confirmed to clear the face icon (GameSpot suggests it → say "GameSpot thinks"); that facial hair
works; anything from leaks; that stars mean the same as in GTA 5.

**Footage needed:** An **Extended Look** (main: police, chases, HUD stars, the Lucia hollow-stars moment, jewellery store, night
driving, helicopter if present), Trailer 2, Launch Trailer, the official Leonida map image, and Rockstar screenshots. **Before editing:**
scrub the Extended Look and note the timecode of each shot listed below (marked ⏱). If a shot doesn't exist, use [B4] or [B3]
instead, never a different scene described as that one.

---

## Beat-by-beat

### HOOK (0:00–0:15)

**B1 · 0:00–0:06**
- **VO:** "Before you rob your first store in GTA 6, you need to know which ten hidden details get you caught…"
- **B-ROLL:** [B1] Extended Look ⏱ a calm daytime street outside a store, people walking (no weapons, no violence: first 7 s
  rule). Cut on "caught" to [B2] freeze.
- **ANIMATION:** the DISPATCH screen slides in over the right third: the map pings, and the log types "INCIDENT · STORE ·
  REPORTED". [A6] caption "10 DETAILS" (gold "10").
- **AUDIO:** dark pulse starts; radio squelch on the log line; camera shutter on the freeze.

**B2 · 0:06–0:15**
- **VO:** "…and how one Rockstar developer got around the biggest one."
- **B-ROLL:** the frozen frame desaturates; a slow push toward a pedestrian.
- **ANIMATION:** [A2] a ring draws around the pedestrian with the label "WITNESS"; a blurred QuoteCard appears at the bottom and
  stays blurred. It's unlocked at #1 (proves the payoff exists).
- **AUDIO:** low riser; a heartbeat thump on "biggest one".

### THE TURN (0:15–0:30)

**B3 · 0:15–0:30**
- **VO:** "Most of these come from Edge magazine's ninety-minute look at the game, and GameSpot's breakdown of the Extended Look. Every
  one has its source on screen. And the cops in this game don't just chase you. They build a case."
- **B-ROLL:** [B1] three fast cuts: Extended Look police car rolling past ⏱ · a cop looking around ⏱ · night city wide.
- **ANIMATION:** [A9] ProgressBar appears (0/10). The DISPATCH map's red search radius starts small and grows with each chapter for
  the rest of the video. [A6] "THEY BUILD A CASE" (red "CASE").
- **AUDIO:** the music drops into the percussive chase cue on "build a case".

### #10–#6 (0:30–3:05) — "they're watching"

**B4 · 0:30–0:34 · #10 CARD**
- **ANIMATION:** [A1] "#10 · THEY CLOCK YOUR GUN"; Dispatch log "REPORT #10 · WEAPON SEEN"; ProgressBar 1/10.
- **AUDIO:** whoosh + squelch.

**B5 · 0:34–1:02**
- **VO:** "In GTA 5, you could pull a shotgun out on a busy street and nobody blinked. Rob Nelson from Rockstar says that doesn't work
  anymore. Now people notice. And they can tell the difference between a gun on your back and a gun in your hands. Some walk away,
  some run, and some will come and challenge you. The good news: carrying one doesn't automatically mean a wanted level. Put it away in
  time, and it calms down."
- **B-ROLL:** [B5] split: left a GTA 5-style street label "GTA 5", right [B1] Extended Look busy Leonida street ⏱ "GTA 6". Then [B4]
  illustration: a silhouette with the gun on its back (pedestrians green) → in hand (pedestrians turn amber, one red).
- **ANIMATION:** [A5] QuoteCard: "you can stand in front of them and produce an automatic shotgun out of nowhere and they don't react,
  then that doesn't work." — Rob Nelson, Edge. [A3] REPORTED · Edge. [A6] "BACK vs HANDS".
- **AUDIO:** a pop as each pedestrian icon changes colour.

**B6 · 1:02–1:06 · #9 CARD**
- **ANIMATION:** [A1] "#9 · THE VICTIM FIGHTS BACK"; log "REPORT #9 · ROBBERY · VICTIM HOSTILE"; ProgressBar 2/10.

**B7 · 1:06–1:28**
- **VO:** "When you rob someone, don't turn your back. Edge says a person you're robbing might hand it over, then go for you the second
  you turn around. And in a store, another customer can decide to be a hero. Robberies don't follow a script anymore."
- **B-ROLL:** [B1] Extended Look jewellery-store robbery ⏱ (cut before any shot is fired); [B2] freeze on a customer in the background
  of the shot.
- **ANIMATION:** [A2] ring on the customer: "WILD CARD". [A3] REPORTED · Edge. [A7] red stamp "DON'T TURN AROUND".
- **AUDIO:** a stamp hit; the music cuts out for a half-beat before the stamp.

**B8 · 1:28–1:32 · #8 CARD**
- **ANIMATION:** [A1] "#8 · THE OWNER CALLS IT IN"; log "REPORT #8 · VEHICLE THEFT · OWNER CALLED"; ProgressBar 3/10.

**B9 · 1:32–1:58**
- **VO:** "You stole a car, nobody chased you, you think you're clean. You're not. Edge says even if the car has no tracker, the owner
  can still report it stolen. So a car you took ten minutes ago can come back to bite you, long after you drove away."
- **B-ROLL:** [B1] Extended Look driving shot ⏱ (calm, not a chase) → [B4] illustration: a phone icon at the old theft spot sends a
  pulse to the Dispatch map, which pins the car.
- **ANIMATION:** [A6] "10 MINUTES LATER…" (a typewriter caption); a small clock spins forward. [A3] REPORTED · Edge.
- **AUDIO:** a phone-ring SFX (generic, not an in-game sound) → a radio squelch.

**B10 · 1:58–2:04 · RE-HOOK + #7**
- **VO:** "And if the car's expensive, it's worse."
- **ANIMATION:** [A1] "#7 · THE CAR SNITCHES"; log "REPORT #7 · TRACKER ACTIVE"; ProgressBar 4/10.
- **AUDIO:** riser → hit.

**B11 · 2:04–2:35**
- **VO:** "Expensive modern cars can have trackers that keep broadcasting where they are after you steal them. If you're stealing to
  sell to a fence, there's good news: they have signal blockers at the drop-off. And there's a catch: they pay you less if you wreck
  it. So you're running from the cops while trying not to scratch the paint."
- **B-ROLL:** [B3] a Rockstar screenshot of a sports car, parallax → [B1] a night highway ⏱ → [B4] illustration: a car icon pulsing a
  red signal on the map; it enters a "FENCE" circle and the signal cuts.
- **ANIMATION:** [A2] ring on the car: "TRACKER". A small bar "PAYOUT" that drops as a damage meter rises. [A3] REPORTED · Edge.
  This is the thumbnail A moment ("YOUR CAR SNITCHED").
- **AUDIO:** a sonar ping that repeats until the signal cuts, then silence.

**B12 · 2:35–2:39 · #6 CARD**
- **ANIMATION:** [A1] "#6 · THE SEARCHLIGHT"; log "REPORT #6 · AIR UNIT DEPLOYED"; ProgressBar 5/10.

**B13 · 2:39–3:05**
- **VO:** "At night, hiding in the dark isn't enough. Police helicopters use searchlights to find you. Rockstar's whole idea is that you
  escape smart, through back alleys and abandoned cars, instead of just flooring it until the stars go away."
- **B-ROLL:** [B1] Extended Look night city / helicopter ⏱ (if no helicopter shot exists, use [B4]: a cone of light sweeping a dark
  alley illustration).
- **ANIMATION:** a vignette that tightens as the searchlight cone passes; [A6] "BACK ALLEYS > FULL SPEED". [A3] REPORTED · Edge.
- **AUDIO:** rotor wash SFX, low and filtered; the music thins out here for the shift into the next section.

### #5–#3 (3:05–5:00) — "they're closing in"

**B14 · 3:05–3:12 · RE-HOOK + #5**
- **VO:** "From here, it gets worse, because now the cops start working together."
- **ANIMATION:** [A1] "#5 · THEY TALK TO EACH OTHER"; log "REPORT #5 · UNITS COORDINATING"; ProgressBar 6/10. The search radius
  jumps bigger.
- **AUDIO:** the music switches to the slowed, filtered pulse.

**B15 · 3:12–3:45**
- **VO:** "In Edge's demo, the police talk over the radio and lay a stinger strip across the road. It was night, Rob Nelson didn't see it,
  the front tyre burst, and Jason and Lucia went over the handlebars. They tried to run, and a police dog caught Jason and pinned him to
  the ground. One radio call, and the escape was over."
- **B-ROLL:** [B4] illustration sequence (no public footage of this): a motorbike icon on a dark road map → a thin strip appears ahead
  (hard to see, on purpose) → the bike icon flips → two figures run → a dog icon closes in. Intercut 1-second [B1] Extended Look night
  motorbike/road shots ⏱ for texture, **not** presented as the demo.
- **ANIMATION:** the label "ILLUSTRATION · based on Edge's description" stays on; [A2] a ring on the strip with a 0.5 s delay ("did you
  see it?"); [A7] red stamp "CAUGHT". [A3] REPORTED · Edge.
- **AUDIO:** radio chatter (our SFX), a tyre-burst pop, a dog bark, a stamp hit; the music cuts to silence on the stamp.

**B16 · 3:45–3:50 · #4 CARD**
- **ANIMATION:** [A1] "#4 · THE STARS CHANGE COLOUR"; log "REPORT #4 · STATUS UPDATE"; ProgressBar 7/10.

**B17 · 3:50–4:20**
- **VO:** "Six stars are back. But watch their colour, because GameSpot's breakdown says it tells you what the cops know. Solid white:
  they can see you. Flashing: you've broken line of sight. Solid red: you're still near the scene, and they're looking, but they don't
  know exactly where you are."
- **B-ROLL:** [B2] freeze on an Extended Look frame with the wanted stars on the HUD ⏱ → push into the stars.
- **ANIMATION:** our own recreated six-star row (not a screen grab of the HUD) cycles: white → flashing → red, each with a label
  typing in. [A3] REPORTED · GameSpot.
- **AUDIO:** a tick per state; a short siren swell on red.

**B18 · 4:20–4:26 · #3 CARD**
- **VO:** "And under those stars is the most important thing in this video."
- **ANIMATION:** [A1] "#3 · THE POLICE REPORT"; log "REPORT #3 · SUSPECT PROFILE OPEN"; ProgressBar 8/10.
- **AUDIO:** riser → hit.

**B19 · 4:26–5:00**
- **VO:** "Those little icons under the stars are the police report. Edge says they show exactly what the cops know about you. A camera means
  you're on CCTV, so you'll need to destroy the footage. A hanger means they know your clothes, so change, but not where anyone can see
  you. Two people means they saw Jason and Lucia together, so split up. A gun means they know your weapon, so ditch it. A car means they
  know your car. And a face means they know your face, and GameSpot thinks a mask is the answer to that one."
- **B-ROLL:** [B2] freeze on an Extended Look frame showing the icons ⏱ (if not visible, a dark plate behind the IconPanel) → quick
  [B1] cuts matching each icon: a store ceiling corner ⏱, a clothing store ⏱, Jason + Lucia together ⏱, a parked car ⏱.
- **ANIMATION:** [A4] IconPanel: each icon lights red as it's named, then gets a green cross-out with its fix ("DESTROY FOOTAGE" ·
  "CHANGE — UNSEEN" · "SPLIT UP" · "DITCH IT" · "SWAP CAR" · "MASK?"). The "MASK?" chip is amber. [A3] REPORTED · Edge / GameSpot;
  THEORY on the mask.
- **AUDIO:** a keyboard tick per icon; a soft green "clear" chime per fix.

### #2–#1 (5:00–6:10) — the payoff

**B20 · 5:00–5:06 · #2 CARD**
- **VO:** "Now, here's what happens when you get all of that right."
- **ANIMATION:** [A1] "#2 · HOLLOW STARS"; log "REPORT #2 · SUSPECT UNKNOWN"; ProgressBar 9/10. The search radius shrinks for the
  first time.
- **AUDIO:** the music lifts into the big cue.

**B21 · 5:06–5:30**
- **VO:** "Hollow stars. GameSpot says that means the police have no idea who they're looking for. And you can see it in the Extended
  Look: Lucia drives right past the cops with hollow stars, flips them off, and they do nothing."
- **B-ROLL:** [B1] the Extended Look Lucia drive-past moment ⏱ at normal speed → [B2] freeze + push on the hollow stars → resume.
- **ANIMATION:** [A2] ring on the hollow stars: "THEY DON'T KNOW IT'S YOU". [A8] ZoomPunch on the gesture. [A3] REPORTED · GameSpot.
- **AUDIO:** the music hits on the gesture; a record-stop on the freeze; resume.

**B22 · 5:30–5:36 · #1 CARD (the promised payoff)**
- **VO:** "And number one starts before you commit the crime."
- **ANIMATION:** [A1] "#1 · NO WITNESSES, NO REPORT"; log "REPORT #1 · —" (the entry stays blank); ProgressBar 10/10. The blurred
  QuoteCard from B2 slides back in.
- **AUDIO:** everything drops out except a heartbeat.

**B23 · 5:36–6:10**
- **VO:** "In GTA 6, a crime only gets reported if someone sees it or an alarm goes off. And people remember what they've seen. So Phil
  Hooker from Rockstar North found a way to empty a store before robbing it. In his words: 'I basically started picking fights with
  them, provoking them and then immediately defusing it. Then they would leave the store, so that would clear them out and I could rob
  it more cleanly.' No punches thrown. No witnesses. No report."
- **B-ROLL:** [B1] Extended Look store interior with customers ⏱ → [B4] illustration: customer icons by the counter; a speech-bubble
  "!" then "sorry" pops; the icons walk out one by one; the store map goes empty.
- **ANIMATION:** the QuoteCard un-blurs and types in word by word. [A3] REPORTED · Phil Hooker (Edge); REPORTED · GameSpot / Rob Nelson
  (Inven Global) for the "witness or alarm" rule. The Dispatch log line stays blank, then types "NO REPORT FILED" in green. The search
  radius on the map fades to nothing.
- **AUDIO:** the heartbeat slows; three soft door-chime SFX as each customer leaves; a clean resolve on "No report".

### CLOSE — one ask (6:10–6:40)

**B24 · 6:10–6:40**
- **VO:** "So that's the case file: your gun, the victim, the owner, the tracker, the searchlight, the radio, the stars, the report, the
  hollow stars, and the witnesses. One question, in the comments: which one do you think gets you caught first? The full list of
  launch times is on screen now."
- **B-ROLL:** [B1] the Launch Trailer hero shot (Jason and Lucia at sunset), slow push.
- **ANIMATION:** the Dispatch log scrolls all 10 entries fast, then the screen "closes" like a file. The comment question as a card.
  End screen: #001 (unlock times) left, #004 (without a PS5) right, subscribe button.
- **AUDIO:** soft pads; a final radio squelch as the file closes.

---

## Thumbnails (A/B)
- **A — "YOUR CAR SNITCHED"** A sports car (official screenshot crop) with a red pulsing tracker icon on the roof and a red search
  radius behind it. Lucia key-art crop on the left with a pink rim light, looking back at the car. Text in Anton, white with a thick
  black outline, "SNITCHED" in red.
- **B — "THEY KNOW"** The six-star row (our recreation), the last two hollow, over a dark Vice City skyline; under it the heat icons
  glowing red. Jason key-art crop with a blue rim light. Text "THEY KNOW".
- Check both at 160 px wide.

## Description
```
10 hidden details in GTA 6's police system that will get you caught, from Edge magazine's 90-minute gameplay preview and
GameSpot's breakdown of the Extended Look. Gun awareness, victims who fight back, car trackers, helicopter searchlights,
radio-coordinated cops, what the star colours mean, the icons that are your police report, hollow stars, and the witness trick a
Rockstar developer used.

0:00 They build a case
0:30 #10 They clock your gun
1:02 #9 The victim fights back
1:28 #8 The owner calls it in
1:58 #7 The car snitches
2:35 #6 The searchlight
3:05 #5 They talk to each other
3:45 #4 The stars change colour
4:20 #3 The police report
5:00 #2 Hollow stars
5:30 #1 No witnesses, no report

Sources:
- Edge preview summary (GTAVice): https://www.gtavice.net/news/gta-vi-edge-preview-reveals-huge-new-details-on-gameplay-police-relationships-and-more
- GameSpot, wanted levels: https://www.gamespot.com/articles/gta-6-wanted-levels/

Footage & images: Rockstar Games (official trailers, Extended Look, key art, map), used for commentary. Scenes marked
"illustration" are our own graphics based on Edge's written description.
```

## Before you hand this to the edit
- [ ] Scrub the Extended Look and fill in every ⏱ timecode; swap in [B3]/[B4] where a shot doesn't exist.
- [ ] Build the 🛠 components this needs: NumberCard, DetailCallout, SourceTag, IconPanel, QuoteCard, ProgressBar, and the Dispatch
      screen.
- [ ] Record VO section by section (hook, #10–#6, #5–#3, #2–#1, close), so each section's energy matches its music.
- [ ] Run the style-guide delivery checklist (−14 LUFS, no frame held > 4 s, a SourceTag on every fact).
