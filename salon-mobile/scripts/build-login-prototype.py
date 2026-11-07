"""Builds design-studies/login-prototype.src.html into a single self-contained page
(logo and muted intro video embedded) at web-artifact/login-prototype.html."""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "design-studies/login-prototype.src.html"), encoding="utf-8").read()

def data_uri(path, mime):
    return f"data:{mime};base64," + base64.b64encode(open(os.path.join(ROOT, path), "rb").read()).decode()

brush = """<svg viewBox="0 0 120 200"><defs>
<radialGradient id="hair" cx=".5" cy=".9" r=".9"><stop offset="0" stop-color="#f6e8d4"/><stop offset=".45" stop-color="#d9c2a3"/><stop offset=".75" stop-color="#6b5547"/><stop offset="1" stop-color="#3a2e28"/></radialGradient>
<linearGradient id="handle" x1="0" x2="1"><stop offset="0" stop-color="#0b0908"/><stop offset=".35" stop-color="#3a3532"/><stop offset=".55" stop-color="#141110"/><stop offset="1" stop-color="#050404"/></linearGradient></defs>
<path d="M20 92 Q10 30 60 14 Q110 30 100 92 Q80 104 60 104 Q40 104 20 92 Z" fill="url(#hair)"/>
<path d="M30 40 Q60 22 90 40" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/>
<rect x="34" y="96" width="52" height="14" rx="4" fill="#d6cfc6"/>
<path d="M38 110 Q32 130 40 150 Q30 162 32 176 Q34 194 60 194 Q86 194 88 176 Q90 162 80 150 Q88 130 82 110 Z" fill="url(#handle)"/>
<rect x="36" y="146" width="48" height="6" rx="3" fill="#2a2523"/></svg>"""
teeth = "".join(f'<rect x="{4 + i * 7.8:.1f}" y="15" width="3.6" height="{40 if i % 2 else 34}" rx="1.2"/>' for i in range(25))

out = (src.replace("__BRUSH_SVG__", brush)
          .replace("__COMB_TEETH__", teeth)
          .replace("__LOGO__", data_uri("assets/brand/logo-clean.png", "image/png"))
          .replace("__VIDEO__", data_uri("assets/brand/intro-clean.mp4", "video/mp4")))
dst = os.path.join(ROOT, "web-artifact/login-prototype.html")
os.makedirs(os.path.dirname(dst), exist_ok=True)
open(dst, "w", encoding="utf-8").write(out)
print(f"{os.path.getsize(dst) / 1e6:.2f} MB -> {dst}")
