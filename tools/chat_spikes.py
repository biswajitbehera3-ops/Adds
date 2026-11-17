#!/usr/bin/env python3
"""chat_spikes.py — find the moments a stream's chat exploded, and give clip cut times.

When something crazy happens, chat floods. This counts chat messages in 10-second buckets, finds the peaks
("mountains"), and because chat reacts LATE, starts each cut 20 seconds before the peak.

Input: a chat file from TwitchDownloader (free, open source: github.com/lay295/TwitchDownloader), saved as JSON
       ("Chat Download" → JSON). Also accepts YouTube live-chat replays from yt-dlp (*.live_chat.json) and a simple
       CSV with a seconds column.

Rule: only clip streamers who allow clipping. Put allowed streamer names (one per line) in an allow-list file;
      the tool refuses to make cut lists for anyone not on it.

Usage:
  python3 chat_spikes.py CHAT.json --allow allowed_streamers.txt
  python3 chat_spikes.py CHAT.json --allow allowed.txt --top 10 --bucket 10 --lead 20 --tail 25 --gap 60
  python3 chat_spikes.py CHAT.json --allow allowed.txt --video VOD.mp4      # also prints ffmpeg cut commands
No third-party packages needed.
"""
import argparse, csv, json, math, os, re, statistics, sys


def fmt(t):
    t = max(0, int(round(t))); return f"{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}"


def load_times(path):
    """Return (streamer_name_or_None, sorted list of message times in seconds)."""
    name, times = None, []
    if path.lower().endswith(".csv"):
        with open(path, newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            col = next((c for c in r.fieldnames or [] if c.lower() in ("seconds", "offset", "time", "t")), None)
            if not col: sys.exit("CSV needs a 'seconds' (or offset/time) column.")
            times = [float(row[col]) for row in r if row.get(col)]
        return name, sorted(times)
    with open(path, encoding="utf-8") as f:
        try:
            d = json.load(f)                                      # TwitchDownloader: one JSON object with "comments"
        except json.JSONDecodeError:
            d = None
        if isinstance(d, dict) and "comments" in d:
            name = (d.get("streamer") or {}).get("name")
            for c in d.get("comments", []):
                t = c.get("content_offset_seconds")
                if t is not None: times.append(float(t))
            return name, sorted(times)
        f.seek(0)
        for line in f:                                            # yt-dlp YouTube live_chat.json (one JSON per line)
            line = line.strip()
            if not line: continue
            try: d = json.loads(line)
            except json.JSONDecodeError: continue
            ms = (d.get("replayChatItemAction") or {}).get("videoOffsetTimeMsec")
            if ms is not None: times.append(int(ms) / 1000.0)
    return name, sorted(times)


def find_spikes(times, bucket=10, top=10, gap=60, min_z=2.5):
    if not times: return [], []
    n = int(times[-1] // bucket) + 1
    counts = [0] * n
    for t in times: counts[int(t // bucket)] += 1
    win = max(3, int(300 // bucket))                              # 5-minute rolling baseline
    scores = []
    for i, c in enumerate(counts):
        lo, hi = max(0, i - win), min(n, i + win + 1)
        around = counts[lo:i] + counts[i + 1:hi]
        med = statistics.median(around) if around else 0
        mad = statistics.median([abs(x - med) for x in around]) if around else 0
        z = (c - med) / (1.4826 * mad + 1.0)                     # robust z-score, +1 keeps quiet chats sane
        scores.append((z, c, med, i))
    picks, taken = [], []
    for z, c, med, i in sorted(scores, reverse=True):
        if z < min_z or len(picks) >= top: break
        t = i * bucket
        if any(abs(t - u) < gap for u in taken): continue        # one clip per mountain
        taken.append(t); picks.append({"bucket": i, "t": t, "count": c, "baseline": round(med, 1), "z": round(z, 1)})
    return sorted(picks, key=lambda p: p["t"]), counts


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("chat"); ap.add_argument("--allow", required=True, help="file with allowed streamer names, one per line")
    ap.add_argument("--streamer", help="streamer name if the chat file doesn't say (YouTube/CSV)")
    ap.add_argument("--bucket", type=int, default=10, help="seconds per bucket (default 10)")
    ap.add_argument("--lead", type=int, default=20, help="start the cut this many seconds BEFORE the chat peak (default 20)")
    ap.add_argument("--tail", type=int, default=25, help="end the cut this many seconds after the peak bucket (default 25)")
    ap.add_argument("--top", type=int, default=10); ap.add_argument("--gap", type=int, default=60)
    ap.add_argument("--min-z", type=float, default=2.5); ap.add_argument("--video", help="VOD file: print ffmpeg cut commands")
    ap.add_argument("-o", "--out", default="spikes.csv")
    a = ap.parse_args()

    name, times = load_times(a.chat)
    name = a.streamer or name
    allowed = {l.strip().lower() for l in open(a.allow, encoding="utf-8") if l.strip() and not l.startswith("#")}
    if not name: sys.exit("Can't tell which streamer this chat is from. Pass --streamer NAME.")
    if name.lower() not in allowed:
        sys.exit(f"'{name}' is not in {a.allow}. Only clip streamers who allow it (a clipping program or written OK). Stopping.")
    if not times: sys.exit("No chat messages found in that file.")

    picks, counts = find_spikes(times, a.bucket, a.top, a.gap, a.min_z)
    print(f"{name}: {len(times):,} messages over {fmt(times[-1])} · {len(picks)} spikes "
          f"(z ≥ {a.min_z}, one per {a.gap}s) · cuts start {a.lead}s before each peak\n")
    rows = []
    for k, p in enumerate(picks, 1):
        start = max(0, p["t"] - a.lead); end = p["t"] + a.bucket + a.tail
        bar = "█" * min(40, max(1, int(40 * p["count"] / max(counts))))
        print(f"{k:>2}. peak {fmt(p['t'])}  {p['count']:>4} msgs/{a.bucket}s (usual {p['baseline']})  z {p['z']:>5}  "
              f"CUT {fmt(start)} → {fmt(end)}  {bar}")
        rows.append({"rank": k, "peak": fmt(p["t"]), "cut_start": fmt(start), "cut_end": fmt(end),
                     "messages": p["count"], "usual": p["baseline"], "z": p["z"]})
        if a.video:
            base = os.path.splitext(os.path.basename(a.video))[0]
            print(f"    ffmpeg -ss {start} -to {end} -i \"{a.video}\" -c:v libx264 -c:a aac \"{base}_spike{k:02d}.mp4\"")
    with open(a.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else ["rank"]); w.writeheader(); w.writerows(rows)
    print(f"\nSaved {a.out}. Watch every cut before posting: skip cutscenes, story/ending reveals, in-game TV shows "
          f"(production/do-not-post-rules.md).")


if __name__ == "__main__":
    main()
