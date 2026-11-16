# 027 — GTA 6 Won't Let You Play Like GTA 5 — Production script v3 (/yt-script pass)

**Standard:** `production/style-guide.md` · **Runtime:** ~3:57 at 150 wpm · **VO:** ~593 words · **Music:** synthwave (body part) → dark
pulse (weapons, cars, police) → soft pads (rumour corner + outro)
**Inspired by:** Dattrax Plays, "15 CRAZY Features In GTA 6 That Were NOT In GTA 5!" (Hindi). We use the same "your GTA 5 habits
will hurt you" frame. We use a different order and our own wording, and only the claims we could source. His unsourced claims go in
a labelled RUMOUR corner at the end. Fact-check: `research/dattrax-features-factcheck-2026-11-16.md`.

**Title (pick one, ≤60 chars):**
- A: `GTA 6 Won't Let You Play Like GTA 5` (36)
- B: `GTA 6 Tracks Your Food, Sleep and Guns` (38)

**Thumbnail text:** A "BAD HABITS" · B "IT'S WATCHING"

## Only what's NEW (not in 006 "10 Hidden Details", 007 "Phone", or 014 "GTA 6 vs GTA 5")
Already covered there, so here it's a **one-line callback** at most:
- weapons being noticed (006 #10);
- trackers and car fences (006 #7, 007);
- the police report icons and hollow stars (006);
- the criminal profile, the relationship, fuel, robbing anything, and explosives in safes (014).

## Facts (Tier 1–2 only)
- **Body system.** REPORTED · Dazed, Rockstar developers interview, 26 Aug 2026 (via Kotaku):
  - Jason's and Lucia's bodies change with what they eat and do. Eating too much adds weight.
  - Working out sheds weight and builds muscle tone.
  - Not sleeping, long police chases, or "multi-day benders" change their faces and bodies.
- **Gym membership exists.** REPORTED · Edge.
- **Weapon carry limit.** REPORTED · GameByte, 2 Nov 2026, from hands-on previews:
  - up to **4 weapons**: 2 concealed sidearms + 2 long guns;
  - the rest of your arsenal is in **your vehicle's trunk**;
  - GameByte also reports Rob Nelson pointed to RDR2 as the model.
- **Gun on your back vs in your hands.** REPORTED · Edge:
  - people react differently to each;
  - carrying doesn't automatically mean a wanted level, and you can put it away before it escalates.
- **Your partner drives while you shoot.** REPORTED · Edge.
- **Start small:** cheap cars, basic locks. REPORTED · The Guardian, 15 Nov 2026.
- **Car security tiers.** REPORTED · Kotaku / Notebookcheck / Engadget, from previews, late Aug 2026:
  - a Slim Jim for older cars;
  - a **key cloner** for newer electronic cars;
  - a signal-relay trick for keyless cars;
  - a phone app shows a car's security, its value and the **cost to register it** as yours.
  - The registration process itself is not described, so say only "a cost".
- **Fences.** REPORTED · TweakTown (Rockstar on the criminal economy):
  - stolen goods don't turn into cash by themselves;
  - you take them to a fence, and there are different fences for different loot (cars, jewellery).
- **Robbery targets have no mission marker; small ones aren't on the map.** REPORTED · IGN (Rob Nelson) / Edge.
- **More than one way out.** REPORTED · IGN, Rob Nelson, via GamesRadar / Dexerto:
  - the opening tower-block mission has more than one escape route;
  - quote: "a very conscious effort to open things up where possible, without compromising the quality of the experience."
  - Sources differ on the exact number of routes, so say "more than one".
- **Police build a description.** Callback to 006:
  - a crime is reported only if someone sees it or an alarm goes off (GameSpot; Rob Nelson via Inven Global);
  - the report tracks your description, clothes, one or two suspects, CCTV and weapon (Edge).

## RUMOUR corner (labelled on screen the whole time; worded "rumour", "not confirmed", "my wish")
1. Passing your gun to your partner when they run out of ammo. No source found.
2. Overhearing a stranger's conversation that unlocks a new activity, or Jason and Lucia spotting a robbery while driving.
   Speculation from a retail listing (Digital Citizen).
3. Golf and tennis. Not confirmed.
4. Natural disasters such as hurricanes or a tsunami. Not confirmed by Rockstar.

**Left out completely:**
- the "limited loot bag" claim, which comes partly from leaked footage (channel rule: no leaks);
- "only 1–2 guns", which conflicts with the reported 4.

**Do NOT say:**
- that the gym raises "strength/stamina stats", or that sleep lowers "attributes";
- that a mask is confirmed to clear your face (GameSpot only thinks so);
- how many escape routes there are;
- how registration works.

**Footage needed:** Trailer 1, Trailer 2, Launch Trailer, Extended Look (official), Newswire screenshots. Also our illustrations:
- weight bar, Zzz meter;
- trunk loadout;
- a car "security tier" card;
- a fence map pin;
- a two-route map;
- a police report card;
- a "RUMOUR" frame with an amber border.

---

## Hooks (hookscore.py)
| # | Hook | Score | Weakest |
|---|---|---|---|
| **A (use)** | "GTA 6 is watching what you eat, how you sleep and what's in your pockets, and one of those will cost you your first heist." | **69 WORKABLE** (Spec 56 · Addr 100 · Stakes 62 · Curio 75 · Brev 93) | Specificity |
| B | "GTA 6 checks your weight, your sleep and your 4 guns, and one GTA 5 habit gets you reported before you see a cop." | 65 WORKABLE (Spec 100 · Addr 100 · Stakes 62 · Curio 41 · Brev 100), The Warning | Curiosity |

Ten more were tested and scored 45–64. Hook A wins because it opens a question the viewer can't close: *which* one costs the heist?
It is answered explicitly at the payoff (B16).

## Beat-by-beat (every beat: VO + [ON SCREEN])

**B1 · HOOK 1/3 · PATTERN BREAK**
- **VO:** "GTA 6 is watching what you eat, how you sleep and what's in your pockets…"
- **[ON SCREEN:** Extended Look street, frozen on Jason. Three icons pop over him, one per phrase: 🍔 → 😴 → 🔫, each with a red eye.
  Synthwave starts on "watching".**]**

**B2 · HOOK 2/3 · STAKES**
- **VO:** "…and one of those will cost you your first heist."
- **[ON SCREEN:** the three icons spin like a slot machine and stop on "?" · a red stamp "YOUR FIRST HEIST" · SFX stamp hit.**]**

**B3 · HOOK 3/3 · PROOF THE PAYOFF EXISTS**
- **VO:** "Ten GTA 5 habits, every one sourced on screen. Then which one costs you, and the rumours I really hope are true."
- **[ON SCREEN:** a `ProgressBar` 0/10 slides in · a gold "SOURCED" chip · a small amber "RUMOURS ▸ END" chip.**]**

**B4 · THE TURN**
- **VO:** "So let's go habit by habit, starting with your body."
- **[ON SCREEN:** hard cut, `NumberCard` "1".**]**

**B5 · #1 WHAT YOU EAT**
- **VO:** "Habit one: eating junk for free. Rockstar's developers told Dazed that Jason's and Lucia's bodies change with what you do.
  Eat too much, and they put on weight. Michael, Franklin and Trevor never gained a pound. Jason and Lucia will."
- **[ON SCREEN:** Trailer 2 neon diners → a push on Jason · a weight bar sliding up with burger icons · `SourceTag` REPORTED · Dazed
  (Rockstar devs) · `ProgressBar` 1/10.**]**

**B6 · #2 SLEEP**
- **VO:** "Habit two: never sleeping. Skip sleep, run from the cops for too long, or go on what they call multi-day benders, and it shows
  on their faces."
- **[ON SCREEN:** Trailer 1 motel → night city → dawn · a Zzz meter draining red · caption "MULTI-DAY BENDERS" · `SourceTag` REPORTED · Dazed ·
  2/10.**]**

**B7 · #3 THE GYM**
- **VO:** "Habit three: skipping the gym. Working out sheds the weight and builds muscle tone, and Edge reports a gym membership. San Andreas fans, the
  gym is back. Whether it changes your stats too? Nobody's said."
- **[ON SCREEN:** Trailer 2 beach gym (T2 0:39) · the weight bar drops, a muscle icon fills · amber chip "STATS? NOT CONFIRMED" · `SourceTag`
  REPORTED · Dazed / Edge · 3/10.**]**

**B8 · RE-HOOK (≈1:10)**
- **VO:** "That's your body. But remember the hook: one habit costs you your first heist. It's coming up in the next three."
- **[ON SCREEN:** the slot machine from B2 flashes, with three reels now showing 🔫 🧳 🚗 · the music switches to dark pulse.**]**

**B9 · #4 FOUR GUNS**
- **VO:** "Habit four: carrying every gun in the game. Hands-on previews report you can carry four. Two hidden handguns, two long
  guns. GameByte says Rob Nelson pointed to Red Dead 2 as the model."
- **[ON SCREEN:** Launch Trailer weapon shot (cut before violence) · four slots "SIDEARM · SIDEARM · LONG GUN · LONG GUN" · the GTA 5 wheel
  shatters behind them · `SourceTag` REPORTED · GameByte (hands-on previews) · 4/10.**]**

**B10 · #5 THE TRUNK**
- **VO:** "Habit five: keeping every gun on you. Everything else lives in your car's trunk. So before every job, you choose. Remember that one."
- **[ON SCREEN:** our illustration: an open trunk with a loadout grid · caption "PLAN YOUR LOADOUT" · a small gold "📌 REMEMBER" pin · `SourceTag`
  REPORTED · GameByte · 5/10.**]**

**B11 · #6 ON YOUR BACK**
- **VO:** "Habit six: thinking nobody notices. Edge reports people react differently to a gun on your back than a gun in your hands.
  Carrying isn't an instant wanted level, but leave it out and it escalates."
- **[ON SCREEN:** Extended Look busy street, a pedestrian turning their head (freeze, ring) · split card "ON YOUR BACK" / "IN YOUR HANDS"
  with the second flashing red · `SourceTag` REPORTED · Edge · 6/10.**]**

**B12 · #7 TEAMWORK**
- **VO:** "Habit seven: doing it all alone. Edge reports your partner can drive while you shoot. And the Guardian says you start small:
  cheap cars, basic locks."
- **[ON SCREEN:** Trailer 2 Jason driving with Lucia beside him · seat icons "DRIVER: LUCIA · SHOOTER: YOU" · `SourceTag` REPORTED · Edge /
  The Guardian · 7/10.**]**

**B13 · #8 CAR SECURITY (≈2:02)**
- **VO:** "Habit eight: one button, any car. Previews report older cars open with a simple tool, newer ones need a key cloner, and keyless
  ones need a trick that copies the key's signal. Your phone even shows a car's security, its value, and what it costs to register it
  as yours."
- **[ON SCREEN:** Trailer 2 street cars → a supercar push · a three-tier card "OLD · SIMPLE TOOL / ELECTRONIC · KEY CLONER / KEYLESS ·
  SIGNAL TRICK" · a phone mock-up labelled ILLUSTRATION with "SECURITY · VALUE · REGISTER $" · `SourceTag` REPORTED · Kotaku (previews) ·
  8/10.**]**

**B14 · #9 NO MARKER, THEN THE FENCE**
- **VO:** "Habit nine: waiting for a mission marker, and expecting cash straight away. Rob Nelson says robbery targets don't get a
  marker, and small ones aren't even on the map. And loot isn't money until you take it to a fence."
- **[ON SCREEN:** an Extended Look jewellery-store shot · a map with no icons, then one amber "?" pin · strip "LOOT → FENCE → $" ·
  `SourceTag` REPORTED · IGN (Rob Nelson) / TweakTown · 9/10.**]**

**B15 · #10 MORE THAN ONE WAY OUT**
- **VO:** "Habit ten: one wrong turn, mission failed. Rob Nelson told IGN the opening mission has more than one way to escape. In his
  words, a very conscious effort to open things up."
- **[ON SCREEN:** an Extended Look city aerial → a car cutting down a side street · our two-route map (ILLUSTRATION), one route turning red and
  the other lighting up · `QuoteCard` "a very conscious effort to open things up" — Rob Nelson · `SourceTag` REPORTED · IGN · 10/10.**]**

**B16 · PAYOFF: THE ONE THAT COSTS YOU THE HEIST (≈2:53)**
- **VO:** "So, which habit costs you your first heist? Your pockets. In GTA 5, you walked in with everything. In GTA 6, you walk in
  with four guns, and the rest is in a trunk. Now add the last thing: a crime gets reported when someone sees it. Edge says the
  police report tracks your face, your clothes, whether there were two of you, cameras, and your weapon. So the wrong gun on your
  back, a car three streets away, and a witness who saw you. That's how a GTA 5 habit ends a GTA 6 heist. Change your clothes,
  split up, lose the gun."
- **[ON SCREEN:** the slot machine from B2 finally stops: 🔫 + 🧳 + 👁 = "HEIST FAILED" (red stamp) · a police report card ticking FACE ·
  CLOTHES · 2 SUSPECTS · CCTV · WEAPON · a blue "OUR READ" tag on the chain of events · `SourceTag` REPORTED · GameByte / Edge / GameSpot ·
  the line "Change clothes · split up · lose the gun" as a checklist.**]**

**B17 · RUMOUR CORNER (≈3:35)**
- **VO:** "Now, the rumours. Not confirmed. But I'd love it if they're true. Passing your gun to your partner when they run out of ammo.
  Overhearing a stranger's conversation that leads to a new job. Golf and tennis in Vice City. And natural disasters, like a
  hurricane or even a tsunami hitting Leonida. None of it's confirmed by Rockstar. On Thursday we find out."
- **[ON SCREEN:** an amber "RUMOUR · NOT CONFIRMED" border for the whole beat · four cards flipping in with question marks: "PASS THE
  GUN?" · "NEW JOB?" · "GOLF & TENNIS?" · "DISASTERS?" · stormy Leonida sky · closing card "WE'LL CHECK ON 19 NOV" · soft pads.**]**

**B18 · CLOSE (one ask)**
- **VO:** "Which one of those rumours do you want to be real? Tell me in the comments."
- **[ON SCREEN:** Launch Trailer end shot · a comment card "WHICH RUMOUR?" · end screen with 006 "10 Hidden Details" + subscribe.**]**


---

## Thumbnails (A/B)
- **A — "BAD HABITS":**
  - left: a GTA 5-style infinite weapon wheel, cracked;
  - right: Jason crop;
  - text "BAD HABITS" with a small red "GTA 5 → 6".
- **B — "IT'S WATCHING":**
  - a burger, a Zzz icon, a gun and a car-key icon in a row, each with a red eye over it;
  - Lucia crop;
  - text "IT'S WATCHING".

## Description
```
GTA 6 won't let you play like GTA 5. Your food, sleep and gym time change Jason and Lucia's bodies, you can carry 4 weapons with the rest in your trunk, expensive cars need a key cloner, loot goes to a fence, and the police remember what you look like. Every claim is sourced on screen, and the rumours at the end are clearly marked.

0:00 GTA 6 is watching you
0:25 You are what you eat
0:41 Sleep shows on your face
0:53 The gym is back
1:16 Four guns, not forty
1:29 Your trunk is your armoury
1:36 On your back vs in your hands
1:51 Your partner drives
2:02 Not every car opens the same way
2:23 No marker, then the fence
2:39 More than one way out
2:53 The habit that costs your first heist
3:35 Rumours (not confirmed)

Sources:
- Dazed, Rockstar developers interview (26 Aug 2026), via Kotaku: https://kotaku.com/rockstar-confirms-gta-6-is-bringing-back-san-andreas-weight-system-2000728481
- GameByte (2 Nov 2026), weapon carry limit and trunk, from hands-on previews: https://www.gamebyte.com/gta-6-weapons-carry-limit-trunk/
- Kotaku, car theft and security: https://kotaku.com/for-the-first-time-in-25-years-gta-6-will-make-stealing-cars-hard-2000729419
- TweakTown, Rockstar on the criminal economy and fences: https://www.tweaktown.com/news/113368/gta-6s-illicit-criminal-economy-robberies-and-money-explained-by-rockstar/index.html
- GamesRadar, Rob Nelson (IGN) on open mission design: https://www.gamesradar.com/games/grand-theft-auto/with-gta-6-missions-rockstar-has-made-a-very-conscious-effort-to-open-things-up/
- Edge magazine preview: gym membership, carrying weapons, partner driving, the police report
- The Guardian (15 Nov 2026), start small: https://www.theguardian.com/games/ng-interactive/2026/nov/15/grand-theft-auto-vi-inside-rockstar-games
- GameSpot: crimes reported only when seen or an alarm goes off

Rumours (passing guns, overheard jobs, golf/tennis, natural disasters) are NOT confirmed by Rockstar.
Inspired by Dattrax Plays' GTA 6 vs GTA 5 features video.
Footage: Rockstar Games (official trailers, Extended Look), used for commentary. Illustrations are ours and labelled.

#GTA6 #GTAVI
```
