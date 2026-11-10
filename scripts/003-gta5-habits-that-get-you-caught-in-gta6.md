# 003 — 10 GTA 5 Habits That Will Get You CAUGHT in GTA 6 — Production script v2

**Standard:** `production/style-guide.md` · **Runtime:** ~6:45 · **VO:** ~1,000 words · **Music:** percussive police-chase cue →
tense pulse on the "heat" chapters → triumphant lift on #2/#1 → pads (outro)

**Title (pick one):**
- A: `10 GTA 5 Habits That Will Get You CAUGHT in GTA 6`
- B: `Stop Playing GTA 6 Like GTA 5 — The Cops REMEMBER`

**Facts (all fact-checked — `research/breeze-gta-15-features-2026-11.md`):** Edge preview via GTAVice (heat: description, 1 vs 2
suspects, clothing, CCTV, weapons; reduce by splitting up / changing clothes / abandoning weapon; stolen car may have armed driver,
tracker or near-empty tank; fuel gauge + engine health; spike strip; police dogs; buses/trains + Phil Hooker quote; Criminal Profile
Professional→Irredeemable, angel/devil, affects story; NPCs remember you) · Rob Nelson via Inven Global (crime reported only if
witnessed or alarm) · GameSpot (six stars, hollow stars; Lucia drives past cops with hollow stars in the Extended Look) · Rob Nelson
to IGN (explosives damage a safe's valuables).

**Footage:** **An Extended Look** (main — chases, stars on the HUD, robberies, bus), Trailer 2, Launch Trailer.

**Signature look for this video:** a **police "case file" HUD**: our own design. A dark tablet overlay with a suspect card
("JASON & LUCIA") whose fields (FACE, CLOTHES, WEAPON, CCTV, SUSPECTS, VEHICLE) fill in red as each habit "gives you away", and turn
green as you learn the fix. The `IconPanel` component drives it.

---

**B1 · 0:00–0:06 · COLD OPEN**
- **VO:** "In GTA 5, losing the cops was easy."
- **VISUAL:** a classic chase feel: Extended Look car chase B-roll, fast cuts.
- **GFX:** five white stars on screen; they blink out one by one.
- **AUDIO:** a siren swell; a tick per star disappearing.

**B2 · 0:06–0:14 · PATTERN BREAK**
- **VO:** "Break line of sight, wait for the stars to go, and you were free. Same car, same clothes, same gun."
- **VISUAL:** freeze-frame; the image goes to a security-camera filter (scanlines, timestamp "REC ●").
- **GFX:** the case-file HUD slides in from the right; FACE, CLOTHES, WEAPON and VEHICLE fields all flash red.
- **AUDIO:** a CCTV click + static burst.

**B3 · 0:14–0:28 · STAKES + PROMISE**
- **VO:** "In GTA 6, that's exactly how you get caught. Rockstar rebuilt the police from scratch, and the cops now remember things about
  you. So here are ten GTA 5 habits you need to drop before November nineteenth, and the last one changes your whole story."
- **VISUAL:** Extended Look: cops looking around, a police car rolling slowly.
- **GFX:** "THEY REMEMBER" in red (Anton); `SourceTag` REPORTED · Edge preview.
- **AUDIO:** police-radio chatter (our SFX, not game audio); the music drops in at 0:28.

**B4 · 0:28–0:32 · #10 CARD** — `NumberCard` "#10 · CRIMES IN FRONT OF EVERYONE"; ProgressBar 1/10.

**B5 · 0:32–1:00**
- **VO:** "In GTA 6, a crime doesn't magically alert every cop in the city. According to Rob Nelson from Rockstar North, it only gets reported if
  someone witnesses it or an alarm goes off. That flips the old habit around. In GTA 5, it didn't matter who saw you. Now witnesses are the
  problem, and so are alarms. Pick quiet moments, and you might never get a star at all."
- **VISUAL:** a store/street scene from the Extended Look; pedestrians.
- **GFX:** eye icons pop above pedestrians ("WITNESS"); a bell icon "ALARM"; the formula "WITNESS or ALARM = REPORT".
  `SourceTag` REPORTED · Rob Nelson (Inven Global).
- **AUDIO:** a pop per eye icon; an alarm-bell sting.

**B6 · 1:00–1:30 · #9**
- **GFX:** "#9 · IGNORING CAMERAS"; ProgressBar 2/10.
- **VO:** "Cameras matter now. Edge's preview confirmed the police track CCTV footage as part of what they know about you. So that camera in the
  corner of the store isn't decoration anymore. It's evidence. If you're robbing somewhere, think about the cameras before you think about
  the cash."
- **VISUAL:** a store-robbery shot; a push into a ceiling corner (where a camera is visible; confirm the frame on the footage).
- **GFX:** the CCTV filter overlay; the case-file field "CCTV" fills red. `SourceTag` REPORTED · Edge.
- **AUDIO:** a camera servo whirr; a red "beep".

**B7 · 1:30–2:00 · #8**
- **GFX:** "#8 · SAME CLOTHES AFTER THE JOB"; ProgressBar 3/10.
- **VO:** "In GTA 5, your outfit never mattered to the police. In GTA 6, the heat system tracks the clothes you wore during the crime. Change
  them, and you're harder to recognise. Same robbery, same cops, but a different jacket can be the difference between walking past them
  and getting stopped."
- **VISUAL:** Jason and Lucia outfits from the Extended Look/trailers; quick outfit-swap cuts (match-cut on the body position).
- **GFX:** the "CLOTHES" field fills red → a jacket icon swaps → the field turns green "CLEARED".
- **AUDIO:** a fabric-swish SFX on the swap; a positive "ding" on green.

**B8 · 2:00–2:25 · #7**
- **GFX:** "#7 · KEEPING THE SAME GUN OUT"; ProgressBar 4/10.
- **VO:** "The police also track the weapon you used or carried. Running around with the gun from your last robbery is basically wearing a name
  tag. Edge reported that getting rid of the weapon removes another identifying detail. Put it away, or ditch it."
- **VISUAL:** a weapon shot from the trailers (aiming, no gore).
- **GFX:** the "WEAPON" field red → green after "ditch it". `SourceTag` REPORTED · Edge.
- **AUDIO:** a holster click.

**B9 · 2:25–2:30 · RE-HOOK + #6**
- **VO:** "This next one didn't exist in any GTA before."
- **GFX:** "#6 · STAYING TOGETHER AFTER A DUO JOB"; ProgressBar 5/10.

**B10 · 2:30–3:00**
- **VO:** "If witnesses report two suspects, the police know they're looking for a pair. Rockstar's answer: Jason and Lucia can split up to make
  that description less accurate. In GTA 5, there was no couple to look for. In GTA 6, being seen together is a clue."
- **VISUAL:** Jason and Lucia walking together → a split-screen showing them going in opposite directions.
- **GFX:** the "SUSPECTS: 2" field → after the split it reads "SUSPECTS: ?" in green. `SourceTag` REPORTED · Edge.
- **AUDIO:** a footsteps panning left/right on the split.

**B11 · 3:00–3:35 · #5**
- **GFX:** "#5 · STEALING THE FIRST CAR YOU SEE"; ProgressBar 6/10.
- **VO:** "In GTA 5, any car was a getaway car. In GTA 6, a random stolen car can come with three surprises: an armed driver, a vehicle
  tracking system, or an almost empty fuel tank, because every vehicle now has a fuel gauge and an engine-health readout. Plan your getaway car
  before the job, not during the chase."
- **VISUAL:** a car-jack/driving shot from the Extended Look.
- **GFX:** three warning cards slide in one per phrase: "ARMED DRIVER", "TRACKER", a fuel gauge needle dropping to "E". `SourceTag`
  REPORTED · Edge.
- **AUDIO:** a gun-cock (no shot), a tracker beep, an engine sputter.

**B12 · 3:35–4:10 · #4**
- **GFX:** "#4 · THINKING FIVE STARS IS THE MAX"; ProgressBar 7/10.
- **VO:** "GTA 5 topped out at five stars. GTA 6 brings back the six-star wanted level. And the stars tell you more now: hollow stars mean the
  police know a crime happened but don't know who did it. In the Extended Look, Lucia drives right past the cops with hollow stars, and they do
  nothing. Learn to read the stars, and you'll know when you're actually safe."
- **VISUAL:** the HUD stars from the Extended Look → the Lucia drive-past shot.
- **GFX:** an animated star bar: 5 stars → a 6th slams in (red flash, `ZoomPunch`) → the stars become hollow. A star legend card ("SOLID =
  SEEN · HOLLOW = UNKNOWN"). `SourceTag` REPORTED · GameSpot.
- **AUDIO:** a heavy hit on the 6th star; a "whoosh-out" on hollow.

**B13 · 4:10–4:40 · #3**
- **GFX:** "#3 · RUNNING STRAIGHT DOWN THE ROAD"; ProgressBar 8/10.
- **VO:** "The cops have new tools. In Edge's demo, officers talked over the radio and laid a spike strip across the road. And police dogs can now
  play a direct role in catching suspects. So the classic 'floor it down the main road' escape is riskier than ever."
- **VISUAL:** a road-chase shot; a night road.
- **GFX:** a spike-strip graphic slides across the road in perspective (our own); a K-9 silhouette icon with "NEW". `SourceTag`
  REPORTED · Edge.
- **AUDIO:** a radio squelch "Unit 4, deploy stinger"; a tyre-burst; a dog bark.

**B14 · 4:40–4:45 · RE-HOOK + #2**
- **VO:** "Now here's my favourite trick in the whole game."
- **GFX:** "#2 · ALWAYS ESCAPING BY CAR"; ProgressBar 9/10. The music lifts.

**B15 · 4:45–5:20**
- **VO:** "GTA 6 has working buses and trains. And Rockstar North's Phil Hooker told Edge this:"
- **GFX:** `QuoteCard`: *"If they didn't see you get on, and then you get out of the wanted area, why would they search the bus unless they
  see you get onto it?"* — Phil Hooker, Rockstar North (via Edge).
- **VO (cont.):** "So your best getaway vehicle might be a city bus."
- **VISUAL:** a bus/transit shot from the Extended Look; a police car driving past the bus.
- **GFX:** a little "HIDDEN ✓" tag on the bus.
- **AUDIO:** a bus air-brake hiss; a siren passing (Doppler).

**B16 · 5:20–6:10 · #1 (the story one)**
- **GFX:** "#1 · PLAYING LIKE A PSYCHO"; ProgressBar 10/10.
- **VO:** "The biggest change of all: GTA 6 has a Criminal Profile. It rates Jason and Lucia from Professional all the way to Irredeemable, with an
  angel at one end and a devil at the other. And Rockstar says it influences how their story unfolds. People in the world also remember how you
  treated them. GTA 5 never judged you. GTA 6 does. And a bonus tip from Rob Nelson: blowing a safe open with explosives can damage the
  valuables inside. So even the loot rewards a cleaner job."
- **VISUAL:** Jason and Lucia character moments; a calm robbery vs a chaotic one (Extended Look).
- **GFX:** a horizontal angel ↔ devil slider (`IconPanel` variant) sliding from "PROFESSIONAL" to "IRREDEEMABLE" as the VO says it; the
  devil end cracks. A safe icon with "💥 = LESS LOOT". `SourceTag` REPORTED · Edge / IGN.
- **AUDIO:** a choir "ahh" at the angel side, a distorted bass at the devil side; a glass-crack on "Irredeemable".

**B17 · 6:10–6:45 · OUTRO**
- **VO:** "GTA 6 wants you to think like a real criminal, not just outrun the cops. Which GTA 5 habit is going to be the hardest for you to drop?
  Tell me in the comments, and subscribe, because I'm posting GTA 6 guides every day through launch week."
- **VISUAL:** the case-file HUD with all fields now green: "CLEAN GETAWAY". A pull-back to an Extended Look sunset drive.
- **GFX:** end screen: #001 and #002 + subscribe.
- **AUDIO:** a triumphant resolve; pads.

---

## Thumbnails (A/B)
- **A — "THEY REMEMBER"** Split: left a grey GTA 5-style getaway car with a big "GTA 5 ✓"; right Jason on a CCTV-filtered still with six
  red stars above him and "GTA 6 ✕". Text "THEY REMEMBER".
- **B — Case file** The case-file HUD over Lucia's key art; fields FACE / CLOTHES / CCTV glowing red. Text "STOP DOING THIS".

## Description
```
10 GTA 5 habits that will get you caught in GTA 6: witnesses, CCTV, clothes, weapons, duo descriptions, stolen-car trackers, six stars,
spike strips and police dogs, the bus trick, and the Criminal Profile.

0:00 The cops remember now
0:28 #10 Crimes in front of everyone
1:00 #9 Ignoring cameras
1:30 #8 Same clothes after the job
2:00 #7 Keeping the same gun out
2:25 #6 Staying together after a duo job
3:00 #5 Stealing the first car you see
3:35 #4 Thinking five stars is the max
4:10 #3 Running straight down the road
4:40 #2 Always escaping by car
5:20 #1 Playing like a psycho

Sources:
- Edge preview, as reported by GTAVice.net: https://www.gtavice.net/news/gta-vi-edge-preview-reveals-huge-new-details-on-gameplay-police-relationships-and-more
- Rob Nelson interview (Inven Global): https://www.invenglobal.com/articles/26913/gta-6-full-interview-with-rockstars-rob-nelson-reveals-new-details
- GameSpot — wanted levels: https://www.gamespot.com/articles/gta-6-wanted-levels/
- IGN — Rob Nelson interview: https://www.ign.com/articles/gta-6-the-big-interview

Footage: Rockstar Games official trailers and "An Extended Look", used for commentary.
```
