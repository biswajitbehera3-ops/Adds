"""Police thumbnail v4: cut-out policewoman on the user's neon street (VI logo inpainted out),
thin white outline title 'KAI CENAT / SURVIVES?' (VI-logo style) + '6 STARS. NO ESCAPE.' with stars.
Usage: python3 production/thumb_police_v4.py <bg_novi.png> <cop_cut.png> <out.jpg>"""
import sys, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageChops

W, H = 1080, 1920
ANTON = 'remotion-overlays/public/fonts/Anton-Regular.ttf'
INTER = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
bg_path, cut_path, out = sys.argv[1:4]

bg = Image.open(bg_path).convert('RGB').crop((0, 40, 735, 690))
s = max(W / bg.width, H / bg.height); bg = bg.resize((int(bg.width*s)+1, int(bg.height*s)+1), Image.LANCZOS)
x0 = (bg.width - W)//2; bg = bg.crop((x0, 0, x0+W, H)).filter(ImageFilter.GaussianBlur(2.6))
c = ImageEnhance.Brightness(bg).enhance(0.80).convert('RGBA')

# thin outline title (letters stay hollow, like the VI logo)
FB = ImageFont.truetype(INTER, 150)
def outline_mask(lines, top, gap=26, track=14, sw=4):
    m_out, m_in = Image.new('L', (W, H)), Image.new('L', (W, H))
    do, di = ImageDraw.Draw(m_out), ImageDraw.Draw(m_in); y = top
    for t in lines:
        ws = [do.textlength(ch, font=FB) for ch in t]; x = (W - (sum(ws) + track*(len(t)-1)))/2
        for ch, w in zip(t, ws):
            do.text((x, y), ch, font=FB, fill=255, stroke_width=sw, stroke_fill=255)
            di.text((x, y), ch, font=FB, fill=255, stroke_width=0)
            x += w + track
        y += FB.size + gap
    return ImageChops.subtract(m_out, m_in), m_in
ol, inner = outline_mask(["KAI CENAT", "SURVIVES?"], 80)
# darken the letter insides slightly so the hollow outline reads on the busy sky
shade = Image.new('RGBA', (W, H), (10, 6, 30, 0)); shade.putalpha(inner.point(lambda v: int(v*.35)))
c = Image.alpha_composite(c, shade)
glow = Image.new('RGBA', (W, H), (255, 255, 255, 0)); glow.putalpha(ol.filter(ImageFilter.GaussianBlur(9)).point(lambda v: min(255, int(v*1.4))))
c = Image.alpha_composite(c, glow)
line = Image.new('RGBA', (W, H), (255, 255, 255, 0)); line.putalpha(ol); c = Image.alpha_composite(c, line)

# subject in front of the title
cut = Image.open(cut_path); sc = 1600/cut.height; cut = cut.resize((int(cut.width*sc), 1600), Image.LANCZOS)
px, py = (W - cut.width)//2 + 70, 300; a = cut.split()[3]
rim = Image.new('RGBA', cut.size, (255, 80, 180, 0)); rim.putalpha(a.filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v*.45)))
sh = Image.new('RGBA', cut.size); sh.putalpha(a.filter(ImageFilter.GaussianBlur(28)).point(lambda v: int(v*.6)))
c.alpha_composite(rim, (px-10, py)); c.alpha_composite(sh, (px+18, py+12)); c.alpha_composite(cut, (px, py))

# bottom band + main text + stars
g = Image.new('L', (W, H)); gd = ImageDraw.Draw(g)
for y in range(1150, H): gd.line([(0, y), (W, y)], fill=int(235*min(1, (y-1150)/430)))
c = Image.composite(Image.new('RGBA', (W, H), (8, 6, 24, 255)), c, g)
F = lambda n: ImageFont.truetype(ANTON, n)
lines = [("6 STARS.", 165, (255, 255, 255), (70, 130, 255)), ("NO ESCAPE.", 165, (255, 55, 55), (255, 30, 30))]
y = 1440; pos = []; dd = ImageDraw.Draw(c)
for t, n, col, gl in lines:
    bb = dd.textbbox((0, 0), t, font=F(n), stroke_width=8); pos.append((60, y-bb[1], t, n, col, gl)); y += bb[3]-bb[1]+18
gl_ = Image.new('RGBA', (W, H)); gdd = ImageDraw.Draw(gl_)
for x, yy, t, n, col, gl in pos: gdd.text((x, yy), t, font=F(n), fill=gl+(190,))
c = Image.alpha_composite(c, gl_.filter(ImageFilter.GaussianBlur(24))); d = ImageDraw.Draw(c)
for x, yy, t, n, col, gl in pos: d.text((x, yy), t, font=F(n), fill=col, stroke_width=8, stroke_fill=(10, 10, 25))
top = pos[0][1] + dd.textbbox((0, 0), "6 STARS.", font=F(165))[1]
def sp(cx, cy, r): return [(cx + (r if i % 2 == 0 else r*.45)*math.sin(i*math.pi/5), cy - (r if i % 2 == 0 else r*.45)*math.cos(i*math.pi/5)) for i in range(10)]
cen = [(120 + i*112, top-8) for i in range(6)]
sg = Image.new('RGBA', (W, H)); sgd = ImageDraw.Draw(sg)
for i, (cx, cy) in enumerate(cen): sgd.polygon(sp(cx, cy, 66), fill=(255, 40, 40, 230) if i == 5 else (255, 230, 150, 170))
c = Image.alpha_composite(c, sg.filter(ImageFilter.GaussianBlur(16))); d = ImageDraw.Draw(c)
for i, (cx, cy) in enumerate(cen): d.polygon(sp(cx, cy, 56), fill=(255, 40, 40) if i == 5 else (255, 255, 255), outline=(10, 10, 25), width=7)
c.convert('RGB').save(out, quality=93)
