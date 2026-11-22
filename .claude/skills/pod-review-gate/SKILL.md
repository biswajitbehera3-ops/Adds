---
name: pod-review-gate
description: >-
  Final review gate for episodes and Shorts: automatic checks (black or frozen frames, loudness, frame size, Shorts length) plus a frame-by-frame visual review of the render - character consistency, lipsync, captions, graphics placement, fact labels. Use after every render, or for "review the video", "is it ready".
---

# pod-review-gate — nothing ships unchecked

## 1. Automatic checks
```bash
python3 -I podcast/tools/pod.py check <render.mp4>                              # PASS / FIX NEEDED table
python3 -I podcast/tools/pod.py watch <render.mp4> --every 1 --out <dir>/watch-render
```
## 2. Visual review
Read every sheet (`pod-watch`) and fill a findings table (timestamp · problem · fix):
- **Characters:** same face/hair/glasses/outfit as the locked references (`podcast/assets/characters/*`) in every shot; no warped glasses, extra fingers, melting faces; expressions match the line.
- **Lipsync:** mouth moves on speech, closed in silence, right host talking.
- **Captions:** right words, consistent Hinglish spelling, speaker colour correct, not on a face, not cut off (also mid pop-in), in sync.
- **Graphics:** right moment, right number, sourced, inside safe zones, not over faces; "REPORTED/CONFIRMED" labels on breaking news; AI recreations labelled.
- **Edit:** no jumpy micro-cuts, no clipped words, no black/frozen frames, end card present.
- **Rights:** viral clips short + commented + credited; music licensed (`podcast/audio/LICENSES.md`).
A second opinion: spawn a reviewer agent (Agent tool) with the sheet paths, script and this checklist only if the user asks for one — otherwise do the review yourself. Never skip it.
## 3. Decide
Fix every FIX at the step that owns it, re-render, re-run the gate. Write `review.md` next to the render: checks, findings, fixes, verdict. Send the user the video + a 3-line summary; they decide if it ships.

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
