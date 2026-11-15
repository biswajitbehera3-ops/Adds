"""Short 024 Part 1 cover from the user-supplied cast poster (Artora Studio art — credit it in the description, not on the image).
Usage: make_cover024a.py src out [L1] [L2] [tags] [--4k]   (default 1080x1920; --4k = 2160x3840, all text drawn natively at 4K)."""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
args = [a for a in sys.argv[1:] if a != "--4k"]; S = 2 if "--4k" in sys.argv else 1
src, out = args[0], args[1]
L1 = args[2] if len(args) > 2 else "GTA 6 STARTS"
L2 = args[3] if len(args) > 3 else "YOU BROKE"
TAGS = len(args) > 4 and args[4] == "tags"
s = lambda v: int(round(v * S))
W, H = s(1080), s(1920)
im = Image.open(src).convert("RGB")
cw = int(im.height * 9 / 16); cx = 375 - cw // 2
im = im.crop((cx, 0, cx + cw, im.height)).resize((W, H), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(1.12)
im = im.filter(ImageFilter.UnsharpMask(radius=s(2), percent=80, threshold=2)).convert("RGBA")
# lift the two lead faces, darken the lower half for text
br = ImageEnhance.Brightness(im.convert("RGB")).enhance(1.25).convert("RGBA")
m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).ellipse((s(180), s(120), s(980), s(820)), fill=255)
im = Image.composite(br, im, m.filter(ImageFilter.GaussianBlur(s(90))))
g = Image.new("L", (1, H))
for y in range(H): g.putpixel((0, y), int(min(1, max(0, (y / S - 980) / 520)) ** 1.1 * 225))
sh = Image.new("RGBA", (W, H), (10, 3, 22, 255)); sh.putalpha(g.resize((W, H))); im = Image.alpha_composite(im, sh)
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
def line(t, size, y, fill):
    f = ImageFont.truetype(F, s(size))
    while d.textlength(t, font=f) > W - s(80): size -= 6; f = ImageFont.truetype(F, s(size))
    d.text(((W - d.textlength(t, font=f)) / 2, s(y)), t, font=f, fill=fill, stroke_width=s(11), stroke_fill=(0, 0, 0))
line(L1, 150, 1270, (255, 255, 255))
line(L2, 240, 1440, (255, 201, 60))
glow = txt.filter(ImageFilter.GaussianBlur(s(18))); dk = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dk.putalpha(glow.split()[3].point(lambda a: int(a * .8)))
im = Image.alpha_composite(im, dk); im = Image.alpha_composite(im, txt)
d = ImageDraw.Draw(im)
# PART 1 tag
f = ImageFont.truetype(F, s(72)); d.rounded_rectangle((s(50), s(80), s(330), s(190)), s(18), fill=(255, 201, 60), outline=(0, 0, 0), width=s(6)); d.text((s(78), s(92)), "PART 1", font=f, fill=(0, 0, 0))
# small script name labels (Pacifico) with a soft neon glow; no boxes, no question marks
if TAGS:
    ft = ImageFont.truetype("remotion-overlays/public/fonts/Pacifico-Regular.woff", s(58))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
    lab = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lab)
    for name, (x, y), col in (("Lucia", (110, 540), (255, 46, 136)), ("Jason", (790, 580), (31, 184, 255))):
        gd.text((s(x), s(y)), name, font=ft, fill=col + (255,))
        ld.text((s(x), s(y)), name, font=ft, fill=(255, 255, 255), stroke_width=s(3), stroke_fill=col)
    glow = glow.filter(ImageFilter.GaussianBlur(s(10)))
    im = Image.alpha_composite(im, glow); im = Image.alpha_composite(im, glow); im = Image.alpha_composite(im, lab)
im.convert("RGB").save(out, quality=95)
print(out, im.size)
