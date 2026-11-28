"""Short 049: GTA 6 free tank (President's Bunker). 'Top Secret file' graphics over official Rockstar clips and
screenshots: padlock bar, route-line map, amber LED codes synced to the spoken digits, OBSESS -> 085355 morph,
and every tank scene (hook, hangar reveal, ending) set in our own military hangar with the detailed tank
illustration (tank_art.py + hangar_bg.py): drive-in, cannon fire, sliding doors, roll-in, codes recap. Usage: python3 production/v049_render.py <workdir> <out.mp4>"""
import sys, json, math, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import random
sys.path.insert(0, '/home/user/Adds/production'); import hangar_bg as hb, map_route as mr

WD, OUT = sys.argv[1], sys.argv[2]
W, H, FPS = 1080, 1920, 30
ANTON = '/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
INTER = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
A = lambda n: ImageFont.truetype(ANTON, int(n)); I = lambda n: ImageFont.truetype(INTER, int(n))
GOLD, RED, GREEN, AMBER, WHITE = (255, 196, 40), (220, 35, 45), (60, 200, 90), (255, 170, 30), (255, 255, 255)
meta = json.load(open(f'{WD}/vo.json')); BEATS = {b['beat']: b for b in meta['beats']}; LINES = meta['lines']; M = meta['marks']
SEGS = json.load(open(f'{WD}/segs.json'))
DUR = meta['beats'][-1]['end'] + 1.2
def ease(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 3

# ---------- backgrounds ----------
def fit(im, cx):
    h = im.height; w = int(h * 9 / 16); x = int(min(max(cx * im.width - w / 2, 0), im.width - w))
    return im.crop((x, 0, x + w, h))
STILL = {}
def still_frame(path, cx, k):
    if path not in STILL:
        im = Image.open(path); im.draft('RGB', (2400, 1350)); im = fit(im.convert('RGB'), cx)
        STILL[path] = im.resize((int(W * 1.18), int(H * 1.18)), Image.LANCZOS)
    im = STILL[path]; z = 1.0 + 0.15 * k                       # slow Ken Burns push
    cw, ch = int(im.width / z / 1.18 * 1.0), int(im.height / z / 1.18)
    x0 = (im.width - cw) // 2; y0 = (im.height - ch) // 2
    return im.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BILINEAR)
DARK = Image.new('RGB', (W, H), (14, 16, 12)); dd = ImageDraw.Draw(DARK)
for y in range(0, H, 6): dd.line([(0, y), (W, y)], fill=(18, 21, 15))       # faint scanlines
for x in range(0, W, 90): dd.line([(x, 0), (x, H)], fill=(22, 26, 18))      # grid = classified-file texture
DARK = DARK.filter(ImageFilter.GaussianBlur(0.6))
HANGAR = hb.base(); HANGAR_DIM = Image.blend(HANGAR, Image.new('RGB', (W, H), (14, 16, 12)), 0.45)
TANK = Image.open(f'{WD}/tank.png').convert('RGBA')
def tank_w(w): return TANK.resize((int(w), int(w * TANK.height / TANK.width)), Image.LANCZOS)
T_HOOK, T_PAY, T_END = tank_w(980), tank_w(1040), tank_w(720)
def put_tank(c, img, x, y, glow=0.55):
    lay = Image.new('RGBA', (W, H)); lay.alpha_composite(img, (int(x), int(y)))
    g = lay.getchannel('A').filter(ImageFilter.GaussianBlur(24)).point(lambda v: int(v * glow))
    c.alpha_composite(Image.merge('RGBA', (Image.new('L', (W, H), 255), Image.new('L', (W, H), 196), Image.new('L', (W, H), 60), g)))
    c.alpha_composite(hb.reflection(img, x, y)); c.alpha_composite(lay)
