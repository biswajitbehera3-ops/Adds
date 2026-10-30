# Launch film "Why don't they come back?": renders the vertical cut from the Higgsfield assets, the real app
# screens and the narration, frame by frame (Pillow), then mixes the sound (ffmpeg). Runs in the Higgsfield sandbox.
#   python3 film.py plan            -> prints the cue sheet
#   python3 film.py frames A B out  -> renders frames A..B-1 to out.mp4 (silent)
#   python3 film.py still T out.jpg -> one frame at T seconds
#   python3 film.py audio out.wav   -> narration + sound effects
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

W, H, FPS = 1080, 1920, 24
HOME = os.path.expanduser("~")
FILM, NARR, COL, CLIPS, SCR, SFX = (f"{HOME}/film", f"{HOME}/narr", f"{HOME}/collage", f"{HOME}/film/clipframes", f"{HOME}/film/scr", f"{HOME}/film/sfx")
BOLD = "/usr/share/fonts/truetype/higgsfield/Metropolis-ExtraBold.ttf"
MONO = "/usr/share/fonts/opentype/urw-base35/NimbusMonoPS-Bold.otf"
INK, GOLD, RED, PAPER = (43, 33, 28), (214, 158, 64), (178, 38, 44), (239, 231, 214)
_fonts = {}
def font(path, size):
    if (path, size) not in _fonts: _fonts[(path, size)] = ImageFont.truetype(path, size)
    return _fonts[(path, size)]

def clamp01(x): return 0.0 if x < 0 else 1.0 if x > 1 else x
def ease(x): x = clamp01(x); return x * x * (3 - 2 * x)
def eout(x): x = clamp01(x); return 1 - (1 - x) ** 3
def lerp(a, b, x): return a + (b - a) * x
def prog(t, a, b): return clamp01((t - a) / (b - a))

# ---------------------------------------------------------------- narration timing
TEXT = {
    1: "Every salon has a customer like Priya.",
    2: "She came in once. She loved her haircut. And then… she never came back.",
    3: "Was it the haircut? No. It's simpler than that. Nobody reminded her.",
    4: "In a lot of salons, customers live in a notebook, or in someone's memory.",
    5: "So we built an app that remembers for you.",
    6: "Thirty days after her visit, Priya shows up on a list: due back this week.",
    7: "One tap, and she gets a reminder on WhatsApp.",
    8: "She books. And she comes back.",
    9: "Then something better happens. Priya tells a friend.",
    10: "And both of them get ₹100 in their salon wallet.",
    11: "One customer back. One brand-new customer.",
    12: "Meanwhile, you can see your whole salon, live.",
    13: "Every chair. Every bill. What each stylist earned today.",
    14: "Who came in late. Who asked for leave.",
    15: "And if a bill quietly gets undone, you'll know.",
    16: "We set it up with your prices and your stylists. So the customers who left quietly… start coming back.",
}
GAP = {2: 1.2, 3: 0.9, 5: 0.9, 8: 0.8, 11: 1.0, 15: 1.0}
TITLE_AFTER = {4: 1.6, 11: 1.6}

def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))

START, DUR = {}, {}
_t = 0.5
for _i in range(1, 17):
    START[_i] = _t
    DUR[_i] = dur(f"{NARR}/n_{_i:02d}.wav")
    _t += DUR[_i] + GAP.get(_i, 0.6) + TITLE_AFTER.get(_i, 0)
END_CARD = _t
TOTAL = END_CARD + 4.0
WORDS = json.load(open(f"{FILM}/words.json"))

def w(line, word, which=0, edge=0):
    """Absolute time a spoken word starts (edge=0) or ends (edge=1)."""
    hits = [x for x in WORDS[f"{line:02d}"] if x[0].lower().strip(".,?!…:'’").startswith(word.lower())]
    if len(hits) <= which: raise KeyError(f"line {line}: no word '{word}' #{which} in {WORDS[f'{line:02d}']}")
    return START[line] + hits[which][1 + edge]

# Title cards sit in the extra silence after lines 4 and 11.
T1 = (START[4] + DUR[4] + 0.6, START[5])
T2 = (START[11] + DUR[11] + 1.0, START[12])

