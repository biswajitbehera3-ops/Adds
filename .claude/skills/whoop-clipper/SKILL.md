---
name: whoop-clipper
description: "Turn long video into short vertical clips worth posting — pick the moments against hook psychology, cut them, caption them, and score them before they ship. Two paths: Higgsfield's automated clipper for YouTube sources, or yt-dlp plus ffmpeg for local files and exact timestamps. Use whenever the user wants clips, shorts, reels, or TikToks cut from a longer video, asks which moments of a video are worth clipping, or says 'clip this', 'make shorts from this', 'cut this into reels', 'whoop clipper'. Not for generating new AI video — that is ugc or cinema-director-v3."
---

# Whoop Clipper

Long video in, short vertical clips out. The cutting is the easy half — any tool can slice a
podcast into ten pieces. The half that decides whether a clip performs is **which moments get
cut**, and that judgement comes from `ad-strategist`, not from an algorithm.

## Two paths

**Automated — Higgsfield `personal_clipper_create`.** Give it YouTube URLs, a clip count
(1–20), an aspect ratio and a subtitle font; it returns finished clips with burned captions.
Long-running — 30+ minutes is normal, so start it and do something else.

**Manual — `yt-dlp` + `ffmpeg`.** For local files, non-YouTube sources, or when a specific
moment must be cut to the second. Slower to set up, total control.

Route on the source: YouTube URL and no strong opinion about exact timings → automated. A
local file, a precise in-point, or an unusual crop → manual.

## Choosing the moments — the part that matters

Never accept an automatic selection without checking it. A clipper finds moments that look
structurally interesting; it does not know what stops a thumb. Run every candidate against
the hyperdopamine test from `ad-strategist` Section 3:

1. **Pattern interrupt** — does the first frame break the feed? A talking head at a desk does
   not. A hand holding something strange, a reaction mid-flinch, an object in the wrong place
   does.
2. **Burning intrigue** — does the opening line open a loop the brain cannot leave? A clip
   starting mid-sentence on a claim outperforms one starting at the polite beginning of a
   thought.
3. **A specific benefit or payoff** — the loop has to close inside the clip. A clip that only
   teases and never pays off reads as a bait and gets scrolled.

Two more from Section 5 worth applying:

- **The product must not appear in the first two seconds** (5.2). The moment a viewer tags a
  clip as an ad, they leave.
- **Shareability is about the sharer** (5.5). Ask what someone gets to say about themselves by
  posting it. A clip that makes the sharer look informed travels; one that only flatters the
  speaker does not.

**Cut in on the strongest line, not on the setup.** The single most common failure in
auto-clipping is starting three seconds too early. Trim the run-up ruthlessly — the first
word should already be the interesting one.

## Manual path — commands

```bash
# fetch the source
yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" -o "source.%(ext)s" <URL>

# pull the timed transcript to find moments by text rather than by scrubbing
yt-dlp --skip-download --write-auto-subs --sub-langs "en.*" --sub-format vtt <URL>

# cut one clip — -ss before -i seeks fast, -c copy avoids re-encoding
ffmpeg -ss 00:04:12 -i source.mp4 -t 38 -c copy clip_01.mp4

# crop 16:9 to a 9:16 centre frame
ffmpeg -i clip_01.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy clip_01_vertical.mp4
```

The transcript is the fast way in. Read the `.vtt`, find the lines that carry the hook, and
cut from the timecode of the strongest sentence — not from where the topic started.

Off-centre subjects need the crop nudged: `crop=ih*9/16:ih:x_offset:0`.

## Scoring before publishing

`virality_predictor` scores a finished clip for hook strength, retention risk and engagement.
Worth running on the two or three best candidates before committing to a posting schedule —
it is cheaper to learn a clip is weak before it goes out than after.

## Cost discipline

`personal_clipper_create` exposes no cost preflight, unlike `generate_image` and
`generate_video`. That means the first run's price is genuinely unknown.

Per `CLAUDE.md`: post an estimate and the current `balance` before starting, get an explicit
go-ahead, then reconcile against `transactions` immediately after so every later quote is
calibrated against a real number. Say plainly that the first estimate is an estimate.

The manual `yt-dlp` and `ffmpeg` path costs nothing. When budget is tight, cut manually and
spend credits only on generation.

## Delivery

For each clip: the source timecode, the opening line verbatim, why it was chosen against the
three tests above, and the file. A clip list with reasons is reviewable; a folder of MP4s is
not.

## Guardrails

- Clip only footage there is a right to use — own content, a client's own content, or material
  with clear permission. Competitor footage torn down under `ad-teardown` is research and does
  not get reposted.
- Never let an automatic selection ship unreviewed. The tool proposes; the strategist decides.