random.seed(3)
DUST = [dict(x=random.uniform(-0.5, 0.5), vy=random.uniform(-60, -10), vx=random.uniform(-140, -40), r=random.uniform(14, 40), t0=random.uniform(0, 0.8)) for _ in range(40)]
def dust_cloud(c, cx, cy, k, strength=1.0):
    lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
    for p in DUST:
        q = k - p['t0']
        if 0 < q < 1.2:
            x = cx + p['x'] * 400 + p['vx'] * q; y = cy + p['vy'] * q; r = p['r'] * (1 + q)
            d.ellipse((x - r, y - r, x + r, y + r), fill=(150, 135, 105, int(110 * strength * (1 - q / 1.2))))
    c.alpha_composite(lay.filter(ImageFilter.GaussianBlur(6)))
def back_out(x): x = min(max(x, 0), 1); return 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2
def doors(c, open_k):
    d = ImageDraw.Draw(c)
    for side in (0, 1):
        off = open_k * (W / 2 + 20); x0 = -off if side == 0 else W / 2 + off
        d.rectangle((x0, 0, x0 + W / 2, H), fill=(52, 56, 46))
        for yy in range(0, H, 70): d.line([(x0, yy), (x0 + W / 2, yy)], fill=(38, 41, 33), width=6)
        ex0 = x0 + (W / 2 - 40 if side == 0 else 0); d.rectangle((ex0, 0, ex0 + 40, H), fill=(255, 196, 40))
        for yy in range(0, H, 80): d.polygon([(ex0, yy), (ex0 + 40, yy + 40), (ex0 + 40, yy + 80), (ex0, yy + 40)], fill=(20, 20, 20))
def clip_frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f'{WD}/{path}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3: break
        yield Image.frombuffer('RGB', (W, H), b)
    p.stdout.close(); p.wait()
ROUTE_T = []   # (start, end, stage)
def bg_stream():
    t = 0.0
    for s in SEGS:
        n = int(round(s['dur'] * FPS))
        if s['kind'] == 'clip':
            fr = None; got = 0
            for fr in clip_frames(s['file']):
                if got >= n: break
                yield fr; got += 1
            while got < n: yield fr; got += 1
        elif s['kind'] == 'still':
            for i in range(n): yield still_frame(s['path'], s['cx'], i / max(n - 1, 1))
        elif s['kind'] == 'route':
            ROUTE_T.append((t, t + s['dur'], s['stage']))
            for i in range(n): yield DARK
        elif s['kind'] == 'map':                                  # route on Rockstar's official Leonida map
            for i in range(n): yield mr.route_frame(s['stage'], i / max(n - 1, 1)).convert('RGB')
        elif s['kind'] == 'hangar':
            for i in range(n): yield HANGAR
        elif s['kind'] == 'hangar_dim':
            for i in range(n): yield HANGAR_DIM
        else:
            for i in range(n): yield DARK
        t += n / FPS
    while True: yield DARK
# route windows known up front
HOOK_TANK = SEGS[0]['dur'] if SEGS[0]['kind'] == 'hangar' else 0.0   # length of the tank intro
_t = 0.0; ROUTES = []
for s in SEGS:
    if s['kind'] in ('route', 'map'): ROUTES.append((_t, _t + round(s['dur'] * FPS) / FPS, s['stage']))
    _t += round(s['dur'] * FPS) / FPS
SH = Image.new('L', (W, H)); d0 = ImageDraw.Draw(SH)
for y in range(H):
    v = 175 * (1 - y / 600) if y < 600 else 0
    if y > 1280: v = max(v, 215 * min(1, (y - 1280) / 420))
    d0.line([(0, y), (W, y)], fill=int(v))

# ---------- graphic helpers ----------
def text_c(c, t, f, y, fill, sw=10, x=None):
    d = ImageDraw.Draw(c); w = d.textlength(t, font=f)
    if x is None and w > W - 60: f = A(f.size * (W - 60) / w); w = d.textlength(t, font=f)
    xx = (W - w) / 2 if x is None else x
    d.text((xx, y), t, font=f, fill=fill, stroke_width=sw, stroke_fill=(8, 8, 12)); return w
def pop(c, t, size, y, fill, k):
    if k <= 0: return
    s = 1.3 - 0.3 * ease(k * 4); text_c(c, t, A(size * s), y - size * (s - 1) * 0.5, fill)
