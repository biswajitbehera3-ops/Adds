# Kai clip render: full-screen gameplay + rounded Kai card top-left with mood glow behind it + Kai's words as captions (only text).
import sys, json, math, os, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
name, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
moods = json.loads(sys.argv[4])            # [[start,end,mood],...] in raw-clip seconds
skip = set(json.loads(sys.argv[5])) if len(sys.argv) > 5 else set()   # word indexes to drop (game/police voices)
W,H,FPS = 1080,1920,30
CAM = (45,440,365,650)                     # Kai's face inside the stream's camera box (1080p source)
CROPH = int(os.environ.get('CROPH','1080')); CROPW = round(CROPH*9/16)
GX = 660                                   # gameplay crop x (607 px wide, full height) → 9:16
cw = 470; ch = round(cw*(CAM[3]-CAM[1])/(CAM[2]-CAM[0])); cx0, cy0, R = 48, 80, 34
ANTON = '/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
dur = t1 - t0; N = int(dur*FPS)
# ---------- glow + caption layer (RGBA PNG sequence) ----------
pad = 190; GW, GH = cw+2*pad, ch+2*pad
ring = Image.new('L',(GW,GH),0); ImageDraw.Draw(ring).rounded_rectangle((pad-6,pad-6,pad+cw+6,pad+ch+6),radius=R+6,fill=255)
GLOW = np.clip(np.asarray(ring.filter(ImageFilter.GaussianBlur(52))).astype(np.float32)/255*2.6,0,1)
ramp = np.linspace(0,1,GW)[None,:]; LEFT = GLOW*np.clip(1.25-2.2*ramp,0,1); RIGHT = GLOW*np.clip(2.2*ramp-0.95,0,1)
def mood(nm, t):
    if nm=='siren':
        ph=(t*3)%1; red=1.0 if ph<0.5 else 0.15; return [(LEFT,(255,30,40),red),(RIGHT,(30,90,255),1.15-red),(GLOW,(255,255,255),0.5 if (ph%0.5)<0.06 else 0)]
    if nm=='danger':
        ph=(t*1.4)%1; k=max(math.exp(-((ph-0.1)/0.06)**2),0.8*math.exp(-((ph-0.32)/0.06)**2)); return [(GLOW,(255,35,35),0.45+0.75*k)]
    if nm=='money':
        k=0.5+0.5*math.sin(t*2*math.pi*1.2); return [(GLOW,(255,200,70),0.55+0.45*k)]
    if nm=='flatline':   # busted / dead: last strong pulse, weaker pulse, then drains red→grey→off
        if t<0.25: return [(GLOW,(255,30,30),1.2)]
        if 0.55<t<0.8: return [(GLOW,(255,30,30),0.6)]
        k=max(0,1-(t-0.8)/1.6); c=(int(120+135*k),int(120-90*k),int(120-90*k))
        return [(GLOW,c,0.7*k)] if t>=0.8 else []
    if nm=='crash':      # impact / explosion: white flash, then orange fading to red
        if t<0.15: return [(GLOW,(255,255,255),1.3)]
        k=math.exp(-(t-0.15)*1.6); return [(GLOW,(255,int(150*k+40),int(50*k)),0.4+0.9*k)]
    if nm=='death':      # dying / WASTED: one last red pulse, then a black light swallows the card
        if t<0.35: return [(GLOW,(255,25,25),1.2)]
        k=min(1,(t-0.35)/1.2); return [(GLOW,(0,0,0),0.35+0.75*k)]
    if nm=='relax':
        k=0.5+0.5*math.sin(t*2*math.pi*0.35); return [(GLOW,(255,int(150+40*k),int(150+20*(1-k))),0.65+0.35*k)]
    return []
import re
words = [w for i,w in enumerate(json.load(open(f'{name}_words.json'))) if i not in skip and t0-0.2 <= w['s'] < t1]
# group words into short caption chunks (≤3 words, break on gaps/punctuation)
SUB = len(sys.argv)>6 and sys.argv[6]=='sub'
MAXW = 6 if SUB else 3
words=[w for w in words if not re.match(r'(?i)^nigg', w['w'])]
chunks=[]; cur=[]
for w in words:
    if cur and (len(cur)>=MAXW or w['s']-cur[-1]['e']>0.45 or cur[-1]['w'][-1:] in '.!?,'):
        chunks.append(cur); cur=[]
    cur.append(w)
