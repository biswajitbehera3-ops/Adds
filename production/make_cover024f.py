"""Short 024 Part 2 cover v6: user's Jason & Lucia dock art + a 'WEEK 1 TO-DO' checklist in the sky.
Three items ticked green, the last one ('DON'T GET CAUGHT') left unticked in red = the cliffhanger.
Usage: make_cover024f.py out [--4k]"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
S = 2 if "--4k" in sys.argv else 1; out = [x for x in sys.argv[1:] if x != "--4k"][0]
s = lambda v: int(round(v * S)); W, H = s(1080), s(1920)
src = Image.open("remotion-overlays/public/frames/user-jason-lucia-dock-art.jpg").convert("RGB")
big = src.resize((W, int(src.height * W / src.width)), Image.LANCZOS)
TOP = s(60); im = big.crop((0, TOP, W, TOP + H))
im = ImageEnhance.Contrast(im).enhance(1.08); im = ImageEnhance.Color(im).enhance(1.1).convert("RGBA")
g = Image.new("L", (1, H))
for y in range(H): g.putpixel((0, y), int(max(0, 1 - (y / S) / 700) ** 1.2 * 165))
sh = Image.new("RGBA", (W, H), (10, 8, 40, 255)); sh.putalpha(g.resize((W, H))); im = Image.alpha_composite(im, sh)
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
fh = ImageFont.truetype(F, s(108)); head = "WEEK 1 TO-DO"
d.text(((W - d.textlength(head, font=fh)) / 2, s(185)), head, font=fh, fill=(255, 201, 60), stroke_width=s(8), stroke_fill=(0, 0, 0))
items = [("STEAL A CHEAP CAR", True), ("ROB A STORE", True), ("MAKE IT A DATE", True), ("DON'T GET CAUGHT", False)]
fi = ImageFont.truetype(F, s(60)); bx = s(54); step = s(78)
wmax = max(d.textlength(t, font=fi) for t, _ in items); x0 = int((W - (bx + s(22) + wmax)) / 2); y = s(345)
for t, done in items:
    col = (255, 255, 255) if done else (255, 52, 52)
    d.rounded_rectangle((x0, y + s(12), x0 + bx, y + s(12) + bx), s(10), fill=(255, 255, 255) if done else (40, 0, 0), outline=(0, 0, 0), width=s(5))
    if done:
        d.line((x0 + s(10), y + s(40), x0 + s(23), y + s(54), x0 + s(46), y + s(21)), fill=(20, 170, 60), width=s(10), joint="curve")
    else:
        d.rounded_rectangle((x0, y + s(12), x0 + bx, y + s(12) + bx), s(10), outline=(255, 52, 52), width=s(5))
    d.text((x0 + bx + s(22), y), t, font=fi, fill=col, stroke_width=s(6), stroke_fill=(0, 0, 0))
    y += step
glow = txt.filter(ImageFilter.GaussianBlur(s(18))); dk = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dk.putalpha(glow.split()[3].point(lambda v: int(v * .8)))
im = Image.alpha_composite(im, dk); im = Image.alpha_composite(im, txt); d = ImageDraw.Draw(im)
f = ImageFont.truetype(F, s(72)); d.rounded_rectangle((s(50), s(50), s(330), s(160)), s(18), fill=(255, 201, 60), outline=(0, 0, 0), width=s(6)); d.text((s(78), s(62)), "PART 2", font=f, fill=(0, 0, 0))
im.convert("RGB").save(out, quality=95); print(out, im.size)