# ---------------------------------------------------------------- shared pictures
def make_paper():
    rng = np.random.default_rng(3)
    base = np.ones((H, W, 3)) * np.array(PAPER, float)
    low = rng.normal(0, 1, (H // 6, W // 6))
    low = np.array(Image.fromarray(((low * 30) + 128).clip(0, 255).astype("uint8")).resize((W, H), Image.BICUBIC), float) - 128
    base += (low * 0.18 + rng.normal(0, 3.5, (H, W)))[..., None]
    yy, xx = np.mgrid[0:H, 0:W]
    d = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
    base *= (1 - 0.07 * d)[..., None]
    return Image.fromarray(base.clip(0, 255).astype("uint8"))
PAPER_IMG = make_paper()

def shadowed(rgba, blur=22, alpha=120, dy=14, pad=50, radius=0):
    """Puts an RGBA picture on a transparent layer with a soft drop shadow; returns (layer, pad)."""
    w_, h_ = rgba.size
    L = Image.new("RGBA", (w_ + 2 * pad, h_ + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("L", L.size, 0)
    sh.paste(rgba.getchannel("A").point(lambda a: alpha if a > 8 else 0), (pad + 4, pad + dy))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    L.paste(Image.new("RGBA", L.size, (40, 26, 18, 255)), (0, 0), sh)
    L.alpha_composite(rgba, (pad, pad))
    return L, pad

def bordered(img, border=18, col=(255, 253, 248)):
    out = Image.new("RGBA", (img.width + 2 * border, img.height + 2 * border), col + (255,))
    out.paste(img.convert("RGB"), (border, border))
    return out

_src = {}
def collage(n):
    if n not in _src:
        im = Image.open(f"{COL}/{n}.png").convert("RGB")
        _src[n] = im.resize((1350, round(1350 * im.height / im.width)), Image.LANCZOS)
    return _src[n]

def kb(n, x, z0, z1, c0=(0.5, 0.5), c1=None):
    """Ken Burns move across a collage picture: zoom z0->z1, centre c0->c1, x = 0..1."""
    src = collage(n); c1 = c1 or c0; e = ease(x)
    z = lerp(z0, z1, e); cx = lerp(c0[0], c1[0], e) * src.width; cy = lerp(c0[1], c1[1], e) * src.height
    bw = min(src.width, src.height * W / H) / z; bh = bw * H / W
    cx = min(max(cx, bw / 2), src.width - bw / 2); cy = min(max(cy, bh / 2), src.height - bh / 2)
    return src.resize((W, H), Image.BILINEAR, box=(cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2))

# ---- phone with a real app screen
PH_H, BZ = 1480, 20
SC_H = PH_H - 2 * BZ; SC_W = round(SC_H * 1170 / 2532); PH_W = SC_W + 2 * BZ
PX, PY = (W - PH_W) // 2, 105
SS = SC_W / 1170
_phones = {}
def phone(name):
    if name not in _phones:
        body = Image.new("RGBA", (PH_W, PH_H), (0, 0, 0, 0))
        d = ImageDraw.Draw(body)
        d.rounded_rectangle([0, 0, PH_W - 1, PH_H - 1], 70, fill=(22, 16, 14, 255))
        d.rounded_rectangle([2, 2, PH_W - 3, PH_H - 3], 68, outline=(92, 72, 60, 255), width=2)
        scr = Image.open(f"{SCR}/{name}.jpg").convert("RGB").resize((SC_W, SC_H), Image.LANCZOS)
        m = Image.new("L", (SC_W, SC_H), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, SC_W - 1, SC_H - 1], 52, fill=255)
        body.paste(scr, (BZ, BZ), m)
        _phones[name] = shadowed(body, blur=28, alpha=150, dy=22, pad=60)
    return _phones[name]

class PhoneShot:
    """A phone on the paper board; screens swap with a short dissolve; marks follow the phone."""
    def __init__(self, t0, t1, screens, enter="slide", zoom=(1.0, 1.03)):
        self.t0, self.t1, self.screens, self.enter, self.zoom, self.marks = t0, t1, screens, enter, zoom, []
    def mark(self, kind, t, box=None, dur=0.6, **kw):
        self.marks.append((kind, t, box, dur, kw)); return self
    def geometry(self, t):
        s = lerp(self.zoom[0], self.zoom[1], ease(prog(t, self.t0, self.t1)))
        dy = 0.0
        if self.enter == "slide": dy = (1 - eout(prog(t, self.t0, self.t0 + 0.35))) * 1500
        if self.enter == "drop": dy = -(1 - eout(prog(t, self.t0, self.t0 + 0.5))) * 1700
        return s, dy
    def to_frame(self, x, y, t):
        s, dy = self.geometry(t)
        cx, cy = W / 2, PY + PH_H / 2
        fx, fy = PX + BZ + x * SS, PY + BZ + y * SS
        return cx + s * (fx - cx), cy + s * (fy - cy) + dy
    def render(self, t, bg):
        cur = [sc for sc in self.screens if sc[0] <= t] or self.screens[:1]
        layer, pad = phone(cur[-1][1])
        if len(cur) >= 2 and t - cur[-1][0] < 0.25:
            prev, _ = phone(cur[-2][1]); layer = Image.blend(prev, layer, ease((t - cur[-1][0]) / 0.25))
        s, dy = self.geometry(t)
        if abs(s - 1) > 1e-3: layer = layer.resize((round(layer.width * s), round(layer.height * s)), Image.BILINEAR)
        cx, cy = W / 2, PY + PH_H / 2
        x0 = round(cx - layer.width / 2); y0 = round(cy - layer.height / 2 + dy)
        out = bg.copy().convert("RGBA"); out.alpha_composite(layer, (x0, y0)) if x0 >= 0 and y0 >= 0 else out.paste(layer, (x0, y0), layer)
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        for kind, mt, box, md, kw in self.marks:
            p = prog(t, mt, mt + md)
            if t < mt: continue
            draw_mark(d, ov, kind, p, t - mt, box, lambda x, y: self.to_frame(x, y, t), kw)
        out.alpha_composite(ov)
        return out.convert("RGB")

def draw_mark(d, ov, kind, p, age, box, mp, kw):
    if kind in ("outline", "circle", "underline"):
        x, y, bw, bh = box
        if kind == "outline":
            m = kw.get("m", 14)
            pts = rect_pts(x - m, y - m, x + bw + m, y + bh + m, kw.get("r", 26))
        elif kind == "circle":
            pts = ellipse_pts(x + bw / 2, y + bh / 2, bw / 2 + kw.get("mx", 40), bh / 2 + kw.get("my", 34))
        else:
            yy = y + bh + kw.get("dy", 6); pts = [(x + i / 20 * bw, yy + math.sin(i) * 1.5) for i in range(21)]
        pts = [mp(*q) for q in pts]
        n = max(2, int(len(pts) * eout(p)))
        col = kw.get("col", GOLD)
        d.line(pts[:n], fill=col + (255,), width=kw.get("width", 9 if kind != "underline" else 14), joint="curve")
    elif kind == "tap":
        x, y = mp(*box)
        r = lerp(18, 80, eout(p)); a = int(255 * (1 - p))
        d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 248, 235, a), width=7)
        if p < 0.5: d.ellipse([x - 18, y - 18, x + 18, y + 18], fill=GOLD + (int(200 * (1 - 2 * p)),))
    elif kind == "stamp":
        x, y = mp(*box)
        st = stamp_img(kw.get("text", "FOUND"))
        sc = lerp(1.7, 1.0, eout(prog(age, 0, 0.18)))
        im = st.resize((round(st.width * sc), round(st.height * sc)), Image.BILINEAR)
        ov.alpha_composite(im, (round(x - im.width / 2), round(y - im.height / 2)))

def rect_pts(x0, y0, x1, y1, r):
    pts = []
    for cx, cy, a0 in ((x1 - r, y0 + r, -90), (x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180)):
        for i in range(9): a = math.radians(a0 + i * 10); pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    pts = pts[-4:] + pts  # start near the top-left corner and close the loop
    return pts + pts[:1]

def ellipse_pts(cx, cy, rx, ry):
    # a hand-drawn loop: starts top-left, goes round once and overshoots a little
    return [(cx + rx * (1 + 0.04 * math.sin(3 * a)) * math.cos(a), cy + ry * (1 + 0.05 * math.cos(2 * a)) * math.sin(a))
            for a in (math.radians(-140 + i * 5) for i in range(80))]

_stamps = {}
def stamp_img(text):
    if text not in _stamps:
        f = font(BOLD, 96); tw = int(f.getlength(text))
        im = Image.new("RGBA", (tw + 90, 170), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rounded_rectangle([6, 6, im.width - 7, im.height - 7], 18, outline=RED + (235,), width=10)
        d.text((45, 30), text, font=f, fill=RED + (235,))
        rng = np.random.default_rng(5); a = np.array(im.getchannel("A"), float)
        a *= (rng.random(a.shape) > 0.12) * 0.25 + 0.75
        im.putalpha(Image.fromarray(a.astype("uint8")))
        _stamps[text] = im.rotate(-12, expand=True, resample=Image.BICUBIC)
    return _stamps[text]

# ---- clips framed as photos
CW, CH = 800, 1422
_clipcard = None
def clip_frame(c, ct):
    global _clipcard
    if _clipcard is None:
        _clipcard = shadowed(Image.new("RGBA", (CW + 36, CH + 36), (255, 253, 248, 255)), blur=24, alpha=130, dy=16, pad=50)
    n = min(121, max(1, int(ct * FPS) + 1))
    return Image.open(f"{CLIPS}/{c}/{n:04d}.jpg").convert("RGB")
def clip_shot(c, ct, sat=1.0, scale=1.0):
    fr = clip_frame(c, ct); card, pad = _clipcard
    if sat < 1: fr = Image.blend(ImageOps.grayscale(fr).convert("RGB"), fr, sat)
    L = card.copy(); L.paste(fr, (pad + 18, pad + 18))
    if scale != 1: L = L.resize((round(L.width * scale), round(L.height * scale)), Image.BILINEAR)
    out = PAPER_IMG.copy().convert("RGBA")
    out.alpha_composite(L, (round(W / 2 - L.width / 2), round(105 + (CH + 36) / 2 - L.height / 2)))
    return out.convert("RGB")

# ---- board pieces
def calendar_card(num):
    im = Image.new("RGBA", (300, 330), (255, 253, 248, 255)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 300, 70], fill=RED + (255,))
    d.text((150, 36), "DAY", font=font(MONO, 40), fill=(255, 245, 235), anchor="mm")
    d.text((150, 200), str(num), font=font(BOLD, 150), fill=INK, anchor="mm")
    return im

def pin(d, x, y):
    d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=(176, 132, 58, 255)); d.ellipse([x - 6, y - 8, x + 2, y], fill=(240, 214, 150, 255))

