"""Thumbnail 049 v2 (9:16), designed from what is working this week (yt-viral: the 30x bunker videos show a tank
front-on in an open bunker doorway with light from inside, almost no text). Everything here is drawn by us:
sky, overgrown concrete bunker portal with open steel doors and warm interior light, gravel ground, and a front-view
khaki light tank modelled on the in-game tank's look (rounded turret, short gun, boxy hull, side tracks).
Text: 'FREE TANK' + a red-ringed keypad inset with the first code. Official VI logo.
Usage: python3 thumb_v049b.py <out.jpg>"""
import sys, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
OUT = sys.argv[1]; S = 2; W, H = 1080 * S, 1920 * S
A = lambda n: ImageFont.truetype('/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf', int(n * S))
I = lambda n: ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', int(n * S))
random.seed(7)
def P(pts): return [(x * S, y * S) for x, y in pts]
def vgrad(top, bot, y0, y1, w=W, h=H):
    g = Image.new('RGB', (1, h))
    for y in range(h):
        k = min(1, max(0, (y / S - y0) / max(y1 - y0, 1))); g.putpixel((0, y), tuple(int(top[i] + (bot[i] - top[i]) * k) for i in range(3)))
    return g.resize((w, h))
def mask(poly=None, ell=None, rr=None, rect=None):
    m = Image.new('L', (W, H)); d = ImageDraw.Draw(m)
    if poly: d.polygon(P(poly), fill=255)
    if ell: d.ellipse(tuple(v * S for v in ell), fill=255)
    if rr: d.rounded_rectangle(tuple(v * S for v in rr[:4]), int(rr[4] * S), fill=255)
    if rect: d.rectangle(tuple(v * S for v in rect), fill=255)
    return m
c = Image.new('RGBA', (W, H))
def paint(m, img): l = img.convert('RGBA'); l.putalpha(m); c.alpha_composite(l)
def noise_tex(base, amp, blur, seed):
    rnd = random.Random(seed); n = Image.new('L', (W // 8, H // 8))
    n.putdata([rnd.randint(128 - amp, 128 + amp) for _ in range(n.width * n.height)])
    n = n.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur * S))
    r, g, b = base
    return Image.merge('RGB', [n.point(lambda v, ch=ch: max(0, min(255, ch + (v - 128)))) for ch in (r, g, b)])
# ---- sky + distant trees ----
paint(mask(rect=(0, 0, 1080, 1920)), vgrad((92, 160, 220), (196, 224, 240), 0, 900))
for i in range(26):
    x = random.uniform(-60, 1140); r = random.uniform(70, 140)
    paint(mask(ell=(x - r, 760 - r * .9, x + r, 760 + r * .9)), vgrad((70, 112, 60), (40, 70, 38), 620, 900))
# ---- ground ----
paint(mask(rect=(0, 1340, 1080, 1920)), noise_tex((128, 112, 88), 30, 2, 3))
paint(mask(rect=(0, 1340, 1080, 1920)).point(lambda v: int(v * .35)), vgrad((40, 36, 30), (0, 0, 0), 1340, 1920))
# ---- bunker portal (concrete arch, overgrown) ----
portal = mask(poly=[(70, 1400), (70, 900)] + [(540 + 470 * math.cos(a), 900 - 330 * math.sin(a)) for a in [math.pi * k / 40 for k in range(41)]] + [(1010, 900), (1010, 1400)])
paint(portal, noise_tex((150, 148, 138), 22, 1.5, 11))
paint(portal.point(lambda v: int(v * .45)), vgrad((255, 255, 255), (40, 40, 36), 560, 1400))
d = ImageDraw.Draw(c)
for y in range(940, 1400, 92): d.line(P([(70, y), (1010, y)]), fill=(118, 116, 108), width=3 * S)     # form lines
paint(mask(rect=(150, 890, 930, 930)), vgrad((120, 118, 110), (90, 88, 82), 890, 930))                    # lintel
# opening + interior glow
opening = mask(poly=[(250, 1420), (250, 1010), (290, 960), (790, 960), (830, 1010), (830, 1420)])
paint(opening, vgrad((22, 20, 16), (8, 8, 6), 960, 1420))
glow = Image.new('L', (W, H)); gd = ImageDraw.Draw(glow); gd.ellipse(tuple(v * S for v in (300, 980, 780, 1440)), fill=230)
glow = ImageChops.multiply(glow.filter(ImageFilter.GaussianBlur(70 * S)), opening)
paint(glow, Image.new('RGB', (W, H), (255, 186, 70)))
rays = Image.new('L', (W, H)); rd = ImageDraw.Draw(rays)
for k in range(9):
    a = -math.pi / 2 + (k - 4) * 0.16; rd.polygon(P([(540, 1300), (540 + 900 * math.cos(a - .045), 1300 + 900 * math.sin(a - .045)), (540 + 900 * math.cos(a + .045), 1300 + 900 * math.sin(a + .045))]), fill=60)
