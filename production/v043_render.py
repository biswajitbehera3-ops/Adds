"""Short 043: 7 hidden GTA 6 map secrets. Official Rockstar clips (Extended Look + Trailer 2) matched to each line,
official Leonida map for the intro and the Key Lento pin. Usage: python3 production/v043_render.py <workdir> <out.mp4>"""
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

# ---- background track: map intro + clips (+ 1.9 s map after the ladder) ----
mapimg = Image.open(f'{WD}/../map_mobile.jpg').convert('RGB')
mapimg = mapimg.resize((int(mapimg.width * H / mapimg.height * 1.15), int(H * 1.15)), Image.LANCZOS)
def map_frame(z, cx=0.5, cy=0.5):
    cw, ch = int(W / z * 1.0), int(H / z)
    cw = min(cw, mapimg.width); ch = min(ch, mapimg.height)
    x0 = int(min(max(cx * mapimg.width - cw / 2, 0), mapimg.width - cw)); y0 = int(min(max(cy * mapimg.height - ch / 2, 0), mapimg.height - ch))
    return mapimg.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BILINEAR)
order = []
order.append(('map', BEATS['hook']['end'] - 0.0))
for b in ['blue', 'parrot', 'parachute', 'guns', 'watson', 'jets', 'vault', 'close']:
    for s in [s for s in SEGS if s['beat'] == b]: order.append(('clip', s['file']))
    if b == 'parachute': order.append(('map2', 1.9))
def clip_frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f'{WD}/{path}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3: break
        yield Image.frombuffer('RGB', (W, H), b)
def bg_stream():
    for kind, v in order:
        if kind == 'map':
            n = int(v * FPS)
            for i in range(n): yield map_frame(1.0 + 0.10 * i / n)
        elif kind == 'map2':
            n = int(v * FPS)
            for i in range(n): yield map_frame(1.35 + 0.15 * i / n, 0.30, 0.80)
        else:
            yield from clip_frames(v)
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

def overlay(c, beat, t):
    b = BEATS[beat]; lt = t - b['start']
    if beat == 'hook':
        text_c(c, "7 HIDDEN", F(150), 250, WHITE); text_c(c, "MAP SECRETS", F(150), 410, GOLD)
        for i, (x, y) in enumerate([(240, 760), (700, 700), (420, 950), (820, 980), (300, 1180), (640, 1220), (880, 820)]):
            pin(c, x, y, (lt - 0.6 - i * 0.35) / 0.5)
        if lt > 4.2: pill(c, "#5 = $10,000", 1430, (30, 140, 70), 70, (lt - 4.2), ang=-3)
    elif beat == 'blue':
        badge(c, 1, lt); text_c(c, "DARK BLUE", F(130), 220, CYAN, x=210); text_c(c, "= GO INSIDE", F(110), 370, WHITE, x=210)
        if lt > 3.2: pill(c, "MINIMAP SHOWS BACK ROOMS", 560, (20, 90, 160), 56, lt - 3.2)
        tag(c, "Red Bull GTA 6 guide")
    elif beat == 'parrot':
        badge(c, 2, lt); text_c(c, "THE PARROT'S", F(120), 220, WHITE, x=210); text_c(c, "CASH STASH", F(120), 360, GOLD, x=210)
        if lt > 5.4: pill(c, "VENT BEHIND THE GENERATOR", 560, (90, 60, 20), 54, lt - 5.4)
        if lt > 7.0: pill(c, "$1,200", 690, (30, 140, 70), 90, lt - 7.0, ang=-4)
        tag(c, "\"Strange Noises\" side job · Insider Gaming")
    elif beat == 'parachute':
        badge(c, 3, lt); text_c(c, "FREE", F(130), 220, WHITE, x=210); text_c(c, "PARACHUTE", F(130), 370, GOLD, x=210)
        if lt > 1.8: pill(c, "CLIMB THE TOWER WITH A LADDER", 570, (20, 90, 160), 52, lt - 1.8)
        if lt > b['end'] - b['start'] - 1.9: pin(c, 540, 1050, (lt - (b['end'] - b['start'] - 1.9)) / 0.4, "KEY LENTO")
        tag(c, "Insider Gaming")
    elif beat == 'guns':
        badge(c, 4, lt); text_c(c, "FREE GUNS", F(130), 220, WHITE, x=210); text_c(c, "TEQUESTA", F(110), 370, GOLD, x=210)
        if lt > 2.0: pill(c, "UNLOCKED STORAGE UNIT", 560, (20, 90, 160), 56, lt - 2.0)
        if lt > 6.2: pill(c, "DESERT EAGLE + RIFLE", 690, (120, 30, 40), 56, lt - 6.0)
        if lt > 8.6: pill(c, "$3,000 CARD", 820, (30, 140, 70), 64, lt - 8.6, ang=-4)
        tag(c, "Opposite the Vice Seven gym · Insider Gaming")
    elif beat == 'watson':
        badge(c, 5, lt); text_c(c, "WATSON BAY", F(130), 220, WHITE, x=210)
        if lt > 1.6: text_c(c, "SAFE: 0072", F(140), 420, GOLD)
        if lt > 4.6: text_c(c, "DOCK: 0212", F(140), 590, CYAN)
        if lt > 7.6: pill(c, "SMG + $10,000", 790, (30, 140, 70), 90, lt - 7.6, ang=-4)
        tag(c, "GTABase · TheGamer")
    elif beat == 'jets':
        badge(c, 6, lt); text_c(c, "MIKE ZERO", F(130), 220, WHITE, x=210); text_c(c, "= JETS", F(120), 370, GOLD, x=210)
        if lt > 4.0: pill(c, "4★ INSTANTLY", 580, RED, 90, lt - 4.0, ang=-4)
        tag(c, "South-west of the Keys · SVG")
    elif beat == 'vault':
        badge(c, 7, lt); text_c(c, "SECRET RADIO", F(120), 220, WHITE, x=210); text_c(c, "THE VAULT", F(130), 360, (255, 90, 200), x=210)
        if lt > 2.2: pill(c, "NIGHTCLUB · DOWNTOWN", 560, (90, 30, 120), 56, lt - 2.2)
        tag(c, "RouteNote")
    elif beat == 'close':
        text_c(c, "WHICH ONE", F(150), 420, WHITE); text_c(c, "DIDN'T YOU KNOW?", F(120), 590, GOLD)
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
    d = ImageDraw.Draw(c); f = FI(28); lab = "WANTED INTEL · GTA 6 MAP SECRETS"; w = d.textlength(lab, font=f)
    d.rounded_rectangle(((W - w) / 2 - 24, 110, (W + w) / 2 + 24, 162), 26, fill=(235, 40, 60, 220)); d.text(((W - w) / 2, 118), lab, font=f, fill=WHITE)
    overlay(c, beat_at(t), t); captions(c, t)
    if t > DUR - 0.6: c = Image.blend(c.convert('RGB'), Image.new('RGB', (W, H)), (t - (DUR - 0.6)) / 0.6).convert('RGBA')
    ff.stdin.write(c.convert('RGB').tobytes())
ff.stdin.close(); ff.wait(); print('done', OUT, N)
