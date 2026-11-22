"""Short: GTA 6 made $3.79 billion in one day. Renders 1080x1920 30fps frames with PIL, pipes to ffmpeg.
Usage: python3 production/v039_render.py <workdir with vo.wav + vo.json> <out.mp4>"""
import sys, json, math, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WD, OUT = sys.argv[1], sys.argv[2]
W, H, FPS = 1080, 1920, 30
FR = '/home/user/Adds/remotion-overlays/public/frames/'
ANTON = '/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
INTER = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
F = lambda n: ImageFont.truetype(ANTON, n)
FI = lambda n: ImageFont.truetype(INTER, n)
meta = json.load(open(f'{WD}/vo.json')); BEATS = {b['beat']: b for b in meta['beats']}; LINES = meta['lines']
DUR = meta['beats'][-1]['end'] + 0.6
GOLD, RED, WHITE, PINK = (255, 200, 60), (235, 40, 60), (255, 255, 255), (255, 70, 150)

BG = {'hook': ('lt-27.5.jpg', 0.62), 'official': ('lt-41.5.jpg', 0.40), 'guess': ('lt-49.jpg', 0.30),
      'movie': ('lt-0053-night-heli.jpg', 0.55), 'gta5': ('el-1404-heli.jpg', 0.42), 'internet': ('c1-el-police-block.jpg', 0.55),
      'copies': ('t1-0008-lucia-look.jpg', 0.33), 'close': ('lt-41.5.jpg', 0.55)}
cache = {}
def bgimg(beat):
    if beat in cache: return cache[beat]
    f, cx = BG[beat]; im = Image.open(FR + f).convert('RGB')
    # trim the cinematic letterbox bars
    a = np.asarray(im.convert('L')); rows = np.where(a.mean(1) > 12)[0]; im = im.crop((0, rows[0] + 4, im.width, rows[-1] - 4))
    ch = im.height; cw = int(ch * 9 / 16); x0 = int(min(max(cx * im.width - cw / 2, 0), im.width - cw))
    im = im.crop((x0, 0, x0 + cw, ch)).resize((int(W * 1.12), int(H * 1.12)), Image.LANCZOS)
    cache[beat] = im; return im

