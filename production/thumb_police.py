"""Police thumbnail: cut-out policewoman on a Vice City sunset street, text '6 STARS. NO ESCAPE.'
Usage: python3 production/thumb_police.py <cutout.png> <out.jpg>"""
import sys, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

random.seed(7)
W, H, HZ = 1080, 1920, 1180
FONT = 'remotion-overlays/public/fonts/Anton-Regular.ttf'

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

c = Image.new('RGB', (W, H)); d = ImageDraw.Draw(c)
stops = [(0, (22, 18, 70)), (0.35, (70, 40, 120)), (0.62, (205, 90, 70)), (0.80, (250, 150, 60)), (0.92, (255, 205, 110)), (1, (255, 225, 150))]
for y in range(HZ):
    t = y / HZ
    for i in range(len(stops) - 1):
        if stops[i][0] <= t <= stops[i + 1][0]:
            col = lerp(stops[i][1], stops[i + 1][1], (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0]))
    d.line([(0, y), (W, y)], fill=col)
c = c.convert('RGBA')
glow = Image.new('RGBA', (W, H)); ImageDraw.Draw(glow).ellipse((W/2-480, HZ-560, W/2+480, HZ+300), fill=(255, 170, 80, 120))
c = Image.alpha_composite(c, glow.filter(ImageFilter.GaussianBlur(90)))
sun = Image.new('RGBA', (W, H)); ImageDraw.Draw(sun).ellipse((W/2-210, HZ-330, W/2+210, HZ+90), fill=(255, 215, 120, 255))
c = Image.alpha_composite(c, sun.filter(ImageFilter.GaussianBlur(6))); d = ImageDraw.Draw(c)

# far skyline with lit windows
x = 0
while x < W:
    w = random.randint(40, 95); h = random.randint(60, 260)
    d.rectangle((x, HZ-h, x+w, HZ), fill=(52, 32, 78))
    for wy in range(HZ-h+14, HZ-10, 22):
        for wx in range(x+8, x+w-8, 16):
            if random.random() < .25: d.rectangle((wx, wy, wx+5, wy+8), fill=(255, 190, 110))
    x += w + random.randint(2, 10)

# street
for y in range(HZ, H):
    d.line([(0, y), (W, y)], fill=lerp((60, 36, 80), (14, 10, 30), ((y-HZ)/(H-HZ))**.7))
ref = Image.new('RGBA', (W, H)); ImageDraw.Draw(ref).ellipse((W/2-200, HZ, W/2+200, HZ+700), fill=(255, 170, 90, 90))
c = Image.alpha_composite(c, ref.filter(ImageFilter.GaussianBlur(50))); d = ImageDraw.Draw(c)

def palm(bx, by, height, lean, scale=1, col=(18, 10, 32)):
    """lean = horizontal pixels the top of the trunk curves over."""
    pts = [(bx + lean * (i/40)**2, by - height * i/40) for i in range(41)]
    for i in range(40):
        d.line([pts[i], pts[i+1]], fill=col, width=int((24 - 12*i/40) * scale))
    tx, ty = pts[-1]
    for ang in range(0, 360, 30):
        a = math.radians(ang + random.randint(-8, 8)); L = random.randint(170, 240) * scale
        side1, side2 = [], []
        for j in range(21):
            t = j / 20
            px = tx + math.cos(a) * L * t
            py = ty + math.sin(a) * L * t * 0.55 + (t*t) * L * 0.55
            nx, ny = -math.sin(a), math.cos(a)
            wd = (1-t) * 22 * scale * math.sin(math.pi * min(1, t*1.4 + 0.1)) + 2
            side1.append((px + nx*wd, py + ny*wd)); side2.append((px - nx*wd, py - ny*wd))
        d.polygon(side1 + side2[::-1], fill=col)
    d.ellipse((tx-20*scale, ty-14*scale, tx+20*scale, ty+18*scale), fill=col)

