"""Thumbnail 049 (9:16): our military hangar (hangar_bg.py) with the detailed tank (tank_art.py), 'FREE TANK',
amber LED '010317', official VI logo. Usage: thumb_v049.py <tank.png> <out.jpg>"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
TANK, OUT = sys.argv[1], sys.argv[2]; W, H = 1080, 1920
A = lambda n: ImageFont.truetype('/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf', int(n))
GOLD, AMBER = (255, 196, 40), (255, 170, 30)
sys.path.insert(0, '/home/user/Adds/production'); import hangar_bg as hb
c = hb.base(stencil=False).convert('RGBA'); c.alpha_composite(hb.lights(1.3, 1.2)); d = ImageDraw.Draw(c)
def word(t, y, size, fill):
    f = A(size); w = d.textlength(t, font=f)
    if w > W - 60: f = A(size * (W - 60) / w); w = d.textlength(t, font=f)
    d.text(((W - w) / 2 + 8, y + 10), t, font=f, fill=(0, 0, 0, 150)); d.text(((W - w) / 2, y), t, font=f, fill=fill, stroke_width=13, stroke_fill=(8, 8, 12))
word('FREE', 70, 290, (255, 255, 255)); word('TANK', 360, 330, GOLD)
tank = Image.open(TANK).convert('RGBA'); tank = tank.resize((1060, int(1060 * tank.height / tank.width)), Image.LANCZOS)
x, y = (W - tank.width) // 2, 1240 - tank.height
g = Image.new('RGBA', (W, H)); g.alpha_composite(tank, (x, y)); gl = g.getchannel('A').filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * .65))
c.alpha_composite(Image.merge('RGBA', (Image.new('L', (W, H), 255), Image.new('L', (W, H), 196), Image.new('L', (W, H), 60), gl)))
c.alpha_composite(hb.reflection(tank, x, y)); c.alpha_composite(g); d = ImageDraw.Draw(c)
# amber LED code panel
f = A(170); code = '010317'; pw = d.textlength(code, font=f) + 110; x0 = (W - pw) / 2; y0 = 1440
d.rounded_rectangle((x0, y0, x0 + pw, y0 + 250), 30, fill=(16, 13, 8, 240), outline=AMBER, width=7)
g = Image.new('RGBA', (W, H)); ImageDraw.Draw(g).text((x0 + 55, y0 + 22), code, font=f, fill=AMBER + (255,)); c.alpha_composite(g.filter(ImageFilter.GaussianBlur(12)))
d = ImageDraw.Draw(c); d.text((x0 + 55, y0 + 22), code, font=f, fill=(255, 225, 150))
vi = Image.open('/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/th43/vi_logo.png').convert('RGBA')
vi = vi.resize((210, int(210 * vi.height / vi.width)), Image.LANCZOS); c.alpha_composite(vi, (W - 250, H - vi.height - 50))
c.convert('RGB').save(OUT, quality=92)
