"""Short 024 Part 2 cover v2: user's sunset/supercar background (hooded man removed) + Jason & Lucia cut from
Rockstar's Launch Trailer (0:41), colour-matched to the sunset. Text 'THIS CAR? LOCKED.' + padlock + PART 2.
Usage: make_cover024c.py out [--4k]"""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
S = 2 if "--4k" in sys.argv else 1; out = [x for x in sys.argv[1:] if x != "--4k"][0]
s = lambda v: int(round(v * S)); W, H = s(1080), s(1920)
bg = Image.open("remotion-overlays/public/frames/user-supercar-sunset-noman.png").convert("RGB")
ch = int(bg.width * 16 / 9); y0 = bg.height - ch
bg = bg.crop((0, y0, bg.width, y0 + ch)).resize((W, H), Image.LANCZOS)
bg = ImageEnhance.Contrast(bg).enhance(1.1); bg = ImageEnhance.Color(bg).enhance(1.12).convert("RGBA")
# --- Jason & Lucia cut-out: drop the letterbox, split into two people, kill the stray mirror ---
jl = Image.open("remotion-overlays/public/frames/jason-lucia-lt-cut.png").crop((0, 120, 3840, 2040))
a = np.array(jl.split()[3]); a[1560:1800, 2440:2760] = 0; jl.putalpha(Image.fromarray(a))
def grade(p):  # dusk grade: warmer, a touch of magenta, darker, + orange rim light from the sun side (right)
    arr = np.asarray(p).astype(np.float32); rgb, al = arr[..., :3], arr[..., 3:]
    rgb = rgb * [1.04, 0.80, 0.86] * 0.80 + [14, 0, 18]
    rgb = rgb * (1 - 0.35 * np.linspace(0, 1, rgb.shape[0])[:, None, None] ** 1.5)  # darker toward the bottom
    edge = np.asarray(Image.fromarray(al[..., 0].astype(np.uint8)).filter(ImageFilter.GaussianBlur(14)), np.float32)
    rim = np.clip((al[..., 0] - edge) / 255.0, 0, 1)[..., None]
    xs = np.linspace(0, 1, rgb.shape[1])[None, :, None]
    rgb = rgb + rim * xs * np.array([255, 150, 70]) * 1.4
    return Image.fromarray(np.concatenate([np.clip(rgb, 0, 255), al], 2).astype(np.uint8))
jason, lucia = grade(jl.crop((560, 0, 1830, 1920))), grade(jl.crop((1820, 0, 2800, 1920)))
k = 0.56 * S
J = jason.resize((int(jason.width * k), int(jason.height * k)), Image.LANCZOS)
L = lucia.resize((int(lucia.width * k), int(lucia.height * k)), Image.LANCZOS)
# soft contact shadow so they sit in the scene
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
sd.ellipse((s(200), s(1760), s(1100), s(2010)), fill=(5, 0, 12, 200)); bg = Image.alpha_composite(bg, shadow.filter(ImageFilter.GaussianBlur(s(40))))
bg.alpha_composite(L, (s(705), H - L.height + s(20))); bg.alpha_composite(J, (s(150), H - J.height))
im = bg
# darken sky band for the text
g = Image.new("L", (1, H))
for y in range(H): g.putpixel((0, y), int(max(0, 1 - (y / S) / 760) ** 1.3 * 190))
sh = Image.new("RGBA", (W, H), (8, 3, 20, 255)); sh.putalpha(g.resize((W, H))); im = Image.alpha_composite(im, sh)
F = "remotion-overlays/public/fonts/Anton-Regular.ttf"
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
def line(t, size, y, fill):
    f = ImageFont.truetype(F, s(size))
    while d.textlength(t, font=f) > W - s(80): size -= 6; f = ImageFont.truetype(F, s(size))
    d.text(((W - d.textlength(t, font=f)) / 2, s(y)), t, font=f, fill=fill, stroke_width=s(11), stroke_fill=(0, 0, 0))
line("THIS CAR?", 200, 190, (255, 255, 255)); line("LOCKED.", 270, 420, (255, 52, 52))
glow = txt.filter(ImageFilter.GaussianBlur(s(18))); dk = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dk.putalpha(glow.split()[3].point(lambda v: int(v * .8)))
im = Image.alpha_composite(im, dk); im = Image.alpha_composite(im, txt); d = ImageDraw.Draw(im)
cx, cy = s(130), s(1200)  # padlock on the car's rear
d.arc((cx - s(55), cy - s(135), cx + s(55), cy - s(20)), 180, 360, fill=(20, 20, 20), width=s(30))
d.arc((cx - s(55), cy - s(135), cx + s(55), cy - s(20)), 180, 360, fill=(232, 232, 232), width=s(18))
for xx in (cx - s(55), cx + s(55)): d.line((xx, cy - s(78), xx, cy - s(40)), fill=(232, 232, 232), width=s(18))
d.rounded_rectangle((cx - s(88), cy - s(45), cx + s(88), cy + s(98)), s(20), fill=(255, 52, 52), outline=(17, 17, 17), width=s(9))
d.ellipse((cx - s(18), cy + s(5), cx + s(18), cy + s(41)), fill=(17, 17, 17)); d.rounded_rectangle((cx - s(8), cy + s(28), cx + s(8), cy + s(72)), s(5), fill=(17, 17, 17))
f = ImageFont.truetype(F, s(72)); d.rounded_rectangle((s(50), s(50), s(330), s(160)), s(18), fill=(255, 201, 60), outline=(0, 0, 0), width=s(6)); d.text((s(78), s(62)), "PART 2", font=f, fill=(0, 0, 0))
im.convert("RGB").save(out, quality=95); print(out, im.size)
