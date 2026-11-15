"""Short 024 Part 1 cover (1080x1920) from the user-supplied cast poster (Artora Studio art — credited on the cover)."""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
src, out = sys.argv[1], sys.argv[2]
L1 = sys.argv[3] if len(sys.argv) > 3 else "GTA 6 STARTS"
L2 = sys.argv[4] if len(sys.argv) > 4 else "YOU BROKE"
TAGS = len(sys.argv) > 5 and sys.argv[5] == "tags"
W, H = 1080, 1920
im = Image.open(src).convert("RGB")
cw = int(im.height * 9 / 16); cx = 375 - cw // 2
im = im.crop((cx, 0, cx + cw, im.height)).resize((W, H), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(1.12)
im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=80, threshold=2)).convert("RGBA")
# lift the two lead faces, darken the lower half for text
br = ImageEnhance.Brightness(im.convert("RGB")).enhance(1.25).convert("RGBA")
m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).ellipse((180, 120, 980, 820), fill=255)
im = Image.composite(br, im, m.filter(ImageFilter.GaussianBlur(90)))
g = Image.new("L", (1, H))
for y in range(H): g.putpixel((0, y), int(min(1, max(0, (y - 980) / 520)) ** 1.1 * 225))
sh = Image.new("RGBA", (W, H), (10, 3, 22, 255)); sh.putalpha(g.resize((W, H))); im = Image.alpha_composite(im, sh)
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
def line(t, size, y, fill):
    f = ImageFont.truetype(F, size)
    while d.textlength(t, font=f) > W - 80: size -= 6; f = ImageFont.truetype(F, size)
    d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=fill, stroke_width=11, stroke_fill=(0, 0, 0))
line(L1, 150, 1270, (255, 255, 255))
line(L2, 240, 1440, (255, 201, 60))
glow = txt.filter(ImageFilter.GaussianBlur(18)); dk = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dk.putalpha(glow.split()[3].point(lambda a: int(a * .8)))
im = Image.alpha_composite(im, dk); im = Image.alpha_composite(im, txt)
d = ImageDraw.Draw(im)
# PART 1 tag
f = ImageFont.truetype(F, 72); d.rounded_rectangle((50, 80, 330, 190), 18, fill=(255, 201, 60), outline=(0, 0, 0), width=6); d.text((78, 92), "PART 1", font=f, fill=(0, 0, 0))
# small script name labels (Pacifico) with a soft neon glow; no boxes, no question marks
if TAGS:
    ft = ImageFont.truetype("remotion-overlays/public/fonts/Pacifico-Regular.woff", 58)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
    lab = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lab)
    for name, (x, y), col in (("Lucia", (110, 540), (255, 46, 136)), ("Jason", (790, 580), (31, 184, 255))):
        gd.text((x, y), name, font=ft, fill=col + (255,))
        ld.text((x, y), name, font=ft, fill=(255, 255, 255), stroke_width=3, stroke_fill=col)
    glow = glow.filter(ImageFilter.GaussianBlur(10))
    im = Image.alpha_composite(im, glow); im = Image.alpha_composite(im, glow); im = Image.alpha_composite(im, lab)
    d = ImageDraw.Draw(im)
# credit
fc = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", 30); d = ImageDraw.Draw(im)
d.text((W - 300, H - 60), "Art: Artora Studio", font=fc, fill=(255, 255, 255, 200), stroke_width=2, stroke_fill=(0, 0, 0))
im.convert("RGB").save(out, quality=93)
