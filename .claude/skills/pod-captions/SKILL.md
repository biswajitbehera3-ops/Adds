---
name: pod-captions
description: >-
  Word-by-word Hinglish captions for episodes and Shorts: build timed caption groups from the script and the TTS line timings, colour the active word by speaker (Genius amber, Questioner teal), check spelling and placement, render as a transparent layer. Use in every edit that shows speech as text, or for "add captions", "subtitles", "fix the captions".
---

# pod-captions — words on screen

## 1. Timings
We know the exact words (it is our script), so captions come from the script, not from speech recognition:
```json
[{"who":"questioner","start":0.2,"end":2.0,"text":"Seedha bolo, hua kya?"},
 {"who":"genius","start":2.2,"end":5.4,"text":"Ruko ruko, pehle samjho ground stop hota kya hai."}]
```
`start/end` = each line's span in the final audio (from the TTS segments / silence gaps: `pod.py audio` lists silences). Text in **Roman Hinglish** even though the TTS reads Devanagari.
```bash
python3 -I podcast/tools/pod.py captions script_ep03.json ep03 --max-words 4 --format long   # 3-4 Shorts, 4-6 long-form
```
→ `podcast/remotion/public/captions/ep03.json` (word times are spread by word length inside each line — good enough for highlighting; nudge `s/e` by hand on long words if a highlight runs early/late).

## 2. Correct every group
- Spelling: one consistent Roman Hinglish spelling per word across the channel (hai/hain, kya, nahi); English terms spelled correctly; names and numbers exactly as sourced.
- Never add words the hosts don't say; never "improve" the line in captions.
- Drop pure noise ("hmm") unless it's the joke.
- Placement: bottom band (long-form `paddingBottom 90`, Shorts 520 — clear of the Shorts UI). If it covers a face or a graphic, move the graphic, not the caption.

## 3. Render
```bash
cd podcast/remotion
npx remotion still PodCaptions /tmp/c.png --props='{"file":"ep03"}' --frame=100 --scale=0.5 --browser-executable=/opt/pw-browsers/chromium   # check
npx remotion render PodCaptions podcast-captions-ep03.webm --props='{"file":"ep03"}' --codec=vp9 --pixel-format=yuva420p --image-format=png --browser-executable=/opt/pw-browsers/chromium
```
Then `pod.py overlay` onto the episode (or nest `<PodCaptions>` in the episode composition).

## House rules (every pod-* skill)
- Paths are from the repo root. Show identity, voice and audience: `podcast/youtube/voice.md`. Colours, fonts, loudness: `podcast/brand/brand-kit.json`.
- The hosts are AI characters: never present AI visuals as real footage; label recreations. No invented facts, numbers or quotes — every on-screen number needs a source.
- Free first: everything here runs locally (ffmpeg, Remotion, HyperFrames, Manim). Higgsfield is paid — quote the cost and wait for a yes (CLAUDE.md).
- Remotion and HyperFrames need the local browser here: Remotion `--browser-executable=/opt/pw-browsers/chromium`; HyperFrames `PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (pod.py sets it).
- Say which pod-* skills you used.