paint(ImageChops.multiply(rays.filter(ImageFilter.GaussianBlur(10 * S)), opening), Image.new('RGB', (W, H), (255, 220, 140)))
# open steel doors (perspective panels) with hazard stripes
for side in (-1, 1):
    x0 = 250 if side < 0 else 830; x1 = x0 + side * -160
    door = [(x0, 1000), (x1, 1050), (x1, 1400), (x0, 1430)]
    paint(mask(poly=door), noise_tex((128, 126, 112), 14, 1.0, 20 + side))
    paint(mask(poly=door).point(lambda v: int(v * .35)), vgrad((255, 230, 170), (30, 28, 24), 1000, 1430))   # warm light from inside
    for j in range(4):
        yy = 1090 + j * 70; d.line(P([(x0, yy), (x1, yy + 38)]), fill=(80, 78, 68), width=5 * S); d.line(P([(x0, yy + 4), (x1, yy + 42)]), fill=(170, 166, 150), width=2 * S)
        for u in (0.15, 0.5, 0.85):
            rx, ry = x0 + (x1 - x0) * u, yy + 38 * u + 14; d.ellipse(tuple(v * S for v in (rx - 4, ry - 4, rx + 4, ry + 4)), fill=(70, 68, 60))
    d.line(P([(x1, 1050), (x1, 1400)]), fill=(200, 196, 180), width=4 * S)                                   # lit door edge
    stripe = [(x0, 1330), (x1, 1350), (x1, 1400), (x0, 1430)]
    paint(mask(poly=stripe), Image.new('RGB', (W, H), (230, 180, 40)))
    for t in range(6):
        u0 = t / 6; u1 = u0 + 1 / 12
        pa = (x0 + (x1 - x0) * u0, 1330 + 20 * u0); pb = (x0 + (x1 - x0) * u1, 1330 + 20 * u1)
        d.polygon(P([pa, pb, (pb[0], pb[1] + 50), (pa[0], pa[1] + 50)]), fill=(25, 25, 20))
# overgrowth: bushes + vines
def bush(x, y, r):
    paint(mask(ell=(x - r, y - r * .75, x + r, y + r * .75)), vgrad((40, 70, 30), (16, 30, 14), y - r, y + r))      # dark core
    for _ in range(28):                                                   # leaf clusters, lit from top-left
        a = random.uniform(0, 2 * math.pi); q = random.uniform(0, r * .85); lx = x + q * math.cos(a); ly = y + q * math.sin(a) * .7; lr = random.uniform(r * .14, r * .3)
        lit = max(0, min(1, 0.5 - (lx - x) / (2 * r) - (ly - y) / (2 * r)))
        top = tuple(int(c0 + (c1 - c0) * lit) for c0, c1 in zip((52, 92, 38), (128, 176, 74))); bot = tuple(int(v * .55) for v in top)
        paint(mask(ell=(lx - lr, ly - lr * .8, lx + lr, ly + lr * .8)), vgrad(top, bot, ly - lr, ly + lr))
for side in (-1, 1):
    for (dx, y, r) in ((470, 1150, 120), (420, 1330, 150), (520, 1430, 130), (380, 1050, 90)):
        bush(540 + side * dx, y, r)