def pill(c, t, y, col, size=58, k=1.0, ang=0, tc=WHITE):
    if k <= 0: return
    s = 1.35 - 0.35 * ease(k * 3); f = A(size * s); d = ImageDraw.Draw(c); w = d.textlength(t, font=f)
    lay = Image.new('RGBA', (int(w + 80), int(size * s * 1.5 + 22))); ld = ImageDraw.Draw(lay)
    ld.rounded_rectangle((6, 6, lay.width - 6, lay.height - 6), 24, fill=col + (238,), outline=WHITE, width=6)
    ld.text((40, 8 + size * s * 0.12), t, font=f, fill=tc)
    if ang: lay = lay.rotate(ang, expand=True, resample=Image.BICUBIC)
    c.alpha_composite(lay, (int(W / 2 - lay.width / 2), int(y)))
def stamp(c, t, y, ang, col, size, k):
    if k <= 0: return
    s = 1.6 - 0.6 * ease(k * 5); f = A(size * s); d = ImageDraw.Draw(c); w = int(d.textlength(t, font=f)) + 60
    lay = Image.new('RGBA', (w, int(size * s) + 60)); ld = ImageDraw.Draw(lay)
    ld.rectangle((6, 6, w - 6, lay.height - 6), outline=col + (235,), width=8); ld.text((30, 12), t, font=f, fill=col + (235,))
    lay = lay.rotate(ang, expand=True, resample=Image.BICUBIC); c.alpha_composite(lay, (int(W / 2 - lay.width / 2), int(y)))
def tag(c, t, y=1440):
    d = ImageDraw.Draw(c); f = I(26); w = d.textlength(t, font=f)
    d.rounded_rectangle(((W - w) / 2 - 18, y, (W + w) / 2 + 18, y + 46), 22, fill=(0, 0, 0, 175)); d.text(((W - w) / 2, y + 8), t, font=f, fill=(230, 230, 235))
def padlock(c, x, y, opened, k_open, label):
    d = ImageDraw.Draw(c); col = GREEN if opened else RED; lift = 14 * ease(k_open * 3) if opened else 0
    d.arc((x - 30, y - 64 - lift, x + 30, y - 4 - lift), 180, 360, fill=WHITE, width=11)
    if not opened: d.line([(x + 30, y - 34), (x + 30, y - 6)], fill=WHITE, width=11)
    d.line([(x - 30, y - 34 - lift), (x - 30, y - 6)], fill=WHITE, width=11)
    s = 1 + 0.25 * math.sin(math.pi * min(1, k_open * 3)) if opened else 1
    d.rounded_rectangle((x - 46 * s, y - 26 * s, x + 46 * s, y + 46 * s), 14, fill=col, outline=WHITE, width=5)
    d.ellipse((x - 8, y - 2, x + 8, y + 14), fill=WHITE); d.rectangle((x - 3, y + 8, x + 3, y + 26), fill=WHITE)
    f = I(22); w = d.textlength(label, font=f); d.text((x - w / 2, y + 52), label, font=f, fill=WHITE, stroke_width=3, stroke_fill=(0, 0, 0))
OPEN = [M['c1_5'] + 0.35, M['c2_3'] + 0.35, M['c3_5'] + 0.35]
def locks(c, t):
    for i in range(3): padlock(c, 330 + i * 210, 230, t >= OPEN[i], t - OPEN[i], f'CODE {i + 1}')
def led(c, shown, total, y, letters=None):
    d = ImageDraw.Draw(c); f = A(190); cell = 128; pw = cell * total + 80; x0 = (W - pw) / 2
    d.rounded_rectangle((x0, y, x0 + pw, y + 270), 30, fill=(16, 13, 8, 238), outline=AMBER, width=6)
    glow = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(glow)
    for i in range(total):
        ch = shown[i] if i < len(shown) else (letters[i] if letters else '_')
        col = (255, 215, 120) if i < len(shown) else ((120, 200, 255) if letters else (90, 70, 40))
        cw = d.textlength(ch, font=f); xx = x0 + 40 + i * cell + (cell - cw) / 2
        gd.text((xx, y + 25), ch, font=f, fill=col + (255,)); d.text((xx, y + 25), ch, font=f, fill=col)
    c.alpha_composite(glow.filter(ImageFilter.GaussianBlur(12)))
    d = ImageDraw.Draw(c)
    for i in range(total):
        ch = shown[i] if i < len(shown) else (letters[i] if letters else '_')
        col = (255, 225, 150) if i < len(shown) else ((150, 215, 255) if letters else (90, 70, 40))
        cw = d.textlength(ch, font=f); d.text((x0 + 40 + i * cell + (cell - cw) / 2, y + 25), ch, font=f, fill=col)
