---
name: pod-motion-library
description: >-
  The podcast's named motion-graphics styles (kinetic hook, title card dive, breaking strip, odometer stat, icon strike, lens ring, live markup, map ping, split compare, quote card, magazine cover, mood curtain, intertitle and more) - what each looks like, when Claude should pick it on its own, and how to build it. Use whenever an episode or Short needs motion graphics, a hook, a stat, a transition, emphasis or an ending, so the user never has to name the style.
---

# pod-motion-library — the channel's motion styles

Claude **chooses the styles itself** per moment — don't ask the user which. Each style is built the first time an edit needs it (HyperFrames effect in `podcast/effects/effects/<slug>.html` rendered with `pod.py fx`, a Manim clip for precise data, or a Remotion overlay in `podcast/remotion`), checked over the studio plate, then reused. Record built ones in the **Built** column.

## How to choose
1. Find the **moment type** in the script: hook (first 1-3 s) · section · stat/number · fact list · emphasis word · reveal/answer · comparison · quote/source · place/map · transition · ending.
2. Pick from the matching row; prefer **Fit ★★★**.
3. Limits: one motion style per ~6-8 s on long-form, max 3 styles per Short / 8 per episode; never over a host's face (top band or the side away from the speaker); 0.6-3 s each; no strobe/flashing (photosensitivity).
4. Numbers and quotes on screen must be sourced (voice.md). Breaking news: mark "REPORTED" vs "CONFIRMED".
5. Say in the plan which styles were chosen and why (one line each).

## Catalogue
| Style | What it looks like | Moment | Fit | Build from | Built |
|---|---|---|---|---|---|
| Kinetic hook | 2-4 punchy words slam in one by one, slight shake | hook | ★★★ | `effects/kinetic-hook.html` (template) | ✓ template |
| Breaking strip | Red "BREAKING / REPORTED" lower strip with ticker | news hook | ★★★ | HyperFrames lower-third + ticker | |
| Title card | Full-frame title on ink/brand colour, type lock-up | section | ★★★ | HF `titlecard-lockup` | |
| Title card dive | Title card the camera pushes through into the studio | hook→episode | ★★★ | title card + `zoom-through-transition` | |
| Intertitle | Chapter card between sections ("Part 2: Kyun hua?") | section | ★★ | title card, serif + border | |
| Odometer stat | Digits roll into a number + label slides in | stat | ★★★ | `effects/odometer.html` (template) | ✓ template |
| Data chart | Bars/lines grow with highlighted bar | stats over time | ★★★ | Manim (`pod-manim`) | ✓ test |
| Split compare | Screen splits A vs B with values | comparison | ★★★ | HF `before-after-wipe` / Manim | |
| Icon strike | Icon slams in with a flash ring | each fact in a list | ★★★ | `badge-pop`, `icon-morph-beat` | |
| Gravity drop | Words/objects fall, bounce and settle | fun list, punchline | ★★ | GSAP bounce (`spring-pop`) | |
| Serif stamp | Big word thumps down like a rubber stamp ("FAKE", "SACH") | verdict/answer | ★★★ | HF `headline-slam` + texture | |
| Giant captions | Huge 1-2 word captions filling the frame | emphasis | ★★★ | PodCaptions (size 200+) | |
| Knockout captions | Video shows through cut-out letters | hook/emphasis | ★★ | HF `texture-mask-text` | |
| Quote card | Source quote card with name/outlet + date | quote/source | ★★★ | Remotion card | |
| Tweet/headline card | Animated headline or post (real, credited) | viral clip context | ★★★ | HF animated headline | |
| Map ping | Map zoom + pulsing pin + label | place | ★★★ | HF map/diagram or Manim | |
| Lens ring | Circular focus ring highlights a spot in a clip | point at something | ★★★ | `focus-rack`, `yt-circle-pointer` | |
| Live markup | Hand-drawn arrows/circles over a clip while they talk | explain a clip | ★★★ | HF `hw-callout-circle`, `hw-arrow` | |
| Video card | Viral clip inside a rounded tilted card beside the hosts | clip breakdown | ★★★ | Remotion overlay + `tilt-card` | |
| Picture dive | Zoom into an image until it becomes the next scene | into a topic | ★★ | `zoom-through-transition` | |
| Mood curtain | Coloured wipe sweeps across to change section | transition | ★★★ | HF `curtain-reveal` | |
| Magazine cover | Freeze into a cover with the hosts + cover lines | thumbnail moment / ending | ★★ | `freeze-frame-dressing` | |
| Confetti / sparkle | Short celebratory burst | "Ab samjha!" payoff | ★★ | `effects/confetti.html`, `sparkle-burst.html` | ✓ |
| Shooting stars | Streaks across the top third | opening title | ★ | `effects/shooting-stars.html` | ✓ |
| Receipt printer | List prints line by line | "kitna kharcha?" lists | ★★ | GSAP paper roll | |
| Prompt bar | Typing into an AI-style prompt box | AI/tech stories | ★★ | HF `typed-prompt` | |
| Jiggle delete | Item jiggles then pops away | "ye galat hai" jokes | ★★ | `physical-exit` + wiggle | |
| Comment CTA | "Comment karo: tum kis side ho?" card | ending (once) | ★★ | `yt-comment-card` | |
| Film look | Grain, light leak, warm grade | flashback / history | ★ | `grain-overlay`, `light-leak` | |

## Default picks (when unsure)
Hook: kinetic hook (or breaking strip for news) · Section: mood curtain or intertitle · Numbers: odometer stat → data chart · Lists: icon strike · Verdict: serif stamp · Clip breakdown: video card + live markup · Place: map ping · Ending: magazine cover or comment CTA (once).

## HyperFrames registry
For first builds look in `/hyperframes:hyperframes-registry` (needs the HyperFrames plugin — the user installs it from `/plugin`, marketplace `heygen-com/hyperframes`). Take the motion idea, not the demo card. Without the plugin, write the GSAP timeline by hand following `pod-effects`.

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
