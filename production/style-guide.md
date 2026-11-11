# Production standard — GTA 6 English channel

Every long video and every script follows this. It's built from what we measured in T5G (1.5M subs), Hazard, BreeZe GTA and TGG,
and it aims to beat them on each point.

## 1. What the competition does, and what we do better

| Area | What they do | What we do |
|---|---|---|
| **Accuracy** | Mix confirmed facts with guesses, rarely say which is which. BreeZe credits Edge for IGN facts. | Every claim gets an on-screen **CONFIRMED / REPORTED / THEORY** tag plus the source name (lower-third). Sources linked in the description. |
| **Hook** | Topic statement + "let's get into it" (T5G, Hazard). | 3-part hook in ≤25s: **pattern break** (freeze-frame or stamp) → **stakes** (what you lose/miss) → **payoff tease** (the best item is saved for last). |
| **Pacing** | Long holds on one trailer shot while talking (Hazard), static circles. | A new visual every **2–4 s**: shot change, zoom move, graphic or caption. No still frame longer than 4 s. |
| **Callouts** | Static red circle/arrow. | **Animated callouts:** a smooth push-in (Ken Burns) to the detail, a ring that draws on, a label that types in, then pulls back out. |
| **Structure** | Flat list. | Numbered **chapters** with a progress bar, a **re-hook every 60–90 s** ("the next one changes how you'll play") and the strongest item last. |
| **Graphics** | Mostly raw footage + text. | Our own motion graphics: world-clock map, count-ups, icon panels, split-screen comparisons, quote cards, checklists. Same fonts and colours every video. |
| **Sound** | Voice + one music bed, uneven levels. | Three layers: **voice** (clean, compressed), **music** (changes per chapter, ducked under voice), **SFX** (whoosh on transitions, riser into reveals, hit on stamps, typing on labels). Mastered to **−14 LUFS**. |
| **Captions** | None, or auto-captions. | Burned-in **keyword captions** (2–4 words) on key facts only, plus full YouTube subtitles uploaded as an .srt. |
| **Thumbnail** | Busy, generic "GTA 6" text. | One focal point, ≤3 words, high contrast, a curiosity gap that isn't clickbait. **Two versions per video** for YouTube's built-in thumbnail test (Test & Compare). |
| **End** | "Like and subscribe". | A comment question tied to the topic + an end screen pointing to the next video in the series. |

## 2. Script rules
1. **Spoken English, not written:** short sentences, contractions, one idea per sentence. Read every line aloud before final.
2. **150–155 words per minute.** 5–7 min = 750–1,050 words.
3. **Only Tier 1–2 facts** (`research/gta6-news-sources.md`). Theories are worded as theories ("my bet…").
4. **Every 60–90 s, a re-hook line.**
5. **Never copy** another creator's title, list or order. Use the same facts with our own angle and credit the source.
6. **No leaks, no datamined info, spoiler warning on story content** after 19 Nov.

## 3. Visual system
- **Format:** 3840×2160 (4K) master, 30 fps. Upload 4K even if the sources are 1080p, because YouTube gives 4K uploads a higher bitrate.
- **Grade:** slight contrast and saturation lift, matching Leonida's teal/pink palette.
- **Brand colours:** Night `#07070C`, Neon pink `#FF2E88`, Ocean blue `#1FB8FF`, Gold `#FFC93C`, Confirmed green `#3CFF6B`,
  Alert red `#FF3B3B`.
- **Fonts:** Anton (headlines, numbers) and Inter (labels, source tags).
- **Safe areas:** keep text out of the bottom-right 20% (YouTube progress bar and end-screen area).

### Motion-graphics library (Remotion — ✅ built, 🛠 to build)
| Component | Use | Status |
|---|---|---|
| `NumberCard` | "#10" chapter cards with a whoosh-in and the chapter title | ✅ |
| `DetailCallout` | Push-in on a frame, ring draws on, label types in | ✅ |
| `SourceTag` | Lower-third: CONFIRMED / REPORTED / THEORY + outlet name | ✅ |
| `ProgressBar` | Thin chapter bar at the top: "4 / 10" | ✅ |
| `WorldClockMap` | World map; countries light up with their unlock times | 🛠 |
| `IconPanel` | Police "heat" icons (face, clothes, weapon, CCTV, 2 suspects) that light up and cross out | ✅ |
| `QuoteCard` | Quote + speaker + outlet | ✅ |
| `ChecklistCard` | Items tick on one by one | 🛠 |
| `SplitCompare` | GTA 5 vs GTA 6 side by side | 🛠 |
| `StarRow`, `DispatchScreen`, `SplitCompare` (before/after crops of real frames) | Star states, the 006 dispatch console, HUD comparisons | ✅ |
| `IllGunAwareness`, `IllVictimLunge`, `IllOwnerCall`, `IllTracker`, `IllSearchlight`, `IllStinger`, `IllStoreClear` | Labelled "ILLUSTRATION" diagrams for moments only described in print | ✅ |
| `MoneyCounter`, `Countdown`, `ResultStamp`, `WantedHook`, `ZoomPunch`, `MrBeastCaptions` | Count-ups, timers, stamps, stars, punch zooms, keyword captions | ✅ |

## 4. Audio system
- **Voice:** phone held 15–20 cm from your mouth, quiet room with soft furnishings, read section by section. Processing: noise reduction →
  EQ (high-pass 80 Hz, a small presence lift) → compression → de-ess → **−14 LUFS** final.
- **Music:** licensed only, from **Epidemic Sound** (connected here; a subscription covers YouTube use) or the **YouTube Audio
  Library** (free). **Never** the GTA soundtrack or trailer music (Content ID claims). Mute trailer audio except short dialogue
  quotes.
- **Moods:** synthwave/Miami night (energy), dark pulse (suspense), percussive chase (police), soft pads (outro).
- **SFX:** whoosh (transitions), riser (into reveals), boom/hit (stamps), typewriter/keyboard (labels), camera shutter (freeze-
  frames), police radio blip, siren swell, map ping.
- **Mix:** music −22 to −28 LUFS under voice (ducked), SFX −18 to −12 LUFS.

## 5. Thumbnail system
- 1280×720, under 2 MB. Built in Remotion as a still at 3840×2160, then exported.
- **One** subject (character crop from official key art, or a single object), **one** graphic idea, **≤3 words** in Anton with a
  thick black outline.
- High contrast: a dark background, a pink/blue rim light on the subject, a gold or red accent.
- Readable at phone size (test it at 160 px wide).
- Honest curiosity gap: the image teases something the video actually shows.
- Two versions (A/B) per video for YouTube's Test & Compare.

## 6. Delivery checklist (every video)
- [ ] Every fact has a SourceTag; sources are in the description
- [ ] No frame held > 4 s; a re-hook every 60–90 s
- [ ] Captions on key facts; .srt uploaded
- [ ] Loudness −14 LUFS, true peak ≤ −1.5 dB
- [ ] Frame check at every chapter boundary (`scripts/check-frames.mjs`)
- [ ] Two thumbnails; title ≤ 60 characters; chapters in the description
- [ ] End screen + pinned comment question
