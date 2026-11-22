#!/usr/bin/env python3
"""pod — small Linux/ffmpeg helpers for the Hinglish AI-host podcast (ported from a Mac pipeline).

Run from anywhere; paths are relative to the repo root unless absolute.

  python3 -I podcast/tools/pod.py watch <video> [--every 1] [--out dir]      contact sheets + scene changes
  python3 -I podcast/tools/pod.py audio <file>                                loudness (LUFS, true peak) + silences
  python3 -I podcast/tools/pod.py loudnorm <in> <out> [--lufs -14]            two-pass loudness to YouTube level
  python3 -I podcast/tools/pod.py check <video>                               render checks -> PASS / FIX NEEDED
  python3 -I podcast/tools/pod.py fx <effect> [--out file]                    render podcast/effects/effects/<effect>.html to alpha WebM
  python3 -I podcast/tools/pod.py overlay <base> <fx.webm> --at S <out>       composite a transparent clip onto a video at S seconds
  python3 -I podcast/tools/pod.py clip <video> --start S --end E <out> [--vertical]   cut a span (9:16 centre crop with --vertical)
  python3 -I podcast/tools/pod.py captions <script.json> <name> [--max-words 4] [--format long|short]
        script.json = [{"who":"genius","start":0.0,"end":2.4,"text":"Seedha bolo, hua kya?"}, ...]  (times from the TTS segments)
        -> podcast/remotion/public/captions/<name>.json for the PodCaptions composition
"""
import argparse, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EFFECTS = os.path.join(ROOT, "podcast", "effects")
BRAND = json.load(open(os.path.join(ROOT, "podcast", "brand", "brand-kit.json")))
CHROME = "/opt/pw-browsers/chromium"


def sh(cmd, check=True):
    return subprocess.run(cmd, check=check, text=True, errors="replace", capture_output=True)


def probe(p):
    j = json.loads(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate",
                       "-of", "json", p]).stdout)
    v = next((s for s in j["streams"] if s["codec_type"] == "video"), {})
    num, den = (v.get("r_frame_rate", "25/1").split("/") + ["1"])[:2]
    return {"duration": float(j["format"]["duration"]), "w": v.get("width"), "h": v.get("height"),
            "fps": float(num) / float(den or 1), "audio": any(s["codec_type"] == "audio" for s in j["streams"])}


def loudness(p):
    err = sh(["ffmpeg", "-hide_banner", "-i", p, "-af", "loudnorm=print_format=json", "-f", "null", "-"]).stderr
    j = json.loads(err[err.rindex("{"):err.rindex("}") + 1])
    return float(j["input_i"]), float(j["input_tp"]), j


def silences(p, noise="-35dB", d=0.6):
    err = sh(["ffmpeg", "-hide_banner", "-i", p, "-af", f"silencedetect=noise={noise}:d={d}", "-f", "null", "-"]).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(st, en))


def cmd_watch(a):
    info = probe(a.video)
    out = a.out or os.path.splitext(a.video)[0] + "-watch"
    os.makedirs(out, exist_ok=True)
    w = 360
    # burn the timestamp into every frame, 12 per sheet (4x3)
    draw = f"drawtext=text='%{{pts\\:hms}}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6"
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", a.video, "-vf",
        f"fps=1/{a.every},scale={w}:-2,{draw},tile=4x3:padding=4:color=white", f"{out}/sheet_%03d.jpg"])
    err = sh(["ffmpeg", "-hide_banner", "-i", a.video, "-vf", "scdet=threshold=12", "-f", "null", "-"]).stderr
    scenes = [round(float(x), 2) for x in re.findall(r"lavfi.scd.time: ([\d.]+)", err)]
    sheets = sorted(f for f in os.listdir(out) if f.startswith("sheet_"))
    json.dump({"video": a.video, "every": a.every, "duration": info["duration"], "sheets": sheets, "sceneChanges": scenes},
              open(f"{out}/frames.json", "w"), indent=1)
    print(f"{len(sheets)} sheets in {out} ({a.every}s per cell, 12 per sheet); scene changes: {scenes[:20]}")


def cmd_audio(a):
    i, tp, _ = loudness(a.file)
    s = silences(a.file)
    print(f"integrated {i:.1f} LUFS, true peak {tp:.1f} dBTP (target {BRAND['loudness']['lufs']} LUFS / {BRAND['loudness']['truePeak']} dBTP)")
    print(f"silences > 0.6 s: {[(round(x, 2), round(y, 2)) for x, y in s]}")


