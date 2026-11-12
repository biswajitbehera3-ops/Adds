# 010 — Reel / Short: "Real Miami… or GTA 6?" — v4 (one subject, ~40 s)

**Idea:** for years people filmed real Miami and said "this looks like GTA". That scene was rebuilt inside GTA 6, the Miami page
OnlyInDade posted it, Rockstar shared it to its Instagram Story, and people couldn't tell which was real.
**The clip plays first, the explanation comes after.**
**Format:** 9:16 1080×1920 · voice Bram · GTA neon karaoke subtitles · CONFIRMED / REPORTED / FAN ANALYSIS tags · YouTube Shorts +
Instagram Reels.
**Title:** `Real Miami… or GTA 6? #GTA6` · Reel caption first line: `This isn't Miami. Look again.`

## Hooks (scored with `yt-script/hookscore.py`, 10 candidates, 2 rounds)
| | Hook (spoken over the clip at 0:04) | Panel | Verdict | Formula |
|---|---|---|---|---|
| **A (use)** | "Before you swipe, look closely: you're watching a street in Miami. Or are you?" | specificity 46 · address 100 · stakes 48 · curiosity 59 · brevity 100 | **61 WORKABLE** | The Question |
| B | "Before you swipe, know this: this isn't a Miami street. It's GTA 6." | specificity 74 · address 76 · stakes 62 · curiosity 41 · brevity 100 | 59 WORKABLE | The Warning |

**Why A:** the reel only works while the viewer is still guessing. The Question keeps the answer back until the stamp at 0:09;
B gives it away in its second sentence.

## Spoken script — v4 (tightened after competitor check; exact TTS text in `scripts/010-voiceover-tts.txt`)
> *(0:00–0:02 — no voice. Clean clip + quiet Miami street sound.)*
> Before you swipe, look closely. You're watching a street in Miami. Or are you?
> It's GTA 6. The Miami page OnlyInDade posted it, and Rockstar shared it on its official Instagram.
> For years, people filmed real Miami and said: this looks like GTA. So that scene was rebuilt inside the game.
> Look at the details. The cars. The shop signs. The people on the street.
> Rockstar hasn't said if it's live gameplay.
> But the joke has flipped. Miami used to look like GTA. Now GTA looks like Miami.
> So be honest. Did it fool you?

**Runtime:** 97 words ÷ 150 wpm ≈ 39 s of voice + 2 s silent open ≈ **~40 s** (final timing from the generated voice).