if cur: chunks.append(cur)
import re
cen=lambda x: re.sub(r'(?i)f(uck)(ing|in)?', lambda m:'F**K'+('ING' if m.group(2) else ''), re.sub(r'(?i)bitch','B*TCH',re.sub(r'(?i)shit','SH*T',x)))
caps=[(c[0]['s'], max(c[-1]['e'], c[0]['s']+0.5), cen(' '.join(x['w'] for x in c).upper().strip(' ,.'))) for c in chunks]
fnt = ImageFont.truetype(ANTON, 100)
os.makedirs(f'{name}_ov', exist_ok=True)
for fr in range(N):
    t = t0 + fr/FPS
    lay = Image.new('RGBA',(W,H),(0,0,0,0))
    cols = []
    for a,b,m in moods:
        if a <= t < b:
            cols = mood(m, t-a); break
    if cols:
        acc=np.zeros((GH,GW,3),np.float32); al=np.zeros((GH,GW),np.float32)
        for msk,c,k in cols: x=msk*k; acc+=x[...,None]*np.array(c,np.float32); al+=x
        al=np.clip(al,0,1); rgb=np.where(al[...,None]>0, acc/np.maximum(al[...,None],1e-6), 0).clip(0,255).astype(np.uint8)
        g=Image.fromarray(np.dstack([rgb,(al*255).astype(np.uint8)]),'RGBA'); lay.alpha_composite(g,(cx0-pad,cy0-pad))
    d = ImageDraw.Draw(lay)
    for a,b,txt in caps:
        if a <= t < b+0.15:
            # pop-in: scale 0.85→1 over the first 0.12 s
            if SUB:
                f2=ImageFont.truetype(ANTON,78); ws=txt.split(); lines=[txt]
                if d.textlength(txt,font=f2)>W-120 and len(ws)>1:
                    h=len(ws)//2+len(ws)%2; lines=[' '.join(ws[:h]),' '.join(ws[h:])]
                y=1500-(len(lines)-1)*92
                for ln in lines:
                    tw=d.textlength(ln,font=f2); d.text(((W-tw)/2,y),ln,font=f2,fill='white',stroke_width=8,stroke_fill=(15,5,18)); y+=92
                break
            k=min(1,(t-a)/0.12); f2=ImageFont.truetype(ANTON,int(100*(0.85+0.15*k)))
            tw=d.textlength(txt,font=f2)
            if tw > W-80: f2=ImageFont.truetype(ANTON,int(100*(W-80)/tw)); tw=d.textlength(txt,font=f2)
            d.text(((W-tw)/2,1440),txt,font=f2,fill='white',stroke_width=9,stroke_fill=(15,5,18)); break
    lay.save(f'{name}_ov/{fr:04d}.png')
# rounded mask for the camera card
m=Image.new('L',(cw,ch),0); ImageDraw.Draw(m).rounded_rectangle((0,0,cw-1,ch-1),radius=R,fill=255); m.save(f'{name}_mask.png')
fc = (f"[0:v]fps={FPS},split[a][b];"
      f"[a]crop={CROPW}:{CROPH}:{GX + (607-CROPW)//2}:0,scale={W}:{H}:flags=lanczos,unsharp=5:5:0.6,vignette=angle=PI/6[g];"
      f"[b]crop={CAM[2]-CAM[0]}:{CAM[3]-CAM[1]}:{CAM[0]}:{CAM[1]},scale={cw}:{ch}:flags=lanczos,unsharp=5:5:0.5,format=rgba[c0];"
      f"[2:v]format=gray,scale={cw}:{ch}[mk];[c0][mk]alphamerge[c];"
      f"[g][1:v]overlay=0:0[go];[go][c]overlay={cx0}:{cy0},format=yuv420p[v]")
subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t0),'-t',str(dur),'-i',f'{name}_raw.mp4',
    '-framerate',str(FPS),'-i',f'{name}_ov/%04d.png','-loop','1','-i',f'{name}_mask.png',
    '-filter_complex',fc,'-map','[v]','-map','0:a','-t',str(dur),
    '-c:v','libx264','-preset','medium','-crf','17','-c:a','aac','-b:a','192k','-af','afade=t=in:d=0.03,afade=t=out:st=%.2f:d=0.03'%(dur-0.03),
    '-movflags','+faststart',f'/home/user/Adds/production/kai/{name}.mp4'],check=True)
print('captions:',caps)