palm(330, HZ, 430, 30, .55, (40, 22, 60)); palm(760, HZ, 400, -25, .5, (40, 22, 60))
palm(120, HZ+60, 820, 110, 1.0); palm(-20, HZ+160, 1050, 170, 1.15)
palm(960, HZ+60, 860, -120, 1.0); palm(1100, HZ+170, 1080, -180, 1.2)

# police lights glow + car silhouette behind her
Lg = Image.new('RGBA', (W, H)); ld = ImageDraw.Draw(Lg)
ld.ellipse((60, HZ-120, 560, HZ+260), fill=(255, 30, 40, 170)); ld.ellipse((520, HZ-120, 1020, HZ+260), fill=(40, 90, 255, 170))
c = Image.alpha_composite(c, Lg.filter(ImageFilter.GaussianBlur(110)))
lb = Image.new('RGBA', (W, H)); lbd = ImageDraw.Draw(lb)
lbd.rounded_rectangle((360, HZ-50, 560, HZ-6), 12, fill=(255, 60, 60, 230)); lbd.rounded_rectangle((520, HZ-50, 720, HZ-6), 12, fill=(80, 130, 255, 230))
d = ImageDraw.Draw(c)
d.polygon([(330, HZ+20), (420, HZ-40), (660, HZ-40), (750, HZ+20)], fill=(24, 16, 40))
d.rounded_rectangle((250, HZ+10, 830, HZ+220), 40, fill=(24, 16, 40))
c = Image.alpha_composite(c, lb.filter(ImageFilter.GaussianBlur(20))); d = ImageDraw.Draw(c)
d.rounded_rectangle((400, HZ-40, 540, HZ-18), 8, fill=(255, 90, 90)); d.rounded_rectangle((540, HZ-40, 680, HZ-18), 8, fill=(110, 150, 255))

# subject
cut = Image.open(sys.argv[1])
s = 1650 / cut.height; cut = cut.resize((int(cut.width*s), 1650), Image.LANCZOS)
sh = Image.new('RGBA', cut.size); sh.putalpha(cut.split()[3].filter(ImageFilter.GaussianBlur(25)).point(lambda v: int(v*.55)))
px, py = (W - cut.width)//2 + 70, 210
c.alpha_composite(sh, (px+18, py+10)); c.alpha_composite(cut, (px, py))

# bottom band + text
g = Image.new('L', (W, H)); gd = ImageDraw.Draw(g)
for y in range(1150, H): gd.line([(0, y), (W, y)], fill=int(235 * min(1, (y-1150)/420)))
c = Image.composite(Image.new('RGBA', (W, H), (8, 6, 24, 255)), c, g)
F = lambda n: ImageFont.truetype(FONT, n)
lines = [("6 STARS.", 165, (255, 255, 255), (70, 130, 255)), ("NO ESCAPE.", 165, (255, 55, 55), (255, 30, 30))]
y = 1360; pos = []; dd = ImageDraw.Draw(c)
for t, n, col, gl in lines:
    bb = dd.textbbox((0, 0), t, font=F(n), stroke_width=8); pos.append((60, y-bb[1], t, n, col, gl)); y += bb[3]-bb[1]+18
gl_ = Image.new('RGBA', (W, H)); gdd = ImageDraw.Draw(gl_)
for x, yy, t, n, col, gl in pos: gdd.text((x, yy), t, font=F(n), fill=gl + (190,))
c = Image.alpha_composite(c, gl_.filter(ImageFilter.GaussianBlur(24))); d = ImageDraw.Draw(c)
for x, yy, t, n, col, gl in pos: d.text((x, yy), t, font=F(n), fill=col, stroke_width=8, stroke_fill=(10, 10, 25))
def star(cx, cy, r, fill):
    p = [(cx + (r if i % 2 == 0 else r*.45) * math.sin(i*math.pi/5), cy - (r if i % 2 == 0 else r*.45) * math.cos(i*math.pi/5)) for i in range(10)]
    d.polygon(p, fill=fill, outline=(10, 10, 25), width=6)
for i in range(6): star(115 + i*110, y + 70, 52, (255, 40, 40) if i == 5 else (255, 255, 255))
c.convert('RGB').save(sys.argv[2], quality=93)
