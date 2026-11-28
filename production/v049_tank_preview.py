"""Preview of the new tank's motion graphics for Short 049 (approval clip, ~10 s):
A) hook: tank drives in over the official shootout clip, idles, fires (recoil, muzzle flash, smoke, screen shake)
B) hangar: doors slide open, light rays, tank rolls in with dust, stops with a bounce, gold flash
C) end card: tank above the 3-codes card. Synth engine rumble + boom + impact.
Usage: python3 v049_tank_preview.py <workdir with seg_hook_0.mp4 + tank.png> <out.mp4>"""
import sys, math, random, subprocess, numpy as np, soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
WD, OUT = sys.argv[1], sys.argv[2]; W, H, FPS = 1080, 1920, 30
A = lambda n: ImageFont.truetype('/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf', int(n))
GOLD, WHITE = (255, 196, 40), (255, 255, 255); random.seed(3)
TANK = Image.open(f'{WD}/tank.png').convert('RGBA')
def tank_at(w): return TANK.resize((int(w), int(w * TANK.height / TANK.width)), Image.LANCZOS)
TA = tank_at(980); TB = tank_at(1040); TC = tank_at(760)
ease = lambda x: 1 - (1 - min(max(x, 0), 1)) ** 3
def back_out(x): x = min(max(x, 0), 1); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def text_c(c, t, size, y, fill):
    d = ImageDraw.Draw(c); f = A(size); w = d.textlength(t, font=f); d.text(((W - w) / 2, y), t, font=f, fill=fill, stroke_width=10, stroke_fill=(8, 8, 12))
def pill(c, t, y, col, size):
    d = ImageDraw.Draw(c); f = A(size); w = d.textlength(t, font=f)
    d.rounded_rectangle(((W - w) / 2 - 36, y, (W + w) / 2 + 36, y + size * 1.45), 24, fill=col + (240,), outline=WHITE, width=6); d.text(((W - w) / 2, y + size * 0.12), t, font=f, fill=WHITE)
dust = [dict(x=random.uniform(-0.5, 0.5), vy=random.uniform(-60, -10), vx=random.uniform(-140, -40), r=random.uniform(14, 40), t0=random.uniform(0, 0.8)) for _ in range(40)]
def dust_cloud(c, cx, cy, t, strength=1.0):
    lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
    for p in dust:
        k = t - p['t0']
        if 0 < k < 1.2:
            x = cx + p['x'] * 400 + p['vx'] * k; y = cy + p['vy'] * k; r = p['r'] * (1 + k); a = int(110 * strength * (1 - k / 1.2))
            d.ellipse((x - r, y - r, x + r, y + r), fill=(150, 135, 105, a))
    c.alpha_composite(lay.filter(ImageFilter.GaussianBlur(6)))
# backgrounds
clip = []
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f'{WD}/seg_hook_0.mp4', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
while len(clip) < 130:
    b = p.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    clip.append(Image.frombuffer('RGB', (W, H), b).copy())
p.stdout.close(); p.wait()
DARK = Image.new('RGB', (W, H), (14, 16, 12))
SH = Image.new('L', (W, H)); d0 = ImageDraw.Draw(SH)
for y in range(H): d0.line([(0, y), (W, y)], fill=int(170 * (1 - y / 600)) if y < 600 else int(200 * min(1, max(0, (y - 1300) / 420))))
TA_T, TB_T, TC_T = 4.0, 4.3, 1.8; DUR = TA_T + TB_T + TC_T
FIRE = 2.0; STOP_B = 1.9
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', f'{WD}/preview_sfx.wav',
                       '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