def digits_shown(cid, n, t):
    return ''.join(ln['digit'] for ln in LINES if ln['digit'] is not None and (ln['mark'] or '').startswith(cid + '_') and t >= ln['s'])[:n]
def tank(c, cx, cy, s, col=GOLD, a=255):
    lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay); P = lambda pts: [(cx + x * s, cy + y * s) for x, y in pts]
    d.rounded_rectangle((cx - 230 * s, cy + 40 * s, cx + 230 * s, cy + 110 * s), int(35 * s), fill=(20, 20, 16, a), outline=col + (a,), width=max(3, int(8 * s)))
    for i in range(7): d.ellipse((cx + (-195 + i * 65) * s - 22 * s, cy + 52 * s, cx + (-195 + i * 65) * s + 22 * s, cy + 96 * s), outline=col + (a,), width=max(2, int(5 * s)))
    d.polygon(P([(-210, 40), (-170, -10), (180, -10), (215, 40)]), fill=(28, 30, 22, a), outline=col + (a,), width=max(3, int(8 * s)))
    d.polygon(P([(-110, -10), (-80, -70), (90, -70), (120, -10)]), fill=(34, 36, 26, a), outline=col + (a,), width=max(3, int(8 * s)))
    d.rectangle((cx + 110 * s, cy - 52 * s, cx + 330 * s, cy - 34 * s), fill=col + (a,))
    c.alpha_composite(lay)
STOPS = [('1', 'DOWNTOWN', 'War memorial · ask the old man', (250, 640)), ('2', 'LITTLE CUBA', 'His apartment · island photo', (520, 860)),
         ('3', 'SHARKTOOTH ISLAND', 'North shore · CODE 1', (800, 1080)), ('4', 'BIG PINE FOREST', 'Keypad on a tree · CODE 3', (430, 1300))]
def route(c, stage, k):
    """stage 0: overview (all grey, pop in); stage n>0: dot travels from stop n-1 to stop n during k 0..1"""
    d = ImageDraw.Draw(c); pts = [s[3] for s in STOPS]
    text_c(c, 'THE ROUTE', A(110), 380, GOLD)
    for a, b in zip(pts, pts[1:]):
        n = int(math.dist(a, b) / 22)
        for i in range(0, n, 2):
            p = (a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n); q = (a[0] + (b[0] - a[0]) * (i + 1) / n, a[1] + (b[1] - a[1]) * (i + 1) / n)
            d.line([p, q], fill=(255, 255, 255, 110), width=8)
    lit = 0; car = pts[0]
    if stage > 0:
        for i in range(stage - 1): d.line([pts[i], pts[i + 1]], fill=GOLD, width=14)
        a, b = pts[max(stage - 1, 0)], pts[min(stage, 3)]; e = ease(k * 1.4)
        car = (a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e); d.line([a, car], fill=GOLD, width=14); lit = stage - 1 + (1 if e >= 1 else 0)
    for i, (n, name, sub, (x, y)) in enumerate(STOPS):
        if stage == 0 and k < i * 0.18: continue
        on = stage > 0 and i <= lit; col = GOLD if on else (150, 150, 160)
        d.ellipse((x - 42, y - 42, x + 42, y + 42), fill=(15, 15, 20), outline=col, width=8)
        d.text((x - d.textlength(n, font=A(56)) / 2, y - 40), n, font=A(56), fill=col)
        fw = d.textlength(name, font=A(50)); tx = x + 60 if x < 600 else x - 60 - fw
        d.text((tx, y - 58), name, font=A(50), fill=WHITE if on or stage == 0 else (170, 170, 180), stroke_width=6, stroke_fill=(8, 8, 12))
        sw = d.textlength(sub, font=I(25)); sx = x + 60 if x < 600 else x - 60 - sw
        d.text((sx, y + 2), sub, font=I(25), fill=(225, 225, 230))
    if stage > 0: d.ellipse((car[0] - 18, car[1] - 18, car[0] + 18, car[1] + 18), fill=RED, outline=WHITE, width=5)
    tag(c, 'Route order, not to scale · VGC walkthrough', 1365)
    if stage > 0: text_c(c, 'NEXT STOP: ' + STOPS[stage][1], A(58), 1435, WHITE)
