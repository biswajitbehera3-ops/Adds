# Builds owner-app-demo.html: one phone, sign-in, then 4 tabs (Live, Earnings, Staff, Customers)
# using the approved design pages, embedded as srcdoc iframes with navigation wired in.
import base64, json, os
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.dirname(H)
def read(p): return open(os.path.join(D, p), encoding='utf-8').read()
BASE = '<style>html,body{margin:0!important;padding:0!important;background:#1A1210!important}</style>'
PHONE_CSS = BASE + '''<style>
body{height:100vh;overflow:hidden}
header.page,.wrap>h1,.wrap>.lead,figcaption{display:none!important}
.wrap{max-width:none!important;margin:0!important}
.trio,.pair{display:block!important;margin:0!important}
section.opt{margin:0!important;padding:0!important;border:0!important}
figure{display:none;margin:0}
figure.on{display:block}
.phone{width:100vw!important;height:100vh!important;aspect-ratio:auto!important;border-radius:0!important;box-shadow:none!important}
.dock{display:none!important}
.scard,.fab,.back,.cust,.visit,.rank,.filters span,.dim,.save,.cancel,.opt{cursor:pointer}
</style>'''
def nav(first, rules):
    js = "function show(id){document.querySelectorAll('figure').forEach(f=>f.classList.toggle('on',!!f.querySelector('#'+id)));document.querySelectorAll('.scr').forEach(s=>s.scrollTop=0);}\n"
    js += f"show('{first}');\ndocument.addEventListener('click',e=>{{\n"
    for sel, target, extra in rules:
        cond = f"e.target.closest('{sel}')" + (f" && ({extra})" if extra else '')
        js += f"  if({cond}){{show('{target}');return;}}\n"
    js += "});"
    return f"<script>{js}</script>"
def wrap(body, head, tail=''):
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + head + '</head><body>' + body + tail + '</body></html>'

pages = {}
pages['live'] = wrap(read('live-floor/final-live-floor.html'), BASE + '<style>body{display:block!important;overflow-y:auto;height:100vh}.screen{width:100%!important;max-width:none!important;min-height:100vh!important;border-radius:0!important;box-shadow:none!important}.tabs{display:none!important}.spacer{height:110px!important}</style>')
pages['earnings'] = wrap(read('owner-earnings-final.html'), PHONE_CSS, nav('ma', []))
pages['staff'] = wrap(read('owner-staff-tab.html'), PHONE_CSS, nav('p1', [
    ('#p1 .fab', 'p3', ''), ('#p1 .scard', 'p2', ''), ('#p2 .back', 'p1', ''),
    ('#p3 .dim', 'p1', ''), ('#p3 .save', 'p1', '')]))
pages['customers'] = wrap(read('owner-customers-tab.html'), PHONE_CSS, nav('c1', [
    ('#c1 .filters span', 'c4', "e.target.closest('#c1 .filters span').textContent.includes('Top')"),
    ('#c1 .cust', 'c2', ''), ('#c2 .back', 'c1', ''), ('#c2 .visit', 'c3', ''),
    ('#c3 .back', 'c2', ''), ('#c3 .dim', 'c2', ''), ('#c3 .cancel', 'c2', ''),
    ('#c4 .back', 'c1', ''), ('#c4 .rank', 'c2', '')]))
logo = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(H, 'logo.webp'), 'rb').read()).decode()
shell = open(os.path.join(H, 'owner-app-demo.src.html'), encoding='utf-8').read()
shell = shell.replace('/*PAGES*/{}', json.dumps(pages).replace('</', '<\\/')).replace('__LOGO__', logo)
open(os.path.join(H, 'owner-app-demo.html'), 'w', encoding='utf-8').write(shell)
print(round(os.path.getsize(os.path.join(H, 'owner-app-demo.html')) / 1e6, 2), 'MB')
