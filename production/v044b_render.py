"""Short 044 v2 (retention cut): hook on frame 1, open loop, payoff last, a useful last tip and a clean fade-out. GTA 6 underwater treasure guide. Official Rockstar clips (Extended Look, Trailers 1 & 2, Launch Trailer), none used
in earlier videos, matched to each line; official Leonida map for the Key Lento pin. Usage: python3 production/v044b_render.py <workdir> <out.mp4>"""
import sys, json, math, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WD, OUT = sys.argv[1], sys.argv[2]
W, H, FPS = 1080, 1920, 30
ANTON = '/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
INTER = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
F = lambda n: ImageFont.truetype(ANTON, n); FI = lambda n: ImageFont.truetype(INTER, n)
meta = json.load(open(f'{WD}/vo.json')); BEATS = {b['beat']: b for b in meta['beats']}; LINES = meta['lines']
DUR = meta['beats'][-1]['end'] + 1.2   # last tip, then a 1 s fade to black
GOLD, RED, WHITE, CYAN, GREEN = (255, 200, 60), (235, 40, 60), (255, 255, 255), (90, 220, 255), (40, 200, 110)
SEGS = json.load(open(f'{WD}/segs.json'))

# ---- background track: clips in VO order, with the official map + Key Lento pin inside the 'shop' beat ----
mapimg = Image.open(f'{WD}/../map_mobile.jpg').convert('RGB')
mapimg = mapimg.resize((int(mapimg.width * H / mapimg.height * 1.15), int(H * 1.15)), Image.LANCZOS)
def map_frame(z, cx=0.5, cy=0.5):
    cw, ch = min(int(W / z), mapimg.width), min(int(H / z), mapimg.height)
    x0 = int(min(max(cx * mapimg.width - cw / 2, 0), mapimg.width - cw)); y0 = int(min(max(cy * mapimg.height - ch / 2, 0), mapimg.height - ch))
    return mapimg.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BILINEAR)
MAP_T = BEATS['shop']['start'] + sum(s['dur'] for s in SEGS if s['beat'] == 'shop' and 'file' in s and SEGS.index(s) < [i for i, x in enumerate(SEGS) if 'map' in x][0])
def clip_frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f'{WD}/{path}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3: break
        yield Image.frombuffer('RGB', (W, H), b)
def bg_stream():
    for s in SEGS:
        if 'map' in s:
            n = int(s['map'] * FPS)
            for i in range(n): yield map_frame(1.35 + 0.15 * i / n, 0.30, 0.80)
        else: yield from clip_frames(s['file'])
    while True: yield last

# ---- overlays ----
SH = Image.new('L', (W, H)); d = ImageDraw.Draw(SH)
for y in range(H):
    v = 0
    if y < 480: v = 160 * (1 - y / 480)
    if y > 1250: v = max(v, 210 * min(1, (y - 1250) / 450))
    d.line([(0, y), (W, y)], fill=int(v))
def ease(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 3
def text_c(c, t, f, y, fill, sw=8, x=None):
    d = ImageDraw.Draw(c); w = d.textlength(t, font=f); xx = (W - w) / 2 if x is None else x
    d.text((xx, y), t, font=f, fill=fill, stroke_width=sw, stroke_fill=(10, 8, 25)); return w
def pill(c, t, y, col, size=64, k=1.0, ang=0):
    if k <= 0: return
    s = 1.4 - 0.4 * ease(k * 3); f = F(int(size * s)); d0 = ImageDraw.Draw(c); w = d0.textlength(t, font=f)
    lay = Image.new('RGBA', (int(w + 80), int(size * s * 1.5 + 20))); ld = ImageDraw.Draw(lay)
    ld.rounded_rectangle((6, 6, lay.width - 6, lay.height - 6), 24, fill=col + (235,), outline=WHITE, width=6)
    ld.text((40, 6 + size * s * 0.14), t, font=f, fill=WHITE)
    if ang: lay = lay.rotate(ang, expand=True, resample=Image.BICUBIC)
    c.alpha_composite(lay, (int(W / 2 - lay.width / 2), int(y)))
def badge(c, n, k):
    if k <= 0: return
    d = ImageDraw.Draw(c); r = 74 * ease(k * 3); cx, cy = 110, 300
    d.ellipse((cx - r - 6, cy - r - 6, cx + r + 6, cy + r + 6), fill=WHITE); d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=RED)
    if r > 40:
        f = F(96); w = d.textlength(str(n), font=f); d.text((cx - w / 2, cy - 64), str(n), font=f, fill=WHITE)
