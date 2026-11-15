#!/usr/bin/env python3
"""stream-moments: find the big moments in a stream VOD from its audio (+ optional chat and viewer-clip markers).

Free and local: ffmpeg for audio, numpy for loudness, faster-whisper (or openai-whisper) for words.

  python3 moments.py SOURCE -o OUTDIR [--start 0:00:00] [--end 2:00:00] [--chat chat.json] [--markers clips.txt]
                     [--top 10] [--model small] [--lang en|hi|auto] [--full] [--video VIDEO --cut] [--sheet]

SOURCE: a local audio/video file, or a URL yt-dlp can read (Twitch/Kick/YouTube VOD).
Writes OUTDIR/moments.json, OUTDIR/moments.md and, with --cut, OUTDIR/clips/*.mp4 (+ --sheet: OUTDIR/sheet.jpg).
"""
import argparse, json, math, os, re, subprocess, sys, wave
import numpy as np

SR = 16000
HOP = 0.5  # seconds per loudness frame

# --- trigger words (lower-case; English + common Hindi/Hinglish streamer reactions) ---
WORDS = {
    "SHOCK": ["no way", "what", "wait what", "oh my god", "omg", "bro", "nah", "are you serious", "holy", "i can't believe",
              "yo", "what the", "how is that", "insane", "crazy", "arey", "kya", "oh teri", "bhai", "kya baat", "pagal"],
    "FAIL": ["again", "how", "i'm dead", "im dead", "are you kidding", "i hate", "why", "no no no", "noo", "nooo",
             "mar gaya", "gaya", "phir se", "kya yaar", "bakwas"],
    "WIN": ["let's go", "lets go", "finally", "yes", "we did it", "cleared", "easy", "gg", "w ", "let's gooo",
            "ho gaya", "jeet gaya", "chal gaya", "badhiya"],
    "DISCOVERY": ["look at this", "they actually", "you can", "did you see", "the detail", "look at that", "check this",
                  "dekho", "yeh dekho", "notice"],
    "FUNNY": ["haha", "hahaha", "lol", "lmao", "i'm crying", "im crying", "bruh", "hasi"],
}
EMOTES = {  # chat signals
    "FUNNY": ["kekw", "lul", "lulw", "omegalul", "icant", "lmao", "😂", "🤣"],
    "WIN": ["pog", "pogchamp", "poggers", "w", "ez", "🔥", "gg"],
    "FAIL": ["l", "sadge", "f", "💀"],
    "SHOCK": ["monkas", "omg", "😱", "wtf", "?"],
}
TITLES = {
    "SHOCK": "The moment GTA 6 shocked {who}",
    "CLEARED": "It took {who} {n} tries to clear this. Here's how",
    "FAIL": "{who} vs GTA 6 police: not even close",
    "DISCOVERY": "{who} just found this in GTA 6",
    "FUNNY": "{who} can't stop laughing at this GTA 6 moment",
    "WIN": "{who} finally did it in GTA 6",
}


def ts(sec):
    sec = max(0, int(round(sec)));
    return f"{sec // 3600}:{sec % 3600 // 60:02d}:{sec % 60:02d}"


def parse_t(s):
    if s is None: return None
    p = [float(x) for x in str(s).split(":")]
    return sum(v * 60 ** i for i, v in enumerate(reversed(p)))


def get_audio(src, out_wav, start=None, end=None):
    """Decode SOURCE (file or yt-dlp URL) to 16 kHz mono wav, optionally only [start, end]."""
    inp = src
    if re.match(r"https?://", src) and not re.search(r"\.(mp4|m4a|mp3|wav|webm|mkv|m3u8)(\?|$)", src):
        r = subprocess.run(["yt-dlp", "-f", "bestaudio/best", "-g", "--no-warnings", src], capture_output=True, text=True)
        if r.returncode != 0 or not r.stdout.strip():
            sys.exit(f"yt-dlp could not read {src}:\n{r.stderr.strip()[-600:]}")
        inp = r.stdout.strip().splitlines()[0]
    cmd = ["ffmpeg", "-v", "error", "-y"]
    if start: cmd += ["-ss", str(start)]
    cmd += ["-i", inp]
    if end: cmd += ["-t", str(end - (start or 0))]
    cmd += ["-vn", "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", out_wav]
    subprocess.run(cmd, check=True)


