---
name: pod-effects
description: >-
  After-Effects-style animated overlays for podcast edits, made with HyperFrames and rendered as transparent WebM clips - kinetic hooks, odometer stats, confetti, sparkles, shooting stars, transitions, hand-drawn markup, Lottie. Use for "add an effect", "add confetti", "make the number roll", "make it look like After Effects", or when a pod-motion-library style needs building.
---

# pod-effects — HyperFrames overlays

Project: `podcast/effects/` (HyperFrames 0.8.147, **1920x1080**, GSAP vendored at `assets/gsap.min.js` — no CDN). Effects: `podcast/effects/effects/<name>.html`; renders: `podcast/effects/renders/` (git-ignored).

## Use an existing effect
```bash
ls podcast/effects/effects/
python3 -I podcast/tools/pod.py fx confetti                       # -> podcast/effects/renders/confetti.webm (alpha)
python3 -I podcast/tools/pod.py overlay episode.mp4 podcast/effects/renders/confetti.webm --at 42.5 out.mp4
```
Available: **kinetic-hook** (template: edit the words), **odometer** (template: edit TARGET/LABEL), **confetti** (3 s), **sparkle-burst** (2 s), **shooting-stars** (3.5 s).
Templates: copy to a new file per use (`effects/hook-ep03.html`) and edit the text — don't overwrite the template.

## Make a new effect
1. Ready-made first: `/hyperframes:hyperframes-registry` (plugin) — `cd podcast/effects && npx hyperframes add <name>`.
2. Write `effects/<name>.html` as a **full-frame transparent** composition, copying `effects/confetti.html`:
   - `html, body { background: transparent; width: 1920px; height: 1080px }` (1080x1920 for a Shorts-only effect)
   - `<script src="../assets/gsap.min.js">`; root `<div data-composition-id="main" data-start="0" data-duration="N" data-width=… data-height=…>`
   - one paused GSAP timeline on `window.__timelines["main"]`; seeded random only; local assets only (`podcast/effects/assets/`).
   - Brand colours from the brand kit (amber `#FFC83D`, teal `#2EC4B6`, news red `#FF4D4D`, ink `#111418`), font Inter Display Black.
3. Render + check over the studio plate (not over black — alpha mistakes hide on black):
```bash
python3 -I podcast/tools/pod.py fx <name> --out /tmp/t.webm
ffmpeg -loglevel error -y -loop 1 -i podcast/assets/studio/studio_4k_v1.jpg -c:v libvpx-vp9 -i /tmp/t.webm \
  -filter_complex "[0:v]scale=1920:1080[b];[b][1:v]overlay=shortest=1,trim=start_frame=40:end_frame=41,scale=960:-1" -frames:v 1 -update 1 /tmp/t.jpg
```
4. Add it to the catalogue row in `pod-motion-library` (Built ✓).

## Lottie
After Effects → Bodymovin → Lottie JSON in `podcast/effects/assets/`; lottie-web with `autoplay:false` driven by the timeline. HyperFrames cannot open `.aep`. Check the licence of LottieFiles downloads.

## Rules
1-3 s, no strobe, never over a host's face, max one effect per ~8 s, only on real beats (the reveal, the punchline, the number). HyperFrames sends anonymous usage counts: `npx hyperframes telemetry disable` (user's choice).

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
