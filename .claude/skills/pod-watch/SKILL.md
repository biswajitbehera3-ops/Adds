---
name: pod-watch
description: >-
  Look at a video by turning it into timestamped contact sheets (12 frames per sheet plus scene-change times) and reading them. Use whenever a step needs to see what is on screen - checking a generated clip, reviewing a render, planning graphics, picking Shorts or thumbnail frames - or for "watch this", "what happens in this clip".
---

# pod-watch — see the video

```bash
python3 -I podcast/tools/pod.py watch <video> [--every 1] [--out dir]
```
Writes `<out>/sheet_###.jpg` (4x3 grid, timestamp burned into each cell) and `frames.json` (sheet list + `sceneChanges`). Default out: `<video>-watch/` — use the scratchpad for throwaway checks.

## How to read
1. Read every sheet with the Read tool, in order. Long videos: raise `--every` (2-4 s for > 5 min) rather than skipping sheets.
2. For each sheet note: which host is on screen and how big, expression/lipsync state, what changes, anything off — face drift between shots, warped glasses/hands, flicker, frozen frames, text cut off, graphics over a face.
3. Pair what you see with the script/TTS timings — a cut or a graphic is decided by sound and picture together.
4. Need detail on one moment? `ffmpeg -ss T -i file -frames:v 1 -update 1 out.jpg`, or re-run `watch` with `--every 0.25` on a short `pod.py clip`.

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
