"""Build the 006 edit timeline (frames @30fps) from the voiceover sections.

Each section lists its shots as (words, visual, overlays). Shot boundaries are placed by word share of the section,
then snapped to the nearest real pause in the voice (silencedetect), so cuts land between sentences.
Output: remotion-overlays/src/gta6/v006.json
"""
import json, re, subprocess
FPS = 30
VO = "remotion-overlays/public/clips/006/vo"
GAP = 0.45          # silence between sections (s)
LEAD = 0.25         # voice starts this late

def pauses(path):
    err = subprocess.run(["ffmpeg", "-i", path, "-af", "silencedetect=noise=-34dB:d=0.16", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", err)]
    en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", err)]
    return [(a + b) / 2 for a, b in zip(st, en)]

def dur(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                capture_output=True, text=True).stdout)

C = lambda n: {"kind": "clip", "src": f"clips/006p/{n}.mp4"}
I = lambda n, **p: {"kind": "comp", "name": n, "props": p}

# (title words | None, [(words, visual, [overlays])...])
S = [
 (None, [(8, C("t1_0027_street"), [("caption", {"text": "10 HIDDEN DETAILS", "hi": "10"})]),
         (8, C("el_1752_strip"), []),
         (7, C("t1_0022_crowd"), [("caption", {"text": "THEY GET YOU CAUGHT", "hi": "CAUGHT"})]),
         (7, C("el_1812_phone"), [])]),
 (6, [(16, C("el_0906_store"), [("caption", {"text": "GTA 5: NOBODY BLINKED", "hi": "NOBODY"})]),
      (11, I("QuoteCard", quote="If you can produce an automatic shotgun out of nowhere and they don't react, then that doesn't work.", speaker="Rob Nelson", outlet="Rockstar North · Edge", bg=""), [("dim", {})]),
      (17, I("IllGunAwareness"), []),
      (11, C("t2_0156_turn"), []),
      (9, C("t1_0027_street"), [("source", {"tier": "REPORTED", "outlet": "Edge magazine"})]),
      (8, C("t2_0043_storedoor"), [])]),
 (6, [(8, C("t2_0115_robber"), []),
      (10, C("t2_0116_victim"), [("source", {"tier": "REPORTED", "outlet": "Edge magazine"})]),
      (9, I("IllVictimLunge"), []),
      (11, C("el_1759_entrance"), []),
      (6, C("t1_0109_mask"), [("caption", {"text": "NO SCRIPT ANYMORE", "hi": "NO"})])]),
 (7, [(11, C("el_0606_slimjim"), [("callout", {"x": 722, "y": 786, "r": 64, "label": "Slim Jim or smash"})]),
      (2, C("t1_0100_driving"), [("caption", {"text": "YOU'RE NOT", "hi": "NOT"})]),
      (16, I("IllOwnerCall"), []),
      (6, C("t1_0103_cash"), []),
      (13, C("el_1620_van"), [("source", {"tier": "REPORTED", "outlet": "Edge magazine"})])]),
 (5, [(7, C("lt_0047_supercars"), []),
      (31, I("IllTracker"), []),
      (12, C("el_1524_chase"), [("caption", {"text": "WRECK IT = LESS CASH", "hi": "LESS"})]),
      (14, C("el_1552_garage"), [("source", {"tier": "REPORTED", "outlet": "Edge magazine"})])]),
 (4, [(8, C("t2_0146_alley"), []),
      (7, C("lt_0053_heli"), [("searchlight", {})]),
      (15, C("el_1517_tunnel"), [("source", {"tier": "REPORTED", "outlet": "Edge magazine"})]),
      (10, {"kind": "clip", "src": "clips/006p/el_1524_chase.mp4", "startFrom": 240}, [("caption", {"text": "BACK ALLEYS > FULL SPEED", "hi": "ALLEYS"})])]),
 (6, [(13, C("t2_0046_police"), []),
      (17, C("lt_0111_policecar"), [("source", {"tier": "REPORTED", "outlet": "Edge magazine"})]),
      (8, C("t2_0229_bike"), []),
      (29, I("IllStinger"), []),
      (8, C("el_1544_police"), [("stamp", {"text": "CAUGHT"})])]),
 (6, [(4, C("el_1404_heli"), []),
      (15, {"kind": "clip", "src": "clips/006p/el_1524_chase.mp4", "startFrom": 300}, [("source", {"tier": "REPORTED", "outlet": "GameSpot"})]),
      (6, I("StarRow", mode="white", lit=4, label="Solid white", sub="They can see you", bg=""), [("dimclip", {"src": "clips/006p/el_1524_chase.mp4"})]),
      (6, I("StarRow", mode="flashing", lit=4, label="Flashing", sub="You've broken line of sight", bg=""), [("dimclip", {"src": "clips/006p/el_1517_tunnel.mp4"})]),
      (18, I("StarRow", mode="red", lit=4, label="Solid red", sub="They're looking. They don't know where.", bg=""), [("dimclip", {"src": "clips/006p/el_1552_garage.mp4"})])]),
 (5, [(12, {"kind": "clip", "src": "clips/006p/el_1524_chase.mp4", "startFrom": 380}, []),
      (18, I("IconPanel", bg="", icons=[{"key": k, "fix": "", "onSec": 0.4 + i * 0.35, "fixSec": 99} for i, k in enumerate(["camera", "hanger", "duo", "gun", "car", "face"])]), [("dimclip", {"src": "clips/006p/el_1524_chase.mp4"}), ("source", {"tier": "REPORTED", "outlet": "Edge magazine"})]),
      (13, C("el_1704_cameras"), [("caption", {"text": "CCTV → DESTROY FOOTAGE", "hi": "DESTROY"})]),
      (17, C("el_0906_store"), [("caption", {"text": "CLOTHES → CHANGE, UNSEEN", "hi": "CHANGE"})]),
      (12, C("el_1644_split"), [("caption", {"text": "TWO PEOPLE → SPLIT UP", "hi": "SPLIT"})]),
      (10, C("t2_0115_robber"), [("caption", {"text": "GUN → DITCH IT", "hi": "DITCH"})]),
      (7, C("el_1552_garage"), [("caption", {"text": "CAR → SWAP IT", "hi": "SWAP"})]),
      (8, C("t1_0105_mugshot"), [("caption", {"text": "FACE → MASK?", "hi": "MASK?", "top": True})]),
      (8, C("t1_0109_mask"), [("source", {"tier": "THEORY", "outlet": "GameSpot's suggestion"})])]),
 (4, [(11, C("el_1620_van"), []),
      (14, C("el_1804_hollow"), [("source", {"tier": "REPORTED", "outlet": "GameSpot"})]),
      (22, {"kind": "clip", "src": "clips/006p/el_1804_hollow.mp4", "startFrom": 90}, [("callout", {"x": 1790, "y": 46, "r": 70, "label": "Hollow stars", "side": "left"})]),
      (10, I("SplitCompare", title="WHAT THE COPS KNOW", left={"img": "frames/el-1540-icons.jpg", "crop": [3200, 20, 640, 240], "label": "BEFORE · 4 ICONS", "color": "#FF3B3B"}, right={"img": "frames/el-1808-hollow.jpg", "crop": [3200, 20, 640, 240], "label": "AFTER · NONE", "color": "#3CFF6B"}, bg=""), []),
      (8, I("StarRow", mode="hollow", lit=2, label="Hollow stars", sub="Still wanted. Nothing on you.", bg=""), [("dimclip", {"src": "clips/006p/el_1804_hollow.mp4"})])]),
 (7, [(9, C("el_1752_strip"), []),
      (17, C("el_1812_phone"), [("source", {"tier": "REPORTED", "outlet": "GameSpot · Rob Nelson"})]),
      (6, C("el_1824_live"), []),
      (14, C("t2_0043_storedoor"), []),
      (18, I("IllStoreClear"), []),
      (19, I("QuoteCard", quote="I basically started picking fights with them, provoking them and then immediately defusing it. Then they would leave the store, so that would clear them out and I could rob it more cleanly.", speaker="Phil Hooker", outlet="Rockstar North · Edge", wps=9, bg=""), [("dim", {})]),
      (7, C("t1_0109_mask"), [("caption", {"text": "NO REPORT FILED", "hi": "NO"})])]),
 (None, [(25, C("el_1848_skydive"), []),
         (14, C("lt_0027_hero"), [("caption", {"text": "WHICH GETS YOU FIRST? 👇", "hi": "FIRST?"})]),
         (10, C("zip_cover_art"), [])]),
]
NUM = [None, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, None]
TITLES = [None, "They clock your gun", "The victim fights back", "The owner calls it in", "The car snitches", "The searchlight",
          "They talk to each other", "The stars change colour", "The police report", "Hollow stars", "No witnesses, no report", None]

_cl = {}
def clipframes(src):
    if src not in _cl: _cl[src] = int(dur("remotion-overlays/public/" + src) * FPS)
    return _cl[src]
def annotate(v, slot):
    if v.get("kind") != "clip": return v
    v = dict(v); sf = v.get("startFrom", 0); avail = max(clipframes(v["src"]) - sf, 2)
    rate = max(0.5, min(1.0, avail / slot)); play = min(slot, int(avail / rate) - 1)
    v.update(startFrom=sf, rate=round(rate, 3), play=max(play, 1)); return v
sections = []
items, audio, t = [], [], LEAD
for si, (title_w, shots) in enumerate(S):
    f = f"{VO}/{si:02d}.wav"
    d = dur(f); ps = pauses(f)
    audio.append({"src": f"clips/006/vo/{si:02d}.wav", "from": round(t * FPS)})
    total_w = (title_w or 0) + sum(w for w, _, _ in shots)
    # boundaries in seconds within the section, by word share, snapped to nearest pause (±0.7 s)
    def snap(x):
        c = [p for p in ps if abs(p - x) <= 0.7]
        return min(c, key=lambda p: abs(p - x)) if c else x
    cuts = [0.0]
    acc = title_w or 0
    if title_w:
        est = acc / total_w * d * 1.15
        later = [p for p in ps if est * 0.95 <= p <= est + 0.8]
        cuts.append(min(later) if later else est)
    for w, _, _ in shots[:-1]:
        acc += w
        cuts.append(snap(acc / total_w * d))
    end = d + (GAP if si < len(S) - 1 else 2.5)
    for k in range(1, len(cuts)):
        cuts[k] = max(cuts[k], cuts[k - 1] + 0.6)
    cuts.append(end)
    seq = ([("title", None, [])] if title_w else []) + [(None, v, o) for _, v, o in shots]
    for k, (tag, vis, ov) in enumerate(seq):
        a, b = t + cuts[k], t + cuts[k + 1]
        fa, fb = round(a * FPS), round(b * FPS)
        if tag == "title":
            nxt = seq[1][1]
            items.append({"from": fa, "dur": fb - fa, "visual": {"kind": "title", "num": NUM[si], "title": TITLES[si],
                          "under": nxt.get("src") if nxt.get("kind") == "clip" else "clips/006p/el_1524_chase.mp4"}, "overlays": []})
            audio.append({"src": "clips/006/sfx/whoosh.wav", "from": fa, "vol": 0.55})
            audio.append({"src": "clips/006/sfx/hit.wav", "from": fa + 3, "vol": 0.5})
        else:
            items.append({"from": fa, "dur": fb - fa, "visual": annotate(vis, fb - fa), "overlays": [{"type": x, **p} for x, p in ov]})
            for x, p in ov:
                if x in ("stamp",): audio.append({"src": "clips/006/sfx/hit.wav", "from": fa + 6, "vol": 0.6})
                if x == "callout": audio.append({"src": "clips/006/sfx/tick.wav", "from": fa + 20, "vol": 0.5})
    if si in (1, 6):
        audio.append({"src": "clips/006/sfx/radio.wav", "from": round(t * FPS) + 2, "vol": 0.35})
    sections.append({"num": NUM[si], "from": round(t * FPS), "to": round((t + cuts[-1]) * FPS)})
    t += cuts[-1]

progress = [{"from": items[0]["from"], "num": 0}]
total = round(t * FPS)
out = {"fps": FPS, "durationInFrames": total, "items": items, "audio": audio,
       "sections": sections}
json.dump(out, open("remotion-overlays/src/gta6/v006.json", "w"), indent=1)
print("total", round(t, 2), "s =", total, "frames;", len(items), "shots;", len(audio), "audio cues")
too_short = [(i["visual"].get("src", i["visual"].get("name")), round(i["dur"] / FPS, 2)) for i in items if i["dur"] < 30]
print("shots under 1 s:", too_short)
