"""Thumbnail for 014 'GTA 6 vs GTA 5' (v2): user's Jason & Lucia motel art on the right, text 'GTA NOW / WATCHES / YOU' left.
Usage: make_thumb014b.py out [--hd]   (default 1280x720; --hd = 1920x1080)"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
S = 1.5 if "--hd" in sys.argv else 1.0; out = [x for x in sys.argv[1:] if x != "--hd"][0]
s = lambda v: int(round(v * S)); W, H = s(1280), s(720)
src = Image.open("remotion-overlays/public/frames/user-jason-lucia-motel-art.jpg").convert("RGB")
# background: the art's own sky and palm trees, sharp
sky = src.crop((0, 0, src.width, 520)); kk = H / sky.height
sky = sky.resize((int(sky.width * kk), H), Image.LANCZOS)          # sharp palms + sky, no blur
bg = Image.new("RGB", (W, H)); bg.paste(sky, (0, 0))
bg = ImageEnhance.Brightness(bg).enhance(0.85).convert("RGBA")
# characters: heads to boots, full thumbnail height on the right
crop = src.crop((0, 470, src.width, src.height))
k = H / crop.height; ch = crop.resize((int(crop.width * k), H), Image.LANCZOS)
ch = ImageEnhance.Contrast(ch).enhance(1.08); ch = ImageEnhance.Color(ch).enhance(1.1).convert("RGBA")
x0 = W - ch.width
m = Image.new("L", ch.size, 255); md = ImageDraw.Draw(m); fade = s(110)
for x in range(fade): md.line((x, 0, x, ch.height), fill=int(255 * x / fade))
ch.putalpha(m); bg.alpha_composite(ch, (x0, 0)); im = bg
# darken the text side a little more
g = Image.new("L", (W, 1))
for x in range(W): g.putpixel((x, 0), int(max(0, 1 - x / (W * 0.62)) * 120))
sh = Image.new("RGBA", (W, H), (20, 6, 40, 255)); sh.putalpha(g.resize((W, H))); im = Image.alpha_composite(im, sh)
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
def line(t, size, y, fill, maxw):
    f = ImageFont.truetype(F, s(size))
    while d.textlength(t, font=f) > maxw: size -= 4; f = ImageFont.truetype(F, s(size))
    d.text((s(48), s(y)), t, font=f, fill=fill, stroke_width=s(9), stroke_fill=(0, 0, 0))
line("GTA NOW", 150, 40, (255, 255, 255), s(600))
line("WATCHES", 175, 230, (255, 201, 60), s(600))
line("YOU", 190, 445, (255, 52, 52), s(600))
glow = txt.filter(ImageFilter.GaussianBlur(s(14))); dk = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dk.putalpha(glow.split()[3].point(lambda v: int(v * .85)))
im = Image.alpha_composite(im, dk); im = Image.alpha_composite(im, txt)
im.convert("RGB").save(out, quality=95); print(out, im.size)
