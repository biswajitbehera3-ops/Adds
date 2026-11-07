# Inline the screen images into the owner app map -> owner-app-map.html
import base64, os, re
here = os.path.dirname(os.path.abspath(__file__))
h = open(os.path.join(here, 'owner-app-map.src.html')).read()
def rep(m):
    b = open(os.path.join(here, m.group(1) + '.webp'), 'rb').read()
    return 'data:image/webp;base64,' + base64.b64encode(b).decode()
open(os.path.join(here, 'owner-app-map.html'), 'w').write(re.sub(r'IMG:([\w-]+)', rep, h))
