# Inline the Higgsfield assets into the Live floor page -> final-live-floor.html
import base64, json, os
here = os.path.dirname(os.path.abspath(__file__))
img = {}
files = {'plate': 'plate2.webp', 'walkDev': 'walk-dev.png', 'walkRahul': 'walk-rahul.png', 'walkNeha': 'walk-neha.png'}
files.update({f's{i}': f's{i}.webp' for i in range(6)})
for k, f in files.items():
    b = open(os.path.join(here, 'assets', f), 'rb').read()
    mime = 'image/png' if f.endswith('.png') else 'image/webp'
    img[k] = f'data:{mime};base64,' + base64.b64encode(b).decode()
h = open(os.path.join(here, 'final-live-floor.src.html')).read()
a = h.index('/*IMG*/'); b = h.index('/*END*/') + 7
open(os.path.join(here, 'final-live-floor.html'), 'w').write(h[:a] + json.dumps(img) + h[b:])
