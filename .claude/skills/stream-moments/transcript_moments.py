#!/usr/bin/env python3
"""transcript_moments.py: find reaction moments in an uploaded YouTube video (a stream VOD or a "first reaction" upload)
from its TIMED TRANSCRIPT and its COMMENTS, without downloading the video.

Use it when the audio can't be fetched (this cloud container: YouTube downloads are bot-checked, Twitch/Kick are blocked).
Inputs come from the Firecrawl Alexandria youtube-com provider, saved as JSON:
  videos/video_transcript -> {"segments": [{"start_ms", "duration_ms", "text"}, ...]}   (or the full tool response)
  videos/video_comments   -> {"comments": [{"text", "like_count"?, ...}, ...]}           (optional)

Signals (per 20 s window):
  trigger phrases from moments.py (SHOCK / FAIL / WIN / DISCOVERY / FUNNY)   x2 per hit, capped
  [Laughter] / [Music] style caption tags                                    FUNNY
  viewer comments that quote a timestamp ("3:45 when he...")                 x3 per comment (+ likes)
  CLEARED = a WIN after 3+ FAIL windows in the 15 min before it

  python3 transcript_moments.py transcript.json [--comments comments.json] --who "Lacy" --url https://youtu.be/ID -o OUTDIR
Writes OUTDIR/moments.md and OUTDIR/intel_rows.md (ready for research/stream-intel/YYYY-MM-DD.md).
Research only: describe the moment in our own words; never repost the streamer's footage (production/stream-intel-plan.md).
"""
import argparse, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from moments import WORDS, TITLES, INTEL_TYPE, kw_hits, ts  # same trigger lists and titles as the audio tool

WIN = 20  # seconds per window
TS_RE = re.compile(r"(?<![\d:])(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?![\d:])")


def find(obj, key):
    """Return the first list stored under `key` anywhere in a (possibly wrapped) Alexandria response."""
    if isinstance(obj, dict):
        if isinstance(obj.get(key), list): return obj[key]
        for v in obj.values():
            r = find(v, key)
            if r is not None: return r
    elif isinstance(obj, list):
        for v in obj:
            r = find(v, key)
            if r is not None: return r
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("transcript"); ap.add_argument("--comments"); ap.add_argument("--who", default="this streamer")
    ap.add_argument("--url", default=""); ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--top", type=int, default=10); ap.add_argument("--gap", type=int, default=40)
    a = ap.parse_args()

    segs = find(json.load(open(a.transcript, encoding="utf-8")), "segments") or []
    if not segs: sys.exit("No transcript segments found (the video may have no captions).")
    dur = max(s["start_ms"] + s.get("duration_ms", 0) for s in segs) / 1000
    n = int(dur // WIN) + 1
    text = [""] * n
    for s in segs: text[int(s["start_ms"] / 1000 // WIN)] += " " + s["text"].replace("\n", " ")

    score = [0.0] * n; cats = [dict() for _ in range(n)]; why = [[] for _ in range(n)]
    for i, t in enumerate(text):
        h = kw_hits(t)
        if re.search(r"\[(laughter|laughs|laughing)\]", t, re.I): h["FUNNY"] += 2
        tot = sum(h.values())
        if tot:
            score[i] += 2 * min(tot, 4); why[i].append("trigger words")
            for k, v in h.items():
                if v: cats[i][k] = cats[i].get(k, 0) + v

    comments = find(json.load(open(a.comments, encoding="utf-8")), "comments") if a.comments else []
    quoted = [[] for _ in range(n)]
    for c in comments or []:
        body = c.get("text") or c.get("content") or ""
        for m in TS_RE.finditer(body):
            sec = int(m.group(1) or 0) * 3600 + int(m.group(2)) * 60 + int(m.group(3))
            if 0 <= sec <= dur:
                i = int(sec // WIN)
                likes = int(str(c.get("like_count") or c.get("likes") or 0).replace(",", "") or 0) if str(c.get("like_count") or c.get("likes") or 0).replace(",", "").isdigit() else 0
                score[i] += 3 + min(3, likes / 100)
                quoted[i].append(body.strip().replace("\n", " ")[:120])
    for i in range(n):
        if quoted[i]: why[i].append(f"{len(quoted[i])} viewer comment(s) point here")

    fail_w = [i for i in range(n) if cats[i].get("FAIL")]
    order = sorted(range(n), key=lambda i: -score[i]); picks = []
    for i in order:
        if score[i] <= 0 or len(picks) >= a.top: break
        if all(abs(i - j) * WIN >= a.gap for j in picks): picks.append(i)

    rows, intel = [], []
    for k, i in enumerate(sorted(picks), 1):
        kind = max(cats[i], key=cats[i].get) if cats[i] else ("FUNNY" if any("lol" in q.lower() or "😂" in q for q in quoted[i]) else "SHOCK")
        prior = [j for j in fail_w if i * WIN - 900 <= j * WIN < i * WIN]
        if kind == "WIN" and len(prior) >= 3: kind = "CLEARED"
        start = i * WIN
        link = f"{a.url}{'&' if '?' in a.url else '?'}t={start}" if a.url else ""
        said = re.sub(r"\s+", " ", text[i]).strip()[:160].replace("|", "/")
        q = quoted[i][0].replace("|", "/") if quoted[i] else ""
        title = TITLES[kind].format(who=a.who, n=len(prior) + 1)
        rows.append(f"| {k} | [{ts(start)}]({link}) | {kind} | {round(score[i], 1)} | {', '.join(why[i])} | {said} | {q} | {title} |")
        intel.append(f"| {k} | {a.who} {ts(start)} | (write it) — they said: \"{said[:100]}\" | {INTEL_TYPE[kind]} | 1 | ? | {title} |")

    os.makedirs(a.out, exist_ok=True)
    md = [f"# Moments (transcript + comments): {a.who} {a.url}", "", f"{ts(dur)} of captions · {len(comments or [])} comments read.", "",
          "| # | Time | Type | Score | Why | What's said (captions) | Viewer comment | Video idea |", "|---|---|---|---|---|---|---|---|"] + rows
    md += ["", "Auto-captions miss shouting and names: open each link and watch 30 s before trusting a moment.",
           "Research only. Never post: leaks, the ending or story reveals, cutscenes alone, in-game TV shows alone."]
    open(os.path.join(a.out, "moments.md"), "w").write("\n".join(md) + "\n")
    open(os.path.join(a.out, "intel_rows.md"), "w").write(
        "| # | Stream + time | What happened (our words) | Type | Streams seen on | Spoiler | Video idea |\n|---|---|---|---|---|---|---|\n"
        + "\n".join(intel) + "\n")
    print(f"done: {len(rows)} moments -> {os.path.join(a.out, 'moments.md')}")


if __name__ == "__main__":
    main()