def string(d, a, b, p):
    n = 30; pts = [(lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n) + math.sin(math.pi * i / n) * 18) for i in range(n + 1)]
    k = max(2, int((n + 1) * eout(p))); d.line(pts[:k], fill=RED + (255,), width=6, joint="curve")

def mirror_shot(x):
    global MIRROR
    if MIRROR is None:
        src = Image.open(f"{COL}/6.png").convert("RGB")
        cx, cy, r = 650, 1000, 585
        sq = src.crop((cx - r, cy - r, cx + r, cy + r)).resize((860, 860), Image.LANCZOS)
        m = Image.new("L", (860, 860), 0); ImageDraw.Draw(m).ellipse([0, 0, 859, 859], fill=255)
        disc = Image.new("RGBA", (920, 920), (0, 0, 0, 0)); dd = ImageDraw.Draw(disc)
        dd.ellipse([0, 0, 919, 919], fill=(255, 253, 248, 255)); disc.paste(sq, (30, 30), m)
        dd.ellipse([18, 18, 901, 901], outline=GOLD + (255,), width=10)
        MIRROR = shadowed(disc, blur=26, alpha=130, dy=18, pad=50)
    L, pad = MIRROR; s = lerp(0.95, 1.02, ease(x))
    L = L.resize((round(L.width * s), round(L.height * s)), Image.BILINEAR)
    out = PAPER_IMG.copy().convert("RGBA"); out.alpha_composite(L, (round(W / 2 - L.width / 2), round(860 - L.height / 2)))
    return out.convert("RGB")
