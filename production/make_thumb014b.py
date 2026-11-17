"""Thumbnail for 014 'GTA 6 vs GTA 5' (v2): user's Jason & Lucia motel art on the right, text 'GTA NOW / WATCHES / YOU' left in GTA style (shirt-colour fill), no blur.
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
bg = bg.convert("RGBA")
# characters: heads to boots, full thumbnail height on the right
crop = src.crop((0, 470, src.width, src.height))
k = H / crop.height; ch = crop.resize((int(crop.width * k), H), Image.LANCZOS)
ch = ImageEnhance.Contrast(ch).enhance(1.08); ch = ImageEnhance.Color(ch).enhance(1.1).convert("RGBA")
x0 = W - ch.width
m = Image.new("L", ch.size, 255); md = ImageDraw.Draw(m); fade = s(40)
for x in range(fade): md.line((x, 0, x, ch.height), fill=int(255 * x / fade))
ch.putalpha(m); bg.alpha_composite(ch, (x0, 0)); im = bg
# GTA-style text: shirt-colour gradient fill (Jason's pale-blue tank top), thick black outline, hard drop shadow; no blur anywhere
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
TOP, BOT = (238, 244, 248), (128, 176, 206)      # tank top: near-white at the top, washed blue lower down
def gta_line(img, t, size, y, maxw):
    probe = ImageDraw.Draw(img); f = ImageFont.truetype(F, s(size))
    while probe.textlength(t, font=f) > maxw: size -= 4; f = ImageFont.truetype(F, s(size))
    x = s(48); bbox = probe.textbbox((x, s(y)), t, font=f, stroke_width=s(12))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).text((x + s(9), s(y) + s(9)), t, font=f, fill=(0, 0, 0, 255), stroke_width=s(12), stroke_fill=(0, 0, 0, 255))
    img = Image.alpha_composite(img, sh)                                   # hard shadow
    ol = Image.new("RGBA", img.size, (0, 0, 0, 0)); ImageDraw.Draw(ol).text((x, s(y)), t, font=f, fill=(0, 0, 0, 255), stroke_width=s(12), stroke_fill=(0, 0, 0, 255))
    img = Image.alpha_composite(img, ol)                                   # black outline
    mask = Image.new("L", img.size, 0); ImageDraw.Draw(mask).text((x, s(y)), t, font=f, fill=255)
    grad = Image.new("RGBA", img.size); gd = ImageDraw.Draw(grad); y0, y1 = bbox[1], bbox[3]
    for yy in range(y0, y1 + 1):
        r = (yy - y0) / max(1, y1 - y0); gd.line((0, yy, img.width, yy), fill=tuple(int(TOP[i] + (BOT[i] - TOP[i]) * r) for i in range(3)) + (255,))
    fill = Image.new("RGBA", img.size, (0, 0, 0, 0)); fill.paste(grad, (0, 0), mask)
    return Image.alpha_composite(img, fill)
im = gta_line(im, "GTA NOW", 150, 40, s(600))
im = gta_line(im, "WATCHES", 175, 230, s(600))
im = gta_line(im, "YOU", 190, 445, s(600))
im.convert("RGB").save(out, quality=95); print(out, im.size)
