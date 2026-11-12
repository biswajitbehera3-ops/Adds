"""Build 006 subtitles: Whisper word timings + the script's own spelling.

Inputs: scratch vo_sections.json (script per voice section), whisper_words.json (Whisper base.en word timings per section),
remotion-overlays/src/gta6/v006.json (where each voice section sits on the timeline).
Outputs: production/006-subs.ass (burned in, GTA neon karaoke) and production/006-subs.srt (YouTube closed captions).
"""
import difflib, json, re, sys
FPS = 30
secs = json.load(open(sys.argv[1])); wh = json.load(open(sys.argv[2]))
tl = json.load(open("remotion-overlays/src/gta6/v006.json"))
starts = {int(re.search(r"vo/(\d+)\.wav", a["src"]).group(1)): a["from"] / FPS for a in tl["audio"] if "/vo/" in a["src"]}
NUMW = {"one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10"}
NUMD = {v: k for k, v in NUMW.items()}
norm = lambda t: re.sub(r"[^a-z0-9']", "", t.lower())

def display_tokens(text):
    """Script tokens as they should READ on screen: 'GTA six'→'GTA 6', 'Number ten.'→'Number 10.', 'C C T V'→'CCTV'."""
    toks = text.replace("C C T V", "CCTV").split()
    out = []
    for i, t in enumerate(toks):
        core = re.sub(r"[^A-Za-z]", "", t).lower()
        prev = toks[i - 1].lower() if i else ""
        if core in NUMW and (prev in ("gta", "number") or prev.endswith("number")):
            t = re.sub(core, NUMW[core], t, flags=re.I)
        out.append(t)
    return out

words = []   # (display_text, start_s, end_s) on the video timeline
for si, (text, ww) in enumerate(zip(secs, wh)):
    disp = display_tokens(text)
    a = [norm(x) for x in disp]
    b = [norm(NUMD.get(norm(w["w"]), w["w"])) for w in ww]
    a2 = [norm(NUMD.get(x, x)) for x in a]
    times = [None] * len(disp)
    sm = difflib.SequenceMatcher(None, a2, b, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1): times[i1 + k] = (ww[j1 + k]["s"], ww[j1 + k]["e"])
        elif tag == "replace":
            s0, e0 = ww[j1]["s"], ww[j2 - 1]["e"]; n = i2 - i1
            for k in range(n): times[i1 + k] = (s0 + (e0 - s0) * k / n, s0 + (e0 - s0) * (k + 1) / n)
        # 'insert' (extra sounds Whisper heard, e.g. a trailing mumble) is dropped; 'delete' is filled below
    for k in range(len(times)):
        if times[k] is None:
            prev = times[k - 1][1] if k else 0.0
            nxt = next((times[j][0] for j in range(k + 1, len(times)) if times[j]), prev + 0.3)
            times[k] = (prev, max(prev + 0.05, nxt))
    off = starts[si]
    words += [(d, off + s, off + e) for d, (s, e) in zip(disp, times)]

# chunk into 2–5 word lines: break after punctuation or long gaps; never end a line on a small word or right before a number
WEAK = {"the", "a", "an", "and", "of", "to", "in", "on", "your", "you", "gta", "number", "is", "are", "if", "it", "that", "for", "with", "but", "so", "or", "at", "by", "from", "their", "they", "can", "be", "how", "which", "one", "two"}
chunks, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    nxt_gap = nxt[1] - w[2] if nxt else 9
    last = re.sub(r"[^a-z]", "", w[0].lower())
    punct = re.search(r"[.,?!:;\"]$", w[0])
    hard = re.search(r"[.?!]$", w[0]) or nxt_gap > 0.45
    blocked = (not punct) and (last in WEAK or (nxt and re.match(r"^\d", nxt[0])))
    span = cur[-1][2] - cur[0][1]
    if hard or (punct and len(cur) >= 2) or (len(cur) >= 4 and not blocked) or len(cur) >= 6 or (span > 2.6 and not blocked):
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
merged = []
for ch in chunks:   # fold a lone leftover word into the line before it
    if merged and len(ch) == 1 and len(merged[-1]) <= 5 and ch[0][1] - merged[-1][-1][2] < 0.35:
        merged[-1] = merged[-1] + ch
    else:
        merged.append(ch)
chunks = merged

def ts_ass(t):
    cs = int(round(t * 100)); h, cs = divmod(cs, 360000); m, cs = divmod(cs, 6000); s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"
def ts_srt(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
clean = lambda t: t.replace('"', "")

ass = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1920", "PlayResY: 1080", "WrapStyle: 2", "ScaledBorderAndShadow: yes", "",
       "[V4+ Styles]",
       "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       # spoken = hot pink #FF2E88, upcoming = white, neon-purple outline, soft shadow
       "Style: GTA,Anton,66,&H00882EFF,&H00FFFFFF,&H00260012,&H96000000,0,0,0,0,100,100,1,0,1,5,3,2,120,120,26,1", "",
       "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
srt = []
for n, ch in enumerate(chunks):
    st = ch[0][1]; en = max(ch[-1][2] + 0.25, st + 0.6)
    if n + 1 < len(chunks): en = min(en, chunks[n + 1][0][1] - 0.02)
    parts = []
    for i, (txt, s, e) in enumerate(ch):
        dur = (ch[i + 1][1] if i + 1 < len(ch) else e) - (s if i else st)
        parts.append("{\\k%d}%s" % (max(1, round(dur * 100)), clean(txt).upper()))
    ass.append(f"Dialogue: 0,{ts_ass(st)},{ts_ass(en)},GTA,,0,0,0,,{{\\blur1.2}}" + " ".join(parts))
    srt += [str(n + 1), f"{ts_srt(st)} --> {ts_srt(en)}", " ".join(clean(t) for t, _, _ in ch), ""]
open("production/006-subs.ass", "w").write("\n".join(ass) + "\n")
open("production/006-subs.srt", "w").write("\n".join(srt))
print(len(words), "words,", len(chunks), "subtitle lines; first:", srt[2], "| last:", srt[-2])
