"""Thumbnail 044 (9:16): official Extended Look dock-dive frame, red-ringed round zoom inset of the official underwater
shot, red arrow, 2 huge words, official VI logo. Usage: thumb_v044.py <framesdir> <out.jpg>"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
D, OUT = sys.argv[1], sys.argv[2]; W, H = 1080, 1920
A = lambda n: ImageFont.truetype('/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf', n)
bg = Image.open(f'{D}/el_1044.2.png').convert('RGB').crop((1123, 0, 2338, 2160)).resize((W, H), Image.LANCZOS)
bg = ImageEnhance.Contrast(bg).enhance(1.08); bg = ImageEnhance.Color(bg).enhance(1.2)
c = bg.convert('RGBA')
sh = Image.new('L', (W, H)); sd = ImageDraw.Draw(sh)
for y in range(1250, H): sd.line([(0, y), (W, y)], fill=int(170 * min(1, (y - 1250) / 450)))
c = Image.composite(Image.new('RGBA', (W, H), (5, 10, 25, 255)), c, sh); d = ImageDraw.Draw(c)
def word(t, y, size, fill):
    f = A(size); w = d.textlength(t, font=f)
    if w > W - 60: f = A(int(size * (W - 60) / w)); w = d.textlength(t, font=f)
    d.text(((W - w) / 2 + 8, y + 10), t, font=f, fill=(0, 0, 0, 160))
    d.text(((W - w) / 2, y), t, font=f, fill=fill, stroke_width=12, stroke_fill=(10, 8, 25))
word('SUNKEN', 1420, 190, (255, 255, 255)); word('GOLD', 1600, 240, (255, 200, 40))
# round zoom inset: what's under the water (official Extended Look underwater shot), red ring + arrow from the diver
k = Image.open(f'{D}/el_1038.2.png').convert('RGB').crop((1250, 350, 2750, 1850)); k = ImageEnhance.Brightness(k).enhance(1.3)
R = 190; k = k.resize((2 * R, 2 * R), Image.LANCZOS)
m = Image.new('L', (2 * R, 2 * R)); ImageDraw.Draw(m).ellipse((0, 0, 2 * R, 2 * R), fill=255)
ix, iy = 830, 880
d.ellipse((ix - R - 18, iy - R - 18, ix + R + 18, iy + R + 18), fill=(235, 30, 45))
c.paste(k, (ix - R, iy - R), m); d = ImageDraw.Draw(c)
d.line([(520, 1140), (612, 990)], fill=(235, 30, 45), width=24); d.polygon([(580, 990), (650, 930), (650, 1030)], fill=(235, 30, 45))
f = A(54); t = 'KEY LENTO'; w = d.textlength(t, font=f)
d.rounded_rectangle((ix - w / 2 - 22, iy - R - 60, ix + w / 2 + 22, iy - R + 16), 20, fill=(235, 30, 45)); d.text((ix - w / 2, iy - R - 56), t, font=f, fill='white')
# official VI logo
vi = Image.open('/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/th43/vi_logo.png').convert('RGBA')
vi = vi.resize((260, int(260 * vi.height / vi.width)), Image.LANCZOS); c.alpha_composite(vi, (40, 50))
c.convert('RGB').save(OUT, quality=92)
