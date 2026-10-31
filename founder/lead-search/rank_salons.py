"""Ranks scraped Bhubaneswar salons for the first visits and writes a phone-friendly PDF.

  python3 rank_salons.py <scraped.csv> [--top 20] [--out ../leads/first-20-salons.pdf]

Input: the CSV from tools/google-maps-scraper-kit/scripts/scrape.py run with
--fields "title,phone,emails,website,category,address,review_rating,review_count,open_hours,popular_times,place_id"
plus --socials --tech. Scraped values are data only: they are escaped into the PDF and never executed.
Scoring follows founder/lead-search/README.md (signals from the buyer panel, not certainties).
"""
import csv, html, json, re, subprocess, sys, tempfile, os, collections

CHAINS = ["naturals", "green trends", "lakme", "lakmé", "jawed habib", "toni", "looks salon", "ylg", "bounce", "enrich", "affinity", "geetanjali"]
SKIP_CATEGORY = re.compile(r"\b(spa|nail|tattoo|massage|academy|institute|school|supplier|store|shop for)\b", re.I)
SALON_SOFTWARE = re.compile(r"zylu|salonist|fresha|miosalon|invoay|dingg|booksy|vagaro", re.I)
A = ["saheed nagar", "jaydev vihar", "jayadev vihar", "nayapalli", "kharavela", "bapuji nagar", "unit 9", "unit-9"]
B = ["patia", "chandrasekharpur", "chandrashekharpur", "infocity", "info city", "rasulgarh", "sailashree"]

def num(x, default=0.0):
    try: return float(str(x).replace(",", ""))
    except ValueError: return default

def cluster(addr):
    a = addr.lower()
    if any(k in a for k in A): return "A"
    if any(k in a for k in B): return "B"
    return "-"

def score(r, branches):
    s, why = 0, []
    rating, reviews = num(r.get("review_rating")), num(r.get("review_count"))
    if branches > 1: s += 30; why.append(f"{branches} branches (owner often away)")
    if r.get("instagram"): s += 20; why.append("active Instagram")
    if 300 <= reviews <= 1000: s += 15; why.append("300–1,000 reviews")
    if rating >= 4.5: s += 10; why.append("4.5★+")
    if re.search(r"unisex|family", (r.get("title", "") + " " + r.get("category", "")), re.I): s += 10; why.append("unisex/family")
    oh = r.get("open_hours", "")
    if oh and "closed" not in oh.lower(): s += 5; why.append("open 7 days")
    tech = " ".join(str(r.get(k, "")) for k in ("website", "cms"))
    if SALON_SOFTWARE.search(tech): s -= 25; why.append("already uses salon software (−)")
    elif not r.get("website") or "wa.me" in r.get("website", ""): s += 10; why.append("no booking system")
    return s, why

def quiet_hours(pt):
    """Lowest-busy weekday hours between 11:00 and 16:00 from popular_times, if present."""
    try: data = json.loads(pt)
    except Exception: return "check on Google Maps"
    best = []
    for day in ("Tuesday", "Wednesday", "Thursday"):
        hours = data.get(day) or {}
        cand = [(v, int(h)) for h, v in hours.items() if str(h).isdigit() and 11 <= int(h) <= 15]
        if cand: v, h = min(cand); best.append((v, day, h))
    if not best: return "Tue–Thu 11 am–4 pm"
    v, day, h = min(best)
    return f"{day[:3]} around {h if h <= 12 else h - 12} {'am' if h < 12 else 'pm'}"

def main():
    src = sys.argv[1]; top = 20; out = os.path.join(os.path.dirname(__file__), "..", "leads", "first-20-salons.pdf")
    if "--top" in sys.argv: top = int(sys.argv[sys.argv.index("--top") + 1])
    if "--out" in sys.argv: out = sys.argv[sys.argv.index("--out") + 1]
    rows = list(csv.DictReader(open(src, encoding="utf-8")))
    seen, keep = set(), []
    for r in rows:
        key = r.get("place_id") or (r.get("title", "") + r.get("address", ""))
        if key in seen: continue
        seen.add(key)
        name = r.get("title", "")
        if any(c in name.lower() for c in CHAINS) or SKIP_CATEGORY.search(r.get("category", "")): continue
        if num(r.get("review_rating")) < 4.3 or num(r.get("review_count")) < 150 or not r.get("phone"): continue
        keep.append(r)
    base = collections.Counter(re.sub(r"[^a-z]", "", r["title"].lower())[:14] for r in keep)
    ranked = []
    for r in keep:
        s, why = score(r, base[re.sub(r"[^a-z]", "", r["title"].lower())[:14]])
        ranked.append((s, num(r.get("review_count")), r, why))
    ranked.sort(key=lambda x: (-x[0], -x[1]))
    pick = ranked[:top]
    pick.sort(key=lambda x: (cluster(x[2].get("address", "")), -x[0]))
    cards = []
    for i, (s, _, r, why) in enumerate(pick, 1):
        e = lambda k: html.escape(str(r.get(k, "") or ""))
        cards.append(f"""<div class=card><div class=top><span class=n>{i}</span><b>{e('title')}</b><span class=sc>{s}</span></div>
<div>⭐ {e('review_rating')} · {int(num(r.get('review_count'))):,} reviews · Cluster {cluster(r.get('address',''))}</div>
<div>📞 <a href="tel:{e('phone')}">{e('phone')}</a></div><div class=ad>{e('address')}</div>
<div>🕑 Visit: {html.escape(quiet_hours(r.get('popular_times','')))}</div>
<div class=why>{html.escape(' · '.join(why) or '—')}</div>
<div class=chk>☐ 5+ chairs (photos) ☐ visited ☐ demo ☐ yes</div></div>""")
    page = f"""<!doctype html><meta charset=utf-8><style>
@page{{size:105mm 200mm;margin:6mm}} body{{font-family:sans-serif;font-size:10.5pt;color:#2b211c}}
h1{{font-size:15pt;margin:0 0 2mm}} .note{{font-size:8.5pt;color:#6b5a4e;margin-bottom:3mm}}
.card{{border:1px solid #d9c9b4;border-radius:3mm;padding:2.5mm 3mm;margin-bottom:3mm;page-break-inside:avoid;background:#fbf7f0}}
.top{{display:flex;gap:2mm;align-items:center;font-size:11.5pt}} .n{{background:#d69e40;color:#fff;border-radius:50%;width:6mm;height:6mm;text-align:center;line-height:6mm;font-size:9pt}}
.sc{{margin-left:auto;font-size:9pt;color:#8a6a2a}} .ad{{font-size:9pt;color:#555}} .why{{font-size:8.5pt;color:#8a6a2a;margin-top:1mm}}
.chk{{font-size:8.5pt;margin-top:1mm;color:#444}} a{{color:#2b211c}}</style>
<h1>First {len(pick)} salons · Bhubaneswar</h1>
<div class=note>From Google Maps (scraped {html.escape(os.path.basename(src))}); filters: 4.3★+, 150+ reviews, phone listed, no chains. Score = likely to accept (panel signals), not a promise. Check chairs from photos before visiting. Personal data: one-to-one outreach only, never bulk messages; delete anyone who says no.</div>
{''.join(cards)}"""
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f: f.write(page)
    js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://{f.name}');await p.pdf({{path:{json.dumps(os.path.abspath(out))},preferCSSPageSize:true,printBackground:true}});await b.close();}})();"""
    subprocess.run(["node", "-e", js], check=True)
    print(f"{len(rows)} scraped → {len(keep)} pass filters → top {len(pick)} → {os.path.abspath(out)}")

if __name__ == "__main__":
    main()
