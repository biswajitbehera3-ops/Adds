# 034 Short — scene plan (matched to the recorded voice-over)

- **VO:** `production/audio/034-vo.mp3`, Kokoro **am_fenrir**, 49.2 s, loudness −14 LUFS. Beat timings are in `production/audio/034-beats.json`.
- **Canvas:** 1080×1920 (9:16). All footage is **official Rockstar** (Trailer 1, Launch Trailer, Extended Look, character clips) plus our Remotion graphics.
- **Not used:** no stream frames, no in-game TV footage, no story.
- **Captions:** GTA neon karaoke, word-timed.
- **Music:** a synthwave bed at −20 dB, ducked under the VO; the beat drops on "But the best surprises".

**Footage keys:**
- `T1@xx` is `clips/GTAVI_Trailer_1.mp4` at that second.
- `024/…` is `clips/024/…`.
- `006/…` is `clips/006/…` (EL = Extended Look, LT = Launch Trailer).

| # | VO time | Line | Footage (9:16 crop) | Graphics on top |
|---|---|---|---|---|
| 1 | 0.0–5.3 | "You're playing GTA 6 tonight, and before you do, you'll want to know the reviews it got." | `006/lt_0027_hero.mp4` (Jason and Lucia in the car, Lucia's hair moving), slow push-in; at 3.5 s cut to `T1@2` (purple sunset over the highway) | top: a clock ticking **11:59 PM IST** · bottom caption |
| 2 | 5.7–9.3 | "Ninety nine on Metacritic. A perfect ten from IGN." | `006/el_1848_skydive.mp4` (huge wide of Vice City), slow zoom | big gold **99** slams in at 5.8 s ("Ninety nine") · **IGN 10/10** card at 7.6 s · tag `REPORTED · Metacritic / IGN` |
| 3 | 9.6–13.5 | "And you can see why. The water, the storms, even the hair look real." | **3 quick cuts on the 3 nouns:** "water" → `024/keys_aerial.mp4` (turquoise lagoon, boat wake) · "storms" → `T1@52–54` (palms whipping in the wind; crop out the social-post text) · "hair" → `T1@38` (hair in the breeze) or `lt_0027_hero` close-up | a word label pops on each cut: **WATER · STORMS · HAIR** |
| 4 | 13.7–15.9 | "One fan typed: Is this real life?" | `T1@12` (beach aerial that looks like real Miami) | **chat bubble** (our design, no username): "IS THIS REAL LIFE?" · small tag `LIVE CHAT · 18 NOV` |
| 5 | 16.3–18.6 | "But the best surprises are in the small stuff." | `006/el_1812_phone.mp4` (street-level crowd detail) | a magnifying-glass wipe; **the music drops here** |
| 6 | 18.9–23.9 | "Pick up a book, and you can open it and read the pages. One of twenty-seven to collect." | `T1@72` (lamp-lit room), blurred to 60% as a backdrop | **our animated book** (blue cover, opens, pages flip; blurred placeholder text, never copied) · a counter **1 / 27** at 22 s · tag `SEEN IN-GAME` |
| 7 | 24.2–29.9 | "Steal something, and the cash doesn't hit your pocket. You drop the goods at a lockup, and get paid later." | "Steal something" → `T1@68` (masked store robbery) / `024/robbery_guns.mp4` · "lockup" → `024/brian_official.mp4` (the lockup owner, an official character) | cash counter **$600 → $0** at "doesn't hit your pocket" · flow chips **STEAL → STASH → PAID LATER ⏳** at 27 s · tag `SEEN IN-GAME` |
| 8 | 30.2–33.4 | "Get in a car, and the GPS talks you through every turn." | `006/el_1524_chase.mp4`. Its in-game minimap shows a route; **zoom the crop onto the minimap** at 31.5 s. Then `024/jason_t1drive.mp4` | our banner **↱ TURN RIGHT · 323 FT** sliding in at "every turn" |
| 9 | 33.8–39.0 | "The one thing missing? A full first-person mode. You only go first person when you aim." | "missing?" → `024/jason_drive.mp4` (over-the-shoulder) · "when you aim" → `024/robbery_guns.mp4` (guns raised) | **FIRST PERSON?** card → red stamp **NOT AT LAUNCH** at 36.5 s · chip **ONLY WHEN AIMING** · tag `REPORTED · Insider Gaming / GTA Intel` |
| 10 | 39.3–41.8 | "The only complaint: thirty frames per second." | `006/lt_0047_supercars.mp4` (fast police chase) | amber chip **30 FPS** with a slight stutter effect (3 dropped frames, a visual joke) · tag `REPORTED · reviews` |
| 11 | 42.1–45.5 | "One fan summed it up: Bad F P S, but looks good though." | `T1@36` (bridge over the ocean, aerial) | chat bubble **"bad fps but looks good though"** · tag `LIVE CHAT · 18 NOV` |
| 12 | 45.9–49.2 | "See you at midnight. Which one are you checking first?" | `T1@76` (Jason and Lucia running out of the store) → hard cut to the **VI logo** (`T1@80`) | clock flips **11:59 → 12:00 AM IST** at "midnight" · comment prompt **📖 💰 🧭 👁 WHICH ONE?** |

**Loop:** end on the VI logo, then cut straight back to shot 1 (the clock at 11:59).

## Build notes
- **Crops:** 16:9 sources are cropped to 9:16 centred on the subject (Lucia/Jason faces, the minimap in shot 8). Keep cuts on the VO word onsets from `034-beats.json`.
- **Unbuilt graphics** (Remotion, our style kit `src/gta6/theme.tsx`):
  - a book open/flip animation;
  - a chat bubble;
  - a GPS banner;
  - the "NOT AT LAUNCH" stamp;
  - the clock flip.
- **Credits in the description:** "Footage: Rockstar Games trailers, used for commentary."
- **Fact check before posting:** book / lockup / GPS were each seen in-game on **one** stream so far. Confirm on a 2nd, or change those lines to "players are finding…".