MIRROR = None

def title_card(t, t0, lines):
    out = PAPER_IMG.copy(); d = ImageDraw.Draw(out, "RGBA"); f = font(BOLD, 112)
    y0 = H / 2 - len(lines) * 70
    for i, line in enumerate(lines):
        tw = f.getlength(line); x0 = W / 2 - tw / 2; y = y0 + i * 140
        p = eout(prog(t, t0 + 0.15 + i * 0.18, t0 + 0.6 + i * 0.18))
        d.rectangle([x0 - 18, y + 30, x0 - 18 + (tw + 36) * p, y + 118], fill=GOLD + (150,))
        d.text((W / 2, y + 70), line, font=f, fill=INK, anchor="mm")
    return out

def end_card(t, t0):
    out = PAPER_IMG.copy(); d = ImageDraw.Draw(out, "RGBA")
    a = eout(prog(t, t0, t0 + 0.5))
    f = font(BOLD, 104)
    d.text((W / 2, 700), "Bring them back.", font=f, fill=INK + (int(255 * a),), anchor="mm")
    tw = f.getlength("See it all."); p = eout(prog(t, t0 + 0.5, t0 + 1.1))
    d.rectangle([W / 2 - tw / 2 - 18, 790, W / 2 - tw / 2 - 18 + (tw + 36) * p, 880], fill=GOLD + (int(150 * a),))
    d.text((W / 2, 832), "See it all.", font=f, fill=INK + (int(255 * a),), anchor="mm")
    b = eout(prog(t, t0 + 1.2, t0 + 1.8))
    d.text((W / 2, 1060), "Ask for a free 10-minute demo.", font=font(BOLD, 54), fill=(110, 82, 62, int(255 * b)), anchor="mm")
    return out

