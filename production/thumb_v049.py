"""Thumbnail 049 (9:16): official Extended Look shootout frame (police SUV under fire, HUD crosshair removed), gold tank silhouette,
'FREE TANK', amber LED '010317', official VI logo. Usage: thumb_v049.py <frame.png> <out.jpg>"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]; W, H = 1080, 1920
A = lambda n: ImageFont.truetype('/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf', int(n))
GOLD, AMBER = (255, 196, 40), (255, 170, 30)
im = Image.open(SRC).convert('RGB'); cx = int(0.47 * im.width); w = int(im.height * 9 / 16)
bg = im.crop((cx - w // 2, 0, cx + w // 2, im.height)).resize((W, H), Image.LANCZOS)
bg = ImageEnhance.Contrast(bg).enhance(1.1); bg = ImageEnhance.Color(bg).enhance(1.15)
c = bg.convert('RGBA'); sh = Image.new('L', (W, H)); sd = ImageDraw.Draw(sh)
for y in range(H): sd.line([(0, y), (W, y)], fill=int(170 * (1 - y / 700)) if y < 700 else int(190 * min(1, max(0, (y - 1250) / 500))))
c = Image.composite(Image.new('RGBA', (W, H), (6, 8, 10, 255)), c, sh); d = ImageDraw.Draw(c)
def word(t, y, size, fill):
    f = A(size); w = d.textlength(t, font=f)
    if w > W - 60: f = A(size * (W - 60) / w); w = d.textlength(t, font=f)
    d.text(((W - w) / 2 + 8, y + 10), t, font=f, fill=(0, 0, 0, 150)); d.text(((W - w) / 2, y), t, font=f, fill=fill, stroke_width=13, stroke_fill=(8, 8, 12))
word('FREE', 70, 290, (255, 255, 255)); word('TANK', 360, 330, GOLD)
# gold tank silhouette with glow
lay = Image.new('RGBA', (W, H)); ld = ImageDraw.Draw(lay); cx, cy, s = W / 2, 1060, 1.6
P = lambda pts: [(cx + x * s, cy + y * s) for x, y in pts]
ld.rounded_rectangle((cx - 230 * s, cy + 40 * s, cx + 230 * s, cy + 110 * s), int(35 * s), fill=(20, 20, 16, 235), outline=GOLD, width=12)
for i in range(7): ld.ellipse((cx + (-195 + i * 65) * s - 22 * s, cy + 52 * s, cx + (-195 + i * 65) * s + 22 * s, cy + 96 * s), outline=GOLD, width=7)
ld.polygon(P([(-210, 40), (-170, -10), (180, -10), (215, 40)]), fill=(28, 30, 22, 235), outline=GOLD, width=12)
ld.polygon(P([(-110, -10), (-80, -70), (90, -70), (120, -10)]), fill=(34, 36, 26, 235), outline=GOLD, width=12)
ld.rectangle((cx + 110 * s, cy - 52 * s, cx + 330 * s, cy - 34 * s), fill=GOLD)
glow = lay.filter(ImageFilter.GaussianBlur(18)); c.alpha_composite(glow); c.alpha_composite(lay); d = ImageDraw.Draw(c)
# amber LED code panel
f = A(170); code = '010317'; pw = d.textlength(code, font=f) + 110; x0 = (W - pw) / 2; y0 = 1380
d.rounded_rectangle((x0, y0, x0 + pw, y0 + 250), 30, fill=(16, 13, 8, 240), outline=AMBER, width=7)
g = Image.new('RGBA', (W, H)); ImageDraw.Draw(g).text((x0 + 55, y0 + 22), code, font=f, fill=AMBER + (255,)); c.alpha_composite(g.filter(ImageFilter.GaussianBlur(12)))
d = ImageDraw.Draw(c); d.text((x0 + 55, y0 + 22), code, font=f, fill=(255, 225, 150))
vi = Image.open('/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/th43/vi_logo.png').convert('RGBA')
vi = vi.resize((210, int(210 * vi.height / vi.width)), Image.LANCZOS); c.alpha_composite(vi, (W - 250, H - vi.height - 50))
c.convert('RGB').save(OUT, quality=92)