def tag(c, t, y=1385):
    d = ImageDraw.Draw(c); f = FI(28); w = d.textlength(t, font=f)
    d.rounded_rectangle(((W - w) / 2 - 20, y, (W + w) / 2 + 20, y + 48), 24, fill=(0, 0, 0, 175)); d.text(((W - w) / 2, y + 8), t, font=f, fill=(230, 230, 240))
def pin(c, x, y, k, label=None):
    if k <= 0: return
    d = ImageDraw.Draw(c); drop = 60 * (1 - ease(k * 2)); y = y - drop; r = 30
    d.ellipse((x - r, y - 2 * r - 30, x + r, y - 30), fill=RED, outline=WHITE, width=5)
    d.polygon([(x - 20, y - 50), (x + 20, y - 50), (x, y)], fill=RED); d.ellipse((x - 10, y - r - 40, x + 10, y - r - 20), fill=WHITE)
    if label:
        f = F(44); w = d.textlength(label, font=f); d.rounded_rectangle((x - w / 2 - 16, y + 8, x + w / 2 + 16, y + 70), 18, fill=(10, 8, 25, 220))
        d.text((x - w / 2, y + 10), label, font=f, fill=WHITE)

def star(d, cx, cy, r, fill):
    pts = [(cx + (r if i % 2 == 0 else r * 0.45) * math.sin(i * math.pi / 5), cy - (r if i % 2 == 0 else r * 0.45) * math.cos(i * math.pi / 5)) for i in range(10)]
    d.polygon(pts, fill=fill, outline=(10, 8, 25), width=5)
STEP = {'shop': 1, 'boat': 2, 'dive': 3, 'shark': 3, 'sell': 4, 'payoff': 4, 'track': 4}
def progress(c, beat, lt):
    if beat not in STEP: return
    d = ImageDraw.Draw(c); n = STEP[beat]; x0, y0, w, g = 140, 185, 185, 16
    for i in range(4):
        x = x0 + i * (w + g); col = GOLD if i < n - 1 else (GOLD if i == n - 1 else (255, 255, 255, 90))
        d.rounded_rectangle((x, y0, x + w, y0 + 16), 8, fill=(255, 255, 255, 70))
        fillw = w if i < n - 1 else (w * min(1, ease(lt / 0.5)) if i == n - 1 else 0)
        if fillw > 0: d.rounded_rectangle((x, y0, x + fillw, y0 + 16), 8, fill=GOLD)
def sticker(c, t):
    if not (BEATS['proof']['start'] + 2.0 <= t < BEATS['payoff']['start'] + 0.4): return
    k = t - BEATS['proof']['start'] - 2.0; pop = t - BEATS['payoff']['start']
    if pop > 0:   # pops off as the payoff starts
        if pop > 0.35: return
    lay = Image.new('RGBA', (330, 130)); ld = ImageDraw.Draw(lay)
    ld.rounded_rectangle((6, 6, 324, 124), 22, fill=(150, 105, 20, 235), outline=WHITE, width=5)
    f = F(40); ld.text((24, 14), "BEST WRECK", font=f, fill=WHITE); ld.text((24, 64), "= SAVED FOR LAST", font=F(34), fill=(255, 235, 170))
    sc = min(1, ease(k / 0.4)) * (1 + 0.04 * math.sin(t * 5)) * (1 + 0.6 * max(0, pop) / 0.35)
    if pop > 0: lay.putalpha(lay.getchannel('A').point(lambda v: int(v * (1 - pop / 0.35))))
    lay = lay.resize((max(1, int(330 * sc)), max(1, int(130 * sc)))).rotate(6, expand=True, resample=Image.BICUBIC)
    c.alpha_composite(lay, (W - lay.width - 24, 1180))
