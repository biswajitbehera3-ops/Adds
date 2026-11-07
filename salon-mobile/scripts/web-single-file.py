"""
Packs the web export into one self-contained HTML file (bundle inlined, images, fonts and
the intro video as data URIs) so the app can be opened or shared without a server.
  EXPO_OFFLINE=1 npx expo export -p web --output-dir dist-web
  python3 scripts/web-single-file.py dist-web salon-app.html
"""
import base64, glob, re, sys

web, out = sys.argv[1], sys.argv[2]
# The main bundle is the biggest file; any small split chunk (e.g. the document picker) follows it,
# so its modules are registered before anything asks for them.
bundles = sorted(glob.glob(f"{web}/_expo/static/js/web/index-*.js"), key=lambda p: -len(open(p, encoding="utf-8").read()))
js = "\n".join(open(p, encoding="utf-8").read() for p in bundles)
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

# In the claude.ai preview, browser storage can be wiped when the page is closed, which made the
# app start fresh every time (log in and check-in selfie again). When the viewer is signed in,
# the app's saved keys are mirrored to that viewer's private store (the `db` capability, under
# data/users/<their id>) and restored before the app starts. Anywhere else the app runs as is.
PERSIST = r"""
(function () {
  var PREFIX = "salon:", CHUNK = 200000;
  function run() {
    var s = document.createElement("script");
    s.textContent = document.getElementById("salon-app").textContent;
    document.body.appendChild(s);
  }
  var store;
  try { store = window.localStorage; store.setItem("salon:probe", "1"); store.removeItem("salon:probe"); } catch (e) { store = null; }
  if (!store) {
    // Blocked storage: keep the app working in memory for this visit.
    var mem = {};
    store = { getItem: function (k) { return k in mem ? mem[k] : null; }, setItem: function (k, v) { mem[k] = String(v); }, removeItem: function (k) { delete mem[k]; },
      clear: function () { mem = {}; }, key: function (i) { return Object.keys(mem)[i] || null; }, get length() { return Object.keys(mem).length; } };
    try { Object.defineProperty(window, "localStorage", { value: store, configurable: true }); } catch (e) {}
  }
  if (!window.claude || typeof window.claude.use !== "function") return run();
  var started = false;
  function start() { if (!started) { started = true; run(); } }
  var timer = setTimeout(start, 6000);
  (async function () {
    try {
      var db = await window.claude.use("db"), user = await window.claude.use("user");
      var uid = user ? await user.id() : null;
      if (!db || !uid || started) return start();
      var col = db.collection("data/users/" + uid);
      var snap = await col.get(), parts = {}, counts = {};
      snap.docs.forEach(function (d) { var b = d.data(); if (b && typeof b.k === "string") (parts[b.k] = parts[b.k] || [])[b.i] = b.v; });
      if (started) return;
      Object.keys(parts).forEach(function (k) { counts[k] = parts[k].length; if (parts[k].every(function (x) { return typeof x === "string"; })) store.setItem(k, parts[k].join("")); });
      var pending = {}, timerW = null, busy = false;
      async function flush() {
        if (busy) { timerW = setTimeout(flush, 800); return; }
        busy = true;
        var keys = Object.keys(pending); pending = {};
        for (var j = 0; j < keys.length; j++) {
          var k = keys[j], v = store.getItem(k), n = v == null ? 0 : Math.ceil(v.length / CHUNK) || 1;
          try {
            for (var i = 0; i < n; i++) await col.doc(k + "~" + i).set({ k: k, i: i, v: v.slice(i * CHUNK, (i + 1) * CHUNK) });
            for (var x = n; x < (counts[k] || 0); x++) await col.doc(k + "~" + x).delete();
            counts[k] = n;
          } catch (e) { console.warn("Could not save to your account", e && e.code); }
        }
        busy = false;
      }
      function mark(k) { if (String(k).indexOf(PREFIX) === 0 && k !== "salon:probe") { pending[k] = 1; clearTimeout(timerW); timerW = setTimeout(flush, 1200); } }
      var target = store === window.localStorage && typeof Storage !== "undefined" && store instanceof Storage ? Storage.prototype : store;
      var set = target.setItem, rem = target.removeItem;
      target.setItem = function (k, v) { set.call(this, k, v); if (this === store) mark(k); };
      target.removeItem = function (k) { rem.call(this, k); if (this === store) mark(k); };
    } catch (e) {}
    clearTimeout(timer);
    start();
  })();
})();
"""

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
<script type="text/plain" id="salon-app">
{js}
</script>
<script>
{PERSIST}
</script>
"""
open(out, "w", encoding="utf-8").write(html)
print(f"{out}: {len(html) / 1e6:.1f} MB")
