---
name: pod-manim
description: >-
  Precise data and diagram animations with Manim (Community Edition 0.22) for explainers - bar/line charts, number comparisons, timelines, flow diagrams, maps-as-shapes, physics/tech diagrams (how a rocket stage separates, how a battery charges). Use automatically when a moment explains numbers, a process or a mechanism, or for "chart", "graph", "diagram animation".
---

# pod-manim — data & diagrams

Env: `podcast/tools/manim-env` (Python venv, git-ignored). Scenes: `podcast/manim/scenes/`; renders: `podcast/manim/renders/` (git-ignored). Brand test: `scenes/test_bars.py` (NewsBars).
Rebuild the env in a fresh session:
```bash
apt-get install -y libpango1.0-dev libcairo2-dev pkg-config
python3 -m venv podcast/tools/manim-env && podcast/tools/manim-env/bin/pip install manim
```
No LaTeX → use `Text(...)`, not `MathTex`.

## When to use which tool
| Moment | Tool |
|---|---|
| Real numbers over time, comparisons, percentages, timelines, mechanisms/diagrams | **Manim** |
| Punchy stat, kinetic words, celebratory effects | HyperFrames (`pod-effects`) |
| Captions, layering, camera cuts on the studio plate | Remotion (`podcast/remotion`) |

## Brand
Background ink `#111418` (or transparent for overlays); amber `#FFC83D`, teal `#2EC4B6`, news red `#FF4D4D`, paper `#F6F1E7`; font `Inter Display Black`. One idea per beat, hold the key number ≥ 1 s, highlight the one bar that matters. Label the source on screen ("Source: FAA, 22 Nov 2026"). Demo data must say DEMO.

## Commands
```bash
cd podcast/manim
../tools/manim-env/bin/manim -qh --media_dir renders scenes/<file>.py <Scene>                  # 1080p60
../tools/manim-env/bin/manim -qh -r 1080,1920 --media_dir renders scenes/<file>.py <Scene>      # vertical
../tools/manim-env/bin/manim -qh -t --format=webm --media_dir renders scenes/<file>.py <Scene>  # transparent overlay
```
Check 3-4 frames with ffmpeg before using: numbers right, text spelled right, nothing clipped.

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
