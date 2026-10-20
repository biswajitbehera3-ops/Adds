"""
Packs the web export into one self-contained HTML file (bundle inlined, images, fonts and
the intro video as data URIs) so the app can be opened or shared without a server.
  EXPO_OFFLINE=1 npx expo export -p web --output-dir dist-web
  python3 scripts/web-single-file.py dist-web salon-app.html
"""
import base64, glob, re, sys

web, out = sys.argv[1], sys.argv[2]
js = open(glob.glob(f"{web}/_expo/static/js/web/index-*.js")[0], encoding="utf-8").read()
MIME = {"png": "image/png", "webp": "image/webp", "jpg": "image/jpeg", "mp4": "video/mp4", "ttf": "font/ttf"}
# Only the Urbanist weights App.tsx loads; the other font files are dropped.
FONTS = ("Urbanist_400Regular.", "Urbanist_500Medium.", "Urbanist_600SemiBold.", "Urbanist_700Bold.", "Urbanist_800ExtraBold.")

def inline(m):
    path = m.group(1)
    if path.endswith(".ttf") and not any(f in path for f in FONTS):
        return '""'
    data = base64.b64encode(open(web + path, "rb").read()).decode()
    return f'"data:{MIME[path.rsplit(".", 1)[1]]};base64,{data}"'

js = re.sub(r'"(/assets/[^"]+)"', inline, js).replace("</script", "<\\/script")
html = f"""<title>Salon App</title>
<meta name="theme-color" content="#1A1210">
<style>
:root{{color-scheme:dark;--bg:#1A1210}}
html,body{{height:100%;background:var(--bg)}}
body{{overflow:hidden}}
#root{{display:flex;height:100%;flex:1}}
</style>
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
<script>
{js}
</script>
"""
open(out, "w", encoding="utf-8").write(html)
print(f"{out}: {len(html) / 1e6:.1f} MB")