def card(c, t, sub, y, k, ang=-4):
    if k <= 0: return
    s = 0.6 + 0.4 * ease(k * 3); lay = Image.new('RGBA', (int(560 * s), int(300 * s))); ld = ImageDraw.Draw(lay)
    ld.rounded_rectangle((0, 0, lay.width - 1, lay.height - 1), 18, fill=(214, 190, 140, 245), outline=(120, 95, 50, 255), width=5)
    ld.text((30 * s, 30 * s), t, font=A(76 * s), fill=(40, 30, 15)); ld.text((30 * s, 140 * s), sub, font=I(30 * s), fill=(70, 55, 30))
    ld.rectangle((lay.width - 250 * s, lay.height - 80 * s, lay.width - 20 * s, lay.height - 25 * s), outline=RED + (230,), width=5)
    ld.text((lay.width - 235 * s, lay.height - 78 * s), 'CLASSIFIED', font=A(40 * s), fill=RED + (230,))
    lay = lay.rotate(ang, expand=True, resample=Image.BICUBIC); c.alpha_composite(lay, (int(W / 2 - lay.width / 2), int(y)))

def step(c, n, title, lt, col=WHITE):
    pill(c, f'STEP {n}', 370, RED, 46, lt + 0.3); pop(c, title, 118, 470, col, lt)
def cards3(c, t):
    for i, (mk, txt) in enumerate([('blueprint', 'BLUEPRINT'), ('tape', 'TAPE RECORDING'), ('island', 'ISLAND PHOTO')]):
        if t >= M[mk]: card(c, txt, 'clue ' + str(i + 1) + ' of 3', 700 + i * 240, t - M[mk], ang=(-4, 3, -2)[i])
