"""Short 024 Part 2 cover from the user-supplied supercar/sunset art. Text: 'THIS CAR? LOCKED.' + padlock + PART 2.
Usage: make_cover024b.py src out [--4k]"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
S = 2 if "--4k" in sys.argv else 1; a = [x for x in sys.argv[1:] if x != "--4k"]; src, out = a[0], a[1]
s = lambda v: int(round(v * S)); W, H = s(1080), s(1920)
im = Image.open(src).convert("RGB")
ch = int(im.width * 16 / 9); y0 = max(0, im.height - ch)          # keep the bottom (car + man), trim sky
im = im.crop((0, y0, im.width, y0 + ch)).resize((W, H), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.1); im = ImageEnhance.Color(im).enhance(1.12)
im = im.filter(ImageFilter.UnsharpMask(radius=s(2), percent=70, threshold=2)).convert("RGBA")
# darken the sky band behind the text
g = Image.new("L", (1, H))
for y in range(H): g.putpixel((0, y), int(max(0, 1 - (y / S) / 760) ** 1.3 * 190))
sh = Image.new("RGBA", (W, H), (8, 3, 20, 255)); sh.putalpha(g.resize((W, H))); im = Image.alpha_composite(im, sh)
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
def line(t, size, y, fill):
    f = ImageFont.truetype(F, s(size))
    while d.textlength(t, font=f) > W - s(80): size -= 6; f = ImageFont.truetype(F, s(size))
    d.text(((W - d.textlength(t, font=f)) / 2, s(y)), t, font=f, fill=fill, stroke_width=s(11), stroke_fill=(0, 0, 0))
line("THIS CAR?", 200, 210, (255, 255, 255))
line("LOCKED.", 270, 440, (255, 52, 52))
glow = txt.filter(ImageFilter.GaussianBlur(s(18))); dk = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dk.putalpha(glow.split()[3].point(lambda v: int(v * .8)))
im = Image.alpha_composite(im, dk); im = Image.alpha_composite(im, txt); d = ImageDraw.Draw(im)
# padlock on the car's rear
cx, cy, r = s(250), s(1250), s(1)
d.arc((cx - s(62), cy - s(150), cx + s(62), cy - s(20)), 180, 360, fill=(20, 20, 20), width=s(34))
d.arc((cx - s(62), cy - s(150), cx + s(62), cy - s(20)), 180, 360, fill=(232, 232, 232), width=s(20))
d.line((cx - s(62), cy - s(85), cx - s(62), cy - s(40)), fill=(232, 232, 232), width=s(20)); d.line((cx + s(62), cy - s(85), cx + s(62), cy - s(40)), fill=(232, 232, 232), width=s(20))
d.rounded_rectangle((cx - s(100), cy - s(50), cx + s(100), cy + s(110)), s(22), fill=(255, 52, 52), outline=(17, 17, 17), width=s(10))
d.ellipse((cx - s(20), cy + s(5), cx + s(20), cy + s(45)), fill=(17, 17, 17)); d.rounded_rectangle((cx - s(9), cy + s(30), cx + s(9), cy + s(80)), s(6), fill=(17, 17, 17))
# PART 2 tag
f = ImageFont.truetype(F, s(72)); d.rounded_rectangle((s(50), s(60), s(330), s(170)), s(18), fill=(255, 201, 60), outline=(0, 0, 0), width=s(6)); d.text((s(78), s(72)), "PART 2", font=f, fill=(0, 0, 0))
im.convert("RGB").save(out, quality=95); print(out, im.size)
