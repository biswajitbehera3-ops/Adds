"""Thumbnail 014-I: Lucia's over-the-shoulder look (Trailer 1, 0:08) + 'IT JUDGES YOU'. Official Rockstar frame, no AI."""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
src, out = sys.argv[1], sys.argv[2]
cx, cy, cw = int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
W, H = 1280, 720
im = Image.open(src).convert("RGB")
ch = cw * 9 // 16
im = im.crop((cx, cy, cx + cw, cy + ch)).resize((W, H), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(1.15)
im = im.convert("RGBA")
# lift the face: soft radial brighten around it
from PIL import ImageChops
bright = ImageEnhance.Brightness(im.convert("RGB")).enhance(1.45).convert("RGBA")
m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).ellipse((300, 270, 640, 640), fill=255); m = m.filter(ImageFilter.GaussianBlur(70))
im = Image.composite(bright, im, m)
# vignette
v = Image.new("L", (W, H), 0); ImageDraw.Draw(v).rectangle((0, 0, W, H), fill=150); ImageDraw.Draw(v).ellipse((-200, -160, W + 120, H + 160), fill=0)
v = v.filter(ImageFilter.GaussianBlur(90)); vv = Image.new("RGBA", (W, H), (0, 0, 0, 255)); vv.putalpha(v); im = Image.alpha_composite(im, vv)
# dark gradient on the right for the text
g = Image.new("L", (W, 1))
for x in range(W): g.putpixel((x, 0), int(min(1, max(0, (x - 560) / 380)) ** 1.2 * 200))
sh = Image.new("RGBA", (W, H), (12, 4, 18, 255)); sh.putalpha(g.resize((W, H))); im = Image.alpha_composite(im, sh)
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
def line(t, size, y, fill, right=1240):
    f = ImageFont.truetype(F, size); w = d.textlength(t, font=f)
    d.text((right - w, y), t, font=f, fill=fill, stroke_width=9, stroke_fill=(0, 0, 0)); return w
line("IT JUDGES", 150, 150, (255, 255, 255))
w = line("YOU", 255, 300, (255, 201, 60))
d.rectangle((1240 - w, 615, 1240, 633), fill=(230, 30, 40))
glow = txt.filter(ImageFilter.GaussianBlur(16)); dark = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dark.putalpha(glow.split()[3].point(lambda a: int(a * .75)))
im = Image.alpha_composite(im, dark); im = Image.alpha_composite(im, txt)
# six wanted stars, top right
star = lambda x, y, r: [(x + r * __import__('math').cos(a) * (1 if i % 2 == 0 else .42), y + r * __import__('math').sin(a) * (1 if i % 2 == 0 else .42)) for i, a in enumerate([-1.5708 + k * 3.14159 / 5 for k in range(10)])]
dd = ImageDraw.Draw(im)
for i in range(6):
    x = 1240 - 28 - i * 64
    dd.polygon(star(x + 4, 74, 30), fill=(0, 0, 0)); dd.polygon(star(x, 70, 30), fill=(255, 255, 255), outline=(0, 0, 0))
im.convert("RGB").save(out, quality=93)
