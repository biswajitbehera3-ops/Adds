#!/usr/bin/env bash
# Makes graphify-out/graph-standalone.html: the code map with its drawing library (vis-network 9.1.6)
# inlined, so it opens offline and through GitHub previews. Run after `graphify update .`.
set -euo pipefail
cd "$(dirname "$0")/.."
T="$(mktemp -d)"; (cd "$T" && npm pack vis-network@9.1.6 --silent >/dev/null && tar -xzf vis-network-9.1.6.tgz)
LIB="$T/package/standalone/umd/vis-network.min.js"
# Same file the map pins by hash; refuse anything else.
[ "sha384-$(openssl dgst -sha384 -binary "$LIB" | openssl base64 -A)" = "sha384-Ux6phic9PEHJ38YtrijhkzyJ8yQlH8i/+buBR8s3mAZOJrP1gwyvAcIYl3GWtpX1" ] || { echo "vis-network hash mismatch" >&2; exit 1; }
python3 -I - "$LIB" <<'PY'
import re, sys
html = open("graphify-out/graph.html", encoding="utf-8").read()
lib = open(sys.argv[1], encoding="utf-8").read()
tag = re.search(r'<script src="https://unpkg\.com/vis-network@9\.1\.6/standalone/umd/vis-network\.min\.js"[^>]*></script>', html, re.S)
assert tag and "</script" not in lib
out = html[:tag.start()] + "<script>/* vis-network 9.1.6, inlined so the map works offline */\n" + lib + "\n</script>" + html[tag.end():]
open("graphify-out/graph-standalone.html", "w", encoding="utf-8").write(out.replace("<title>graphify - graphify-out/graph.html</title>", "<title>Salon app code map</title>"))
PY
rm -rf "$T"; echo "wrote graphify-out/graph-standalone.html"
