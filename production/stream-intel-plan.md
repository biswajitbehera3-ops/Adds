# Stream intel → our own videos (plan, from 19 Nov 2026)

**Idea (the user's):** watch big GTA 6 streams on Twitch/Kick/YouTube **as research only**.
- Chat spikes and streamer reactions show us what's surprising, hard or funny.
- We **never post their footage**. We make **our own** videos explaining those situations: what happened, why it's hard, how to do it, a
  character, a surprising fact.

## 1. Finding the moments (tools we already have)
| Signal | Tool | Output |
|---|---|---|
| Chat explodes | `tools/chat_spikes.py` (TwitchDownloader JSON or YouTube live_chat.json) | peak times, cut windows starting 20 s early |
| What the streamer says / how loud | GTA 6 Clipper's listening step, or `stream-moments/moments.py` (tested 17 Nov: transcript + loudness + chat + trigger phrases → SHOCK/FAIL/CLEARED/DISCOVERY/FUNNY, writes `intel_rows.md` for the log) | moment list + transcript lines |
| Both agree | — | the strongest moments |

The **allow-list is not needed for research**: we read chat and listen, we don't publish anything of theirs.

## 2. Turning a moment into our video
For each strong moment, log it in `research/stream-intel/YYYY-MM-DD.md`:
| Field | Example |
|---|---|
| Stream + time | Lacy (Twitch) 2:14:30 |
| What happened (our words) | "Failed the first store robbery 4 times: the customer fought back" |
| Type | SURPRISE · HARD PART · FUNNY · CHARACTER · SYSTEM/FACT |
| Seen on how many streams | 1 / 2 / 3+ |
| Spoiler level | none · early-game · story (skip) |
| Video idea | Short: "Why Everyone Fails GTA 6's First Robbery" |

## 3. Fact rule for stream-observed things (new tier, sits beside CONFIRMED / REPORTED)
- **SEEN IN-GAME**: we watched it happen on a live stream. Say so: "On Lacy's stream, …". Credit the streamer by name in the
  description, but don't use their footage.
- A "fact" about how the game works (a mechanic, a price, a time) needs **2+ different streams** showing the same thing.
- One stream only means "we saw it once", and we say exactly that.
- No guessing why something happened: describe it, then explain with sourced info (Edge, Rockstar, etc.) where we have it.

## 4. What we show on screen (no streamer footage)
1. Official Rockstar footage, screenshots and posts (fair commentary use, as now).
2. **Our own gameplay capture** once we have the game (best: we recreate the moment ourselves).
3. Our Remotion graphics: maps, step-by-step cards, "fail counters", character cards, illustrations labelled ILLUSTRATION.
4. Never: cutscenes alone, the ending or big story reveals, in-game TV shows alone, leaks.

## 5. Video formats that fit
| Format | Example title | Length |
|---|---|---|
| **The hard part** | "The GTA 6 Mission Everyone Is Failing (and the Fix)" | Short + long |
| **Surprise / discovery** | "Streamers Just Found This in GTA 6" (we describe it, then show it ourselves) | Short |
| **Systems explained** | "Why the Cops Found Them So Fast (GTA 6's Police Report)" | Short |
| **Character** | "Who Is Raul? What We Learned in the First Hours" (spoiler-free) | Short |
| **Day recap** | "GTA 6 Day 1: 10 Things That Surprised Everyone" | long, 5–7 min |
| **Funny / fail** | "GTA 6's Funniest Fail So Far" (retold with our graphics/capture) | Short |

## 6. Spoilers
- First week: **early game and systems only**. Story moments get a SPOILER card plus a spoiler-free title and cover.
- Nothing past the first missions, and never the ending (`production/do-not-post-rules.md`).

## 7. Daily rhythm (launch week)
1. **Morning:** run the tools on the night's streams.
2. **Late morning:** fill the intel log, then pick the 2–3 moments seen on 2+ streams.
3. **Afternoon:** script with `/yt-script`, hooks scored, then record in the Fenrir voice.
4. **Evening:** post the Shorts; the long recap every 2–3 days.
