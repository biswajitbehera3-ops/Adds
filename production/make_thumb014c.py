"""Thumbnail for 014 (v3.1), in the style of the user's 'VI' poster: white page, black palm 'VI' logo, orange sun,
car scene on the right (fully solid), palm silhouettes continuing behind 'YOU', and the birds flying over the words.
Text: [VI] NOW / JUDGES / YOU.  Usage: make_thumb014c.py out [--hd]"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps
S = 1.5 if "--hd" in sys.argv else 1.0; out = [x for x in sys.argv[1:] if x != "--hd"][0]
s = lambda v: int(round(v * S)); W, H = s(1280), s(720)
src = Image.open("remotion-overlays/public/frames/user-vi-sunset-style.jpg").convert("RGB")
TOP = 412; k = H / (src.height - TOP)

def silhouette(box, thr=110):
    """Cut a black shape out of the white poster: dark pixels -> opaque black."""
    c = src.crop(box); a = ImageOps.grayscale(c).point(lambda v: max(0, min(255, int((165 - v) * 255 / 105))))  # soft edge, no jaggies
    sil = Image.new("RGBA", c.size, (0, 0, 0, 255)); sil.putalpha(a); return sil

birds = silhouette((0, TOP, 312, 652))
tall_palm = silhouette((126, 668, 266, 872))
palm_cluster = silhouette((606, 806, 735, 948))   # start right of the helicopter rotor

# right: the poster's lower half, birds removed from it (they move over the text), pasted fully solid
scene = src.crop((0, TOP, src.width, src.height)).copy()
ImageDraw.Draw(scene).rectangle((0, 0, 312, 652 - TOP), fill=(255, 255, 255))
scene = scene.resize((int(scene.width * k), H), Image.LANCZOS)
sx = W - scene.width
im = Image.new("RGBA", (W, H), (255, 255, 255, 255)); im.paste(scene, (sx, 0))

# ground: find the poster's dark ground band at its left edge and continue it across to the left of the page
g = H - s(30)   # the poster's thin ground line
ImageDraw.Draw(im).rectangle((0, g, sx + 2, H), fill=(0, 0, 0, 255))

# palms behind 'YOU': the poster's own silhouettes, standing on that ground
def plant(sil, h, x, flip=False):
    sh = sil.resize((int(sil.width * h / sil.height), h), Image.LANCZOS)
    if flip: sh = ImageOps.mirror(sh)
    im.alpha_composite(sh, (x, g - h + s(4)))
plant(tall_palm, s(200), s(-30), flip=True)     # whole palms only (no cut-off clusters)
plant(tall_palm, s(150), s(150))
plant(tall_palm, s(250), s(300))
plant(tall_palm, s(185), s(430), flip=True)       # also hides the edge where the poster scene starts

# text
vi = src.crop((172, 152, 502, 404)); vk = s(195) / vi.height
vi = vi.resize((int(vi.width * vk), s(195)), Image.LANCZOS); im.paste(vi, (s(40), s(30)))
d = ImageDraw.Draw(im); F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
def word(t, size, x, y, fill, maxw, stroke=0, sfill=(0, 0, 0)):
    f = ImageFont.truetype(F, s(size))
    while d.textlength(t, font=f) > maxw: size -= 4; f = ImageFont.truetype(F, s(size))
    d.text((x, y), t, font=f, fill=fill, stroke_width=stroke, stroke_fill=sfill)
word("NOW", 150, s(40) + vi.width + s(24), s(30), (0, 0, 0), s(240))
word("JUDGES", 175, s(40), s(232), (244, 127, 42), s(560), stroke=s(6))
word("YOU", 175, s(40), s(440), (0, 0, 0), s(560), stroke=s(7), sfill=(255, 255, 255))  # white edge so it reads over the palms

# birds on top, flying across the words
bk = s(190) / birds.height; bb = birds.resize((int(birds.width * bk), s(250)), Image.LANCZOS)
im.alpha_composite(bb, (s(470), s(14)))   # crossing the top of 'NOW' towards the sun
im.convert("RGB").save(out, quality=95); print(out, im.size, "ground y", g)
