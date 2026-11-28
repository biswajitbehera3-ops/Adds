"""Detailed side-profile tank illustration for Short 049 (replaces the flat cartoon icon). Drawn at 3x and downsampled
for clean edges: shaded armour (gradients + highlights), camouflage, side skirts with panels and bolts, road wheels,
sprocket, idler, track links, angular turret with bustle rack, cupola, machine gun, sights, smoke launchers,
antennas, barrel with thermal sleeves and bore evacuator, drop shadow and a gold rim light.
Usage: python3 tank_art.py <out.png> [width]   (transparent PNG)"""
import sys, math, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops

OUT = sys.argv[1]; OUTW = int(sys.argv[2]) if len(sys.argv) > 2 else 1600
S = 3; DW, DH = 1640, 720; W, H = DW * S, DH * S
P = lambda pts: [(x * S, y * S) for x, y in pts]
random.seed(11)

def mask(poly=None, ellipse=None, rect=None, rr=None):
    m = Image.new('L', (W, H)); d = ImageDraw.Draw(m)
    if poly: d.polygon(P(poly), fill=255)
    if ellipse: x0, y0, x1, y1 = ellipse; d.ellipse((x0 * S, y0 * S, x1 * S, y1 * S), fill=255)
    if rect: x0, y0, x1, y1 = rect; d.rectangle((x0 * S, y0 * S, x1 * S, y1 * S), fill=255)
    if rr: x0, y0, x1, y1, r = rr; d.rounded_rectangle((x0 * S, y0 * S, x1 * S, y1 * S), int(r * S), fill=255)
    return m
def vgrad(top, bot, y0, y1):
    g = Image.new('RGB', (1, H))
    for y in range(H):
        k = min(1, max(0, (y / S - y0) / max(y1 - y0, 1)))
        g.putpixel((0, y), tuple(int(top[i] + (bot[i] - top[i]) * k) for i in range(3)))
    return g.resize((W, H))
canvas = Image.new('RGBA', (W, H))
def paint(m, img):
    layer = img.convert('RGBA'); layer.putalpha(m); canvas.alpha_composite(layer)
def solid(m, col): paint(m, Image.new('RGB', (W, H), col))
def lines(pts_list, col, w):
    d = ImageDraw.Draw(canvas)
    for a, b in pts_list: d.line([(a[0] * S, a[1] * S), (b[0] * S, b[1] * S)], fill=col, width=int(w * S))
def camo(m, y0, y1):
    """olive gradient + soft darker/sand blotches, clipped to the part"""
    base = vgrad((112, 118, 74), (50, 54, 34), y0, y1)
    blot = Image.new('L', (W, H)); bd = ImageDraw.Draw(blot)
    for _ in range(60):
        cx, cy = random.uniform(80, 1500), random.uniform(y0 - 20, y1 + 20); rx, ry = random.uniform(40, 120), random.uniform(18, 45)
        bd.ellipse(((cx - rx) * S, (cy - ry) * S, (cx + rx) * S, (cy + ry) * S), fill=255)
    blot = blot.filter(ImageFilter.GaussianBlur(10 * S)).point(lambda v: 255 if v > 120 else 0).filter(ImageFilter.GaussianBlur(1.5 * S))
    dark = vgrad((70, 74, 46), (34, 36, 24), y0, y1)
    sand = Image.new('L', (W, H)); sd = ImageDraw.Draw(sand)
    for _ in range(35):
        cx, cy = random.uniform(80, 1500), random.uniform(y0 - 20, y1 + 20); rx, ry = random.uniform(30, 90), random.uniform(12, 34)
        sd.ellipse(((cx - rx) * S, (cy - ry) * S, (cx + rx) * S, (cy + ry) * S), fill=255)
    sand = sand.filter(ImageFilter.GaussianBlur(9 * S)).point(lambda v: 255 if v > 140 else 0).filter(ImageFilter.GaussianBlur(1.5 * S))
    img = Image.composite(dark, base, blot)
    img = Image.composite(vgrad((150, 138, 96), (92, 84, 58), y0, y1), img, ImageChops.subtract(sand, blot))
    paint(m, img)
def highlight_top(m, col=(220, 210, 160), w=3, a=150):
    edge = ImageChops.subtract(m, ImageChops.offset(m, 0, int(w * S))).point(lambda v: a if v > 0 else 0)
    paint(edge.filter(ImageFilter.GaussianBlur(0.8 * S)), Image.new('RGB', (W, H), col))
def shade_bottom(m, w=10, a=120):
    edge = ImageChops.subtract(m, ImageChops.offset(m, 0, -int(w * S))).point(lambda v: a if v > 0 else 0)
    paint(edge.filter(ImageFilter.GaussianBlur(3 * S)), Image.new('RGB', (W, H), (10, 10, 8)))
