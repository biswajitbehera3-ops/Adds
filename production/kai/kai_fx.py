# Kai clip, mood-reactive camera card: the glow BEHIND Kai's card changes with the scene. 3-second demos.
import sys, math, os, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
D='live/mon_kaicenat/'; OUT='/home/user/Adds/production/kai/'
ANTON='/home/user/Adds/remotion-overlays/public/fonts/Anton-Regular.ttf'
W,H,FPS=1080,1920,30
CAM=(40,236,192,346); Y0,Y1=18,478
SHARP=ImageFilter.UnsharpMask(radius=2,percent=120,threshold=2)
cw=470; ch=round(cw*(CAM[3]-CAM[1])/(CAM[2]-CAM[0])); cx0,cy0,R=48,80,34
def rmask(w,h,r):
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),radius=r,fill=255); return m
def base(i,cx):
    f=Image.open(f'{D}f_{i:04d}.jpg').convert('RGB')
    s=H/(Y1-Y0); sw=round(W/s); x0=max(215,min(905-sw,cx-sw//2))
    g=f.crop((x0,Y0,x0+sw,Y1)).resize((W,H),Image.LANCZOS).filter(SHARP)
    a=np.asarray(g).astype(np.float32)/255                       # soft edge vignette only (no outline, no frame)
    yy,xx=np.mgrid[0:H,0:W]; r=np.sqrt(((xx-W/2)/(W/2))**2*0.85+((yy-H/2)/(H/2))**2)
    a*=(1-0.32*np.clip((r-0.8)/0.55,0,1)**1.5)[...,None]
    cam=f.crop(CAM).resize((cw,ch),Image.LANCZOS).filter(SHARP)
    return Image.fromarray((np.clip(a,0,1)*255).astype(np.uint8)),cam
# glow masks: light spilling out from BEHIND the card edges
pad=190; GW,GH=cw+2*pad,ch+2*pad
ring=Image.new('L',(GW,GH),0); ImageDraw.Draw(ring).rounded_rectangle((pad-6,pad-6,pad+cw+6,pad+ch+6),radius=R+6,fill=255)
GLOW=np.asarray(ring.filter(ImageFilter.GaussianBlur(52))).astype(np.float32)/255
GLOW=np.clip(GLOW*2.6,0,1)
ramp=np.linspace(0,1,GW)[None,:]; LEFT=GLOW*np.clip(1.25-2.2*ramp,0,1); RIGHT=GLOW*np.clip(2.2*ramp-0.95,0,1)
def glow_layer(cols):   # cols: list of (mask, (r,g,b), intensity)
    acc=np.zeros((GH,GW,3),np.float32); al=np.zeros((GH,GW),np.float32)
    for m,c,k in cols:
        a=m*k; acc+=a[...,None]*np.array(c,np.float32); al+=a
    al=np.clip(al,0,1); rgb=np.where(al[...,None]>0,acc/np.maximum(al[...,None],1e-6),0)
    return Image.fromarray(rgb.clip(0,255).astype(np.uint8)), Image.fromarray((al*255).astype(np.uint8))
# --- moods ---
def mood(name,t):
    if name=='siren':      # police chase: red left / blue right, alternating 3x a second, white strobe on each switch
        ph=(t*3)%1; red=1.0 if ph<0.5 else 0.15; blue=1.15-red
        strobe=0.5 if (ph%0.5)<0.06 else 0
        return [(LEFT,(255,30,40),red),(RIGHT,(30,90,255),blue),(GLOW,(255,255,255),strobe)]
    if name=='danger':     # crash / fight / shots: red heartbeat (double pulse)
        ph=(t*1.4)%1; k=max(math.exp(-((ph-0.1)/0.06)**2),0.8*math.exp(-((ph-0.32)/0.06)**2))
        return [(GLOW,(255,35,35),0.45+0.75*k)]
    if name=='crash':      # the impact frame: white flash -> orange -> red fade
        if t<0.12: return [(GLOW,(255,255,255),1.2)]
        k=math.exp(-(t-0.12)*2.2); c=(255,int(140*k+40),int(60*k)) 
        return [(GLOW,c,0.35+0.9*k)]
    if name=='relax':      # calm / Lucia / beach / sunset: slow peach-pink breathing
        k=0.5+0.5*math.sin(t*2*math.pi*0.35); c=(255,int(150+40*k),int(150+20*(1-k)))
        return [(GLOW,c,0.65+0.35*k)]
    if name=='money':      # cash / heist win: gold shimmer
        k=0.5+0.5*math.sin(t*2*math.pi*1.2); return [(GLOW,(255,200,70),0.5+0.4*k)]
    return [(GLOW,(255,255,255),0.0)]
def render(name,shots,caps,timeline,fname):
    bases={i:base(i,cx) for i,cx in shots}
    fnt=ImageFont.truetype(ANTON,104); tmp=f'fx_{name}'; os.makedirs(tmp,exist_ok=True)
    order=[i for i,_ in shots]; n=3*FPS
    for fr in range(n):
        t=fr/FPS; seg=min(int(t),len(order)-1); bg,cam=bases[order[seg]]
        z=1+0.03*(t-seg)                                          # slow push inside each shot
        bw,bh=int(W*z),int(H*z); img=bg.resize((bw,bh),Image.BILINEAR).crop(((bw-W)//2,(bh-H)//2,(bw-W)//2+W,(bh-H)//2+H))
        rgb,al=glow_layer(timeline(t)); img.paste(rgb,(cx0-pad,cy0-pad),al)
        img.paste(cam,(cx0,cy0),rmask(cw,ch,R))                   # card sits on top, light comes from behind its edges
        d=ImageDraw.Draw(img); cap=caps[seg]; tw=d.textlength(cap,font=fnt)
        d.text(((W-tw)/2,1460),cap,font=fnt,fill='white',stroke_width=9,stroke_fill=(15,5,18))
        img.save(f'{tmp}/{fr:03d}.jpg',quality=92)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(FPS),'-i',f'{tmp}/%03d.jpg','-c:v','libx264','-pix_fmt','yuv420p','-crf','18',OUT+fname],check=True)
    Image.open(f'{tmp}/015.jpg').save(OUT+fname.replace('.mp4','-still.jpg'))
shots=[(189,470),(190,520),(193,470)]
caps=['*FLIPS*','NAH','IT LANDED']        # placeholders: real captions = Kai's real words from his audio
# demo 1 (matches this scene): impact flash -> red danger heartbeat -> calms to sunset when it lands
render('flip',shots,caps,lambda t: mood('crash',t) if t<1 else (mood('danger',t) if t<2 else mood('relax',t)),'fx-demo-truckflip-3s.mp4')
# demo 2 (preview of the police effect on the same footage)
render('siren',shots,caps,lambda t: mood('siren',t),'fx-demo-siren-3s.mp4')
print('done')
