"""Military hangar background for the tank scenes in Short 049 (our own design, no game footage).
base(): static 1080x1920 scene: corrugated steel back wall with stencils, hazard-striped door frame, concrete floor
with perspective expansion joints, spotlight pool, vignette.
lights(t): animated overlay: three overhead floodlights with volumetric beams (slow sway + flicker), drifting haze.
reflection(tank_rgba, x, y): faint mirrored tank on the polished floor."""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont
W, H = 1080, 1920; FLOOR_Y = 1160; VP = (540, 900)
ANTON = '/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
def base():
    c = Image.new('RGB', (W, H), (18, 20, 17)); d = ImageDraw.Draw(c)
    for y in range(FLOOR_Y):                                         # back wall: vertical gradient
        k = y / FLOOR_Y; d.line([(0, y), (W, y)], fill=(int(30 + 22 * k), int(34 + 22 * k), int(28 + 16 * k)))
    for x in range(0, W, 36):                                        # corrugated ribs
        d.line([(x, 0), (x, FLOOR_Y)], fill=(58, 62, 52), width=4); d.line([(x + 5, 0), (x + 5, FLOOR_Y)], fill=(22, 24, 20), width=3)
    for y in (300, 640, 980): d.rectangle((0, y, W, y + 14), fill=(40, 43, 36))   # horizontal girders
    d.rectangle((0, 300, W, 304), fill=(90, 92, 78))
    # big hangar door frame with hazard stripes
    fx0, fx1, fy0 = 150, 930, 420
    for side in ((fx0 - 40, fy0, fx0, FLOOR_Y), (fx1, fy0, fx1 + 40, FLOOR_Y), (fx0 - 40, fy0 - 40, fx1 + 40, fy0)):
        d.rectangle(side, fill=(230, 180, 40))
    stripe = Image.new('RGB', (W, H)); sd = ImageDraw.Draw(stripe)
    for k in range(-H, W + H, 56): sd.polygon([(k, 0), (k + 28, 0), (k + 28 + H, H), (k + H, H)], fill=(20, 20, 18))
    m = Image.new('L', (W, H)); md = ImageDraw.Draw(m)
    for side in ((fx0 - 40, fy0, fx0, FLOOR_Y), (fx1, fy0, fx1 + 40, FLOOR_Y), (fx0 - 40, fy0 - 40, fx1 + 40, fy0)): md.rectangle(side, fill=255)
    c = Image.composite(stripe, c, m); d = ImageDraw.Draw(c)
    d.rectangle((fx0, fy0, fx1, FLOOR_Y), fill=(12, 13, 11))                        # dark opening behind the tank
    f = ImageFont.truetype(ANTON, 40); t = 'HANGAR 02  ·  RESTRICTED AREA'; w = d.textlength(t, font=f)
    d.text(((W - w) / 2, 328), t, font=f, fill=(190, 160, 60))        # stencil sits under the padlock bar
    # concrete floor with perspective joints
    for y in range(FLOOR_Y, H):
        k = (y - FLOOR_Y) / (H - FLOOR_Y); d.line([(0, y), (W, y)], fill=(int(54 - 26 * k), int(56 - 26 * k), int(52 - 24 * k)))
    for i in range(-8, 9):
        x_far = VP[0] + i * 70; x_near = VP[0] + i * 330
        d.line([(x_far, FLOOR_Y), (x_near, H)], fill=(36, 38, 34), width=3)
    yy = FLOOR_Y
    for j in range(1, 9): yy += 18 * j; d.line([(0, yy), (W, yy)], fill=(36, 38, 34), width=3)
    d.rectangle((0, FLOOR_Y - 6, W, FLOOR_Y + 6), fill=(230, 180, 40))                # floor edge hazard line
    for k in range(0, W, 60): d.polygon([(k, FLOOR_Y - 6), (k + 30, FLOOR_Y - 6), (k + 42, FLOOR_Y + 6), (k + 12, FLOOR_Y + 6)], fill=(20, 20, 18))
    # spotlight pool on the floor
    pool = Image.new('L', (W, H)); pd = ImageDraw.Draw(pool); pd.ellipse((90, 1200, 990, 1560), fill=150)
    pool = pool.filter(ImageFilter.GaussianBlur(70)); c = Image.composite(Image.new('RGB', (W, H), (150, 140, 110)), c, pool)
    # vignette
    v = Image.new('L', (W, H)); vd = ImageDraw.Draw(v); vd.ellipse((-300, -200, W + 300, H + 200), fill=255)
    v = v.filter(ImageFilter.GaussianBlur(220)); c = Image.composite(c, Image.new('RGB', (W, H), (4, 5, 4)), v)
    return c
random.seed(5)
HAZE = [dict(x=random.uniform(0, W), y=random.uniform(500, 1500), r=random.uniform(80, 220), v=random.uniform(8, 25), a=random.uniform(10, 26)) for _ in range(18)]
LAMPS = [(200, 40), (540, 20), (880, 40)]
def lights(t, strength=1.0):
    lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
    for i, (lx, ly) in enumerate(LAMPS):
        sway = 40 * math.sin(t * 0.8 + i * 1.7); flick = 0.9 + 0.1 * math.sin(t * 23 + i * 5) * (1 if random.random() > 0.02 else -3)
        a = int(46 * strength * flick); tx = lx + sway
        d.polygon([(lx - 26, ly + 30), (lx + 26, ly + 30), (tx + 260, 1500), (tx - 260, 1500)], fill=(255, 225, 160, max(0, a)))
    lay = lay.filter(ImageFilter.GaussianBlur(26)); d = ImageDraw.Draw(lay)
    for lx, ly in LAMPS:
        d.rounded_rectangle((lx - 60, ly, lx + 60, ly + 34), 10, fill=(40, 42, 38, 255))
        d.rectangle((lx - 48, ly + 26, lx + 48, ly + 36), fill=(255, 240, 200, 255))
    hz = Image.new('RGBA', (W, H)); hd = ImageDraw.Draw(hz)
    for p in HAZE:
        x = (p['x'] + p['v'] * t) % (W + 400) - 200; hd.ellipse((x - p['r'], p['y'] - p['r'] * .5, x + p['r'], p['y'] + p['r'] * .5), fill=(200, 195, 180, int(p['a'] * strength)))
    lay.alpha_composite(hz.filter(ImageFilter.GaussianBlur(40)))
    glow = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(glow)
    for lx, ly in LAMPS: gd.ellipse((lx - 90, ly - 40, lx + 90, ly + 90), fill=(255, 230, 170, int(120 * strength)))
    lay.alpha_composite(glow.filter(ImageFilter.GaussianBlur(30)))
    return lay
def reflection(tank, x, y, floor=FLOOR_Y):
    r = tank.transpose(Image.FLIP_TOP_BOTTOM); a = r.getchannel('A')
    fade = Image.linear_gradient('L').resize(r.size).point(lambda v: int((255 - v) * 0.22))
    from PIL import ImageChops
    r.putalpha(ImageChops.multiply(a, fade)); lay = Image.new('RGBA', (W, H)); lay.alpha_composite(r.filter(ImageFilter.GaussianBlur(3)), (int(x), int(y + tank.height - 8)))
    return lay
