---
name: pod-shorts-export
description: >-
  Make vertical Shorts from a long episode: find self-contained 20-60 s moments with yt-shorts, cut them to 9:16, give each its own hook and captions, and check them. Use for "make shorts from this episode", "clip this", "repurpose".
---

# pod-shorts-export — Shorts from episodes

1. Find moments: `/yt-shorts` with the episode script/transcript → top 3-5 spans (20-60 s, one complete idea, ends on a punchline or the "ab samjha" line). Prefer moments with a host-vs-host exchange — the double act is the hook.
2. Cut each:
```bash
python3 -I podcast/tools/pod.py clip episode.mp4 --start 120.4 --end 161.0 short1.mp4 --vertical
```
   `--vertical` is a centre crop — usually wrong for a two-host wide shot. Better: re-render the span from Remotion with `Cam-geniusVertical` / `Cam-questionerVertical` / `Cam-stackedVertical` so the speaking host is framed.
3. New hook for each Short (a kinetic hook in the first 2 s) — the episode's context isn't there. Then `pod-style-caption`, `pod-sound`, `pod-review-gate`, and `/yt-package` for its title.

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