def overlay(c, beat, t):
    b = BEATS[beat]; lt = t - b['start']; d = ImageDraw.Draw(c)
    for (s0, s1, st) in ROUTES:                                   # official-map route segments
        if s0 <= t < s1:
            if st == 0:
                if t >= M['bunkers']: pill(c, '2 SECRET BUNKERS', 470, (20, 90, 160), 60, t - M['bunkers'], ang=-2)   # top of the map, clear of the pins
                if t >= M['second']: pill(c, 'THE TANK = BUNKER 2', 590, RED, 56, t - M['second'], ang=3)
            locks(c, t); return
    if beat == 'hook' and t >= HOOK_TANK:                     # after the tank intro: official shootout clip
        k = t - HOOK_TANK
        if k < 0.18: c.alpha_composite(Image.new('RGBA', (W, H), (255, 240, 200, int(235 * (1 - k / 0.18)))))
        pop(c, 'FREE TANK', 210, 420, GOLD, 1)
        if t >= M['stepby']: pill(c, 'STEP BY STEP', 690, (20, 90, 160), 64, t - M['stepby'], ang=-3)
        stamp(c, 'SECRET SIDE QUEST', 1180, 5, RED, 58, k - 0.2)
    elif beat == 'hook':
        c.alpha_composite(hb.lights(t)); FIRE = LINES[0]['e'] + 0.05
        k = ease(0.35 + t / 0.9); x = (W - T_HOOK.width) / 2 - (1 - k) * (W + 200)
        y = 930 + (3 * math.sin(t * 40) if t > 0.6 else 0)
        rec = 26 * math.exp(-(t - FIRE) * 10) if t >= FIRE else 0
        sh = (random.uniform(-14, 14), random.uniform(-10, 10)) if FIRE <= t < FIRE + 0.25 else (0, 0)
        put_tank(c, T_HOOK, x - rec + sh[0], y + sh[1])
        if t < 1.3: dust_cloud(c, x + T_HOOK.width * 0.15, y + T_HOOK.height * 0.9, t + 0.3)
        if t >= FIRE:
            k2 = t - FIRE; mx, my = x + T_HOOK.width * 0.995 - rec, y + T_HOOK.height * 0.43
            lay = Image.new('RGBA', (W, H)); dl = ImageDraw.Draw(lay)
            if k2 < 0.18:
                r = 120 * (1 - k2 / 0.18) + 40; dl.ellipse((mx - r * .4, my - r * .6, mx + r * 1.6, my + r * .6), fill=(255, 230, 150, 240)); dl.ellipse((mx, my - r * .3, mx + r, my + r * .3), fill=(255, 255, 240, 255))
            for j in range(10):
                kk = k2 * (0.6 + j * 0.08); r = 30 + 160 * kk; sx = mx + 60 + 260 * kk * (0.5 + j / 12)
                dl.ellipse((sx - r, my - r - 40 * kk * j / 5, sx + r, my + r - 40 * kk * j / 5), fill=(190, 185, 170, int(150 * max(0, 1 - k2 / 1.8))))
            c.alpha_composite(lay.filter(ImageFilter.GaussianBlur(10)))
        pop(c, 'FREE TANK', 210, 420, GOLD, t + 1.0)
    elif beat == 'step1':
        step(c, 1, 'WAR MEMORIAL', t - M['s1']); pill(c, 'DOWNTOWN VICE CITY', 640, (20, 90, 160), 48, t - M['memorial'])
        if t >= M['ask']: pill(c, 'ASK: "WHAT REALLY HAPPENED?"', 800, (150, 105, 20), 48, t - M['ask'], ang=-2)
        tag(c, 'REPORTED · VGC walkthrough')
    elif beat == 'step2':
        step(c, 2, 'LITTLE CUBA', t - M['s2'], GOLD)
        if M['flags'] <= t < M['blueprint']: pill(c, 'BUILDING WITH CUBAN FLAGS', 640, (20, 90, 160), 48, t - M['flags'])
        cards3(c, t); tag(c, 'REPORTED · VGC walkthrough')
    elif beat == 'code1':
        step(c, 3, 'SHARKTOOTH ISLAND', t - M['s3'])
        if t >= M['door']: pill(c, 'BOAT → NORTH SHORE', 640, (20, 90, 160), 48, t - M['door'])
        if t >= M['c1_0'] - 0.3: led(c, digits_shown('c1', 6, t), 6, 800)
        if t > M['c1_5'] + 0.3: pill(c, 'SCREENSHOT THIS', 1110, (245, 245, 245), 44, t - M['c1_5'] - 0.3, tc=(15, 15, 15))
        tag(c, 'REPORTED · VGC · GameRant')
    elif beat == 'joke':
        pop(c, 'CODE 1', 120, 420, GREEN, 1); led(c, '010317', 6, 600)
        stamp(c, "PRESIDENT'S BIRTHDAY", 930, -5, GOLD, 60, t - M['bday'])
        if lt > 1.6: pill(c, 'NOT EXACTLY TOP SECRET', 1110, (90, 30, 120), 52, lt - 1.6, ang=4)
        tag(c, 'REPORTED · Beebom')
    elif beat == 'alien':
        if t < M['alien']:
            step(c, 4, 'INSIDE BUNKER 1', t - M['s4'])
            if t >= M['power']: pill(c, 'TURN THE POWER ON FIRST', 640, (150, 105, 20), 48, t - M['power'])
        else:
            pul = 0.5 + 0.5 * math.sin((t - M['alien']) * 7); c.alpha_composite(Image.new('RGBA', (W, H), (40, 255, 90, int(40 + 40 * pul))))
            pop(c, 'ALIEN?!', 210, 420, (140, 255, 150), t - M['alien'])
            if t >= M['chiliad']: pill(c, 'MOUNT CHILIAD', 740, (30, 110, 50), 74, t - M['chiliad'], ang=-3)
        tag(c, 'REPORTED · VGC walkthrough')
    elif beat == 'code2':
        pop(c, 'THE SAFE', 150, 420, WHITE, lt); led(c, digits_shown('c2', 4, t), 4, 640)
        if t >= M['pistol']: pill(c, "+ THE PRESIDENT'S PISTOL", 960, (90, 60, 20), 48, t - M['pistol'])
        if t >= M['photo']: card(c, '1 WORD ON THE BACK', '...', 1080, t - M['photo'], ang=5)
        tag(c, 'REPORTED · VGC walkthrough')
    elif beat == 'obsess':
        k = t - M['obsess']; word = 'OBSESS'[:max(0, min(6, int(k / 0.09) + 1))] if k >= 0 else ''
        text_c(c, 'THE LAST CODE IS A WORD', A(74), 430, (200, 200, 205)); text_c(c, word, A(260), 700, (150, 215, 255))
    elif beat == 'code3':
        step(c, 5, 'BIG PINE FOREST', t - M['s5'])
        if M['forest'] <= t < M['morph']: pill(c, 'SMALL HATCH IN THE GROUND', 640, (30, 110, 50), 46, t - M['forest'])
        if M['tree'] <= t < M['morph']: pill(c, 'KEYPAD ON A TREE', 780, (30, 110, 50), 46, t - M['tree'], ang=-2)
        if t >= M['morph']: led(c, digits_shown('c3', 6, t), 6, 700, letters='OBSESS')
        if t >= M['legend']: pill(c, 'O = 0   B = 8   S = 5   E = 3', 1020, (20, 90, 160), 56, t - M['legend'])
        tag(c, 'OBSESS on a calculator screen · VGC')
    elif beat == 'payoff':
        op = M['open']; ok = ease((t - op) / 0.8) if t >= op else 0
        c.alpha_composite(hb.lights(t, 0.5 + 0.7 * ok))
        if t >= op:
            k = t - op; kr = back_out(k / 1.0); x = (W - T_PAY.width) / 2 - (1 - kr) * (W + 300)
            bounce = 10 * math.sin((k - 1.0) * 18) * math.exp(-(k - 1.0) * 5) if k > 1.0 else 0
            y = 1000 - T_PAY.height / 2 + bounce + (2 * math.sin(k * 40) if k < 1.0 else 0)
            put_tank(c, T_PAY, x, y, 0.6); dust_cloud(c, x + T_PAY.width * 0.2, y + T_PAY.height * 0.9, k, 1.2)
        doors(c, ok)
        dh = ImageDraw.Draw(c); fh = I(28); lab = 'WANTED INTEL · GTA 6 SECRETS'; wh = dh.textlength(lab, font=fh)
        dh.rounded_rectangle(((W - wh) / 2 - 24, 70, (W + wh) / 2 + 24, 122), 26, fill=(220, 35, 45, 225)); dh.text(((W - wh) / 2, 78), lab, font=fh, fill=WHITE)
        if t < M['button']:
            step(c, 6, 'INTO BUNKER 2', t - M['s6'])
            if t >= M['flash']: pill(c, 'BRING A FLASHLIGHT', 700, (150, 105, 20), 52, t - M['flash'])
            if t >= M['crawl']: pill(c, 'POWER ON → CRAWL INTO CONTROL ROOM', 860, (20, 90, 160), 40, t - M['crawl'], ang=-2)
        elif t < op:
            k = t - M['button']; r = 150 * (1 - 0.12 * math.sin(math.pi * min(1, max(0, (k - 0.3) / 0.25))))
            d = ImageDraw.Draw(c); d.ellipse((W / 2 - r - 14, 900 - r - 14, W / 2 + r + 14, 900 + r + 14), fill=(40, 40, 40), outline=WHITE, width=6)
            d.ellipse((W / 2 - r, 900 - r, W / 2 + r, 900 + r), fill=RED); text_c(c, 'BIG RED BUTTON', A(84), 420, WHITE)
        else:
            k = t - op
            if k < 0.35: c.alpha_composite(Image.new('RGBA', (W, H), (255, 215, 110, int(220 * (1 - k / 0.35)))))
            pop(c, 'HANGAR OPEN', 150, 420, GOLD, k)
            if t >= M['yours']: pill(c, 'TANK + COLD WAR 556 RIFLE', 1290, (30, 110, 50), 54, t - M['yours'])
    elif beat == 'end':
        c.alpha_composite(hb.lights(t, 0.5))
        if t < M['forever']:
            put_tank(c, T_PAY, (W - T_PAY.width) / 2, 1000 - T_PAY.height / 2, 0.45)
            if t >= M['noreg']: pill(c, "YOU CAN'T REGISTER IT", 470, RED, 64, t - M['noreg'], ang=-2)
            if t >= M['noreg'] + 2.4: pill(c, 'LOST IT? COME BACK', 640, (20, 90, 160), 56, t - M['noreg'] - 2.4, ang=2)
        else:
            k = t - M['forever']; pop(c, 'FREE TANKS FOREVER', 120, 420, GOLD, k)
            put_tank(c, T_END, (W - T_END.width) / 2, 600 - 40 * (1 - ease(k * 2)), 0.4)
            d = ImageDraw.Draw(c); d.rounded_rectangle((90, 980, W - 90, 1370), 30, fill=(10, 10, 10, 225), outline=GOLD, width=6)
            text_c(c, 'ALL 3 CODES', A(64), 1010, GOLD, 6)
            for i, code in enumerate(['010317', '2975', '085355']):
                text_c(c, f'{i + 1}.  {code}', A(84), 1095 + i * 88, (255, 225, 150), 6)
    locks(c, t)

