"""Build the 014 edit timeline (frames @30fps) from Whisper word timings of the voice-over.

Every shot starts on a spoken word: SHOTS lists (anchor phrase, visual, overlays). The anchor is found in the word list
(in order), and the cut lands 0.07 s before that word. Number titles are their own shots anchored on the spoken number.
Input:  remotion-overlays/public/clips/014/vo-long-words.json (Whisper small.en, word_timestamps=True)
Output: remotion-overlays/src/gta6/v014.json
"""
import json, re, subprocess

FPS = 30
LEAD = 0.30   # voice starts this late
TAIL = 3.0    # hold after the last word
ROOT = "remotion-overlays/public/"
W = json.load(open(ROOT + "clips/014/vo-long-words.json"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
WN = [norm(w["w"]) for w in W]
_pos = [0]

def find(phrase, advance=True):
    toks = [norm(t) for t in phrase.split()]
    for i in range(_pos[0], len(WN) - len(toks) + 1):
        if WN[i:i + len(toks)] == toks:
            if advance: _pos[0] = i + 1
            return i
    raise SystemExit(f"anchor not found after word {_pos[0]}: {phrase!r}  (next: {' '.join(WN[_pos[0]:_pos[0]+12])})")

def t_of(phrase):          # start time of a phrase without moving the cursor
    return W[find(phrase, advance=False)]["s"]

def dur(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                capture_output=True, text=True).stdout)

C = lambda n, **k: {"kind": "clip", "src": f"clips/014/c/{n}.mp4", **k}
P = lambda n, **k: {"kind": "clip", "src": f"clips/006p/{n}.mp4", **k}
I = lambda n, **p: {"kind": "comp", "name": n, "props": p}
T = lambda num, title, under: ("TITLE", num, title, under)
cap = lambda text, hi=None, **k: ("caption", {"text": text, "hi": hi or text.split()[0], **k})
src = lambda tier, outlet: ("source", {"tier": tier, "outlet": outlet})
stamp = lambda text: ("stamp", {"text": text})
dim = lambda n: ("dimclip", {"src": f"clips/014/c/{n}.mp4"})

# Clips that drift into the wrong scene after their first second are capped with "avail" (frames) and then held.
CONV = P("lt_0027_hero")
BYCAR = C("lt_bycar", avail=40)
WEAZEL = C("t1_weazel", avail=14)
VAULT = C("lt_vault", avail=14)

SHOTS = [
 # HOOK
 ("GTA VI judges you", CONV, [cap("IT JUDGES YOU", "JUDGES")]),
 ("GTA V never did", C("t1_highway"), [cap("GTA 5 NEVER DID", "NEVER")]),
 ("Here's how", P("el_1404_heli"), [cap("…AND THE COPS ARE NEXT", "COPS")]),
 # 1 — criminal profile
 ("Edge magazine saw", ("TITLE", 1, "The criminal profile", "clips/014/c/lt_bycar.mp4")),
 ("90 minutes of the game", C("el_skydive"), [src("REPORTED", "Edge magazine")]),
 ("One end is", "METER", [dim("t1_causeway")]),
 ("And Edge says it affects", BYCAR, [src("REPORTED", "Edge magazine")]),
 ("In GTA V Trevor", C("t1_lowriders"), [cap("GTA 5: NO CONSEQUENCES", "NO")]),
 ("In GTA VI it notices", CONV, [stamp("IT NOTICES")]),
 ("That's the change", P("el_1524_chase"), [cap("THAT'S JUST #1", "#1")]),
 ("Ten more", C("el_cops_pass"), [cap("10 MORE", "10")]),
 ("Number 11 gets you", P("lt_0111_policecar"), [cap("#11 GETS YOU ARRESTED", "ARRESTED")]),
 # 2 — relationship
 ("Two", T(2, "The relationship", "clips/014/c/t2_beachgym.mp4")),
 ("Jason and Lucia have", C("t2_beachgym"), [src("REPORTED", "Edge magazine")]),
 ("Edge reports a four", I("Hearts", every=0.45), [dim("t1_motel")]),
 ("Marriage", C("t1_motel"), [stamp("NOT CONFIRMED")]),
 # 3 — who you play
 ("Three that's because", T(3, "Who you play", "clips/014/c/t2_reunion.mp4")),
 ("GTA V gave you", I("ThreeMen"), [dim("t1_lowriders")]),
 ("GTA VI gives you two", C("t2_reunion"), [src("CONFIRMED", "Rockstar Games"), cap("JASON & LUCIA", "JASON", top=True)]),
 ("And for the first time", BYCAR, [cap("A WOMAN LEADS", "WOMAN")]),
 # 4 — the map
 ("Four where you play", T(4, "The map", "clips/014/c/t2_keys.mp4")),
 ("GTA V was Los Santos", I("TextCard", text="LOS SANTOS", sub="GTA 5 · 2013", color="#9A9AA0"), [dim("t1_highway")]),
 ("GTA VI is a whole state", C("t2_keys"), [cap("LEONIDA", "LEONIDA"), src("CONFIRMED", "Rockstar Games")]),
 ("Vice City is the big", C("t1_causeway"), [cap("VICE CITY", "VICE")]),
 ("with islands swamps", C("t1_everglades"), []),
 ("It's our first time back", C("t1_highway"), [cap("FIRST TIME IN 20 YEARS", "20")]),
 # 5 — interiors
 ("Five and you can go", T(5, "Interiors", "clips/014/c/t2_nightclub.mp4")),
 ("In GTA V most", C("t2_storedoor"), [cap("GTA 5: PAINTED-ON DOORS", "PAINTED-ON")]),
 ("Rockstar North's Aaron", C("el_apartment"), [src("REPORTED", "Edge (Aaron Garbut)")]),
 ("That's roughly ten times", I("TextCard", text="×10", sub="INTERIORS"), [dim("t2_nightclub")]),
 ("Bars clubs", C("t2_nightclub"), []),
 ("apartments", C("el_apartment", startFrom=40), []),
 ("stores", C("el_stripmall"), []),
 ("offices", VAULT, []),
 ("And once you're inside", WEAZEL, [cap("TV ON WEAZEL", "TV")]),
 ("This week Rockstar showed", I("MaccaCard"), [dim("t1_everglades"), src("CONFIRMED", "Rockstar Games")]),
 ("Halfway", C("el_calm_van"), [cap("HALFWAY", "HALFWAY")]),
 ("And the next one is", C("el_cops_pass"), [cap("THE ESCAPE TRICK", "ESCAPE")]),
 # 6 — bus & train
 ("Six you can ride", T(6, "Buses & trains", "clips/014/c/el_bus.mp4")),
 ("the bus and the train", C("el_bus"), [cap("RIDE THE BUS", "BUS")]),
 ("In GTA V if you didn't", C("t1_driving_cash"), [cap("GTA 5: TAKE A TAXI", "TAXI")]),
 ("In GTA VI Rockstar's Phil", C("el_bus", startFrom=60), [src("REPORTED", "Edge (Phil Hooker)")]),
 ("If the police didn't see", C("el_cops_pass"), [cap("THEY DIDN'T SEE YOU", "DIDN'T")]),
 ("you can ride away", C("el_calm_van"), []),
 # 7 — animals
 ("Seven GTA V had", T(7, "Animals", "clips/014/c/el_boar.mp4")),
 ("deer cougars", C("el_boar"), [cap("GTA 5: DEER · COUGARS · SHARKS", "DEER")]),
 ("Game Informer reports", I("TextCard", text="170+", sub="ANIMAL SPECIES"), [dim("t1_everglades"), src("REPORTED", "Game Informer")]),
 ("Flamingos manatees", C("t1_everglades"), [cap("FLAMINGOS · MANATEES · PELICANS", "FLAMINGOS")]),
 ("alligators", C("t1_alligator_post"), [cap("ALLIGATORS", "ALLIGATORS")]),
 ("Some are rare", C("el_lifestyle"), [cap("RARE · LEGENDARY", "LEGENDARY")]),
 # 8 — radio on foot
 ("Eight the radio", T(8, "Radio on foot", "clips/014/c/el_walk_store.mp4")),
 ("doesn't stop when", C("t1_driving_cash", startFrom=20), []),
 ("Jason and Lucia can listen", C("el_walk_store"), [cap("🎧 EARBUDS", "EARBUDS"), src("REPORTED", "Rockstar via IGN")]),
 ("And Rockstar says there are podcasts", C("t2_highway"), [cap("PODCASTS ON DEMAND", "PODCASTS")]),
 ("Three left", P("el_1517_tunnel"), [cap("3 LEFT", "3")]),
 # 9 — fuel
 ("Nine in GTA V", T(9, "Fuel", "clips/014/c/t1_gas_rain.mp4")),
 ("your car never ran out", C("lt_supercars"), [cap("GTA 5: NEVER RAN DRY", "NEVER")]),
 ("In GTA VI there's a fuel", C("t1_gas_rain"), [cap("FUEL GAUGE + ENGINE HEALTH", "FUEL")]),
 ("And Edge says a car you steal", C("el_slimjim"), [src("REPORTED", "Edge magazine")]),
 ("So the car you grab", P("el_1524_chase"), [cap("ALMOST EMPTY", "EMPTY")]),
 # 10 — rob almost anything
 ("Ten in GTA V", T(10, "Rob almost anything", "clips/014/c/el_stripmall.mp4")),
 ("a robbery outside", C("t2_storedoor"), [cap("GTA 5: JUST THE REGISTER", "REGISTER")]),
 ("Rob Nelson from", C("el_stripmall"), [src("REPORTED", "IGN (Rob Nelson)")]),
 ("Including a bank", VAULT, [cap("EVEN A BANK", "BANK")]),
 ("And if you blow", P("el_1759_entrance"), [cap("BLOW THE SAFE = LESS LOOT", "LESS")]),
 ("And that's where number 11", P("lt_0111_policecar"), [cap("#11", "#11")]),
 ("Because in GTA VI the robbery", P("t2_0046_police"), [cap("THE ROBBERY IS THE EASY PART", "EASY")]),
 # 11 — police
 ("Eleven the police", T(11, "The police", "clips/006p/el_1404_heli.mp4")),
 ("GTA V stopped at five", I("StarRow", mode="white", lit=5, label="GTA 5: FIVE STARS", sub="Max wanted level", bg=""), [dim("t1_causeway")]),
 ("GTA VI brings back six", I("StarRow", mode="red", lit=6, label="GTA 6: SIX STARS", sub="Back for the first time since GTA 4", bg=""), [dim("t1_causeway")]),
 ("And the cops remember", P("el_1404_heli"), [cap("THE COPS REMEMBER", "REMEMBER")]),
 ("Edge says they track", I("IconPanel", bg="", title="WHAT THEY TRACK", caseNo="GTA 6", icons="ICONS"), [("dimclip", {"src": "clips/006p/el_1524_chase.mp4"}), src("REPORTED", "Edge magazine")]),
 ("That's how a GTA V player", P("lt_0111_policecar"), [cap("ARRESTED IN HOUR ONE", "ARRESTED")]),
 ("The way out", P("el_1804_hollow"), [cap("HOLLOW STARS = THEY DON'T KNOW YOU", "HOLLOW"), src("REPORTED", "GameSpot")]),
 ("Change your clothes", P("el_0906_store"), [cap("CHANGE CLOTHES", "CLOTHES")]),
 ("swap the car", P("el_1552_garage"), [cap("SWAP THE CAR", "SWAP")]),
 ("split up", P("el_1640_split"), [cap("SPLIT UP", "SPLIT")]),
 # RECAP — one shot per item, on its word
 ("So that's eleven", I("TextCard", text="THE 11", sub="GTA 5 → GTA 6"), [dim("el_skydive")]),
 ("a game that judges you", CONV, [cap("JUDGES YOU", "JUDGES")]),
 ("a relationship", C("t2_beachgym"), [cap("RELATIONSHIP", "RELATIONSHIP")]),
 ("two leads", C("t2_reunion", startFrom=150), [cap("TWO LEADS", "TWO")]),
 ("Leonida", C("t2_keys"), [cap("LEONIDA", "LEONIDA")]),
 ("ten times the interiors", C("t2_nightclub"), [cap("×10 INTERIORS", "×10")]),
 ("buses", C("el_bus"), [cap("BUSES", "BUSES")]),
 ("170 animals", C("el_boar"), [cap("170 ANIMALS", "170")]),
 ("radio on foot", C("el_walk_store"), [cap("RADIO ON FOOT", "RADIO")]),
 ("fuel", C("t1_gas_rain"), [cap("FUEL", "FUEL")]),
 ("rob anything", VAULT, [cap("ROB ANYTHING", "ROB")]),
 ("and police that remember", P("el_1404_heli"), [cap("POLICE THAT REMEMBER", "REMEMBER")]),
 ("Every source is in", C("el_skydive", startFrom=60), [cap("ALL SOURCES IN THE DESCRIPTION", "SOURCES")]),
 # CLOSE
 ("So which way are you playing", "METER_END", [dim("t1_highway")]),
]

ICONS = [{"key": k, "fix": "", "onSec": 0.25 + i * 0.32, "fixSec": 99} for i, k in enumerate(["face", "hanger", "gun", "duo", "camera"])]

# Whisper may write numbers/names differently; map our anchors to what it heard.
ALIAS = {"Leonida": "Leonita"}

def anchor_index(ph):
    for a, b in ALIAS.items():
        ph = ph.replace(a, b)
    return find(ph)

_cl = {}
def clipframes(s):
    if s not in _cl: _cl[s] = int(dur(ROOT + s) * FPS)
    return _cl[s]

def annotate(v, slot):
    if v.get("kind") != "clip": return v
    v = dict(v); sf = v.get("startFrom", 0); avail = max(min(clipframes(v["src"]) - sf, v.get("avail", 10**6)), 2)
    rate = max(0.5, min(1.0, avail / slot)); play = min(slot, int(avail / rate) - 1)
    v.update(startFrom=sf, rate=round(rate, 3), play=max(play, 1)); v.pop("avail", None); return v

starts = []
for ph, *_ in SHOTS:
    i = anchor_index(ph)
    starts.append((i, W[i]["s"]))
end_t = W[-1]["e"] + TAIL

items, audio, sections = [], [{"src": "clips/014/vo-long.mp3", "from": round(LEAD * FPS)}], []
cur_num, sec_from = None, 0
for k, (ph, vis, *ov) in enumerate(SHOTS):
    ov = ov[0] if ov else []
    i, t0 = starts[k]
    t1 = starts[k + 1][1] if k + 1 < len(SHOTS) else end_t
    fa = round((LEAD + max(t0 - 0.07, 0)) * FPS) if k else 0
    fb = round((LEAD + max(t1 - 0.07, 0)) * FPS) if k + 1 < len(SHOTS) else round((LEAD + end_t) * FPS)
    d = fb - fa
    rel = lambda phrase: round(t_of(phrase) - t0, 2)
    if isinstance(vis, tuple) and vis[0] == "TITLE":
        _, num, title, under = vis
        items.append({"from": fa, "dur": d, "visual": {"kind": "title", "num": num, "title": title, "under": under}, "overlays": []})
        audio += [{"src": "clips/006/sfx/whoosh.wav", "from": fa, "vol": 0.5}, {"src": "clips/006/sfx/hit.wav", "from": fa + 3, "vol": 0.45}]
        if cur_num is not None: sections.append({"num": cur_num, "from": sec_from, "to": fa})
        cur_num, sec_from = num, fa
        continue
    if vis == "METER":
        _pos[0] = i  # rel() searches from here
        vis = I("ProfileMeter", stops=[[0, 0.5], [rel("with an angel"), 0.08], [rel("with a devil"), 0.92],
                                       [rel("Play it cool"), 0.18], [rel("Cause chaos"), 0.86]])
        _pos[0] = i + 1
    elif vis == "METER_END":
        _pos[0] = i
        vis = I("ProfileMeter", label="WHICH WAY ARE YOU PLAYING?", stops=[[0, 0.5], [rel("Professional"), 0.1], [rel("or irredeemable"), 0.9], [rel("Tell me"), 0.5]])
        _pos[0] = i + 1
    elif vis.get("kind") == "comp" and vis["props"].get("icons") == "ICONS":
        vis = {**vis, "props": {**vis["props"], "icons": ICONS}}
    if ph == "So that's eleven": recap_from = fa
    items.append({"from": fa, "dur": d, "visual": annotate(vis, d), "overlays": [{"type": x, **p} for x, p in ov]})
    for x, p in ov:
        if x == "stamp": audio.append({"src": "clips/006/sfx/hit.wav", "from": fa + 6, "vol": 0.55})
# the last numbered section (#11) ends where the recap starts
sections.append({"num": cur_num, "from": sec_from, "to": recap_from})
total = round((LEAD + end_t) * FPS)
json.dump({"fps": FPS, "durationInFrames": total, "items": items, "audio": audio, "sections": sections},
          open("remotion-overlays/src/gta6/v014.json", "w"), indent=1)
print(f"{len(items)} shots, {total} frames = {total / FPS:.1f}s, sections {[(s['num'], s['from'], s['to']) for s in sections]}")
short = [(it["from"] / FPS, it["dur"]) for it in items if it["dur"] < 12]
print("shots under 0.4 s:", short)