def loudness(wav_path):
    with wave.open(wav_path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    hop, win = int(SR * HOP), int(SR * 1.0)
    n = max(1, (len(a) - win) // hop + 1)
    db = np.empty(n, np.float32)
    for i in range(n):
        seg = a[i * hop:i * hop + win]
        db[i] = 20 * math.log10(math.sqrt(float(np.mean(seg * seg))) + 1e-6)
    return db, len(a) / SR


def rolling_baseline(db, span_s=120):
    """Robust local baseline (median) and spread (MAD) over a sliding ~2-minute window, sampled every 10 s."""
    step, half = int(10 / HOP), int(span_s / HOP / 2)
    xs, med, mad = [], [], []
    for c in range(0, len(db), step):
        seg = db[max(0, c - half):c + half]
        m = float(np.median(seg)); xs.append(c); med.append(m)
        mad.append(float(np.median(np.abs(seg - m))) * 1.4826 + 1.0)
    idx = np.arange(len(db))
    return np.interp(idx, xs, med), np.interp(idx, xs, mad)


def transcribe(wav_path, model_name, lang, windows=None):
    """Word list [{w,s,e}] (seconds relative to the wav). windows=[(s,e),...] transcribes only those spans."""
    words = []
    try:
        from faster_whisper import WhisperModel
        m = WhisperModel(model_name, device="cpu", compute_type="int8")
        def run(path, off):
            segs, _ = m.transcribe(path, language=None if lang == "auto" else lang, word_timestamps=True, vad_filter=True)
            for sg in segs:
                for wd in (sg.words or []):
                    words.append({"w": wd.word.strip(), "s": round(wd.start + off, 2), "e": round(wd.end + off, 2)})
    except ImportError:
        import whisper
        m = whisper.load_model(model_name)
        def run(path, off):
            r = m.transcribe(path, language=None if lang == "auto" else lang, word_timestamps=True)
            for sg in r["segments"]:
                for wd in sg.get("words", []):
                    words.append({"w": wd["word"].strip(), "s": round(wd["start"] + off, 2), "e": round(wd["end"] + off, 2)})
    if not windows:
        run(wav_path, 0.0)
    else:
        tmp = wav_path + ".part.wav"
        for s, e in windows:
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(s), "-t", str(e - s), "-i", wav_path, tmp], check=True)
            run(tmp, s)
        os.remove(tmp)
    words.sort(key=lambda x: x["s"])
    return words


def merge_windows(centres, pad, dur):
    spans = sorted((max(0, c - pad), min(dur, c + pad)) for c in centres)
    out = []
    for s, e in spans:
        if out and s <= out[-1][1]: out[-1] = (out[-1][0], max(out[-1][1], e))
        else: out.append((s, e))
    return out


def load_chat(path, t0):
    """TwitchDownloader JSON (comments[].content_offset_seconds / message.body) or CSV/TSV 'seconds,text'."""
    rows = []
    if path.endswith(".json"):
        d = json.load(open(path, encoding="utf-8"))
        for c in d.get("comments", []):
            rows.append((float(c.get("content_offset_seconds", 0)) - t0, (c.get("message") or {}).get("body", "")))
    else:
        for line in open(path, encoding="utf-8"):
            p = re.split(r"[,\t]", line.strip(), 1)
            if len(p) == 2:
                try: rows.append((parse_t(p[0]) - t0, p[1]))
                except ValueError: pass
    return [(t, x) for t, x in rows if t >= 0]