## Competitor check (YouTube, 12 Nov, same clip)
| Video | Length | Views | Format |
|---|---|---|---|
| TheGamingRevolution — "GTA 6 Gameplay VS Real Life Miami" | 0:11 | **14,650 / 16 h** | Silent side-by-side |
| GTA VI Kingdom — "GTA 6's Phone Camera Is PHOTOREALISTIC" | 1:16 | 76 | Talk + clip |
| Kryvo — "This Is Not Real Life. It's GTA 6" | 2:03 | 37 | Explainer |
| PS5 Gamer — "…Wait, That's Not Real Miami" | 1:03 | 3 | Explainer |
| 12+ long videos (3–14 min) | — | 1–800 | Explainers |
**Takeaways:** short + visual wins; long talk loses. "This isn't real life, it's GTA 6" titles are saturated (5+ channels) → we use
the question title. Our edge: fast cuts on details + the proof (Rockstar's header) + an honest one-line catch, in ~40 s.
Not used: the "people called it AI" angle — only in creator descriptions, no outlet I could read confirms it.

**Word sync:** every visual change on "cars / shop signs / people" lands on the first frame of that word, using Whisper word
timestamps from the generated voice (same method as the 006 recap).

## Cut map (source: `clips/010/clean.mp4`, 1080×1920 30 fps, 19 s; `named.mp4` = with Rockstar header)
| Moment | Source time | Use |
|---|---|---|
| Pink-wrapped supercar | 0.0–1.0 | fast cut #1 |
| POLICE car | 3.5–4.5 | fast cut #2 + "the cars" |
| Scooter rider + diner sign | 5.0–5.6 | fast cut #3 + "the shop signs" |
| Man in red cap | 7.0–8.0 | "the people" |
| Pink-and-teal classic car | 9.0–10.5 | fast cut #4 |
| Green lowrider, zebra seats | 16.5–18.5 | fast cut #5 / ending |
| Lowrider wide (opening) | 5.0–7.0 | 0:00 open + loop frame |

## Beat sheet (every beat has something to look at)
**Always on screen from 0:00 to the end:** a small credit, bottom-left above the subtitles: `Clip: @onlyindade · shared by Rockstar
Games`.

| Time | Spoken | ON SCREEN |
|---|---|---|
| 0:00–0:04 | *(silence; street ambience)* | **[ON SCREEN: CLEAN clip (our crop, no Instagram bars) — the green lowrider rolling past the pink Art Deco strip. Small white text top-centre: "REAL MIAMI?"]** |
| 0:04–0:09 | "Before you swipe, look closely… Or are you?" | **[ON SCREEN: clean clip continues with a slow push-in; karaoke subtitles start.]** |
| 0:09–0:15 | "It's GTA 6. The Miami page OnlyInDade posted it, and Rockstar shared it on its official Instagram." | **[ON SCREEN: freeze → red stamp "IT'S GTA 6" (hit SFX) → cut to the SAME moment WITH Instagram's header (the proof); rings on "rockstargames ✓" and "onlyindade". Tag: CONFIRMED · Rockstar's Instagram Story.]** |
| 0:15–0:27 | "Here's why… rebuilt inside the game." | **[ON SCREEN: real Miami footage (Pexels: Ocean Drive neon at night, Brickell traffic) with three comment bubbles popping: "this looks like GTA" (our own text, no real usernames) → text card "A REAL MIAMI STREET VIDEO WENT VIRAL" (described, not shown) → clean clip again: "…SO IT WAS REBUILT IN GTA 6".]** |
| (word-synced) | "Look at the details." | **[ON SCREEN: clean clip slows to 50 %, slight darken, text "LOOK CLOSER".]** |
| ↳ on the word **"cars"** | "The cars." | **[ON SCREEN: hard cut to the POLICE car (source 3.5–4.5 s), zoom punch 1.0→1.25 on the car, ring + label "CARS" pops exactly on the word.]** |
| ↳ on **"shop signs"** | "The shop signs." | **[ON SCREEN: hard cut to the diner sign / umbrellas (source 5.0–5.6 s), zoom punch onto the sign, ring + label "SHOP SIGNS".]** |
| ↳ on **"people"** | "The people on the street." | **[ON SCREEN: hard cut to the man in the red cap (source 7.0–8.0 s), zoom punch onto him, ring + label "PEOPLE".]** |
| 0:35–0:41 | "One catch: Rockstar hasn't said…" | **[ON SCREEN: clean clip, darkened; card "GAMEPLAY or IN-ENGINE? — Rockstar hasn't said". Tag: UNCONFIRMED.]** |
| 0:41–0:47 | "But the joke has flipped…" | **[ON SCREEN: split top/bottom: real Miami Beach aerial (Pexels) vs GTA 6 Trailer 1 beach aerial (0:12). Labels "MIAMI" / "VICE CITY" swap on "Now GTA looks like Miami".]** |
| 0:47–0:54 | "So be honest. Did it fool you?" | **[ON SCREEN: the clean clip restarts from its first frame under "DID IT FOOL YOU?" — the loop.]** |

**Loop:** the last frame is the clean clip's first frame, so the reel plays straight back into "REAL MIAMI?".

## Edit plan
- **Source:** `remotion-overlays/public/clips/010/rec1.mov` (your screen recording of Rockstar's Story: 19 s, 888×1920, 60 fps,
  **silent**). Header: "rockstargames ✓ · Watch Full Reel · onlyindade" — OnlyInDade's reel, reshared by Rockstar.
- **Clean version:** crop `776×1356` at `x=56, y=304`, scaled to 1080×1920 (drops status bar, Story header, timer, buttons).
  Preview: `production/previews/010-with-name-vs-clean.jpg`.
- **With-name version:** the full recording, used only for 0:09–0:15 as the proof.
- **Sound:** Miami traffic from Pexels `px-9620604` (looped, quiet) under 0:00–0:04 and ducked under the voice; Bram after. Never
  the original reel's audio.
- **Keep it commentary, not a repost:** our voice and graphics are on top of the clip from 0:04 onward, the clip is cut up and mixed
  with real Miami footage and our graphics, and the credit stays on screen the whole time.
- Resolution: the capture is 888 px wide → slightly soft on big screens, fine on phones.

## Facts and labels (only these)
- OnlyInDade posted the GTA 6 reel; Rockstar shared it to its Instagram Story — **CONFIRMED** (visible in the recording).
- It recreates a viral real Miami street video; some people thought it was real — **REPORTED · Kotaku** (also Polygon, IGN, NDTV).
  Who filmed the *original* real video is disputed (Kotaku vs Metro), so the script never says.
- Fans matching cars / signs / people — **FAN ANALYSIS** (r/GTA6), not confirmed.
- Gameplay vs in-engine not stated by Rockstar — **REPORTED · Economic Times**.
- **Don't say:** "confirmed gameplay", "real-time", who filmed the original, "leaked", "exclusive", "first look", or any feature
  (selfie mode, phone camera) the clip doesn't prove.

## Description / caption
```
Real Miami… or GTA 6? People kept saying real Miami looks like GTA, so that scene was rebuilt inside GTA 6 — and a lot of people
couldn't tell. Did it fool you?

Clip by OnlyInDade, shared by Rockstar Games on Instagram. Used for commentary.
Real Miami footage: Pexels (free licence). Game footage © Rockstar Games.
Sources: Kotaku, Polygon, IGN.
Fan channel, not affiliated with Rockstar Games, Take-Two Interactive or OnlyInDade.
#GTA6 #ViceCity #Miami #Shorts
```

## Optional
DM OnlyInDade before posting: "Hi! I run a GTA 6 news channel and would like to use your GTA 6 Ocean Drive clip in a short
commentary video, with full credit on screen and in the description. Is that OK?"