def overlay(c, beat, t):
    b = BEATS[beat]; lt = t - b['start']; L = b['end'] - b['start']; d = ImageDraw.Draw(c)
    if beat == 'hook':
        lt = t   # text is up from frame 1
        text_c(c, "BROKE?", F(210), 240, GOLD)
        if t > 1.2:
            text_c(c, "DON'T RISK", F(110), 500, WHITE)
            for i in range(5):
                if t > 1.4 + i * 0.12: star(d, 260 + i * 140, 700, 58, (255, 200, 40))
        if t > 4.2: pill(c, "WHAT'S UNDER THE WATER?", 820, (20, 90, 160), 58, t - 4.2, ang=-3)
        if t > 6.0:
            fl = 0.5 + 0.5 * math.sin(t * 16); pill(c, "SHARKS!", 960, (int(180 + 60 * fl), 30, 45), 90, t - 6.0, ang=4)
    elif beat == 'proof':
        k = ease(lt / 1.0); text_c(c, str(int(33 * k)), F(300), 230, GOLD)
        text_c(c, "UNDERWATER SPOTS", F(96), 570, WHITE); tag(c, "Push Square")
    elif beat == 'shop':
        text_c(c, "KEY LENTO", F(130), 240, WHITE, x=60); text_c(c, "DIVE SHOP", F(110), 390, GOLD, x=60)
        if lt > 1.6: pill(c, "SCUBA GEAR + BOAT", 580, (20, 90, 160), 60, lt - 1.6)
        if MAP_T <= t < MAP_T + 1.6: pin(c, 540, 1050, (t - MAP_T) / 0.4, "KEY LENTO")
        tag(c, "Kenton's yellow shop · Island Dreams · IGN")
    elif beat == 'boat':
        text_c(c, "AUTOPILOT", F(140), 240, WHITE, x=60)
        if lt > 0.6: pill(c, "DOUBLE-TAP TRIANGLE / Y", 440, (20, 90, 160), 60, lt - 0.6)
        if lt > 2.6: pill(c, "ANCHOR: VEHICLE MENU", 580, (90, 60, 20), 60, lt - 2.6, ang=-3)
        tag(c, "Push Square")
    elif beat == 'dive':
        text_c(c, "DIVE", F(160), 230, WHITE, x=60)
        if lt > 0.3: pill(c, "HOLD R1 / RB", 450, (20, 90, 160), 66, lt - 0.3)
        if lt > 1.6: pill(c, "DETECTOR GLOWS GREEN", 590, GREEN, 60, lt - 1.6, ang=-3)
        if lt > 2.8: pill(c, "= TREASURE CLOSE", 720, (30, 140, 70), 60, lt - 2.8, ang=3)
        tag(c, "GTABoom")
    elif beat == 'shark':
        fl = 0.5 + 0.5 * math.sin(lt * 14)
        text_c(c, "BEHIND YOU", F(150), 260, (255, int(60 + 120 * fl), int(60 + 120 * fl)))
        if lt > 0.9: pill(c, "SHARKS", 480, RED, 110, lt - 0.9, ang=-4)
        tag(c, "Seen in players' videos")
    elif beat == 'sell':
        text_c(c, "CASH IN", F(150), 230, WHITE, x=60)
        if lt > 0.2: pill(c, "SELL TO KENTON", 450, (30, 140, 70), 70, lt - 0.2)
        if lt > 1.0: pill(c, "ONE ITEM AT A TIME", 590, (20, 90, 160), 60, lt - 1.0, ang=-3)
        if lt > 2.0: pill(c, "NO NEED TO CLEAR THE WRECK", 720, (90, 60, 20), 50, lt - 2.0, ang=3)
        tag(c, "GTABoom")
    elif beat == 'payoff':
        if lt < 0.25: c.alpha_composite(Image.new('RGBA', (W, H), (255, 210, 90, int(200 * (1 - lt / 0.25)))))
        text_c(c, "THE ONE I SAVED", F(100), 220, WHITE)
        if lt > 1.0: text_c(c, "DEL OCIO", F(170), 360, GOLD)
        if lt > 1.6: pill(c, "10 GOLD DOUBLOONS", 600, (30, 140, 70), 84, lt - 1.6, ang=-4)
        if lt > 4.6: pill(c, "+ GOLDEN CHALICE", 780, (150, 105, 20), 58, lt - 4.6, ang=3)
        if lt > 5.6: pill(c, "+ GOLDEN LLAMA", 910, (150, 105, 20), 58, lt - 5.6, ang=-3)
        tag(c, "IGN · GTABoom")
    elif beat == 'track':
        text_c(c, "LAST TIP", F(130), 230, WHITE)
        for i, (t0, txt) in enumerate([(0.9, "PROGRESS"), (1.9, "COLLECTIONS"), (2.9, "KENTON'S TREASURES")]):
            if lt > t0:
                pill(c, txt, 430 + i * 150, (20, 90, 160) if i < 2 else (150, 105, 20), 64, lt - t0, ang=0)
                if i < 2: d.polygon([(W / 2 - 26, 545 + i * 150), (W / 2 + 26, 545 + i * 150), (W / 2, 575 + i * 150)], fill=WHITE)
        if lt > 4.6: pill(c, "NEVER DIVE THE SAME WRECK TWICE", 900, (30, 140, 70), 48, lt - 4.6, ang=-2)
    progress(c, beat, lt); sticker(c, t)

