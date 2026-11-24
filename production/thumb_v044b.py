"""Thumbnail 044 final (9:16), styled after the video's opening frame: official Trailer 1 speedboat, "SUNKEN / TREASURE",
green "EASY MONEY" pill, official VI logo. Usage: thumb_v044b.py <framesdir> <out.jpg>"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
D, OUT = sys.argv[1], sys.argv[2]; W, H = 1080, 1920
A = lambda n: ImageFont.truetype('/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf', n)
src = Image.open(f'{D}/sb_23.9.png').convert('RGB'); cx = int(0.565 * src.width)
bg = src.crop((cx - 607, 0, cx + 608, 2160)).resize((W, H), Image.LANCZOS)
bg = ImageEnhance.Contrast(bg).enhance(1.08); bg = ImageEnhance.Color(bg).enhance(1.15)
c = bg.convert('RGBA')
sh = Image.new('L', (W, H)); sd = ImageDraw.Draw(sh)
for y in range(0, 760): sd.line([(0, y), (W, y)], fill=int(120 * (1 - y / 760)))
c = Image.composite(Image.new('RGBA', (W, H), (5, 10, 25, 255)), c, sh); d = ImageDraw.Draw(c)
def word(t, y, size, fill):
    f = A(size); w = d.textlength(t, font=f)
    if w > W - 70: f = A(int(size * (W - 70) / w)); w = d.textlength(t, font=f)
    d.text(((W - w) / 2 + 8, y + 10), t, font=f, fill=(0, 0, 0, 150))
    d.text(((W - w) / 2, y), t, font=f, fill=fill, stroke_width=13, stroke_fill=(10, 8, 25))
word('SUNKEN', 120, 250, (255, 255, 255)); word('TREASURE', 410, 260, (255, 200, 40))
# green EASY MONEY pill, slightly tilted (same as the video's opening)
f = A(130); t = 'EASY MONEY'; tw = d.textlength(t, font=f)
lay = Image.new('RGBA', (int(tw + 110), 230)); ld = ImageDraw.Draw(lay)
ld.rounded_rectangle((8, 8, lay.width - 8, lay.height - 8), 34, fill=(30, 140, 70, 245), outline='white', width=9)
ld.text((55, 20), t, font=f, fill='white')
lay = lay.rotate(-3, expand=True, resample=Image.BICUBIC); c.alpha_composite(lay, ((W - lay.width) // 2, 1400))
vi = Image.open('/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/th43/vi_logo.png').convert('RGBA')
vi = vi.resize((250, int(250 * vi.height / vi.width)), Image.LANCZOS); c.alpha_composite(vi, (W - 290, H - vi.height - 70))
c.convert('RGB').save(OUT, quality=92)