def ease(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 3
def shade():
    g = Image.new('L', (W, H)); d = ImageDraw.Draw(g)
    for y in range(H):
        v = 0
        if y < 420: v = 170 * (1 - y / 420)
        if y > 1050: v = max(v, 235 * min(1, (y - 1050) / 600))
        d.line([(0, y), (W, y)], fill=int(v + 40))
    return g
SHADE = shade()

def text_c(d, t, f, y, fill, sw=8, sf=(10, 8, 25), x=None):
    w = d.textlength(t, font=f); xx = (W - w) / 2 if x is None else x
    d.text((xx, y), t, font=f, fill=fill, stroke_width=sw, stroke_fill=sf); return w
def glow_text(c, t, f, y, fill, glow, x=None, sw=8):
    gl = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(gl); w = gd.textlength(t, font=f); xx = (W - w) / 2 if x is None else x
    gd.text((xx, y), t, font=f, fill=glow + (200,)); c.alpha_composite(gl.filter(ImageFilter.GaussianBlur(20)))
    text_c(ImageDraw.Draw(c), t, f, y, fill, sw=sw, x=xx)
def stamp(c, t, cy, col, k, ang=-6, size=110, cx=None):
    if k <= 0: return
    s = 1.6 - 0.6 * ease(k * 3); f = F(int(size * s)); d0 = ImageDraw.Draw(c)
    w = d0.textlength(t, font=f); pad = 34
    lay = Image.new('RGBA', (int(w + pad * 2 + 20), int(size * s * 1.5 + 20)))
    ld = ImageDraw.Draw(lay); ld.rounded_rectangle((10, 10, lay.width - 10, lay.height - 10), 26, fill=col + (235,), outline=WHITE, width=7)
    ld.text((10 + pad, 10 + size * s * 0.12), t, font=f, fill=WHITE)
    lay = lay.rotate(ang, expand=True, resample=Image.BICUBIC)
    c.alpha_composite(lay, (int((W / 2 if cx is None else cx) - lay.width / 2), int(cy - lay.height / 2)))
def tag(c, t, y=1440):
    d = ImageDraw.Draw(c); f = FI(30); w = d.textlength(t, font=f)
    d.rounded_rectangle(((W - w) / 2 - 22, y, (W + w) / 2 + 22, y + 52), 26, fill=(0, 0, 0, 170))
    d.text(((W - w) / 2, y + 9), t, font=f, fill=(230, 230, 240))
def money(v):
    return f"${v:.2f}B" if v >= 1 else f"${v*1000:.0f}M"
def bar(c, x, y_bot, w, hmax, frac, col, label, val, sub):
    d = ImageDraw.Draw(c); h = hmax * frac
    d.rounded_rectangle((x, y_bot - h, x + w, y_bot), 18, fill=col + (240,), outline=WHITE, width=4)
    if frac > 0.02:
        f = F(64); vw = d.textlength(val, font=f); d.text((x + w / 2 - vw / 2, y_bot - h - 84), val, font=f, fill=WHITE, stroke_width=6, stroke_fill=(10, 8, 25))
    f2 = FI(30); lw = d.textlength(label, font=f2); d.text((x + w / 2 - lw / 2, y_bot + 14), label, font=f2, fill=WHITE)
    f3 = FI(24); sw_ = d.textlength(sub, font=f3); d.text((x + w / 2 - sw_ / 2, y_bot + 52), sub, font=f3, fill=(200, 200, 215))

def overlay(c, beat, t):
    b = BEATS[beat]; lt = t - b['start']; d = ImageDraw.Draw(c)
    if beat == 'hook':
        v = 3.79 * ease(lt / 2.6)
        glow_text(c, money(v) if v > 0.005 else "$0", F(230), 520, GOLD, (255, 160, 0))
        stamp(c, "IN ONE DAY", 900, RED, (lt - 3.2) / 1.0)
    elif beat == 'official':
        stamp(c, "OFFICIAL", 430, (30, 160, 80), lt / 1.0, ang=-4)
        if lt > 1.6:
            k = ease((lt - 1.6) / 0.6); y = 640 + 40 * (1 - k)
            for i, ln in enumerate(["\"THE BIGGEST", "ENTERTAINMENT LAUNCH", "IN HISTORY\""]):
                text_c(d, ln, F(96), y + i * 112, WHITE if i != 1 else GOLD)
        if lt > 6.5:
            chips = ["GAMES", "MOVIES", "MUSIC"]; x = 140
            for i, ch in enumerate(chips):
                if lt > 6.5 + i * 0.4:
                    f = F(58); w = d.textlength(ch, font=f); d.rounded_rectangle((x, 1050, x + w + 50, 1140), 45, fill=(255, 255, 255, 230))
                    d.text((x + 25, 1058), ch, font=f, fill=(20, 15, 40)); d.line((x + 10, 1095, x + w + 40, 1095), fill=RED, width=10)
                x += w + 90
        tag(c, "CONFIRMED · Take-Two press release, 20 Nov")
    elif beat == 'guess':
        text_c(d, "THE GUESSES", F(110), 300, WHITE)
        base = 1180; mx = 620; vals = [(1.84, (90, 110, 170), "ESTIMATE #1", "Sensor Tower via THR", 1.0), (2.36, (90, 110, 170), "ESTIMATE #2", "Sensor Tower via BBC", 3.0), (3.79, GOLD, "OFFICIAL", "Take-Two", 6.8)]
        for i, (v, col, lab, sub, at) in enumerate(vals):
            fr = ease((lt - at) / 0.9) * v / 3.79
            bar(c, 90 + i * 320, base, 260, mx, fr, col, lab, money(v), sub)
        tag(c, "REPORTED estimates vs CONFIRMED total", 1330)
    elif beat == 'movie':
        text_c(d, "VS EVERY MOVIE", F(110), 300, WHITE)
        base = 1180; mx = 620
        bar(c, 150, base, 330, mx, ease(lt / 1.0) * 1.80 / 3.79, (120, 120, 150), "THE ODYSSEY", "$1.80B", "whole box-office run")
        bar(c, 600, base, 330, mx, ease((lt - 4.8) / 0.9), GOLD, "GTA 6", "$3.79B", "day one")
        if lt > 6.2: stamp(c, "2×", 640, RED, (lt - 6.2), ang=8, size=120, cx=315)
        tag(c, "REPORTED · The Hollywood Reporter", 1330)
    elif beat == 'gta5':
        text_c(d, "VS GTA 5", F(120), 300, WHITE)
        base = 1180; mx = 620
        bar(c, 150, base, 330, mx, ease(lt / 1.0) * 0.8 / 3.79, (110, 160, 120), "GTA V · 2013", "$800M", "day one")
        bar(c, 600, base, 330, mx, ease((lt - 4.5) / 0.9), GOLD, "GTA VI · 2026", "$3.79B", "day one")
        if lt > 5.8: stamp(c, "≈4.7×", 780, RED, (lt - 5.8), ang=-7, size=100, cx=315)
        tag(c, "Take-Two (2013 & 2026)", 1330)
    elif beat == 'internet':
        text_c(d, "THE INTERNET FELT IT", F(96), 330, WHITE)
        v = 14.8 * ease((lt - 1.2) / 2.2)
        glow_text(c, f"{v:.1f}×", F(260), 520, (120, 220, 255), (0, 150, 255))
        text_c(d, "NEW ZEALAND TRAFFIC vs NORMAL", F(60), 860, WHITE, sw=6)
        tag(c, "REPORTED · Cloudflare data via BBC")
    elif beat == 'copies':
        text_c(d, "COPIES SOLD:", F(120), 420, WHITE)
        q = "???" if int(lt * 6) % 2 == 0 or lt > 2 else "?? "
        glow_text(c, q, F(300), 560, PINK, (255, 30, 120))
        if lt > 2.5: text_c(d, "Take-Two hasn't said yet", F(64), 960, (230, 230, 240), sw=5)
        tag(c, "32M? reported by one outlet, NOT confirmed")
    elif beat == 'close':
        glow_text(c, "DAY ONE", F(170), 470, WHITE, (255, 120, 180))
        glow_text(c, "BUYER?", F(200), 660, GOLD, (255, 160, 0))
        k = 0.5 + 0.5 * math.sin(lt * 6)
        d.polygon([(W / 2 - 50, 980 + 20 * k), (W / 2 + 50, 980 + 20 * k), (W / 2, 1060 + 20 * k)], fill=WHITE)
        text_c(d, "COMMENT", F(70), 1080, WHITE, sw=6)

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
                    txt = ' '.join(ch).upper(); d = ImageDraw.Draw(c); f = F(76)
                    w = d.textlength(txt, font=f)
                    if w > W - 80: f = F(int(76 * (W - 80) / w)); w = d.textlength(txt, font=f)
                    hl = any(ch_.isdigit() for ch_ in txt)
                    d.text(((W - w) / 2, 1560), txt, font=f, fill=GOLD if hl else WHITE, stroke_width=8, stroke_fill=(10, 8, 25))
            return

order = [b['beat'] for b in meta['beats']]
def beat_at(t):
    for b in meta['beats']:
        if t < b['end']: return b['beat']
    return order[-1]

ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-i', f'{WD}/mix.wav', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
                       '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
N = int(DUR * FPS)
for i in range(N):
    t = i / FPS; beat = beat_at(t); b = BEATS[beat]
    lt = t - b['start']; bl = b['end'] - b['start']
    z = 1.0 + 0.08 * (lt / max(bl, 1)); im = bgimg(beat)
    cw, ch = int(im.width / (1.12 * z) * 1.0), int(im.height / (1.12 * z))
    x0 = (im.width - cw) // 2; y0 = (im.height - ch) // 2
    fr = im.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BILINEAR)
    # crossfade from previous beat in the first 0.3 s
    idx = order.index(beat)
    if idx > 0 and lt < 0.3:
        pb = order[idx - 1]; pim = bgimg(pb); pc = pim.crop(((pim.width - int(pim.width / 1.12 / 1.08)) // 2, (pim.height - int(pim.height / 1.12 / 1.08)) // 2,
                                                            (pim.width + int(pim.width / 1.12 / 1.08)) // 2, (pim.height + int(pim.height / 1.12 / 1.08)) // 2)).resize((W, H), Image.BILINEAR)
        fr = Image.blend(pc, fr, lt / 0.3)
    c = Image.composite(Image.new('RGB', (W, H), (8, 6, 22)), fr, SHADE).convert('RGBA')
    d = ImageDraw.Draw(c); f = FI(28); lab = "WANTED INTEL · GTA 6 SALES"; w = d.textlength(lab, font=f)
    d.rounded_rectangle(((W - w) / 2 - 24, 120, (W + w) / 2 + 24, 172), 26, fill=(235, 40, 60, 220)); d.text(((W - w) / 2, 128), lab, font=f, fill=WHITE)
    overlay(c, beat, t); captions(c, t)
    if t > DUR - 0.6: c = Image.blend(c.convert('RGB'), Image.new('RGB', (W, H)), (t - (DUR - 0.6)) / 0.6).convert('RGBA')
    ff.stdin.write(c.convert('RGB').tobytes())
ff.stdin.close(); ff.wait(); print('done', OUT, N)