def captions(c, t):
    for ln in LINES:
        if ln['s'] <= t < ln['e']:
            words = ln['t'].split(); chunks = []; cur = []
            for w_ in words:
                cur.append(w_)
                if len(cur) >= 4: chunks.append(cur); cur = []
            if cur: chunks.append(cur)
            tot = sum(len(' '.join(ch)) for ch in chunks); acc = 0; dur = ln['e'] - ln['s']
            for ch in chunks:
                s = ln['s'] + dur * acc / tot; acc += len(' '.join(ch)); e = ln['s'] + dur * acc / tot
                if s <= t < e:
                    txt = ' '.join(ch).upper(); d = ImageDraw.Draw(c); f = F(74); w = d.textlength(txt, font=f)
                    if w > W - 80: f = F(int(74 * (W - 80) / w)); w = d.textlength(txt, font=f)
                    hl = any(x.isdigit() for x in txt) or 'DOLLAR' in txt
                    d.text(((W - w) / 2, 1560), txt, font=f, fill=GOLD if hl else WHITE, stroke_width=8, stroke_fill=(10, 8, 25))
            return
def beat_at(t):
    for b in meta['beats']:
        if t < b['end']: return b['beat']
    return meta['beats'][-1]['beat']

ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-i', f'{WD}/mix.wav', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
                       '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
bg = bg_stream(); last = None; N = int(DUR * FPS)
for i in range(N):
    t = i / FPS
    try: fr = next(bg); last = fr
    except StopIteration: fr = last
    c = Image.composite(Image.new('RGB', (W, H), (8, 6, 22)), fr, SH).convert('RGBA')
    d = ImageDraw.Draw(c); f = FI(28); lab = "WANTED INTEL · GTA 6 TREASURE"; w = d.textlength(lab, font=f)
    d.rounded_rectangle(((W - w) / 2 - 24, 110, (W + w) / 2 + 24, 162), 26, fill=(235, 40, 60, 220)); d.text(((W - w) / 2, 118), lab, font=f, fill=WHITE)
    overlay(c, beat_at(t), t); captions(c, t)
    if t > DUR - 1.0: c = Image.blend(c.convert('RGB'), Image.new('RGB', (W, H)), min(1, (t - (DUR - 1.0)) / 0.9)).convert('RGBA')
    ff.stdin.write(c.convert('RGB').tobytes())
ff.stdin.close(); ff.wait(); print('done', OUT, N)