for _ in range(40):
    a = random.uniform(math.pi * .08, math.pi * .92); x = 540 + 470 * math.cos(a); y = 900 - 330 * math.sin(a); r = random.uniform(22, 50)
    paint(mask(ell=(x - r, y - r * .7, x + r, y + r * .7)), vgrad((90, 140, 60), (40, 78, 34), y - r, y + r))
# ---- tank, front view (khaki light tank) ----
KH_T, KH_B = (196, 178, 128), (112, 98, 64)
shadow = mask(ell=(170, 1450, 910, 1560)).filter(ImageFilter.GaussianBlur(20 * S)); paint(shadow.point(lambda v: int(v * .8)), Image.new('RGB', (W, H), (0, 0, 0)))
for side in (-1, 1):                                                   # tracks
    tx0, tx1 = (232, 330) if side < 0 else (750, 848)
    paint(mask(rr=(tx0, 1200, tx1, 1500, 26)), vgrad((70, 68, 60), (26, 26, 22), 1200, 1500))
    for y in range(1212, 1490, 22): d.rectangle(P([(tx0 + 8, y), (tx1 - 8, y + 9)]), fill=(92, 90, 80))
    cxw = (tx0 + tx1) / 2; paint(mask(ell=(cxw - 40, 1218, cxw + 40, 1298)), vgrad((120, 116, 100), (50, 48, 40), 1218, 1298))
    paint(mask(ell=(cxw - 18, 1240, cxw + 18, 1276)), Image.new('RGB', (W, H), (40, 38, 32)))
    paint(mask(poly=[(tx0 - 14, 1190), (tx1 + 14, 1190), (tx1 + 8, 1212), (tx0 - 8, 1212)]), vgrad(KH_T, KH_B, 1190, 1212))  # fenders
hull_lo = [(330, 1250), (750, 1250), (735, 1470), (345, 1470)]
paint(mask(poly=hull_lo), vgrad(KH_T, KH_B, 1250, 1470))
glacis = [(318, 1150), (762, 1150), (750, 1252), (330, 1252)]
paint(mask(poly=glacis), vgrad((214, 198, 150), (150, 134, 92), 1150, 1252))
d.line(P([(330, 1252), (750, 1252)]), fill=(80, 70, 46), width=4 * S); d.line(P([(318, 1150), (762, 1150)]), fill=(236, 222, 176), width=3 * S)
for x in range(350, 740, 30): d.ellipse(tuple(v * S for v in (x - 4, 1262 - 4, x + 4, 1262 + 4)), fill=(96, 84, 56))
for hx in (392, 688):                                                  # headlights with glow
    gl = mask(ell=(hx - 60, 1240, hx + 60, 1360)).filter(ImageFilter.GaussianBlur(18 * S)); paint(gl.point(lambda v: int(v * .7)), Image.new('RGB', (W, H), (255, 236, 170)))
    paint(mask(ell=(hx - 24, 1278, hx + 24, 1322)), vgrad((255, 250, 220), (230, 200, 120), 1278, 1322))
    paint(mask(ell=(hx - 30, 1272, hx + 30, 1328)).point(lambda v: int(v * .0)), Image.new('RGB', (W, H), (0, 0, 0)))
