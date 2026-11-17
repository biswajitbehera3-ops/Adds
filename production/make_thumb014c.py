"""Thumbnail for 014 (v3), in the style of the user's 'VI' poster: white background, black palm 'VI' logo, orange sun,
palm/bird silhouettes and the car scene. Text: [VI] NOW / JUDGES / YOU.  Usage: make_thumb014c.py out [--hd]"""
import sys
from PIL import Image, ImageDraw, ImageFont
S = 1.5 if "--hd" in sys.argv else 1.0; out = [x for x in sys.argv[1:] if x != "--hd"][0]
s = lambda v: int(round(v * S)); W, H = s(1280), s(720)
src = Image.open("remotion-overlays/public/frames/user-vi-sunset-style.jpg").convert("RGB")
im = Image.new("RGB", (W, H), (255, 255, 255))
# right: sun, birds, palms, helicopter and car (the poster's lower half), full height
scene = src.crop((0, 412, src.width, src.height)); k = H / scene.height
scene = scene.resize((int(scene.width * k), H), Image.LANCZOS)
m = Image.new("L", scene.size, 255); md = ImageDraw.Draw(m); fw = s(70)
for x in range(fw): md.line((x, 0, x, scene.height), fill=int(255 * x / fw))   # melt the left edge into the white page
im.paste(scene, (W - scene.width, 0), m)
# left: the poster's own black palm-tree 'VI' as the first word
vi = src.crop((172, 152, 502, 404)); vk = s(195) / vi.height
vi = vi.resize((int(vi.width * vk), s(195)), Image.LANCZOS); im.paste(vi, (s(40), s(30)))
d = ImageDraw.Draw(im); F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
def word(t, size, x, y, fill, maxw, stroke=0):
    f = ImageFont.truetype(F, s(size))
    while d.textlength(t, font=f) > maxw: size -= 4; f = ImageFont.truetype(F, s(size))
    d.text((x, y), t, font=f, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))
word("NOW", 150, s(40) + vi.width + s(24), s(30), (0, 0, 0), s(240))
word("JUDGES", 175, s(40), s(232), (244, 127, 42), s(560), stroke=s(6))   # the poster's sun orange
word("YOU", 175, s(40), s(440), (0, 0, 0), s(560))
im.save(out, quality=95); print(out, im.size)
