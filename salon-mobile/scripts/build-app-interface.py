"""Builds design-studies/app-interface.src.html (staff + owner screen specimens) into a
single self-contained page with the logo embedded at web-artifact/app-interface.html."""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "design-studies/app-interface.src.html"), encoding="utf-8").read()
logo = "data:image/png;base64," + base64.b64encode(
    open(os.path.join(ROOT, "assets/brand/logo-clean.png"), "rb").read()).decode()
dst = os.path.join(ROOT, "web-artifact/app-interface.html")
os.makedirs(os.path.dirname(dst), exist_ok=True)
open(dst, "w", encoding="utf-8").write(src.replace("__LOGO__", logo))
print(f"{os.path.getsize(dst) / 1e6:.2f} MB -> {dst}")