paint(mask(rr=(470, 1380, 610, 1420, 6)), Image.new('RGB', (W, H), (236, 230, 210)))   # number plate
d.text((540 * S - d.textlength('042', font=A(30)) / 2, 1381 * S), '042', font=A(30), fill=(40, 40, 36))
for hx in (380, 700): paint(mask(rr=(hx - 16, 1440, hx + 16, 1476, 6)), Image.new('RGB', (W, H), (60, 56, 46)))   # tow hooks
# turret
tur = [(380, 1150), (700, 1150), (668, 1040), (412, 1040)]
paint(mask(poly=tur), vgrad((206, 190, 142), (128, 114, 76), 1040, 1150))
paint(mask(ell=(404, 1000, 676, 1090)), vgrad((220, 206, 160), (150, 136, 92), 1000, 1090))      # rounded top
paint(mask(rr=(470, 1080, 610, 1150, 14)), vgrad((150, 136, 96), (96, 86, 58), 1080, 1150))      # mantlet
paint(mask(ell=(510, 1086, 570, 1146)), vgrad((110, 100, 70), (60, 54, 38), 1086, 1146))       # barrel end (facing camera)
paint(mask(ell=(522, 1098, 558, 1134)), Image.new('RGB', (W, H), (14, 12, 10)))                # bore
paint(mask(ell=(436, 992, 500, 1030)), vgrad((200, 186, 140), (120, 108, 72), 992, 1030))      # hatch
d.line(P([(640, 1010), (690, 860)]), fill=(50, 48, 40), width=4 * S)                            # antenna
d.line(P([(412, 1040), (668, 1040)]), fill=(236, 222, 176), width=2 * S)
# gold rim light on the tank (ties to our video's look)
tank_sil = Image.new('L', (W, H))
for m in (hull_lo, glacis, tur): tank_sil = ImageChops.lighter(tank_sil, mask(poly=m))
tank_sil = ImageChops.lighter(tank_sil, mask(ell=(404, 1000, 676, 1090)))
edge = ImageChops.subtract(tank_sil, ImageChops.offset(tank_sil, 0, 4 * S)).filter(ImageFilter.GaussianBlur(2 * S))
paint(edge, Image.new('RGB', (W, H), (255, 200, 80)))
# ---- top text area shade + text ----
sh = Image.new('L', (W, H)); sd = ImageDraw.Draw(sh)
for y in range(0, 700 * S): sd.line([(0, y), (W, y)], fill=int(130 * (1 - y / (700 * S))))
paint(sh, Image.new('RGB', (W, H), (6, 10, 18)))
d = ImageDraw.Draw(c)
def word(t, y, size, fill):
    f = A(size); w = d.textlength(t, font=f)
    d.text(((W - w) / 2 + 8 * S, y * S + 10 * S), t, font=f, fill=(0, 0, 0, 160))
    d.text(((W - w) / 2, y * S), t, font=f, fill=fill, stroke_width=12 * S, stroke_fill=(8, 8, 12))
word('FREE', 170, 210, (255, 255, 255)); word('TANK', 360, 250, (255, 196, 40))
# ---- red-ringed keypad inset with code 1 ----
ix, iy, R = 880, 1690, 160
ins = Image.new('RGBA', (2 * R * S, 2 * R * S), (24, 26, 24, 255)); idd = ImageDraw.Draw(ins)
idd.rounded_rectangle((40 * S, 34 * S, (2 * R - 40) * S, 104 * S), 10 * S, fill=(16, 14, 8), outline=(255, 170, 30), width=4 * S)
f = A(56); t = '010317'; idd.text(((2 * R * S - idd.textlength(t, font=f)) / 2, 34 * S), t, font=f, fill=(255, 215, 120))
for r_ in range(3):
    for k_ in range(3):
        bx = 70 + k_ * 64; by = 124 + r_ * 56; idd.rounded_rectangle((bx * S, by * S, (bx + 52) * S, (by + 44) * S), 8 * S, fill=(70, 72, 66))
        idd.text(((bx + 18) * S, (by + 4) * S), str(r_ * 3 + k_ + 1), font=A(30), fill=(220, 220, 210))
cm = Image.new('L', ins.size); ImageDraw.Draw(cm).ellipse((0, 0, 2 * R * S, 2 * R * S), fill=255)
d.ellipse(tuple(v * S for v in (ix - R - 16, iy - R - 16, ix + R + 16, iy + R + 16)), fill=(220, 35, 45))
c.paste(ins, ((ix - R) * S, (iy - R) * S), cm); d = ImageDraw.Draw(c)
d.line(P([(640, 1560), (720, 1620)]), fill=(220, 35, 45), width=18 * S); d.polygon(P([(705, 1650), (748, 1598), (762, 1650)]), fill=(220, 35, 45))
# ---- official VI logo ----
vi = Image.open('/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/th43/vi_logo.png').convert('RGBA')
vi = vi.resize((220 * S, int(220 * S * vi.height / vi.width)), Image.LANCZOS); c.alpha_composite(vi, (40 * S, 40 * S))
c.convert('RGB').resize((1080, 1920), Image.LANCZOS).save(OUT, quality=93); print('saved', OUT)
