"""Route graphics on Rockstar's OFFICIAL Leonida map (Leonida_Map_Poster.jpg from the GTA VI artwork pack).
Stops are placed at the labels printed on the official map (Sharktooth Island = the small sandbar between Waning Sands
and Little Hardin Island, per Polygon/GameSpot). The camera eases from a full-map overview to each stop.
route_frame(stage, k): stage 0 = overview (stops pop in), stage n = camera + gold path travel from stop n-1 to stop n."""
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
Image.MAX_IMAGE_PIXELS = None
W, H = 1080, 1920
MAP = Image.open('/tmp/claude-0/-home-user-Adds/2286a8c0-ed81-596f-88c3-0b00ce15c5a6/scratchpad/mapdl/Leonida_Map_and_Cover_Art_Poster/Leonida_Map_Poster.jpg').convert('RGB')
A = lambda n: ImageFont.truetype('/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf', int(n))
I = lambda n: ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', int(n))
GOLD, RED, WHITE = (255, 196, 40), (220, 35, 45), (255, 255, 255)
# stop positions in official-map pixels (2805 x 3840)
STOPS = [('1', 'DOWNTOWN', 'War memorial · the old man', (1968, 2030), 'R'),
         ('2', 'LITTLE CUBA', 'His apartment · 3 clues', (1850, 2075), 'L'),
         ('3', 'SHARKTOOTH ISLAND', 'North shore · CODE 1 + 2', (2128, 1065), 'L'),
         ('4', 'BIG PINE', 'Hatch in the forest · CODE 3', (1106, 2370), 'R')]
# camera: (centre x, centre y, map pixels shown across the 1080-wide screen)
CAM = [(1500, 1920, 2805),          # overview: whole state height fits
       (1910, 2050, 900),           # stop 1-2: Vice City close-up
       (1900, 1500, 1700),          # travelling north-east
       (1500, 1900, 2160)]          # back out to reach Big Pine
STOP_CAM = {1: (1910, 2050, 900), 2: (2100, 1250, 1300), 3: (1250, 2300, 1300)}
def ease(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 3
def ease_io(x): x = min(max(x, 0), 1); return x * x * (3 - 2 * x)
def lerp(a, b, k): return tuple(a[i] + (b[i] - a[i]) * k for i in range(len(a)))
def camera(stage, k):
    if stage == 0: return CAM[0]
    start = STOP_CAM.get(stage - 1, CAM[0]) if stage > 1 else CAM[0]
    end = STOP_CAM[stage]
    if stage == 1: return lerp(CAM[0], end, ease_io(k * 1.3))
    mid = (min(start[0], end[0]) + abs(start[0] - end[0]) / 2, min(start[1], end[1]) + abs(start[1] - end[1]) / 2, 2160)
    return lerp(lerp(start, mid, ease_io(k * 2)), lerp(mid, end, ease_io(k * 2 - 1)), 0 if k < 0.5 else 1) if k < 0.5 else lerp(mid, end, ease_io(k * 2 - 1))
def view(cam):
    cx, cy, span = cam; span = min(span, MAP.width); sh = span * H / W
    if sh > MAP.height: sh = MAP.height; span = sh * W / H
    x0 = min(max(cx - span / 2, 0), MAP.width - span); y0 = min(max(cy - sh / 2, 0), MAP.height - sh)   # never past the map edge
    im = MAP.crop((int(x0), int(y0), int(x0 + span), int(y0 + sh))).resize((W, H), Image.BILINEAR)
    to = lambda p: ((p[0] - x0) * W / span, (p[1] - y0) * W / span)
    return im, to
def route_frame(stage, k, title=True):
    cam = camera(stage, k); im, to = view(cam); c = im.convert('RGBA')
    shade = Image.new('L', (W, H)); sd = ImageDraw.Draw(shade)
    for y in range(H): sd.line([(0, y), (W, y)], fill=int(150 * max(0, 1 - y / 520)) if y < 520 else int(190 * min(1, max(0, (y - 1380) / 380))))
    c = Image.composite(Image.new('RGBA', (W, H), (6, 10, 16, 255)), c, shade)
    d = ImageDraw.Draw(c); pts = [to(s[3]) for s in STOPS]
    # dashed full route
    for a, b in zip(pts, pts[1:]):
        n = max(2, int(math.dist(a, b) / 20))
        for i in range(0, n, 2):
            p = lerp(a, b, i / n); q = lerp(a, b, (i + 1) / n); d.line([p, q], fill=(255, 255, 255, 170), width=7)
    # travelled path + red dot
    car = pts[0]; lit = -1
    if stage > 0:
        for i in range(stage - 1): d.line([pts[i], pts[i + 1]], fill=GOLD, width=13)
        a, b = pts[stage - 1], pts[stage]; e = ease(k * 1.25); car = lerp(a, b, e); d.line([a, car], fill=GOLD, width=13)
        lit = stage - 1 + (1 if e >= 1 else 0)
    for i, (n, name, sub, _, side) in enumerate(STOPS):
        if stage == 0 and k < i * 0.18: continue
        x, y = pts[i]; on = i <= lit; col = GOLD if on else (235, 235, 240)
        d.ellipse((x - 34, y - 34, x + 34, y + 34), fill=(12, 14, 18), outline=col, width=7)
        f = A(46); d.text((x - d.textlength(n, font=f) / 2, y - 33), n, font=f, fill=col)
        if stage == 0 or i in (stage - 1, stage):
            nf = A(44 if stage else 38); tw = d.textlength(name, font=nf); right = side == 'R'
            tx = x + 48 if right else x - 48 - tw; tx = min(max(tx, 20), W - 20 - tw)
            d.text((tx, y - 52), name, font=nf, fill=WHITE, stroke_width=6, stroke_fill=(8, 8, 12))
            if stage > 0:                                    # detail line only when zoomed in
                sf = I(24); sw = d.textlength(sub, font=sf); sx = x + 48 if right else x - 48 - sw; sx = min(max(sx, 20), W - 20 - sw)
                d.text((sx, y - 2), sub, font=sf, fill=WHITE, stroke_width=3, stroke_fill=(8, 8, 12))
    if stage > 0:
        d.ellipse((car[0] - 17, car[1] - 17, car[0] + 17, car[1] + 17), fill=RED, outline=WHITE, width=5)
    if title:
        f = A(104); t = 'THE ROUTE'; w = d.textlength(t, font=f); d.text(((W - w) / 2, 330), t, font=f, fill=GOLD, stroke_width=10, stroke_fill=(8, 8, 12))
    f = I(24); t = "Official Rockstar map · stops from VGC, GameSpot, Polygon"; w = d.textlength(t, font=f)
    d.rounded_rectangle(((W - w) / 2 - 18, 1395, (W + w) / 2 + 18, 1440), 22, fill=(0, 0, 0, 175)); d.text(((W - w) / 2, 1403), t, font=f, fill=(230, 230, 235))
    if stage > 0:
        f = A(58); t = 'NEXT STOP: ' + STOPS[stage][1]; w = d.textlength(t, font=f)
        d.text(((W - w) / 2, 1460), t, font=f, fill=WHITE, stroke_width=8, stroke_fill=(8, 8, 12))
    return c

if __name__ == '__main__':
    import sys
    frames = [route_frame(0, 1.0), route_frame(1, 1.0), route_frame(2, 0.55), route_frame(2, 1.0), route_frame(3, 1.0)]
    s = Image.new('RGB', (5 * 432, 768))
    for i, f in enumerate(frames): s.paste(f.convert('RGB').resize((432, 768)), (i * 432, 0))
    s.save(sys.argv[1], quality=88)
