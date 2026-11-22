# gugu skills bundle (2026-11-14) — what was done with it

**Installed 2026-11-22 as `pod-*` skills** (renamed, rewritten for the podcast + Linux): pod-motion-library, pod-effects, pod-captions, pod-style-caption, pod-sound, pod-review-gate, pod-manim, pod-shorts-export, pod-watch, pod-render, pod-package. The table below is kept as the record of where each came from.

Bundle zip: the user's upload `gugu-skills-bundle-2026-11-14.zip` (re-upload if needed).
They were built for the kids' channel on a Mac, so each must be **rewritten for the podcast and for Linux** before use.

## Ported (now pod-*)
| Skill | Why it's useful here |
|---|---|
| `gugu-motion-library` | ~40 named motion-graphics styles (kinetic hook, title card dive, gravity drop, knockout/giant captions, mood curtain, intertitle, magazine cover, picture dive, odometer, icon strike, grease pencil…) for the explainer graphics |
| `gugu-effects` | After-Effects-style overlays via HyperFrames: confetti, sparkles, light leaks, transitions, Lottie |
| `gugu-captions` + `gugu-style-caption` | Word-by-word highlighted captions (needs Hinglish rework) |
| `gugu-sound` | Loudness to -14 LUFS, music bed, SFX, voice clarity |
| `gugu-review-gate` | Auto checks after render: black frames, loudness, text over faces + frame-by-frame visual review |
| `gugu-manim` | Precise diagrams/number animations (Manim) for news data |
| `gugu-shorts-export` | Cut Shorts out of a long episode and run them through the pipeline |
| `gugu-watch` | Turn a video into contact sheets to "see" it (needs the Mac-only vision tool replaced with ffmpeg) |
| `gugu-render` | Remotion render with still checks first |
| `gugu-package` | Upload kit: title, thumbnail, description, tags (pairs with yt-package / yt-seo) |

## Not useful for this channel
`gugu-privacy` (child privacy blur), `gugu-omni-restyle` / `gugu-style-layered-head` / `gugu-style-whiteout` (cut-outs of real camera footage), `gugu-broll-*`, `gugu-screen-capture`, `gugu-resolve` (DaVinci on Mac), `gugu-take-geometry`, `gugu-rough-cut` / `gugu-cut-audit` (real-footage editing), `gugu-style-vlog`, `gugu-style-card-list`, `gugu-style-long-form`, `gugu-style-broll`, `gugu-asset-plan`, `gugu-edit`, `gugu-design-assets`, `gugu-gen-video` (we already have the Higgsfield rules in CLAUDE.md).

## Plugin
**HyperFrames** (21 `hyperframes:*` skills) — the user installs it from Claude Code's `/plugin` menu (marketplace `heygen-com/hyperframes`). Needed only when porting `gugu-effects` / `gugu-motion-library`.
