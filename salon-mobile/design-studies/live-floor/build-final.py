# Inline the Higgsfield assets into the Live floor page -> final-live-floor.html
import base64, json, os
here = os.path.dirname(os.path.abspath(__file__))
img = {}
for k in ['plate'] + [f's{i}' for i in range(14)]:
    b = open(os.path.join(here, 'assets', k + '.webp'), 'rb').read()
    img[k] = 'data:image/webp;base64,' + base64.b64encode(b).decode()
h = open(os.path.join(here, 'final-live-floor.src.html')).read()
a = h.index('/*IMG*/'); b = h.index('/*END*/') + 7
open(os.path.join(here, 'final-live-floor.html'), 'w').write(h[:a] + json.dumps(img) + h[b:])
