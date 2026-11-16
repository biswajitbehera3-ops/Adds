"""Short 024 Part 2 cover v4: user's Jason & Lucia dock artwork (guns, police boat, helicopter).
Text 'BROKE TO / FIRST ROBBERY' in the sky, PART 2 tag, neon Jason/Lucia labels (same style as Part 1).
Usage: make_cover024e.py out [--4k]"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
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
line("BROKE TO", 160, 175, (255, 255, 255)); line("FIRST ROBBERY", 220, 355, (255, 52, 52))
glow = txt.filter(ImageFilter.GaussianBlur(s(18))); dk = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dk.putalpha(glow.split()[3].point(lambda v: int(v * .8)))
im = Image.alpha_composite(im, dk); im = Image.alpha_composite(im, txt); d = ImageDraw.Draw(im)
f = ImageFont.truetype(F, s(72)); d.rounded_rectangle((s(50), s(50), s(330), s(160)), s(18), fill=(255, 201, 60), outline=(0, 0, 0), width=s(6)); d.text((s(78), s(62)), "PART 2", font=f, fill=(0, 0, 0))
ft = ImageFont.truetype("remotion-overlays/public/fonts/Pacifico-Regular.woff", s(60))
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
lab = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lab)
for name, (x, y), col in (("Lucia", (95, 1000), (255, 46, 136)), ("Jason", (440, 880), (31, 184, 255))):
    gd.text((s(x), s(y)), name, font=ft, fill=col + (255,))
    ld.text((s(x), s(y)), name, font=ft, fill=(255, 255, 255), stroke_width=s(3), stroke_fill=col)
glow = glow.filter(ImageFilter.GaussianBlur(s(10)))
im = Image.alpha_composite(im, glow); im = Image.alpha_composite(im, glow); im = Image.alpha_composite(im, lab)
im.convert("RGB").save(out, quality=95); print(out, im.size)
