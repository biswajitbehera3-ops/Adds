---
name: pod-package
description: >-
  Get a finished episode or Short ready to upload: title + thumbnail text (yt-package), description, chapters and tags (yt-seo, yt-chapters), the thumbnail itself from the character expression sheets, and the upload checklist (AI disclosure, not Made for Kids). Use after the review gate passes, or for "title and thumbnail", "get it ready for YouTube".
---

# pod-package — ready to upload (the user uploads)

1. Title + thumbnail text as one pairing: `/yt-package` (script as context).
2. Description, search phrases, tags: `/yt-seo`; chapters (long-form): `/yt-chapters`.
3. **Thumbnail (1280x720):** the two hosts' faces with strong, readable expressions from the character sheets (`podcast/assets/characters/*/sheet/expressions/`) — shock/eureka/smug read best at feed size — on a simplified studio or flat brand background, 2-4 words of text (amber/white, ink outline), one visual of the story (a plane, a car, a chart). Build as a Remotion still or HTML still; make 2-3 variants; check at ~250 px wide that the text and faces still read. Text must be true to the video.
4. Write `upload.md` in `podcast/finished/<Episode title>/`: title (+2 alternates), description with chapters + sources list, tags, thumbnail files, and the checklist:
   - Audience: **not Made for Kids**.
   - **Altered or synthetic content: Yes** — the hosts are AI-animated (and any realistic AI recreation of real events).
   - Sources linked in the description for every number/claim.
   - Third-party clips: short, commented, credited.
   - Category: News & Politics / Education / Science & Technology as fits.

Nothing is uploaded by these skills — the user publishes.

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
