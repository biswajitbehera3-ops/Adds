---
name: pod-style-caption
description: >-
  Caption-led edit style for Shorts and clips: the hosts with big, centred, word-by-word highlighted Hinglish captions as the main graphic, a hook title in the first seconds and popups for key words or numbers. The default style for Shorts. Use when the style is caption or a Short is being made.
---

# pod-style-caption

- Captions: `pod-captions` with `--max-words 3` (Shorts) — active word in the speaker's colour, others white, thick ink outline, uppercase.
- Opening: kinetic hook (`pod-effects` kinetic-hook template) over the first 1.5-3 s — the hook in 2-4 words; it must make sense with no context.
- Key numbers: odometer stat; key names/terms: icon strike or a small popup, timed to the spoken word, top band, away from faces.
- Camera: cut between `Cam-geniusVertical` / `Cam-questionerVertical` on speaker change, or `Cam-stackedVertical` for fast back-and-forth; one punch-in on the punchline.
- Pace: no gap > 0.4 s between lines in a Short; one sparkle/confetti max, on the payoff only.

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
