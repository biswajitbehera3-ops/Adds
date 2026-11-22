---
name: pod-sound
description: >-
  Sound pass for podcast edits: voice loudness to -14 LUFS, voice clarity, background music bed and sound effects (Epidemic Sound or other licensed sources), ducking under dialogue. Use after captions, or for "add music", "sound effects", "the voice is too quiet", "fix the audio".
---

# pod-sound — voice, music, effects

- **Voice first.** Measure: `python3 -I podcast/tools/pod.py audio <file>`. Normalise the final mix: `pod.py loudnorm in.mp4 out.mp4` (-14 LUFS, true peak -1.5). TTS voices are clean — don't denoise them; do even out the two hosts' levels (±1 dB) before mixing.
- **Sources (in order):**
  1. **Epidemic Sound** (connected in this app, if the user's subscription is active): `SearchSoundEffects` (whoosh, pop, ding, record scratch, crowd laugh — max 3000 ms) and `SearchRecordings` (`vocals: false` under talking; moods: curious, upbeat, tense news). Shortlist 3 per need with title + length; **ask before downloading**; save to `podcast/audio/sfx/` / `podcast/audio/music/` and log each file in `podcast/audio/LICENSES.md` (title, id, date). Remind once that the YouTube channel must be cleared in their Epidemic account.
  2. YouTube Audio Library files the user downloads, or other music they have rights to.
  Never pull music from other videos or random sites. No music files? Render without music and say so.
- **Mix:** music 0.08-0.12 under dialogue (brand kit `music.volume`), ducked another ~6 dB while someone talks (ffmpeg `sidechaincompress`); music up only in the cold open, transitions and end card.
- **SFX:** on graphic entries (pop), reveals (ding), transitions (whoosh), jokes (sparingly). Max one every ~2 s; never over a key word. A "ba-dum-tss" or record scratch on a roast lands — once per episode, not every joke.

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