def whip(a, b, p):
    off = int(W * ease(p))
    out = Image.new("RGB", (W, H)); out.paste(a, (-off, 0)); out.paste(b, (W - off, 0))
    k = 1 + int(14 * math.sin(math.pi * p))
    if k > 1: out = out.resize((W // k, H), Image.BILINEAR).resize((W, H), Image.BILINEAR)
    return out

# ---------------------------------------------------------------- subtitles
def chunks():
    out = []
    for i, text in TEXT.items():
        words = WORDS[f"{i:02d}"]; parts, cur = [], ""
        for tok in text.split(" "):
            cur = (cur + " " + tok).strip()
            if tok.endswith((".", "?", "…", ":")) and len(cur) > 12 or len(cur) > 34:
                parts.append(cur); cur = ""
        if cur: parts.append(cur)
        # time each part from the spoken words: part k starts at the word with the same running index
        idx, t_parts = 0, []
        for part in parts:
            k = min(idx, len(words) - 1); t_parts.append(START[i] + words[k][1]); idx += len(part.split(" "))
        for k, part in enumerate(parts):
            end = t_parts[k + 1] if k + 1 < len(parts) else START[i] + DUR[i] + 0.25
            out.append((t_parts[k] - 0.05, end, part))
    return out
SUBS = None

def subtitle(img, t):
    for a, b, text in SUBS:
        if a <= t < b:
            d = ImageDraw.Draw(img, "RGBA"); f = font(BOLD, 52)
            lines, cur = [], ""
            for tok in text.split(" "):
                if f.getlength((cur + " " + tok).strip()) > 920: lines.append(cur); cur = tok
                else: cur = (cur + " " + tok).strip()
            lines.append(cur)
            hgt = 64 * len(lines) + 34; y1 = 1868; y0 = y1 - hgt
            tw = max(f.getlength(l) for l in lines)
            d.rounded_rectangle([W / 2 - tw / 2 - 30, y0, W / 2 + tw / 2 + 30, y1], 22, fill=(250, 245, 234, 236))
            for k, l in enumerate(lines): d.text((W / 2, y0 + 17 + 32 + k * 64), l, font=f, fill=INK, anchor="mm")
            break
    return img

# ---------------------------------------------------------------- the cut
M = json.load(open(f"{FILM}/marks.json"))
def B(k): return M[k]
def C(k): x, y, w_, h_ = M[k]; return (x + w_ / 2, y + h_ / 2)

def build():
    S = []  # (start, end, fn)
    # 1 Priya on the board
    a = 0.0; b = START[2] - 0.4
    S.append((a, b, lambda t, a=a, b=b: kb(1, prog(t, a, b), 1.0, 1.08, (0.5, 0.42))))
    # 2 Priya leaves (clip A), then the empty chair on "never came back"
    a = b; b = w(2, "never") - 0.1
    S.append((a, b, lambda t, a=a: clip_shot("A", t - a)))
    a = b; b = START[4] - 0.3
    t_cal = [w(3, "simpler"), w(3, "simpler") + 0.45, w(3, "that")]
    t_note = w(3, "nobody") - 0.25
    def chair(t, a=a, b=b):
        img = kb(3, prog(t, a, b), 1.0, 1.04, (0.5, 0.52)).convert("RGBA")
        d = ImageDraw.Draw(img)
        for k, (tc, num, rot, dx) in enumerate(zip(t_cal, (1, 15, 30), (-7, -2, 4), (0, 26, 52))):
            if t < tc: continue
            p = eout(prog(t, tc, tc + 0.28))
            card, pad = CALS[k]
            img.alpha_composite(card, (70 + dx - pad, round(170 + dx - pad - (1 - p) * 160)))
        if t >= t_note:
            p = eout(prog(t, t_note, t_note + 0.25)); card, pad = STICKY_L
            img.alpha_composite(card, (640 - pad, round(330 - pad - (1 - p) * 60)))
            pin(d, 815, 352)
            string(d, (530, 1080), (815, 352), prog(t, t_note + 0.2, t_note + 0.8))
            if t >= t_note + 0.8: pin(d, 530, 1080)
        return img.convert("RGB")
    S.append((a, b, chair))
    # 4 the notebook
    a = b; b = T1[0] + 0.15
    S.append((a, b, lambda t, a=a, b=b: kb(4, prog(t, a, b), 1.0, 1.12, (0.5, 0.56))))
    # title 1
    a = b; b = T1[1] - 0.15
    S.append((a, b, lambda t, a=a: title_card(t, a, ["WHY DON'T THEY", "COME BACK?"])))
    # 5-7 reminders on the phone
    a = b; t_send = w(7, "tap") ; b = t_send + 0.9
    ph = PhoneShot(a, b, [(a, "A1-customers-reminder-card"), (w(6, "30") - 0.2, "A2-reminders-list"),
                          (w(6, "this") , "A3-reminder-open"), (t_send + 0.35, "A4-reminder-sent")], enter="drop", zoom=(1.0, 1.02))
    ph.mark("outline", w(5, "remembers"), B("A1.card"), m=10)
    ph.mark("tap", w(6, "30") - 0.45, C("A1.card"))
    ph.mark("outline", w(6, "priya"), B("A2.priyaRow"), m=6, r=30)
    ph.mark("underline", w(6, "priya") + 0.25, (255, 435, 330, 60))
    ph.mark("tap", w(6, "this") - 0.35, C("A2.priyaRow"))
    ph.mark("tap", t_send, C("A3.send"))
    S.append((a, b, ph.render_paper))
    # Priya at home (clip B)
    a = b; b = START[8] - 0.15
    S.append((a, b, lambda t, a=a: clip_shot("B", 0.8 + t - a)))
    # 8 the booking, then back in the chair
    a = b; b = w(8, "and") - 0.05
    ph2 = PhoneShot(a, b, [(a, "B2-calendar-sat31")]).mark("circle", a + 0.45, B("B2.priya"), mx=30, my=40)
    S.append((a, b, lambda t, ph=ph2: ph.render(t, PAPER_IMG)))
    a = b; b = START[9] - 0.2
    S.append((a, b, lambda t, a=a, b=b: mirror_shot(prog(t, a, b))))
    # 9 she tells a friend: the string, then her referral code
    a = b; b = w(9, "tells") - 0.1
    S.append((a, b, lambda t, a=a, b=b: kb(7, prog(t, a, b), 1.0, 1.07, (0.5, 0.5))))
    a = b; b = w(10, "rupees") - 0.05
    ph3 = PhoneShot(a, b, [(a, "G4-refer-after"), (START[10] - 0.1, "H2-after-collect")])
    ph3.mark("outline", a + 0.4, B("G4.code"), m=12)
    ph3.mark("outline", START[10] + 0.2, (52, 1264, 1062, 172), m=6, r=30)
    S.append((a, b, lambda t, ph=ph3: ph.render(t, PAPER_IMG)))
    a = b; b = START[11] - 0.1
    S.append((a, b, lambda t, a=a, b=b: kb(8, prog(t, a, b), 1.0, 1.07, (0.5, 0.55))))
    # 11 the two friends (clip C), frozen into a cut-out
    a = b; t_fz = w(11, "brand") ; b = T2[0] + 0.15
    def friends(t, a=a, t_fz=t_fz):
        if t < t_fz: return clip_shot("C", 0.3 + t - a)
        p = eout(prog(t, t_fz, t_fz + 0.5)); return clip_shot("C", 0.3 + t_fz - a, sat=1 - 0.3 * p, scale=1 - 0.06 * p)
    S.append((a, b, friends))
    a = b; b = T2[1] - 0.15
    S.append((a, b, lambda t, a=a: title_card(t, a, ["AND EVERY", "DAY…"])))
    # 12 the owner, then the live floor
    a = b; b = w(12, "see") - 0.1
    S.append((a, b, lambda t, a=a: clip_shot("D", 0.4 + t - a)))
    a = b; t_bill = w(13, "bill"); t_earn = w(13, "what"); b = START[14] - 0.1
    ph4 = PhoneShot(a, b, [(a, "C1-live-floor"), (t_bill - 0.15, "I2-receipt-cash"), (t_earn - 0.1, "D1-earnings")], zoom=(1.0, 1.0))
    ph4.mark("circle", w(12, "live") - 0.2, (110, 1080, 960, 150), mx=24, my=20)
    ph4.mark("circle", w(12, "live") + 0.25, (110, 1302, 960, 150), mx=24, my=20)
    ph4.mark("outline", t_earn + 0.1, B("D1.today"), m=12)
    for k, nm in enumerate(["Sunita", "Neha", "Imran", "Rakesh"]):
        x, y, _, hh = B("D1." + nm); ph4.mark("underline", w(13, "earned") + k * 0.32, (x, y + 4, 840, hh), dur=0.3, dy=38, width=10)
    S.append((a, b, lambda t, ph=ph4: ph.render(t, PAPER_IMG)))
    # 14 late and leave
    a = b; t_leave = w(14, "who", 1); b = START[15] - 0.15
    ph5 = PhoneShot(a, b, [(a, "E1-staff"), (t_leave, "E2-leave")], enter="none", zoom=(1.0, 1.0))
    ph5.mark("circle", w(14, "late") - 0.15, B("E1.late"), mx=34, my=34)
    ph5.mark("outline", w(14, "leave") - 0.1, B("E2.note"), m=10)
    ph5.mark("tap", START[15] - 0.5, C("E2.approve"))
    S.append((a, b, lambda t, ph=ph5: ph.render(t, PAPER_IMG)))
    # 15 the undone bill
    a = b; b = START[16] - 0.1
    ph6 = PhoneShot(a, b, [(a, "C2-live-checks")], enter="none", zoom=(1.0, 1.03))
    ph6.mark("outline", w(15, "bill") - 0.1, B("C2.undo"), m=16, col=RED)
    ph6.mark("stamp", w(15, "know") - 0.05, (870, 1500), dur=0.3)
    S.append((a, b, lambda t, ph=ph6: ph.render(t, PAPER_IMG)))
    # 16 we set it up: prices, stylists, the full board
    a = b; b = w(16, "stylists") - 0.15
    S.append((a, b, PhoneShot(a, b, [(a, "F1-services")]).render_paper))
    a = b; b = w(16, "customers") - 0.15
    S.append((a, b, lambda t, a=a, b=b: kb(10, prog(t, a, b), 1.0, 1.06, (0.5, 0.42))))
    a = b; b = END_CARD
    S.append((a, b, lambda t, a=a, b=b: kb(12, prog(t, a, b), 1.25, 1.0, (0.5, 0.5))))
    S.append((END_CARD, TOTAL + 1, lambda t: end_card(t, END_CARD)))
    return S

PhoneShot.render_paper = lambda self, t: self.render(t, PAPER_IMG)

WHIPS = None
def frame(t):
    for wa, wb in WHIPS:
        if wa <= t < wb:
            ia = scene_at(wa - 1e-3)(t); ib = scene_at(wb)(t)
            return whip(ia, ib, prog(t, wa, wb))
    return scene_at(t)(t)

def scene_at(t):
    for a, b, fn in SCENES:
        if a <= t < b: return fn
    return SCENES[-1][2]

def setup():
    global SCENES, WHIPS, SUBS, CALS, STICKY_L
    CALS = [shadowed(calendar_card(n).rotate(r, expand=True, resample=Image.BICUBIC), blur=12, alpha=110, dy=8, pad=30) for n, r in ((1, -7), (15, -2), (30, 4))]
    im = Image.new("RGBA", (360, 320), (248, 226, 116, 255)); d = ImageDraw.Draw(im)
    for i, line in enumerate(["Nobody", "reminded", "her."]): d.text((30, 40 + i * 80), line, font=font(MONO, 60), fill=INK)
    STICKY_L = shadowed(im.rotate(4, expand=True, resample=Image.BICUBIC), blur=14, alpha=110, dy=10, pad=30)
    SCENES = build(); SUBS = chunks()
    # whip pans into and out of the two title cards (scenes 4 and 13)
    WHIPS = [(x - 0.15, x + 0.15) for x in (SCENES[4][0], SCENES[4][1], SCENES[13][0], SCENES[13][1])]

def render(t):
    img = frame(t)
    if not (SCENES[4][0] <= t < SCENES[4][1] or SCENES[13][0] <= t < SCENES[13][1] or t >= END_CARD): img = subtitle(img, t)
    return img

# ---------------------------------------------------------------- sound
def cues():
    c = [("page", 0.15, -14), ("bell", START[2] + 2.9, -18), ("settle", w(2, "never") - 0.1, -10)]
    c += [("page", w(3, "simpler") + k * 0.45 * (k < 2) + (k == 2) * (w(3, "that") - w(3, "simpler")), -12) for k in range(3)]
    tn = w(3, "nobody") - 0.25
    c += [("pin", tn + 0.05, -10), ("pin", tn + 0.8, -12), ("page", START[4] - 0.3, -14)]
    for wa, wb in WHIPS: c.append(("whoosh", wa - 0.2, -12))
    s5 = SCENES[5][0]
    c += [("thud", s5 + 0.45, -4), ("mark", w(5, "remembers"), -26), ("tap", w(6, "30") - 0.45, -8),
          ("mark", w(6, "priya"), -26), ("tap", w(6, "this") - 0.35, -8), ("tap", w(7, "tap"), -6), ("reminder-sent", w(7, "tap") + 0.08, -6),
          ("swish", SCENES[7][0], -16), ("pin", SCENES[7][0] + 0.45, -10), ("page", SCENES[8][0], -14),
          ("page", SCENES[9][0], -14), ("pin", SCENES[9][0] + 0.3, -12), ("swish", SCENES[10][0], -16), ("mark", SCENES[10][0] + 0.4, -26),
          ("mark", START[10] + 0.2, -26), ("page", SCENES[11][0], -14), ("coin", w(10, "rupees"), -14), ("coin", w(10, "rupees") + 0.32, -15),
          ("settle", w(11, "brand"), -8), ("swish", SCENES[15][0], -16),
          ("pin", w(12, "live") - 0.2, -12), ("pin", w(12, "live") + 0.25, -12), ("paid", w(13, "bill"), -6),
          ("mark", w(13, "what") + 0.1, -26)]
    c += [("tap", w(13, "earned") + k * 0.32, -16) for k in range(4)]
    c += [("mark", w(14, "late") - 0.15, -24), ("tap", START[15] - 0.5, -8), ("mark", w(15, "bill") - 0.1, -26), ("stamp", w(15, "know") - 0.05, -6),
          ("page", w(16, "stylists") - 0.15, -14), ("page", w(16, "customers") - 0.15, -14), ("settle", END_CARD, -10)]
    return c

def audio(out):
    ins, flt, k = [], [], 0
    for i in range(1, 17):
        ins += ["-i", f"{NARR}/n_{i:02d}.wav"]; flt.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=mono,adelay={int(START[i]*1000)}[a{k}]"); k += 1
    for name, t, db in cues():
        ins += ["-i", f"{SFX}/{name}.wav"]; flt.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=mono,volume={db}dB,adelay={max(0,int(t*1000))}[a{k}]"); k += 1
    flt.append("".join(f"[a{j}]" for j in range(k)) + f"amix=inputs={k}:normalize=0:dropout_transition=0,apad,atrim=0:{TOTAL:.3f},afade=t=out:st={TOTAL-0.8:.3f}:d=0.8,alimiter=limit=0.89[out]")
    subprocess.check_call(["ffmpeg", "-loglevel", "error", "-y", *ins, "-filter_complex", ";".join(flt), "-map", "[out]", "-ac", "2", "-ar", "48000", out])

if __name__ == "__main__":
    setup()
    cmd = sys.argv[1]
    if cmd == "plan":
        print(f"total {TOTAL:.2f}s, end card {END_CARD:.2f}")
        for a, b, fn in SCENES: print(f"{a:6.2f}-{b:6.2f}")
        print("whips", [(round(a, 2), round(b, 2)) for a, b in WHIPS])
        for n, t, db in sorted(cues(), key=lambda x: x[1]): print(f"  {t:6.2f} {n} {db}")
    elif cmd == "still":
        render(float(sys.argv[2])).save(sys.argv[3], quality=88)
    elif cmd == "frames":
        f0, f1, out = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
        p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                              "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
        for f in range(f0, f1): p.stdin.write(render(f / FPS).tobytes())
        p.stdin.close(); p.wait()
    elif cmd == "audio":
        audio(sys.argv[2])
    elif cmd == "nframes":
        print(int(TOTAL * FPS))