# --- sfx track (engine rumble, cannon boom, hangar impact) ---
SR = 24000; N = int(DUR * SR) + SR; a = np.zeros(N); tt = np.arange(N) / SR; rng = np.random.default_rng(2)
rum = np.convolve(rng.standard_normal(N), np.ones(300) / 300, 'same'); rum = rum / np.abs(rum).max()
eng = (0.5 * np.sin(2 * np.pi * 42 * tt) * (1 + 0.3 * np.sin(2 * np.pi * 9 * tt)) + 0.6 * rum)
env = np.zeros(N); env[: int(TA_T * SR)] = 0.35; s = int((TA_T + 0.6) * SR); env[s: s + int(2.4 * SR)] = np.linspace(0.5, 0.25, int(2.4 * SR)); a += eng * env
def boom(at, g):
    i = int(at * SR); n = int(1.6 * SR); x = np.arange(n) / SR; w = np.convolve(rng.standard_normal(n), np.ones(40) / 40, 'same')
    a[i:i + n] += g * (np.sin(2 * np.pi * (34 + 90 * np.exp(-x / 0.04)) * x) * np.exp(-x / 0.45) + 0.6 * w / np.abs(w).max() * np.exp(-x / 0.18))
boom(FIRE, 0.9); boom(TA_T + STOP_B, 0.7)
a[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR)); a = a / np.abs(a).max() * 0.9; sf.write(f'{WD}/preview_sfx.wav', a.astype(np.float32), SR)
for i in range(int(DUR * FPS)):
    t = i / FPS
    if t < TA_T:                                     # ---- A: hook over the shootout clip ----
        fr = clip[min(i, len(clip) - 1)]; shake = (random.uniform(-14, 14), random.uniform(-10, 10)) if FIRE <= t < FIRE + 0.25 else (0, 0)
        c = Image.composite(Image.new('RGB', (W, H), (6, 8, 10)), fr, SH).convert('RGBA')
        k = ease(t / 0.8); x = -TA.width + (W / 2 + TA.width / 2) * k - TA.width / 2 + W / 2 - W / 2
        x = (W - TA.width) / 2 - (1 - k) * (W + 200); y = 930 + 3 * math.sin(t * 40) * (1 if t > 0.8 else 0)
        rec = 26 * math.exp(-(t - FIRE) * 10) if t >= FIRE else 0
        glow = Image.new('RGBA', (W, H)); glow.alpha_composite(TA, (int(x - rec + shake[0]), int(y + shake[1])))
        c.alpha_composite(Image.merge('RGBA', (*[Image.new('L', (W, H), v) for v in (255, 196, 60)], glow.getchannel('A').filter(ImageFilter.GaussianBlur(22)).point(lambda v: int(v * .55)))))
        c.alpha_composite(glow)
        if t < 1.2: dust_cloud(c, x + TA.width * 0.15, y + TA.height * 0.9, t)
        if t >= FIRE:                                # muzzle flash + smoke
            k2 = t - FIRE; mx, my = x + TA.width * 0.995 - rec, y + TA.height * 0.43
            lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
            if k2 < 0.18:
                r = 120 * (1 - k2 / 0.18) + 40; d.ellipse((mx - r * .4, my - r * .6, mx + r * 1.6, my + r * .6), fill=(255, 230, 150, 240)); d.ellipse((mx, my - r * .3, mx + r, my + r * .3), fill=(255, 255, 240, 255))
            for j in range(10):
                kk = k2 * (0.6 + j * 0.08); r = 30 + 160 * kk; sx = mx + 60 + 260 * kk * (0.5 + j / 12); a_ = int(150 * max(0, 1 - k2 / 1.8))
                d.ellipse((sx - r, my - r - 40 * kk * j / 5, sx + r, my + r - 40 * kk * j / 5), fill=(190, 185, 170, a_))
            c.alpha_composite(lay.filter(ImageFilter.GaussianBlur(10)))
        sc = 1.25 - 0.25 * ease(t * 3); f = A(210 * sc); dd = ImageDraw.Draw(c); w_ = dd.textlength('FREE TANK', font=f)
        dd.text(((W - w_) / 2, 420 - 30 * (sc - 1)), 'FREE TANK', font=f, fill=GOLD, stroke_width=10, stroke_fill=(8, 8, 12))
        if t > 2.3: pill(c, 'CODE 3 = ???', 690, (220, 35, 45), 66)
    elif t < TA_T + TB_T:                            # ---- B: hangar reveal ----
        t2 = t - TA_T; c = DARK.copy().convert('RGBA'); d = ImageDraw.Draw(c)
        open_k = ease((t2 - 0.3) / 0.9)
        rays = Image.new('RGBA', (W, H)); rd = ImageDraw.Draw(rays)
        for j in range(14):
            an = j * math.pi / 7 + t2 * 0.35; rd.polygon([(W / 2, 960), (W / 2 + 1500 * math.cos(an - .08), 960 + 1500 * math.sin(an - .08)), (W / 2 + 1500 * math.cos(an + .08), 960 + 1500 * math.sin(an + .08))], fill=(255, 200, 80, int(70 * open_k)))
        c.alpha_composite(rays.filter(ImageFilter.GaussianBlur(8)))
        k = back_out((t2 - 0.9) / 1.0) if t2 > 0.9 else 0; x = (W - TB.width) / 2 - (1 - k) * (W + 300)
        bounce = 10 * math.sin((t2 - STOP_B) * 18) * math.exp(-(t2 - STOP_B) * 5) if t2 > STOP_B else 0
        y = 960 - TB.height / 2 + bounce + (2 * math.sin(t2 * 40) if 0.9 < t2 < STOP_B else 0)
        if t2 > 0.9:
            glow = Image.new('RGBA', (W, H)); glow.alpha_composite(TB, (int(x), int(y)))
            c.alpha_composite(Image.merge('RGBA', (*[Image.new('L', (W, H), v) for v in (255, 196, 60)], glow.getchannel('A').filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * .6)))))
            c.alpha_composite(glow); dust_cloud(c, x + TB.width * 0.2, y + TB.height * 0.9, t2 - 0.9, 1.2)
        for side in (0, 1):                          # hangar doors sliding apart
            off = open_k * (W / 2 + 20); x0 = (-off if side == 0 else W / 2 + off)
            d = ImageDraw.Draw(c); d.rectangle((x0, 0, x0 + W / 2, H), fill=(52, 56, 46))
            for yy in range(0, H, 70): d.line([(x0, yy), (x0 + W / 2, yy)], fill=(38, 41, 33), width=6)
            d.rectangle((x0 + (W / 2 - 40 if side == 0 else 0), 0, x0 + (W / 2 if side == 0 else 40), H), fill=(255, 196, 40))
            for yy in range(0, H, 80): d.polygon([(x0 + (W / 2 - 40 if side == 0 else 0), yy), (x0 + (W / 2 if side == 0 else 40), yy + 40), (x0 + (W / 2 if side == 0 else 40), yy + 80), (x0 + (W / 2 - 40 if side == 0 else 0), yy + 40)], fill=(20, 20, 20))
        if STOP_B <= t2 < STOP_B + 0.35: c.alpha_composite(Image.new('RGBA', (W, H), (255, 215, 110, int(220 * (1 - (t2 - STOP_B) / 0.35)))))
        if t2 > STOP_B: text_c(c, 'HANGAR OPEN', 150, 400, GOLD)
        if t2 > STOP_B + 0.5: pill(c, 'TANK + COLD WAR 556 RIFLE', 1240, (30, 110, 50), 54)
    else:                                            # ---- C: end card ----
        t3 = t - TA_T - TB_T; c = DARK.copy().convert('RGBA'); d = ImageDraw.Draw(c)
        text_c(c, 'FREE TANKS FOREVER', 120, 330, GOLD)
        k = ease(t3 / 0.5); c.alpha_composite(TC, (int((W - TC.width) / 2), int(560 - 40 * (1 - k))))
        d = ImageDraw.Draw(c); d.rounded_rectangle((90, 980, W - 90, 1370), 30, fill=(10, 10, 10, 230), outline=GOLD, width=6)
        text_c(c, 'ALL 3 CODES', 64, 1010, GOLD)
        for j, code in enumerate(['010317', '2975', '085355']): text_c(c, f'{j + 1}.  {code}', 84, 1095 + j * 88, (255, 225, 150))
        if t3 > TC_T - 0.6: c = Image.blend(c.convert('RGB'), Image.new('RGB', (W, H)), (t3 - (TC_T - 0.6)) / 0.6).convert('RGBA')
    ff.stdin.write(c.convert('RGB').tobytes())
ff.stdin.close(); ff.wait(); print('done', OUT)
