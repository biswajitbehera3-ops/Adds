"""Packs `dist/` (from `npx expo export -p web`) into one self-contained HTML page
for the shareable test link: the JS bundle and fonts are inlined, so the page
needs no other files and works under a strict Content-Security-Policy.

Usage: npx expo export -p web && python3 scripts/build-web-artifact.py
Output: web-artifact/salon-counter.html
"""
import base64
import glob
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
OUT = os.path.join(ROOT, "web-artifact")

bundle_path = glob.glob(os.path.join(DIST, "_expo/static/js/web/index-*.js"))[0]
js = open(bundle_path, encoding="utf-8").read()


def inline_font(m):
    data = base64.b64encode(open(DIST + m.group(1), "rb").read()).decode()
    return '"data:font/ttf;base64,' + data + '"'


js, fonts = re.subn(r'"(/assets/[^"]+\.ttf)"', inline_font, js)
# A literal "</script" inside the bundle would end the inline script early.
js = js.replace("</script", "<\\/script")

page = f"""<title>Salon Counter</title>
<meta name="theme-color" content="#2A1710">
<style>
  /* Single committed world: the app paints its own chocolate and cream grounds. */
  :root {{ --ground: #160A06; --ink: #F3E8D6; color-scheme: light; }}
  html, body {{ height: 100%; margin: 0; background: var(--ground); color: var(--ink); }}
  body {{ overflow: hidden; }}
  #root {{ display: flex; height: 100%; flex: 1; }}
  ::selection {{ background: #A0471A; color: #FBF5EA; }}
</style>
<noscript>This app needs JavaScript to run.</noscript>
<div id="root"></div>
<script>
{js}
</script>
"""
os.makedirs(OUT, exist_ok=True)
for stale in ("app.js",):
    p = os.path.join(OUT, stale)
    if os.path.exists(p):
        os.remove(p)
out = os.path.join(OUT, "salon-counter.html")
open(out, "w", encoding="utf-8").write(page)
print(f"fonts inlined: {fonts}; page size: {os.path.getsize(out) / 1e6:.2f} MB -> {out}")
