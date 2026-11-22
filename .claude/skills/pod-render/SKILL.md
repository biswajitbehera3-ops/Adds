---
name: pod-render
description: >-
  Render podcast compositions with Remotion (studio camera setups, captions, overlays) into finished videos, with still checks first, then composite HyperFrames/Manim layers and normalise loudness. Use for "render", "export", "make the final video".
---

# pod-render — export

Project: `podcast/remotion` (Remotion 4). Always pass `--browser-executable=/opt/pw-browsers/chromium` (the default browser download is blocked here).

1. **Stills first** (fast): one frame per section, each special overlay, the end card.
```bash
cd podcast/remotion
npx remotion still <Comp> /tmp/f.png --frame=<N> --scale=0.5 --props='{...}' --browser-executable=/opt/pw-browsers/chromium
```
   Look at them (Read). Faces not covered, captions in the safe band, numbers right.
2. **Full render** (background for > 1 min):
```bash
npx remotion render <Comp> out/<name>.mp4 --props='{...}' --browser-executable=/opt/pw-browsers/chromium
```
   Transparent layers: `--codec=vp9 --pixel-format=yuva420p --image-format=png` to .webm.
3. **Composite** effect/chart layers: `python3 -I podcast/tools/pod.py overlay base.mp4 layer.webm --at S out.mp4` (one per layer), then **loudness**: `pod.py loudnorm`.
4. Output: 1920x1080 (episodes) / 1080x1920 (Shorts), 30 fps, H.264, -14 LUFS. Finished files go in `podcast/finished/<Episode title>/`.

Then always `pod-review-gate` — a render is never final before the gate passes.

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
