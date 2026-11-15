# GTA 6 launch-week clipping plan: find the shock, the struggle and the "cleared it" moments in streams

Goal: from 18–21 Nov, pull the best **reaction moments** out of streamers' GTA 6 VODs automatically, then post them two ways:
1. **Paid campaigns:** clips for streamers who pay per view (Content Rewards, Vyro, Kick's program, Discord programs; see `research/clipping/`).
2. **Our channel:** Shorts built around a moment, e.g. "How he finally cleared the first heist" or "The first-mission moment that broke the stream".

Everything below is free and runs locally. No Higgsfield credits; transcription uses local faster-whisper, not paid ElevenLabs Scribe.

---

## 1. The moments we hunt

| Type | What it sounds like | Short format |
|---|---|---|
| **SHOCK** (first mission / story surprise) | quiet → sudden burst; "no way", "WHAT", "oh my god", "bro…", "nah nah nah" | "The moment GTA 6 shocked [streamer]" |
| **STRUGGLE → CLEARED** (obstacle beaten) | repeated fails ("again?!", "how", deaths, retries) and later a release ("LET'S GO", "finally", "YES") | "It took him 9 tries to clear this. Here's how" (fail montage → the move that worked) |
| **FAIL / CHAOS** | screams, laughing, "I'm dead", "the cops", "helicopter" | "GTA 6 police are NOT playing" |
| **DISCOVERY** (detail / easter egg) | "look at this", "they actually…", "wait, you can…", "this is insane" | "Streamers just found this in GTA 6" |
| **FUNNY** | sustained laughter, chat "KEKW/OMEGALUL" spike | "[streamer] can't stop laughing at…" |

## 2. The detector (our skill stack, free)

```
VOD link ─► audio only (yt-dlp / TwitchDownloader) ─► faster-whisper (word timestamps)
         └► chat log (TwitchDownloader chatdownload) + viewer-made Twitch clips (timestamps)
                    │
        score every 1-second window:
          loudness spike vs the streamer's own rolling median (ffmpeg ebur128)   ×3
          silence (≥2 s) then a burst = shock signature                           ×3
          trigger words (shock / fail / win / discovery lists below)              ×2
          chat messages per second vs median + emote type (KEKW, W, L, OMEGALUL) ×2
          a viewer clipped this moment on Twitch                                   ×3
                    │
        top 10 peaks ─► widen each to its story: 8–20 s setup before the peak,
                        3–6 s payoff after it, cut on sentence boundaries
                    │
        classify (SHOCK / STRUGGLE→CLEARED / FAIL / DISCOVERY / FUNNY) from the word lists
                    │
        I review every candidate (whoop-clipper hyperdopamine test) ─► you approve
                    │
        cut 9:16 (OpenShorts SCREENCAST layout: gameplay + facecam, or our ffmpeg/video-use)
        + word captions + optional chat overlay (TwitchDownloader chatrender) + streamer credit
```

**STRUGGLE → CLEARED detection:** look for 3+ fail-word clusters within ~15 min, followed by a win-word peak. The Short = fastest fails (1 s each) → the attempt that worked → the celebration.

**Trigger word lists** (start lists, tune on the first real VOD):
- shock: no way, what, wait what, oh my god, bro, nah, are you serious, holy, I can't believe
- fail: again, how, I'm dead, bro what, are you kidding, I hate, why
- win: let's go, finally, yes, we did it, cleared, easy, GG
- discovery: look at this, they actually, you can, did you see, this is insane, the detail

## 3. Launch timeline (IST)

| When | What happens | Our move |
|---|---|---|
| **Wed 18 Nov, ~4:30 PM** | New Zealand unlocks first; NZ/AU streamers go live | first test of the detector on the first VODs/highlights |
| **Thu 19 Nov, 12:00 AM** | India unlocks | Indian streamers go live; clip in English/Hindi |
| **Thu 19 Nov, ~9:30 AM** | YouTube's 24-hour GTA VI livestream starts; big US/EU streamers reach the opening missions | main clipping window: first-mission shocks |
| 19–21 Nov | first heists, police chases, discoveries | STRUGGLE→CLEARED + DISCOVERY Shorts |

## 4. Rules (non-negotiable)

- **Only clip streamers who allow it:** a live campaign brief, or their own posted clip rules. No campaign and no rules = don't clip.
- **Spoilers:** first-mission and story moments start with a "SPOILER: first mission" card for 1 s and say so in the title. Never post the story ending.
- **Facts:** a streamer's reaction is the content. Anything we *claim* about the game still follows our CONFIRMED / REPORTED / RUMOUR tags.
- **Credit** the streamer on screen and in the description. Campaign clips follow each brief (disclosure line, platforms, 30-minute submit window).
- **Keep campaign clips on a separate account** from our main GTA 6 channel (YouTube's reused-content policy).
- Paid steps (Higgsfield, ElevenLabs) still need a quote and your yes. This plan uses none.

## 5. What has to be ready before 18 Nov

1. **Detector script** (`production/moment_detector.py`): audio + transcript + chat → ranked moments JSON + a contact sheet of the peaks. Test it on any long gameplay VOD we can reach.
2. **Access:** allow `twitch.tv` / Kick hosts in this environment (approval prompt), or run downloads on your PC.
3. **OpenShorts:** installed here; needs a Gemini key for its own moment picker (our detector works without it).
4. **Accounts:** sign up on Content Rewards / Vyro; check Whop payouts to an Indian bank or PayPal.
5. **Templates:** the Remotion overlays (hook card, SPOILER card, "Attempt 1/2/3…" counter, "CLEARED ✓" stamp, streamer credit).
