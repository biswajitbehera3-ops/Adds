"""Short 034 cover: user's Jason & Lucia motel art + '1ST HOUR REVIEW' in the sky (1080x1920)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
SRC = "remotion-overlays/public/frames/user-jason-lucia-motel-art.jpg"
FONT = "remotion-overlays/public/fonts/Anton-Regular.ttf"
OUT = "remotion-overlays/out/thumbs/034-cover.jpg"
W, H = 1080, 1920
img = Image.open(SRC).convert("RGB")
img = img.resize((W, round(img.height * W / img.width)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 80, 2))
canvas = Image.new("RGB", (W, H)); canvas.paste(img.crop((0, 0, W, min(H, img.height))), (0, 0))

def gradient_text(base, text, size, top, colors, stroke=14, tracking=4):
    f = ImageFont.truetype(FONT, size)
    d = ImageDraw.Draw(base)
    widths = [d.textbbox((0, 0), ch, font=f)[2] for ch in text]
    tw = sum(widths) + tracking * (len(text) - 1)
    x0 = (W - tw) // 2
    # mask for the letters
    mask = Image.new("L", (W, H), 0); md = ImageDraw.Draw(mask)
    x = x0
    for ch, w in zip(text, widths): md.text((x, top), ch, font=f, fill=255); x += w + tracking
    # shadow + thick dark outline
    sh = mask.filter(ImageFilter.MaxFilter(stroke * 2 + 1))
    shadow = Image.new("RGB", (W, H), (20, 6, 30))
    off = Image.new("L", (W, H), 0); off.paste(sh, (10, 14))
    base.paste(shadow, (0, 0), off.filter(ImageFilter.GaussianBlur(8)))
    base.paste(Image.new("RGB", (W, H), (18, 8, 28)), (0, 0), sh)
    # vertical gradient fill
    bb = mask.getbbox(); grad = Image.new("RGB", (W, H))
    gd = ImageDraw.Draw(grad)
    for y in range(bb[1], bb[3] + 1):
        t = (y - bb[1]) / max(1, bb[3] - bb[1])
        c = [round(colors[0][i] + (colors[1][i] - colors[0][i]) * t) for i in range(3)]
        gd.line([(0, y), (W, y)], fill=tuple(c))
    base.paste(grad, (0, 0), mask)

# soft dark band behind the text so it pops on the bright sky
band = Image.new("L", (W, H), 0); bd = ImageDraw.Draw(band)
bd.rectangle([0, 120, W, 760], fill=110); band = band.filter(ImageFilter.GaussianBlur(70))
canvas.paste(Image.new("RGB", (W, H), (30, 8, 40)), (0, 0), band)
gradient_text(canvas, "1ST HOUR", 250, 150, [(255, 236, 140), (255, 168, 40)])
gradient_text(canvas, "REVIEW", 250, 430, [(255, 120, 200), (255, 46, 136)])
canvas.save(OUT, quality=93); print("saved", OUT)