def captions(c, t):
    for ln in LINES:
        if ln['s'] <= t < ln['e'] + (0.12 if ln['digit'] else 0):
            d = ImageDraw.Draw(c)
            if ln['digit'] is not None:
                cid = ln['mark'].split('_')[0]; n = {'c1': 6, 'c2': 4, 'c3': 6}[cid]; txt = ' '.join(digits_shown(cid, n, t)); f = A(96); fill = GOLD
            else:
                words = ln['t'].split(); chunks = [words[i:i + 4] for i in range(0, len(words), 4)]
                tot = sum(len(' '.join(ch)) for ch in chunks); acc = 0; txt = ''
                for ch in chunks:
                    s = ln['s'] + (ln['e'] - ln['s']) * acc / tot; acc += len(' '.join(ch)); e = ln['s'] + (ln['e'] - ln['s']) * acc / tot
                    if s <= t < e: txt = ' '.join(ch).upper()
                if not txt: return
                f = A(74); fill = GOLD if any(ch.isdigit() for ch in txt) or 'OBSESS' in txt else WHITE
            w = d.textlength(txt, font=f)
            if w > W - 80: f = A(f.size * (W - 80) / w); w = d.textlength(txt, font=f)
            d.text(((W - w) / 2, 1560), txt, font=f, fill=fill, stroke_width=8, stroke_fill=(8, 8, 12)); return
def beat_at(t):
    for b in meta['beats']:
        if t < b['end']: return b['beat']
    return meta['beats'][-1]['beat']

ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-i', f'{WD}/mix.wav', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
                       '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
bg = bg_stream(); N = int(DUR * FPS)
for i in range(N):
    t = i / FPS; fr = next(bg)
    c = Image.composite(Image.new('RGB', (W, H), (6, 8, 10)), fr, SH).convert('RGBA')
    d = ImageDraw.Draw(c); f = I(28); lab = 'WANTED INTEL · GTA 6 SECRETS'; w = d.textlength(lab, font=f)
    d.rounded_rectangle(((W - w) / 2 - 24, 70, (W + w) / 2 + 24, 122), 26, fill=(220, 35, 45, 225)); d.text(((W - w) / 2, 78), lab, font=f, fill=WHITE)
    overlay(c, beat_at(t), t)
    captions(c, t)
    if t > DUR - 1.0: c = Image.blend(c.convert('RGB'), Image.new('RGB', (W, H)), min(1, (t - (DUR - 1.0)) / 0.9)).convert('RGBA')
    ff.stdin.write(c.convert('RGB').tobytes())
ff.stdin.close(); ff.wait(); print('done', OUT, N)