def cmd_loudnorm(a):
    _, _, j = loudness(a.inp)
    tp = BRAND["loudness"]["truePeak"]
    f = (f"loudnorm=I={a.lufs}:TP={tp}:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
         f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    vid = probe(a.inp)["w"] is not None
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", a.inp, "-af", f, "-ar", "48000"] + (["-c:v", "copy"] if vid else []) + [a.out])
    print(f"{a.out}: {loudness(a.out)[0]:.1f} LUFS")


def cmd_check(a):
    info = probe(a.video)
    rows = []
    err = sh(["ffmpeg", "-hide_banner", "-i", a.video, "-vf", "blackdetect=d=0.1:pix_th=0.10", "-an", "-f", "null", "-"]).stderr
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", err)
    rows.append(("black frames", "PASS" if not blacks else "FIX", blacks or "none"))
    err = sh(["ffmpeg", "-hide_banner", "-i", a.video, "-vf", "freezedetect=n=0.001:d=2", "-an", "-f", "null", "-"]).stderr
    fr = re.findall(r"freeze_start: ([\d.]+)", err)
    rows.append(("frozen > 2 s", "PASS" if not fr else "LOOK", fr or "none"))
    if info["audio"]:
        i, tp, _ = loudness(a.video)
        ok = abs(i - BRAND["loudness"]["lufs"]) <= 1.0 and tp <= -1.0
        rows.append(("loudness", "PASS" if ok else "FIX", f"{i:.1f} LUFS, TP {tp:.1f}"))
    else:
        rows.append(("audio", "FIX", "no audio stream"))
    vert = info["h"] > info["w"]
    want = (1080, 1920) if vert else (1920, 1080)
    rows.append(("frame size", "PASS" if (info["w"], info["h"]) in [want, (want[0] * 2, want[1] * 2)] else "LOOK", f"{info['w']}x{info['h']} @ {info['fps']:.2f} fps"))
    if vert:
        rows.append(("Shorts length", "PASS" if info["duration"] <= 180 else "FIX", f"{info['duration']:.1f} s"))
    verdict = "FIX NEEDED" if any(r[1] == "FIX" for r in rows) else "PASS"
    md = "| check | result | detail |\n|---|---|---|\n" + "\n".join(f"| {a_} | {b} | {c} |" for a_, b, c in rows)
    print(md + f"\n\n**{verdict}** — automatic checks only; the visual review (pod-review-gate) is still required.")


def cmd_fx(a):
    src = os.path.join(EFFECTS, "effects", a.effect + ".html")
    if not os.path.exists(src):
        sys.exit(f"no effect {src}; have: {sorted(f[:-5] for f in os.listdir(os.path.join(EFFECTS, 'effects')))}")
    out = os.path.abspath(a.out or os.path.join(EFFECTS, "renders", a.effect + ".webm"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    env = dict(os.environ, PUPPETEER_EXECUTABLE_PATH=CHROME)
    r = subprocess.run(["npx", "--yes", "hyperframes@0.8.147", "render", "-c", os.path.relpath(src, EFFECTS), "--format", "webm",
                        "--fps", str(a.fps), "-o", out], cwd=EFFECTS, env=env, text=True, capture_output=True)
    if r.returncode or not os.path.exists(out):
        sys.exit(r.stdout[-2000:] + r.stderr[-2000:])
    print(out)


def cmd_overlay(a):
    info = probe(a.base)
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", a.base, "-c:v", "libvpx-vp9", "-itsoffset", str(a.at), "-i", a.fx,
        "-filter_complex", f"[1:v]scale={info['w']}:{info['h']}[f];[0:v][f]overlay=eof_action=pass",
        "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", a.out])
    print(a.out)


def cmd_clip(a):
    vf = ["-vf", "crop=ih*9/16:ih,scale=1080:1920"] if a.vertical else []
    sh(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(a.start), "-to", str(a.end), "-i", a.video] + vf +
       ["-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", a.out])
    print(a.out)


def cmd_captions(a):
    lines = json.load(open(a.script))
    out = []
    for ln in lines:
        words = ln["text"].split()
        if not words:
            continue
        span = ln["end"] - ln["start"]
        weights = [len(w.strip(".,!?…")) + 1 for w in words]  # longer words take longer to say
        tot, t, timed = sum(weights), ln["start"], []
        for w, k in zip(words, weights):
            d = span * k / tot
            timed.append({"w": w, "s": round(t, 3), "e": round(t + d, 3)})
            t += d
        for i in range(0, len(timed), a.max_words):
            g = timed[i:i + a.max_words]
            out.append({"who": ln.get("who", "genius"), "start": g[0]["s"], "end": g[-1]["e"], "words": g})
    dst = os.path.join(ROOT, "podcast", "remotion", "public", "captions", a.name + ".json")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    json.dump({"format": a.format, "lines": out}, open(dst, "w"), ensure_ascii=False, indent=1)
    print(f"{dst}: {len(out)} caption groups")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("watch"); s.add_argument("video"); s.add_argument("--every", type=float, default=1); s.add_argument("--out")
    s = sub.add_parser("audio"); s.add_argument("file")
    s = sub.add_parser("loudnorm"); s.add_argument("inp"); s.add_argument("out"); s.add_argument("--lufs", type=float, default=BRAND["loudness"]["lufs"])
    s = sub.add_parser("check"); s.add_argument("video")
    s = sub.add_parser("fx"); s.add_argument("effect"); s.add_argument("--out"); s.add_argument("--fps", type=int, default=25)
    s = sub.add_parser("overlay"); s.add_argument("base"); s.add_argument("fx"); s.add_argument("--at", type=float, required=True); s.add_argument("out")
    s = sub.add_parser("clip"); s.add_argument("video"); s.add_argument("--start", type=float, required=True); s.add_argument("--end", type=float, required=True)
    s.add_argument("out"); s.add_argument("--vertical", action="store_true")
    s = sub.add_parser("captions"); s.add_argument("script"); s.add_argument("name"); s.add_argument("--max-words", type=int, default=BRAND["caption"]["maxWords"])
    s.add_argument("--format", choices=["long", "short"], default="long")
    a = p.parse_args()
    globals()["cmd_" + a.cmd](a)


if __name__ == "__main__":
    main()
