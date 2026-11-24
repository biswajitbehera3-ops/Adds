# Shorts retention playbook — Wanted Intel (from our own Studio data, 24 Nov 2026)

**Our numbers so far** (stayed to watch / avg viewed): $3.79B 61.1% / 50% · Map secrets 52.4% / 67% · Treasure 62.0% / ~59%.
**Targets:** stayed ≥ 70%, avg viewed ≥ 75%, likes ≥ 5 per 100 engaged views.
**What we learned:** opening on a still image = swipe. Opening on motion with a question = better (treasure). Payoff after the average drop-off point (0:32 vs 0:29) = most viewers never get it.

## The 8 rules (every Short, every time)
1. **Second 0 = motion + text + voice together.** No map, no still, no logo. The best shot of the video goes first.
2. **Show the reward before you explain it.** First 2 s show the result (the money counter, the gold, the 6 stars), then "here's how".
3. **Open ONE loop the viewer can't close.** "Number 3 is the one most people get wrong" / "there's a second code". Close it near the end, never earlier.
4. **Give one real tip by 0:05.** Proves the video is worth it. The big payoff still comes last.
5. **Something changes every 2–3 s.** New shot, zoom, sound hit, new text. No clip over 3 s, no slow-mo over 0.8×.
6. **Countdown, not a list.** "3… 2… 1" or a progress bar: people stay to finish a count.
7. **25–35 seconds.** The payoff must land before 0:25.
8. **End on a complete sentence plus a one-line reason to follow:** "Follow, part 2 is the gold bar spot."

## Tools that create eagerness (pick 2 per Short)
| Tool | How it sounds | Rule |
|---|---|---|
| **Pause challenge** | "Pause at the 3-second mark. Can you see it?" | Drives replays. Only for something really visible on screen. |
| **Stakes** | "This can cost you an hour of progress." | Only when a source says so (e.g. Engadget on auto-save). |
| **Second secret** | "The code works… but there's a second one." | Must be real. |
| **Wrong-way first** | Show the mistake, then the fix. | Funny + useful. |
| **Series** | "Part 1 of 3" on screen | Gives a reason to subscribe (we got 0 subs on the treasure Short). |
| **Real gameplay proof** | 5–10 s of our own capture | Biggest upgrade we can make: likes were low without it. |

## Never (it costs trust and our rules forbid it)
Fake numbers, "Rockstar confirmed" without Rockstar, leaks, story spoilers, streamer names, thumbnails promising something the video doesn't show.

## Next hooks, already scored (hookscore.py)
| Score | Hook | Source |
|---|---|---|
| 69 | "Pause this video before you open that safe in GTA 6. The code is worth 10,000 dollars, but there's a second one." | GTABase / TheGamer (Watson Bay 0072 → 0212) |
| 57 | "Stop driving past this in GTA 6. One wreck hides 10 gold doubloons, but you need the right boat first." | IGN wiki / GTABoom |
| 56 | "You can find 60 birds in GTA 6 on day one, and one of them is so rare in real life it shouldn't be flying in flocks." | Audubon |
| 53 | "If you play GTA 6, don't trust auto-save. It can cost you an hour of progress." | Engadget |
Rewrite any hook under 70 before recording (`python3 .claude/skills/yt-script/hookscore.py --hook "..."`).
