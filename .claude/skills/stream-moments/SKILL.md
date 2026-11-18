---
name: stream-moments
description: Find the big moments in a long GTA 6 stream (Twitch, Kick or YouTube VOD, or a local file) by listening to the streamer and reading chat. It finds shocks, fails, a hard part finally cleared, discoveries and funny bits, then writes a ranked moment list plus intel-log rows for our own videos. Use for "find the moments in this stream", "what happened on Lacy's stream", "where did chat explode", "what part are streamers failing", or stream research during GTA 6 launch week.
---

# stream-moments

`moments.py` listens to a stream and ranks the moments worth knowing about. It is a **research tool** for
`production/stream-intel-plan.md`: we learn what surprised, broke or delighted streamers, then make **our own** video
about it. We never post their footage unless they allow clipping.

## Run it

```bash
python3 .claude/skills/stream-moments/moments.py SOURCE -o OUTDIR --who "Lacy" [--chat CHAT.json] [--start 1:30:00 --end 3:00:00]
```

| Flag | What it does |
|---|---|
| `SOURCE` | Local video/audio file, or a VOD URL (pulled with `yt-dlp -g`, so nothing big is downloaded) |
| `--chat` | TwitchDownloader JSON, yt-dlp `*.live_chat.json` (YouTube), or a CSV with seconds. Strongly recommended |
| `--markers` | One timestamp per line: viewer clips or moments you noted |
| `--start/--end` | Scan only part of a long VOD |
| `--model` | Whisper size: `base` (fast), `small` (default, better). English uses the cached `.en` models |
| `--full` | Transcribe everything. By default streams over 45 min are only transcribed around the 40 loudest spots |
| `--top 10 --gap 30` | How many moments, and the minimum seconds between them |
| `--pre 15 --post 6` | Cut window around each peak, snapped to sentence ends |
| `--cut` / `--sheet` | Cut clips / make a contact sheet. **Only for streamers in `tools/allowed_streamers.txt`** |

Getting chat: TwitchDownloader (Chat Download → JSON) for Twitch; `yt-dlp --skip-download --write-subs --sub-langs live_chat URL` for YouTube.

## How it scores
`3×loudness + 3×silence-then-burst + 2×trigger phrases + 2×chat spike + 3×viewer marker`. Types:
- **SHOCK**: "no way", "wait what", "oh my god", "are you serious", "oh teri"…
- **FAIL**: "no no no", "I'm dead", "are you kidding", "not again", "mar gaya", "phir se"…
- **CLEARED**: a WIN ("let's go", "finally", "we did it") after 3+ fails in the 15 minutes before it. This shows the *hard part* and how many tries it took
- **DISCOVERY**: "look at this", "they actually", "did you see", "the detail", "yeh dekho"…
- **FUNNY**: laughing words, plus KEKW/LUL/😂 in chat
- **LOUD**: loud but no trigger words. Listen before you trust it

Single common words ("what", "why", "bro") are not triggers on purpose: they fire constantly.

## Outputs (in OUTDIR)
- `moments.md`: a ranked table with the peak, cut window, type, why it scored, what was said, and a video idea.
- `moments.json`: the same data, plus `fails_before` for CLEARED moments.
- `intel_rows.md`: rows ready to paste into `research/stream-intel/YYYY-MM-DD.md`. Fill in "what happened" in our words and the spoiler level.

## Rules (from `production/do-not-post-rules.md` and the stream-intel plan)
1. **Research ≠ reposting.** For our videos, describe the moment and show it with our own capture or graphics. Credit the streamer by name.
2. **A game fact needs 2+ streams** (the SEEN IN-GAME tier). One stream means "we saw it once".
3. **Never use** leaks, the ending or story reveals, cutscenes alone, or in-game TV shows alone. In week 1, use early game and systems only.
4. `--cut` is only for streamers who allow clipping, and every cut gets watched before it goes anywhere.

## Tested (17 Nov 2026)
- **Test input:** a synthetic 6-minute stream (Kokoro voices, game-noise bed, a TwitchDownloader-format chat) with 7 planted moments: shock after silence, three fails, a clear, a discovery and a laugh.
- **Results:**
  - All 7 were found with the right types.
  - CLEARED counted "4 tries".
  - The same chat in YouTube live_chat format gave the same top 4.
  - `--cut` produced 16–22 s clips.
- **Speed:** about 35 s on 4 CPUs with `base`. Expect about 4–6 min of compute per hour of stream with `small` in fast mode.

## No audio? Use the transcript mode (cloud container)
In this cloud container, Twitch and Kick are blocked and YouTube downloads are bot-checked. `transcript_moments.py` works from the
**timed captions and comments** of an uploaded YouTube VOD or reaction video, which the Firecrawl Alexandria `youtube-com` provider fetches
(`videos/video_transcript`, `videos/video_comments`, about 5 credits each):

```bash
python3 .claude/skills/stream-moments/transcript_moments.py transcript.json --comments comments.json --who "Lacy" --url https://youtu.be/ID -o OUT
```

- **Scores:** trigger phrases per 20 s window, `[Laughter]` tags, and viewer comments that quote a timestamp ("3:45 when he…").
- **CLEARED:** the same 3-fails rule as the audio tool.
- **Outputs:** `moments.md` with a `?t=` link per moment, plus `intel_rows.md`.
- **Tested 18 Nov:** all 6 planted moments found, and a live Alexandria transcript fetch worked.
- **Limits:** auto-captions miss shouting, so read the caption text around each moment.