def bolt(x, y, r=4.5):
    d = ImageDraw.Draw(canvas); d.ellipse(((x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S), fill=(46, 48, 32))
    d.ellipse(((x - r * 0.6) * S, (y - r * 0.7) * S, (x + r * 0.2) * S, (y - r * 0.1) * S), fill=(170, 165, 120))

# ---- ground shadow ----
sh = mask(ellipse=(60, 600, 1520, 660)).filter(ImageFilter.GaussianBlur(14 * S)); paint(sh.point(lambda v: int(v * 0.75)), Image.new('RGB', (W, H), (0, 0, 0)))
# ---- tracks ----
track = mask(rr=(105, 462, 1455, 628, 82)); paint(track, vgrad((58, 58, 54), (22, 22, 20), 462, 628))
d = ImageDraw.Draw(canvas)
for x in range(118, 1445, 20):                     # track links: top run and bottom run
    for yy, hh in ((462, 14), (614, 14)):
        if 150 < x < 1410: d.rectangle((x * S, yy * S, (x + 13) * S, (yy + hh) * S), fill=(78, 78, 72))
inner = mask(rr=(135, 480, 1425, 608, 64)); paint(inner, vgrad((30, 30, 28), (16, 16, 14), 480, 608))
# ---- wheels ----
def wheel(cx, cy, r, sprocket=False):
    paint(mask(ellipse=(cx - r, cy - r, cx + r, cy + r)), vgrad((96, 96, 88), (34, 34, 30), cy - r, cy + r))
    paint(mask(ellipse=(cx - r * .78, cy - r * .78, cx + r * .78, cy + r * .78)), vgrad((54, 56, 40), (30, 32, 22), cy - r, cy + r))
    paint(mask(ellipse=(cx - r * .62, cy - r * .62, cx + r * .62, cy + r * .62)), vgrad((112, 116, 80), (58, 60, 40), cy - r, cy + r))
    paint(mask(ellipse=(cx - r * .22, cy - r * .22, cx + r * .22, cy + r * .22)), vgrad((150, 146, 110), (70, 70, 50), cy - r, cy + r))
    for i in range(6):
        a = i * math.pi / 3; bolt(cx + r * .42 * math.cos(a), cy + r * .42 * math.sin(a), 3.2)
    if sprocket:
        dd = ImageDraw.Draw(canvas)
        for i in range(12):
            a = i * math.pi / 6; pts = [(cx + (r + 9) * math.cos(a), cy + (r + 9) * math.sin(a)), (cx + r * math.cos(a - .14), cy + r * math.sin(a - .14)), (cx + r * math.cos(a + .14), cy + r * math.sin(a + .14))]
            dd.polygon(P(pts), fill=(70, 70, 64))
wheel(178, 528, 58, True); wheel(1385, 522, 52)
for i in range(7): wheel(300 + i * 150, 560, 56)
# ---- hull ----
hull = [(92, 472), (92, 384), (128, 356), (1212, 356), (1468, 430), (1446, 472)]
hm = mask(poly=hull); camo(hm, 356, 472); highlight_top(hm, w=4); shade_bottom(hm)
lines([((1212, 356), (1468, 430))], (190, 182, 130), 2.2)              # glacis edge catch-light
for x in (180, 300, 1300): bolt(x, 372)
d = ImageDraw.Draw(canvas); d.rectangle((1390 * S, 398 * S, 1430 * S, 414 * S), fill=(230, 210, 140))   # headlight
# ---- side skirts (armour panels over the wheels) ----
skirt = [(112, 532), (112, 404), (1408, 404), (1452, 434), (1432, 532)]
sm = mask(poly=skirt); camo(sm, 404, 532); highlight_top(sm, w=3); shade_bottom(sm, w=8, a=150)
for x in range(300, 1400, 180): lines([((x, 408), (x, 528))], (36, 38, 24), 2.5); lines([((x + 2.5, 408), (x + 2.5, 528))], (150, 144, 100), 1)
for x in range(140, 1420, 60): bolt(x, 414, 3.6); bolt(x, 520, 3.6)
lines([((112, 530), (1432, 530))], (30, 30, 20), 4)
# ---- turret bustle rack (rear basket) ----
rack = mask(rect=(238, 248, 340, 342)); paint(rack.point(lambda v: int(v * .35)), Image.new('RGB', (W, H), (20, 20, 14)))
for x in range(238, 342, 14): lines([((x, 248), (x, 342))], (80, 82, 60), 2)
for y in range(248, 344, 16): lines([((238, y), (340, y))], (80, 82, 60), 2)
lines([((238, 248), (340, 248)), ((238, 342), (340, 342)), ((238, 248), (238, 342))], (120, 118, 86), 3)
for bx, by, bw, bh, col in ((250, 296, 50, 44, (90, 82, 54)), (296, 306, 40, 34, (70, 74, 48))):   # crates in the basket
    paint(mask(rect=(bx, by, bx + bw, by + bh)), vgrad(tuple(min(255, c + 30) for c in col), col, by, by + bh))
# ---- turret ----
tur = [(332, 356), (352, 258), (520, 218), (1016, 218), (1186, 262), (1206, 356)]
tm = mask(poly=tur); camo(tm, 218, 356); highlight_top(tm, w=4); shade_bottom(tm, w=12, a=140)
lines([((352, 258), (1186, 262))], (34, 36, 24), 2)                     # roof/side break line
lines([((356, 262), (1182, 266))], (176, 170, 120), 1.2)
for x in range(420, 1150, 120): bolt(x, 300, 4)
paint(mask(poly=[(1120, 262), (1240, 262), (1252, 340), (1150, 350)]), vgrad((104, 110, 70), (46, 50, 32), 262, 350))   # mantlet
highlight_top(mask(poly=[(1120, 262), (1240, 262), (1252, 340), (1150, 350)]), w=3)
# smoke grenade launchers
for i in range(4): paint(mask(rr=(1060 + i * 14, 236, 1072 + i * 14, 262, 4)), vgrad((90, 92, 64), (40, 42, 28), 236, 262))
# gunner's sight + cupola + hatch + machine gun
paint(mask(rr=(880, 190, 976, 220, 6)), vgrad((96, 100, 66), (44, 46, 30), 190, 220)); paint(mask(rect=(884, 196, 900, 212)), Image.new('RGB', (W, H), (40, 70, 80)))
paint(mask(rr=(520, 182, 660, 220, 10)), vgrad((104, 108, 72), (48, 50, 32), 182, 220)); highlight_top(mask(rr=(520, 182, 660, 220, 10)), w=3)
for x in (536, 566, 596, 626): paint(mask(rect=(x, 196, x + 18, 208)), Image.new('RGB', (W, H), (34, 60, 70)))
paint(mask(ellipse=(540, 160, 640, 196)), vgrad((112, 116, 78), (56, 58, 38), 160, 196))         # hatch dome
lines([((620, 166), (760, 160))], (30, 30, 26), 7); lines([((620, 163), (760, 157))], (110, 110, 100), 1.5)   # MG barrel
paint(mask(rr=(600, 150, 650, 176, 4)), vgrad((70, 70, 62), (32, 32, 28), 150, 176))
paint(mask(rr=(652, 172, 684, 194, 3)), vgrad((90, 96, 60), (44, 48, 30), 172, 194))           # ammo can
# antennas
for (x0, y0, x1, y1) in ((420, 222, 372, 40), (470, 222, 452, 90)):
    pts = [(x0 + (x1 - x0) * k + 10 * math.sin(k * 3), y0 + (y1 - y0) * k) for k in [i / 20 for i in range(21)]]
    lines(list(zip(pts, pts[1:])), (40, 40, 34), 2.6); paint(mask(ellipse=(x0 - 7, y0 - 6, x0 + 7, y0 + 4)), Image.new('RGB', (W, H), (50, 52, 36)))
# ---- main gun ----
bar = [(1240, 286), (1612, 290), (1612, 312), (1240, 318)]
bm = mask(poly=bar); paint(bm, vgrad((132, 136, 92), (40, 42, 28), 286, 318)); highlight_top(bm, w=2.5, a=190)
for x in (1290, 1340, 1460, 1520): lines([((x, 287), (x, 315))], (40, 42, 28), 2)   # thermal sleeve bands
ev = mask(rr=(1380, 280, 1446, 324, 12)); paint(ev, vgrad((120, 124, 84), (40, 42, 28), 280, 324)); highlight_top(ev, w=2.5, a=190)
mz = mask(rr=(1596, 284, 1636, 318, 6)); paint(mz, vgrad((110, 112, 80), (36, 38, 26), 284, 318))
paint(mask(ellipse=(1626, 292, 1640, 310)), Image.new('RGB', (W, H), (14, 14, 12)))
# ---- gold rim light (matches the video's gold theme) ----
sil = canvas.getchannel('A').point(lambda v: 255 if v > 200 else 0)   # tank only, not the soft ground shadow
top_edge = ImageChops.subtract(sil, ImageChops.offset(sil, int(-2 * S), int(5 * S)))
glow = top_edge.filter(ImageFilter.GaussianBlur(2.2 * S)).point(lambda v: min(255, int(v * 1.6)))
rim = Image.new('RGBA', (W, H), (255, 196, 60, 0)); rim.putalpha(ImageChops.multiply(glow, sil.filter(ImageFilter.GaussianBlur(0.5 * S))))
canvas.alpha_composite(rim)
out = canvas.resize((OUTW, int(OUTW * DH / DW)), Image.LANCZOS); out.save(OUT); print('saved', OUT, out.size)
