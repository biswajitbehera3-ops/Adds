"""Thumbnail 014-J: Lucia leaving prison with a smirk (Trailer 2, 1:06) + 'GTA NOW JUDGES YOU'. Official Rockstar frame, no AI.
usage: make_thumb014J.py SRC OUT CROP_X CROP_Y CROP_W FACE_X FACE_Y"""
import sys, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
src, out = sys.argv[1], sys.argv[2]
cx, cy, cw, fx, fy = map(int, sys.argv[3:8])
W, H = 1280, 720
im = Image.open(src).convert("RGB")
im = im.crop((cx, cy, cx + cw, cy + cw * 9 // 16)).resize((W, H), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(1.2)
im = im.convert("RGBA")
bright = ImageEnhance.Brightness(im.convert("RGB")).enhance(1.35).convert("RGBA")
m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).ellipse((fx - 190, fy - 190, fx + 190, fy + 230), fill=255)
im = Image.composite(bright, im, m.filter(ImageFilter.GaussianBlur(70)))
g = Image.new("L", (W, 1))
for x in range(W): g.putpixel((x, 0), int(min(1, max(0, (x - 600) / 330)) ** 1.1 * 215))
sh = Image.new("RGBA", (W, H), (12, 4, 18, 255)); sh.putalpha(g.resize((W, H))); im = Image.alpha_composite(im, sh)
v = Image.new("L", (W, H), 150); ImageDraw.Draw(v).ellipse((-200, -160, W + 120, H + 160), fill=0)
vv = Image.new("RGBA", (W, H), (0, 0, 0, 255)); vv.putalpha(v.filter(ImageFilter.GaussianBlur(90))); im = Image.alpha_composite(im, vv)
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
def line(t, size, y, fill, right=1245):
    f = ImageFont.truetype(F, size); w = d.textlength(t, font=f)
    d.text((right - w, y), t, font=f, fill=fill, stroke_width=9, stroke_fill=(0, 0, 0)); return w
line("GTA NOW", 132, 118, (255, 255, 255))
line("JUDGES", 160, 250, (255, 255, 255))
w = line("YOU", 215, 405, (255, 201, 60))
d.rectangle((1245 - w, 650, 1245, 668), fill=(230, 30, 40))
glow = txt.filter(ImageFilter.GaussianBlur(16)); dark = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dark.putalpha(glow.split()[3].point(lambda a: int(a * .75)))
im = Image.alpha_composite(im, dark); im = Image.alpha_composite(im, txt)
def star(x, y, r): return [(x + r * math.cos(a) * (1 if i % 2 == 0 else .42), y + r * math.sin(a) * (1 if i % 2 == 0 else .42)) for i, a in enumerate([-math.pi / 2 + k * math.pi / 5 for k in range(10)])]
dd = ImageDraw.Draw(im)
for i in range(6):
    x = 1245 - 28 - i * 62
    dd.polygon(star(x + 4, 62, 28), fill=(0, 0, 0)); dd.polygon(star(x, 58, 28), fill=(255, 255, 255), outline=(0, 0, 0))
im.convert("RGB").save(out, quality=93)