def kw_hits(text):
    t = " " + text.lower() + " "
    hits = {k: 0 for k in WORDS}
    for k, lst in WORDS.items():
        for kw in lst:
            hits[k] += len(re.findall(r"(?<![a-z])" + re.escape(kw.strip()) + r"(?![a-z])", t))
    return hits


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source"); ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--start"); ap.add_argument("--end")
    ap.add_argument("--chat"); ap.add_argument("--markers", help="file with one timestamp per line (viewer clips)")
    ap.add_argument("--top", type=int, default=10); ap.add_argument("--gap", type=float, default=45)
    ap.add_argument("--pre", type=float, default=15); ap.add_argument("--post", type=float, default=6)
    ap.add_argument("--model", default="small"); ap.add_argument("--lang", default="en")
    ap.add_argument("--full", action="store_true", help="transcribe everything (default: only around loud peaks)")
    ap.add_argument("--who", default="this streamer")
    ap.add_argument("--video", help="video file/URL to cut clips from (defaults to SOURCE)")
    ap.add_argument("--cut", action="store_true"); ap.add_argument("--sheet", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    t0, t1 = parse_t(a.start), parse_t(a.end)
    wav = os.path.join(a.out, "audio.wav")
    print("1/5 audio…", flush=True); get_audio(a.source, wav, t0, t1)
    db, dur = loudness(wav); base, spread = rolling_baseline(db)
    z = (db - base) / spread
    n = len(db)

    # silence-then-burst: quiet (>=2 s at least 6 dB under baseline) right before a loud frame
    quiet = (db < base - 6).astype(np.float32)
    qrun = np.convolve(quiet, np.ones(int(2 / HOP)), mode="full")[:n] >= int(2 / HOP) - 1
    burst = np.zeros(n, np.float32)
    for i in range(int(2 / HOP), n):
        if z[i] > 2.0 and qrun[i - 1]: burst[i] = 1.0

    loud = np.clip(z, 0, 6) / 6
    pre_score = 3 * loud + 3 * burst

    print("2/5 words…", flush=True)
    if a.full or dur <= 45 * 60:
        words = transcribe(wav, a.model, a.lang)
    else:  # fast mode: only around the 40 loudest candidates
        cand = np.argsort(-pre_score)[:400]
        picks = []
        for i in cand:
            if all(abs(i - j) * HOP > 30 for j in picks): picks.append(i)
            if len(picks) >= 40: break
        words = transcribe(wav, a.model, a.lang, merge_windows([p * HOP for p in picks], 25, dur))

    # keyword score per frame
    kw = np.zeros(n, np.float32); kwcat = [dict() for _ in range(n)]
    for w in words:
        i = min(n - 1, int(w["s"] / HOP))
        ctx = " ".join(x["w"] for x in words if abs(x["s"] - w["s"]) <= 1.5)
        h = kw_hits(ctx)
        if sum(h.values()):
            kw[i] = max(kw[i], min(1.0, sum(h.values()) / 3))
            for k, v in h.items(): kwcat[i][k] = kwcat[i].get(k, 0) + v

    chat = np.zeros(n, np.float32); chatcat = [dict() for _ in range(n)]
    if a.chat:
        rows = load_chat(a.chat, t0 or 0)
        counts = np.zeros(n, np.float32)
        for t, body in rows:
            i = int(t / HOP)
            if 0 <= i < n:
                counts[i] += 1
                for k, em in EMOTES.items():
                    for e in em:
                        if re.search(r"(?<!\w)" + re.escape(e) + r"(?!\w)", body.lower()):
                            chatcat[i][k] = chatcat[i].get(k, 0) + 1
        rate = np.convolve(counts, np.ones(int(5 / HOP)), mode="same")
        rb, rs = rolling_baseline(rate, 300)
        chat = np.clip((rate - rb) / rs, 0, 6) / 6

    mark = np.zeros(n, np.float32)
    if a.markers:
        for line in open(a.markers):
            if line.strip():
                i = int((parse_t(line.strip()) - (t0 or 0)) / HOP)
                for j in range(max(0, i - 10), min(n, i + 10)): mark[j] = 1.0

    score = pre_score + 2 * kw + 2 * chat + 3 * mark
    sm = np.convolve(score, np.ones(3) / 3, mode="same")

    print("3/5 peaks…", flush=True)
    order = np.argsort(-sm); peaks = []
    for i in order:
        if sm[i] <= 0.5: break
        if all(abs(i - j) * HOP >= a.gap for j in peaks): peaks.append(int(i))
        if len(peaks) >= a.top: break

    fail_times = [w["s"] for w in words if kw_hits(w["w"])["FAIL"]]
    moments = []
    for i in sorted(peaks):
        pt = i * HOP
        s, e = max(0, pt - a.pre), min(dur, pt + a.post)
        inside = [w for w in words if s - 3 <= w["s"] <= e + 3]
        if inside:  # snap to sentence-ish boundaries
            starts = [w["s"] for w in inside if w["s"] <= pt - 4]
            s = min(starts, key=lambda x: abs(x - (pt - a.pre))) if starts else s
            ends = [w["e"] for w in inside if w["e"] >= pt + 1 and re.search(r"[.!?]$", w["w"])]
            e = min(ends) + 0.4 if ends else e
        cats = {}
        for j in range(max(0, i - 8), min(n, i + 8)):
            for k, v in kwcat[j].items(): cats[k] = cats.get(k, 0) + v
            for k, v in chatcat[j].items(): cats[k] = cats.get(k, 0) + v
        kind = max(cats, key=cats.get) if cats else ("SHOCK" if burst[max(0, i - 4):i + 4].any() else "FUNNY" if z[i] > 3 else "SHOCK")
        prior_fails = [t for t in fail_times if pt - 900 <= t < pt - 3]
        if kind == "WIN" and len(prior_fails) >= 3: kind = "CLEARED"
        text = " ".join(w["w"] for w in words if s <= w["s"] <= e)
        why = []
        if loud[i] > 0.3: why.append(f"loud +{z[i]:.1f}σ")
        if burst[max(0, i - 4):i + 4].any(): why.append("silence→burst")
        if kw[max(0, i - 6):i + 6].max() > 0: why.append("trigger words")
        if chat[i] > 0.2: why.append("chat spike")
        if mark[i] > 0: why.append("viewer clip")
        off = t0 or 0
        moments.append({"peak": ts(pt + off), "start": ts(s + off), "end": ts(e + off), "start_s": round(s + off, 2),
                        "end_s": round(e + off, 2), "length_s": round(e - s, 1), "type": kind, "score": round(float(sm[i]), 2),
                        "why": why, "text": text[:400],
                        "fails_before": [ts(t + off) for t in prior_fails][-12:] if kind == "CLEARED" else [],
                        "title_idea": TITLES[kind].format(who=a.who, n=len(prior_fails) + 1)})
    moments.sort(key=lambda m: -m["score"])
    json.dump({"source": a.source, "duration_s": round(dur, 1), "moments": moments}, open(os.path.join(a.out, "moments.json"), "w"), indent=2, ensure_ascii=False)

    print("4/5 report…", flush=True)
    md = [f"# Moments: {a.source}", "", f"Scanned {ts(dur)} of audio. Ranked by score (loudness, silence→burst, trigger words, chat, viewer clips).", "",
          "| # | Peak | Cut | Type | Score | Why | What's said | Title idea |", "|---|---|---|---|---|---|---|---|"]
    for k, m in enumerate(moments, 1):
        md.append(f"| {k} | {m['peak']} | {m['start']}–{m['end']} ({m['length_s']} s) | {m['type']} | {m['score']} | {', '.join(m['why'])} | "
                  f"{m['text'][:140].replace('|', '/')} | {m['title_idea']} |")
    md += ["", "Review every moment before cutting: hook in the first second, payoff inside the clip, campaign rules, spoilers."]
    open(os.path.join(a.out, "moments.md"), "w").write("\n".join(md))

    if a.cut or a.sheet:
        print("5/5 clips…", flush=True)
        vid = a.video or a.source
        if re.match(r"https?://", vid):
            r = subprocess.run(["yt-dlp", "-f", "best[height<=1080]/best", "-g", "--no-warnings", vid], capture_output=True, text=True)
            vid = r.stdout.strip().splitlines()[0] if r.returncode == 0 and r.stdout.strip() else vid
        os.makedirs(os.path.join(a.out, "clips"), exist_ok=True); thumbs = []
        for k, m in enumerate(moments, 1):
            if a.cut:
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(m["start_s"]), "-i", vid, "-t", str(m["length_s"]),
                                "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", "-c:a", "aac", "-b:a", "160k",
                                os.path.join(a.out, "clips", f"{k:02d}_{m['type'].lower()}.mp4")], check=False)
            if a.sheet:
                p = os.path.join(a.out, "clips", f"{k:02d}.jpg")
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(parse_t(m["peak"])), "-i", vid, "-frames:v", "1",
                                "-vf", "scale=480:-2", p], check=False)
                if os.path.exists(p): thumbs.append((p, f"{k}. {m['type']} {m['peak']}"))
        if thumbs:
            from PIL import Image, ImageDraw
            ims = [Image.open(p).convert("RGB") for p, _ in thumbs]; w, h = ims[0].size; cols = 4
            sheet = Image.new("RGB", (w * cols, h * math.ceil(len(ims) / cols)))
            for i, (im, (_, lab)) in enumerate(zip(ims, thumbs)):
                ImageDraw.Draw(im).text((8, 8), lab, fill=(255, 255, 0)); sheet.paste(im, ((i % cols) * w, (i // cols) * h))
            sheet.save(os.path.join(a.out, "sheet.jpg"), quality=88)
    print(f"done: {len(moments)} moments -> {os.path.join(a.out, 'moments.md')}")


if __name__ == "__main__":
    main()
