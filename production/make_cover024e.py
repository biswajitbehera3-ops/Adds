"""Short 024 Part 2 cover v4: user's Jason & Lucia dock artwork (guns, police boat, helicopter).
Text 'YOUR FIRST DATE? / ROB A STORE.' in the sky, PART 2 tag, no name labels.
Usage: make_cover024e.py out [--4k]"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
TOP_T, BOT_T = "YOUR FIRST DATE?", "ROB A STORE."
S = 2 if "--4k" in sys.argv else 1; out = [x for x in sys.argv[1:] if x != "--4k"][0]
s = lambda v: int(round(v * S)); W, H = s(1080), s(1920)
src = Image.open("remotion-overlays/public/frames/user-jason-lucia-dock-art.jpg").convert("RGB")
k = W / src.width; big = src.resize((W, int(src.height * k)), Image.LANCZOS)
TOP = s(130); im = big.crop((0, TOP, W, TOP + H))
im = ImageEnhance.Contrast(im).enhance(1.08); im = ImageEnhance.Color(im).enhance(1.1).convert("RGBA")
# darken the sky band so the text pops
g = Image.new("L", (1, H))
for y in range(H): g.putpixel((0, y), int(max(0, 1 - (y / S) / 640) ** 1.4 * 150))
sh = Image.new("RGBA", (W, H), (10, 8, 40, 255)); sh.putalpha(g.resize((W, H))); im = Image.alpha_composite(im, sh)
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
def line(t, size, y, fill):
    f = ImageFont.truetype(F, s(size))
    while d.textlength(t, font=f) > W - s(70): size -= 6; f = ImageFont.truetype(F, s(size))
    d.text(((W - d.textlength(t, font=f)) / 2, s(y)), t, font=f, fill=fill, stroke_width=s(11), stroke_fill=(0, 0, 0))
line(TOP_T, 160, 175, (255, 255, 255)); line(BOT_T, 220, 355, (255, 52, 52))
glow = txt.filter(ImageFilter.GaussianBlur(s(18))); dk = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dk.putalpha(glow.split()[3].point(lambda v: int(v * .8)))
im = Image.alpha_composite(im, dk); im = Image.alpha_composite(im, txt); d = ImageDraw.Draw(im)
f = ImageFont.truetype(F, s(72)); d.rounded_rectangle((s(50), s(50), s(330), s(160)), s(18), fill=(255, 201, 60), outline=(0, 0, 0), width=s(6)); d.text((s(78), s(62)), "PART 2", font=f, fill=(0, 0, 0))
im.convert("RGB").save(out, quality=95); print(out, im.size)
