---
name: ad-teardown
description: "Reverse-engineer a competitor's video ad from its URL — pull the transcript, extract the frames, and dissect the hook, structure and psychology against the ad-strategist playbook. Use whenever the user supplies a YouTube, Instagram, TikTok, Facebook or Meta Ads Library video link and wants to know why it works, what its hook is, how it is structured, or how to beat it. Trigger on 'analyse this ad', 'tear down this video', 'why does this ad work', 'break down this creative', 'what's the hook here', 'reverse engineer this ad', or a bare competitor video URL pasted with an ads question. Requires yt-dlp and ffmpeg installed locally and unrestricted network access."
---

# Ad Teardown

Turns a competitor's video ad into a structural analysis you can write against.

This skill exists because `ad-strategist` Section 9 requires downloading and transcribing a
competitor's winning ad — and nothing else in the project can do it. It chains `yt-dlp`
(fetching), `ffmpeg` (frame extraction) and `ad-strategist` (the analysis) into one pass.

**Claude cannot watch video.** It reads still images. So the whole method rests on turning a
video into (a) a transcript and (b) a set of frames that can be read as images.

## Requirements

- `yt-dlp` — `brew install yt-dlp`
- `ffmpeg` — `brew install ffmpeg`
- Unrestricted network access. This does **not** work in a cloud session where the egress
  policy blocks video hosts; it is a local-machine capability.

## Step 1 — Transcript first, and usually without downloading anything

Most YouTube ads carry auto-captions. Pull those alone before touching the video file — it
is seconds instead of minutes, and often the transcript is all that is needed.

```bash
yt-dlp --skip-download --write-auto-subs --write-subs \
       --sub-langs "en.*" --sub-format vtt \
       -o "%(title)s.%(ext)s" <URL>
```

Read the `.vtt`. It carries timecodes, which matter — the first three seconds are where the
hook lives, and the timecodes show exactly what was said inside them.

If no captions exist, download the audio and transcribe it with whatever local
transcription tool is available:

```bash
yt-dlp -f bestaudio -x --audio-format mp3 -o "ad.%(ext)s" <URL>
```

## Step 2 — Get the video, then turn it into frames

```bash
yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" -o "ad.%(ext)s" <URL>
```

Extract two sets. **The hook set matters most** — the opening seconds decide everything, so
sample them densely:

```bash
mkdir -p frames
# hook: first 5 seconds at 2 frames per second
ffmpeg -i ad.mp4 -t 5 -vf fps=2 -q:v 2 frames/hook_%02d.jpg
# structure: one frame every 2 seconds across the whole ad
ffmpeg -i ad.mp4 -vf fps=0.5 -q:v 2 frames/beat_%03d.jpg
```

Then **read the frames as images**. The hook frames answer what the pattern interrupt is;
the beat frames answer how the ad is built.

Useful extras:

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 ad.mp4   # exact runtime
ffmpeg -i ad.mp4 -vframes 1 -q:v 2 first_frame.jpg                 # the thumbnail
```

## Step 3 — The teardown

Analyse against `ad-strategist`. Do not summarise the ad — dissect it. Answer, in this order:

1. **First 3 seconds.** What is on screen at frame one? What is said? Is the product visible
   or named? (Section 5.2 — if the product appears early, note it as a weakness.)
2. **The hyperdopamine test** (Section 3). Pattern interrupt, burning intrigue, specific
   benefit — score all three, and say which is missing.
3. **Awareness level targeted** (Section 2). Does the opening address unaware,
   problem-aware, solution-aware, product-aware or most-aware?
4. **The means-end ladder** (Section 5.3). Which layer does it sell on — attribute,
   functional consequence, or identity? Most ads stall at layer 1.
5. **Structure.** Map the beats with timecodes: hook, problem, story, payoff, CTA.
   Note where each cut lands and how long each beat runs.
6. **Credential signals** (Section 5.4). Any authority marker in the first two seconds?
7. **Shareability** (Section 5.5). Can the premise be explained in one sentence? What does
   sharing it let the sharer say about themselves?
8. **Where the CTA sends traffic** — own site, WhatsApp, app, a form. That reveals whether
   it is a traffic or a conversion campaign.
9. **The gap.** What is this ad *not* doing? That is the brief for the ad that beats it.

## Step 4 — Output

Deliver a teardown that can be written against, not a review:

- **Timecoded beat table** — time, what is on screen, what is said
- **Hyperdopamine scorecard** — the three ingredients, pass or fail each
- **The one thing that makes it work** — a single sentence
- **The gap** — the specific opening for a competing ad
- **Steal list** — the structural devices worth reusing (Section 5.1 says steal the format,
  never the topic)

## Handling multiple ads

When tearing down several ads from one brand, extract only the hook frames for each, compare
the openings side by side first, then go deep on whichever is structurally strongest. Brands
repeat their winners — a hook that appears across several ads is one that survived testing.

## Guardrails

- Competitor footage is research material. It informs the brief; it never appears in
  anything produced or shipped.
- Never state that an ad is a proven winner on the basis of its content. Longevity and
  repetition across an account are the evidence for that, and they come from the Meta Ads
  Library, not from the video file.
- Delete downloaded video once the teardown is written. The transcript, the frames and the
  analysis are what have lasting value.
