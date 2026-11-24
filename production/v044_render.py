"""Short 044: GTA 6 underwater treasure guide. Official Rockstar clips (Extended Look, Trailers 1 & 2, Launch Trailer), none used
in earlier videos, matched to each line; official Leonida map for the Key Lento pin. Usage: python3 production/v044_render.py <workdir> <out.mp4>"""
import sys, json, math, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WD, OUT = sys.argv[1], sys.argv[2]
W, H, FPS = 1080, 1920, 30
ANTON = '/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
INTER = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
F = lambda n: ImageFont.truetype(ANTON, n); FI = lambda n: ImageFont.truetype(INTER, n)
meta = json.load(open(f'{WD}/vo.json')); BEATS = {b['beat']: b for b in meta['beats']}; LINES = meta['lines']
DUR = meta['beats'][-1]['end'] + 0.6
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

def items(c, lst, lt, y0=560):
    for i, (t0, txt, col) in enumerate(lst):
        if lt > t0: pill(c, txt, y0 + i * 130, col, 60, lt - t0, ang=(-3 if i % 2 else 3))
def overlay(c, beat, t):
    b = BEATS[beat]; lt = t - b['start']; L = b['end'] - b['start']
    if beat == 'hook':
        text_c(c, "SUNKEN", F(170), 230, WHITE); text_c(c, "TREASURE", F(170), 420, GOLD)
        if lt > 1.9: pill(c, "EASY MONEY", 660, (30, 140, 70), 84, lt - 1.9, ang=-4)
    elif beat == 'count':
        k = ease(lt / 1.2); text_c(c, str(int(33 * k)), F(300), 200, GOLD)
        text_c(c, "UNDERWATER SPOTS", F(96), 540, WHITE); tag(c, "Push Square")
    elif beat == 'shop':
        badge(c, 1, lt); text_c(c, "KEY LENTO", F(130), 220, WHITE, x=210); text_c(c, "DIVE SHOP", F(110), 370, GOLD, x=210)
        if lt > 1.4: pill(c, "SCUBA GEAR + BOAT", 560, (20, 90, 160), 60, lt - 1.4)
        if MAP_T <= t < MAP_T + 1.9: pin(c, 540, 1050, (t - MAP_T) / 0.4, "KEY LENTO")
        tag(c, "Kenton's yellow shop · Island Dreams · IGN")
    elif beat == 'boat':
        badge(c, 2, lt); text_c(c, "AUTOPILOT", F(130), 220, WHITE, x=210)
        if lt > 0.9: pill(c, "DOUBLE-TAP TRIANGLE / Y", 420, (20, 90, 160), 60, lt - 0.9)
        if lt > 3.6: pill(c, "ANCHOR: VEHICLE MENU", 560, (90, 60, 20), 60, lt - 3.6, ang=-3)
        tag(c, "Push Square")
    elif beat == 'dive':
        badge(c, 3, lt); text_c(c, "DIVE", F(150), 210, WHITE, x=210)
        if lt > 0.3: pill(c, "HOLD R1 / RB", 420, (20, 90, 160), 66, lt - 0.3)
        if lt > 2.4: pill(c, "DETECTOR GLOWS GREEN", 560, GREEN, 60, lt - 2.4, ang=-3)
        if lt > 3.6: pill(c, "= TREASURE CLOSE", 690, (30, 140, 70), 60, lt - 3.6, ang=3)
        tag(c, "GTABoom")
    elif beat == 'wrecks':
        badge(c, 4, lt); text_c(c, "THE WRECKS", F(130), 220, GOLD, x=210)
        items(c, [(1.2, "GOLDEN CHALICE", (150, 105, 20)), (2.4, "GOLDEN LLAMA", (150, 105, 20)), (3.6, "GOLD DOUBLOONS", (150, 105, 20))], lt, 420)
        if lt > 5.4: pill(c, "DEL OCIO WRECK = 10 DOUBLOONS", 830, (30, 140, 70), 52, lt - 5.4, ang=-2)
        tag(c, "IGN · GTABoom")
    elif beat == 'sell':
        badge(c, 5, lt); text_c(c, "CASH IN", F(140), 210, WHITE, x=210)
        if lt > 0.3: pill(c, "SELL TO KENTON", 420, (30, 140, 70), 70, lt - 0.3)
        if lt > 1.3: pill(c, "ONE ITEM AT A TIME", 560, (20, 90, 160), 60, lt - 1.3, ang=-3)
        if lt > 2.6: pill(c, "NO NEED TO CLEAR THE WRECK", 690, (90, 60, 20), 50, lt - 2.6, ang=3)
        tag(c, "GTABoom")
    elif beat == 'shark':
        fl = 0.5 + 0.5 * math.sin(lt * 14)
        text_c(c, "WATCH OUT", F(150), 260, (255, int(60 + 120 * fl), int(60 + 120 * fl)))
        if lt > 0.9: pill(c, "SHARKS", 470, RED, 110, lt - 0.9, ang=-4)
        tag(c, "Seen in players' videos")
    elif beat == 'close':
        text_c(c, "WHICH WRECK", F(140), 420, WHITE); text_c(c, "FIRST?", F(150), 580, GOLD)
        d = ImageDraw.Draw(c); k = 0.5 + 0.5 * math.sin(lt * 6)
        d.polygon([(W / 2 - 50, 800 + 20 * k), (W / 2 + 50, 800 + 20 * k), (W / 2, 880 + 20 * k)], fill=WHITE)

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
    if t > DUR - 0.6: c = Image.blend(c.convert('RGB'), Image.new('RGB', (W, H)), (t - (DUR - 0.6)) / 0.6).convert('RGBA')
    ff.stdin.write(c.convert('RGB').tobytes())
ff.stdin.close(); ff.wait(); print('done', OUT, N)
