# 008 — Shorts cut from "10 Million Pre-Orders? The GTA 6 Numbers, Explained"

Source: `scripts/008-gta6-breaks-preorder-record.md` (timecodes are the long video's). Each Short is 9:16 (1080×1920), voice =
Bram, burned-in GTA subtitles (same style as 006), CONFIRMED/REPORTED tag on every fact. First lines scored with
`yt-script/hookscore.py`.

**Vertical framing (all five):** trailer footage is 16:9, so a centre crop keeps ~32% of the width. Faces and cars stay; wide
skylines lose their edges, which doesn't matter. For the two-bar chart and the quote cards, build them **natively vertical** in
Remotion — never crop a 16:9 graphic. Keep text inside the middle 1080×1420 (Shorts UI covers the bottom ~300 px and the right
edge buttons).

## Ranked

| Rank | Short | From (long video) | First line | Score | Length |
|---|---|---|---|---|---|
| 1 | The 10 million catch | B4–B5 · 0:27–0:58 | "Before you say GTA 6 sold ten million, know this: nobody official said that number." | **66** | ~30 s |
| 2 | The two words that are confirmed | B9 · 1:19–1:43 | "Before you quote GTA 6 sales, know this: only two words are actually confirmed." | **65** | ~25 s |
| 3 | The internet record | B11 · 1:49–2:06 | "Before you pre-load GTA 6 tonight, know this: pre-loads already broke one internet record." | **60** | ~22 s |
| 4 | Hollywood is bracing | B13 · 2:14–2:36 | "Before you call GTA 6 just a game, know this: Hollywood is bracing for its launch." | **56** | ~25 s |
| 5 | Beat Cyberpunk | B6–B7 · 0:58–1:17 | "If you pre-ordered GTA 6, you might have broken a six-year record. Here's the catch." | 48 (weak) | ~22 s |

All five open with the same "Before you…, know this:" shape (The Warning). That's fine as a series look, but post them at least a
day apart, and don't post #1 and #2 back to back (same topic).

---

## Short 1 — The 10 million catch (~30 s)
**On screen, first 2 s:** `10,000,000?` (gold) with a red stamp `NOT OFFICIAL`
**Spoken:**
> Before you say GTA 6 sold ten million, know this: nobody official said that number.
> It comes from Sensor Tower, a company that tracks store data. Their estimate is about ten million pre-orders, around a billion
> dollars. About seventy-five percent on PlayStation 5. But Rockstar and Take-Two haven't confirmed any of it.
> So what did they confirm? Two words.

**Visual:** counter racing to 10,000,000 → stamp → EL street (centre crop) → vertical stat card "≈10M · ≈$1B · ESTIMATE"
(REPORTED · Sensor Tower) → vertical 75/25 bar (PS5 / XBOX).
**Loop point:** ends "So what did they confirm? Two words." → loops into "nobody official said that number" — and Short 2 answers
it (pin a comment linking Short 2).

## Short 2 — The two words that are confirmed (~25 s)
**On screen, first 2 s:** `THE ONLY OFFICIAL RECORD`
**Spoken:**
> Before you quote GTA 6 sales, know this: only two words are actually confirmed.
> Sony says it's the most pre-ordered game in PlayStation Store history. Xbox says it's the most pre-ordered title of all time on
> the Microsoft Store. No numbers. Just "all time". Twice.

**Visual:** T1 beach crowd (centre crop) → two vertical QuoteCards stacked: PlayStation Blog / Xbox Wire, "ALL TIME" in gold
(CONFIRMED).
**Loop point:** last words "All time. Twice." → first line "only two words are actually confirmed" — the loop literally names the
two words.

## Short 3 — The internet record (~22 s)
**On screen, first 2 s:** `PRE-LOADS BROKE THE INTERNET?` → small line under it: `(a UK record)`
**Spoken:**
> Before you pre-load GTA 6 tonight, know this: pre-loads already broke one internet record.
> Virgin Media in the UK says GTA 6 gave it the biggest traffic peak it has ever recorded. And the most data it has ever moved in
> one day. And nobody can even play it yet.

**Visual:** EL highway traffic at night (centre crop, light streaks) → our own spiking line graph "ALL-TIME PEAK" labelled
ILLUSTRATION (no invented figures). REPORTED · Forbes / Virgin Media.
**Loop point:** "nobody can even play it yet" → "before you pre-load… tonight" (the viewer is the next download).
**Don't say:** "the internet crashed" — it was record traffic, not an outage.

## Short 4 — Hollywood is bracing (~25 s)
**On screen, first 2 s:** `GTA 6 vs HOLLYWOOD`
**Spoken:**
> Before you call GTA 6 just a game, know this: Hollywood is bracing for its launch.
> The Hollywood Reporter calls it the biggest entertainment launch in history. The new Hunger Games film opens the very next day.
> And Take-Two's boss says: "You compete against everything and nothing."

**Visual:** official artwork Jason & Lucia Rooftop (vertical crop on the two characters) → EL skyline → vertical QuoteCard
(Strauss Zelnick, Take-Two, via GamesBeat). REPORTED · THR / GameSpot.
**Loop point:** "against everything and nothing" → "just a game".

## Short 5 — Beat Cyberpunk (~22 s) · weakest, post last or skip
**On screen, first 2 s:** `8M → 10M?`
**Spoken:**
> If you pre-ordered GTA 6, you might have broken a six-year record. Here's the catch.
> Cyberpunk 2077 had eight million pre-orders in 2020. Sensor Tower estimates GTA 6 at about ten million, a week before launch.
> But that's an estimate. Rockstar hasn't said a number.

**Visual:** LT supercars (centre crop) → vertical two-bar race CYBERPUNK 8M vs GTA 6 ~10M (REPORTED · GameSpot).
**Loop point:** "hasn't said a number" → "you might have broken".

---

## Copy block
```
SHORT 1  "Before you say GTA 6 sold ten million, know this: nobody official said that number."   66  ~30s  from 0:27–0:58
SHORT 2  "Before you quote GTA 6 sales, know this: only two words are actually confirmed."      65  ~25s  from 1:19–1:43
SHORT 3  "Before you pre-load GTA 6 tonight, know this: pre-loads already broke one internet record."  60  ~22s  from 1:49–2:06
SHORT 4  "Before you call GTA 6 just a game, know this: Hollywood is bracing for its launch."   56  ~25s  from 2:14–2:36
SHORT 5  "If you pre-ordered GTA 6, you might have broken a six-year record. Here's the catch." 48  ~22s  from 0:58–1:17
Shorts title = the on-screen text + #GTA6 #Shorts. Link the long video as the Short's "related video".
```
